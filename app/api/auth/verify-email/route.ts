import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import User from '../../../models/User';
import EmailVerification from '../../../models/EmailVerification';

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
    
    return NextResponse.json({ 
      message: 'Email verified successfully',
      verified: true 
    });
    
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 