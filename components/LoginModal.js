import Button from "./Button";
import GoogleButton from "./GoogleButton";
import SignInButton from "./SignInButton";

export default function LoginModal(props) {
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
          gap: calc(var(--board-size) * 0.025);;
        }

        div button {
          font-size: 1rem;
          color: green;
        }
      `}</style>
    </div>
  );
}