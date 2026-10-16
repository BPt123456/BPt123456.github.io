/**
 * DOM 渲染与交互。棋规全部走 Game，方便以后换渲染层。
 */
window.JJZQ = window.JJZQ || {};

JJZQ.ui = {
  game: null,
  mode: JJZQ.MODES.HOTSEAT,
  ruleMode: JJZQ.RULE_MODES.CLASSIC,
  aiId: "master",
  humanPlayer: JJZQ.PLAYERS.X,
  aiTimer: null,

  els: {},

  init: function (game) {
    this.game = game;
    this.els.meta = document.getElementById("meta-board");
    this.els.status = document.getElementById("status");
    this.els.rule = document.getElementById("rule-select");
    this.els.mode = document.getElementById("mode-select");
    this.els.difficulty = document.getElementById("difficulty-select");
    this.els.theme = document.getElementById("theme-select");
    this.els.restart = document.getElementById("restart-btn");
    this.els.scoreboard = document.getElementById("scoreboard");
    this.els.scoreX = document.getElementById("score-x");
    this.els.scoreO = document.getElementById("score-o");

    if (this.els.rule) {
      this.ruleMode = this.els.rule.value || this.ruleMode;
      this.game.ruleMode = this.ruleMode;
    }

    if (this.els.difficulty) {
      this.aiId = this.els.difficulty.value || this.aiId;
    }

    this.buildBoard();
    this.bind();
    this.render();
  },

  bind: function () {
    var self = this;

    this.els.meta.addEventListener("click", function (event) {
      var cell = event.target.closest("[data-cell]");
      if (!cell) {
        return;
      }
      self.onCellClick(
        Number(cell.getAttribute("data-board")),
        Number(cell.getAttribute("data-cell"))
      );
    });

    this.els.restart.addEventListener("click", function () {
      self.restart();
    });

    if (this.els.rule) {
      this.els.rule.addEventListener("change", function () {
        self.ruleMode = self.els.rule.value;
        self.game.ruleMode = self.ruleMode;
        self.restart();
      });
    }

    this.els.mode.addEventListener("change", function () {
      self.mode = self.els.mode.value;
      self.restart();
    });

    if (this.els.difficulty) {
      this.els.difficulty.addEventListener("change", function () {
        self.aiId = self.els.difficulty.value;
        self.restart();
      });
    }

    this.els.theme.addEventListener("change", function () {
      JJZQ.themes.apply(self.els.theme.value);
    });
  },

  buildBoard: function () {
    var html = "";
    var b;
    var c;
    for (b = 0; b < 9; b += 1) {
      html += '<div class="local-board" data-local="' + b + '">';
      html += '<div class="local-grid">';
      for (c = 0; c < 9; c += 1) {
        html +=
          '<button type="button" class="cell" data-board="' +
          b +
          '" data-cell="' +
          c +
          '" aria-label="第' +
          (b + 1) +
          "盘第" +
          (c + 1) +
          '格"></button>';
      }
      html += "</div>";
      html += '<div class="local-banner" aria-hidden="true"></div>';
      html += "</div>";
    }
    this.els.meta.innerHTML = html;
  },

  restart: function () {
    if (this.aiTimer) {
      clearTimeout(this.aiTimer);
      this.aiTimer = null;
    }
    this.game.reset();
    this.render();
    this.maybeLetAiMove();
  },

  onCellClick: function (boardIndex, cellIndex) {
    if (this.mode === JJZQ.MODES.AI && this.game.currentPlayer !== this.humanPlayer) {
      return;
    }
    if (!this.game.play(boardIndex, cellIndex)) {
      return;
    }
    this.render();
    this.maybeLetAiMove();
  },

  maybeLetAiMove: function () {
    var self = this;
    var bot;
    var move;
    if (this.mode !== JJZQ.MODES.AI || this.game.isOver()) {
      return;
    }
    if (this.game.currentPlayer === this.humanPlayer) {
      return;
    }
    bot = JJZQ.AI.get(this.aiId);
    this.aiTimer = setTimeout(function () {
      move = bot.chooseMove(self.game);
      if (move && !self.game.isOver()) {
        self.game.play(move.board, move.cell);
      }
      self.render();
    }, 280);
  },

  markLabel: function (mark) {
    if (mark === "X") {
      return "甲";
    }
    if (mark === "O") {
      return "乙";
    }
    return "";
  },

  difficultyLabel: function () {
    var list = JJZQ.DIFFICULTIES || [];
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i].id === this.aiId) {
        return list[i].label;
      }
    }
    return "电脑";
  },

  render: function () {
    var game = this.game;
    var scoreMode = game.isScoreMode();
    var freeMove = game.activeBoard === null && !game.isOver();
    var locals = this.els.meta.querySelectorAll("[data-local]");
    var legalSet = {};
    var moves = game.legalMoves();
    var budget = scoreMode ? game.scores[game.currentPlayer] : Infinity;
    var i;
    var boardEl;
    var boardIndex;
    var result;
    var open;
    var active;
    var cells;
    var c;
    var mark;
    var legal;
    var last;
    var cost;

    for (i = 0; i < moves.length; i += 1) {
      legalSet[moves[i].board + "-" + moves[i].cell] = true;
    }

    if (this.els.scoreboard) {
      this.els.scoreboard.hidden = !scoreMode;
      if (scoreMode) {
        this.els.scoreX.textContent = game.scores[JJZQ.PLAYERS.X];
        this.els.scoreO.textContent = game.scores[JJZQ.PLAYERS.O];
        this.els.scoreX.parentNode.classList.toggle(
          "is-active",
          game.winner === JJZQ.PLAYERS.X ||
            (!game.isOver() && game.currentPlayer === JJZQ.PLAYERS.X)
        );
        this.els.scoreO.parentNode.classList.toggle(
          "is-active",
          game.winner === JJZQ.PLAYERS.O ||
            (!game.isOver() && game.currentPlayer === JJZQ.PLAYERS.O)
        );
        this.els.scoreX.parentNode.classList.toggle("is-low", game.scores[JJZQ.PLAYERS.X] <= 30);
        this.els.scoreO.parentNode.classList.toggle("is-low", game.scores[JJZQ.PLAYERS.O] <= 30);
      }
    }

    for (i = 0; i < locals.length; i += 1) {
      boardEl = locals[i];
      boardIndex = Number(boardEl.getAttribute("data-local"));
      result = game.localResults[boardIndex];
      open = game.boardIsOpen(boardIndex);
      active = !game.isOver() && (game.activeBoard === boardIndex || (freeMove && open));

      boardEl.classList.toggle("is-open", open);
      boardEl.classList.toggle("is-active", active);
      boardEl.classList.toggle("is-won-x", result === "X");
      boardEl.classList.toggle("is-won-o", result === "O");
      boardEl.classList.toggle("is-draw", result === "D");
      boardEl.classList.toggle(
        "is-new-win",
        Boolean(game.lastLineBonus) && game.lastLineBonus.board === boardIndex
      );

      boardEl.querySelector(".local-banner").textContent =
        result === "X" || result === "O" ? this.markLabel(result) : result === "D" ? "和" : "";

      cells = boardEl.querySelectorAll("[data-cell]");
      for (c = 0; c < cells.length; c += 1) {
        mark = game.boards[boardIndex][c];
        legal = Boolean(legalSet[boardIndex + "-" + c]);
        last =
          game.lastMove &&
          game.lastMove.board === boardIndex &&
          game.lastMove.cell === c;
        cost = scoreMode ? JJZQ.score.moveCost(c) : 0;
        cells[c].textContent = this.markLabel(mark);
        cells[c].classList.toggle("is-x", mark === "X");
        cells[c].classList.toggle("is-o", mark === "O");
        cells[c].classList.toggle("is-legal", legal);
        cells[c].classList.toggle("is-last", last);
        cells[c].classList.toggle(
          "is-unaffordable",
          scoreMode && !mark && open && cost > budget
        );
        cells[c].disabled = !legal;
        // 积分模式下在空格上标出花费，方便规划；付不起的格子标红。
        if (scoreMode && !mark && open) {
          cells[c].setAttribute("data-cost", cost);
          cells[c].classList.add("has-cost");
        } else {
          cells[c].classList.remove("has-cost");
          cells[c].removeAttribute("data-cost");
        }
        if (this.mode === JJZQ.MODES.AI && game.currentPlayer !== this.humanPlayer) {
          cells[c].disabled = true;
        }
      }
    }

    this.els.status.textContent = this.statusText();
    this.els.status.dataset.state = game.winner || game.currentPlayer;
  },

  statusText: function () {
    var game = this.game;
    var scoreMode = game.isScoreMode();
    var name;
    var suffix;

    if (game.winner) {
      if (scoreMode) {
        var summary =
          "甲 " + game.scores[JJZQ.PLAYERS.X] + " 分，乙 " + game.scores[JJZQ.PLAYERS.O] + " 分。";
        if (game.winner === "D") {
          return "和棋，积分相同。" + summary;
        }
        return this.markLabel(game.winner) + " 积分领先，获胜。" + summary;
      }
      if (game.winner === "D") {
        return "和棋。大棋盘无人连线。";
      }
      return this.markLabel(game.winner) + " 在大棋盘连成一线，获胜。";
    }

    name = this.markLabel(game.currentPlayer);
    suffix = scoreMode ? "（剩 " + game.scores[game.currentPlayer] + " 分）" : "";

    if (this.mode === JJZQ.MODES.AI && game.currentPlayer !== this.humanPlayer) {
      return "电脑（" + this.difficultyLabel() + "·" + name + "）思考中…";
    }
    if (game.activeBoard === null) {
      return name + " 手" + suffix + "：可在任意未结束的小棋盘落子。";
    }
    return name + " 手" + suffix + "：请下在高亮的小棋盘。";
  },
};
