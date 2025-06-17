import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import Analytics from '../../models/Analytics';
import VideoCall from '../../models/VideoCall';
import User from '../../models/User';
import Payment from '../../models/Payment';
import Review from '../../models/Review';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company');
    const period = searchParams.get('period') || 'daily';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '30');
    
    const query: any = {};
    if (companyId) query.company = companyId;
    if (period) query.period = period;
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const analytics = await Analytics.find(query)
      .sort({ date: -1 })
      .limit(limit);
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { company, period, startDate, endDate } = await request.json();
    
    if (!company || !period || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'company, period, startDate, and endDate are required' 
      }, { status: 400 });
    }
    
    // Generate analytics for the specified period
    const analyticsData = await generateAnalytics(company, period, new Date(startDate), new Date(endDate));
    
    // Check if analytics already exist for this period
    const existingAnalytics = await Analytics.findOne({
      company,
      period,
      date: new Date(startDate)
    });
    
    if (existingAnalytics) {
      // Update existing analytics
      Object.assign(existingAnalytics, analyticsData);
      await existingAnalytics.save();
      return NextResponse.json(existingAnalytics);
    } else {
      // Create new analytics record
      const analytics = new Analytics({
        company,
        period,
        date: new Date(startDate),
        endDate: new Date(endDate),
        ...analyticsData
      });
      await analytics.save();
      return NextResponse.json(analytics, { status: 201 });
    }
  } catch (error) {
    console.error('Analytics generation error:', error);
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}

// Helper function to generate analytics data
async function generateAnalytics(companyId: string, period: string, startDate: Date, endDate: Date) {
  const dateFilter = {
    company: companyId,
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  // Call metrics
  const calls = await VideoCall.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: {
            $cond: [{ $eq: ['$status', 'ended'] }, 1, 0]
          }
        },
        totalDuration: { $sum: '$duration' },
        averageDuration: { $avg: '$duration' },
        averageWaitTime: { $avg: '$waitingTime' },
        averageResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);
  
  // User engagement
  const users = await User.aggregate([
    { $match: { company: companyId, createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: null,
        newRegistrations: { $sum: 1 },
        totalLogins: { $sum: '$loginCount' }
      }
    }
  ]);
  
  // Revenue metrics
  const revenue = await Payment.aggregate([
    { 
      $match: { 
        company: companyId, 
        invoiceDate: { $gte: startDate, $lte: endDate },
        status: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        subscriptions: {
          $sum: {
            $cond: [{ $eq: ['$type', 'subscription'] }, '$amount', 0]
          }
        },
        addons: {
          $sum: {
            $cond: [{ $eq: ['$type', 'addon'] }, '$amount', 0]
          }
        }
      }
    }
  ]);
  
  // Reviews and satisfaction
  const reviews = await Review.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: 'videocalls',
        localField: 'videoCall',
        foreignField: '_id',
        as: 'call'
      }
    },
    {
      $match: {
        'call.company': companyId
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$ratingHelpfulness' },
        problemsSolved: {
          $sum: {
            $cond: ['$problemSolved', 1, 0]
          }
        }
      }
    }
  ]);
  
  const callData = calls[0] || {};
  const userData = users[0] || {};
  const revenueData = revenue[0] || {};
  const reviewData = reviews[0] || {};
  
  return {
    calls: {
      total: callData.total || 0,
      successful: callData.successful || 0,
      failed: (callData.total || 0) - (callData.successful || 0),
      totalDuration: callData.totalDuration || 0,
      averageDuration: callData.averageDuration || 0,
      averageWaitTime: callData.averageWaitTime || 0,
      averageResponseTime: callData.averageResponseTime || 0
    },
    users: {
      newRegistrations: userData.newRegistrations || 0,
      totalLogins: userData.totalLogins || 0
    },
    revenue: {
      total: revenueData.total || 0,
      subscriptions: revenueData.subscriptions || 0,
      addons: revenueData.addons || 0
    },
    satisfaction: {
      totalReviews: reviewData.totalReviews || 0,
      averageRating: reviewData.averageRating || 0,
      problemsSolved: reviewData.problemsSolved || 0,
      problemsNotSolved: (reviewData.totalReviews || 0) - (reviewData.problemsSolved || 0)
    }
  };
} 