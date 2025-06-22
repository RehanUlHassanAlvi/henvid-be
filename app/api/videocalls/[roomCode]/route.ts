import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import { VideoCall } from '../../../models';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomCode: string } }
) {
  await dbConnect();
  
  try {
    const { roomCode } = params;
    
    if (!roomCode) {
      return NextResponse.json({ 
        error: 'Room code is required' 
      }, { status: 400 });
    }

    // Find the video call by room code
    const videoCall = await VideoCall.findOne({ code: roomCode })
      .populate('company', 'name logo')
      .populate('user', 'firstName lastName email image')
      .select('code status guestPhone guestEmail guestName company user startedAt endedAt createdAt');

    if (!videoCall) {
      return NextResponse.json({ 
        error: 'Video call not found' 
      }, { status: 404 });
    }

    // Format response
    const response = {
      id: videoCall._id,
      roomCode: videoCall.code,
      status: videoCall.status,
      customer: {
        phone: videoCall.guestPhone,
        email: videoCall.guestEmail,
        name: videoCall.guestName || 'Kunde',
        // Generate initials for avatar if no image
        initials: (videoCall.guestName || 'Kunde').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      },
      company: videoCall.company,
      supportAgent: videoCall.user,
      startedAt: videoCall.startedAt,
      endedAt: videoCall.endedAt,
      createdAt: videoCall.createdAt
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Fetch video call error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch video call details' 
    }, { status: 500 });
  }
} 