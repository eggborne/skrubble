export default function SignInButton(props) {
  return (
    <button type='button' className='sign-in-button' onClick={props.clickAction}>
      {props.label}
      <style jsx>{`
        .sign-in-button {
          transition: background-color .3s, box-shadow .3s;
          width: 12rem;
          padding: 12px 0;
          border: none;
          border-radius: 3px;
          box-shadow: 0 -1px 0 rgba(0, 0, 0, .04), 0 1px 1px rgba(0, 0, 0, .25);
          color: #757575;
          font-size: 14px;
          font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
          background-color: white;
          background-repeat: no-repeat;
          background-position: 12px 11px;
          cursor: pointer;
          
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
          
          &:disabled {
            filter: grayscale(100%);
            background-color: #ebebeb;
            box-shadow: 0 -1px 0 rgba(0, 0, 0, .04), 0 1px 1px rgba(0, 0, 0, .25);
            cursor: not-allowed;
          }
        }
      `}</style>
    </button>
  );
}