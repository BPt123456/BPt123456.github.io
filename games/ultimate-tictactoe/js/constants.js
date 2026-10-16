/**
 * 共享常量。后续加棋子种类或主题登记表时改这里即可。
 */
window.JJZQ = window.JJZQ || {};

JJZQ.PLAYERS = Object.freeze({ X: "X", O: "O" });

JJZQ.WIN_LINES = Object.freeze([
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]);

JJZQ.THEMES = Object.freeze([
  { id: "ink", label: "夜弈" },
  { id: "paper", label: "宣纸" },
  { id: "neon", label: "霓虹" },
]);

JJZQ.MODES = Object.freeze({
  HOTSEAT: "hotseat",
  AI: "ai",
});

/**
 * 规则模式：传统模式沿用原玩法；积分模式在此之上叠加积分结算。
 */
JJZQ.RULE_MODES = Object.freeze({
  CLASSIC: "classic",
  SCORE: "score",
});

/**
 * AI 难度档位，与 js/ai.js 中注册的机器人 id 对应。
 */
JJZQ.DIFFICULTIES = Object.freeze([
  { id: "novice", label: "新手", hint: "随手落子，适合熟悉规则" },
  { id: "adept", label: "老手", hint: "会看几步，偶有失误" },
  { id: "master", label: "宗师", hint: "深层搜索，极少失手" },
]);

/**
 * 积分模式规则表。
 *
 * 两个维度都用到「中心 / 边 / 角」，但含义不同：
 *   - moveCost   看「落子格」在小棋盘 9 格中的位置；
 *   - lineReward 看「小棋盘」在大棋盘 9 格中的位置。
 * roles 为格索引到角色的映射：4 是中心，0/2/6/8 是角，1/3/5/7 是边。
 */
JJZQ.SCORE_RULES = Object.freeze({
  start: 300,
  metaLineReward: 150,
  moveCost: Object.freeze({ center: 50, edge: 30, corner: 10 }),
  lineReward: Object.freeze({ center: 100, edge: 70, corner: 50 }),
  roles: Object.freeze([
    "corner", "edge", "corner",
    "edge", "center", "edge",
    "corner", "edge", "corner",
  ]),
});

/**
 * 积分规则的取值助手。moveCost 在 legalMoves 的热路径上被调用，保持轻量。
 */
JJZQ.score = {
  roleOf: function (index) {
    return JJZQ.SCORE_RULES.roles[index];
  },

  moveCost: function (cellIndex) {
    return JJZQ.SCORE_RULES.moveCost[JJZQ.SCORE_RULES.roles[cellIndex]];
  },

  lineReward: function (boardIndex) {
    return JJZQ.SCORE_RULES.lineReward[JJZQ.SCORE_RULES.roles[boardIndex]];
  },
};
