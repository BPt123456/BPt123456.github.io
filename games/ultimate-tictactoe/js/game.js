/**
 * 对局状态机。AI 只需调用 legalMoves / play / clone。
 *
 * 规则模式（ruleMode）：
 *   - classic 传统模式：大小棋盘连线即定胜负；
 *   - score   积分模式：在传统判定之上叠加积分结算 ——
 *             落子按落点位置扣分、小棋盘连线按该盘位置奖励、
 *             大棋盘连线再奖励，终局比积分高者获胜。
 */
window.JJZQ = window.JJZQ || {};

JJZQ.Game = function Game(ruleMode) {
  this.ruleMode =
    ruleMode === JJZQ.RULE_MODES.SCORE ? JJZQ.RULE_MODES.SCORE : JJZQ.RULE_MODES.CLASSIC;
  this.reset();
};

JJZQ.Game.prototype.reset = function () {
  this.boards = JJZQ.board.emptyMeta();
  this.localResults = [null, null, null, null, null, null, null, null, null];
  this.currentPlayer = JJZQ.PLAYERS.X;
  this.activeBoard = null;
  this.winner = null;
  this.lastMove = null;
  this.moveCount = 0;
  // 积分仅在积分模式下参与结算，但两种模式都初始化，简化 clone 与渲染。
  this.scores = {};
  this.scores[JJZQ.PLAYERS.X] = JJZQ.SCORE_RULES.start;
  this.scores[JJZQ.PLAYERS.O] = JJZQ.SCORE_RULES.start;
  this.lastLineBonus = null;
};

JJZQ.Game.prototype.isScoreMode = function () {
  return this.ruleMode === JJZQ.RULE_MODES.SCORE;
};

JJZQ.Game.prototype.clone = function () {
  var copy = Object.create(JJZQ.Game.prototype);
  copy.ruleMode = this.ruleMode;
  copy.boards = this.boards.map(function (local) {
    return local.slice();
  });
  copy.localResults = this.localResults.slice();
  copy.currentPlayer = this.currentPlayer;
  copy.activeBoard = this.activeBoard;
  copy.winner = this.winner;
  copy.lastMove = this.lastMove ? { board: this.lastMove.board, cell: this.lastMove.cell } : null;
  copy.moveCount = this.moveCount;
  copy.scores = {};
  copy.scores[JJZQ.PLAYERS.X] = this.scores[JJZQ.PLAYERS.X];
  copy.scores[JJZQ.PLAYERS.O] = this.scores[JJZQ.PLAYERS.O];
  copy.lastLineBonus = this.lastLineBonus
    ? {
        board: this.lastLineBonus.board,
        player: this.lastLineBonus.player,
        amount: this.lastLineBonus.amount,
      }
    : null;
  return copy;
};

JJZQ.Game.prototype.isOver = function () {
  return this.winner !== null;
};

JJZQ.Game.prototype.boardIsOpen = function (boardIndex) {
  return JJZQ.board.isPlayable(this.localResults[boardIndex]);
};

/**
 * 只按棋盘状态列出全部可落点，不考虑积分是否付得起。
 * UI 用它来区分「付得起的格子」与「付不起的格子」。
 */
JJZQ.Game.prototype.allLegalMoves = function () {
  var moves = [];
  var boardsToScan = [];
  var i;
  var cell;
  var boardIndex;

  if (this.isOver()) {
    return moves;
  }

  if (this.activeBoard !== null && this.boardIsOpen(this.activeBoard)) {
    boardsToScan.push(this.activeBoard);
  } else {
    for (i = 0; i < 9; i += 1) {
      if (this.boardIsOpen(i)) {
        boardsToScan.push(i);
      }
    }
  }

  for (i = 0; i < boardsToScan.length; i += 1) {
    boardIndex = boardsToScan[i];
    for (cell = 0; cell < 9; cell += 1) {
      if (!this.boards[boardIndex][cell]) {
        moves.push({ board: boardIndex, cell: cell });
      }
    }
  }
  return moves;
};

JJZQ.Game.prototype.legalMoves = function () {
  var moves = this.allLegalMoves();
  var budget;

  if (!this.isScoreMode()) {
    return moves;
  }

  // 积分模式不允许透支，只能落在付得起的格子上。
  budget = this.scores[this.currentPlayer];
  return moves.filter(function (move) {
    return JJZQ.score.moveCost(move.cell) <= budget;
  });
};

JJZQ.Game.prototype.canPlay = function (boardIndex, cellIndex) {
  var moves = this.legalMoves();
  var i;
  for (i = 0; i < moves.length; i += 1) {
    if (moves[i].board === boardIndex && moves[i].cell === cellIndex) {
      return true;
    }
  }
  return false;
};

/**
 * 积分模式终局：纯粹比较积分，高者胜，持平为和。
 */
JJZQ.Game.prototype.finalizeScores = function () {
  var x = this.scores[JJZQ.PLAYERS.X];
  var o = this.scores[JJZQ.PLAYERS.O];
  if (x > o) {
    this.winner = JJZQ.PLAYERS.X;
  } else if (o > x) {
    this.winner = JJZQ.PLAYERS.O;
  } else {
    this.winner = "D";
  }
};

JJZQ.Game.prototype.play = function (boardIndex, cellIndex) {
  if (!this.canPlay(boardIndex, cellIndex)) {
    return false;
  }

  var player = this.currentPlayer;
  var scoreMode = this.isScoreMode();
  var reward;

  this.boards[boardIndex][cellIndex] = player;
  this.localResults[boardIndex] = JJZQ.board.localResult(this.boards[boardIndex]);
  this.lastMove = { board: boardIndex, cell: cellIndex };
  this.activeBoard = this.boardIsOpen(cellIndex) ? cellIndex : null;
  this.moveCount += 1;
  this.lastLineBonus = null;

  if (scoreMode) {
    // 每次落子都扣分；legalMoves 已保证付得起，故不会扣成负数。
    this.scores[player] -= JJZQ.score.moveCost(cellIndex);
    // 该盘此前必然是进行中（否则不是合法落点），本手拿下时才结算连线奖励。
    if (this.localResults[boardIndex] === player) {
      reward = JJZQ.score.lineReward(boardIndex);
      this.scores[player] += reward;
      this.lastLineBonus = { board: boardIndex, player: player, amount: reward };
    }
  }

  var metaWinner = JJZQ.board.lineWinner(JJZQ.board.metaCells(this.localResults));

  if (!scoreMode) {
    this.winner = metaWinner;
    if (!this.winner && this.legalMoves().length === 0) {
      this.winner = "D";
    }
  } else if (metaWinner) {
    // 大棋盘连线：额外奖励后立即结算。
    this.scores[metaWinner] += JJZQ.SCORE_RULES.metaLineReward;
    this.finalizeScores();
  } else if (this.legalMoves().length === 0) {
    // 双方（或下一手一方）都无处可下：棋盘填满，或可支付的格子用尽。
    this.finalizeScores();
  } else if (this.scores[JJZQ.PLAYERS.X] <= 0 || this.scores[JJZQ.PLAYERS.O] <= 0) {
    // 有一方积分清零（恰好花光）。
    this.finalizeScores();
  }

  if (!this.isOver()) {
    this.currentPlayer =
      this.currentPlayer === JJZQ.PLAYERS.X ? JJZQ.PLAYERS.O : JJZQ.PLAYERS.X;
  }

  return true;
};
