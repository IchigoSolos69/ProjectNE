import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
            }
          ) => void;
          cancel?: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onError?: (message: string) => void;
}

/**
 * Stable Google Identity Services button.
 * `initialize` + `renderButton` run once on mount so FedCM is not aborted by re-renders.
 */
export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const authInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const loginRef = useRef(loginWithGoogle);
  const navigateRef = useRef(navigate);
  const redirectRef = useRef(redirectPath);
  const onErrorRef = useRef(onError);

  loginRef.current = loginWithGoogle;
  navigateRef.current = navigate;
  redirectRef.current = redirectPath;
  onErrorRef.current = onError;

  useEffect(() => {
    mountedRef.current = true;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('[Google Auth] VITE_GOOGLE_CLIENT_ID is not configured.');
      return () => {
        mountedRef.current = false;
      };
    }

    let pollId: ReturnType<typeof setInterval> | null = null;

    const setupGoogleButton = (): boolean => {
      if (initializedRef.current) return true;

      const container = buttonRef.current;
      const google = window.google;

      if (!google?.accounts?.id || !container) {
        return false;
      }

      google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: false,
        callback: async (response) => {
          authInProgressRef.current = true;
          try {
            await loginRef.current(response.credential);
            if (mountedRef.current) {
              navigateRef.current(redirectRef.current);
            }
          } catch (err) {
            const message =
              err instanceof Error ? err.message : 'Google Sign-In failed. Please try again.';
            onErrorRef.current?.(message);
          } finally {
            authInProgressRef.current = false;
          }
        },
      });

      container.innerHTML = '';
      google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: Math.max(container.offsetWidth, 200),
      });

      initializedRef.current = true;
      return true;
    };

    if (!setupGoogleButton()) {
      pollId = setInterval(() => {
        if (setupGoogleButton() && pollId) {
          clearInterval(pollId);
          pollId = null;
        }
      }, 200);
    }

    return () => {
      mountedRef.current = false;

      if (pollId) {
        clearInterval(pollId);
      }
    };
  }, []);

  return (
    <div
      ref={buttonRef}
      className="w-full min-h-[44px] flex items-center justify-center [&>div]:!w-full [&>div]:!flex [&>div]:!justify-center"
      aria-label="Sign in with Google"
    />
  );
}

export default GoogleSignInButton;
