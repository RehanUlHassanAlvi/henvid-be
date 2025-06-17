import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import User from '../../../models/User';
import EmailVerification from '../../../models/EmailVerification';
import { EmailService, generateVerificationCode } from '../../../../utils/emailService';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
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
    
    // Check for existing unused verification code
    const existingVerification = await EmailVerification.findOne({
      email: email.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (existingVerification) {
      // Check if too many attempts
      if (existingVerification.attempts >= 5) {
        return NextResponse.json({ 
          error: 'Too many verification attempts. Please try again later.' 
        }, { status: 429 });
      }
      
      // Resend existing code
      const emailSent = await EmailService.sendVerificationEmail(
        email,
        user.firstName,
        existingVerification.verificationCode
      );
      
      if (!emailSent) {
        return NextResponse.json({ 
          error: 'Failed to send verification email' 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        message: 'Verification email sent successfully',
        expiresAt: existingVerification.expiresAt 
      });
    }
    
    // Generate new verification code
    const verificationCode = generateVerificationCode();
    
    // Save verification code to database
    const verification = new EmailVerification({
      email: email.toLowerCase(),
      verificationCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });
    
    await verification.save();
    
    // Send verification email
    const emailSent = await EmailService.sendVerificationEmail(
      email,
      user.firstName,
      verificationCode
    );
    
    if (!emailSent) {
      // Clean up verification record if email failed
      await EmailVerification.findByIdAndDelete(verification._id);
      return NextResponse.json({ 
        error: 'Failed to send verification email' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Verification email sent successfully',
      expiresAt: verification.expiresAt 
    });
    
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 