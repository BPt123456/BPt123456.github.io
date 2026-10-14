# 个人主页 · 第一版框架

一个纯静态的个人主页框架（HTML + CSS + 原生 JavaScript），浅色系 + 科技感风格。
当前只搭建结构与样式骨架，所有内容均为**占位文字**，等待后续填充。

## 页面结构

自上而下分为 6 个分页区块，以及底部的简历下载入口：

| 顺序 | 区块锚点 | 内容 | 对应文件位置 |
| --- | --- | --- | --- |
| 第一页 | `#home` | 名字 / Hero 首屏 | [`index.html`](index.html) Hero 区 |
| 第二页 | `#education` | 教育经历 | 时间轴结构 |
| 第三页 | `#experience` | 工作经历 | 时间轴结构 |
| 第四页 | `#skills` | 技能 | 卡片网格 |
| 第五页 | `#hobbies` | 爱好 | 卡片网格 |
| 第六页 | `#works` | 作品 | 作品卡片网格 |
| 附加 | `#contact` | 联系方式（供 Hero 按钮跳转） | 卡片网格 |
| 页脚 | `footer` | 简历 PDF 下载入口 | `assets/resume.pdf` |

## 目录结构

```
personal-homepage/
├── index.html          # 页面结构（6 个区块 + 导航 + 简历下载入口）
├── css/
│   └── style.css       # 浅色科技感样式（渐变/网格/玻璃拟态/响应式）
├── js/
│   └── main.js         # 交互：滚动进度、导航高亮、入场动画、打字机、粒子背景
├── assets/
│   └── README.md       # 简历 PDF 放置说明
└── README.md           # 本文件
```

## 本地预览

直接双击打开 [`index.html`](index.html) 即可，或使用任意静态服务器（如 VS Code 的 Live Server）。

## 后续填充指南

- **名字 / 标语 / 简介**：修改 [`index.html`](index.html) 中 Hero 区块的 `你的名字`、`一句话介绍自己`、`这里放一句简短的自我简介……`。
- **打字机文案**：修改 Hero 中 `data-typed='[...]'` 的 JSON 数组。
- **教育 / 工作经历**：复制 `.timeline__item` 结构并替换文字。
- **技能 / 爱好 / 作品**：复制对应的 `.skill-card` / `.hobby-card` / `.work-card` 结构。
- **简历下载**：把简历文件命名为 `resume.pdf` 放到 [`assets/`](assets) 目录下。
- **主题色**：在 [`css/style.css`](css/style.css) 顶部的 `:root` 变量中统一调整。

## 设计说明

- **浅色系**：背景 `#f7f9fc`，卡片为半透明白色玻璃拟态。
- **科技感**：青蓝→紫罗兰渐变、网格背景、光晕、粒子连线、等宽字体编号。
- **不严肃**：圆角、柔和阴影、emoji 图标、轻松的打字机动效。
- **响应式**：适配桌面 / 平板 / 手机，移动端折叠导航。
- **无障碍**：支持 `prefers-reduced-motion`，自动减弱动效。
