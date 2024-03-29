//import React from 'react';
//import ReactDOM from 'react-dom';

const MAXSTEPS = 20;

const PAD = {
  GREEN: '0',
  RED: '1',
  YELLOW: '2',
  BLUE: '3',
}

const GAME = {
  WIN: 'win',
  LOST: 'lost',
  KEEPGOING: 'keepgoing',
  STEPUP: 'stepup'
}

const STATUS = {
  RUNNING: 'running',
  STOP: 'stop'
}

const INITIAL_STATE = {
  game: null,
  status: STATUS.STOP,
  strict: false,
  playerIsNext: false,  
  stepNumber: 1,
  playingStepNumber: 0,
  song: [],
  playerStepNumber: 0,
  playerSong: [],
  pressedPad: null,
  intervalId: null,
  isPlaying: false,
};

const GameControls = (props)=> {
  const { stepNumber, strict, onStrict, onStart, onReset, status } = props;
  let className = "btn btn-warning game-controls";
  if (strict) {
    className = className + " active";
  }

  return (
    <div>
      { status === STATUS.STOP &&      
      <button type="button" onClick={onStart} className="btn btn-success game-controls">Start</button> }
      
      { status === STATUS.RUNNING &&
        <button type="button" className="btn disabled game-controls" title="your steps!">{stepNumber}</button>}
      { status === STATUS.RUNNING &&      
      <button type="button" onClick={onReset} className="btn btn-danger game-controls">Reset</button> }
      
      <button type="button" onClick={onStrict} className={className}>Strict</button>        
    </div>    
  );
}

const GamePad = (props)=> {
  const { 
    strict,
    game,
    status, 
    pressedPad,
    onPressedPad
  } = props;
  
  const greenClassName = " btn btn-success pad-btn" + ((pressedPad === PAD.GREEN) ? " green" : "") + ((status === STATUS.STOP) ? " disabled" : ""); // green
  let yellowClassName = "btn btn-warning pad-btn" + ((pressedPad === PAD.YELLOW) ? " yellow":"") + ((status === STATUS.STOP) ? " disabled" : ""); // yellow
  let redClassName = "btn btn-danger pad-btn" + ((pressedPad === PAD.RED) ? " red":"") + ((status === STATUS.STOP) ? " disabled" : ""); // red
  let blueClassName = "btn btn-primary pad-btn" + ((pressedPad === PAD.BLUE) ? " blue":"") + ((status === STATUS.STOP) ? " disabled" : ""); // blue

  let msg = "";
  if (game === GAME.WIN) {
    msg = ":D";
  } if (game === GAME.LOST) { 
    msg = ":(";
  }
  
  return (
        <div>
          <div className="pad">
          <div className="row row-pad">
              <button type="button" onClick={() => onPressedPad(PAD.GREEN)} className={greenClassName}>{msg}</button>
              <button type="button" onClick={() => onPressedPad(PAD.RED)} className={redClassName}>{msg}</button>
          </div>
          <div className="row row-pad">
              <button type="button" onClick={() => onPressedPad(PAD.YELLOW)} className={yellowClassName}>{msg}</button>
              <button type="button" onClick={() => onPressedPad(PAD.BLUE)} className={blueClassName}>{msg}</button>
          </div>
        </div>
        </div>
  );
}

class SimonsGame extends React.Component {
  constructor(props) {
    super(props);
    const newSong = this.generateRandomSong();
    this.state = { ...INITIAL_STATE, song: newSong };
  }
  
  generateRandomSong() {
    // generate random sequence of 0-3 characters array of specified length

    function randomPads() {
      return String(Math.floor(Math.random() * 4)); // random 0-3
    }
    const newSong = Array.apply(null, Array(MAXSTEPS)).map(randomPads);
    //const newSong = ["2","2","2","2"]; // test
    return newSong;
  }
  
  intervalRun() {    
    
    const { 
      intervalId, 
      pressedPad,
      song,
      stepNumber, 
      playingStepNumber 
    } = this.state;
//|| stepNumber > MAXSTEPS
    if (playingStepNumber >= stepNumber) {
      clearInterval(intervalId); // stop interval
      this.setState({
        isPlaying: false,
        playingStepNumber: 0,
        pressedPad: null,  
        intervalId: null,
        playerIsNext: true, // player's turn
      });      
    } else {
      
      const nextPressedPad = song[playingStepNumber];
      this.playPad(String(nextPressedPad));
      this.setState({
        playingStepNumber: playingStepNumber + 1,
      });
    }    
  }
  
  playAudioClip(audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.play();    
  }
  
  playPad(pad) {
    switch (pad) {        
      case PAD.GREEN:
        this.playAudioClip(this.refs.audio1);
        break;
      case PAD.RED:
        this.playAudioClip(this.refs.audio2);
        break;
      case PAD.YELLOW:
        this.refs.audio3.pause();
        this.refs.audio3.currentTime = 0;
        this.refs.audio3.play();
        break;
      case PAD.BLUE:
        this.refs.audio4.pause();
        this.refs.audio4.currentTime = 0;
        this.refs.audio4.play();
        break;
    }
    this.setState({
      pressedPad: pad,
    });
    setTimeout(() => this.setState({ pressedPad: null }), 100);
  }
  
  playSong() {
    const  { intervalId, playerIsNext } = this.state;
    clearInterval(intervalId); // stop previous interval

    this.setState({
      playerStepNumber: 0,
      playingStepNumber: 0,
      isPlaying: true,
      intervalId: setInterval(() => this.intervalRun(), 500),
    });
  }
  
  onStrict() {
    this.setState({ strict: !this.state.strict });
  }
  
  onStart() {
    this.setState({ status: STATUS.RUNNING });
  }
  
  onReset() {
    const { intervalId } = this.state;
    clearInterval(intervalId);
    
    const newSong = this.generateRandomSong();
    this.setState({ ...INITIAL_STATE, strict: this.state.strict, song: newSong });    
  }  
  
  resetAndRun() {

    const newSong = this.generateRandomSong();
    this.setState({ 
      ...INITIAL_STATE, 
      status: STATUS.RUNNING,
      strict: this.state.strict,
      song: newSong 
    });    
  }  
  
  resetPlayerAndRun() {

    const newSong = this.generateRandomSong();
    this.setState({ 
      game: null,
      playerIsNext: false,
      playerStepNumber: 0,
      playerSong: [],
    });    
  }  
  
  onPressedPad(pad) {
    const { 
      playerStepNumber, 
      playerSong,
      stepNumber,
      song,
      status,
      strict,
      playerIsNext
    } = this.state;
         
    if (status != STATUS.RUNNING || playerIsNext === false) {
      return;
    }
    
    this.playPad(pad);
//    setTimeout(() => this.setState({ pressedPad: null }), 100);
    
    const nextPlayerStepNumber = playerStepNumber + 1;
    const nextPlayerSong = playerSong.concat(pad);
    
    const game = this.calcGameResult(song, nextPlayerSong, stepNumber);
    
    //console.log('song', song);
    //console.log('stepNumber', stepNumber);
    //console.log('playerSong', nextPlayerSong);
    //console.log('playerStepNumber', nextPlayerStepNumber);
    //console.log('game', game);
    
    this.updateGameStatus(game, stepNumber, strict, nextPlayerSong, nextPlayerStepNumber);
  }

  isWinner(song, playerSong) {
    var callback = ( acc, val, idx ) => { 
      if (song[idx] !== val) {
        return false;
      }
      return acc;
    };
    return playerSong.reduce(callback, true);
  }
  
  calcGameResult(song, playerSong, stepNumber) {
    const win = this.isWinner(song, playerSong);
    let game = GAME.KEEPGOING;
    if (win === true) {
      if (song.length === playerSong.length) {
        game = GAME.WIN;
      } else if (playerSong.length === stepNumber ) {
        game = GAME.STEPUP; // step completed
      } 
    } else if (win === false) {
      game = GAME.LOST;
    }
    return game;
  }

  gameStepUp() {
    const { stepNumber } = this.state;
    this.setState({ 
      stepNumber: stepNumber + 1,
      playerStepNumber: 0,
      playerSong: [],
      playerIsNext: false,
    });           
  }
  
  updateGameStatus(game, stepNumber, strict, nextPlayerSong, nextPlayerStepNumber) {
    switch(game) {
      case GAME.WIN:
        //console.log('win');        
        this.setState({ game: GAME.WIN }); // win
        // reset, with new song, play song
        setTimeout(() => { this.resetAndRun() }, 500);
        break;
      case GAME.LOST:        
        this.setState({ game: GAME.LOST }); // lost
        if (strict === true) {
          // reset, with new song
          setTimeout(() => { this.resetAndRun() }, 500);
        } else {
          // remove player's moves, all
          setTimeout(() => { this.resetPlayerAndRun() }, 500);
        }
        break;
      case GAME.KEEPGOING:
        this.setState({ 
          playerStepNumber: nextPlayerStepNumber,
          playerSong: nextPlayerSong,
        });       
        //console.log('keep going');
        break;
      case GAME.STEPUP:
        // everything is fine, increase stepNumber, play song
        setTimeout(() => { this.gameStepUp() }, 500);
        //console.log('step up!');        
        break;
    }    
  } 
  
  render() {
    const  { 
      playerIsNext, 
      stepNumber,
      playerStepNumber,
      strict, 
      game,
      status,
      pressedPad,
      isPlaying,
    } = this.state;

    if (status === STATUS.RUNNING) {
      if (playerIsNext === true) {
        // nothing to do
      } else if (!isPlaying) {
        this.playSong();  
      }
    }
    
    return (
      <div>

<div className="container">

  <div className="row">
    <div className="col-sm-4">
    </div>
    <div className="col-sm-4">
      
      <div className="row">
        <h2>Simon's Game</h2>
      </div>      
      <div className="row">
        <GamePad
          game={game}
          pressedPad={pressedPad}
          onPressedPad={(pad) => this.onPressedPad(pad)}
          status={status}
          />
      </div>        
      <div className="row">
        <GameControls
          stepNumber={stepNumber}
          status={status}
          strict={strict}
          onStrict={() => this.onStrict()}
          onStart={() => this.onStart()}
          onReset={() => this.onReset()}
          />
      </div>
      
      <div className="row">
        
<audio ref="audio1" preload="auto" src="https://s3.amazonaws.com/freecodecamp/simonSound1.mp3" type="audio/mpeg"></audio>
<audio ref="audio2" preload="auto" src="https://s3.amazonaws.com/freecodecamp/simonSound2.mp3" type="audio/mpeg"></audio>
<audio ref="audio3" preload="auto" src="https://s3.amazonaws.com/freecodecamp/simonSound3.mp3" type="audio/mpeg"></audio>
<audio ref="audio4" preload="auto" src="https://s3.amazonaws.com/freecodecamp/simonSound4.mp3" type="audio/mpeg"></audio>
        
      </div>
      
    </div>
    <div className="col-sm-4">
    </div>
  </div>
  
</div>
        
      </div>
    )
  }
}

ReactDOM.render(
    <SimonsGame />, 
    document.getElementById('app')
);
