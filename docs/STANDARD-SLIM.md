# 标准版 V1.2.0 WebView2 小体积发行版

2026-10-30。保留标准版1.2.0完整页面与计算核心，不使用Lite的功能裁剪。此包使用独立V1.2.0发布标签，历史Electron正式包保留。

完整解压ZIP后，运行 MetalLab-Standard-Slim.exe。请保留同目录DLL、图标及web/资源，不能只移动EXE。

## 要求

Windows10/11 x64，建议.NET Framework4.8及以上，并安装Microsoft Edge WebView2 Evergreen Runtime。未内置浏览器；缺少运行环境时会提示打开微软官方下载页，不静默安装。运行环境及浏览器缓存另占磁盘空间，不计入应用ZIP。Windows7/8.1不支持此包；不适用于Linux。

## 保留与已检查

完整标准版页面：分组、尺寸副本、密度/报价、工艺费用、费用汇总、模型导出、PDF/JPG打样单、工程保存恢复、五种语言和使用说明。

实际WebView2程序已检查：1mm方块黄金重量、创建分组、复制并调整200%尺寸、添加制作费、STL确认单位后导出、PDF打样单、保存工程后清空及恢复分组/记录、五语切换和教程。体积及费用共用原标准版逻辑。

## 与原Electron桌面程序的差别

本版采用网页文件流程+原生下载保存对话框，暂未替代原Electron的最近工程列表、双击.mlab文件关联及关联路径覆盖保存。请通过“更多→打开文件”读取工程；保存时由对话框确认目标文件。

此预览仍按网页预览资源策略运行：完整表面预览预算约200万面，较大模型显示抽样预览；完整网格仍参与计算。未实现原Electron的超大导出文件直接写盘集成，浏览器缓冲导出仍受原有约200MB限制。不要据此声称所有原生功能已完全替代。数GB原文件、大工程、干净系统及长期使用仍需另行验收。

独立数据目录为 %LOCALAPPDATA%/MetalLab Standard Slim，与原标准版、Lite Slim互不覆盖；迁移请保存/打开.mlab。单实例保护避免两个窗口互相覆盖自动保存数据。

完整操作说明：[三版本图文手册](https://github.com/hindingonhome/-/blob/main/docs/USER-GUIDE.md)。

## 构建

先运行 node build.mjs dist-web-base。准备官方Microsoft.Web.WebView2 1.0.4314.35 SDK后执行：scripts/build-lite-slim.ps1 -Edition Standard -Output standard-slim-dist -Sdk SDK解压路径。共享宿主源码位于desktop/slim/Program.cs，Standard编译生成文件位于被忽略的暂存目录。

SDK许可和NOTICE随包提供；其他组件依THIRD_PARTY_LICENSE.txt。测试脚本scripts/check-standard-slim.cjs需Playwright及隔离测试环境，仅测试环境启用CDP9228，正常运行不启用。
