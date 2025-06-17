import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import { VideoCall } from '../../../models';
import { TwilioVideoService } from '../../../../utils/twilioService';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { roomCode, participantType, participantId, guestName } = await request.json();
    
    // Validate required fields
    if (!roomCode || !participantType) {
      return NextResponse.json({ 
        error: 'Room code and participant type are required' 
      }, { status: 400 });
    }

    // Validate room code format
    if (!TwilioVideoService.isValidRoomCode(roomCode)) {
      return NextResponse.json({ 
        error: 'Invalid room code format' 
      }, { status: 400 });
    }

    // Find the video call
    const videoCall = await VideoCall.findOne({ code: roomCode })
      .populate('company', 'name')
      .populate('user', 'firstName lastName');

    if (!videoCall) {
      return NextResponse.json({ 
        error: 'Video call not found' 
      }, { status: 404 });
    }

    // Check if call is still active/pending
    if (['ended', 'cancelled', 'failed'].includes(videoCall.status)) {
      return NextResponse.json({ 
        error: 'This video call has ended' 
      }, { status: 410 }); // Gone
    }

    // Generate participant identity
    let identity: string;
    if (participantType === 'host') {
      if (!participantId) {
        return NextResponse.json({ 
          error: 'Participant ID required for host' 
        }, { status: 400 });
      }
      identity = TwilioVideoService.generateParticipantIdentity('host', participantId);
    } else {
      // Guest participant
      const guestId = participantId || videoCall.guestPhone || 'guest';
      identity = TwilioVideoService.generateParticipantIdentity('guest', guestId);
      
      // Update video call with guest info if not already set
      if (guestName && !videoCall.guestName) {
        videoCall.guestName = guestName;
        await videoCall.save();
      }
    }

    // Generate access token
    const accessToken = TwilioVideoService.generateAccessToken(identity, roomCode);

    // Update video call status if it's the first time someone joins
    if (videoCall.status === 'pending') {
      videoCall.status = 'active';
      videoCall.startedAt = new Date();
      await videoCall.save();
    }

    return NextResponse.json({
      accessToken,
      identity,
      roomCode,
      roomName: roomCode, // Twilio uses roomName for the actual room
      participantType,
      videoCall: {
        id: videoCall._id,
        status: videoCall.status,
        company: videoCall.company,
        startedAt: videoCall.startedAt
      }
    });

  } catch (error) {
    console.error('Generate token error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate access token' 
    }, { status: 500 });
  }
} 