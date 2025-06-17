import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import Payment from '../../models/Payment';
import Company from '../../models/Company';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    const query: any = {};
    if (companyId) query.company = companyId;
    if (status) query.status = status;
    
    const payments = await Payment.find(query)
      .populate('company', 'name')
      .populate('licenses')
      .populate('addons.addon')
      .sort({ invoiceDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Payment.countDocuments(query);
    
    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['company', 'description', 'amount', 'invoiceDate', 'dueDate'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }
    
    // Generate unique invoice ID
    const invoiceCount = await Payment.countDocuments({ 
      company: data.company 
    });
    data.invoiceId = `INV-${Date.now()}-${invoiceCount + 1}`;
    
    const payment = new Payment(data);
    await payment.save();
    
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }
    
    const data = await request.json();
    
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
} 