import { NextResponse } from 'next/server';
import { isAdmin, adminError } from '@/lib/adminAuth';
import { getAdminDb } from '@/lib/supabase';

export async function GET(request) {
  const auth = await isAdmin();
  if (!auth.authorized) return adminError(auth.error, auth.status);

  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  };

  const stream = new ReadableStream({
    async start(controller) {
      const supabase = getAdminDb();
      const encoder = new TextEncoder();

      const sendEvent = (data) => {
        if (request.signal.aborted) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          console.warn('[SSE] Controller disconnected');
        }
      };

      let lastChecked = new Date().toISOString();

      const interval = setInterval(async () => {
        if (request.signal.aborted) {
          clearInterval(interval);
          return;
        }
        try {
          const { data: alerts } = await supabase
            .from('alerts')
            .select('*, businesses(name)')
            .gt('created_at', lastChecked)
            .order('created_at', { ascending: true });

          if (alerts && alerts.length > 0) {
            alerts.forEach(alert => sendEvent({ type: 'alert', data: alert }));
          }

          const { data: logs } = await supabase
            .from('usage_logs')
            .select('*, businesses(name)')
            .gt('created_at', lastChecked)
            .order('created_at', { ascending: true });

          if (logs && logs.length > 0) {
            logs.forEach(log => sendEvent({ type: 'usage', data: log }));
          }

          lastChecked = new Date().toISOString();
        } catch (error) {
          console.error('[SSE] Broadcast Error:', error);
        }
      }, 3000);

      const keepAlive = setInterval(() => {
        if (!request.signal.aborted) {
          try {
            controller.enqueue(encoder.encode(': keep-alive\n\n'));
          } catch (e) {}
        } else {
          clearInterval(keepAlive);
        }
      }, 30000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(keepAlive);
        try { controller.close(); } catch (e) {}
      });
    },
  });

  return new NextResponse(stream, { headers: responseHeaders });
}
