# 部署与更新说明

## 当前部署状态

| 项目 | 值 |
| --- | --- |
| 访问网址 | https://bpt123456.github.io/ |
| 代码仓库 | https://github.com/BPt123456/BPt123456.github.io |
| 托管平台 | GitHub Pages（免费） |
| 仓库类型 | Public（公开） |
| 部署分支 | `main`，根目录 `/` |
| HTTPS | 已自动启用 |

> 仓库名必须为 `<用户名>.github.io` 才能用 `https://<用户名>.github.io` 直接访问（GitHub 平台规则）。

## 本地文件位置

`C:\Users\Talouyemao\Desktop\Projects\personal-homepage\`

> 仓库可以整体移动或改名（`.git` 目录会跟着一起走），移动后**不影响推送**，
> 只需回来更新上面这一行路径说明即可。
> 同级的 `Desktop\Projects\` 下还放有其他项目（如 `ultimate-tictactoe`），彼此互不影响。

## 如何更新网站（三步）

以后修改页面内容后，在 `personal-homepage` 目录下执行：

```
git add -A
git commit -m "更新说明"
git push
```

推送后 GitHub Pages 会自动重新构建，约 **1–2 分钟**后网站生效。

## ⚠️ 本机网络说明（重要）

本机访问 GitHub 需要走代理，命令行工具不会自动读取系统代理，需显式设置。

- 已验证可用代理端口：**`127.0.0.1:7897`**
- Git 代理已全局配置好（`http.proxy` / `https.proxy`）
- 若使用 `gh` 命令，需在命令前设置环境变量，例如：

```
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;%PATH%"
set HTTPS_PROXY=http://127.0.0.1:7897
set HTTP_PROXY=http://127.0.0.1:7897
gh <命令>
```

> 若以后代理端口变化，请同步更新：
> `git config --global http.proxy http://127.0.0.1:新端口`
> `git config --global https.proxy http://127.0.0.1:新端口`
> 不需要代理时可用 `git config --global --unset http.proxy` 和 `--unset https.proxy` 取消。

## 简历 PDF 隐私提醒

GitHub Pages 为**公开**托管，任何人可访问仓库内的 `assets/resume.pdf`。
若简历含手机号、身份证号等敏感信息，建议：
- 改用「邮箱联系」代替简历下载，或
- 将 PDF 放到带访问控制的网盘后改为外链，或
- 使用支持访问密码的平台（如 Cloudflare Pages）。

## 未来可选优化

- 绑定自定义域名（如 `www.yourname.com`）：需每年购买域名，并在仓库 Settings → Pages → Custom domain 中配置
- 添加网站图标 `favicon.ico`
- 用 Jekyll/静态生成器扩展更多页面
