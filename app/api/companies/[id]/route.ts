import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import Company from '../../../models/Company';
import User from '../../../models/User';
import License from '../../../models/License';
import Subscription from '../../../models/Subscription';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const company = await Company.findById(params.id)
      .populate('users', 'firstName lastName email role image isActive');
    
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }
    
    // Get additional stats for this company
    const [licenseCount, activeUserCount, currentSubscription] = await Promise.all([
      License.countDocuments({ company: company._id }),
      User.countDocuments({ company: company._id, isActive: true }),
      Subscription.findOne({ company: company._id, status: 'active' })
    ]);
    
    const companyResponse = {
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
      customDomain: company.customDomain,
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
    
    return NextResponse.json(companyResponse);
    
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch company' 
    }, { status: 500 });
  }
} 