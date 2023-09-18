export default function Button(props) {
  // console.error('BUTTON RENDERED!', props.label)
  const buttonClasses = ['button', props.disabled && 'disabled', props.specialClass && props.specialClass].filter(cl => cl).join(' ');
  return (
    <button className={buttonClasses} type='button' onClick={props.clickAction}>
      {props.label}
      <style jsx>{`
        .button {
          --button-color: ${props.color ? props.color : 'var(--secondary-bg-color)'};
          --height: ${props.size === 'small' ? 'calc(var(--button-height) / 1.5)' : 'var(--button-height)'};
          --font-size: calc(var(--button-height) / ${props.color === 'green' ? 1.75 : props.size === 'small' ? 3.5 : 2.5});
          padding: 0 calc(var(--button-height) / 3);
          height: var(--height);
          width: ${props.width || 'auto'};
          flex-grow: ${props.color === 'green' ? '1' : '0'};
          background-color: var(--button-color);
          background-image: linear-gradient(180deg, var(--button-color) 0%, #ffffff22 50%, var(--button-color) 100%);
          border: none;
          box-shadow: 0 0 calc(var(--button-height) / 32) calc(var(--button-height) / 64) #000000;
          //text-shadow: 
            1px 1px calc(var(--button-height) / 32) #000000,
            -1px 1px calc(var(--button-height) / 32) #000000,
            -1px -1px calc(var(--button-height) / 32) #000000,
            1px -1px calc(var(--button-height) / 32) #000000
          ;
          text-shadow: var(--text-stroke);
          color: var(--secondary-text-color);
          font-family: 'Aladin';
          letter-spacing: 0.1rem;
          line-height: 2rem;
          font-size: var(--font-size);
          border-radius: calc(var(--button-height) / 10);
          cursor: pointer;
          pointer-events: all !important;
          padding: 0;

          transition: all 100ms linear;

          // &:hover {
          //   color: yellow;
          //   background-color: #33ff33;
          // }

          &:active {
            scale: 0.975;
            background-color: #33ff33;
            color: white;
            box-shadow: none;
            box-shadow: 0 0 0 calc(var(--button-height) / 128) #000000;
          }

          &.disabled {
            background: unset;
            pointer-events: none !important;
          }

          &.excited {
            animation: excite 300ms ease infinite alternate;
          }

          &.request-game, &.requesting-game, &.challenging-user {
            transition: all 300ms ease;
            font-size: calc(var(--listing-height) * 0.3);
            background-image: unset;
            padding: 0 1.5rem;
          }

          &.request-game {
            background-color: #dddd33;
          }

          &.requesting-game {
            background-color: #4477aa;
          }

          &.challenging-user {
            background-color: 66ff66;
            min-width: 9rem;
            font-size: calc(var(--listing-height) * 0.3);
            padding: 0 1.5rem;
            line-height: 120%;
            background-image: unset;
            background-color: #66ff66;
            animation: excite 300ms ease infinite alternate;
            margin-left: 0.25rem;
          }

          &.game-ongoing {
            background-color: #22ff22;
            padding: 0 2.5rem;
          }
        }
      `}</style>
    </button>
  );
}