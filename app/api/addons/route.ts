import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../utils/dbConnect';
import Addon from '../../models/Addon';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');
    const featured = searchParams.get('featured');
    
    const query: any = { isActive: true };
    if (category) query.category = category;
    if (available !== null) query.available = available === 'true';
    if (featured !== null) query.featured = featured === 'true';
    
    const addons = await Addon.find(query)
      .populate('config.dependencies')
      .sort({ featured: -1, sortOrder: 1, name: 1 });
    
    return NextResponse.json(addons);
  } catch (error) {
    console.error('Addon fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch addons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }
    
    const addon = new Addon(data);
    await addon.save();
    
    return NextResponse.json(addon, { status: 201 });
  } catch (error) {
    console.error('Addon creation error:', error);
    return NextResponse.json({ error: 'Failed to create addon' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const addonId = searchParams.get('id');
    
    if (!addonId) {
      return NextResponse.json({ error: 'Addon ID is required' }, { status: 400 });
    }
    
    const data = await request.json();
    
    const addon = await Addon.findByIdAndUpdate(
      addonId,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!addon) {
      return NextResponse.json({ error: 'Addon not found' }, { status: 404 });
    }
    
    return NextResponse.json(addon);
  } catch (error) {
    console.error('Addon update error:', error);
    return NextResponse.json({ error: 'Failed to update addon' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const addonId = searchParams.get('id');
    
    if (!addonId) {
      return NextResponse.json({ error: 'Addon ID is required' }, { status: 400 });
    }
    
    // Soft delete by setting isActive to false
    const addon = await Addon.findByIdAndUpdate(
      addonId,
      { isActive: false, deprecatedAt: new Date() },
      { new: true }
    );
    
    if (!addon) {
      return NextResponse.json({ error: 'Addon not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Addon deleted successfully' });
  } catch (error) {
    console.error('Addon deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete addon' }, { status: 500 });
  }
} 