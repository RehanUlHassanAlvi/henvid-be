import { NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import License from '../../models/License';

export async function GET() {
  await dbConnect();
  try {
    const licenses = await License.find();
    return NextResponse.json(licenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
  }
} 