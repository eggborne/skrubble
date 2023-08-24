import { useEffect, useState } from "react";

export default function WordScoreDisplay(props) {
  const [position, setPosition] = useState('calc(var(--played-tile-size) / 1.75)');
  const [fontSize, setFontSize] = useState()

  useEffect(() => {
    if (props.targetTileObj) {
      const spaceElement = document.getElementById(`${props.targetTileObj.placed.x+1}-${props.targetTileObj.placed.y+1}`);
      const spaceRect = spaceElement.getBoundingClientRect();
      const position = {
        left: spaceRect.left,
        top: spaceRect.top,
      };
      setPosition(position);
    }
  }, [props.targetTileObj]);

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
          z-index: 6;
          pointer-events: none;
          display: ${props.pendingTurnScore ? 'flex' : 'none'};
          // scale: ${props.pendingTurnScore ? 1 : 0};
          // transition: background-color 150ms ease, opacity 150ms ease, scale 150ms ease;
        }
      `}</style>
    </div>
  );
}