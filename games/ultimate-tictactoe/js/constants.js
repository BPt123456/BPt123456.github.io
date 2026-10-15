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
 * AI 难度档位，与 js/ai.js 中注册的机器人 id 对应。
 */
JJZQ.DIFFICULTIES = Object.freeze([
  { id: "novice", label: "新手", hint: "随手落子，适合熟悉规则" },
  { id: "adept", label: "老手", hint: "会看几步，偶有失误" },
  { id: "master", label: "宗师", hint: "深层搜索，极少失手" },
]);
