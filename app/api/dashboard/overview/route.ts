import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import { User, Company, VideoCall, License, Payment, Review, Analytics } from '../../../models';
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
    const period = parseInt(searchParams.get('period') || '30'); // days
    const companyId = searchParams.get('company') || currentUser.company?._id?.toString();
    
    if (!companyId) {
      return NextResponse.json({ error: 'No company context available' }, { status: 400 });
    }

    // Date range for analytics
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - period * 24 * 60 * 60 * 1000);
    
    const query = { company: companyId };
    
    // Get current period stats
    const [
      totalUsers,
      activeUsers,
      totalCalls,
      successfulCalls,
      activeCalls,
      totalRevenue,
      monthlyRevenue,
      averageRating,
      totalLicenses,
      activeLicenses
    ] = await Promise.all([
      User.countDocuments({ company: companyId, isActive: true }),
      User.countDocuments({ 
        company: companyId, 
        isActive: true, 
        lastActivityAt: { $gte: startDate } 
      }),
      VideoCall.countDocuments({ 
        company: companyId, 
        createdAt: { $gte: startDate, $lte: endDate } 
      }),
      VideoCall.countDocuments({ 
        company: companyId, 
        status: 'ended',
        createdAt: { $gte: startDate, $lte: endDate } 
      }),
      VideoCall.countDocuments({ 
        company: companyId, 
        status: { $in: ['pending', 'ringing', 'active'] }
      }),
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
      License.countDocuments({ company: companyId }),
      License.countDocuments({ company: companyId, status: 'active' })
    ]);
    
    // Get previous period for comparison
    const prevStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const [
      prevTotalCalls,
      prevRevenue
    ] = await Promise.all([
      VideoCall.countDocuments({ 
        company: companyId, 
        createdAt: { $gte: prevStartDate, $lt: startDate } 
      }),
      Payment.aggregate([
        { 
          $match: { 
            company: companyId, 
            status: 'completed', 
            createdAt: { $gte: prevStartDate, $lt: startDate } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    // Calculate growth rates
    const callsGrowth = prevTotalCalls > 0 ? ((totalCalls - prevTotalCalls) / prevTotalCalls * 100) : 0;
    const revenueGrowth = (prevRevenue[0]?.total || 0) > 0 ? 
      ((totalRevenue[0]?.total || 0) - (prevRevenue[0]?.total || 0)) / (prevRevenue[0]?.total || 0) * 100 : 0;
    
    // Calculate success rate
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls * 100) : 0;
    
    // Get recent activity
    const recentCalls = await VideoCall.find({ company: companyId })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('code status user guestPhone createdAt duration');
    
    const recentUsers = await User.find({ company: companyId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt');

    // Calculate cost savings (if available from settings)
    const company = await Company.findById(companyId);
    const costPerCall = company?.settings?.costPerCall || 0;
    const totalSavings = successfulCalls * costPerCall;
    
    return NextResponse.json({
      overview: {
        users: {
          total: totalUsers,
          active: activeUsers,
          growth: 0 // Can be calculated if needed
        },
        calls: {
          total: totalCalls,
          successful: successfulCalls,
          active: activeCalls,
          successRate: successRate,
          growth: callsGrowth
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          monthly: monthlyRevenue[0]?.total || 0,
          growth: revenueGrowth
        },
        satisfaction: {
          averageRating: averageRating[0]?.avg || 0,
          totalReviews: await Review.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
          })
        },
        licenses: {
          total: totalLicenses,
          active: activeLicenses,
          utilization: totalUsers > 0 ? (activeLicenses / totalUsers * 100) : 0
        },
        savings: {
          total: totalSavings,
          currency: 'NOK'
        }
      },
      recentActivity: {
        calls: recentCalls.map(call => ({
          id: call._id,
          roomCode: call.code,
          status: call.status,
          agent: call.user ? 
            `${call.user.firstName} ${call.user.lastName}` : 
            'Ingen agent',
          customerPhone: call.guestPhone || 'Ukjent',
          duration: call.duration || 0,
          createdAt: call.createdAt
        })),
        users: recentUsers.map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }))
      },
      period: {
        days: period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard overview' 
    }, { status: 500 });
  }
}