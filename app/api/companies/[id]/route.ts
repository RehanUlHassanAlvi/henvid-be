import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import { Company, User, License, Subscription } from '../../../models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const companyId = params.id;
    const company = await Company.findById(companyId)
      .populate('users', 'firstName lastName email role image isActive')
      .populate('licenses', 'type status validFrom validUntil features')
      .populate('subscription', 'plan status startDate endDate');
    
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }
    
    // Get additional stats for this company
    const [licenseCount, activeUserCount, totalLicenseValue] = await Promise.all([
      License.countDocuments({ company: company._id }),
      User.countDocuments({ company: company._id, isActive: true }),
      License.aggregate([
        { $match: { company: company._id, status: 'active' } },
        { $group: { _id: null, total: { $sum: '$pricing.amount' } } }
      ])
    ]);
    
    const companyResponse = {
      id: company._id,
      name: company.name,
      orgNumber: company.orgNumber,
      industry: company.industry,
      country: company.country,
      language: company.language,
      email: company.email,
      phone: company.phone,
      website: company.website,
      address: company.address,
      logo: company.logo,
      brandColors: company.brandColors,
      customDomain: company.customDomain,
      size: company.size,
      foundedYear: company.foundedYear,
      isActive: company.isActive,
      isPremium: company.isPremium,
      settings: company.settings,
      users: company.users,
      licenses: company.licenses,
      subscription: company.subscription,
      userCount: company.users?.length || 0,
      activeUserCount,
      licenseCount,
      totalLicenseValue: totalLicenseValue[0]?.total || 0,
      onboardingCompleted: company.onboardingCompleted,
      onboardingStep: company.onboardingStep,
      trialStartDate: company.trialStartDate,
      trialEndDate: company.trialEndDate,
      analytics: company.analytics,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
    
    return NextResponse.json(companyResponse);
    
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch company' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const companyId = params.id;
    const updateData = await request.json();
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.users; // Use separate endpoint for user management
    delete updateData.licenses; // Use separate endpoint for license management
    
    // Validate org number if being updated
    if (updateData.orgNumber) {
      const existingCompany = await Company.findOne({ 
        orgNumber: updateData.orgNumber,
        _id: { $ne: companyId }
      });
      if (existingCompany) {
        return NextResponse.json({ 
          error: 'Organization number already exists' 
        }, { status: 409 });
      }
    }
    
    // Validate email if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json({ 
          error: 'Invalid email format' 
        }, { status: 400 });
      }
    }
    
    // Update company
    const company = await Company.findByIdAndUpdate(
      companyId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('users', 'firstName lastName email role image isActive')
    .populate('subscription', 'plan status startDate endDate');
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    const companyResponse = {
      id: company._id,
      name: company.name,
      orgNumber: company.orgNumber,
      industry: company.industry,
      country: company.country,
      language: company.language,
      email: company.email,
      phone: company.phone,
      website: company.website,
      address: company.address,
      logo: company.logo,
      brandColors: company.brandColors,
      customDomain: company.customDomain,
      size: company.size,
      foundedYear: company.foundedYear,
      isActive: company.isActive,
      isPremium: company.isPremium,
      settings: company.settings,
      users: company.users,
      subscription: company.subscription,
      userCount: company.users?.length || 0,
      onboardingCompleted: company.onboardingCompleted,
      onboardingStep: company.onboardingStep,
      analytics: company.analytics,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
    
    return NextResponse.json(companyResponse);
    
  } catch (error) {
    console.error('Update company error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Organization number already exists' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update company' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const companyId = params.id;
    
    // Find company first
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    // Check if company has active users
    const activeUserCount = await User.countDocuments({ 
      company: companyId, 
      isActive: true 
    });
    
    if (activeUserCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete company with active users. Please deactivate all users first.' 
      }, { status: 400 });
    }
    
    // Check if company has active subscriptions
    const activeSubscription = await Subscription.findOne({ 
      company: companyId, 
      status: 'active' 
    });
    
    if (activeSubscription) {
      return NextResponse.json({ 
        error: 'Cannot delete company with active subscription. Please cancel subscription first.' 
      }, { status: 400 });
    }
    
    // Soft delete by setting isActive to false
    await Company.findByIdAndUpdate(companyId, {
      isActive: false,
      deletedAt: new Date()
    });
    
    // Deactivate all users in this company
    await User.updateMany(
      { company: companyId },
      { 
        isActive: false,
        deletedAt: new Date()
      }
    );
    
    // Mark all licenses as inactive
    await License.updateMany(
      { company: companyId },
      { 
        status: 'inactive',
        $unset: { user: 1 },
        inactivatedAt: new Date()
      }
    );
    
    // Cancel any pending subscriptions
    await Subscription.updateMany(
      { company: companyId },
      { 
        status: 'cancelled',
        cancelledAt: new Date()
      }
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