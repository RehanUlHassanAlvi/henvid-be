import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../utils/dbConnect';
import { User, Company, License } from '../../models';
import EmailVerification from '../../models/EmailVerification';
import { EmailService, generateVerificationCode } from '../../../utils/emailService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    // Get token from cookies or Authorization header
    const cookieToken = request.cookies.get('auth-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '');
    
    const token = cookieToken || bearerToken;
    
    let decoded;
    if (token) {
      try {
        decoded = jwt.verify(token, JWT_SECRET) as any;
      } catch (error) {
        return NextResponse.json({ 
          error: 'Invalid or expired token' 
        }, { status: 401 });
      }
    } else {
      return NextResponse.json({ 
        error: 'No token provided' 
      }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    const company = searchParams.get('company');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    
    const query: any = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by company - restrict to the authenticated user's company if not admin
    if (decoded.role !== 'admin') {
      if (decoded.companyId) {
        query.company = decoded.companyId;
        console.log('Users API: Restricting to user\'s company:', decoded.companyId);
      } else {
        return NextResponse.json({ 
          error: 'No company associated with user' 
        }, { status: 403 });
      }
    } else if (company) {
      query.company = company;
      console.log('Users API: Filtering by company (admin):', company);
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by active status
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    console.log('Users API: Final query:', query);
    
    const users = await User.find(query)
      .populate('company', 'name logo orgNumber')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);
    
    console.log('Users API: Found', users.length, 'users, total:', total);
    
    // Additional filtering for company context - ensure users actually have the company
    const companyFilteredUsers = company ? 
      users.filter(user => {
        const userCompanyId = user.company?._id?.toString() || user.company?.toString();
        const matchesCompany = userCompanyId === company;
        console.log(`User ${user.email}: company=${userCompanyId}, matches=${matchesCompany}`);
        return matchesCompany;
      }) : 
      users;
    
    // Fetch licenses for all users
    const userIds = companyFilteredUsers.map(user => user._id);
    const licenses = await License.find({ user: { $in: userIds } })
      .select('_id type status validFrom validUntil user monthlyCallLimit features price currency')
      .lean();
    
    console.log('Users API: Found licenses for users:', licenses.length);
    
    // Create a map of userId to licenses
    const userLicensesMap = licenses.reduce((acc: any, license: any) => {
      const userId = license.user.toString();
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(license);
      return acc;
    }, {});
    
    // Format users for frontend compatibility  
    const formattedUsers = companyFilteredUsers.map(user => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.firstName, // Frontend compatibility
      lastname: user.lastName, // Frontend compatibility
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      language: user.language,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      company: user.company,
      totalVideoCalls: user.totalVideoCalls,
      totalCallDuration: user.totalCallDuration,
      averageRating: user.averageRating,
      reviews: user.reviewCount, // Frontend compatibility
      reviewCount: user.reviewCount,
      lastLoginAt: user.lastLoginAt,
      lastActivityAt: user.lastActivityAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      licenses: userLicensesMap[user._id.toString()] || [] // Add licenses for this user
    }));
    
    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const requestBody = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      phone, 
      phoneCountryCode,
      phoneNumber,
      role, 
      companyId,
      image,
      language
    } = requestBody;
    
    console.log('Create user request body:', requestBody);
    console.log('Extracted companyId:', companyId);
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ 
        error: 'First name, last name, and email are required' 
      }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }
    
    // Check if user already exists for the same company
    if (companyId) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), company: companyId });
      if (existingUser) {
        return NextResponse.json({ 
          error: 'User with this email already exists in this company' 
        }, { status: 409 });
      }
    } else {
      // If no company is provided, check if email exists globally to prevent duplicates without company
      const existingUser = await User.findOne({ email: email.toLowerCase(), company: null });
      if (existingUser) {
        return NextResponse.json({ 
          error: 'User with this email already exists without a company association' 
        }, { status: 409 });
      }
    }
    
    // Validate company if provided
    if (companyId) {
      console.log('Validating company with ID:', companyId);
      const company = await Company.findById(companyId);
      console.log('Found company:', company ? 'Yes' : 'No');
      if (!company) {
        console.log('Company not found with ID:', companyId);
        return NextResponse.json({ 
          error: 'Invalid company ID' 
        }, { status: 400 });
      }
      console.log('Company validation successful:', company.name);
    } else {
      console.log('No companyId provided in request');
    }
    
    // Generate password if not provided
    const userPassword = password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(userPassword, 12);
    
    // Handle phone number structure
    let phoneData = {};
    if (phoneCountryCode && phoneNumber) {
      phoneData = {
        countryCode: phoneCountryCode,
        number: phoneNumber,
        full: `${phoneCountryCode}${phoneNumber}`
      };
    } else if (phone) {
      // Backward compatibility - try to parse existing phone format
      const phoneStr = phone.toString();
      if (phoneStr.startsWith('+')) {
        // Extract country code and number
        const match = phoneStr.match(/^(\+\d{1,4})(.+)$/);
        if (match) {
          phoneData = {
            countryCode: match[1],
            number: match[2],
            full: phoneStr
          };
        } else {
          phoneData = {
            countryCode: '+47', // Default to Norway
            number: phoneStr.slice(1), // Remove the + sign
            full: phoneStr
          };
        }
      } else {
        phoneData = {
          countryCode: '+47', // Default to Norway
          number: phoneStr,
          full: `+47${phoneStr}`
        };
      }
    }
    
        // Create user
    console.log('Creating user with company assignment:', companyId || 'null');
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phoneData,
      role: role || 'user',
      company: companyId || null,
      image: image || '/assets/elements/avatar.png',
      language: language || 'nb-NO',
      isActive: true,
      emailVerified: false // Will need email verification
    });

    await user.save();
    console.log('User created with ID:', user._id, 'and company:', user.company);
    
    // Add user to company if specified
    if (companyId) {
      console.log('Adding user to company users array...');
      await Company.findByIdAndUpdate(companyId, {
        $addToSet: { users: user._id }
      });
      console.log('User added to company users array');
    }
    
    // Populate company data for response
    await user.populate('company', 'name logo orgNumber');
    
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.firstName,
      lastname: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      language: user.language,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      company: user.company,
      createdAt: user.createdAt,
      // Include temporary password in response (remove in production)
      tempPassword: !password ? userPassword : undefined
    };
    
    return NextResponse.json(userResponse, { status: 201 });
    
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle duplicate key errors
    if ((error as any).code === 11000) {
      return NextResponse.json({ 
        error: 'Email already exists' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create user' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const updateData = await request.json();
    
    // Remove fields that shouldn't be updated this way
    delete updateData.password; // Use separate endpoint for password changes
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.emailVerified; // Use separate endpoint for email verification
    
    // Validate email if being updated
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json({ 
          error: 'Invalid email format' 
        }, { status: 400 });
      }
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Email already exists' 
        }, { status: 409 });
      }
      
      updateData.email = updateData.email.toLowerCase();
    }
    
    // Handle phone number structure in updates
    if (updateData.phoneCountryCode && updateData.phoneNumber) {
      updateData.phone = {
        countryCode: updateData.phoneCountryCode,
        number: updateData.phoneNumber,
        full: `${updateData.phoneCountryCode}${updateData.phoneNumber}`
      };
      delete updateData.phoneCountryCode;
      delete updateData.phoneNumber;
    } else if (updateData.phone && typeof updateData.phone === 'string') {
      // Backward compatibility - parse existing phone format
      const phoneStr = updateData.phone.toString();
      if (phoneStr.startsWith('+')) {
        const match = phoneStr.match(/^(\+\d{1,4})(.+)$/);
        if (match) {
          updateData.phone = {
            countryCode: match[1],
            number: match[2],
            full: phoneStr
          };
        } else {
          updateData.phone = {
            countryCode: '+47',
            number: phoneStr.slice(1),
            full: phoneStr
          };
        }
      } else {
        updateData.phone = {
          countryCode: '+47',
          number: phoneStr,
          full: `+47${phoneStr}`
        };
      }
    }
    
    // Validate company if being updated
    if (updateData.companyId) {
      const company = await Company.findById(updateData.companyId);
      if (!company) {
        return NextResponse.json({ 
          error: 'Invalid company ID' 
        }, { status: 400 });
      }
      updateData.company = updateData.companyId;
      delete updateData.companyId;
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('company', 'name logo orgNumber');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.firstName,
      lastname: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      language: user.language,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      company: user.company,
      totalVideoCalls: user.totalVideoCalls,
      averageRating: user.averageRating,
      reviews: user.reviewCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return NextResponse.json(userResponse);
    
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ 
      error: 'Failed to update user' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Find user first
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Soft delete by setting isActive to false
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      deletedAt: new Date()
    });
    
    // Remove user from company's users array
    if (user.company) {
      await Company.findByIdAndUpdate(user.company, {
        $pull: { users: userId }
      });
    }
    
    // Unassign all licenses
    await License.updateMany(
      { user: userId },
      { $unset: { user: 1 }, status: 'available' }
    );
    
    return NextResponse.json({ 
      message: 'User deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete user' 
    }, { status: 500 });
  }
} 