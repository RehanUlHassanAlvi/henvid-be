import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import { VideoCall, User, Review } from '../../../models';
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const companyId = searchParams.get('company') || currentUser.company?._id?.toString();
    
    if (!companyId) {
      return NextResponse.json({ error: 'No company context available' }, { status: 400 });
    }

    // Get video call history with support agent and review data
    const videoCalls = await VideoCall.find({ 
      company: companyId,
      status: { $in: ['ended', 'failed'] } // Only completed calls for history
    })
    .populate('supportAgent', 'firstName lastName')
    .populate({
      path: 'reviews',
      model: 'Review',
      select: 'rating ratingHelpfulness problemSolved content'
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

    const total = await VideoCall.countDocuments({ 
      company: companyId,
      status: { $in: ['ended', 'failed'] }
    });

    // Format data for the Log component
    const logEntries = await Promise.all(
      videoCalls.map(async (call, index) => {
        // Get review for this call
        const review = await Review.findOne({ 
          videoCall: call._id 
        }).select('rating ratingHelpfulness problemSolved content');

        // Calculate sequential ID (for display purposes)
        const sequentialId = total - (page - 1) * limit - index;

        // Format date in Norwegian format
        const formatNorwegianDate = (date: Date) => {
          return new Intl.DateTimeFormat('nb-NO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).format(date);
        };

        // Format duration in minutes
        const durationInMinutes = call.duration ? Math.round(call.duration / 60) : 0;

        // Format rating
        const ratingText = review?.rating ? `${review.rating}/5` : 'Ingen vurdering';

        return {
          id: sequentialId,
          callId: call._id,
          phone: call.customerPhone || 'Ukjent nummer',
          employee: call.supportAgent ? 
            `${call.supportAgent.firstName} ${call.supportAgent.lastName}` : 
            'Ingen agent',
          comment: review?.content || call.notes || '',
          date: formatNorwegianDate(call.createdAt),
          length: durationInMinutes,
          rating: ratingText,
          resolved: review?.problemSolved || call.status === 'ended',
          status: call.status,
          roomCode: call.roomCode,
          startedAt: call.startedAt,
          endedAt: call.endedAt,
          quality: call.quality,
          tags: call.tags || []
        };
      })
    );

    // Get summary statistics
    const stats = {
      totalCalls: total,
      resolvedCalls: await VideoCall.countDocuments({ 
        company: companyId,
        status: 'ended'
      }),
      averageDuration: videoCalls.length > 0 ? 
        videoCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / videoCalls.length / 60 : 0,
      averageRating: 0 // Will be calculated from reviews
    };

    // Calculate average rating
    const reviews = await Review.find({
      videoCall: { $in: videoCalls.map(call => call._id) }
    });
    
    if (reviews.length > 0) {
      stats.averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    }

    return NextResponse.json({
      entries: logEntries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      statistics: stats
    });
    
  } catch (error) {
    console.error('Video call history error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch video call history' 
    }, { status: 500 });
  }
} 