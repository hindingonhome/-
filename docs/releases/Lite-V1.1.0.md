# MetalLab Lite V1.1.0 · 小体积与手机版更新

Windows应用改用系统WebView2，平台ZIP由约167 MiB缩小为约1.2 MB；不再携带两份浏览器运行环境。手机网页包约0.9 MB压缩大小，Safari直接打开网址，无需安装桌面程序。

## 变更

- 独立WebView2宿主、蓝白图标、用户数据目录、单实例保护和原生下载对话框。
- 保留三语、模型/方块示例、导入单位确认、体积克重、密度和手动采购单价、模型切换、记录、打样单及工程保存恢复。
- iPhone17 Pro尺寸布局检查；顶栏不透明白底、缩小版本信息、“新建”短标签；蓝白锁图标、浅色弹窗和触控优化。
- 软件内教程入口前移；GitHub首页和图文手册增加三版本截图。
- 顶栏、版本窗口、网页标题、EXE文件属性、文件名和发布标签统一Lite1.1.0。

## 附件

- Windows x64 ZIP：完整解压，运行MetalLab-Lite-Slim.exe；DLL、图标和web/须保留。
- iPhone-Web ZIP：网页资源和说明，便于备份/自托管；iPhone使用[在线入口](https://hindingonhome.github.io/-/)。不是IPA，不要将文件预览当作完整Safari应用。
- SHA256SUMS.txt：两包校验。说明和许可均在平台包中，不散装上传。

## 检查与边界

91项逻辑测试、真实WebView2启动与保存恢复、WebKit/Edge手机尺寸环境检查。用户此前已在iPhone上反馈基本功能可用；系统顶栏效果、原生分享和离线仍需设备逐项验收，不能由模拟测试保证。

Windows10/11 x64，建议.NET Framework4.8及以上，需要WebView2 Evergreen Runtime；共享运行环境占用不计入ZIP。缺少时会提示官方下载，不静默安装。不支持Win7/8.1，未做商业代码签名。

最近工程、双击.mlab关联等Electron原生集成尚未替代。手机保存与恢复均受32 MiB工程限制，模型和预览有资源上限，详见包内说明。网页提供手动采购报价，不承诺实时市场成交价。Linux本轮保留Lite1.0.0旧包，不提供改名的新Linux包。

开发者CHAMBER · 97101yy@gmail.com。保留所有权利。
