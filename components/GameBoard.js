import Space from "./Space";
import Tile from "./Tile";

const boardData = [
  [['tw'], [], [], ['dl'], [], [], [], ['tw'], [], [], [], ['dl'], [], [], ['tw'],],
  [[], ['dw'], [], [], [], ['tl'], [], [], [], ['tl'], [], [], [], ['dw'], [],],
  [[], [], ['dw'], [], [], [], ['dl'], [], ['dl'], [], [], [], ['dw'], [], [],],
  [['dl'], [], [], ['dw'], [], [], [], ['dl'], [], [], [], ['dw'], [], [], ['dl'],],
  [[], [], [], [], ['dw'], [], [], [], [], [], ['dw'], [], [], [], [],],
  [[], ['tl'], [], [], [], ['tl'], [], [], [], ['tl'], [], [], [], ['tl'], [],],
  [[], [], ['dl'], [], [], [], ['dl'], [], ['dl'], [], [], [], ['dl'], [], [],],
  [['tw'], [], [], ['dl'], [], [], [], ['dw'], [], [], [], ['dl'], [], [], ['tw'],],
];

const specialSpaceData = {
  'dl': { color: '#b3eeff', legend: 'DOUBLE LETTER SCORE' },
  'dw': { color: '#ffb2be', legend: 'DOUBLE WORD SCORE' },
  'tl': { color: '#01bcf4', legend: 'TRIPLE LETTER SCORE' },
  'tw': { color: '#f05a62', legend: 'TRIPLE WORD SCORE' },
};

export default function GameBoard(props) {
  const lowerHalf = [...boardData.slice(0, -1)].reverse();

  return (
    <>
      <div className='game-board'>
        {[boardData, lowerHalf].map((half, h) =>
          half.map((row, r) =>
            row.map((space, s) =>
              <Space
                spaceData={space}
                backgroundColor={space.length ? specialSpaceData[space[0]].color : 'var(--board-color)'}
                contents={
                  h === 0 && r === 7 && space[0] === 'dw' ?
                    <div className='star'></div>
                    :
                    space.length ?
                    specialSpaceData[space[0]].legend
                    :
                    ''
                }
              />
            )
          )
        )}
      </div>
      <style jsx>{`
        .game-board {
          width: var(--board-size);
          height: var(--board-size);
          background-color: var(--board-color);
          border: calc(var(--board-outline-size) * 1.5) solid white;

          display: grid;
          grid-template-columns: repeat(15, 1fr);
          grid-template-rows: repeat(15, 1fr);
        }
        h1 {
          font-size: calc(var(--header-height) / 2);
        }
        .star {
          --star-size: calc(var(--board-size) / 40);
          position: absolute;
          top: 55%;
          transform: translateY(-150%);
          
          border-right:  .3em solid transparent;
          border-bottom: .7em solid #333;
          border-left:   .3em solid transparent;
        
          /* Controlls the size of the stars. */
          font-size: var(--star-size);
          
          &:before, &:after {
            content: '';
            
            display: block;
            width: 0;
            height: 0;
            
            position: absolute;
            top: .6em;
            left: -1em;
          
            border-right:  1em solid transparent;
            border-bottom: .7em  solid #333;
            border-left:   1em solid transparent;
          
            transform: rotate(-35deg);
          }
          
          &:after {  
            transform: rotate(35deg);
          }
        }
      `}</style>
    </>
  );
}