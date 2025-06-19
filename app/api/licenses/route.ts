import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import License from '../../models/License';
import User from '../../models/User';
import Company from '../../models/Company';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const cookieToken = request.cookies.get('auth-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '');
    
    const token = cookieToken || bearerToken;
    
    console.log('Licenses API: Checking authentication. Cookies:', request.cookies.getAll(), 'Authorization header:', authHeader);
    
    if (!token) {
      console.log('Licenses API: No token provided.');
      return null;
    }
    
    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    console.log('Licenses API: Token decoded. User ID:', decoded.userId);
    
    // Get user with company info
    const user = await User.findById(decoded.userId)
      .populate('company', '_id name')
      .select('-password');
    
    console.log('Licenses API: User found:', user ? 'Yes' : 'No');
    
    return user;
  } catch (error) {
    console.error('Licenses API: Token verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    console.log('License GET API called');
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company');
    const userId = searchParams.get('user');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    console.log('License API params:', { companyId, userId, status, type, limit, page });
    
    // Get authenticated user
    const currentUser = await getUserFromToken(request);
    console.log('License API currentUser:', currentUser ? 'authenticated' : 'not authenticated');
    if (!currentUser) {
      console.log('License API: Authentication required');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const query: any = {};
    
    // If companyId is provided, use it; otherwise use user's company
    if (companyId) {
      query.company = companyId;
    } else if (currentUser.company) {
      query.company = currentUser.company._id;
    } else {
      console.log('License API: No company context available');
      return NextResponse.json({ error: 'No company context available' }, { status: 400 });
    }
    
    console.log('License API query:', query);
    console.log('License API currentUser.company:', currentUser.company);
    
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
    
    console.log('License API found:', licenses.length, 'licenses, total:', total);
    
    // Format licenses for frontend
    const formattedLicenses = licenses.map(license => ({
      id: license._id,
      _id: license._id,
      type: license.type,
      status: license.status,
      company: license.company,
      user: license.user,
      features: license.features,
      price: license.price,
      currency: license.currency,
      billingCycle: license.billingCycle,
      validFrom: license.validFrom,
      validUntil: license.validUntil,
      monthlyCallLimit: license.monthlyCallLimit,
      monthlyCallsUsed: license.monthlyCallsUsed,
      totalCalls: license.totalCalls,
      totalDuration: license.totalDuration,
      lastUsed: license.lastUsed,
      autoRenew: license.autoRenew,
      assignmentHistory: license.assignmentHistory,
      analytics: license.analytics,
      createdAt: license.createdAt,
      updatedAt: license.updatedAt
    }));
    
    return NextResponse.json({
      data: formattedLicenses,
      licenses: formattedLicenses, // Keep both for backward compatibility
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
    // Get authenticated user first
    const currentUser = await getUserFromToken(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (!currentUser.company) {
      return NextResponse.json({ error: 'User is not associated with any company' }, { status: 400 });
    }
    
    const { 
      type, 
      userId, 
      features, 
      maxUsers, 
      maxCalls, 
      maxStorage, 
      validFrom, 
      validUntil,
      pricing 
    } = await request.json();
    
    // Validate required fields - companyId comes from authenticated user
    if (!type) {
      return NextResponse.json({ 
        error: 'License type is required' 
      }, { status: 400 });
    }
    
    // Use company from authenticated user
    const companyId = currentUser.company._id.toString();
    
    // Validate user if provided
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      // Check if user belongs to the same company as the authenticated user
      if (user.company?.toString() !== companyId) {
        return NextResponse.json({ 
          error: 'User does not belong to your company' 
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
    // Set price based on license type (in NOK øre)
    let price = 0;
    let monthlyCallLimit = null;
    const defaultFeatures = [];
    
    switch (type) {
      case 'standard':
        price = 49900; // 499 NOK in øre
        monthlyCallLimit = 100;
        defaultFeatures.push(
          { name: 'Video Calls', enabled: true, limits: { monthly: 100 } },
          { name: 'Screen Sharing', enabled: true },
          { name: 'Recording', enabled: false }
        );
        break;
      case 'premium':
        price = 99900; // 999 NOK in øre
        monthlyCallLimit = 500;
        defaultFeatures.push(
          { name: 'Video Calls', enabled: true, limits: { monthly: 500 } },
          { name: 'Screen Sharing', enabled: true },
          { name: 'Recording', enabled: true },
          { name: 'Analytics', enabled: true }
        );
        break;
      case 'enterprise':
        price = 199900; // 1999 NOK in øre
        monthlyCallLimit = null; // unlimited
        defaultFeatures.push(
          { name: 'Video Calls', enabled: true, limits: { monthly: 'unlimited' } },
          { name: 'Screen Sharing', enabled: true },
          { name: 'Recording', enabled: true },
          { name: 'Analytics', enabled: true },
          { name: 'API Access', enabled: true },
          { name: 'Priority Support', enabled: true }
        );
        break;
    }

    const license = new License({
      type,
      company: companyId,
      user: userId || null,
      price: price,
      currency: 'NOK',
      billingCycle: 'monthly',
      validFrom: fromDate,
      validUntil: untilDate,
      status: 'active',
      monthlyCallLimit: monthlyCallLimit,
      monthlyCallsUsed: 0,
      totalCalls: 0,
      totalDuration: 0,
      features: features && features.length > 0 ? features : defaultFeatures,
      assignmentHistory: [],
      payments: [],
      analytics: {
        averageCallDuration: 0,
        successRate: 0,
        lastCalculated: new Date()
      }
    });
    
    if (userId) {
      license.assignedAt = new Date();
      license.assignmentHistory = [{
        user: userId,
        assignedAt: new Date(),
        assignedBy: currentUser._id // Now we have the authenticated user
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
    // Get authenticated user first
    const currentUser = await getUserFromToken(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get('id');
    
    if (!licenseId) {
      return NextResponse.json({ 
        error: 'License ID is required' 
      }, { status: 400 });
    }
    
    // Verify license belongs to user's company
    const existingLicense = await License.findById(licenseId);
    if (!existingLicense) {
      return NextResponse.json({ 
        error: 'License not found' 
      }, { status: 404 });
    }
    
    if (existingLicense.company.toString() !== currentUser.company._id.toString()) {
      return NextResponse.json({ 
        error: 'Access denied: License does not belong to your company' 
      }, { status: 403 });
    }
    
    const updates = await request.json();
    
    // Remove fields that shouldn't be updated this way
    delete updates._id;
    delete updates.id;
    delete updates.createdAt;
    delete updates.updatedAt;
    
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
    
    // Handle user assignment/unassignment
    if ('user' in updates) {
      const oldUserId = existingLicense.user?.toString();
      const newUserId = updates.user;
      
      if (newUserId && newUserId !== oldUserId) {
        // Validate new user
        const user = await User.findById(newUserId).populate('company', '_id name');
        if (!user) {
          return NextResponse.json({ 
            error: 'User not found' 
          }, { status: 404 });
        }
        
        // Check if user belongs to the same company
        console.log('License assignment - user.company:', user.company);
        console.log('License assignment - currentUser.company:', currentUser.company);
        
        const userCompanyId = user.company?._id?.toString() || user.company?.toString();
        const currentUserCompanyId = currentUser.company?._id?.toString();
        
        console.log('License assignment - userCompanyId:', userCompanyId);
        console.log('License assignment - currentUserCompanyId:', currentUserCompanyId);
        
        // If user has no company assigned, assign them to the current user's company
        if (!userCompanyId && currentUserCompanyId) {
          console.log('User has no company, assigning to current user company:', currentUserCompanyId);
          await User.findByIdAndUpdate(newUserId, { 
            company: currentUser.company._id 
          });
          
          // Also add user to company's users array
          await Company.findByIdAndUpdate(currentUser.company._id, {
            $addToSet: { users: newUserId }
          });
          
          console.log('User company assignment completed');
        } else if (userCompanyId !== currentUserCompanyId) {
          console.log('Company mismatch in license assignment');
          return NextResponse.json({ 
            error: 'User does not belong to your company' 
          }, { status: 400 });
        }
        
        // Update assignment history for new assignment
        updates.assignedAt = new Date();
        if (!updates.assignmentHistory) {
          updates.assignmentHistory = existingLicense.assignmentHistory || [];
        }
        updates.assignmentHistory.push({
          user: newUserId,
          assignedAt: new Date(),
          assignedBy: currentUser._id,
          reason: 'manual_assignment'
        });
        
        // Close previous assignment if exists
        if (oldUserId) {
          const lastAssignment = updates.assignmentHistory[updates.assignmentHistory.length - 2];
          if (lastAssignment && !lastAssignment.unassignedAt) {
            lastAssignment.unassignedAt = new Date();
            lastAssignment.reason = 'reassigned';
          }
        }
      } else if (newUserId === null && oldUserId) {
        // Unassigning license
        updates.assignedAt = null;
        if (!updates.assignmentHistory) {
          updates.assignmentHistory = existingLicense.assignmentHistory || [];
        }
        
        // Close current assignment
        const lastAssignment = updates.assignmentHistory[updates.assignmentHistory.length - 1];
        if (lastAssignment && !lastAssignment.unassignedAt) {
          lastAssignment.unassignedAt = new Date();
          lastAssignment.reason = 'manual_unassignment';
        }
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
    // Get authenticated user first
    const currentUser = await getUserFromToken(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
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
    
    // Verify license belongs to user's company
    if (license.company.toString() !== currentUser.company._id.toString()) {
      return NextResponse.json({ 
        error: 'Access denied: License does not belong to your company' 
      }, { status: 403 });
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