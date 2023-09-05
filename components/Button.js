export default function Button(props) {
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
          text-shadow: 
            1px 1px calc(var(--button-height) / 32) #000000,
            -1px 1px calc(var(--button-height) / 32) #000000,
            -1px -1px calc(var(--button-height) / 32) #000000,
            1px -1px calc(var(--button-height) / 32) #000000
          ;
          color: var(--secondary-text-color);
          font-family: 'Aladin';
          letter-spacing: 0.1rem;
          line-height: 2rem;
          font-size: var(--font-size);
          border-radius: calc(var(--button-height) / 10);
          cursor: pointer;
          pointer-events: all;
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
            pointer-events: none;
          }

          &.excited {
            animation: excite 300ms ease infinite alternate;
          }
        }
      `}</style>
    </button>
  );
}