export default function UserIcon(props) {
  return (
    <div className='user-icon'>
      <img src={props.user.photoUrl}></img>
      <span className='user-name'>{props.user.displayName}</span>
      <style jsx>{`
        .user-icon {
          --icon-size: ${props.size === 'large' ? 'var(--large-icon-size)' : 'var(--header-height)'};
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: var(--icon-size);
          height: var(--icon-size);
          cursor: ${props.size === 'small' ? 'pointer' : 'default'};

          & > .user-name {
            --font-size: ${props.size === 'large' ? 'calc(var(--icon-size) / 6)' : 'calc(var(--icon-size) / 4)'};
            position: absolute;
            bottom: 0;
            font-size: var(--font-size);
            text-shadow: 0 0 calc(var(--font-size) / 6) black;
          }

          & img {
            background-color: #ffffff99;
            width: 80%;
            height: 80%;
            border-radius: 50%;
          }
        }
      `}</style>
    </div>
  );
}