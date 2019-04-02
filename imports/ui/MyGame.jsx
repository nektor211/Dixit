import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Games } from "../api/games.js";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import { UsersGames } from "../api/usersGames.js";
import { Cards } from "../api/cards.js";
import { random } from "../utils/random";
import "./GameBoard.css";

class MyGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //global, get from db
      gameName : "",
      //get from db, needs update
      stage:0,
      hostIdx:0,
      //count:0,
      //players:[],
      //winners:[],//people who guess right
      //cards:[],//all cards
      cardsOnHand:[], //usersCardOnHand
      //cardsOnDesk:[],//[{card, userId},...]
      
      //local
      //playerIdx:this.getPlayerIndex(),
      points: 0,
      //tobe updated with db
      description:"",
      targetCard:null,//{card, userId}

      newUrl: "",
      distributedCards: random(this.props.cards, 4),
      buttonClick:0,

    };     
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  start() {
    Meteor.call("games.start", this.state.distributedCards, this.state.gameName, (err, res) => {
      if (err) {
        alert("There was error updating check the console");
        console.log(err);
      }
      console.log("succeed",res);
    });
    // distribute 6 cards to each player and save into db
    /*let players = Games.findOne({"name": this.state.gameName }).players;*/
  }

  // getPlayerIndex(){
  //   Meteor.call("games.getPlayerIndex",(err, res) => {
  //     if (err) {
  //       alert("There was error updating check the console");
  //       console.log(err);
  //     }
  //     console.log("succeed",res);
  //   });
  // }
  // getHostIdx() {

  // }
  // getStage(){
  //   if (this.state.gameName === "") {
  //     return 0;
  //   } else {
  //     let res = Meteor.call("games.getGame",this.state.gameName,(err, res) => {
  //       if (err) {
  //         alert("There was error updating check the console");
  //         console.log(err);
  //       }
  //       console.log("succeed",res);
  //     });
  //     return res.stage;
  //   }
  // }
  // getCardOnHand(){
  //   return null;
  // }

  getGame(){
    this.props.myGame.map(game =>{
      this.setState({
        gameName: game.name
      });
    });
  }

  updateGame(){
    this.props.myGame.map(game =>{
      this.setState({
        stage: game.stage,
      });
    });
  }

  componentDidMount() {
    this.updateGame();
    this.getGame();
  }

  componentDidUpdate(prevProps) {
    if (this.props.myGame!= prevProps.myGame){
      this.updateGame();
    }
  }

  updateCount(){
    Meteor.call("games.addCount", this.state.gameName,(err, res) => {
      if (err) {
        alert("add count error");
        console.log(err);
      } else {
        console.log("succeed",res);
      }
    });
  }

  onChange(e){
    this.setState(
      {
        [e.target.id]: e.target.value
      }
    );
  }

  onSubmit(e) {
    this.setState({
      buttonClick : 1
    });

    // if (e.target.id === "exitGame") {//update user status, remove player from game, can exit only on stage 0(before game starts)
    //   Meteor.call("usersGames.exit",this.state.points, (err, res) => {
    //     if (err) {
    //       alert("There was error updating check the console");
    //       console.log(err);
    //     }
    //     console.log("succeed",res);
    //   });
    //   Meteor.call("games.removePlayer", this.state.gameName, (err, res) => {
    //     if (err) {
    //       alert("There was error updating check the console");
    //       console.log(err);
    //     }
    //     console.log("succeed",res);
    //   });
    // }


    if (e.target.id === "readyToStart") {
      this.props.myGame.map(game  => (
        this.setState({
          gameName: game.name
        })
      ));
      Meteor.call("games.addCount", this.state.gameName,(err, res) => {
        if (err) {
          alert("add count error");
          console.log(err);
        } else {
          console.log("succeed",res);
        }
      });
    }

    if (e.target.id === "descriptionDone") {
      let url= this.state.newUrl;
      Meteor.call("cards.insert",url, (err, res) => {
        if (err) {
          alert("There was error updating check the console");
          console.log(err);
        }
        console.log("succeed",res);
      });
      this.setState({
        newUrl:""
      });
      //stage++(= 2)
      //count to 0
      //update db 
      
    }

    if (e.target.id === "pickCard") {
      //add card to pool
      //count++
      //if ct == players.length-1 
      //stage++
      //count = 0
      //update db
    }


    if (e.target.id === "voteCard") {
      //add card to pool
      //count++
      //if ct == players.length-1 
      //stage++
      //count = 0
      //update db
    }

    //function: compute points, display result, stage = 0, idx++, reset all {count = 0, idx++,.....}


    // if (e.target.id === "exitGame") {
    //   Meteor.call("games.removePlayer", this.state.gameName, (err, res) => {
    //     if (err) {
    //       alert("There was error updating check the console");
    //       console.log(err);
    //     }
    //     console.log("succeed",res);
    //   });
    //   Meteor.call("usersGames.exit",this.state.points,(err, res) => {
    //     if (err) {
    //       alert("There was error updating check the console");
    //       console.log(err);
    //     }
    //     console.log("succeed",res);
    //   });
    // }
  }

  // WORKED!!!  <div className="row">
  //   {this.props.myGame.map(game  => (
  //     <div key = {game._id}>{game.ingame ? "yes":"no"}</div>
  //   ))}
  // </div>
 

  // ALWAYS NO <div className="row">
  // {this.props.myGame.ingame ? "yes":"no"}
  // </div>
  
  render() {
    let d = random(this.props.cards, 4);
    console.log(this.props.cards);
    console.log(d);
    // let players = Games.findOne({"name": this.state.gameName }).players;
    // let numberOfPlayers = this.getGame().numberOfPlayers;
    let players = ["meng", "ines"];
    let numberOfPlayers = 6;
    let cardsInPool = [];
    for (let i=0; i<numberOfPlayers; i++) {
      cardsInPool.push(0);
    }

    const stage0 = (
      <div className="container"id="HomePage" >
        <div className = "row">
          <p>Stage0, game created, click start game, wait for enough players</p>
          {this.state.buttonClick === 0? 
          <button type="button" className="btn btn-outline-dark" id = "readyToStart" onClick = {this.onSubmit.bind(this)}>Ready!</button>
          :
          null
          }
        </div>
      </div>
    );
    const stage1 = (
      <div className="container"id="HomePage" >
        <div className = "row">
          <p>Stage1, each players get # of cards, host pick card and write description and submit, others wait</p><br/>
          <input type="text" className="form-control" id="description" placeholder="Enter description" onChange= {this.onChange.bind(this)}/>
          <button type="button" className="btn btn-outline-dark" id = "descriptionDone" onClick = {this.onSubmit.bind(this)}>Submit-stage1</button>
        </div>
      </div>
    );
    const stage2 = (
      <div className="container"id="HomePage" >
        <div className = "row">
          <p>Stage2, description displayed, host wait, others pick one card and submit</p>
          Card:{}
          Description: {}
          <button type="button" className="btn btn-outline-dark" id = "pickCard" onClick = {this.onSubmit.bind(this)}>Submit-stage2</button>

        </div>
      </div>
    );
    const stage3 = (
      <div className="container"id="HomePage" >
        <div className = "row">
          <p>Stage3, display # cards, host wait, others vote for card and submit</p>
          <button type="button" className="btn btn-outline-dark" id = "voteCard" onClick = {this.onSubmit.bind(this)}>Submit-stage3</button>
        </div>
      </div>
    );
    const stage4 = (
      <div className="container"id="HomePage" >
        <div className = "row">
          <p>Stage4, compute points and end game, remove game from db</p>
          <p>function: compute points
          DISPLAY RESULT</p>
        </div>
      </div>
    );
   
    return (
      <div className="container">
        @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        <div> 
          <div className="row">TEST: props.myGame.length: should be 1, actual data: {this.props.myGame.length}</div>
          <br/><div className="row">TEST: state.gameName: {this.state.gameName}</div>
          <br/><div className="row">TEST: state.stage: {this.state.stage}</div>
          {stage0}
          {stage1}
          {stage2}
          {stage3}
          {stage4}
        </div>
         @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        
      </div>  
    );
  }
}

MyGame.propTypes = {
  myGame: PropTypes.arrayOf(PropTypes.object).isRequired,
  usersGames: PropTypes.arrayOf(PropTypes.object).isRequired,
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const handle = Meteor.subscribe("myGame");
  const handle2 = Meteor.subscribe("usersGames");
  const handle3 = Meteor.subscribe("cards");
  return {
    user: Meteor.user(),
    ready : handle.ready() && handle2.ready() && handle3.ready(),
    myGame: Games.find({}).fetch(),
    usersGames: UsersGames.find({}).fetch(),
    cards: Cards.find({}).fetch(),
  };
})(MyGame);
