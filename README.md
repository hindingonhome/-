# 金属工坊 · Metal Lab

离线查看 3D 模型，计算体积和金属理论净重，并整理材料与制作费用的桌面工具。支持独立保存多个计算方案，适合金属工坊在打样前做尺寸与报价估算。

**开发者：CHAMBER** · 联系邮箱：[97101yy@gmail.com](mailto:97101yy@gmail.com)

> V1.0.0 是供检验的版本。模型重量和价格均为估算，正式投料与报价应由工坊核对模型、损耗、工艺和实际行情。

## 下载与运行

在 [Releases 下载页](https://github.com/hindingonhome/-/releases)下载最新版本：

- **Windows 免安装便携版**：下载 `MetalLab-*-Windows-Portable-x64.exe`，双击运行。
- **Windows 安装版**：下载 `MetalLab-*-Windows-Setup-x64.exe`，按安装向导操作。
- **Linux x64 便携版**：下载 `MetalLab-*-Linux-x64.tar.xz`，解压后运行其中的程序。首次运行前可核对 `SHA256SUMS-Linux.txt`。
- **离线浏览版**：下载 `金属工坊.html`，使用 Chrome、Edge 等现代浏览器打开。同一个 HTML 会适配桌面和手机竖屏。

软件无需注册账号，核心计算在本机完成。Windows 安装程序目前没有商业代码签名证书；请只从本仓库的发布页下载，并核对发布附件中的 `SHA256SUMS.txt`。

## 快速使用

1. 导入 STL、OBJ、PLY、GLB 或 GLTF 模型。GLTF 如引用外部 BIN 文件，请一起选择。每次导入先**确认模型尺寸单位**；取消确认不会添加该模型。
2. 在模型库选中模型及计算记录，查看体积、理论成品净重和拓扑提示。尺寸可另建方案调整；导入源记录保留。
3. 选择金属并检查密度、每克单价。提供金、银、铜及铝、锡等常用金属预设；密度和价格可按实际材料修改。
4. 在制作与附加费用中选择工艺模板，或直接手动添加费用。未填写的工艺单价不会计入当前总额。
5. 在费用汇总核对单件及整批估算。桌面版用 `Ctrl+S` 保存 `.mlab` 工程，用 `Ctrl+Shift+S` 另存为。还可导出打样单、文本报告或模型；**导出模型前须确认输出单位**。

“更多”菜单可切换简体中文、繁体中文、英语、日语、韩语，以及显示单位 mm／cm／in／ft。显示单位只换算尺寸读数与输入，不更改模型实际物理大小。金额内部以人民币保存，可切换 CNY、USD、HKD、JPY、KRW、EUR、GBP、AUD、CAD、SGD。币种换算使用标明日期的离线汇率快照，并非实时行情。

浏览器版和桌面版的本机数据互相独立。要跨电脑继续计算，请把 `.mlab` 工程文件和重要原始模型一起带走。

## 从源码构建

需要 Node.js 24 和 pnpm 11.25.0。在项目目录运行：

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

构建后可直接打开 `dist/金属工坊.html`。在 Windows 上运行桌面版或制作两种 EXE：

```sh
pnpm desktop:dev
pnpm desktop:dist
```

在 Linux x64 上运行 `pnpm desktop:linux` 可生成便携压缩包。

更多维护方法见 [更新与发布说明](docs/RELEASING.md)。

## 范围与版权

STL 等网格的体积计算依赖模型封闭程度；边拓扑通过也不能证明不存在自相交或重叠壳体。材料损耗和制作工艺需要人工确认。软件不提供实时市场报价承诺。

本仓库**保留所有权利，暂不授予开源许可**。源代码可查看，但修改、再分发或商用需联系 CHAMBER 获得许可。Third-party 组件按 [第三方许可证](THIRD_PARTY_LICENSE.txt)执行。
