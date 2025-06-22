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
      query.user = user;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Search by room code
    if (roomCode) {
      query.code = { $regex: roomCode, $options: 'i' };
    }
    
    const videoCalls = await VideoCall.find(query)
      .populate('company', 'name logo')
      .populate('user', 'firstName lastName email image')
      .populate('guest', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await VideoCall.countDocuments(query);
    
    // Format calls for frontend
    const formattedCalls = videoCalls.map(call => ({
      id: call._id,
      roomCode: call.code,
      status: call.status,
      company: call.company,
      supportAgent: call.user,
      customer: call.guest,
      customerPhone: call.guestPhone,
      customerEmail: call.guestEmail,
      customerName: call.guestName,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      duration: call.duration,
      quality: call.quality,
      waitingTime: call.waitingTime,
      responseTime: call.responseTime,
      reconnections: call.reconnections,
      screenshareUsed: call.screenshareUsed,
      problemSolved: call.problemSolved,
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
  console.log('🎯 Video call API POST endpoint hit!');
  await dbConnect();
  
  try {
    const body = await request.json();
    console.log('📥 Received request body:', body);
    
    const { 
      roomCode,
      companyId,
      supportAgentId,
      customerPhone,
      customerEmail,
      customerName,
      initiatedBy,
      // Parameters from VideoCallStarter component
      phone,
      userId,
      guestName
    } = body;
    
    // Handle both parameter formats for compatibility
    let finalCompanyId = companyId;
    if (!finalCompanyId && userId) {
      console.log('🔍 Looking up user company for userId:', userId);
      const user = await User.findById(userId).populate('company');
      console.log('👤 Found user:', user ? { id: user._id, company: user.company } : 'null');
      finalCompanyId = user?.company?._id || user?.company;
    }
    const finalSupportAgentId = supportAgentId || userId;
    const finalCustomerPhone = customerPhone || phone;
    const finalCustomerName = customerName || guestName || 'Guest';
    
    console.log('🔧 Final parameters:', {
      finalCompanyId,
      finalSupportAgentId,
      finalCustomerPhone,
      finalCustomerName
    });
    
    // Validate required fields
    if (!finalCompanyId) {
      console.log('❌ Missing company ID');
      return NextResponse.json({ 
        error: 'Company ID is required' 
      }, { status: 400 });
    }
    
    // Validate company exists
    const company = await Company.findById(finalCompanyId);
    if (!company) {
      console.log('❌ Company not found:', finalCompanyId);
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }
    console.log('🏢 Found company:', company.name);
    
    // Validate support agent if provided
    let supportAgent = null;
    if (finalSupportAgentId) {
      supportAgent = await User.findById(finalSupportAgentId);
      if (!supportAgent) {
        console.log('❌ Support agent not found:', finalSupportAgentId);
        return NextResponse.json({ 
          error: 'Support agent not found' 
        }, { status: 404 });
      }
      console.log('👨‍💼 Found support agent:', supportAgent.firstName, supportAgent.lastName);
    }
    
    // Generate room code if not provided
    const finalRoomCode = roomCode || generateRoomCode();
    console.log('🏠 Generated room code:', finalRoomCode);
    
    // Check if room code already exists for active calls
    const existingCall = await VideoCall.findOne({ 
      code: finalRoomCode, 
      status: { $in: ['pending', 'ringing', 'active'] }
    });
    
    if (existingCall) {
      console.log('❌ Room code already exists:', finalRoomCode);
      return NextResponse.json({ 
        error: 'Room code already in use for an active call' 
      }, { status: 409 });
    }
    
    // Create video call
    const videoCall = new VideoCall({
      code: finalRoomCode,
      company: finalCompanyId,
      user: finalSupportAgentId || null,
      guestPhone: finalCustomerPhone,
      guestName: finalCustomerName,
      status: 'pending',
      waitingTime: 0,
      responseTime: 0,
      reconnections: 0,
      screenshareUsed: false,
      problemSolved: false,
      metadata: {
        initiatedBy: initiatedBy || 'agent',
        callType: 'support'
      }
    });
    
    await videoCall.save();
    console.log('💾 Video call saved:', videoCall._id);
    
    // Send SMS to customer if phone number provided
    if (finalCustomerPhone) {
      try {
        console.log('📱 Sending SMS to:', finalCustomerPhone);
        const supportAgentName = supportAgent ? `${supportAgent.firstName} ${supportAgent.lastName}` : undefined;
        console.log('👤 Support agent name for SMS:', supportAgentName);
        console.log('🏢 Company name for SMS:', company.name);
        
        await SMSService.sendVideoCallInvitation(
          finalCustomerPhone,
          finalRoomCode,
          company.name,
          supportAgentName
        );
        console.log('✅ SMS sent successfully to:', finalCustomerPhone);
      } catch (smsError) {
        console.error('❌ Failed to send SMS:', smsError);
        // Don't fail the entire request if SMS fails
      }
    } else {
      console.log('⚠️ No phone number provided, skipping SMS');
    }
    
    // Populate for response
    await videoCall.populate('company', 'name logo');
    if (finalSupportAgentId) {
      await videoCall.populate('user', 'firstName lastName email image');
    }
    
    // Generate room URL for opening new page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const roomUrl = `${baseUrl}/${company.name}/${finalRoomCode}`;
    console.log('🌐 Generated room URL:', roomUrl);
    
    const callResponse = {
      id: videoCall._id,
      roomCode: videoCall.code,
      status: videoCall.status,
      company: videoCall.company,
      supportAgent: videoCall.user,
      customerPhone: videoCall.guestPhone,
      customerName: videoCall.guestName,
      createdAt: videoCall.createdAt,
      roomUrl: roomUrl,
      // Legacy format for VideoCallStarter compatibility
      videoCall: {
        code: videoCall.code,
        roomCode: videoCall.code
      }
    };
    
    console.log('✅ Sending response:', callResponse);
    return NextResponse.json(callResponse, { status: 201 });
    
  } catch (error) {
    console.error('💥 Create video call error:', error);
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
    delete updateData.code; // Room code shouldn't change
    
    // Handle status transitions
    if (updateData.status) {
      const currentCall = await VideoCall.findById(callId);
      if (!currentCall) {
        return NextResponse.json({ error: 'Call not found' }, { status: 404 });
      }
      
      // Update timestamps based on status changes
      if (updateData.status === 'active' && currentCall.status === 'pending') {
        updateData.startedAt = new Date();
        updateData.waitingTime = Date.now() - currentCall.createdAt.getTime();
      } else if (updateData.status === 'ended' && currentCall.status === 'active') {
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
    .populate('user', 'firstName lastName email image')
    .populate('guest', 'firstName lastName email phone');
    
    if (!videoCall) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }
    
    const callResponse = {
      id: videoCall._id,
      roomCode: videoCall.code,
      status: videoCall.status,
      company: videoCall.company,
      supportAgent: videoCall.user,
      customer: videoCall.guest,
      customerPhone: videoCall.guestPhone,
      customerEmail: videoCall.guestEmail,
      customerName: videoCall.guestName,
      startedAt: videoCall.startedAt,
      endedAt: videoCall.endedAt,
      duration: videoCall.duration,
      quality: videoCall.quality,
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
    
    // Only allow cancellation of pending calls or soft delete of ended calls
    if (videoCall.status === 'active') {
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