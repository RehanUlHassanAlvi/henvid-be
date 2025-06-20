import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../utils/dbConnect';
import Session from '../../../models/Session';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  console.log('🚪 Logout API called');
  await dbConnect();
  
  try {
    // Get token from cookies or Authorization header (using correct cookie name)
    const cookieToken = request.cookies.get('auth-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '');
    
    const token = cookieToken || bearerToken;
    console.log('🔑 Token present:', !!token);
    console.log('🍪 Checking cookie name: auth-token');
    
    // If we have a token, try to verify and terminate session
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log('✅ Token valid, user:', decoded.userId);
        
        // Find and terminate the session
        const session = await Session.findOne({ 
          token,
          user: decoded.userId,
          isActive: true 
        });
        
        if (session) {
          await session.terminate('user_logout');
          console.log('🗑️ Session terminated');
        } else {
          console.log('⚠️ No active session found');
        }
      } catch (tokenError) {
        // Token is invalid/expired, but that's OK for logout
        console.log('⚠️ Invalid token during logout (continuing anyway):', tokenError instanceof Error ? tokenError.message : 'Unknown error');
      }
    } else {
      console.log('⚠️ No token provided (continuing anyway)');
    }
    
    // Always clear cookies regardless of token validity (using correct cookie names)
    const response = NextResponse.json({ 
      message: 'Logged out successfully' 
    });
    
    // Clear the auth-token cookie (the one actually used by other APIs)
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });
    
    // Also clear legacy token cookie (just in case)
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });
    
    console.log('✅ Logout completed successfully - cleared auth-token cookie');
    return response;
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Even if there's an error, still try to clear cookies
    const response = NextResponse.json({ 
      message: 'Logged out (with errors, but cookies cleared)' 
    });
    
    // Clear both cookie names
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  }
} 