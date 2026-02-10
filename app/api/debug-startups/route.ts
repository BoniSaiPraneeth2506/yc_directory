import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { debugStartupReferences } from '@/lib/debug-startups';

/**
 * Debug API to check what's wrong with liked/saved posts
 * 
 * Visit: http://localhost:3000/api/debug-startups
 */

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const results = await debugStartupReferences(session.id);

    return NextResponse.json({
      success: true,
      userId: session.id,
      userName: session.user?.name,
      ...results
    });

  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
