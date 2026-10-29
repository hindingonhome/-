# 更新和发布

## V1.1.0 当前状态

2026-10-29 标准版 V1.1.0 已发布。用户授权 Lite 在完成本轮缺陷检查、生成最终本地验收包后独立发布；Lite 使用标签 Lite-V1.0.0，不替换标准版附件。

## 更新流程

1. 修改 src/ 和 desktop/ 源码，更新 package.json、CHANGELOG.md、使用说明与 docs/releases/V版本号.md。
2. pnpm install --frozen-lockfile；pnpm test；pnpm build。检查新旧工程、五语言、滚动布局与资源上限。
3. pnpm desktop:dist 构建 Windows 安装版与便携版；pnpm desktop:linux 构建 Linux x64 tar.xz。Linux 需要单独运行验证。
4. 用 PowerShell 执行 scripts/package-release.ps1 -Platform Windows 和 -Platform Linux。打包脚本拒绝覆盖现有暂存目录，重新打包需指定新的 -Output 相对路径。
5. 先提供本地平台 ZIP 验收。收到上传授权前，不推送 main、不创建 GitHub Release。
6. 验收后提交推送，手动运行 Publish reviewed Windows and Linux release，并确认 review_approved。推送本身不触发发布；工作流会构建两端、生成两份平台 ZIP 和一份 SHA256SUMS.txt。
7. 替换已发布版本用 Rebuild reviewed platform ZIP release；必须明确获得用户替换授权、填写匹配的版本标签，并确认 review_approved。该工作流不会删除历史散装附件；如有旧格式附件需另行按用户授权清理。

## 附件规范

金属工坊当前发布平台为 Windows 和 Linux：MetalLab-版本-Windows-x64.zip、MetalLab-版本-Linux-x64.zip、SHA256SUMS.txt。应用、备用 HTML、示例工程、说明、日志和许可在各平台 ZIP 内。不要将内部资源逐个上传。GitHub 自动源码归档不计入手动附件。

这是金属工坊，不直接套用“物派”的四平台六附件规则；新增 Android/iPhone 等平台时再增加相应平台包。

独立 Linux 工作流仅生成 Actions 验证产物，不自动上传 Release。

## 兼容与验证

V1.1.0 保留 .mlab 容器格式版本1，新增 groups、activeGroupId 和模型 groupId。旧工程默认未分组。旧版可能忽略分组或拒绝超过12模型/100记录的工程，应保留旧文件。

工作区预览预算512 MiB，单工程512 MiB；不是模型数量承诺。新建工作区须解除旧保存路径，串行完成自动保存写入。浏览器下载完成无法由程序可靠确认，需用户再次确认新建。

Windows 未配置可信商业代码签名证书。参考行情和汇率模块不在此次更新中更改；采购报价不得被定时刷新覆盖。

## Lite 更新流程

1. 修改 Lite 专属脚本、样式、图标和说明；版本号统一在 scripts/lite-profile.json 维护（当前 v1.0.0）。同步 Lite 页面标题、说明、发布说明和版本窗口后回归检查。
2. pnpm test；pnpm build:lite。浏览器操作检查与 Windows 打包程序检查脚本分别为 scripts/check-lite-ui.cjs 和 scripts/check-lite-desktop.cjs；本机路径需按实际 Playwright 环境调整。
3. pnpm desktop:lite:dist 和 pnpm desktop:lite:linux，生成 lite-desktop/desktop-dist/。暂存工程、临时用户数据和打包文件均禁止提交源码。
4. 执行 scripts/package-lite-release.ps1 -Platform Windows 和 -Platform Linux，将两行 SHA256 合并到同目录的 SHA256SUMS.txt。已有暂存目录时选择新 -Output。
5. 提供 Final 本地 HTML 和平台包。发布授权后手动运行 Publish reviewed MetalLab Lite 工作流，确认 review_approved。只有手动启动会发布；普通推送不会发布。
6. Lite 标签使用 Lite-V版本号，附件固定为 MetalLab-Lite-版本-Windows-x64.zip、MetalLab-Lite-版本-Linux-x64.zip 和 SHA256SUMS.txt。标准版的标签和附件保持不变。后续更新优先新标签，替换旧版本附件需明确替换授权。

Lite 当前桌面运行时与标准版相同，简化的是界面及预览开销，并非旧系统运行时。Windows 7/8.1 不支持当前安装程序；HTML 兼容性未实机验证。Linux 目前为交叉构建。
