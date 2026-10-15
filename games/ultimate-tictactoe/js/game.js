/**
 * 对局状态机。AI 只需调用 legalMoves / play / clone。
 */
window.JJZQ = window.JJZQ || {};

JJZQ.Game = function Game() {
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
};

JJZQ.Game.prototype.clone = function () {
  var copy = Object.create(JJZQ.Game.prototype);
  copy.boards = this.boards.map(function (local) {
    return local.slice();
  });
  copy.localResults = this.localResults.slice();
  copy.currentPlayer = this.currentPlayer;
  copy.activeBoard = this.activeBoard;
  copy.winner = this.winner;
  copy.lastMove = this.lastMove ? { board: this.lastMove.board, cell: this.lastMove.cell } : null;
  copy.moveCount = this.moveCount;
  return copy;
};

JJZQ.Game.prototype.isOver = function () {
  return this.winner !== null;
};

JJZQ.Game.prototype.boardIsOpen = function (boardIndex) {
  return JJZQ.board.isPlayable(this.localResults[boardIndex]);
};

JJZQ.Game.prototype.legalMoves = function () {
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

JJZQ.Game.prototype.play = function (boardIndex, cellIndex) {
  if (!this.canPlay(boardIndex, cellIndex)) {
    return false;
  }

  this.boards[boardIndex][cellIndex] = this.currentPlayer;
  this.localResults[boardIndex] = JJZQ.board.localResult(this.boards[boardIndex]);
  this.lastMove = { board: boardIndex, cell: cellIndex };
  this.activeBoard = this.boardIsOpen(cellIndex) ? cellIndex : null;
  this.moveCount += 1;

  this.winner = JJZQ.board.lineWinner(JJZQ.board.metaCells(this.localResults));
  if (!this.winner && this.legalMoves().length === 0) {
    this.winner = "D";
  }

  if (!this.isOver()) {
    this.currentPlayer =
      this.currentPlayer === JJZQ.PLAYERS.X ? JJZQ.PLAYERS.O : JJZQ.PLAYERS.X;
  }

  return true;
};
