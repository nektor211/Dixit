import React, { Component } from "react";

class About extends Component {
  render() {
    return (
      <div className="container homepage">
        <div className="container content">
          <div className="row">
            <div className="col-9 offset-1">
              <div className="About">
                <h2>
                  <span id="badge" className="badge badge-pill badge-dark">
                   说明
                  </span>
                </h2>
                <h5> Dixit中文名“只言片语”是一种纸牌游戏，使用一副配有梦幻图像的纸牌，
                    玩家选择与“故事讲述者”建议的标题相匹配的卡片
                    尝试为“故事讲述者”选择的卡片投票…</h5> 
              </div>
              <div className="Game SetUP">
                <h2>
                  <span id="badge" className="badge badge-pill badge-dark">
                   玩家人数
                  </span>
                </h2>
                <h5>
                  3-6
                </h5>
              </div>
              <div className="Rules">
                <h2>
                  <span id="badge" className="badge badge-pill badge-dark">
                   游戏规则
                  </span>
                </h2>
                <h5>
                  <ul>
                    <li>讲述人选择一张卡牌并给出一段描述</li>
                    <li>其他玩家从手牌中选择与描述最贴近的一张牌，放入牌池</li>
                    <li>玩家在牌池中投票，尽量猜出哪一张是讲述人的牌</li>
                    <li>每一个玩家轮流成为讲述人</li>
                  </ul>
                </h5>
              </div>
              <div className="Scores">
                <h2>
                  <span id="badge" className="badge badge-pill badge-dark">
                   得分
                  </span>
                </h2>
                <h5>
                  <ul>
                    <li>其他玩家猜中讲述人的卡牌时，加1分</li>
                    <li>当有人猜中讲述人的卡牌，但不是全部全猜中时，讲述人加3分</li>
                  </ul>
                </h5>
              </div>
              <div className="Play">
                <h2>
                  <span id="badge" className="badge badge-pill badge-warning">
                   注册并游玩吧！
                  </span>
                </h2>
                <p></p>
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }
}

export default About;