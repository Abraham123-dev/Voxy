import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromCookie } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { ai_enabled } = await req.json();

    if (typeof ai_enabled !== 'boolean') {
      return NextResponse.json({ success: false, error: 'ai_enabled must be a boolean' }, { status: 400 });
    }

    await db.query(
      'UPDATE conversations SET ai_enabled = $1 WHERE id = $2',
      [ai_enabled, id]
    );

    return NextResponse.json({ success: true, ai_enabled });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
