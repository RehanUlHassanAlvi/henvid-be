import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import { User, Company, License } from '../../../models';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const userId = params.id;
    
    const user = await User.findById(userId)
      .populate('company', 'name logo orgNumber')
      .select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get user's licenses
    const licenses = await License.find({ user: userId })
      .populate('company', 'name logo');
    
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
      timezone: user.timezone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      company: user.company,
      licenses: licenses,
      totalVideoCalls: user.totalVideoCalls,
      totalCallDuration: user.totalCallDuration,
      averageRating: user.averageRating,
      reviews: user.reviewCount,
      reviewCount: user.reviewCount,
      lastLoginAt: user.lastLoginAt,
      lastActivityAt: user.lastActivityAt,
      loginCount: user.loginCount,
      notifications: user.notifications,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
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
    const userId = params.id;
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
    
    // Validate company if being updated
    if (updateData.companyId) {
      const company = await Company.findById(updateData.companyId);
      if (!company) {
        return NextResponse.json({ 
          error: 'Invalid company ID' 
        }, { status: 400 });
      }
      
      // Get current user to check if company is changing
      const currentUser = await User.findById(userId);
      const oldCompanyId = currentUser?.company?.toString();
      
      updateData.company = updateData.companyId;
      delete updateData.companyId;
      
      // Update company relationships if company changed
      if (oldCompanyId !== updateData.company) {
        // Remove from old company
        if (oldCompanyId) {
          await Company.findByIdAndUpdate(oldCompanyId, {
            $pull: { users: userId }
          });
        }
        
        // Add to new company
        await Company.findByIdAndUpdate(updateData.company, {
          $addToSet: { users: userId }
        });
      }
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
      timezone: user.timezone,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const userId = params.id;
    
    // Find user first
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user is super admin (prevent deletion)
    if (user.role === 'super_admin') {
      return NextResponse.json({ 
        error: 'Cannot delete super admin user' 
      }, { status: 403 });
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
    
    // Unassign all licenses and mark them as available
    await License.updateMany(
      { user: userId },
      { 
        $unset: { user: 1 },
        status: 'available',
        unassignedAt: new Date()
      }
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