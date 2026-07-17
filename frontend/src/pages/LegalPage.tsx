import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Scale, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const { policyName } = useParams<{ policyName: string }>();

  // Ensure scroll resets to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [policyName]);

  const policies: Record<
    string,
    { title: string; icon: React.ReactNode; seoDesc: string; content: React.ReactNode }
  > = {
    'privacy-policy': {
      title: 'Privacy Policy',
      icon: <ShieldCheck className="w-8 h-8 text-royal-blue" />,
      seoDesc: 'RareComforts privacy statement. How we process secure sessions, Google login cookies, and customer address registry lists.',
      content: (
        <div className="space-y-6 text-sm text-muted-gray leading-relaxed font-sans">
          <p>
            At <strong>RareComforts</strong>, we view privacy as a fundamental pillar of our concierge service. This Privacy Policy details how we collect, store, and secure information when you browse our bedding collections or check out.
          </p>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">1. Data We Collect</h3>
            <p>
              We gather email addresses and names during credentials registration and Google Sign-in processes. Additionally, we record user addresses and phone numbers in your customer profile to facilitate shipping delivery handoffs.
            </p>
          </div>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">2. Cookies & Local Sessions</h3>
            <p>
              To maintain cart memory and user log-in sessions, we place HTTP-only secure cookies. These tokens expire after 7 days and prevent unauthenticated profile modifications.
            </p>
          </div>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">3. Third-Party Disclosures</h3>
            <p>
              Your contact details are shared exclusively with verified shipping partners (e.g., BlueDart) only once orders transition to dispatched status. We never sell profile lists to brokers.
            </p>
          </div>
          <blockquote className="border-l-4 border-[#BDE8F5] pl-4 italic text-xs text-navy-deep">
            Note: This policy is maintained under jurisdiction laws of India. For concerns, contact our concierge line.
          </blockquote>
        </div>
      ),
    },
    'terms-and-conditions': {
      title: 'Terms & Conditions',
      icon: <Scale className="w-8 h-8 text-royal-blue" />,
      seoDesc: 'RareComforts terms of service. Guidelines on showroom use, coupon usage caps, simulated payment systems, and purchase transactions.',
      content: (
        <div className="space-y-6 text-sm text-muted-gray leading-relaxed font-sans">
          <p>
            Welcome to the digital showroom of <strong>RareComforts</strong>. By establishing an account, you agree to comply with the terms of service outlined below.
          </p>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">1. Account Security</h3>
            <p>
              You are responsible for safeguarding your login keys. Any transaction placed through your authenticated cookie session is presumed authorized by you.
            </p>
          </div>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">2. Promotional Coupon Codes</h3>
            <p>
              Coupons (such as WELCOME10) carry specific expiration dates and subtotal thresholds. Exploits involving multiple client email registrations to bypass user limits will result in order cancellation.
            </p>
          </div>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">3. Simulated Payments Disclaimer</h3>
            <p>
              During this rollout phase, payment transactions are simulated for testing. Orders are placed in a PENDING status and advanced manually upon external bank transfer confirmation.
            </p>
          </div>
        </div>
      ),
    },
    'shipping-policy': {
      title: 'Shipping Policy',
      icon: <Truck className="w-8 h-8 text-royal-blue" />,
      seoDesc: 'RareComforts shipping policy. Details on complimentary white-glove linen shipping across India and courier tracking expectations.',
      content: (
        <div className="space-y-6 text-sm text-muted-gray leading-relaxed font-sans">
          <p>
            RareComforts provides complimentary white-glove courier shipping for all premium Egyptian cotton bedsheets and comforter sets shipped within India.
          </p>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">1. Transit & Processing Timelines</h3>
            <p>
              Once payments are verified by our billing concierge, orders transition to PACKED status within 24–48 hours. Shipments hand off to logistics partners and arrive in 3–7 business days.
            </p>
          </div>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">2. Tracking Disclosures</h3>
            <p>
              Upon shipment, customers receive an automated notification containing tracking codes and carrier details (e.g., Delhivery) to monitor package progress.
            </p>
          </div>
        </div>
      ),
    },
    'returns-and-refunds': {
      title: 'Returns & Refunds Policy',
      icon: <RotateCcw className="w-8 h-8 text-royal-blue" />,
      seoDesc: 'RareComforts returns rules. Linen hygiene restrictions, unopened product guidelines, and 10-day replacement replacement periods.',
      content: (
        <div className="space-y-6 text-sm text-muted-gray leading-relaxed font-sans">
          <p>
            Due to strict sanitation and hygiene standards surrounding premium bedding textiles, <strong>RareComforts cannot accept returns on sheets, linens, or comforters that have been unrolled, opened, or washed.</strong>
          </p>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded text-xs text-amber-800 leading-normal">
            <strong>Hygiene Warning:</strong> Bedding materials directly touch skin during rest. We maintain a strict guarantee that every linen delivered is brand new and has never been opened. If you open the packaging seal, the item becomes ineligible for return.
          </div>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">1. Eligible Returns</h3>
            <p>
              Items are eligible for return/refund only if they remain in their original, unopened luxury box packaging with the plastic hygiene seal fully intact. You must request a return within 10 days of delivery.
            </p>
          </div>
          <div>
            <h3 className="text-navy-deep font-bold font-serif text-base mb-2">2. Defective or Damaged Shipments</h3>
            <p>
              If your bedsheets arrive with weaving defects, dirt blemishes, or incorrect sizes, please contact our concierge line immediately. We will initiate a complimentary swap.
            </p>
          </div>
        </div>
      ),
    },
  };

  const activePolicy = policyName ? policies[policyName] : null;

  if (!activePolicy) {
    return (
      <main className="flex-1 mt-[80px] py-24 text-center space-y-4">
        <span className="text-3xl">🏺</span>
        <h2 className="font-serif text-2xl font-semibold text-navy-deep">Policy Document Not Found</h2>
        <Link to="/" className="inline-block px-6 py-2 bg-navy-deep text-white font-sans text-xs uppercase tracking-wide rounded-full">
          RETURN TO SHOWROOM
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 mt-[80px] bg-[#F5FAFD]/20 min-h-screen py-16 px-6">
      <Helmet>
        <title>{`${activePolicy.title} | RareComforts`}</title>
        <meta name="description" content={activePolicy.seoDesc} />
      </Helmet>

      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl p-8 sm:p-12 shadow-xl space-y-8">
        
        {/* Navigation back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-sans text-[10px] font-bold text-muted-gray hover:text-royal-blue uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Showroom
        </Link>

        {/* Header Icon + Title */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          {activePolicy.icon}
          <h1 className="font-serif text-3xl font-bold text-navy-deep">{activePolicy.title}</h1>
        </div>

        {/* Dynamic content rendering */}
        {activePolicy.content}

      </div>
    </main>
  );
};

export default LegalPage;
