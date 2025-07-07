import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// We intentionally create a lightweight admin client on every request because
// the route will be invoked very rarely (account deletion). This avoids
// keeping a global singleton that might inadvertently leak the service role
// key in serialized output.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid userId' }, { status: 400 });
    }

    // Permanently delete the user. The API defaults to hard-delete when the
    // optional body is omitted, which avoids the JSON parsing error returned
    // by the GoTrue server when it receives an unexpected object.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Admin user deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // After successful deletion, attempt to send confirmation email (best-effort)
    if (email && typeof email === 'string') {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: 'Privault <no-reply@privault.shop>',
            to: email,
            subject: 'Your Privault account has been deleted',
            html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Account Deleted</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;padding:40px 0"><table role="presentation" style="max-width:600px;margin:auto;background:white;border-radius:8px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,#f97316 0%,#f59e0b 100%);padding:40px;text-align:center;color:white"><h1 style="margin:0 0 10px;font-size:28px;font-weight:700">Account Deleted</h1><p style="margin:0;font-size:16px">Confirmation of deletion</p></td></tr><tr><td style="padding:40px 30px;color:#374151;font-size:16px;line-height:24px"><p>Hi,</p><p>This email confirms that your Privault account and all associated data have been permanently removed.</p><p>If this was not you or you have any concerns, please contact our support team immediately.</p><p style="margin-top:30px;color:#6b7280;font-size:14px">Thank you for trying Privault.<br/>— The Privault Team</p></td></tr></table></body></html>`
          });
        } catch (mailErr) {
          console.error('Account deletion email error:', mailErr);
        }
      } else {
        console.warn('RESEND_API_KEY not set; deletion confirmation email skipped');
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete-user route failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 