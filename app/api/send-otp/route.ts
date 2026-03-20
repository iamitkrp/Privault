import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Use the service-role key on the server so we can read auth.users
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PURPOSE_LABELS: Record<string, string> = {
    login: "Login Verification",
    vault_access: "Export Vault Data",
    vault_password_change: "Change Master Password",
    email_update: "Change Email Address",
    profile_delete: "Delete Account",
};

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];

        // Verify the user from the JWT
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code, purpose } = await req.json();

        if (!code || !purpose) {
            return NextResponse.json({ error: "Missing code or purpose" }, { status: 400 });
        }

        const purposeLabel = PURPOSE_LABELS[purpose] || purpose;

        // Send the OTP email via Resend
        const { error: emailError } = await resend.emails.send({
            from: "Privault <noreply@privault.shop>",
            to: user.email!,
            subject: `${code} is your Privault verification code`,
            html: `
                <div style="font-family: 'Courier New', monospace; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fafafa; border: 1px solid #e5e5e5;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="font-size: 20px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0; color: #1a1a1a;">
                            PRIVAULT<span style="color: #f97316;">.</span>
                        </h1>
                        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-top: 4px;">
                            Zero-Knowledge Vault
                        </p>
                    </div>

                    <div style="background: #fff; border: 1px solid #e5e5e5; padding: 24px; margin-bottom: 24px;">
                        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 0 0 8px 0;">
                            Action Requested
                        </p>
                        <p style="font-size: 14px; font-weight: 700; color: #1a1a1a; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                            ${purposeLabel}
                        </p>
                    </div>

                    <div style="text-align: center; background: #fff; border: 1px solid #e5e5e5; padding: 32px 24px; margin-bottom: 24px;">
                        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin: 0 0 16px 0;">
                            Your Verification Code
                        </p>
                        <p style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #1a1a1a; margin: 0; font-family: 'Courier New', monospace;">
                            ${code}
                        </p>
                        <p style="font-size: 11px; color: #888; margin: 16px 0 0 0;">
                            This code expires in <strong style="color: #1a1a1a;">10 minutes</strong>.
                        </p>
                    </div>

                    <div style="background: #fff8f0; border: 1px solid #fed7aa; padding: 16px; margin-bottom: 24px;">
                        <p style="font-size: 11px; color: #c2410c; margin: 0; line-height: 1.5;">
                            ⚠️ If you did not request this code, someone may be trying to access your account. 
                            Do not share this code with anyone.
                        </p>
                    </div>

                    <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e5e5;">
                        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #aaa; margin: 0;">
                            Privault Security System
                        </p>
                    </div>
                </div>
            `,
        });

        if (emailError) {
            console.error("Resend error:", emailError);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
