import Button from "./Button";

export default function Footer(props) {
  return (
    <footer>
      footer text
      <button style={{padding: '0.5rem'}} onClick={props.handleSignOut}>sign out</button>
      <style jsx>{`
        footer {
          width: 100%;
          height: var(--footer-height);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0.5rem;
          background-color: var(--secondary-bg-color);
        }
      `}</style>
    </footer>
  );
}