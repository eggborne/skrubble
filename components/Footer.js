export default function Footer(props) {
  return (
    <footer>
      footer text
      <style jsx>{`
        footer {
          width: 100%;
          height: var(--footer-height);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--secondary-bg-color);
        }
      `}</style>
    </footer>
  );
}