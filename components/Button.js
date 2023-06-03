export default function Button(props) {
  return (
    <button onClick={props.clickAction}>
      {props.label}
      <style jsx>{`
        button {
          padding: 0 2rem;
          height: var(--button-height);
          background-color: var(--secondary-bg-color);
          border-radius: 0.5rem;
        }
      `}</style>
    </button>
  );
}