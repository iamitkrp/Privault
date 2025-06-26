import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { email, otpCode, purpose, expiresAt } = await request.json();

    if (!email || !otpCode || !purpose || !expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Resend API key from environment
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not found in environment variables');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    const purposeText = purpose === 'vault_access' ? 'Vault Access' : 'Vault Password Change';
    const expirationDate = new Date(expiresAt);
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin-bottom: 10px;">🔒 Privault Security</h1>
          <h2 style="color: #4b5563; font-size: 24px; margin: 0;">${purposeText} Verification</h2>
        </div>
        
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            Your verification code is:
          </p>
          <div style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 4px; font-family: monospace; background: white; padding: 15px; border-radius: 6px; border: 2px solid #3b82f6;">
            ${otpCode}
          </div>
        </div>
        
        <div style="color: #6b7280; font-size: 14px; text-align: center;">
          <p><strong>This code expires at:</strong> ${expirationDate.toLocaleString()}</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <p style="margin-top: 20px; font-size: 12px;">
            This is an automated message from Privault - Zero Knowledge Password Manager
          </p>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'Privault Security <noreply@privault.app>', // Change this to your verified domain
      to: email,
      subject: `Privault Security Code: ${otpCode}`,
      html: emailContent,
    });

    if (result.error) {
      console.error('Resend email error:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('✅ OTP email sent successfully via Resend:', result.data?.id);
    return NextResponse.json({ success: true, messageId: result.data?.id });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 