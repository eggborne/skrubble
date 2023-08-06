import Button from "./Button";

export default function LoginModal(props) {
  return (
    <div>
      <Button label="Log in with Google" clickAction={props.callGooglePopup} />
      <style jsx>{`
        div {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(var(--board-size) * 1);
          height: calc(var(--board-size) * 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--secondary-bg-color);
          border-radius: 1rem;
        }

        div button {
          font-size: 1rem;
          color: green;
        }
      `}</style>
    </div>
  );
}