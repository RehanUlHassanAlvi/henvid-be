import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import User from '../../../models/User';
import EmailVerification from '../../../models/EmailVerification';
import { sign } from 'jsonwebtoken';
import Session from '../../../models/Session';

const JWT_SECRET = process.env.JWT_SECRET || 'My-Secret-333';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'My-Refresh-Secret-333';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { email, verificationCode } = await request.json();
    
    if (!email || !verificationCode) {
      return NextResponse.json({ 
        error: 'Email and verification code are required' 
      }, { status: 400 });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        error: 'Email is already verified' 
      }, { status: 400 });
    }
    
    // Find verification record
    const verification = await EmailVerification.findOne({
      email: email.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!verification) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification code' 
      }, { status: 400 });
    }
    
    // Check if too many attempts
    if (verification.attempts >= 5) {
      return NextResponse.json({ 
        error: 'Too many verification attempts. Please request a new code.' 
      }, { status: 429 });
    }
    
    // Verify the code
    if (verification.verificationCode !== verificationCode) {
      // Increment attempts
      verification.attempts += 1;
      await verification.save();
      
      const remainingAttempts = 5 - verification.attempts;
      return NextResponse.json({ 
        error: `Invalid verification code. ${remainingAttempts} attempts remaining.` 
      }, { status: 400 });
    }
    
    // Code is correct - verify the user
    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      emailVerifiedAt: new Date()
    });
    
    // Mark verification as used
    verification.isUsed = true;
    await verification.save();
    
    // Clean up any other unused verification codes for this email
    await EmailVerification.deleteMany({
      email: email.toLowerCase(),
      isUsed: false,
      _id: { $ne: verification._id }
    });
    
    // Automatically log in the user by issuing tokens
    const accessToken = sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        companyId: user.company?._id || null
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = sign(
      { userId: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    // Create session with device/browser info
    const uaString = request.headers.get('user-agent') || 'Unknown';
    const clientIp = request.headers.get('x-forwarded-for') || 'Unknown';
    
    const session = new Session({
      user: user._id,
      company: user.company?._id || null,
      token: accessToken,
      refreshToken,
      ipAddress: clientIp,
      device: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown',
      location: 'Unknown',
      lastActivity: new Date(),
      loginMethod: 'password',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes for access token
      refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days for refresh token
    });
    await session.save();
    
    // Set cookies
    const response = NextResponse.json({ 
      message: 'Email verified successfully',
      verified: true,
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
    
    console.log('Email verification successful. User logged in with cookies set.');
    
    return response;
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 