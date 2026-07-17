import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google ID Token payload');
    }
    return {
      googleId: payload.sub,
      email: payload.email!,
      name: payload.name || payload.given_name || 'Google User',
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Google authentication failed');
  }
}
