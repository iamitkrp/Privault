import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { email, otpCode, purpose, expiresAt } = await request.json();

    console.log('📧 OTP Request Details:', {
      email,
      otpCode,
      purpose,
      expiresAt,
      timestamp: new Date().toISOString()
    });

    if (!email || !otpCode || !purpose || !expiresAt) {
      console.error('❌ Missing required fields:', { email, otpCode, purpose, expiresAt });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Resend API key from environment
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found in environment variables');
      console.log('Environment variables available:', Object.keys(process.env).filter(key => key.includes('RESEND')));
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    console.log('📧 Attempting to send OTP email to:', email);
    console.log('🔑 Resend API key found:', resendApiKey.substring(0, 10) + '...');

    const resend = new Resend(resendApiKey);

    const purposeText = purpose === 'vault_access' ? 'Vault Access' : 'Vault Password Change';
    const expirationDate = new Date(expiresAt);
    
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Privault Security Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: white;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
            <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 36px;">🔒</span>
            </div>
            <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Privault Security</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">${purposeText} Verification</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
              Hello,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
              You've requested access to your Privault vault. Please use the verification code below to proceed:
            </p>
            
            <!-- OTP Code Box -->
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                Your Verification Code
              </p>
              <div style="font-size: 36px; font-weight: bold; color: #1e293b; letter-spacing: 8px; font-family: 'Courier New', monospace; background: white; padding: 20px; border-radius: 8px; border: 2px solid #4f46e5; display: inline-block;">
                ${otpCode}
              </div>
            </div>
            
            <!-- Instructions -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">⚠️ Important Security Information</p>
              <ul style="color: #92400e; font-size: 14px; margin: 10px 0 0 0; padding-left: 20px;">
                <li>This code expires at: <strong>${expirationDate.toLocaleString()}</strong></li>
                <li>Never share this code with anyone</li>
                <li>Privault staff will never ask for this code</li>
              </ul>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 30px 0 0 0;">
              If you didn't request this verification, please ignore this email and ensure your account is secure.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 18px;">
              This is an automated security message from<br>
              <strong>Privault</strong> - Zero Knowledge Password Manager
            </p>
            <p style="color: #64748b; font-size: 11px; margin: 15px 0 0 0;">
              © ${new Date().getFullYear()} Privault. All rights reserved.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    console.log('📤 Sending email with Resend...');
    const result = await resend.emails.send({
      from: 'Privault <no-reply@privault.shop>', // Verified sender from your domain
      to: email,
      subject: `Privault Security Code: ${otpCode}`,
      html: emailContent,
    });

    if (result.error) {
      console.error('❌ Resend email error:', result.error);
      console.error('Error details:', JSON.stringify(result.error, null, 2));
      console.error('Full result object:', JSON.stringify(result, null, 2));
      
      // Check if this is the Resend testing mode limitation
      const errorMessage = result.error.message || '';
      const errorData = (result.error as { error?: string })?.error || '';
      
      if (errorMessage.includes('testing emails') || errorData.includes('testing emails')) {
        console.log('🧪 Development mode detected - logging OTP to console:', otpCode);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email service is in development mode', 
            fallback: true,
            message: 'Check browser console for OTP code'
          },
          { status: 200 } // Return 200 since we're providing a fallback
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send email', 
          details: result.error.message || (result.error as { error?: string })?.error || 'Unknown email service error'
        },
        { status: 500 }
      );
    }

    console.log('✅ OTP email sent successfully via Resend!');
    console.log('📬 Message ID:', result.data?.id);
    console.log('📧 Sent to:', email);
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.data?.id,
      message: 'OTP email sent successfully'
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 