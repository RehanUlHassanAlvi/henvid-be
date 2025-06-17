import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import Review from '../../models/Review';
import User from '../../models/User';
import Company from '../../models/Company';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company');
    const userId = searchParams.get('user');
    const rating = searchParams.get('rating');
    const verified = searchParams.get('verified');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    const query: any = {};
    if (companyId) query.company = companyId;
    if (userId) query.user = userId;
    if (rating) query.rating = parseInt(rating);
    if (verified !== null) query.verified = verified === 'true';
    
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName image email')
      .populate('company', 'name logo')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments(query);
    
    // Calculate review statistics
    const stats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    // Count reviews by rating
    const ratingCounts = await Review.aggregate([
      { $match: query },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      id: review._id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      user: review.user,
      company: review.company,
      verified: review.verified,
      helpful: review.helpful || 0,
      reported: review.reported || 0,
      response: review.response,
      responseDate: review.responseDate,
      tags: review.tags || [],
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    }));
    
    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      statistics: {
        averageRating: stats[0]?.averageRating || 0,
        totalReviews: stats[0]?.totalReviews || 0,
        ratingCounts: ratingCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { 
      rating, 
      title, 
      content, 
      userId, 
      companyId, 
      tags,
      callId // Optional: if review is for a specific call
    } = await request.json();
    
    // Validate required fields
    if (!rating || !title || !content || !userId || !companyId) {
      return NextResponse.json({ 
        error: 'Rating, title, content, user, and company are required' 
      }, { status: 400 });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5' 
      }, { status: 400 });
    }
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Validate company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }
    
    // Check if user has already reviewed this company (optional business rule)
    const existingReview = await Review.findOne({ user: userId, company: companyId });
    if (existingReview) {
      return NextResponse.json({ 
        error: 'You have already reviewed this company' 
      }, { status: 409 });
    }
    
    // Create review
    const review = new Review({
      rating,
      title,
      content,
      user: userId,
      company: companyId,
      tags: tags || [],
      callId: callId || null,
      verified: false, // Reviews need to be verified by admin
      helpful: 0,
      reported: 0
    });
    
    await review.save();
    
    // Update user's review count
    await User.findByIdAndUpdate(userId, {
      $inc: { reviewCount: 1 }
    });
    
    // Update company's review stats
    const companyStats = await Review.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    if (companyStats.length > 0) {
      await Company.findByIdAndUpdate(companyId, {
        averageRating: companyStats[0].averageRating,
        totalReviews: companyStats[0].totalReviews
      });
    }
    
    // Populate for response
    await review.populate('user', 'firstName lastName image');
    await review.populate('company', 'name logo');
    
    return NextResponse.json(review, { status: 201 });
    
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ 
      error: 'Failed to create review' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');
    
    if (!reviewId) {
      return NextResponse.json({ 
        error: 'Review ID is required' 
      }, { status: 400 });
    }
    
    const updates = await request.json();
    
    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.id;
    delete updates.user;
    delete updates.company;
    delete updates.createdAt;
    delete updates.helpful;
    delete updates.reported;
    
    // Validate rating if being updated
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5' 
      }, { status: 400 });
    }
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName image')
     .populate('company', 'name logo');
    
    if (!review) {
      return NextResponse.json({ 
        error: 'Review not found' 
      }, { status: 404 });
    }
    
    // Update company stats if rating changed
    if (updates.rating) {
      const companyStats = await Review.aggregate([
        { $match: { company: review.company._id } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);
      
      if (companyStats.length > 0) {
        await Company.findByIdAndUpdate(review.company._id, {
          averageRating: companyStats[0].averageRating
        });
      }
    }
    
    return NextResponse.json(review);
    
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json({ 
      error: 'Failed to update review' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');
    
    if (!reviewId) {
      return NextResponse.json({ 
        error: 'Review ID is required' 
      }, { status: 400 });
    }
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ 
        error: 'Review not found' 
      }, { status: 404 });
    }
    
    const userId = review.user;
    const companyId = review.company;
    
    // Delete the review
    await Review.findByIdAndDelete(reviewId);
    
    // Update user's review count
    await User.findByIdAndUpdate(userId, {
      $inc: { reviewCount: -1 }
    });
    
    // Update company's review stats
    const companyStats = await Review.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    await Company.findByIdAndUpdate(companyId, {
      averageRating: companyStats[0]?.averageRating || 0,
      totalReviews: companyStats[0]?.totalReviews || 0
    });
    
    return NextResponse.json({ 
      message: 'Review deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete review' 
    }, { status: 500 });
  }
} 