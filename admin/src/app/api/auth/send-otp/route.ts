import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { otpStore } from '@/lib/otpStore';

// Allowed admin emails (add yours here)
const ALLOWED_EMAILS = (process.env.ADMIN_EMAILS || 'admin@raanicloset.com').split(',').map(e => e.trim().toLowerCase());

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return NextResponse.json({ success: false, message: 'Valid email required' }, { status: 400 });
    }

    // Check if email is authorized
    if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
      return NextResponse.json({ success: false, message: 'Email not authorized' }, { status: 403 });
    }

    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(normalizedEmail, { otp, expires });

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not account password)
      },
    });

    const mailOptions = {
      from: `"Raani Closet VIP" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Your Exclusive Access Pass - Raani Closet',
      html: `
        <div style="font-family: 'Times New Roman', serif; background-color: #0F060D; padding: 50px 20px; text-align: center; background-image: radial-gradient(circle at 50% 0%, #3a1628 0%, #0F060D 70%);">
          <div style="max-width: 500px; margin: 0 auto; background-color: rgba(10, 5, 8, 0.9); color: #F9F6F0; border: 1px solid #CBA153; border-radius: 4px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            
            <!-- Header Area -->
            <div style="padding: 40px 0 20px 0; border-bottom: 1px solid rgba(203, 161, 83, 0.3);">
              <h1 style="font-size: 32px; letter-spacing: 8px; color: #CBA153; text-transform: uppercase; margin: 0; font-weight: normal; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Raani</h1>
              <p style="font-size: 11px; letter-spacing: 6px; color: #888; text-transform: uppercase; margin: 10px 0 0 0;">Atelier Command</p>
            </div>

            <!-- Greeting Area -->
            <div style="padding: 40px 30px;">
              <h2 style="font-size: 24px; color: #F9F6F0; margin-top: 0; font-weight: normal; font-style: italic;">Welcome to the Inner Circle.</h2>
              <p style="font-size: 14px; color: #CCC; line-height: 1.8; margin-bottom: 40px; font-family: Arial, sans-serif;">
                We have prepared the command center for your arrival. To authenticate your identity and unlock the Atelier, please use your exclusive digital key below.
              </p>

              <!-- OTP Box -->
              <div style="background-color: rgba(203, 161, 83, 0.05); border: 1px solid #CBA153; padding: 30px; margin-bottom: 40px;">
                <p style="font-size: 10px; letter-spacing: 4px; color: #CBA153; text-transform: uppercase; margin: 0 0 15px 0; font-family: Arial, sans-serif;">Digital Access Key</p>
                <div style="font-size: 48px; letter-spacing: 16px; color: #FFF; font-weight: 300;">${otp}</div>
              </div>

              <p style="font-size: 12px; color: #666; font-family: Arial, sans-serif; font-style: italic;">
                This key will dissolve in 10 minutes. <br>Please do not share this transmission.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #050102; padding: 20px; border-top: 1px solid #1a1a1a;">
              <p style="font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: 3px; margin: 0; font-family: Arial, sans-serif;">
                Maison Raani © 2026
              </p>
            </div>
            
          </div>
        </div>
      `,
    };

    // DEV MODE: if no Gmail credentials or dummy credentials, just log OTP to console
    if (
      !process.env.GMAIL_USER || 
      !process.env.GMAIL_APP_PASSWORD ||
      process.env.GMAIL_USER.includes('your-gmail') ||
      process.env.GMAIL_APP_PASSWORD.includes('your-16-char')
    ) {
      console.log(`\n🔐 [DEV MODE] OTP for ${normalizedEmail}: ${otp}\n`);
      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent (check server console in dev mode)',
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: 'OTP sent to your email' });

  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send OTP (Check your Gmail App Password in .env.local)' }, { status: 500 });
  }
}

