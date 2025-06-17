import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import License from '../../models/License';
import User from '../../models/User';
import Company from '../../models/Company';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company');
    const userId = searchParams.get('user');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    const query: any = {};
    if (companyId) query.company = companyId;
    if (userId) query.user = userId;
    if (status) query.status = status;
    if (type) query.type = type;
    
    const licenses = await License.find(query)
      .populate('company', 'name logo')
      .populate('user', 'firstName lastName email image')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await License.countDocuments(query);
    
    // Format licenses for frontend
    const formattedLicenses = licenses.map(license => ({
      id: license._id,
      type: license.type,
      status: license.status,
      company: license.company,
      user: license.user,
      features: license.features,
      maxUsers: license.maxUsers,
      maxCalls: license.maxCalls,
      maxStorage: license.maxStorage,
      validFrom: license.validFrom,
      validUntil: license.validUntil,
      assignedAt: license.assignedAt,
      pricing: license.pricing,
      usage: license.usage,
      assignmentHistory: license.assignmentHistory,
      createdAt: license.createdAt,
      updatedAt: license.updatedAt
    }));
    
    return NextResponse.json({
      licenses: formattedLicenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch licenses error:', error);
    return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { 
      type, 
      companyId, 
      userId, 
      features, 
      maxUsers, 
      maxCalls, 
      maxStorage, 
      validFrom, 
      validUntil,
      pricing 
    } = await request.json();
    
    // Validate required fields
    if (!type || !companyId) {
      return NextResponse.json({ 
        error: 'License type and company are required' 
      }, { status: 400 });
    }
    
    // Validate company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }
    
    // Validate user if provided
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      // Check if user belongs to the company
      if (user.company?.toString() !== companyId) {
        return NextResponse.json({ 
          error: 'User does not belong to the specified company' 
        }, { status: 400 });
      }
    }
    
    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    
    if (fromDate >= untilDate) {
      return NextResponse.json({ 
        error: 'Valid until date must be after valid from date' 
      }, { status: 400 });
    }
    
    // Create license
    const license = new License({
      type,
      company: companyId,
      user: userId || null,
      features: features || [],
      maxUsers: maxUsers || 1,
      maxCalls: maxCalls || 100,
      maxStorage: maxStorage || 1000, // MB
      validFrom: fromDate,
      validUntil: untilDate,
      status: 'active',
      pricing: pricing || {},
      usage: {
        totalUsers: 0,
        totalCalls: 0,
        totalStorage: 0,
        lastUpdated: new Date()
      }
    });
    
    if (userId) {
      license.assignedAt = new Date();
      license.assignmentHistory = [{
        user: userId,
        assignedAt: new Date(),
        assignedBy: null // TODO: Get from auth context
      }];
    }
    
    await license.save();
    
    // Populate for response
    await license.populate('company', 'name logo');
    if (userId) {
      await license.populate('user', 'firstName lastName email');
    }
    
    return NextResponse.json(license, { status: 201 });
    
  } catch (error) {
    console.error('Create license error:', error);
    return NextResponse.json({ 
      error: 'Failed to create license' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get('id');
    
    if (!licenseId) {
      return NextResponse.json({ 
        error: 'License ID is required' 
      }, { status: 400 });
    }
    
    const updates = await request.json();
    
    // Remove fields that shouldn't be updated this way
    delete updates._id;
    delete updates.id;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.assignmentHistory; // Use separate endpoint for assignments
    
    // Validate dates if being updated
    if (updates.validFrom || updates.validUntil) {
      const license = await License.findById(licenseId);
      if (!license) {
        return NextResponse.json({ 
          error: 'License not found' 
        }, { status: 404 });
      }
      
      const fromDate = new Date(updates.validFrom || license.validFrom);
      const untilDate = new Date(updates.validUntil || license.validUntil);
      
      if (fromDate >= untilDate) {
        return NextResponse.json({ 
          error: 'Valid until date must be after valid from date' 
        }, { status: 400 });
      }
    }
    
    // Validate user if being updated
    if (updates.user) {
      const user = await User.findById(updates.user);
      if (!user) {
        return NextResponse.json({ 
          error: 'User not found' 
        }, { status: 404 });
      }
    }
    
    const license = await License.findByIdAndUpdate(
      licenseId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('company', 'name logo').populate('user', 'firstName lastName email');
    
    if (!license) {
      return NextResponse.json({ 
        error: 'License not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json(license);
    
  } catch (error) {
    console.error('Update license error:', error);
    return NextResponse.json({ 
      error: 'Failed to update license' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get('id');
    
    if (!licenseId) {
      return NextResponse.json({ 
        error: 'License ID is required' 
      }, { status: 400 });
    }
    
    const license = await License.findById(licenseId);
    if (!license) {
      return NextResponse.json({ 
        error: 'License not found' 
      }, { status: 404 });
    }
    
    // Check if license is currently active and assigned
    if (license.status === 'active' && license.user) {
      return NextResponse.json({ 
        error: 'Cannot delete an active assigned license. Please unassign first.' 
      }, { status: 400 });
    }
    
    // Soft delete by changing status
    license.status = 'deleted';
    license.deletedAt = new Date();
    await license.save();
    
    return NextResponse.json({ 
      message: 'License deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete license error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete license' 
    }, { status: 500 });
  }
} 