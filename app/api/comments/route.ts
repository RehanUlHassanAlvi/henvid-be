import { NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import Comment from '../../models/Comment';

export async function GET() {
  await dbConnect();
  try {
    const comments = await Comment.find();
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
} 