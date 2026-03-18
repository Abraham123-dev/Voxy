import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    // Check conversation ownership/access
    const convRes = await db.query(
      `SELECT c.*, b.owner_id 
       FROM conversations c 
       JOIN businesses b ON c.business_id = b.id 
       WHERE c.id = $1`,
      [conversationId]
    );

    if (convRes.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    const conv = convRes.rows[0];
    const isCustomer = user.id === conv.customer_id;
    const isOwner = user.id === conv.owner_id;

    if (!isCustomer && !isOwner) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const clearColumn = isCustomer ? 'customer_cleared_at' : 'business_cleared_at';

    // Update the clear timestamp to NOW
    await db.query(
      `UPDATE conversations SET ${clearColumn} = CURRENT_TIMESTAMP WHERE id = $1`,
      [conversationId]
    );

    return NextResponse.json({ success: true, message: 'Chat cleared successfully' });

  } catch (error) {
    console.error('Clear Chat API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
