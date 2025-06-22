import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import { Comment, VideoCall, User } from '../../models';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const videoCallId = searchParams.get('videoCall');
    const userId = searchParams.get('user');
    const search = searchParams.get('search');
    
    const query: any = {};
    
    // Filter by video call
    if (videoCallId) {
      query.videoCall = videoCallId;
    }
    
    // Filter by user
    if (userId) {
      query.user = userId;
    }
    
    // Search in comment content
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }
    
    const comments = await Comment.find(query)
      .populate('user', 'firstName lastName email image role')
      .populate('videoCall', 'code status company')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Comment.countDocuments(query);
    
    // Format comments for frontend
    const formattedComments = comments.map(comment => ({
      id: comment._id,
      content: comment.content,
      type: comment.type,
      user: comment.user,
      videoCall: comment.videoCall,
      timestamp: comment.timestamp,
      isInternal: comment.isInternal,
      tags: comment.tags,
      metadata: comment.metadata,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }));
    
    return NextResponse.json({
      comments: formattedComments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch comments' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { 
      content,
      type,
      userId,
      videoCallId,
      isInternal,
      tags,
      metadata
    } = await request.json();
    
    // Validate required fields
    if (!content || !userId) {
      return NextResponse.json({ 
        error: 'Content and user ID are required' 
      }, { status: 400 });
    }
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Validate video call if provided
    if (videoCallId) {
      const videoCall = await VideoCall.findById(videoCallId);
      if (!videoCall) {
        return NextResponse.json({ 
          error: 'Video call not found' 
        }, { status: 404 });
      }
    }
    
    // Create comment
    const comment = new Comment({
      content,
      type: type || 'general',
      user: userId,
      videoCall: videoCallId || null,
      timestamp: new Date(),
      isInternal: isInternal || false,
      tags: tags || [],
      metadata: metadata || {}
    });
    
    await comment.save();
    
    // Populate for response
    await comment.populate('user', 'firstName lastName email image role');
    if (videoCallId) {
      await comment.populate('videoCall', 'code status company');
    }
    
    const commentResponse = {
      id: comment._id,
      content: comment.content,
      type: comment.type,
      user: comment.user,
      videoCall: comment.videoCall,
      timestamp: comment.timestamp,
      isInternal: comment.isInternal,
      tags: comment.tags,
      metadata: comment.metadata,
      createdAt: comment.createdAt
    };
    
    return NextResponse.json(commentResponse, { status: 201 });
    
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ 
      error: 'Failed to create comment' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    
    const updateData = await request.json();
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.user; // User shouldn't change
    delete updateData.videoCall; // Video call association shouldn't change
    
    // Update comment
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('user', 'firstName lastName email image role')
    .populate('videoCall', 'code status company');
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    const commentResponse = {
      id: comment._id,
      content: comment.content,
      type: comment.type,
      user: comment.user,
      videoCall: comment.videoCall,
      timestamp: comment.timestamp,
      isInternal: comment.isInternal,
      tags: comment.tags,
      metadata: comment.metadata,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
    
    return NextResponse.json(commentResponse);
    
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json({ 
      error: 'Failed to update comment' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    // Hard delete for comments (they don't need to be preserved)
    await Comment.findByIdAndDelete(commentId);
    
    return NextResponse.json({ 
      message: 'Comment deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete comment' 
    }, { status: 500 });
  }
} 