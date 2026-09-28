import OpenCC from 'opencc-js';
import {localeMaps,localePatterns} from './i18n-ja-ko.mjs';

const toTraditional=OpenCC.Converter({from:'cn',to:'tw'});
const english={
 '保存文件':'Save file','另存为…':'Save as…','打开文件':'Open file','↓ 导出打样单':'↓ Export sample sheet','导出打样单':'Export sample sheet','勾选一份或多份计算记录。多份 PDF 合成一个文件；多份 JPG 打包为 ZIP。':'Select one or more calculations. PDFs combine into one file; multiple JPGs are packed into a ZIP.','文件格式':'File format','PDF · 一份一页':'PDF · one page per item','JPG · 图片':'JPG · image','选择记录':'Select calculations','全选':'Select all','取消':'Cancel','导出所选打样单':'Export selected sheets','最近打开的工程':'Recent projects','打开文件…':'Open file…','保存为 .mlab 工程文件，之后可以从这里继续。':'Save a .mlab project to continue later.','还没有最近打开的工程文件。':'No recent projects yet.',
 '↓ 导出打样单 PDF':'↓ Export sample sheet PDF','并排比较当前模型的方案':'Compare options side by side','比较项目':'Comparison','外形尺寸 mm':'Dimensions mm','体积 cm³':'Volume cm³','理论净重 g':'Net mass g','投料量 g':'Feed mass g','单件材料费':'Material / item','单件制作费':'Making / item','单件合计':'Total / item','数量 / 整批':'Quantity / batch','几何可信度':'Geometry confidence',
 '理论成品净重':'Theoretical net mass','预估投料量':'Estimated feed mass','待填写余量':'Enter allowance','投料余量':'Feed allowance','% · 由厂家确认':'% · confirm with supplier','材料计费重量':'Material charging basis','按成品净重':'Finished net mass','按预估投料量':'Estimated feed mass','材料成本估算':'Estimated material cost','报价依据':'Price basis','待选择（仅供浏览）':'Unconfirmed (preview only)','采用离线参考价':'Use offline reference','使用厂家报价':'Use supplier quote','厂家 / 供应商':'Supplier','填写名称':'Enter name','报价日期':'Quote date','有效期至':'Valid until',
 '铜首饰工艺模板':'Copper jewelry template','选择模板，追加未有的费用项':'Choose template to add missing items','选择模板，替换现有费用':'Choose template to replace current fees','应用工艺模板':'Apply process template','1 · 工艺模板':'1 · Process template','2 · 手动添加费用':'2 · Add fees manually','3 · 步骤明细':'3 · Cost details','费用汇总':'Cost summary','切换模板会重置当前制作费用；请重新填写实际报价。':'Applying a template resets all current making fees. Re-enter actual rates.','无需选择模板，也可直接添加任意费用。':'Add any fee without choosing a template.','制作数量':'Production quantity','件':'items','单件制作与附加费用':'Making & extras / item','单件材料＋制作':'Material + making / item','整批估算':'Batch estimate','失蜡铸铜胸针':'Lost-wax cast copper brooch','金属打印＋融铜':'Metal print + copper casting','铜件＋大漆':'Copper + lacquer','金属打印':'Metal printing','大漆工艺':'Lacquer work','胸针扣 / 配件':'Brooch clasp / parts',
 '金属工坊 · Metal Lab':'Metal Lab', '金属工坊':'Metal Lab', '输入体积':'Enter volume', '模型库':'Model library', '更多 ···':'More ···',
 '语言 / Language':'Language', '使用说明':'Help', '数据备份（用于恢复）':'Back up data', '打开备份':'Open backup', '重新开始并保存':'Start fresh and save', '作者信息':'About the creator',
 '＋ 导入模型':'＋ Import model', '导入模型':'Import model', '拖入你的模型':'Drop your model here', '或点击选择文件':'or click to choose files', '本地工作台':'Local workspace', '快速开始':'Quick start',
 '◎ 载入电影戒指比例示例':'◎ Load movie-ring example', '◇ 载入 1 mm 校验方块':'◇ Load 1 mm test cube', '模型视图':'Model view', '实体':'Solid', '线框':'Wireframe', '网格':'Grid', '适配视图':'Fit view',
 '等待导入模型':'Waiting for a model', '中键拖动旋转视角':'Middle-drag to orbit', '透视':'Perspective', '正交':'Orthographic', '自由视角':'Free view',
 '前视图 · +Z':'Front · +Z', '后视图 · −Z':'Back · −Z', '右视图 · +X':'Right · +X', '左视图 · −X':'Left · −X', '顶视图 · +Y':'Top · +Y', '底视图 · −Y':'Bottom · −Y',
 '一个体积，就能算出克重':'A volume is enough to calculate weight', '无需上传模型。':'No model needed.', '解锁右侧体积，输入数值并选择金属。':'Unlock the volume field, enter a value, and choose a metal.',
 '解锁并输入体积':'Unlock and enter volume', '重新选择原模型，显示完整表面':'Select original model for full surface', '正在初始化':'Initializing', '中键旋转':'Middle button: orbit',
 'Shift＋中键平移':'Shift + middle: pan', 'Ctrl＋中键缩放':'Ctrl + middle: zoom', '旋转中 Alt 贴合轴向':'Alt while orbiting: snap to axis',
 '计算记录':'Calculations', '每个方案独立保存，点击记录切换。':'Each option is saved separately. Select a card to switch.', '↓ 导出结果 TXT':'↓ Export results TXT', '＋ 新建计算副本':'＋ Duplicate calculation',
 '属性与估算':'Properties & estimate', '当前计算记录':'Current calculation', '预计金属重量':'Estimated metal weight', '模型体积':'Model volume', '锁定 🔒':'Locked 🔒',
 '由模型自动计算；只知道体积时，选择上方「输入体积」。':'Calculated from the model. If you only know its volume, choose “Enter volume” above.', '材料估价':'Material estimate',
 '选择金属':'Choose metal', '黄金':'Gold', '白银':'Silver', '铜':'Copper', '铝':'Aluminum','锡':'Tin','锌':'Zinc','黄铜（参考）':'Brass (approx.)','青铜（参考）':'Bronze (approx.)','铸铁（参考）':'Cast iron (approx.)','不锈钢（参考）':'Stainless steel (approx.)','钛':'Titanium','铂金':'Platinum','钯金':'Palladium','铁':'Iron','镍':'Nickel','其他金属':'More metals','选择其他金属':'Choose another metal','关闭其他金属':'Close metal list','密度为参考起点，尤其合金应按实际牌号修改；单价请填真实报价。':'Densities are starting points; check alloy grades and enter actual prices.','合金密度为参考值，请按实际材料修改。净重 = 体积 × 密度。':'Alloy density is approximate; adjust to your material. Net mass = volume × density.','自定':'Custom', '自定义金属':'Custom metal', '金属单价':'Metal price', '人民币 / g':'CNY / g', '查看近月参考行情 ↗':'View recent reference prices ↗',
 '材料密度与计算说明':'Density & calculation notes', '材料密度':'Material density', '重量 = 体积 × 密度。估价仅含金属材料，不含工费、损耗及其他费用。合金请填写实际密度和采购单价。':'Weight = volume × density. The material estimate excludes labor, loss, and other fees. Enter the actual density and purchase price for alloys.',
 '调整尺寸 · 创建不同方案':'Resize · create another option', '尺寸与比例':'Dimensions & scale', '源文件单位':'Source units', '毫米 mm':'Millimeters mm', '厘米 cm':'Centimeters cm', '米 m':'Meters m', '锁定比例':'Keep proportions', '⧉ 复制后修改尺寸':'⧉ Duplicate to resize',
 '导出模型 · 格式转换':'Export model · convert format', '导出与转码':'Export & conversion', 'STL · 二进制':'STL · binary', 'OBJ · 网格':'OBJ · mesh', 'PLY · 网格':'PLY · mesh', '导出 ↗':'Export ↗',
 '按当前尺寸导出，单位毫米，以模型中心为原点。保留各部分相对位置；仅转换几何，不含纹理或动画，不修复模型。':'Export at the current size. Confirm an output unit first; the model is centered and relative positions are preserved. Geometry only; no textures, animation, or repair.',
 '重新选择原模型文件':'Select original model file', '导入模型或载入示例后开始计算。':'Import a model or load an example to start.', '制作与附加费用':'Making & extra costs', '未添加':'None added',
 '费用可叠加，单价请填写你的实际报价。若商家工费已包含铸造或抛光，请不要重复添加。':'Costs can be combined. Enter your actual quoted rates. Avoid adding casting or polishing twice if already included in labor.',
 '＋ 添加':'＋ Add', '材料＋制作总估价':'Material + making total', '可按克、按件、按数量或按材料费比例计算。镶嵌用颗数，刻字可按字数；未填写的单价不计入。':'Charge per gram, item, quantity, or percentage of material cost. Use stone count for setting and character count for engraving. Blank rates are excluded.',
 '这个模型的尺寸，需要核对一下':'Please check this model’s size', '以模型坐标的单位解释尺寸，不改变文件。选择与你的实际物件相符的一项。':'This only interprets the source units; the file is unchanged. Choose the size that matches your object.',
 '取消导入':'Cancel import', '确认尺寸并导入':'Confirm units and import', '近月金属参考价':'Recent metal reference prices', '导入行情 CSV':'Import price CSV', '使用区间均价':'Use period average',
 '可导入 date,price 两列（YYYY-MM-DD，人民币/克），仅使用近 31 天的数据。导入数据标注为用户提供，不会覆盖其他材质。':'Import date,price columns (YYYY-MM-DD, CNY/g). Only the most recent 31 days are used. Imported prices are marked as user-provided and do not affect other metals.',
 '基础操作 · 先看这里':'Basic controls · start here', '中键拖动':'Middle-drag', '旋转模型':'Orbit model', '滚轮':'Mouse wheel', '缩放模型；在页面其他区域滚动页面':'Zoom model; scroll the page elsewhere','保存工程':'Save project','另存为新工程':'Save as new project',
 'Shift + 中键':'Shift + middle', '平移模型':'Pan model', 'Ctrl + 中键':'Ctrl + middle', '缩放模型':'Zoom model', '旋转中 Alt':'Alt while orbiting', '贴合最近的正交视角':'Snap to nearest orthographic view',
 '按下中键只控制模型视角，不会启动页面自动滚动。':'Middle-drag only changes the model view; it does not start page autoscroll.', '从模型，到一眼可见的克重。':'From a model to a clear weight estimate.',
 '导入 STL / OBJ / PLY / GLB / GLTF。GLTF 配套的 BIN 文件请一起选择。':'Import STL / OBJ / PLY / GLB / GLTF. Select any accompanying BIN file with GLTF.',
 'STL 默认毫米；OBJ / PLY 最长边 &lt; 1 mm 或 &gt; 500 mm 时核对单位；GLB / GLTF 按米读取。任何时候都能手动改单位。':'STL defaults to millimeters; OBJ / PLY ask for unit confirmation if the longest edge is under 1 mm or over 500 mm. GLB / GLTF use meters. Units can be changed later.',
 'STL 默认毫米；OBJ / PLY 最长边 < 1 mm 或 > 500 mm 时核对单位；GLB / GLTF 按米读取。任何时候都能手动改单位。':'STL defaults to millimeters; OBJ / PLY ask for unit confirmation if the longest edge is under 1 mm or over 500 mm. GLB / GLTF use meters. Units can be changed later.',
 '选择金属，检查密度与人民币/克单价。':'Choose a metal and check its density and CNY-per-gram price.',
 '点击「复制后修改尺寸」，输入新尺寸或比例。副本相互独立，原始记录保留。':'Choose “Duplicate to resize”, then enter a new size or scale. Copies are independent; the original remains.',
 '导入模型在左侧模型库上方，可独立折叠；模型库可展开模型并选中某份计算记录。属性与估算、计算记录可折叠；制作与附加费用默认收起。点击「导出打样单」可选一份或多份记录，导出 PDF 或 JPG；模型几何仍可导出 STL / OBJ / PLY，单位毫米。':'Import is above the model library and can collapse separately. Expand a model to select a calculation. Properties and calculations can collapse; making costs start closed. “Export sample sheet” creates PDF or JPG files for selected calculations. Geometry can be exported as STL / OBJ / PLY in millimeters.',
 '只知道体积？':'Only know the volume?',
 '点击上方「输入体积」，解锁体积输入框，填写 cm³（立方厘米）。手动记录也可复制、删除、保存；没有三维几何，因此无法导出模型。模型计算记录的体积保持锁定，不会被手动数值覆盖。':'Choose “Enter volume”, unlock the field, and enter cubic centimeters. Manual records can be copied, deleted, and saved, but contain no geometry to export. Model-derived volume remains locked.',
 '计算边界':'Calculation limits',
 '按封闭三角网格的有向体积计算。检测边界边、非流形边、面朝向冲突和退化面；有这些问题时暂停克重估算，但仍可查看和转码。未检测自相交、重叠壳体或内部壳体的物理意义：重叠会重复计量，混合方向的独立壳体可能抵消，请在建模时保证几何正确。':'Volume uses oriented triangles in a closed mesh. Boundary edges, non-manifold edges, winding conflicts, and degenerate faces pause weight estimates; viewing and conversion still work. Self-intersections and overlapping shells are not fully validated. Overlap may be counted twice, and opposing shells may cancel. Check your geometry before relying on the result.',
 '无需模型修复，不会修改原文件。支持静态、未压缩网格；不支持 STEP、3DM、BLEND、Draco / Meshopt 压缩、骨骼与形态变形。STL / OBJ 使用分块后台计算，移除 60 万面与 80 MB 限制。最多 200 万面保留完整表面预览，更多面采用轻量抽样预览，体积仍计算全部三角面；旧抽样记录可重新选择原模型升级预览。超过 15 万面不做完整边拓扑检查，须由你保证封闭与朝向正确。PLY / GLB / GLTF 为常规读取，最多 256 MB / 300 万面。':'No model repair is performed and source files are never modified. Static, uncompressed meshes are supported; STEP, 3DM, BLEND, Draco / Meshopt compression, bones, and morphs are not. STL / OBJ are streamed in the background. Up to 2 million faces use a full surface preview; larger models use a lightweight preview while all triangles contribute to volume. Old sampled records can be upgraded by reselecting the original. Above 150,000 faces, full edge-topology checks are skipped, so verify closure and winding yourself. PLY / GLB / GLTF use regular loading up to 256 MB / 3 million faces.',
 '记录与价格':'Records & prices',
 '模型预览、计算记录和手动单价自动保存在当前浏览器。高面数模型仅保存预览和完整计算结果，不把数 GB 原文件复制进浏览器；重新打开后导出需要再次选择原文件。高面数导出读取完整原文件，不会把抽样预览当作原模型。换浏览器、移动 HTML 文件或清理浏览数据可能丢失记录，可从「更多」保存 .mlab 工程文件，日常分享请用「导出打样单」。价格是带日期的离线参考快照，不会自动联网更新；可以输入当天价格或导入近期行情 CSV。制作费用可按克、按件、按数量和材料费比例叠加，并随记录独立保存；报价需自行填写。':'Previews, calculations, and manual prices save in this browser. Large source files are not copied into storage; reselect the original before exporting after reopening. Changing browsers, moving the HTML file, or clearing site data can lose records. Use “More” to save a .mlab project and export PDF or JPG sample sheets for sharing. Reference prices are dated offline snapshots; enter today’s price or import recent CSV data. Making costs can be combined and saved with each calculation.',
 '纯金密度预设 19.30、纯银 10.49、铜 8.96 g/cm³，均可修改。空心物件应有正确内壁；仅外表面的模型按实心计算。':'Default densities are 19.30 g/cm³ for pure gold, 10.49 for silver, and 8.96 for copper. All are editable. Hollow objects need a correct inner wall; outer-only meshes are treated as solid.',
 '手机支持单指旋转、双指缩放。Windows 请用 Edge 或 Chrome 打开 HTML；iOS 的文件预览不等于完整浏览器应用，后续可封装为 PWA / iOS 应用。':'On phones, use one finger to orbit and two fingers to zoom. Open the HTML in Edge or Chrome on Windows. iOS file preview is not a full browser app; a PWA / iOS package may follow.',
 '开始使用':'Start using', '把模型变成清楚的数字。':'Turn a model into clear numbers.', '在本机查看模型，计算体积、金属克重与制作估价。':'View models locally and calculate volume, metal weight, and making costs.',
 '返回工作台':'Back to workspace', '正在处理模型':'Processing model', '正在读取模型…':'Reading model…', '计算完整网格，预览保持轻量。你可以随时取消。':'Calculating the full mesh with a lightweight preview. You can cancel at any time.', '取消本次操作':'Cancel',
 '原始尺寸':'Original size', '计算副本':'Calculation copy', '原始':'Original', '手动体积':'Manual volume', '体积计算':'Volume calculation', '待输入':'Enter value', '待核对':'Check geometry',
 '待填写单价':'Enter price', '待输入体积':'Enter volume', '几何待核对':'Check geometry', '暂停估算':'Estimate paused', '待计算':'Pending', '已解锁':'Unlocked',
 '锁定体积输入':'Lock volume input', '解锁体积输入':'Unlock volume input', '模型体积自动计算，不可手动更改':'Calculated model volume cannot be edited',
 '费用名称':'Cost name', '计价方式':'Pricing method', '费用单价':'Cost rate', '数量':'Quantity', '单价':'Rate', '待填写':'Enter rate', '尚未添加制作费用。':'No making costs added.',
 '删除记录':'Delete calculation', '删除该费用':'Remove cost', '复制计算记录':'Duplicate calculation', '删除此模型与关联记录':'Delete model and calculations', '展开':'Expand', '折叠':'Collapse',
 '拖入模型，或点击右上角导入':'Drop a model or use Import at the top right', '本地处理 · 文件不会上传':'Processed locally · files are not uploaded',
 '毫米':'millimeters', '厘米':'centimeters', '米':'meters', '读取':'read', '（STL 默认毫米，可修改）':' (STL defaults to mm; editable)',
 '完整表面预览 / 完整体积计算':'full surface preview / complete volume calculation', '抽样预览 / 完整体积计算':'sampled preview / complete volume calculation',
 '完整计算 / 未检查封闭性':'complete calculation / closure not checked', '边拓扑通过 · 未检查自相交':'edge topology passed · self-intersections unchecked', '几何需核对':'check geometry',
 '独立的手动体积记录 · 不关联三维模型':'Independent manual-volume calculation · no 3D model', '原始尺寸记录 · 复制后可调整比例':'Original size · duplicate to resize', '独立计算副本 · 不改变原模型':'Independent copy · source model unchanged',
 '单位为 cm³（立方厘米）。1 cm³ = 1,000 mm³。':'Units: cm³. 1 cm³ = 1,000 mm³.', '原始尺寸已锁定。先复制，再尝试新的大小。':'Original size is locked. Duplicate before resizing.',
 '修改单轴尺寸可锁定比例；整体百分比会重设为等比缩放。':'Keep proportions when editing one axis. The overall percentage applies uniform scaling.',
 '此记录保存预览和完整计算结果。导出将重新读取完整原文件。':'This record stores a preview and complete result. Export rereads the full source file.',
 '手动体积记录没有三维几何，不能导出模型。':'Manual-volume records have no 3D geometry to export.', '手动输入 · 不创建或修改三维模型':'Manual entry · no 3D model created or changed',
 '区间均价':'Period average', '区间最低':'Period low', '区间最高':'Period high', '查看来源 ↗':'View source ↗',
 '手工加工':'Bench work', '设计 / CAD':'Design / CAD', '蜡版 / 树脂打样':'Wax / resin prototype', '开模':'Mold making', '铸造':'Casting', '焊接 / 组装':'Soldering / assembly',
 '修整 / 抛光':'Finishing / polishing', '镶嵌':'Stone setting', '刻字 / 雕刻':'Engraving', '电镀 / 镀铑':'Plating / rhodium', '检测 / 打印记':'Assay / hallmark',
 '金属损耗':'Metal loss', '包装':'Packaging', '其他费用':'Other cost', '元 / g':'CNY / g', '元 / 件':'CNY / item', '元 / 数量':'CNY / unit', '材料费 %':'Material cost %',
 '手动单价（未填写）':'Manual price (empty)', '参考快照':'Reference snapshot', '用户行情':'User prices', '日价格算术均值':'Daily-price arithmetic mean',
 '自定义材质，请输入实际采购价':'Custom material: enter your purchase price', '用户定义':'User-defined', '小计':'Subtotal',
 '电影戒指比例示例 · 7 mm 宽':'Movie-ring example · 7 mm wide', '校验方块 · 1 mm':'Test cube · 1 mm',
 '示例戒环 · 20.2 mm':'Sample ring · 20.2 mm','校验方块 · 10 mm':'Test cube · 10 mm',
 '待输入材料价格或体积':'Enter material price or volume',
 '已自动保存到此浏览器':'Saved to this browser', '工作台准备中':'Preparing workspace', '正在保存…':'Saving…', '已恢复本地工作台':'Local workspace restored',
 '离线快照，核对日期 2026-09-22':'Offline snapshot, checked 2026-09-22',
 '上海黄金交易所 · SHAU 午盘基准价':'Shanghai Gold Exchange · SHAU midday benchmark',
 '上海黄金交易所 · SHAG 午盘基准价（元/千克 ÷ 1000）':'Shanghai Gold Exchange · SHAG midday benchmark (CNY/kg ÷ 1,000)',
 '上海期货交易所 · 每日成交量最大铜合约结算价（元/吨 ÷ 1,000,000）':'Shanghai Futures Exchange · most-traded copper contract settlement (CNY/t ÷ 1,000,000)',
 '交易日午盘价的算术均值':'Arithmetic mean of trading-day midday prices',
 '所获交易日结算价算术均值，合约随成交量切换；期货参考，不是现货采购价':'Arithmetic mean of available trading-day settlements. Contract follows volume; a futures reference, not a spot purchase price',
 '查询窗口 2026-08-22 — 2026-09-21；仅统计实际返回数据，不填补缺失日期。':'Query window: 2026-08-22 to 2026-09-21. Only returned trading days are counted; missing dates are not filled.',
 '离线参考不代表当日成交价，采购前请更新单价。':'Offline references are not today’s transaction prices. Update the rate before purchasing.',
 '待确认':'Needs confirmation','需人工确认':'Needs manual confirmation','已检查':'Checked','未完整检查':'Not fully checked',
 '边拓扑已检查；仍须人工确认自相交与重叠壳体':'Edge topology checked; confirm self-intersections and overlapping shells manually',
 '超过 15 万面，未做完整边拓扑检查；需人工确认封闭与朝向':'Above 150,000 faces: full edge topology was not checked; confirm closure and winding manually',
 '几何或手动体积需人工确认':'Geometry or manually entered volume needs confirmation',
 '投料余量仅为估算；浇冒口、回收料和厂家收费方式须确认。“金属损耗”费用是材料费百分比，请避免重复计入。':'Feed allowance is an estimate. Confirm sprues, recycled metal, and supplier charging terms. Metal loss is a percentage of material cost; avoid counting it twice.',
 '当前仅为参考估算：请选择参考价，或填写完整厂家报价与日期。':'This is a reference estimate. Choose the reference price or enter a complete supplier quote and date.',
 '厂家报价资料已填写；请核对有效期。':'Supplier quote details entered; check the validity date.',
 '已明确采用带日期的离线参考价；正式采购前仍需确认。':'Dated offline reference price selected; confirm before purchasing.',
 '材料计费可选净重或预估投料量；制作费用另计。':'Material can be charged by net mass or estimated feed mass; making costs are separate.',
 '已填写的工艺项目均已计入。':'All priced process items are included.',
 '未填写的工艺单价不计入当前金额，导出时标为待报价。模板仅预填项目，不包含厂家价格。':'Unpriced process items are excluded and marked pending in exports. Templates list steps but contain no supplier prices.',
 '界面语言':'Interface language','快捷键 F':'Shortcut F','方向轴：拖动旋转，点击轴端切换视图':'Orientation axis: drag to orbit; click an axis tip to change view',
 '选择观察方向':'Choose viewing direction','记录名称':'Calculation name','例如 20':'e.g. 20','输入当日采购价':'Enter today’s purchase price',
 'X 尺寸':'X dimension','Y 尺寸':'Y dimension','Z 尺寸':'Z dimension','整体缩放百分比':'Overall scale percentage','导出格式':'Export format','选择制作费用类型':'Choose cost type',
 '关闭说明':'Close help','关闭行情':'Close prices','参考价格走势':'Reference price chart','关闭打样单选择':'Close sample-sheet selector','打样单文件格式':'Sample-sheet file format','关闭作者信息':'Close about dialog',
 '深色背景上的原创金色戒指照片':'Original gold ring on a dark background',
 '已替换为所选模板项目；请填写实际工艺报价':'Template steps replaced; enter actual process quotes',
 '待估算':'Awaiting estimate','待输入体积或余量':'Enter volume or allowance','点击锁定或解锁体积':'Click to lock or unlock volume',
 '请输入体积':'Enter volume','手动体积（立方厘米）':'Manual volume (cm³)',
 '删除模型':'Remove model','删除模型及记录':'Delete model and calculations','关闭删除确认':'Close removal dialog',
 '请至少勾选一份记录。':'Select at least one calculation.','将导出一张 JPG 图片。':'One JPG image will be exported.',
 '尺寸显示单位':'Display units','显示货币':'Currency','汇率快照':'Rate snapshot','ECB 参考汇率':'ECB reference rates','离线换算仅供估算，不是实时汇率。':'Offline conversion is an estimate, not a live rate.',
 '英寸 in':'Inches in','英尺 ft':'Feet ft','人民币':'Chinese yuan','美元':'US dollar','港币':'Hong Kong dollar','日元':'Japanese yen','韩元':'Korean won','欧元':'Euro','英镑':'Pound sterling','澳元':'Australian dollar','加元':'Canadian dollar','新加坡元':'Singapore dollar','尺寸换算仅用于显示与输入，不会改变模型实际大小。':'Unit conversion affects display and input only; the model geometry stays unchanged.',
 'STL、OBJ、PLY 文件不可靠地保存单位标记。请在接收软件中选择相同的单位；几何实际尺寸会保持不变。':'STL, OBJ, and PLY do not reliably preserve unit metadata. Choose the same unit in the receiving software; the actual dimensions stay unchanged.',
 '确认导出尺寸单位':'Confirm output units','导出坐标单位':'Output coordinate unit','外形尺寸':'Dimensions','请选择与你建模软件中的真实尺寸相符的单位。':'Choose the unit that matches the real dimensions in your modeling software.','源坐标':'source coordinates','ECB 参考汇率。离线换算仅供估算。':'ECB reference rates. Offline conversion is an estimate.',
};

Object.assign(english,{
 'CNY · 人民币':'CNY · Chinese yuan','USD · 美元':'USD · US dollar','HKD · 港币':'HKD · Hong Kong dollar','JPY · 日元':'JPY · Japanese yen','KRW · 韩元':'KRW · Korean won','EUR · 欧元':'EUR · Euro','GBP · 英镑':'GBP · Pound sterling','AUD · 澳元':'AUD · Australian dollar','CAD · 加元':'CAD · Canadian dollar','SGD · 新加坡元':'SGD · Singapore dollar','确认单位并导出':'Confirm unit and export','取消导出':'Cancel export'
});

const patterns=[
 [/^报价依据：(已检查|未完整检查|待确认|需人工确认) · (.+)$/,(_,status,detail)=>`Quote basis: ${english[status]??status} · ${english[detail]??detail}`],
 [/^(\d+) 项工艺单价待厂家报价，未计入当前金额。$/,(_,count)=>`${count} process rates need supplier quotes and are excluded from the current total.`],
 [/^(展开|折叠|删除|选择|复制) (.+)$/,(_,action,name)=>`${({展开:'Expand',折叠:'Collapse',删除:'Delete',选择:'Select',复制:'Duplicate'})[action]} ${translateText(name,'en')}`],
 [/^(\d+) \/ 待填写单价$/,(_,count)=>`${count} / rate pending`],
 [/^(.+) · (待核对|[\d,.]+ g)$/,(_,name,status)=>`${translateText(name,'en')} · ${english[status]??status}`],
 [/^(\d+) 份记录将合并成一个 PDF，每份一页。$/,(_,count)=>`${count} calculations will be combined into one PDF, one page each.`],
 [/^(\d+) 张 JPG 图片将放在一个 ZIP 文件中。$/,(_,count)=>`${count} JPG images will be packed into one ZIP file.`],
 [/^「(.+)」按毫米读取时，最长边为 ([\d,.]+) mm，超出首饰常用检查范围（1—500 mm）。请选择正确单位。$/,(_,name,length)=>`“${name}” has a longest edge of ${length} mm when read as millimeters, outside the usual jewelry check range (1–500 mm). Please choose the correct unit.`],
 [/^([\d,.]+) 面 · (.+) · 未检查封闭性与自相交 · 退化面 ([\d,.]+) · 请确认网格封闭且朝向一致$/,(_,faces,preview,degenerate)=>`${faces} faces · ${english[preview]??preview} · closure and self-intersections unchecked · ${degenerate} degenerate faces · confirm closure and consistent winding`],
 [/^([\d,.]+) 面 · 几何需核对 · 边界边 ([\d,.]+) · 非流形边 ([\d,.]+) · 朝向冲突 ([\d,.]+) · 退化面 ([\d,.]+)$/,(_,faces,boundary,nonManifold,winding,degenerate)=>`${faces} faces · check geometry · ${boundary} boundary edges · ${nonManifold} non-manifold edges · ${winding} winding conflicts · ${degenerate} degenerate faces`],
 [/^(\d[\d,.]*) 面$/,(_,n)=>`${n} faces`],
 [/^(\d[\d,.]*) 份记录$/,(_,n)=>`${n} calculations`],
 [/^(.+) · (\d[\d,.]*) 面 · (\d+) 份记录$/,(_,format,faces,count)=>`${format} · ${faces} faces · ${count} calculations`],
 [/^体积计算 · 无模型 · (\d+) 份记录$/,(_,count)=>`Volume only · no model · ${count} calculations`],
 [/^(.+) · (毫米|厘米|米)读取(.*)$/,(_,name,unit,note)=>`${english[name]??name} · read as ${english[unit]}${english[note]??note}`],
 [/^(Au|Ag|Cu|M) · (手动体积|原始)$/,(_,symbol,status)=>`${symbol} · ${english[status]}`],
 [/^(\d[\d,.]*) 面 · (.+)$/,(_,n,detail)=>`${n} faces · ${english[detail]??detail}`],
 [/^小计 (.+)$/,(_,value)=>`Subtotal ${value}`],
 [/^手动体积 (\d+)$/,(_,n)=>`Manual volume ${n}`],
 [/^尺寸方案 (\d+)$/,(_,n)=>`Size option ${n}`],
 [/^(.+) 副本$/,(_,name)=>`${name} copy`],
 [/^用户导入：(.+)$/,(_,name)=>`User import: ${name}`],
 [/^用户行情 · (.+) 个交易日均值$/,(_,rest)=>`User prices · ${rest} trading-day average`],
 [/^参考快照 · (.+) 个交易日均值$/,(_,rest)=>`Reference snapshot · ${rest} trading-day average`],
 [/^(.+) · ([A-Z]{3}) \/ 克 · (.+)$/,(_,name,currency,source)=>`${english[name]??name} · ${currency} / g · ${english[source]??source}`],
 [/^(.+) ·$/,(_,source)=>`${english[source]??source} ·`],
 [/^已导入 (\d+) 个模型 · 完整网格参与计算$/,(_,n)=>`Imported ${n} models · full mesh used for calculation`],
 [/^删除「(.+)」和它的全部计算记录？原文件不受影响。$/,(_,name)=>`Delete “${name}” and all its calculations? The original file will not change.`],
 [/^源文件单位：(毫米|厘米|米)$/,(_,unit)=>`Source unit: ${english[unit]}`],
 [/^汇率快照：(.+) ECB 参考汇率。离线换算仅供估算。$/,(_,date)=>`Rate snapshot: ECB reference rates dated ${date}. Offline conversions are estimates.`],
 [/^「(.+)」需要确认尺寸单位。根据格式预选 (.+)；请选择与你建模软件中的真实尺寸相符的单位。$/,(_,name,unit)=>`Confirm the units for “${name}”. The format suggests ${translateText(unit,'en')}; choose the unit that matches its real dimensions in your modeling software.`],
 [/^按 (毫米|厘米|米|英寸|英尺) 解释源坐标$/,(_,unit)=>`Interpret source coordinates as ${translateText(unit,'en')}`],
 [/^输出尺寸约为 (.+) (mm|cm|in|ft)。模型几何不变，仅转换输出坐标。$/,(_,dimensions,unit)=>`Output dimensions: about ${dimensions} ${unit}. The model geometry stays unchanged; only output coordinates are converted.`],
 [/^已导出完整模型 · 单位 (mm|cm|in|ft)$/,(_,unit)=>`Full model exported · unit ${unit}`],
 [/^(.+) 个交易日；(.+)。$/,(_,count,kind)=>`${count} trading days; ${english[kind]??kind}.`],
];

export function translateText(value,locale){
 if(locale==='zh-CN')return value;
 if(locale==='zh-TW')return toTraditional(value);
 const text=String(value),trimmed=text.trim();
 if(!trimmed)return text;
 let translated=locale==='ja'||locale==='ko'?localeMaps[locale][trimmed]:english[trimmed];
 const rules=localePatterns[locale]??patterns;
 if(translated===undefined)for(const [pattern,replace] of rules){if(pattern.test(trimmed)){translated=trimmed.replace(pattern,replace);break;}}
 if(translated===undefined)return text;
 return text.slice(0,text.indexOf(trimmed))+translated+text.slice(text.indexOf(trimmed)+trimmed.length);
}

export function initLanguage(){
 let locale='zh-CN';try{const saved=localStorage.getItem('metal-lab-language');if(['zh-CN','zh-TW','en','ja','ko'].includes(saved))locale=saved;}catch{}
 const originalText=new WeakMap(),originalAttrs=new WeakMap();
 function translateNode(node){
  if(node.nodeType===Node.TEXT_NODE){
   if(!node.parentElement||/^(SCRIPT|STYLE|TEXTAREA)$/.test(node.parentElement.tagName))return;
   const cached=originalText.get(node);const source=cached&&node.nodeValue===cached.output?cached.source:node.nodeValue;
   const output=translateText(source,locale);originalText.set(node,{source,output});if(node.nodeValue!==output)node.nodeValue=output;return;
  }
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  let attrs=originalAttrs.get(node);if(!attrs){attrs=new Map();originalAttrs.set(node,attrs);}
  for(const key of ['title','placeholder','aria-label','alt'])if(node.hasAttribute(key)){
   const value=node.getAttribute(key),cached=attrs.get(key),source=cached&&value===cached.output?cached.source:value,output=translateText(source,locale);
   attrs.set(key,{source,output});if(value!==output)node.setAttribute(key,output);
  }
  for(const child of node.childNodes)translateNode(child);
 }
 let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;translateNode(document.body);});};
 const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','placeholder','aria-label','alt']});
 function setLocale(next){if(!['zh-CN','zh-TW','en','ja','ko'].includes(next))return;locale=next;document.documentElement.lang=locale;document.title=locale==='en'?'Metal Lab':locale==='ja'?'金属工房 · Metal Lab':locale==='ko'?'메탈 랩 · Metal Lab':locale==='zh-TW'?'金屬工坊 · Metal Lab':'金属工坊 · Metal Lab';
  document.getElementById('languageSelect').value=locale;try{localStorage.setItem('metal-lab-language',locale);}catch{}schedule();}
 document.getElementById('languageSelect').addEventListener('change',event=>setLocale(event.target.value));setLocale(locale);
 return {get locale(){return locale;},translate:value=>translateText(value,locale)};
}
