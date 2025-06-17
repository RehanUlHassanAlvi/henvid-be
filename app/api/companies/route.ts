import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import Company from '../../models/Company';
import User from '../../models/User';
import License from '../../models/License';
import Subscription from '../../models/Subscription';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // active, trial, expired
    
    const query: any = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { orgNumber: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by status
    if (status) {
      const now = new Date();
      switch (status) {
        case 'trial':
          query.trialEndDate = { $gte: now };
          query.subscriptionStatus = { $ne: 'active' };
          break;
        case 'active':
          query.subscriptionStatus = 'active';
          break;
        case 'expired':
          query.$or = [
            { trialEndDate: { $lt: now }, subscriptionStatus: { $ne: 'active' } },
            { subscriptionStatus: 'expired' }
          ];
          break;
      }
    }
    
    const companies = await Company.find(query)
      .populate('users', 'firstName lastName email role image')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Company.countDocuments(query);
    
    // Get additional stats for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const [licenseCount, activeUserCount, currentSubscription] = await Promise.all([
          License.countDocuments({ company: company._id }),
          User.countDocuments({ company: company._id, isActive: true }),
          Subscription.findOne({ company: company._id, status: 'active' })
        ]);
        
        return {
          id: company._id,
          name: company.name,
          orgNumber: company.orgNumber,
          contactEmail: company.contactEmail,
          contactPhone: company.contactPhone,
          address: company.address,
          logo: company.logo,
          website: company.website,
          industry: company.industry,
          size: company.size,
          users: company.users,
          userCount: company.users?.length || 0,
          activeUserCount,
          licenseCount,
          subscriptionStatus: company.subscriptionStatus,
          trialStartDate: company.trialStartDate,
          trialEndDate: company.trialEndDate,
          onboardingStep: company.onboardingStep,
          settings: company.settings,
          billing: company.billing,
          currentSubscription,
          createdAt: company.createdAt,
          // Analytics data
          totalRevenue: company.totalRevenue || 0,
          monthlyRevenue: company.monthlyRevenue || 0,
          totalCalls: company.totalCalls || 0,
          averageCallDuration: company.averageCallDuration || 0
        };
      })
    );
    
    return NextResponse.json({
      companies: companiesWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch companies error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { 
      name, 
      orgNumber, 
      contactEmail, 
      contactPhone, 
      address, 
      website, 
      industry, 
      size 
    } = await request.json();
    
    // Validate required fields
    if (!name || !orgNumber) {
      return NextResponse.json({ 
        error: 'Company name and organization number are required' 
      }, { status: 400 });
    }
    
    // Check if company already exists
    const existingCompany = await Company.findOne({ orgNumber });
    if (existingCompany) {
      return NextResponse.json({ 
        error: 'Company with this organization number already exists' 
      }, { status: 409 });
    }
    
    // Validate email if provided
    if (contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail)) {
        return NextResponse.json({ 
          error: 'Invalid email format' 
        }, { status: 400 });
      }
    }
    
    // Create company
    const company = new Company({
      name,
      orgNumber,
      contactEmail,
      contactPhone,
      address,
      website,
      industry,
      size,
      users: [],
      onboardingStep: 1,
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      subscriptionStatus: 'trial'
    });
    
    await company.save();
    
    const companyResponse = {
      id: company._id,
      name: company.name,
      orgNumber: company.orgNumber,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      address: company.address,
      website: company.website,
      industry: company.industry,
      size: company.size,
      subscriptionStatus: company.subscriptionStatus,
      trialStartDate: company.trialStartDate,
      trialEndDate: company.trialEndDate,
      onboardingStep: company.onboardingStep,
      createdAt: company.createdAt
    };
    
    return NextResponse.json(companyResponse, { status: 201 });
    
  } catch (error) {
    console.error('Create company error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Organization number already exists' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create company' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('id');
    
    if (!companyId) {
      return NextResponse.json({ 
        error: 'Company ID is required' 
      }, { status: 400 });
    }
    
    const updates = await request.json();
    
    // Remove fields that shouldn't be updated this way
    delete updates._id;
    delete updates.id;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.users; // Use separate endpoint for user management
    
    // Validate email if being updated
    if (updates.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.contactEmail)) {
        return NextResponse.json({ 
          error: 'Invalid email format' 
        }, { status: 400 });
      }
    }
    
    // Validate org number if being updated
    if (updates.orgNumber) {
      const existingCompany = await Company.findOne({ 
        orgNumber: updates.orgNumber,
        _id: { $ne: companyId }
      });
      
      if (existingCompany) {
        return NextResponse.json({ 
          error: 'Organization number already exists' 
        }, { status: 409 });
      }
    }
    
    const company = await Company.findByIdAndUpdate(
      companyId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('users', 'firstName lastName email role');
    
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json(company);
    
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json({ 
      error: 'Failed to update company' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('id');
    
    if (!companyId) {
      return NextResponse.json({ 
        error: 'Company ID is required' 
      }, { status: 400 });
    }
    
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }
    
    // Check if company has active users
    const activeUsers = await User.countDocuments({ 
      company: companyId, 
      isActive: true 
    });
    
    if (activeUsers > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete company with active users. Please deactivate all users first.' 
      }, { status: 400 });
    }
    
    // Soft delete by marking as inactive
    company.isActive = false;
    company.deletedAt = new Date();
    await company.save();
    
    // Deactivate all users
    await User.updateMany(
      { company: companyId },
      { isActive: false }
    );
    
    // Cancel active subscriptions
    await Subscription.updateMany(
      { company: companyId, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date() }
    );
    
    return NextResponse.json({ 
      message: 'Company deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete company error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete company' 
    }, { status: 500 });
  }
} 