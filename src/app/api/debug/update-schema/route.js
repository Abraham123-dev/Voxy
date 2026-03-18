import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Attempt to add is_read column to messages
    try {
      await db.query('ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false');
      console.log('Added is_read column to messages');
    } catch (e) {
      console.error('Error adding is_read column:', e.message);
    }

    // Attempt to add last_read_at to conversations or users?
    // Actually is_read per message is enough if we know who it was sent to.
    
    // Better: add a 'hidden_for' approach? No, we already have that.
    
    // Let's just use is_read. But who read it?
    // If sender_type is 'customer', it's unread for 'owner'.
    // If sender_type is 'owner' or 'ai', it's unread for 'customer'.

    return NextResponse.json({ success: true, message: 'Schema updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
