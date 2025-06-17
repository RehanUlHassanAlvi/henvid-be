import { NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import Review from '../../models/Review';

export async function GET() {
  await dbConnect();
  try {
    const reviews = await Review.find();
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
} 