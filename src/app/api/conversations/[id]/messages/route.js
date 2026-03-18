import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const convRes = await db.query(
      `SELECT c.*, b.owner_id 
       FROM conversations c 
       JOIN businesses b ON c.business_id = b.id 
       WHERE c.id = $1`,
      [id]
    );

    if (convRes.rowCount === 0) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const conv = convRes.rows[0];
    const isCustomer = user.id === conv.customer_id;
    const isOwner = user.id === conv.owner_id;

    let clearedAt = null;
    if (isCustomer) {
      clearedAt = conv.customer_cleared_at;
    } else if (isOwner) {
      clearedAt = conv.business_cleared_at;
    }

    let query = 'SELECT * FROM messages WHERE conversation_id = $1';
    let queryParams = [id];

    if (clearedAt) {
      query += ' AND created_at > $2';
      queryParams.push(clearedAt);
    }

    query += ' ORDER BY created_at ASC';

    const result = await db.query(query, queryParams);

    return NextResponse.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, senderType, setStatus } = body;

    const result = await db.query(
      'INSERT INTO messages (conversation_id, sender_type, content) VALUES ($1, $2, $3) RETURNING *',
      [id, senderType, content]
    );

    // Update conversation's updated_at and optionally status
    if (setStatus) {
      await db.query(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP, status = $2 WHERE id = $1',
        [id, setStatus]
      );
    } else {
      await db.query(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: result.rows[0] 
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
