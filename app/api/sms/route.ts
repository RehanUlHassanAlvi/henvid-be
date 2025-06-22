import { NextRequest, NextResponse } from 'next/server';
import { SMSService } from '../../../utils/smsService';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      return NextResponse.json({ 
        error: 'Phone number and message are required' 
      }, { status: 400 });
    }

    // Validate phone number format
    if (!SMSService.isValidNorwegianPhone(phone)) {
      return NextResponse.json({ 
        error: 'Invalid Norwegian phone number format' 
      }, { status: 400 });
    }

    // Send SMS
    // await SMSService.sendCustomSMS(phone, message);
    
    // For testing purposes - simulate SMS sending with delay
    console.log(`[TEST MODE] Would send SMS to ${phone}: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

    return NextResponse.json({ 
      success: true,
      message: 'SMS sent successfully (test mode)'
    });

  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send SMS'
    }, { status: 500 });
  }
} 