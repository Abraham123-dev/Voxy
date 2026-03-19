import { NextResponse } from 'next/server';
import { isAdmin, adminError } from '@/lib/adminAuth';
import db from '@/lib/db';

export async function GET() {
  try {
    const authStatus = await isAdmin();
    if (!authStatus.authorized) {
      return adminError(authStatus.error, authStatus.status);
    }

    // List all users who are strictly customers
    const result = await db.query(`
      SELECT u.id, u.email, u.name, u.role, u.created_at
      FROM users u
      WHERE u.role = 'customer' OR u.role IS NULL
      ORDER BY u.created_at DESC
    `);

    const customers = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'customer',
      created_at: user.created_at
    }));

    return NextResponse.json({
      success: true,
      customers
    });

  } catch (error) {
    console.error('Admin Customers List Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
