import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import { VideoCall, User, Review, Payment, Company } from '../../models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('auth-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '');
    
    const token = cookieToken || bearerToken;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId)
      .populate('company', '_id name')
      .select('-password');
    
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    // Get authenticated user
    const currentUser = await getUserFromToken(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const companyId = searchParams.get('company') || currentUser.company?._id?.toString();
    
    if (!companyId) {
      return NextResponse.json({ error: 'No company context available' }, { status: 400 });
    }

    // Date range for statistics
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
    
    // Get company settings for cost calculations
    const company = await Company.findById(companyId);
    const costPerCall = company?.settings?.costPerCall || 2000; // Default 2000 NOK per call saved

    // Parallel queries for better performance
    const [
      totalVideoCalls,
      solvedCases,
      unsolvedCases,
      totalRevenue,
      monthlyRevenue,
      averageRating,
      callsThisMonth,
      previousMonthCalls
    ] = await Promise.all([
      // Total video calls in period
      VideoCall.countDocuments({
        company: companyId,
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      
      // Solved cases (calls with positive resolution)
      VideoCall.countDocuments({
        company: companyId,
        status: 'ended',
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      
      // Unsolved cases (failed calls or negative feedback)
      VideoCall.countDocuments({
        company: companyId,
        status: { $in: ['failed', 'cancelled'] },
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      
      // Total revenue in period
      Payment.aggregate([
        {
          $match: {
            company: companyId,
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Monthly revenue
      Payment.aggregate([
        {
          $match: {
            company: companyId,
            status: 'completed',
            createdAt: {
              $gte: new Date(endDate.getFullYear(), endDate.getMonth(), 1),
              $lte: endDate
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Average rating from reviews
      Review.aggregate([
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
            'call.company': companyId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]),
      
      // Current month calls
      VideoCall.countDocuments({
        company: companyId,
        createdAt: {
          $gte: new Date(endDate.getFullYear(), endDate.getMonth(), 1),
          $lte: endDate
        }
      }),
      
      // Previous month calls for growth calculation
      VideoCall.countDocuments({
        company: companyId,
        createdAt: {
          $gte: new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1),
          $lt: new Date(endDate.getFullYear(), endDate.getMonth(), 1)
        }
      })
    ]);

    // Calculate percentage of solved vs unsolved
    const solvedPercentage = totalVideoCalls > 0 ? Math.round((solvedCases / totalVideoCalls) * 100) : 0;
    const unsolvedPercentage = totalVideoCalls > 0 ? Math.round((unsolvedCases / totalVideoCalls) * 100) : 0;

    // Calculate growth percentage
    const callGrowth = previousMonthCalls > 0 ? 
      Math.round(((callsThisMonth - previousMonthCalls) / previousMonthCalls) * 100) : 0;

    // Calculate cost savings
    const totalSavings = solvedCases * costPerCall;
    const savingsInK = Math.round(totalSavings / 1000); // Convert to thousands

    // Format average rating
    const avgRating = averageRating[0]?.avg || 0;

    // Calculate revenue growth (simplified)
    const revenueGrowth = 6; // This could be calculated from historical data

    const statistics = {
      videoCalls: {
        total: totalVideoCalls,
        growth: callGrowth,
        trend: callGrowth >= 0 ? 'up' : 'down'
      },
      solvedCases: {
        total: solvedCases,
        percentage: solvedPercentage,
        trend: 'up'
      },
      unsolvedCases: {
        total: unsolvedCases,
        percentage: unsolvedPercentage,
        trend: unsolvedPercentage < 20 ? 'down' : 'up'
      },
      costSavings: {
        total: savingsInK,
        currency: 'NOK',
        growth: revenueGrowth,
        trend: 'up',
        unit: 'k'
      },
      satisfaction: {
        rating: avgRating,
        outOf: 5,
        percentage: Math.round((avgRating / 5) * 100)
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0,
        growth: revenueGrowth,
        currency: 'NOK'
      },
      period: {
        days: parseInt(period),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    };

    return NextResponse.json(statistics);
    
  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch statistics' 
    }, { status: 500 });
  }
} 