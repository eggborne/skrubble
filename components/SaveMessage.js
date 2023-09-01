import { useEffect, useState } from "react";
import { pause } from "../scripts/util";

export default function SaveMessage(props) {
  return (
    <div className={'save-message'}>
      {props.messageText}
      <style jsx>{`
        .save-message {
          position: fixed;
          top: 1rem;
          left: 50%;
          min-width: 8rem;
          min-height: 0.5rem;
          padding: 0.5rem;
          font-size: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #000000dd;
          color: #eee;
          opacity: ${props.showing ? 1 : 0};
          scale: 1 ${props.showing ? 1 : 0};
          transform: translateX(-50%);
          transform-origin: top;
          pointer-events: none;
          transition: all 400ms ease;
          z-index: 7;
        }
      `}</style>
    </div>
  );
}