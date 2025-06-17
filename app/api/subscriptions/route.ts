import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import Subscription from '../../models/Subscription';
import Company from '../../models/Company';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company');
    const status = searchParams.get('status');
    
    const query: any = {};
    if (companyId) query.company = companyId;
    if (status) query.status = status;
    
    const subscriptions = await Subscription.find(query)
      .populate('company', 'name email')
      .populate('addons.addon')
      .populate('paymentHistory');
    
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['company', 'plan', 'licenseCount', 'currentPeriodStart', 'currentPeriodEnd', 'nextBillingDate'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }
    
    // Check if company already has a subscription
    const existingSubscription = await Subscription.findOne({ company: data.company });
    if (existingSubscription) {
      return NextResponse.json({ error: 'Company already has a subscription' }, { status: 400 });
    }
    
    const subscription = new Subscription(data);
    await subscription.save();
    
    // Update company with subscription reference
    await Company.findByIdAndUpdate(data.company, { 
      subscription: subscription._id 
    });
    
    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');
    
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }
    
    const data = await request.json();
    
    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
} 