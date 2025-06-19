import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import { User, Company, VideoCall, License, Payment, Subscription, Review } from '../../models';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const companyId = searchParams.get('company');
    const period = searchParams.get('period') || '30'; // days
    
    // Date range for analytics
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
    
    const query: any = {};
    if (companyId) {
      query.company = companyId;
    }
    
    switch (type) {
      case 'overview':
        return await getOverviewDashboard(query, startDate, endDate);
      case 'revenue':
        return await getRevenueDashboard(query, startDate, endDate);
      case 'users':
        return await getUsersDashboard(query, startDate, endDate);
      case 'calls':
        return await getCallsDashboard(query, startDate, endDate);
      case 'licenses':
        return await getLicensesDashboard(query, startDate, endDate);
      default:
        return await getOverviewDashboard(query, startDate, endDate);
    }
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data' 
    }, { status: 500 });
  }
}

async function getOverviewDashboard(query: any, startDate: Date, endDate: Date) {
  // Get current period stats
  const [
    totalUsers,
    activeUsers,
    totalCompanies,
    activeCompanies,
    totalCalls,
    activeCalls,
    totalRevenue,
    monthlyRevenue,
    averageRating,
    totalLicenses
  ] = await Promise.all([
    User.countDocuments({ ...query, isActive: true }),
    User.countDocuments({ ...query, isActive: true, lastActivityAt: { $gte: startDate } }),
    Company.countDocuments({ ...query, isActive: true }),
    Company.countDocuments({ ...query, isActive: true, updatedAt: { $gte: startDate } }),
    VideoCall.countDocuments({ ...query, createdAt: { $gte: startDate, $lte: endDate } }),
    VideoCall.countDocuments({ ...query, status: 'started' }),
    Payment.aggregate([
      { $match: { ...query, status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { ...query, status: 'completed', createdAt: { $gte: new Date(endDate.getFullYear(), endDate.getMonth(), 1), $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Review.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]),
    License.countDocuments({ ...query, status: 'active' })
  ]);
  
  // Get previous period for comparison
  const prevStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
  const [
    prevTotalCalls,
    prevRevenue
  ] = await Promise.all([
    VideoCall.countDocuments({ ...query, createdAt: { $gte: prevStartDate, $lt: startDate } }),
    Payment.aggregate([
      { $match: { ...query, status: 'completed', createdAt: { $gte: prevStartDate, $lt: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);
  
  // Calculate growth rates
  const callsGrowth = prevTotalCalls > 0 ? ((totalCalls - prevTotalCalls) / prevTotalCalls * 100) : 0;
  const revenueGrowth = (prevRevenue[0]?.total || 0) > 0 ? 
    ((totalRevenue[0]?.total || 0) - (prevRevenue[0]?.total || 0)) / (prevRevenue[0]?.total || 0) * 100 : 0;
  
  // Get recent activity
  const recentCalls = await VideoCall.find(query)
    .populate('company', 'name logo')
    .populate('supportAgent', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);
  
  const recentUsers = await User.find({ ...query, isActive: true })
    .populate('company', 'name logo')
    .sort({ createdAt: -1 })
    .limit(5);
  
  return NextResponse.json({
    overview: {
      users: {
        total: totalUsers,
        active: activeUsers,
        growth: 0 // Calculate if needed
      },
      companies: {
        total: totalCompanies,
        active: activeCompanies
      },
      calls: {
        total: totalCalls,
        active: activeCalls,
        growth: callsGrowth
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0,
        growth: revenueGrowth
      },
      satisfaction: {
        averageRating: averageRating[0]?.avg || 0,
        totalReviews: await Review.countDocuments({ ...query, createdAt: { $gte: startDate, $lte: endDate } })
      },
      licenses: {
        total: totalLicenses,
        utilization: totalUsers > 0 ? (totalLicenses / totalUsers * 100) : 0
      }
    },
    recentActivity: {
      calls: recentCalls.map(call => ({
        id: call._id,
        roomCode: call.roomCode,
        status: call.status,
        company: call.company?.name,
        agent: call.supportAgent ? `${call.supportAgent.firstName} ${call.supportAgent.lastName}` : null,
        createdAt: call.createdAt
      })),
      users: recentUsers.map(user => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        company: user.company?.name,
        role: user.role,
        createdAt: user.createdAt
      }))
    }
  });
}

async function getRevenueDashboard(query: any, startDate: Date, endDate: Date) {
  // Revenue analytics
  const [
    totalRevenue,
    monthlyRevenue,
    revenueByPlan,
    paymentMethods,
    monthlyTrend
  ] = await Promise.all([
    Payment.aggregate([
      { $match: { ...query, status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { ...query, status: 'completed', createdAt: { $gte: new Date(endDate.getFullYear(), endDate.getMonth(), 1), $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { ...query, status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$description', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Payment.aggregate([
      { $match: { ...query, status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Payment.aggregate([
      { $match: { ...query, status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
      { 
        $group: { 
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);
  
  return NextResponse.json({
    revenue: {
      total: totalRevenue[0]?.total || 0,
      monthly: monthlyRevenue[0]?.total || 0,
      byPlan: revenueByPlan,
      byMethod: paymentMethods,
      monthlyTrend: monthlyTrend
    }
  });
}

async function getUsersDashboard(query: any, startDate: Date, endDate: Date) {
  const [
    userStats,
    usersByRole,
    userActivity,
    userGrowth
  ] = await Promise.all([
    User.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          verified: { $sum: { $cond: ['$emailVerified', 1, 0] } }
        }
      }
    ]),
    User.aggregate([
      { $match: query },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.aggregate([
      { $match: { ...query, lastActivityAt: { $gte: startDate } } },
      { 
        $group: { 
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$lastActivityAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]),
    User.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate, $lte: endDate } } },
      { 
        $group: { 
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])
  ]);
  
  return NextResponse.json({
    users: {
      stats: userStats[0] || { total: 0, active: 0, verified: 0 },
      byRole: usersByRole,
      activity: userActivity,
      growth: userGrowth
    }
  });
}

async function getCallsDashboard(query: any, startDate: Date, endDate: Date) {
  const [
    callStats,
    callsByStatus,
    callDurations,
    qualityDistribution,
    dailyCallVolume
  ] = await Promise.all([
    VideoCall.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate, $lte: endDate } } },
      { 
        $group: { 
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'ended'] }, 1, 0] } },
          avgDuration: { $avg: '$duration' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]),
    VideoCall.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    VideoCall.aggregate([
      { $match: { ...query, duration: { $gt: 0 }, createdAt: { $gte: startDate, $lte: endDate } } },
      { 
        $bucket: {
          groupBy: '$duration',
          boundaries: [0, 300000, 900000, 1800000, 3600000, Infinity], // 0-5min, 5-15min, 15-30min, 30-60min, 60min+
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]),
    VideoCall.aggregate([
      { $match: { ...query, quality: { $exists: true }, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$quality', count: { $sum: 1 } } }
    ]),
    VideoCall.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate, $lte: endDate } } },
      { 
        $group: { 
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])
  ]);
  
  return NextResponse.json({
    calls: {
      stats: callStats[0] || { total: 0, completed: 0, avgDuration: 0, avgRating: 0 },
      byStatus: callsByStatus,
      durations: callDurations,
      quality: qualityDistribution,
      dailyVolume: dailyCallVolume
    }
  });
}

async function getLicensesDashboard(query: any, startDate: Date, endDate: Date) {
  const [
    licenseStats,
    licensesByType,
    licenseUtilization,
    expiringLicenses
  ] = await Promise.all([
    License.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $ne: ['$user', null] }, 1, 0] } }
        }
      }
    ]),
    License.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    License.aggregate([
      { $match: { ...query, status: 'active' } },
      { 
        $group: { 
          _id: '$company',
          totalLicenses: { $sum: 1 },
          usedLicenses: { $sum: { $cond: [{ $ne: ['$user', null] }, 1, 0] } }
        }
      },
      { 
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      }
    ]),
    License.find({ 
      ...query, 
      status: 'active',
      validUntil: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // Expiring in 30 days
    })
    .populate('company', 'name')
    .populate('user', 'firstName lastName')
    .limit(10)
  ]);
  
  return NextResponse.json({
    licenses: {
      stats: licenseStats[0] || { total: 0, active: 0, assigned: 0 },
      byType: licensesByType,
      utilization: licenseUtilization,
      expiring: expiringLicenses.map(license => ({
        id: license._id,
        type: license.type,
        company: license.company?.name,
        user: license.user ? `${license.user.firstName} ${license.user.lastName}` : null,
        validUntil: license.validUntil
      }))
    }
  });
} 