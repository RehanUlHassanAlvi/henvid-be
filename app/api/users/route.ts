import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../utils/dbConnect';
import User from '../../models/User';
import Company from '../../models/Company';
import License from '../../models/License';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    
    const query: any = {};
    if (companyId) query.company = companyId;
    if (role) query.role = role;
    if (isActive !== null) query.isActive = isActive === 'true';
    
    // Add search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .populate('company', 'name logo')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    // Format users for frontend compatibility
    const formattedUsers = users.map(user => ({
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
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      reviews: user.reviewCount || 0, // Frontend compatibility
      totalVideoCalls: user.totalVideoCalls || 0,
      averageRating: user.averageRating || 0
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
    const { firstName, lastName, email, password, phone, role, companyId, language } = await request.json();
    
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
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 409 });
    }
    
    // Validate company if provided
    if (companyId) {
      const company = await Company.findById(companyId);
      if (!company) {
        return NextResponse.json({ 
          error: 'Company not found' 
        }, { status: 404 });
      }
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || 'user',
      company: companyId || null,
      language: language || 'nb-NO',
      isActive: true
    });
    
    await user.save();
    
    // Update company users array if company provided
    if (companyId) {
      await Company.findByIdAndUpdate(companyId, {
        $push: { users: user._id }
      });
    }
    
    // Populate company data
    await user.populate('company', 'name logo');
    
    // Format response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.firstName,
      lastname: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      language: user.language,
      company: user.company,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      reviews: 0
    };
    
    return NextResponse.json(userResponse, { status: 201 });
    
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
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
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    const updates = await request.json();
    
    // Remove fields that shouldn't be updated this way
    delete updates.password; // Use separate endpoint for password changes
    delete updates._id;
    delete updates.id;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    // Validate email if being updated
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return NextResponse.json({ 
          error: 'Invalid email format' 
        }, { status: 400 });
      }
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: updates.email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Email already exists' 
        }, { status: 409 });
      }
      
      updates.email = updates.email.toLowerCase();
    }
    
    // Validate company if being updated
    if (updates.company) {
      const company = await Company.findById(updates.company);
      if (!company) {
        return NextResponse.json({ 
          error: 'Company not found' 
        }, { status: 404 });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('company', 'name logo').select('-password');
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Format response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.firstName,
      lastname: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      language: user.language,
      company: user.company,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      reviews: user.reviewCount || 0
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
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Soft delete by deactivating user
    user.isActive = false;
    await user.save();
    
    // Unassign any licenses
    await License.updateMany(
      { user: userId },
      { $unset: { user: 1 } }
    );
    
    // Remove from company users array
    if (user.company) {
      await Company.findByIdAndUpdate(user.company, {
        $pull: { users: userId }
      });
    }
    
    return NextResponse.json({ 
      message: 'User deactivated successfully' 
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete user' 
    }, { status: 500 });
  }
} 