import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../utils/dbConnect';
import { User, Company, Session } from '../../../models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password, companyId } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }
    
    // Find users by email - there could be multiple users with the same email across different companies
    const users = await User.find({ email: email.toLowerCase() })
      .populate('company', 'name logo _id')
      .select('+password'); // Include password field
    
    if (!users || users.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // If multiple users found and no companyId provided, return list of companies for user to choose
    if (users.length > 1 && !companyId) {
      const companies = users.map(user => ({
        id: user.company?._id,
        name: user.company?.name || 'Unknown Company',
        logo: user.company?.logo || '/assets/elements/avatar.png',
        userId: user._id
      }));
      return NextResponse.json({
        multipleAccounts: true,
        companies
      });
    }
    
    // If companyId is provided or only one user exists, proceed with login
    const user = companyId 
      ? users.find(u => u.company && u.company._id.toString() === companyId)
      : users[0];
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid company selection or credentials' 
      }, { status: 401 });
    }
    
    // Check if password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json({ 
        error: 'Account is not active. Please contact support.' 
      }, { status: 403 });
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please check your inbox for verification link.' 
      }, { status: 403 });
    }
    
    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        companyId: user.company?._id || null
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Create session with device/browser info
    const uaString = req.headers.get('user-agent') || 'Unknown';
    const clientIp = req.headers.get('x-forwarded-for') || 'Unknown';
    const deviceInfo = parseUserAgent(uaString);
    
    const session = new Session({
      user: user._id,
      company: user.company?._id || null,
      token: accessToken,
      refreshToken,
      ipAddress: clientIp,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      location: 'Unknown', // Could be enhanced with geolocation
      lastActivity: new Date(),
      loginMethod: 'password',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes for access token
      refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days for refresh token
    });
    await session.save();
    
    // Set cookies
    const response = NextResponse.json({ 
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company || null
      },
      expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
      sessionId: session._id
    });
    
    response.cookies.set({
      name: 'auth-token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    });
    response.cookies.set({
      name: 'refresh-token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    response.cookies.set({
      name: 'session-id',
      value: session._id.toString(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    console.log('Login successful. Setting cookies:', response.cookies.getAll());
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

function parseUserAgent(userAgent: string): { device: string; browser: string; os: string } {
  const device = getDeviceType(userAgent);
  const browser = getBrowser(userAgent);
  const os = getOS(userAgent);
  return { device, browser, os };
} 