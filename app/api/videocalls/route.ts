import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import { VideoCall, User, Company } from '../../models';
import { TwilioVideoService } from '../../../utils/twilioService';
import { SMSService } from '../../../utils/smsService';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company');
    const userId = searchParams.get('user');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: any = {};
    if (companyId) query.company = companyId;
    if (userId) query.user = userId;
    if (status) query.status = status;

    const calls = await VideoCall.find(query)
      .populate('company', 'name logo')
      .populate('user', 'firstName lastName email')
      .populate('guest', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await VideoCall.countDocuments(query);

    return NextResponse.json({
      calls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch video calls error:', error);
    return NextResponse.json({ error: 'Failed to fetch video calls' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { phone, companyId, userId, guestName, message } = await request.json();
    
    // Validate required fields
    if (!phone) {
      return NextResponse.json({ 
        error: 'Phone number is required' 
      }, { status: 400 });
    }

    // Validate phone number format
    if (!SMSService.isValidNorwegianPhone(phone)) {
      return NextResponse.json({ 
        error: 'Invalid Norwegian phone number format' 
      }, { status: 400 });
    }

    // Get user and company info
    const user = userId ? await User.findById(userId).select('firstName lastName email') : null;
    const company = companyId ? await Company.findById(companyId).select('name logo') : null;

    if (companyId && !company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }

    // Generate unique room code
    const roomCode = TwilioVideoService.generateRoomCode(companyId);
    
    // Create video call record
    const videoCall = new VideoCall({
      code: roomCode,
      company: companyId,
      user: userId,
      guestPhone: SMSService.formatPhoneNumber(phone),
      guestName: guestName || 'Guest',
      status: 'pending'
    });

    await videoCall.save();

    // Send SMS invitation
    try {
      if (message) {
        // Send custom message
        await SMSService.sendCustomSMS(phone, message);
      } else {
        // Send default video call invitation
        await SMSService.sendVideoCallInvitation(
          phone,
          roomCode,
          company?.name || 'Henvid',
          user ? `${user.firstName} ${user.lastName}` : undefined
        );
      }
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Update video call status but don't fail the request
      videoCall.status = 'failed';
      videoCall.endReason = 'technical_issue';
      await videoCall.save();
      
      return NextResponse.json({
        error: 'Video call created but SMS invitation failed to send',
        videoCall,
        roomCode
      }, { status: 207 }); // 207 Multi-Status
    }

    // Generate access token for the host (user)
    let hostToken = null;
    if (userId) {
      const hostIdentity = TwilioVideoService.generateParticipantIdentity('host', userId);
      hostToken = TwilioVideoService.generateAccessToken(hostIdentity, roomCode);
    }

    return NextResponse.json({
      message: 'Video call initiated and SMS sent successfully',
      videoCall: {
        id: videoCall._id,
        code: roomCode,
        status: videoCall.status,
        guestPhone: videoCall.guestPhone,
        guestName: videoCall.guestName,
        createdAt: videoCall.createdAt
      },
      hostToken,
      roomUrl: `/${company?.name || 'call'}/${roomCode}`
    }, { status: 201 });

  } catch (error) {
    console.error('Create video call error:', error);
    return NextResponse.json({ 
      error: 'Failed to initiate video call' 
    }, { status: 500 });
  }
}