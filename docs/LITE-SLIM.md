# MetalLab Lite V1.1.0 小体积发行版

2026-10-30。本次发布独立 Lite-V1.1.0 标签，旧版安装包保留，不覆盖历史附件。

## 运行

解压整个 ZIP，双击 MetalLab-Lite-Slim.exe。不要只复制 EXE：同目录的 WebView2 DLL、Lite.ico 和 web/ 都需要保留。

支持 Windows 10/11 x64，建议 .NET Framework 4.8 或更高版本。需要系统已安装 Microsoft Edge WebView2 Evergreen Runtime。缺少时会提示打开微软官方下载页面；程序不会静默安装。系统运行环境本身仍占用磁盘空间，本包小不等于机器的总占用只有这些。

不支持 Windows 7/8.1。Linux 仍使用已有版本；本预览不声称提供 Linux WebView2 程序。

## 功能与差别

保留当前 Lite 的模型导入、两个示例、体积/克重、手动单价、记录、.mlab 保存恢复、三语和使用说明。虚拟 HTTPS 域名仅用于访问包内资源，不需要外部服务器。导入和计算在本机完成。

工程保存通过原生保存对话框选择路径；没有 Electron 桌面版的最近工程和双击 .mlab 关联。打开工程从“更多 → 打开文件”选择。Ctrl+N/S 等界面快捷键沿用网页逻辑，浏览器原生快捷键已禁用以免抢占。

用户数据独立保存在 %LOCALAPPDATA%/MetalLab Lite Slim，不覆盖已安装标准版或 Electron Lite。首次启动没有旧模型是正常情况，请通过 .mlab 迁移。

## 为什么变小

旧 Windows ZIP 同时放安装版和便携版，两者各带一份浏览器运行时。新验收包仅放一份应用，并复用系统 WebView2，不携带 Chromium/Electron。

手机版继续通过 Safari 网址使用，只加载网页资源，不安装桌面 EXE。附带的手机网页 ZIP 用于自托管，不可将解压的 HTML 当作已经完整支持 iPhone 文件预览的应用。体积报告中 gzip/Brotli 为压缩测量值，不冒充每次网络传输量。

## 检查与构建

真实 WebView2 验收已检查方块净重、记录重命名、工程下载、清空、恢复、繁体/英语和使用说明；见 scripts/check-lite-slim.cjs。尚未在干净电脑验证缺少运行时、系统升级和长期使用场景。

SDK 版本1.0.4314.35，官方 NuGet 包 Microsoft.Web.WebView2。解压 SDK 后，运行 scripts/build-lite-slim.ps1 -Sdk 指向SDK目录。SDK许可及NOTICE随包提供；其余组件许可证见 THIRD_PARTY_LICENSE.txt。源码在 desktop/slim/Program.cs。生成目录 slim-dist/ 不应提交到仓库。
