# Metal Lab Lite v1.1.0 使用说明

2026-10-29。与标准版共用同一仓库、计算核心和 .mlab 工程格式，采用独立版本、蓝白图标和产品入口。标准版 V1.2.0 发布包不受本轮修改影响。

## 下载与运行

iPhone 可直接使用 [免安装网页预览](https://hindingonhome.github.io/-/)，无需运行本页的 Windows/Linux 安装程序。手机布局、文件保存和验证范围见 [iPhone 使用说明](IPHONE.md)。

发布页：[Lite v1.1.0](https://github.com/hindingonhome/-/releases/tag/Lite-V1.1.0)。附件按平台提供 ZIP；先解压，再运行其中的应用或备用 HTML。

- Windows x64 ZIP：包含单份 MetalLab-Lite-Slim.exe、所需SDK DLL和web/index.html，不包含双份Electron应用。当前桌面程序面向 Windows 10/11 x64，未配置商业代码签名证书。核对 SHA256SUMS.txt，并从本仓库下载。
- Linux x64 历史1.0.0 ZIP：解压其中 tar.xz，运行 MetalLab Lite；需要现代图形环境和 WebGL2。Linux 程序已交叉构建，尚无 Linux 实机运行验证。
- 每个平台包都包含备用 Offline.html、使用说明、更新日志、验收记录、图标和第三方许可证。HTML 用支持现代网页功能的 Edge/Chrome 打开；无需安装。
- Lite 与标准版可以并存：桌面应用标识和用户数据目录独立，不替换标准版快捷方式，也不抢占 .mlab 文件关联。跨版本通过保存/打开 .mlab 交换数据；两个应用的自动保存不是同一工作区。

## 基本操作

运行 pnpm build:lite，用 Edge/Chrome 打开 dist-lite/MetalLab-Lite-1.1.0-Review.html。固定浅色界面，独立蓝白 M / LITE 图标。保留导入、预览、体积、金属、密度、单价和材料成本计算。顶部模型下拉框切换已导入模型，旁边 × 删除当前模型（需要确认）。更多菜单保留输入体积、单位、货币和工程保存。预览像素比限制为1，减少高分辨率屏幕GPU开销。

只提供简体中文、繁体中文和 English；语言默认货币分别为 CNY、HKD、USD，可另选货币。旧版日语/韩语偏好回退简体中文。Ctrl+N 新建、Ctrl+S 保存、Ctrl+Shift+S 另存为、Ctrl+O 打开工程、F 适配视图；浏览器可能占用快捷键，可用按钮。中键旋转，滚轮缩放，Shift+中键平移，Ctrl+中键缩放。F2 分组重命名属于标准版。

Windows7/8.1：当前桌面安装程序不支持。备用 HTML 也尚未完成这些系统的实机验证，需要支持现代网页功能和 WebGL2 的浏览器，不能使用 IE；并非已验证的旧系统兼容方案。

使用：导入模型并确认源尺寸单位，查看体积和克重，选择金属并核对密度。当前单价按显示货币填写，历史参考价不等于实时采购价。只知道体积时从「更多 → 输入体积」进入并填写 cm³。计算记录跟随当前模型，可复制、重命名、排序、删除副本、并排比较及导出 PDF/JPG 打样单。保存 .mlab 工程以便继续。

「计算记录」上方提供两个示例载入按钮：电影戒指比例示例和 1 mm 校验方块，模型与标准版一致。点击后载入并选中示例，可立即选择材质试算；保留已有模型和记录，不会自动清空工作区。初次打开和新建后保持空白，需要时自行载入示例。

黄铜免费数据源实测官网402、行情端点503。当前明确显示尚未接通，没有黄铜自动价格。后续需服务恢复、免费Key及使用许可确认，不能把废黄铜日价当作新料实时采购价。

标准版与 Lite 在同一仓库使用独立 Release：标准版标签 V1.1.0，Lite 标签 Lite-V1.1.0。当前提供 Windows 平台 ZIP、iPhone-Web 平台 ZIP 和 SHA256SUMS.txt 三个手动附件，内部文件不散装上传。

本轮去掉深色模式、模型与分组、高级选项入口。分组、尺寸编辑、模型几何导出、制作费用使用标准版；现有工程相关数据保留。更多菜单采用轻量列表，窗口内滚动，点击外部/Esc关闭；打开弹窗自动收起菜单。关于窗口移除大图，统一 Lite v1.1.0。

浅色主题按用户提供的 Magics 截图调整为浅灰画布、白色面板、深灰文字和单一蓝色强调；覆盖原标准版的棕色提示、深色标题栏和低对比度文字。仅修改Lite构建输出，标准版发布包不变。

恢复功能：scripts/lite-profile.json 中 features.modelGroups、features.advancedOptions 均设为 false；共享核心代码未删除。未来改为 true 并重新构建后，需要重新验收相应界面和文档。src/lite-light.css 是专用浅色层，scripts/lite-profile.mjs 管理三语限制、入口及紧凑模型切换，src/assets/lite-icon.svg/.png/.ico 是 Lite 图标。标准版图标不修改。

检查：node --test tests/*.test.mjs；本机 node scripts/check-lite-ui.cjs 检查真实 STL 导入与单位确认、1 cm³ 金的净重、保存工程、模型切换、三语切换、弹窗、记录、比较表格及 390/760/1280 像素布局。浏览器检查脚本的 Playwright 依赖路径按环境调整。Lite 提供手动单价，不展示完整自动行情面板。

界面检查需要可加载的 Playwright：默认使用已安装的 playwright 模块；也可以将 PLAYWRIGHT_MODULE 环境变量设为本机 Playwright 模块的绝对目录。网页测试使用已安装的 Edge，桌面测试使用构建后的 Windows EXE 和隔离测试目录。

## 构建和后续更新

先安装项目依赖，运行 `pnpm build:lite`，再运行 `node scripts/prepare-lite-desktop.mjs`，生成隔离的 lite-desktop/ 暂存工程。Windows 上执行 `pnpm exec electron-builder --projectDir lite-desktop --win portable nsis --x64 --publish never`；Linux 目标使用 `--linux tar.xz --x64 --publish never`。两者产物均在 lite-desktop/desktop-dist/。不要直接修改暂存工程。

分别运行 `scripts/package-lite-release.ps1 -Platform Windows` 和 `-Platform Linux`，将输出的 SHA256 行合并为 SHA256SUMS.txt。重打包时指定新的 -Output，避免覆盖已有验收包。发布步骤见 docs/RELEASING.md。

当前Windows发行版已改用共享WebView2，解压运行 MetalLab-Lite-Slim.exe；旧Electron构建命令仅用于维护历史运行架构。当前构建及发布流程见 RELEASING.md。
