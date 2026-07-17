"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
exports.generateUploadSignature = generateUploadSignature;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
// Initialize Cloudinary if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}
/**
 * Generates a signed upload signature for direct uploads from the frontend admin panel.
 * Keeps the API Secret safe on the server.
 */
function generateUploadSignature(params) {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
        throw new Error('Cloudinary API secret is not configured.');
    }
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary_1.v2.utils.api_sign_request({ ...params, timestamp }, apiSecret);
    return {
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
}
