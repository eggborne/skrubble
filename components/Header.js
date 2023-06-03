export default function Header(props) {
  return (
    <header>
      <h1>
        Phoenetic Scrabble
      </h1>
      <style jsx>{`
        header {
          width: 100%;
          height: var(--header-height);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--secondary-bg-color);
        }
        h1 {
          font-size: calc(var(--header-height) / 2);
        }
      `}</style>
    </header>
  );
}