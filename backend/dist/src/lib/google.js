"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = verifyGoogleToken;
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
async function verifyGoogleToken(idToken) {
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
            email: payload.email,
            name: payload.name || payload.given_name || 'Google User',
        };
    }
    catch (error) {
        console.error('Google token verification failed:', error);
        throw new Error('Google authentication failed');
    }
}
