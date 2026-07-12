import Razorpay from "razorpay";
import { config } from "./index";

if (!config.razorpayKeyId || !config.razorpayKeySecret) {
  console.warn(
    "[Warning] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in environment variables."
  );
}

export const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});
