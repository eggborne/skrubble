export default function Space(props) {
  return (
    <>
      <div className={`space dropzone${props.targeted ? ' targeted' : ''}`} id={props.id}>
        {props.spaceData.length > 0 &&
          <>
            <div className='caret-trio top'>
              <div className='space-caret'></div>
              <div className='space-caret'></div>
              <div className='space-caret'></div>
            </div>
            <div className='caret-trio bottom'>
              <div className='space-caret'></div>
              <div className='space-caret'></div>
              <div className='space-caret'></div>
            </div>
            <div className='caret-trio left'>
              <div className='space-caret'></div>
              <div className='space-caret'></div>
              <div className='space-caret'></div>
            </div>
            <div className='caret-trio right'>
              <div className='space-caret'></div>
              <div className='space-caret'></div>
              <div className='space-caret'></div>
            </div>
          </>
        }
        <div className='special-label'>{props.label}</div>
        <div>
          {props.contents}
        </div>
      </div>
      <style jsx>{`
        .space {
          --caret-size: calc(var(--board-size) / 100);
          position: relative;
          width: 100%;
          height: 100%;
          background-color: ${props.backgroundColor};
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: black;
          font-size: calc(var(--board-size) / 90);

          &.targeted:after {
            content: '';
            width: 100%;
            height: 100%;
            background-color: #0000ff44;
            outline: calc(var(--board-size) / 150) solid #0000ff;
            box-sizing: content-box;
            z-index: 3;
          }
        }
        .special-label {
          color: black;
          position: absolute;
          top: 50%;
          left: 50%;
          translate: -50% -50%;
        }
        .caret-trio {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: calc(var(--caret-size) / 2);
          width: 100%;
          z-index: 2;
        }
        .caret-trio.top {
          top: calc(var(--caret-size) * -1);
        }
        .caret-trio.bottom {
          bottom: calc(var(--caret-size) * -1);
          transform-origin: top center;
        }
        .caret-trio.left {
          flex-direction: column;
          width: unset;
          left: calc(var(--caret-size) * -1);
        }
        .caret-trio.right {
          flex-direction: column;
          width: unset;
          right: calc(var(--caret-size) * -1);
        }
        .space-caret {
          width: 0;
          height: 0;
          background-color: transparent;
          border: calc(var(--board-outline-size) * 1.25) solid ${props.backgroundColor};
        }
        .caret-trio.top > .space-caret {
          border-right: calc(var(--board-outline-size) * 1) solid transparent;
          border-left: calc(var(--board-outline-size) * 1) solid transparent;
          border-top: calc(var(--board-outline-size) * 1) solid transparent;
        }
        .caret-trio.bottom > .space-caret {
          border-right: calc(var(--board-outline-size) * 1) solid transparent;
          border-left: calc(var(--board-outline-size) * 1) solid transparent;
          border-bottom: calc(var(--board-outline-size) * 1) solid transparent;
        }
        .caret-trio.left > .space-caret {
          border-left: calc(var(--board-outline-size) * 1) solid transparent;
          border-bottom: calc(var(--board-outline-size) * 1) solid transparent;
          border-top: calc(var(--board-outline-size) * 1) solid transparent;
        }
        .caret-trio.right > .space-caret {
          border-right: calc(var(--board-outline-size) * 1) solid transparent;
          border-bottom: calc(var(--board-outline-size) * 1) solid transparent;
          border-top: calc(var(--board-outline-size) * 1) solid transparent;
        }
      `}</style>
    </>
  );
}