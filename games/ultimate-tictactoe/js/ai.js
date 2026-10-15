/**
 * AI 对手注册表。
 * 新增算法：实现 chooseMove(game) 并登记到 JJZQ.AI.bots。
 * chooseMove 必须返回 { board, cell } 或 null。
 *
 * 本文件内置一个「评估函数 + Alpha-Beta 搜索 + 迭代加深」引擎，
 * 并据此提供三档难度：
 *   - novice  新手：随机为主，偶尔走对
 *   - adept   老手：浅层搜索 + 主动失误率
 *   - master  宗师：深层迭代加深搜索，深度优先于时间上限
 */
window.JJZQ = window.JJZQ || {};

JJZQ.AI = {
  bots: {},

  register: function (id, bot) {
    this.bots[id] = bot;
  },

  get: function (id) {
    return this.bots[id] || this.bots.random;
  },
};

/* =======================================================================
 * 搜索引擎
 * ======================================================================= */

JJZQ.AI.engine = (function () {
  var LINES = JJZQ.WIN_LINES;
  var OPP = {};
  OPP[JJZQ.PLAYERS.X] = JJZQ.PLAYERS.O;
  OPP[JJZQ.PLAYERS.O] = JJZQ.PLAYERS.X;

  // 落点价值：中心 / 角 / 边。
  var CELL_VALUE = [3, 2, 3, 2, 4, 2, 3, 2, 3];

  function other(player) {
    return OPP[player];
  }

  function now() {
    return typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
  }

  /**
   * 评估某个小棋盘对 a 的价值（正数利 a，负数利对方）。
   */
  function localScore(cells, a) {
    var b = other(a);
    var i;
    var line;
    var av;
    var bv;
    var ca;
    var cb;
    var score = 0;

    for (i = 0; i < LINES.length; i += 1) {
      line = LINES[i];
      ca = 0;
      cb = 0;

      if (cells[line[0]] === a) {
        ca += 1;
      } else if (cells[line[0]] === b) {
        cb += 1;
      }
      if (cells[line[1]] === a) {
        ca += 1;
      } else if (cells[line[1]] === b) {
        cb += 1;
      }
      if (cells[line[2]] === a) {
        ca += 1;
      } else if (cells[line[2]] === b) {
        cb += 1;
      }

      av = ca > 0 && cb === 0 ? ca : 0;
      bv = cb > 0 && ca === 0 ? cb : 0;

      if (av > 0) {
        score += av === 3 ? 1000 : av === 2 ? 60 : 4;
      }
      if (bv > 0) {
        score -= bv === 3 ? 1000 : bv === 2 ? 60 : 4;
      }
    }
    return score;
  }

  /**
   * 大棋盘各格对 a 的价值（即每个小棋盘的胜负价值）。
   */
  function metaValue(localResults, a) {
    return localResults.map(function (result) {
      if (result === a) {
        return 1;
      }
      if (result === other(a)) {
        return -1;
      }
      return 0;
    });
  }

  /**
   * 线路潜力：为 a 统计仍然有希望的线的数量（含空线与单子线）。
   */
  function metaPotential(mv, a) {
    var i;
    var line;
    var blocked;
    var count = 0;

    for (i = 0; i < LINES.length; i += 1) {
      line = LINES[i];
      blocked = false;
      if (mv[line[0]] === -1 || mv[line[1]] === -1 || mv[line[2]] === -1) {
        blocked = true;
      }
      if (!blocked) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * 评估函数：返回以 a 为视角的分值（己方越优分值越大）。
   *
   * game.winner === "D" 时静态评估约为 0，不当作负无穷，这样
   * 搜索不会因为「逼平」而被判为灾难，宗师档更愿意选择不败路线。
   */
  function evaluate(game, a) {
    var b = other(a);
    var mv = metaValue(game.localResults, a);
    var i;
    var line;
    var s;
    var w;
    var cells;
    var result;
    var aThreats = 0;
    var bThreats = 0;
    var score = 0;

    if (game.winner === a) {
      return 500000 - game.moveCount * 10;
    }
    if (game.winner === b) {
      return -500000 + game.moveCount * 10;
    }
    if (game.winner === "D") {
      return 0;
    }

    // 大棋盘胜线威胁：按格子价值加权，并识别「双重威胁」（两条线同时成型）。
    for (i = 0; i < LINES.length; i += 1) {
      line = LINES[i];
      s = mv[line[0]] + mv[line[1]] + mv[line[2]];
      w = 1 + (CELL_VALUE[line[0]] + CELL_VALUE[line[1]] + CELL_VALUE[line[2]]) * 0.06;
      if (s > 0) {
        score += s * s * 220 * w;
        if (s === 2) {
          aThreats += 1;
        }
      } else if (s < 0) {
        score -= s * s * 220 * w;
        if (s === -2) {
          bThreats += 1;
        }
      }
    }
    if (aThreats >= 2) {
      score += 3600 * aThreats;
    }
    if (bThreats >= 2) {
      score -= 3600 * bThreats;
    }

    // 线路潜力差。
    score += (metaPotential(mv, a) - metaPotential(mv, b)) * 25;

    // 进行中的小棋盘：越有价值的格子，其小棋盘争夺越重要。
    for (i = 0; i < 9; i += 1) {
      result = game.localResults[i];
      if (result === null) {
        cells = game.boards[i];
        score += localScore(cells, a) * (0.05 + CELL_VALUE[i] * 0.02);
      }
    }

    // 行动权价值：会被送去哪里很重要。
    if (game.activeBoard !== null) {
      if (game.localResults[game.activeBoard] === null) {
        score += localScore(game.boards[game.activeBoard], a) * 0.45;
      }
    } else {
      // 自由落子：规避把对手送进对他有利的棋盘。
      var worst = 0;
      for (i = 0; i < 9; i += 1) {
        if (game.localResults[i] === null) {
          var v = localScore(game.boards[i], a);
          if (v < worst) {
            worst = v;
          }
        }
      }
      score -= worst * 0.15;
    }

    return score;
  }

  /**
   * 落子排序权重：吃子 / 造线优先，其次高价值格。
   */
  function moveScore(game, move, a, sign, depth) {
    var s = 0;
    var mv = metaValue(game.localResults, a);
    var line;

    // 让该格成为大棋盘胜负关键点。
    var cells = game.localResults.slice();
    cells[move.board] = a;
    var mvv = metaValue(cells, a);
    var i;
    for (i = 0; i < LINES.length; i += 1) {
      line = LINES[i];
      if (
        (line[0] === move.board || line[1] === move.board || line[2] === move.board) &&
        mvv[line[0]] + mvv[line[1]] + mvv[line[2]] >= 2
      ) {
        s += 500;
      }
    }
    if (mv[move.board] === 0) {
      s += 80;
    }
    s += CELL_VALUE[move.cell] * 3;
    s += localScore(game.boards[move.board], a) * 2;
    s -= localScore(game.boards[move.board], other(a)) * 3;
    s += depth * 0.0001;
    // 轻微随机抖动：让等价走法的顺序略有变化，增加对局多样性。
    s += Math.random() * 0.5;
    return s;
  }

  /**
   * 对 legalMoves() 结果排序。
   */
  function orderMoves(game, moves, a, sign, depth) {
    var scored = moves.map(function (move) {
      return { move: move, s: moveScore(game, move, a, sign, depth) };
    });
    scored.sort(function (p, q) {
      return q.s - p.s;
    });
    return scored.map(function (item) {
      return item.move;
    });
  }

  function search(game, depth, alpha, beta, a, sign, deadline, counter) {
    counter.nodes += 1;
    if (counter.nodes % 2048 === 0 && now() > deadline) {
      counter.timeout = true;
    }
    if (counter.timeout) {
      return sign * evaluate(game, a);
    }

    if (game.isOver()) {
      return sign * evaluate(game, a);
    }
    if (depth <= 0) {
      return sign * evaluate(game, a);
    }

    var moves = orderMoves(game, game.legalMoves(), a, sign, depth);
    var best = -Infinity;
    var i;
    var child;
    var value;

    for (i = 0; i < moves.length; i += 1) {
      child = game.clone();
      child.play(moves[i].board, moves[i].cell);
      value = -search(child, depth - 1, -beta, -alpha, a, -sign, deadline, counter);
      if (value > best) {
        best = value;
      }
      if (best > alpha) {
        alpha = best;
      }
      if (alpha >= beta) {
        break;
      }
    }
    return best;
  }

  /**
   * 迭代加深的根搜索，返回 { move, value }。
   */
  function plan(game, options) {
    var a = game.currentPlayer;
    var moves = game.legalMoves();
    if (moves.length === 0) {
      return { move: null, value: 0 };
    }

    var maxDepth = options.maxDepth || 6;
    var timeLimit = options.timeLimit || 1500;
    var deadline = now() + timeLimit;
    var counter = { nodes: 0, timeout: false };
    var bestMove = null;
    var bestValue = 0;
    var depth;
    var sign = 1;

    for (depth = 1; depth <= maxDepth; depth += 1) {
      counter.timeout = false;
      var ordered = orderMoves(game, moves, a, sign, depth);
      var localBest = null;
      var localValue = -Infinity;
      var alpha = -Infinity;
      var i;

      for (i = 0; i < ordered.length; i += 1) {
        var child = game.clone();
        child.play(ordered[i].board, ordered[i].cell);
        var value = -search(
          child,
          depth - 1,
          -Infinity,
          -alpha,
          a,
          -1,
          deadline,
          counter
        );
        if (value > localValue) {
          localValue = value;
          localBest = ordered[i];
        }
        if (value > alpha) {
          alpha = value;
        }
        if (counter.timeout) {
          break;
        }
      }

      if (counter.timeout && depth > 1) {
        break;
      }

      if (localBest) {
        bestMove = localBest;
        bestValue = localValue;
      }

      if (bestValue >= 400000 || depth >= maxDepth) {
        break;
      }
      if (now() > deadline) {
        break;
      }
    }

    return { move: bestMove, value: bestValue };
  }

  return {
    evaluate: evaluate,
    plan: plan,
    orderMoves: orderMoves,
    localScore: localScore,
    other: other,
  };
})();

/* =======================================================================
 * 三档难度机器人
 * ======================================================================= */

JJZQ.AI.register("random", {
  id: "random",
  name: "随机",
  chooseMove: function (game) {
    var moves = game.legalMoves();
    if (moves.length === 0) {
      return null;
    }
    return moves[Math.floor(Math.random() * moves.length)];
  },
});

/**
 * 新手：基本随机，只在有「立即可胜」时偶尔抓住。
 */
JJZQ.AI.register("novice", {
  id: "novice",
  name: "新手",
  chooseMove: function (game) {
    var moves = game.legalMoves();
    if (moves.length === 0) {
      return null;
    }
    var a = game.currentPlayer;
    var i;
    var child;

    // 三成概率抓住「一手取胜」。
    if (Math.random() < 0.3) {
      for (i = 0; i < moves.length; i += 1) {
        child = game.clone();
        child.play(moves[i].board, moves[i].cell);
        if (child.winner === a) {
          return moves[i];
        }
      }
    }
    return moves[Math.floor(Math.random() * moves.length)];
  },
});

/**
 * 老手：浅层搜索，并保留一定失误率。
 */
JJZQ.AI.register("adept", {
  id: "adept",
  name: "老手",
  blunderChance: 0.18,
  chooseMove: function (game) {
    var moves = game.legalMoves();
    if (moves.length === 0) {
      return null;
    }

    // 立刻取胜绝不放过。
    var a = game.currentPlayer;
    var i;
    var child;
    for (i = 0; i < moves.length; i += 1) {
      child = game.clone();
      child.play(moves[i].board, moves[i].cell);
      if (child.winner === a) {
        return moves[i];
      }
    }

    // 失误：随机走一步。
    if (Math.random() < this.blunderChance) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    var result = JJZQ.AI.engine.plan(game, {
      maxDepth: 3,
      timeLimit: 220,
    });
    if (!result.move) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    return result.move;
  },
});

/**
 * 宗师：迭代加深 Alpha-Beta 搜索，深度优先于时间上限，胜率优先。
 */
JJZQ.AI.register("master", {
  id: "master",
  name: "宗师",
  maxDepth: 9,
  timeLimit: 1800,
  chooseMove: function (game) {
    var moves = game.legalMoves();
    if (moves.length === 0) {
      return null;
    }
    var result = JJZQ.AI.engine.plan(game, {
      maxDepth: this.maxDepth,
      timeLimit: this.timeLimit,
    });
    return result.move || moves[0];
  },
});
