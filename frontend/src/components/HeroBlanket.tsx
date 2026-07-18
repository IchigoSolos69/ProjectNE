import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroBlanketProps {
  heroRef: React.RefObject<HTMLElement>;
}

export default function HeroBlanket({ heroRef }: HeroBlanketProps) {
  const blanketRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!heroRef.current || !blanketRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set(blanketRef.current, { yPercent: -100 });
      return;
    }

    ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: '+=100%',
      scrub: true,
      animation: gsap.to(blanketRef.current, { yPercent: -100, ease: 'none' }),
    });
  }, { scope: heroRef, dependencies: [heroRef] });

  const blanket = (
    <div
      ref={blanketRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 45,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Deep navy base with diagonal stripe textile pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0F2854',
        }}
      />
      {/* Woven diagonal stripe overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 18px,
            rgba(28,77,141,0.55) 18px,
            rgba(28,77,141,0.55) 36px
          )`,
        }}
      />
      {/* Cross-weave accent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 22px,
            rgba(73,136,196,0.2) 22px,
            rgba(73,136,196,0.2) 44px
          )`,
        }}
      />

      {/* Centered brand text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
        }}
      >
        <p style={{
          fontFamily: '"Playfair Display", Cormorant Garamond, serif',
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: '#ffffff',
          fontWeight: 500,
          lineHeight: 1.2,
          textAlign: 'center',
          letterSpacing: '-0.01em',
          margin: 0,
        }}>
          Woven for stillness.
        </p>
        <p style={{
          fontFamily: '"Playfair Display", Cormorant Garamond, serif',
          fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
          color: '#BDE8F5',
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.3,
          textAlign: 'center',
          margin: 0,
        }}>
          The weight of real rest.
        </p>
        <p style={{
          fontFamily: 'Inter, Manrope, sans-serif',
          fontSize: '0.65rem',
          color: 'rgba(189,232,245,0.55)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: '0.5rem',
        }}>
          RareComforts · Premium Bedding
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'rgba(189,232,245,0.6)',
        }}
      >
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Scroll to reveal
        </span>
        {/* Animated chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ animation: 'bounce 1.4s ease-in-out infinite' }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Ice-blue top edge accent stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #BDE8F5, #4988C4, #1C4D8D)',
        }}
      />
      {/* Ice-blue bottom edge accent stripe */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1C4D8D, #4988C4, #BDE8F5)',
        }}
      />

      {/* keyframe for the chevron bounce */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>
    </div>
  );

  return createPortal(blanket, document.body);
}
