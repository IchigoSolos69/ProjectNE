import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Initialize Cloudinary if credentials are provided
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  console.warn('⚠️ Cloudinary is not configured. Direct uploads will fail.');
}

/**
 * Generates a signed upload signature for direct uploads from the frontend admin panel.
 * Keeps the API Secret safe on the server.
 */
export function generateUploadSignature(params: Record<string, any>) {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully configured on the server.'
    );
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...params, timestamp },
    apiSecret
  );

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
  };
}

export { cloudinary };
