import Button from "./Button";
import UserIcon from "./UserIcon";

export default function VersusScreen(props) {
  return (
    <div className='versus-screen'>
      <UserIcon user={props.user} size='large' />
      <UserIcon user={props.opponent} size='large' />
      <div className='lower-area'>
        <Button
          label='START'
          clickAction={props.handleClickStartGame}
        />
      </div>
      <style jsx>{`
        .versus-screen {
          position: absolute;
          left: 50%;
          top: 50%;
          translate: -50% -50%;
          padding: 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          justify-items: center;
          gap: 6rem 4rem;

          & > .lower-area {
            grid-column-start: 1;
            grid-column-end: span 2;
          }
        }
      `}</style>
    </div>
  );
}