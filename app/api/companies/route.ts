import { NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import Company from '../../models/Company';

export async function GET() {
  await dbConnect();
  try {
    const companies = await Company.find();
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
} 