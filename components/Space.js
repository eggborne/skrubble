import { memo, useMemo } from "react";

const Space = memo((props) => {
  // console.warn('rendering Space +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', props);
  const isDropzone = props.id.split('-')[0] !== 'opponent';
  const isSpecial = props.spaceData.length > 0;
  const spaceClass =
    `space${isDropzone ? ' dropzone' : ''}${props.targeted ? ' targeted' : ''}${props.onRack ? ' on-rack' : ''}${props.locked ? ' locked' : ''}`
  ;

  return (
    <div className={spaceClass} id={props.id}>
      {isSpecial &&
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
      <div className='contents'>
        {props.contents}
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
          pointer-events: none;
          // outline: ${props.contents ? '1px solid red' : 'none'};
          
          &.on-rack {
            width: var(--racked-tile-size);
            height: var(--racked-tile-size);
            position: relative;
            // background-color: #00990099;
            transition: all 300ms ease;
          }

          // &.targeted:after, &.targeted:before {
          //   background-color: green !important;
          // }

          // &.targeted {
            // background: #33ff33;
            // border: calc(var(--racked-tile-gap-size) / 2) solid #33ff33;
            // transition: all 300ms ease, outline 0ms, background 0ms;
          // }

          &.locked {
            transition: all 500ms ease;
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
          z-index: 1;
          display: ${props.locked ? 'none' : 'flex'}
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
    </div>
  );
}, (prevProps, nextProps) => {
    const isEqual =
      (prevProps.contents && nextProps.contents) ?
        prevProps.contents.props === nextProps.contents.props
        && prevProps.contents.props.offset === nextProps.contents.props.offset
        && prevProps.contents.props.offset.x === nextProps.contents.props.offset.x
        && prevProps.contents.props.offset.y === nextProps.contents.props.offset.y
        && prevProps.contents === nextProps.contents
        && prevProps.locked === nextProps.locked
        && prevProps.targeted === nextProps.targeted
      :
        prevProps === nextProps
    ;
    return isEqual;
});

export default Space;