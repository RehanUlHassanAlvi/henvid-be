import { NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import VideoCall from '../../models/VideoCall';

export async function GET() {
  await dbConnect();
  try {
    const calls = await VideoCall.find();
    return NextResponse.json(calls);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch video calls' }, { status: 500 });
  }
} 