import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import { User, Company, Session } from '../../../models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  console.log('👤 /api/auth/me called');
  await dbConnect();
  
  try {
    // Get token from cookies or Authorization header
    const cookieToken = request.cookies.get('auth-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '');
    
    const token = cookieToken || bearerToken;
    
    console.log('🍪 Cookie auth-token present:', !!cookieToken);
    console.log('🔑 Authorization header present:', !!authHeader);
    console.log('🎫 Final token present:', !!token);
    
    if (!token) {
      console.log('❌ No token provided in /me request - returning 401');
      return NextResponse.json({ 
        error: 'No token provided' 
      }, { status: 401 });
    }
    
    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('✅ Token valid for user:', decoded.userId);
    } catch (error) {
      console.log('❌ Invalid token in /me request - returning 401');
      return NextResponse.json({ 
        error: 'Invalid or expired token' 
      }, { status: 401 });
    }
    
    // Check if session is still active
    const session = await Session.findOne({ 
      token,
      user: decoded.userId,
      isActive: true 
    });
    
    if (!session) {
      console.log('❌ No active session found for user:', decoded.userId, '- returning 401');
      return NextResponse.json({ 
        error: 'Session not found or expired' 
      }, { status: 401 });
    }
    
    console.log('✅ Active session found, updating last activity');
    
    // Update session last activity
    session.lastActivity = new Date();
    await session.save();
    
    // Get user details
    const user = await User.findById(decoded.userId)
      .populate('company', 'name logo orgNumber')
      .select('-password');
    
    if (!user || !user.isActive) {
      console.log('❌ User not found or inactive:', decoded.userId);
      return NextResponse.json({ 
        error: 'User not found or inactive' 
      }, { status: 404 });
    }
    
    // Update user last activity
    user.lastActivityAt = new Date();
    await user.save();
    
    console.log('✅ Returning user data for:', user.firstName, user.lastName);
    
    // Format response for frontend compatibility
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
      timezone: user.timezone,
      company: user.company,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      notifications: user.notifications,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      reviews: user.reviewCount || 0, // Frontend compatibility
      totalVideoCalls: user.totalVideoCalls || 0,
      averageRating: user.averageRating || 0
    };
    
    return NextResponse.json({ 
      user: userResponse,
      session: {
        id: session._id,
        expiresAt: session.expiresAt,
        deviceType: session.deviceType,
        browser: session.browser,
        lastActivity: session.lastActivity
      }
    });
    
  } catch (error) {
    console.error('💥 Get user error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 