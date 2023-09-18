import { useEffect, useState } from "react";
import { loadFromLocalStorage } from "../scripts/util";

export default function SignInButton(props) {
  const [expanded, setExpanded] = useState(false);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    if (expanded) {
      const storedName = loadFromLocalStorage('anonUserData') ? loadFromLocalStorage('anonUserData').displayName : 'Guest';
      console.log('storedName', storedName);
      setGuestName(storedName);
    }
  }, [expanded]);

  function handleGuestNameChange(e) {
    console.log(e.target.value);
    setGuestName(e.target.value);
  }

  function handleSubmitGuestNameForm() {
    props.clickAction(guestName);
  }

  let buttonClasses = [
    'sign-in-button',
    expanded && 'expanded',
  ].filter(cl => cl).join(' ');

  return (
    <div role='button' className={buttonClasses} onClick={() => expanded ? null : setExpanded(true)}>
      <div className='button-label'>{props.label}</div>
      <div className='expanded-area'>
        <input maxLength='12' className='guest-name-input' placeholder={'Enter name'} onChange={handleGuestNameChange} value={guestName} />
        <div className='button-area'>
          <button type='button' onClick={() => setExpanded(false)}>X</button>
          <button disabled={guestName.trim().length < 2} onClick={handleSubmitGuestNameForm}>GO!</button>
        </div>
      </div>
      <style jsx>{`
        .sign-in-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          min-width: 12rem;
          height: 3rem;
          padding: 0.75rem 0;
          //padding-bottom: 0.5rem;
          border: none;
          border-radius: 3px;
          box-shadow: 0 -1px 0 rgba(0, 0, 0, .04), 0 1px 1px rgba(0, 0, 0, .25);
          color: #757575;
          font-weight: bold;
          font-size: 14px;
          font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
          background-color: white;
          background-repeat: no-repeat;
          background-position: 12px 11px;
          cursor: pointer;
          transition: all 200ms ease;
          
          &:hover {
            box-shadow: 0 -1px 0 rgba(0, 0, 0, .04), 0 2px 4px rgba(0, 0, 0, .25);
          }
          
          &:active {
            background-color: #eeeeee;
          }
          
          &:focus {
            outline: none;
            box-shadow: 
              0 -1px 0 rgba(0, 0, 0, .04),
              0 2px 4px rgba(0, 0, 0, .25),
              0 0 0 3px #c8dafc;
          }

          &.expanded {
            height: 9rem;
            cursor: default;
            background-color: #bbffbb;
            outline: 0.25rem solid lightgreen;

            & .expanded-area {
              opacity: 1;
              transition-delay: 150ms;
              pointer-events: all;
            }
          }

          & > .expanded-area {
            display: flex;
            flex-direction: column;
            opacity: 0;
            transition: opacity 100ms ease;
            transition-delay: 0;
            pointer-events: none;

            & > .button-area {
              height: 2.75rem;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 0.5rem;

              & > button {
                font-weight: bold;
                color: white;
                width: 3rem;
                height: 2rem;
                border-radius: 0.25rem;

                &:disabled {
                  background-color: gray;
                }
              }

              & > button:first-of-type {
                background-color: red;
                width: 2rem;
              }

              & > button:last-of-type {
                background-color: green;

              }

            }
          }

          & .guest-name-input {
            width: 10rem;
            height: 2.75rem;
            padding: 0.5rem;
            text-align: center;
            font-size: 16px;            
          }
          
          &:disabled {
            filter: grayscale(100%);
            background-color: #ebebeb;
            box-shadow: 0 -1px 0 rgba(0, 0, 0, .04), 0 1px 1px rgba(0, 0, 0, .25);
            cursor: not-allowed;
          }
        }
      `}</style>
    </div>
  );
}