import { NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import User from '../../models/User';

export async function GET() {
  await dbConnect();
  try {
    const users = await User.find();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 