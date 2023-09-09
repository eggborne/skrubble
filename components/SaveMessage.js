import { useEffect, useState } from "react";
import { pause } from "../scripts/util";

export default function SaveMessage(props) {
  let messageClasses = ['save-message'];
  let [visible, setVisible] = useState(false);
  useEffect(() => {
    props.showing ?
      // pause(200).then(() => setVisible(true))
      setVisible(true)
      :
      setVisible(false)
    ;
  }, [props.showing]);
  return (
    <div className={messageClasses.join(' ')}>
      {props.showing || ''}
      <style jsx>{`
        .save-message {
          position: fixed;
          top: 1rem;
          left: 50%;
          min-width: 18rem;
          min-height: 2.5rem;
          text-align: center;
          padding: 0.5rem;
          font-size: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #000000dd;
          border-radius: 0.5rem;
          color: #eee;
          opacity: ${visible ? 0.9 : 0};
          transform: translateX(-50%);
          pointer-events: none;
          //transition: all 150ms ease;
          z-index: 7;
          
          //display: none;

        }
      `}</style>
    </div>
  );
}