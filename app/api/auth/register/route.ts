import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../utils/dbConnect';
import User from '../../../models/User';
import Company from '../../../models/Company';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { firstName, lastName, email, password, phone, companyName, orgNumber } = await request.json();
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ 
        error: 'First name, last name, email, and password are required' 
      }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 409 });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    let company = null;
    
    // Handle company creation if provided
    if (companyName && orgNumber) {
      // Check if company already exists
      const existingCompany = await Company.findOne({ orgNumber });
      if (existingCompany) {
        return NextResponse.json({ 
          error: 'Company with this organization number already exists' 
        }, { status: 409 });
      }
      
      // Create new company
      company = new Company({
        name: companyName,
        orgNumber,
        users: [], // Will be updated below
        onboardingStep: 1,
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
      });
      
      await company.save();
    }
    
    // Create user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      company: company?._id,
      role: company ? 'admin' : 'user', // Company creator becomes admin
      emailVerified: false,
      isActive: true
    });
    
    await user.save();
    
    // Update company with user reference
    if (company) {
      company.users.push(user._id);
      await company.save();
    }
    
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
      company: company ? {
        _id: company._id,
        name: company.name,
        orgNumber: company.orgNumber
      } : null,
      createdAt: user.createdAt,
      reviews: 0 // New user has no reviews
    };
    
    return NextResponse.json({
      message: 'User registered successfully',
      user: userResponse,
      company: company ? {
        id: company._id,
        name: company.name,
        orgNumber: company.orgNumber,
        trialEndDate: company.trialEndDate
      } : null
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ 
        error: `${field} already exists` 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 