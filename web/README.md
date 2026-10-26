# 王泪蓝图自由 · 网页版

以现有 Atmosphere19 / Atmosphere20 两个分支为基础的独立静态网页。首页包含对应抖音视频、原理对比和两个入口。所有存档处理均在浏览器内完成，不上传用户文件。

## 运行与构建

```sh
npm ci
npm run dev
# http://127.0.0.1:4173
npm test
npm run build
```

部署 `dist/` 到静态服务器即可；支持 NAS 内网 HTTP，公开部署建议使用 HTTPS。没有数据库、服务器端存档处理或 Electron 依赖。已包含运行时依赖；仅运行/构建不需要联网安装。`npm ci` 用于开发与测试。

## 两种流程

| 功能 | 19 及以下 / 模拟器 | 20 及以上 |
| --- | --- | --- |
| 网页方案容量 | 46 | 30 |
| 作者推荐 | 原19分支的44个蓝图 | 原20分支的30个蓝图 |
| 导出 | 完整46位 CAI + PNG，未选位恢复原图纸 | 修改选中 slot 的蓝图记录 |
| 图片 | 随蓝图更换，缺图时使用明确占位图 | caption.sav 及游戏图片保持原样 |
| 保留 | 依盖图34 + 石板12，另有原8收藏 | 历史逐渐覆盖，原游戏收藏上限8 |

19导出保持原桌面版 `Game/BluePrint/CombinedActorInfo` 和 `Texture` 结构。**资源包不含依盖队基础 mod**；需先按原教程安装匹配游戏版本的基础 mod，再覆盖资源。

两版均提供393蓝图、25分类、搜索、预览、单CAI下载、独立收藏、排序/拖动、多选、20套备份、复制/重命名/批量删除/恢复推荐、JSON迁移、图文指南与作者联系。

存档页支持JKSV ZIP（有无顶层文件夹）、6个slot、截图预览、单独progress.sav，以及可选的自动建造/46图纸解锁、48000电量、999999矿石、27类装置各888。19支持全slot处理；20仅修改选中slot，默认保护已有收藏。大师编辑器保留物品、装备、马匹、坐标、完成度、蓝图及原始变量编辑能力。

## 数据与兼容性

- 网页收藏存在本地浏览器，19/20各自独立；导出JSON可迁移，清理网站数据前先导出。
- 游戏的30条记录中包含收藏记录，不能把“保留收藏标记”等同于“保留收藏内容”。默认跳过已收藏位；取消保护才沿用原桌面版的全记录替换方式。
- 按逻辑Index到物理记录的映射写入CAI，不直接把第N条当作文件第N块。
- 一键流程只接受编辑器已知的1.0、1.1/1.2、1.4格式，校验magic、版本、数组长度、索引和CAI块结构；未知mod存档明确拒绝。
- ZIP限制128MB输入、256MB展开、单文件32MB；拒绝路径穿越、多套备份混装及损坏结构。失败时不生成部分结果。
- 全量打包保留其他slot、caption和附带文件内容；原文件不被覆盖。
- 建议新版Chrome/Edge/Firefox/Safari。Windows7仍取决于可运行的浏览器，未做旧版浏览器保证。
- 抖音采用官方iframe播放器，另提供抖音和B站链接作为登录/网络受限时的备用入口。大师编辑器外部3D预览仍需联网。

## 上游来源与本地改动

桌面代码：Atmosphere19 `4726089`；Atmosphere20 `a031884`。原仓库的编辑器gitlink `da746a12236c6c29efac41c663aede57a55bb26a` 无法从远端取得。因此采用维护者公开fork [panghuMini/savegame-editors](https://github.com/panghuMini/savegame-editors) 的 `dfcf452a4ee7a4933b06405f863400d9faf72673`，保留MIT许可。

`public/editor/` 保存完整TOTK编辑器及依赖：默认中文、fflate本地化、关闭无效示例入口、去掉远程字体请求、增加现代下载适配。嵌入模式在父页面显示下载链接，独立模式直接下载。

`public/engine-vendor/` 提取该版本的MarcFile及纯数据模块（去除FileSaver/tooltip初始化）；`engine.js`在Worker内复用其哈希、Pouch、AutoBuilder和Completism算法，直接写入所选字段，不用完整UI保存回写无关字段。

fflate固定为0.8.2（MIT），浏览器包已附带。原蓝图与图片来自桌面项目；贡献归创作者。`tests/fixtures/progress.sav` 是上游公开测试样例，不进入生产dist。

## 验证

自动测试覆盖资源完整性、两分支推荐差异、46位导出顺序及默认补全、解锁恢复、物品数量、无修改时逐字节一致、收藏保护、30条记录替换、逻辑索引映射、未知格式/损坏数据拒绝、JSON容量与路径处理。

浏览器实测：搜索/收藏、存档选择、选项保留、ZIP两个slot截图预览、指定slot导入、结果下载、大师编辑器中文载入及修改下载。下载后重新解析并逐字节对比，确认其他slot/截图/附带文件、取消选中的数值不变。

尚未在实体Switch或模拟器内运行修改后的存档。上线给玩家使用前，建议维护者用自己的19/20环境各完成一次备份、恢复和建造验证。


## NAS 内网测试部署

NAS 地址：`http://192.168.1.45:6219/`。网页绑定该内网 IPv4 地址，不新增 FRP、域名或公网映射。

项目位于 `/vol2/1000/docker-hdd/tears-blueprint-web/`；每次构建放在独立 `releases/` 目录，`deployment.json` 记录当前发布，`current` 指向当前版本。静态文件以只读卷挂载，用户选中的存档不会传到 NAS。

部署配置保存在 `deploy/nas/`。复用 NAS 已有 `uozi/nginx-ui:v2.5.7` 的固定镜像 ID，仅运行 Nginx 二进制，不启动或接入原 nginx-ui 服务。容器 `tears-blueprint-web` 设置为 `unless-stopped`，独立于现有应用。

在 NAS 上查看或管理本项目：

```sh
docker ps --filter name=tears-blueprint-web
docker logs --tail 50 tears-blueprint-web
docker restart tears-blueprint-web
# 临时停用本项目：docker stop tears-blueprint-web
```

局域网 HTTP 不提供 `crypto.randomUUID`，因此收藏备份编号使用也支持 HTTP 的 `crypto.getRandomValues`。浏览器收藏仍按网站地址隔离；后续换域名时需先导出 JSON 再导入。

部署验收：容器运行、内网绑定、自动重启策略和首页/Worker/fflate/大师编辑器的 HTTP 200 与 MIME 类型均已核实。当前电脑到 NAS 内网地址的路由被代理 TUN 接管，直连返回空响应；本次通过已有 SSH 连接建立 `127.0.0.1:16219` 临时预览通道，已实际打开 NAS 首页并验证蓝图库搜索和收藏。临时通道关闭不影响 NAS 服务；同一局域网正常直连时使用 NAS 地址即可。
