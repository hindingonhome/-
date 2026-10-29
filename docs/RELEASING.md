# 更新和发布

## V1.1.0 当前状态

2026-10-29 标准版已由用户验收并明确授权上传。Lite版本仍独立本地验收，不能随标准版发布。

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
