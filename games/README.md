# games 在线试玩目录

此目录用于存放可直接在浏览器运行的、无需构建的网页作品。

主页「作品」区块中的《井井字棋？》卡片上的「▶ 在线试玩」按钮指向：

```
games/ultimate-tictactoe/index.html
```

线上地址示例：

```
https://bpt123456.github.io/games/ultimate-tictactoe/
```

## ultimate-tictactoe ——《井井字棋？》

终极井字棋（Ultimate Tic-Tac-Toe）的网页版：小九宫连线才算占据大九宫的一格，大九宫连线获胜。

- **技术**：纯 HTML + CSS + 原生 JavaScript（多脚本按序加载，无模块打包）。
- **玩法**：大棋盘九宫格中每格套一个小井字棋；落子方位会指定对手下一手必须落子的小棋盘。
- **对战**：双人对战 / 对战电脑（新手 · 老手 · 宗师三档，宗师使用迭代加深 Alpha-Beta 搜索）。
- **皮肤**：夜弈 / 宣纸 / 霓虹，切换时只覆盖 CSS 变量。

### 目录

```
ultimate-tictactoe/
├── index.html          # 页面骨架
├── css/
│   ├── styles.css      # 布局与组件
│   └── themes/         # 皮肤（ink / paper / neon，只覆盖 CSS 变量）
└── js/
    ├── constants.js    # 常量、主题与难度登记
    ├── board.js        # 胜负判定
    ├── game.js         # 对局状态
    ├── ai.js           # AI 引擎与三档难度机器人
    ├── themes.js       # 皮肤切换
    ├── ui.js           # 渲染与点击
    └── main.js         # 启动
```

### 如何更新游戏

直接修改或覆盖 `games/ultimate-tictactoe/` 下的文件即可，主页侧无需改动。
若要新增另一个试玩作品，复制一个同级目录（例如 `games/my-game/`），
然后在 [`index.html`](../index.html) 对应的 `.work-card` 内添加同样结构的链接：

```html
<a class="work-card__link" href="games/my-game/" target="_blank" rel="noopener noreferrer">
  <span class="work-card__link-icon">▶</span>
  在线试玩
</a>
```

## 注意事项

- 路径全部使用**相对路径**（如 `css/styles.css`），因此可放在任意子目录下正常工作。
- 本目录只保留运行所需的网页文件；原项目的 `.vscode/` 配置与 `tools/` 基准测试脚本未纳入。
- 无需任何服务端逻辑，可直接由 GitHub Pages 静态托管。
