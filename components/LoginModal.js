import { useEffect, useState } from "react";
import GoogleButton from "./GoogleButton";
import SignInButton from "./SignInButton";

export default function LoginModal(props) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!revealed) {
      setRevealed(true);
    }
  }, [revealed]);
  return (
    <div className='login-modal'>
      <GoogleButton label="Sign in with Google" clickAction={props.handleClickGoogleLogin} />
      <SignInButton label="Play as Guest" clickAction={props.handleClickGuestLogin} />
      <style jsx>{`
        .login-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 0 2rem;
          height: calc(var(--board-size) * 0.8);
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          gap: calc(var(--board-size) * 0.025);
          opacity: ${revealed ? 1 : 0};
          pointer-events: ${revealed ? 'all' : 'none'};;
          transition: opacity 800ms ease;
          transition-delay: 500ms;
        }

        div button {
          font-size: 1rem;
          color: green;
        }
      `}</style>
    </div>
  );
}