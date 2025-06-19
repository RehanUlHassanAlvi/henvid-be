import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import { VideoCall, User, Company } from '../../models';
import { TwilioVideoService } from '../../../utils/twilioService';
import { SMSService } from '../../../utils/smsService';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const company = searchParams.get('company');
    const user = searchParams.get('user');
    const status = searchParams.get('status');
    const roomCode = searchParams.get('roomCode');
    
    const query: any = {};
    
    // Filter by company
    if (company) {
      query.company = company;
    }
    
    // Filter by user (support agent)
    if (user) {
      query.supportAgent = user;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Search by room code
    if (roomCode) {
      query.roomCode = { $regex: roomCode, $options: 'i' };
    }
    
    const videoCalls = await VideoCall.find(query)
      .populate('company', 'name logo')
      .populate('supportAgent', 'firstName lastName email image')
      .populate('customer', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await VideoCall.countDocuments(query);
    
    // Format calls for frontend
    const formattedCalls = videoCalls.map(call => ({
      id: call._id,
      roomCode: call.roomCode,
      status: call.status,
      company: call.company,
      supportAgent: call.supportAgent,
      customer: call.customer,
      customerPhone: call.customerPhone,
      customerEmail: call.customerEmail,
      customerName: call.customerName,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      duration: call.duration,
      quality: call.quality,
      waitingTime: call.waitingTime,
      responseTime: call.responseTime,
      reconnections: call.reconnections,
      screenshareUsed: call.screenshareUsed,
      problemSolved: call.problemSolved,
      rating: call.rating,
      review: call.review,
      tags: call.tags,
      createdAt: call.createdAt,
      updatedAt: call.updatedAt
    }));
    
    return NextResponse.json({
      videoCalls: formattedCalls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Fetch video calls error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch video calls' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { 
      roomCode,
      companyId,
      supportAgentId,
      customerPhone,
      customerEmail,
      customerName,
      initiatedBy
    } = await request.json();
    
    // Validate required fields
    if (!roomCode || !companyId) {
      return NextResponse.json({ 
        error: 'Room code and company ID are required' 
      }, { status: 400 });
    }
    
    // Validate company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }
    
    // Validate support agent if provided
    if (supportAgentId) {
      const supportAgent = await User.findById(supportAgentId);
      if (!supportAgent) {
        return NextResponse.json({ 
          error: 'Support agent not found' 
        }, { status: 404 });
      }
    }
    
    // Check if room code already exists for active calls
    const existingCall = await VideoCall.findOne({ 
      roomCode, 
      status: { $in: ['initiated', 'started'] }
    });
    
    if (existingCall) {
      return NextResponse.json({ 
        error: 'Room code already in use for an active call' 
      }, { status: 409 });
    }
    
    // Generate room code if not provided
    const finalRoomCode = roomCode || generateRoomCode();
    
    // Create video call
    const videoCall = new VideoCall({
      roomCode: finalRoomCode,
      company: companyId,
      supportAgent: supportAgentId || null,
      customerPhone,
      customerEmail,
      customerName,
      status: 'initiated',
      initiatedBy: initiatedBy || 'agent',
      callType: 'support',
      waitingTime: 0,
      responseTime: 0,
      reconnections: 0,
      screenshareUsed: false,
      problemSolved: false
    });
    
    await videoCall.save();
    
    // Populate for response
    await videoCall.populate('company', 'name logo');
    if (supportAgentId) {
      await videoCall.populate('supportAgent', 'firstName lastName email image');
    }
    
    const callResponse = {
      id: videoCall._id,
      roomCode: videoCall.roomCode,
      status: videoCall.status,
      company: videoCall.company,
      supportAgent: videoCall.supportAgent,
      customerPhone: videoCall.customerPhone,
      customerEmail: videoCall.customerEmail,
      customerName: videoCall.customerName,
      initiatedBy: videoCall.initiatedBy,
      callType: videoCall.callType,
      createdAt: videoCall.createdAt
    };
    
    return NextResponse.json(callResponse, { status: 201 });
    
  } catch (error) {
    console.error('Create video call error:', error);
    return NextResponse.json({ 
      error: 'Failed to create video call' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('id');
    
    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 });
    }
    
    const updateData = await request.json();
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.roomCode; // Room code shouldn't change
    
    // Handle status transitions
    if (updateData.status) {
      const currentCall = await VideoCall.findById(callId);
      if (!currentCall) {
        return NextResponse.json({ error: 'Call not found' }, { status: 404 });
      }
      
      // Update timestamps based on status changes
      if (updateData.status === 'started' && currentCall.status === 'initiated') {
        updateData.startedAt = new Date();
        updateData.waitingTime = Date.now() - currentCall.createdAt.getTime();
      } else if (updateData.status === 'ended' && currentCall.status === 'started') {
        updateData.endedAt = new Date();
        if (currentCall.startedAt) {
          updateData.duration = Date.now() - currentCall.startedAt.getTime();
        }
      }
    }
    
    // Update video call
    const videoCall = await VideoCall.findByIdAndUpdate(
      callId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('company', 'name logo')
    .populate('supportAgent', 'firstName lastName email image')
    .populate('customer', 'firstName lastName email phone');
    
    if (!videoCall) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }
    
    const callResponse = {
      id: videoCall._id,
      roomCode: videoCall.roomCode,
      status: videoCall.status,
      company: videoCall.company,
      supportAgent: videoCall.supportAgent,
      customer: videoCall.customer,
      customerPhone: videoCall.customerPhone,
      customerEmail: videoCall.customerEmail,
      customerName: videoCall.customerName,
      startedAt: videoCall.startedAt,
      endedAt: videoCall.endedAt,
      duration: videoCall.duration,
      quality: videoCall.quality,
      rating: videoCall.rating,
      review: videoCall.review,
      problemSolved: videoCall.problemSolved,
      createdAt: videoCall.createdAt,
      updatedAt: videoCall.updatedAt
    };
    
    return NextResponse.json(callResponse);
    
  } catch (error) {
    console.error('Update video call error:', error);
    return NextResponse.json({ 
      error: 'Failed to update video call' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('id');
    
    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 });
    }
    
    const videoCall = await VideoCall.findById(callId);
    if (!videoCall) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }
    
    // Only allow cancellation of initiated calls or soft delete of ended calls
    if (videoCall.status === 'started') {
      return NextResponse.json({ 
        error: 'Cannot delete active call. End the call first.' 
      }, { status: 400 });
    }
    
    // Soft delete
    await VideoCall.findByIdAndUpdate(callId, {
      status: 'cancelled',
      cancelledAt: new Date()
    });
    
    return NextResponse.json({ 
      message: 'Video call cancelled successfully' 
    });
    
  } catch (error) {
    console.error('Delete video call error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete video call' 
    }, { status: 500 });
  }
}

// Helper function to generate room codes
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}