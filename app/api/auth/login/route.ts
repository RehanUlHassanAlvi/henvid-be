import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../utils/dbConnect';
import { User, Company, Session } from '../../../models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('company', 'name logo')
      .select('+password'); // Include password field
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ 
        error: 'Account is deactivated' 
      }, { status: 401 });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please check your email for verification instructions.',
        requiresVerification: true,
        email: user.email
      }, { status: 403 });
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        companyId: user.company?._id 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Get client info
    const userAgent = request.headers.get('user-agent') || '';
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIp = request.headers.get('x-real-ip');
    const ipAddress = xForwardedFor?.split(',')[0] || xRealIp || 'unknown';
    
    // Create session
    const session = new Session({
      user: user._id,
      company: user.company?._id,
      token: accessToken,
      refreshToken,
      ipAddress,
      userAgent,
      deviceType: getDeviceType(userAgent),
      browser: getBrowser(userAgent),
      os: getOS(userAgent),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      loginMethod: 'password'
    });
    
    await session.save();
    
    // Update user login stats
    user.lastLoginAt = new Date();
    user.lastLoginIP = ipAddress;
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastActivityAt = new Date();
    await user.save();
    
    // Remove sensitive data from response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.firstName, // Frontend compatibility
      lastname: user.lastName, // Frontend compatibility
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      language: user.language,
      company: user.company,
      createdAt: user.createdAt,
      reviews: user.reviewCount || 0 // Frontend compatibility
    };
    
    // Set secure HTTP-only cookies
    const response = NextResponse.json({
      user: userResponse,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      sessionId: session._id
    });
    
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      path: '/'
    });
    
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper functions for session tracking
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android')) return 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  return 'desktop';
}

function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'chrome';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari')) return 'safari';
  if (ua.includes('edge')) return 'edge';
  return 'unknown';
}

function getOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  if (ua.includes('android')) return 'android';
  if (ua.includes('ios')) return 'ios';
  return 'unknown';
} 