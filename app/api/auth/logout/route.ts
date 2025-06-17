import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import Session from '../../../models/Session';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    // Get token from cookies or Authorization header
    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '');
    
    const token = cookieToken || bearerToken;
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No token provided' 
      }, { status: 401 });
    }
    
    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 401 });
    }
    
    // Find and terminate the session
    const session = await Session.findOne({ 
      token,
      user: decoded.userId,
      isActive: true 
    });
    
    if (session) {
      await session.terminate('user_logout');
    }
    
    // Clear cookies
    const response = NextResponse.json({ 
      message: 'Logged out successfully' 
    });
    
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });
    
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 