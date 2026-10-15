# assets 资源目录

此目录用于存放主页用到的静态资源。

## 简历 PDF（重要）

页面最下方的「下载我的简历 PDF」按钮指向本目录下的：

```
assets/resume.pdf
```

请将你的简历文件**重命名为 `resume.pdf`** 后放入本目录，下载入口即可正常工作。

> 说明：请自行把简历文件重命名为 `resume.pdf` 放入本目录。
> 若文件不存在，点击按钮会跳转到 404 页面；放入文件后即可正常下载。

## 作品 PDF（works/）

「作品」区块中带「查看作品 PDF」按钮的卡片，链接指向：

```
assets/works/magic-journey.pdf   ← 《魔法之旅：抉择》
```

新增其他作品的 PDF 时，建议统一放在 `assets/works/` 目录下并使用英文文件名，
然后在 [`index.html`](index.html) 对应 `.work-card` 内添加同样结构的链接：

```html
<a class="work-card__link" href="assets/works/文件名.pdf" target="_blank" rel="noopener noreferrer">
  <span class="work-card__link-icon">📄</span>
  查看作品 PDF
</a>
```

> 想改为「直接下载」而非新标签页打开，把 `target="_blank"` 换成 `download="文件名.pdf"` 即可。

## 其他可选资源

- `avatar.jpg` —— 头像图片（如需在 Hero 区展示）
- `works/` —— 作品 PDF、截图或封面图
