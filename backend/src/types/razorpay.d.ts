declare module "razorpay" {
  class Razorpay {
    constructor(options: { key_id: string; key_secret: string; headers?: Record<string, string> });
    orders: {
      create(
        params: {
          amount: number;
          currency: string;
          receipt?: string;
          notes?: Record<string, string>;
          partial_payment?: boolean;
        },
        callback?: (err: any, order: any) => void
      ): Promise<any>;
      fetch(orderId: string): Promise<any>;
      all(params?: any): Promise<any>;
      fetchPayments(orderId: string): Promise<any>;
    };
    payments: {
      fetch(paymentId: string): Promise<any>;
      capture(paymentId: string, amount: number, currency: string): Promise<any>;
      refund(paymentId: string, params?: any): Promise<any>;
    };
  }

  export = Razorpay;
}
