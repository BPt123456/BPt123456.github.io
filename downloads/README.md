# 下载目录（Downloads）

这里存放首页「作品」区可直接下载的发布包，由 GitHub Pages 作为静态文件托管。

| 文件 | 说明 |
| --- | --- |
| `ClearIn5Minutes-v0.2.0-win64.zip` | 《通关五分钟》Windows 64 位版本，约 51.5 MB |

- 下载入口：首页作品卡片「《通关五分钟》」中的「下载游戏」按钮。
- 版本号与 [`clear-in-5-minutes/project.godot`](../../clear-in-5-minutes/project.godot:1) 中的
  `application/config/version` 保持一致。
- 该 zip 为单文件导出，解压后双击 `ClearIn5Minutes.exe` 即可运行，无需安装 Godot。

## 更新发布包

1. 在 `Desktop\Projects\clear-in-5-minutes` 下重新导出（详见
   [`dist/README.md`](../../dist/README.md:1)）。
2. 把新的 zip 复制到本目录，**文件名带版本号**（如 `ClearIn5Minutes-v0.2.1-win64.zip`）。
3. 修改 [`index.html`](../index.html:1) 中作品卡片的 `href` 与按钮上的体积/版本文案。
4. 在 `personal-homepage` 目录执行 `git add -A && git commit -m "更新游戏下载包" && git push`，
   约 1–2 分钟后 GitHub Pages 生效。

> GitHub 对单文件上限为 100 MB，超过需改用 Git LFS 或 GitHub Release；
> 仓库与 Pages 站点整体也有容量上限，旧版本 zip 建议及时删除，避免仓库膨胀。
