import { useEffect, useState } from "react";
import { pause } from "../scripts/util";

export default function SaveMessage(props) {
  console.warn('rendering SaveMessage ------');
  let messageClasses = ['save-message'];
  let [visible, setVisible] = useState(false);
  useEffect(() => {
    console.warn('saveMessage effect running!');
    console.warn('props.showing!', props.showing);
    console.warn('visible!', visible);

    // pause(500).then(() => {
    setVisible(props.showing);
    // });
  }, [props.showing]);
  return (
    <div className={messageClasses.join(' ')}>
      {props.messageText || ''}
      <style jsx>{`
        .save-message {
          position: fixed;
          top: 1rem;
          left: 50%;
          min-width: 8rem;
          min-height: 0.5rem;
          text-align: center;
          padding: 0.5rem;
          font-size: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #000000dd;
          color: #eee;
          opacity: ${visible ? 0.9 : 0};
          scale: 1 ${visible ? 1 : 0};
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