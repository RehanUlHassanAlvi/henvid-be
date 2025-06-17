import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import User from '../../../models/User';
import License from '../../../models/License';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const user = await User.findById(params.id)
      .populate('company', 'name logo orgNumber')
      .select('-password');
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Get user's licenses
    const licenses = await License.find({ user: params.id })
      .populate('company', 'name')
      .select('type status validFrom validUntil features');
    
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
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      notifications: user.notifications,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      lastActivityAt: user.lastActivityAt,
      reviews: user.reviewCount || 0, // Frontend compatibility
      totalVideoCalls: user.totalVideoCalls || 0,
      totalCallDuration: user.totalCallDuration || 0,
      averageRating: user.averageRating || 0,
      licenses: licenses
    };
    
    return NextResponse.json(userResponse);
    
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
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
        _id: { $ne: params.id }
      });
      
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Email already exists' 
        }, { status: 409 });
      }
      
      updates.email = updates.email.toLowerCase();
    }
    
    const user = await User.findByIdAndUpdate(
      params.id,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const user = await User.findById(params.id);
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
      { user: params.id },
      { $unset: { user: 1 } }
    );
    
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