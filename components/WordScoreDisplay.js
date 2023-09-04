import { useEffect, useState } from "react";

export default function WordScoreDisplay(props) {
  const [position, setPosition] = useState({});
  const [fontSize, setFontSize] = useState('calc(var(--played-tile-size) / 3)')

  useEffect(() => {
    if (props.wordScoreTileId) {
      const tileElement = document.getElementById(props.wordScoreTileId);
      const tileRect = tileElement.getBoundingClientRect();
      const position = {
        left: tileRect.left,
        top: tileRect.top,
      };
      setPosition(position);
    }
  }, [props.wordScoreTileId]);

  useEffect(() => {
    const scoreLength = props.pendingTurnScore.toString().length;
    let newFontSize = 'calc(var(--played-tile-size) / 1.75)';
    if (scoreLength === 2) {
      newFontSize = 'calc(var(--played-tile-size) / 2.25)';
    }
    if (scoreLength === 3) {
      newFontSize = 'calc(var(--played-tile-size) / 3)';
    }
    if (newFontSize !== fontSize) {
      setFontSize(newFontSize);
    }
  }, [props.pendingTurnScore]);

  return (
    <div className={`word-score-display`}>
      {props.pendingTurnScore}
      <style jsx>{`
        .word-score-display {
          position: fixed;
          left: ${position.left}px;
          top: ${position.top}px;
          translate: 100% 80%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${fontSize};
          font-family: monospace;
          font-weight: bold;
          border-radius: 50%;
          color: white;
          background-color: ${props.submitReady ? 'green' : 'red'};
          width: calc(var(--played-tile-size) / 1.5);
          height: calc(var(--played-tile-size) / 1.5);
          box-shadow: 0 0 calc(var(--board-outline-size) / 2) calc(var(--board-outline-size) / 4) black;
          z-index: 5;
          pointer-events: none;
          display: ${props.pendingTurnScore ? 'flex' : 'none'};
          // scale: ${props.pendingTurnScore ? 1 : 0};
          // transition: background-color 150ms ease, opacity 150ms ease, scale 150ms ease;
        }
      `}</style>
    </div>
  );
}