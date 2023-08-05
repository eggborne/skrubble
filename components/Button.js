export default function Button(props) {
  return (
    <button onClick={props.clickAction}>
      {props.label}
      <style jsx>{`
        button {
          padding: 0 2rem;
          height: var(--button-height);
          background-color: var(--secondary-bg-color);
          color: var(--secondary-text-color);
          font-family: inherit;
          font-size: calc(var(--button-height) / 3);
          border-radius: 0.5rem;
          cursor: pointer;
        }
      `}</style>
    </button>
  );
}