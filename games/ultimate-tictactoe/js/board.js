/**
 * 纯棋盘判定：不依赖 DOM，可供 UI 与未来的 AI 搜索共用。
 */
window.JJZQ = window.JJZQ || {};

JJZQ.board = {
  emptyLocal: function () {
    return [null, null, null, null, null, null, null, null, null];
  },

  emptyMeta: function () {
    var boards = [];
    var i;
    for (i = 0; i < 9; i += 1) {
      boards.push(JJZQ.board.emptyLocal());
    }
    return boards;
  },

  lineWinner: function (cells) {
    var lines = JJZQ.WIN_LINES;
    var i;
    var a;
    var b;
    var c;
    for (i = 0; i < lines.length; i += 1) {
      a = lines[i][0];
      b = lines[i][1];
      c = lines[i][2];
      if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
        return cells[a];
      }
    }
    return null;
  },

  isFull: function (cells) {
    var i;
    for (i = 0; i < 9; i += 1) {
      if (!cells[i]) {
        return false;
      }
    }
    return true;
  },

  /**
   * @returns {"X"|"O"|"D"|null} D 表示下满无人连线
   */
  localResult: function (cells) {
    var winner = JJZQ.board.lineWinner(cells);
    if (winner) {
      return winner;
    }
    if (JJZQ.board.isFull(cells)) {
      return "D";
    }
    return null;
  },

  isPlayable: function (result) {
    return result === null;
  },

  /**
   * 大棋盘占格：平局格不计入任何一方。
   */
  metaCells: function (localResults) {
    return localResults.map(function (result) {
      return result === "X" || result === "O" ? result : null;
    });
  },
};
