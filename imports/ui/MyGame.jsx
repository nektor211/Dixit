import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Games } from "../api/games.js";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import { UsersGames } from "../api/usersGames.js";
import { Cards } from "../api/cards.js";
var shuffle = require("shuffle-array");

class MyGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //fixed in the whole game
      gameName: "",

      //round-level changes
      points: 0, //once at the end
      hostIdx: 0, //once at the start
      hostDescription: "",
      cardsOnDesk: [],

      //if user is host
      description: "",
      //host's picked card, other's picked and voted card
      selectedCard: null, //OBJECT

      //stage-level changes
      stage: 0,
      cardsOnHand: [],
      players: [],
      winners:[],//people who guess right
      isHost: false,
      newUrl: "",
      buttonClick: 0,
      cardsPool: [],
      isOver: false,
      readyCount: 0,
      pickCount:0,
      voteCount:0,
      timeId: "",
//      emergencyExit: false
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.autoSelect = this.autoSelect.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.myGame != prevProps.myGame) {
      this.updateGame();
      let cur = null;
      let prev = null;
      let host = null;
      this.props.myGame.map(game => (cur=game.stage));
      this.props.myGame.map(game => (host=game.hostIdx));
      prevProps.myGame.map(game => (prev=game.stage));
      if ((cur === 1 && this.state.playerIdx !== host)) {
        return;
      }
      if ((cur === 2 || cur === 3) && this.state.playerIdx === host) {
        return;
      }
      if (cur != prev && this.state.timeId === "") {
        let timeId = setTimeout(this.autoSelect, 600000000);
        this.setState({
          timeId:timeId
        });
      } 
    }

    // if (this.props.myGame == prevProps.myGame && this.state.timeId === "" && this.state.stage != 0) {
    //   setTimeout(this.emergencyExit(), 20000);
    // }

    if (this.props.gameData != prevProps.gameData) {
      this.updatePoint();
    }

  }

  // emergencyExit() {
  //   this.setState({
  //     emergencyExit:true
  //   });
  // }

  eventFire(el, etype){
    if (el.fireEvent) {
      el.fireEvent("on" + etype);
    } else {
      var evObj = document.createEvent("Events");
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
  }

  autoSelect() {
    console.log("AutoSelect", (new Date()).toString());
    if (this.state.stage === 1) {
      alert("Timeout! System has selected a card and description for you!");
      this.setState({
        description : "Story Teller fell asleep, try your best to guess!",
        selectedCard:this.state.cardsOnHand[0],
        timeId:""
      });
      let describe = document.getElementById("descriptionDone");
      describe.click();
    }
    if (this.state.stage === 2) {
      alert("Timeout! System has selected a card for you!");
      this.setState({
        selectedCard:this.state.cardsOnHand[0],
        timeId:""
      });
      let pick = document.getElementById("pickCard");
      pick.click();
    }
    if (this.state.stage === 3) {
      alert("Timeout! System has voted a card for you!");
      this.setState({
        selectedCard:this.state.cardsOnDesk[0],
        timeId:""
      });
      let vote = document.getElementById("voteCard");
      vote.click();
    }

    if (this.state.stage === 4) {
      alert("Timeout! Next round.");
      this.setState({
        timeId:""
      });
      let next = document.getElementById("readyToStart");
      next.click();
    }
  }

  // getIdx(){
  //   Meteor.call(
  //     "usersGames.getPlayerIndex",
  //     (err, res) => {
  //       if (err) {
  //         alert("There was error updating check the console");
  //         console.log(err);
  //       } else {
  //         return res;
  //       }
  //     });
  // }

  getPlayerIndex() {
    Meteor.call(
      "usersGames.getPlayerIndex",
      (err, res) => {
        if (err) {
          alert("There was error updating check the console");
          console.log(err);
        } else {
          let isHost = res === this.state.hostIdx;
          this.setState({
            playerIdx:res,
            cardsOnHand: this.state.cardsPool[res],
            playerName: this.props.myGame[0].players[res],
            isHost: isHost
          });
          //console.log("res",res);
        }
      });

    // Meteor.call(
    //   "games.getPlayerIndex",
    //   this.props.myGame[0].name,
    //   (err, res) => {
    //     if (err) {
    //       alert("There was error updating check the console");
    //       console.log(err);
    //     }
    //     let isHost = res === this.state.hostIdx;
    //     this.setState({
    //       playerIdx: res,
    //       cardsOnHand: this.state.cardsPool[res],
    //       playerName: this.props.myGame[0].players[res],
    //       isHost: isHost
    //     });
    //   }
    // );
  }

  updateGame() {
    // console.log("myGame:", this.props.myGame);
    this.props.myGame.map(game => {
      this.setState({
        gameName: game.name,
        stage: game.stage,
        hostIdx: game.hostIdx, //get hostName
        hostDescription: game.description,
        cardsOnDesk: shuffle(game.cardsOnDesk),
        winners: game.winners,
        cardsPool: game.cardsOnHand,
        players: game.players,
        isOver:game.isOver,
        playerPoints:game.playerPoints
      });
      this.getPlayerIndex();
    });
  }

  updatePoint() {
    this.props.gameData.map(userGame => {
      this.setState({
        points: userGame.tempPoints
      });
    });
  }
  
  getPlayerPoints(player) {
    Meteor.call("usersGames.getPoints", player, (err, res) => {
      if (err) {
        alert("There was error updating check the console");
        console.log(err);
      } else {
        return res;
      }
    });
  }

  onChange(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  onSubmit(e) {
    this.setState({
      buttonClick: 1
    });

    if (e.target.id === "emergencyExit") {
      Meteor.call("games.emergencyExit", this.state.gameName, (err, res) => {
        if (err) {
          alert("There was error updating check the console");
          console.log(err);
        } else {
          console.log("succeed", res);
        }
      });
    }

    // if (e.target.id === "final") {
    //   Meteor.call("games.final", this.state.gameName, (err, res) => {
    //     if (err) {
    //       alert("There was error updating check the console");
    //       console.log(err);
    //     } else {
    //       console.log("succeed", res);
    //     }
    //   });
    // }

    if (e.target.id === "readyToStart") {
      if (this.state.stage === 0) {
        Meteor.call("games.updateReady", this.state.gameName, (err, res) => {
          if (err) {
            alert("There was error updating check the console");
            console.log(err);
          } else {
            console.log("succeed", res);
          }
        });
        this.setState({
          readyCount:1,
          voteCount:0,
          pickCount:0,
          timeId:""
        });
      }
      //let curPoint = 0;
      if (this.state.stage === 4) {
        // if (this.state.winners.includes(this.state.playerName)){
        //   if (this.state.isHost === true){
        //     curPoint = 3;
        //   } else {
        //     curPoint = 1;
        //   }
        // }
        // Meteor.call("usersGames.updateScore", curPoint,(err, res) => {
        //   if (err) {
        //     alert("There was error updating check the console");
        //     console.log(err);
        //   } else {
        //     console.log("succeed", res);
        //   }
        // });
        Meteor.call("games.nextHost", this.state.gameName, (err, res) => {
          if (err) {
            alert("There was error updating check the console");
            console.log(err);
          } else {
            console.log("succeed", res);
          }
        });
        this.setState({
          voteCount:0,
          pickCount:0,
          timeId:""
        });
      }
    }

    if (e.target.id === "descriptionDone") {
      if (this.state.selectedCard != null && this.state.description != "") {
        let info = {
          game: this.state.gameName,
          card: this.state.selectedCard,
          description: this.state.description,
          playerIdx: this.state.playerIdx
        };
        Meteor.call("games.updateAnswer", info, (err, res) => {
          
          if (err) {
            alert("There was error updating check the console");
            console.log(err);
          } else {
            console.log("succeed", res);
          }
        });
        Meteor.call("games.addCardToDesk", info, (err, res) => {
          
          if (err) {
            alert("There was error updating check the console");
            console.log(err);
          } else {
            console.log("succeed", res);
          }
        });
        this.setState({
          selectedCard: null,
          description: "",
          timeId:""
        });
      }
    }

    if (e.target.id === "pickCard") {
      if (this.state.selectedCard != null) {
        let info = {
          game: this.state.gameName,
          card: this.state.selectedCard,
          playerIdx:this.state.playerIdx
        };
        Meteor.call("games.addCardToDesk", info, (err, res) => {
          
          if (err) {
            alert("There was error updating check the console");
            console.log(err);
          } else {
            console.log("succeed", res);
          }
        });
        this.setState({
          selectedCard: null,
          pickCount:1,
          timeId:""
        });
      }
    }

    if (e.target.id === "voteCard") {
      if (this.state.selectedCard != null) {
        let info = {
          game: this.state.gameName,
          card: this.state.selectedCard
        };
        Meteor.call("games.updateWinners", info, (err, res) => {
          //TODO: db test,combine with players, update winners
          if (err) {
            alert("There was error updating check the console");
            console.log(err);
          } else {
            console.log("succeed", res);
          }
        });
        this.setState({
          selectedCard: null,
          voteCount: 1,
          timeId:""
        });
      }
    }

    if (e.target.id === "exitGame") {//update user status, remove player from game, can exit only on stage 0 or 4?(before game starts
      Meteor.call("usersGames.exit", (err, res) => {
        if (err) {
          alert("There was error updating check the console");
          console.log(err);
        }
        console.log("succeed",res);
      });
      Meteor.call("games.removePlayer", this.state.gameName, (err, res) => {
        if (err) {
          alert("There was error updating check the console");
          console.log(err);
        }
        console.log("succeed",res);
      });
      //function: compute points, display result, stage = 0, idx++, reset all {count = 0, idx++,.....}
    }
  }

  // WORKED!!!  <div className="row">
  //   {this.props.myGame.map(game  => (
  //     <div key = {game._id}>{game.ingame ? "yes":"no"}</div>
  //   ))}
  // </div>

  // ALWAYS NO <div className="row">
  // {this.props.myGame.ingame ? "yes":"no"}
  // </div>
/*  Meteor.setTimeout(function() {
    console.log("Timeout called after three seconds...");
  }, 3000);*/
  render() {
    // console.log("state", this.state);
    // console.log("TEST: props.myGame.length:", this.props.myGame.length);
    // console.log("TEST: state.gameName: ", this.state.gameName);
    // console.log("TEST: state.stage: ", this.state.stage);
    // console.log("TEST: state.playerIdx: ", this.state.playerIdx);
    // console.log("TEST: state.hostIdx: ", this.state.hostIdx);
    // console.log("TEST: state.points: ", this.state.points);
    // console.log("TEST: state.description: ", this.state.description);
    // console.log("TEST: state.hostDescription: ", this.state.hostDescription);
    // console.log("TEST: state.selectedCard: ", this.state.selectedCard);
    // const stage0 = (
    //   <div className="container"id="HomePage" >
    //     <div className = "row">
    //       <p>Stage0, game created, click start game, wait for enough players</p>
    //       {this.state.buttonClick === 0?
    //         <button type="button" className="btn btn-outline-dark" id = "readyToStart" onClick = {this.onSubmit.bind(this)}>Ready!</button>
    //         :
    //         null
    //       }
    //     </div>
    //   </div>
    // );
    // const stage1 = (
    //   <div className="container"id="HomePage" >
    //     <div className = "row">
    //       <p>Stage1, each players get # of cards, host pick card and write description and submit, others wait</p><br/>
    //       <input type="text" className="form-control" id="description" placeholder="Enter description" onChange= {this.onChange.bind(this)}/>
    //       <button type="button" className="btn btn-outline-dark" id = "descriptionDone" onClick = {this.onSubmit.bind(this)}>Submit-stage1</button>
    //     </div>
    //   </div>
    // );
    // const stage2 = (
    //   <div className="container"id="HomePage" >
    //     <div className = "row">
    //       <p>Stage2, description displayed, host wait, others pick one card and submit</p>
    //       Card:{}
    //       Description: {}
    //       

    //     </div>
    //   </div>
    // );
    // const stage3 = (
    //   <div className="container"id="HomePage" >
    //     <div className = "row">
    //       <p>Stage3, display # cards, host wait, others vote for card and submit</p>
    //       
    //     </div>
    //   </div>
    // );
    // const stage4 = (
    //   <div className="container"id="HomePage" >
    //     <div className = "row">
    //       <p>Stage4, compute points and end game, remove game from db</p>
    //       <p>function: compute points
    //       DISPLAY RESULT</p>
    //     </div>
    //   </div>
    // );
    // <div className="row"><h6>Some player(s) is not responding, feel free to exit the game here.</h6><h2><button className = "btn btn-danger" id = "emergencyExit" onClick = {this.onSubmit}> EXIT </button></h2>
    // </div>
    const pickCard = 
    (<div id="chooseCard"> 
      <span> 你已经选择了: 
        {this.state.selectedCard === null ? null : (
          <span
            className="card col-xs-2 col-s-3"
            style={{
              backgroundImage: `url(${this.state.selectedCard.url})`,
              backgroundSize: "cover"
            }}
          />
        )}</span>
      
    </div> );
    // console.log("playerIdx",this.state.playerIdx);
    // console.log("hostIdx",this.state.hostIdx);
    
    return (

      <div className="container">
        <div className="row">
          <div className="d-none d-sm-block col-sm-2" id="scoreBoard">
            <h2 className="row"> 游戏房间 </h2>
            <p> 房间名: <br/><span className="boardInfo">{this.state.gameName}</span></p>
            <p> 回合: <span className="boardInfo">{this.state.hostIdx + 1}</span></p>
            <p> 讲述人:<br/><span className="boardInfo">{this.state.players[this.state.hostIdx]}</span></p>
            <h2 className="row"> 积分板 </h2>
            <div>
              {this.props.gameData.map(game => (
                <div key = {game._id}>{game.username} : <span className="boardInfo">{game.tempPoints}</span></div>
              ))}
            </div><br/>

            <h2 className="row"> 搜集卡牌: </h2>
            <div>
              {this.props.gameData.map(data => (
                <div key = {data._id}>
                  {data._id === Meteor.userId()? 
                    <div className="row">
                      {data.temp.map(card => (<div key = {card._id} className="card" style={{backgroundImage: `url(${card.url})`, backgroundSize: "cover"}}></div>))}
                    </div>
                    : null}
                </div>))} 
            </div>
            

          </div>

          <div className="col-sm-10 col-xs-12" id="gameBoard">
            <div className="pool">
              {this.state.stage == 5? null: <h2 className="row"> Pool </h2>}
              {this.state.stage > 1 && this.state.stage < 5 ?
                <div><h4 id="displayDescrition">讲述人对其卡牌的描述为: <span className="gameInfo">{this.state.hostDescription}</span></h4></div> 
                : 
                null
              }
              {this.state.stage == 0? <div> {this.state.readyCount==0? <div className="row">
                <h4>
                  <span id="badge" className="badge badge-pill badge-warning m-2">
                    点击准备按钮开始游戏!
                  </span>
                </h4>
              </div> : <div className="row">
                <h4>
                  <span id="badge" className="badge badge-pill badge-warning m-2">
                    等待其他人开始游戏!
                  </span>
                </h4>
              </div>} 
              </div>
                : 
                <div>
                  {this.state.stage === 2 && this.state.isHost? 
                    <div className="row">
                      <h4>
                        <span id="badge" className="badge badge-pill badge-warning m-2">
                          等待其他玩家选择卡牌!
                        </span>
                      </h4>
                    </div>
                    : 
                    null
                  }
                  {
                    this.state.stage === 5 ? 
                      <div id="gameOver" className = "text-center">
                        <div className = "text-center" >
                          <br/><br/><h1>游戏结束!</h1>
                          <h6>点击 "退出" 返回游戏大厅</h6><br/><br/>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <h4> 玩家积分板:</h4>
                            {this.props.gameData.map(game => (
                              <div key = {game._id}>{game.username} : <span className="boardInfo">{game.tempPoints}</span></div>
                            ))}
                            <br/>
                          </div>
                          <div className="col-6">
                            <h4> 你在本次游戏中赢得的搜集卡牌:</h4>
                            <div>{this.props.gameData.map(data => (
                              <div key = {data._id}>
                                {data._id === Meteor.userId()? <div className="row cards">{
                                  data.temp.map(card => (
                                    <div key = {card._id}
                                      className="card"
                                      style={{
                                        backgroundImage: `url(${card.url})`,
                                        backgroundSize: "cover"
                                      }}></div>
                                  ))}</div>:null}</div>
                            ))}</div>
                          </div>
                        </div><br/><br/><br/><br/>
                      </div>
                      :
                      null
                  }
                  {this.state.stage === 4?
                    <div className = "row">
                      <div className = "col-2"></div>
                      <div className = "col-4"><h4>答案是:</h4>
                        {this.props.myGame.map(game => (
                          <div key = {game._id}
                            className="card col-xs-4 col-s-3"
                            style={{
                              backgroundImage: `url(${game.targetCard.url})`,
                              backgroundSize: "cover"
                            }}></div>))}<br/></div>
                      <div className = "col-6"><h4>胜利者是:</h4>
                        {this.props.myGame.map(game => (
                          <div key = {game._id}
                            className="col-xs-4 col-s-3 winners">
                            {game.winners.map(winner =>(
                              <div key = {winner}>{winner}</div>
                            ))}
                          </div>))}</div>
                    </div>
                    : null
                  }
                  {this.state.stage === 3 && this.state.isHost ?
                    <div className="row">
                      <h4>
                        <span id="badge" className="badge badge-pill badge-warning m-2">
                          等待其他玩家投票选取卡牌!
                        </span>
                      </h4>
                    </div> : null
                  }
                  {this.state.stage === 3 && !this.state.isHost && this.state.voteCount===0?
                    <div className="row">
                      <div className = "col-7">
                        <h4>
                          <span id="badge" className="badge badge-pill badge-warning m-2">
                           请在卡牌池中投票选取你认为正确的卡牌!
                          </span>
                        </h4>
                      </div>
                      <div className = "col-3">
                        {pickCard}
                      </div>
                      <div className ="col-2">
                        <button type="button" className="btn btn-danger" id = "voteCard" onClick = {this.onSubmit}>投票</button> 
                      </div>
                    </div> : null
                  }
                  {this.state.cardsOnDesk.length === this.state.players.length? 
                    (<div className="row" id="cardsOnDesk">
                      {this.state.cardsOnDesk.map(cardOnDesk => (
                        <div key={cardOnDesk._id}
                          className="card col-xs-6 col-s-3"
                          style={{
                            backgroundImage: `url(${cardOnDesk.url})`,
                            backgroundSize: "cover"
                          }}
                          onClick={() =>
                            this.setState({ selectedCard: cardOnDesk })
                          }
                        >
                        </div>
                      ))}
                    </div>)
                    : 
                    <div>{(this.state.stage === 1 && this.state.cardsOnDesk.length === 0) ? 
                      (<div className="row">
                        <h4>
                          <span id="badge" className="badge badge-pill badge-warning m-2">
                          等待 "{this.state.players[this.state.hostIdx]}" 选择一张卡牌并对其进行描述...
                          </span>
                        </h4>
                      </div>)
                      : 
                      (<div className="row">
                        {this.state.stage === 2 ?
                          <h4>
                            <span id="badge" className="badge badge-pill badge-warning m-2">
                            等待其他 { this.state.players.length - this.state.cardsOnDesk.length} 名玩家选取卡牌!
                            </span> </h4>: null}
                      </div>       
                      )
                    }</div>
                  }</div>}
            </div>
            <div className = "row hand">
              <div className = "col-12">
                <h2 className="row"> 我手中的牌 </h2>
              </div>
              <div className = "col-4">
                <div>{(this.state.stage === 2 && !this.state.isHost && this.state.pickCount===0 ? 
                  (<div className="row">
                    <h4>
                      <span id="badge" className="badge badge-pill badge-warning m-2">
                      请在手中的卡牌中选择1张!
                      </span>
                    </h4>
                  </div>)
                  : 
                  null)}</div>
                <div>
                  {this.state.stage == 1 && this.state.isHost ? 
                    <div className="row" id="textbox">
                      <form>
                        <div className="form-group from -inline">
                          <input
                            type=""
                            className="form-control"
                            id="description"
                            aria-describedby="description"
                            value={this.state.description}
                            onChange={this.onChange}
                            placeholder="输入描述文字..."
                          />
                          <small id="detail" className="form-text text-muted">
                            提示：当至少有1个人猜中但又不是所有人都猜中时，你获得胜利积分
                          </small>
                        </div>
                      </form>
                    </div>: null}
                </div>
              </div>
              
              <div className = "col-2">
                
              </div>
              <div className = "col-3">
                {this.state.stage === 0 && this.state.readyCount === 0? (<button type="button" className="btn btn-danger" id = "readyToStart" onClick = {this.onSubmit.bind(this)}>准备!</button>):
                  <div className="row" >
                    {(this.state.isHost && this.state.stage === 1) || (!this.state.isHost && this.state.stage == 2)? pickCard :null}
                  </div>}
              </div>
              <div className = "col-3">
                {this.state.stage === 0 || this.state.stage == 5 ? <button type="button" className="btn btn-dark" id = "exitGame" onClick = {this.onSubmit}>退出</button>: null}
                {this.state.stage === 1 && this.state.isHost ? <button type="submit" className="btn btn-danger" id="descriptionDone" onClick={this.onSubmit} > 提交 </button>:null}
                {this.state.stage === 2 && !this.state.isHost && this.state.pickCount === 0? <button type="button" className="btn btn-danger" id = "pickCard" onClick = {this.onSubmit}>确认选取</button> : null}
                {(this.state.stage === 4 && this.state.hostIdx < this.state.players.length - 1) ? <button type="button" className="btn btn-outline-dark" id = "readyToStart" onClick = {this.onSubmit}>下一轮</button>: null}     
                {(this.state.stage === 4 && this.state.hostIdx == this.state.players.length - 1) ? <button type="button" className="btn btn-outline-dark" id = "readyToStart" onClick = {this.onSubmit}>下一轮</button>: null}     
              </div>
            </div>
            {!this.state.cardsOnHand || this.state.cardsOnHand.length === 0 || this.state.stage == 0? null 
              : (
                <div className="row" id="cardsInHand">
                  {this.state.cardsOnHand.map(cardOnHand => (
                    <div
                      key={cardOnHand._id}
                      className="card col-xs-6 col-s-3"
                      onClick={() =>
                        this.setState({ selectedCard: cardOnHand })
                      }
                      style={{
                        backgroundImage: `url(${cardOnHand.url})`,
                        backgroundSize: "cover"
                      }}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
}

MyGame.propTypes = {
  myGame: PropTypes.arrayOf(PropTypes.object).isRequired,
  gameData: PropTypes.arrayOf(PropTypes.object).isRequired,
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired
};

export default withTracker(() => {
  const handle = Meteor.subscribe("myGame");
  const handle2 = Meteor.subscribe("gameData");
  const handle3 = Meteor.subscribe("cards");
  return {
    user: Meteor.user(),
    ready: handle.ready() || handle2.ready() || handle3.ready(),
    myGame: Games.find({}).fetch(),
    gameData: UsersGames.find({}).fetch(),
    cards: Cards.find({}).fetch()
  };
})(MyGame);