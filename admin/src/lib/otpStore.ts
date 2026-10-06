export const otpStore = global.__otpStore || (global.__otpStore = new Map<string, { otp: string; expires: number }>());
