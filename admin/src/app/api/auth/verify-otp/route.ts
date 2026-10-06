import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    const normalizedEmail = email?.trim().toLowerCase();

    const stored = otpStore.get(normalizedEmail);

    if (!stored) {
      return NextResponse.json({ success: false, message: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(normalizedEmail);
      return NextResponse.json({ success: false, message: 'OTP expired. Please request a new one.' }, { status: 400 });
    }

    if (stored.otp !== otp?.trim()) {
      return NextResponse.json({ success: false, message: 'Invalid OTP. Please try again.' }, { status: 401 });
    }

    // OTP valid — set session cookie
    otpStore.delete(normalizedEmail);
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
