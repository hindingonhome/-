# 更新和发布

本仓库的 `main` 分支包含可编辑源码。GitHub Actions 在每次推送 `main` 后检查 `package.json` 里的版本号；只有对应的 `V版本号` 发布不存在时才构建并发布 Windows 便携版、安装版、离线 HTML 和 SHA-256 校验表。

更新流程：

1. 克隆本仓库，在 Codex 中打开根目录，修改 `src/` 等源码，不要只编辑 `dist/`。
2. 修改 `package.json` 的 `version`，例如从 `1.0.0` 改成 `1.0.1`。版本号必须符合三段数字格式；已经发布过的版本号不会再次发布。
3. 本地运行 `pnpm install --frozen-lockfile`、`pnpm test`、`pnpm build` 并检查界面。
4. 提交并推送到 `main`。GitHub Actions 的“Publish Windows release”任务会运行同样的测试和构建；成功后创建 `V1.0.1` 标签与下载页。
5. 在 GitHub 的 Actions 和 Releases 页面核对任务状态、版本号和附件，再让使用者下载。

首次发布 V1.0.0 使用 `docs/releases/V1.0.0.md` 的说明；以后版本自动根据提交生成发布说明，建议每次提交写清变化。

本机现有 `.mlab` 工程与源模型不在 Git 仓库中。修改工程格式时先保留旧文件兼容读取，并增加迁移测试。`src/currency.mjs` 的离线汇率如需更新，请核实汇率来源、日期和所有币种后一起更新测试和文档。

Windows 产物未使用可信发行证书签名。公开商用发行前应单独配置代码签名并完成安装验证。
