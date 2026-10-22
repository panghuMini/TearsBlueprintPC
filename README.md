# 王国之泪蓝图自由 · TearsBlueprintPC

**Atmosphere19｜19 及以下系统 · 46＋8 蓝图方案**

[English](README.en.md) · [GitHub 仓库](https://github.com/panghuMini/TearsBlueprintPC)

## 一、这个工具与本分支是做什么的？

这是一个为《塞尔达传说：王国之泪》玩家制作的免费桌面蓝图工具。它帮助玩家浏览、分类、收藏和导出蓝图，让不擅长手工搭建复杂载具的玩家，也能体验 MK2、战车和各种创意构建。

游戏原有的蓝图收藏位只有 8 个。本项目结合社区作者的**游戏存档修改工具**与**依盖队蓝图 mod**，提供两种不同的使用流程。存档辅助功能可帮助玩家解锁「蓝图／自动建造」能力，以及 34 张依盖队设计图和 12 块设计石板对应的解锁进度；随后按系统环境选择蓝图替换方式。

**本分支面向 19 及以下系统的大气层环境，重点是依盖队蓝图 mod 的 46 个替换位。** 软件将选中的蓝图导出到 mod 对应位置：34 张依盖队设计图＋12 块设计石板，共 46 个替换位；加上游戏原有的 8 个收藏位，可保留 **46＋8＝54 个自定义蓝图**。这里的 54 不表示把官方收藏栏本身扩成 54 格。相较早期 `master`，本分支还包含后续的存档预览、蓝图资源和导出改进。

### 应该选择哪个分支？

| 分支 | 定位 |
| --- | --- |
| [Atmosphere19](https://github.com/panghuMini/TearsBlueprintPC/tree/Atmosphere19) | 19 及以下系统环境：46 个 mod 替换位＋原有 8 个收藏位 |
| [Atmosphere20](https://github.com/panghuMini/TearsBlueprintPC/tree/Atmosphere20) | 20 及以上系统环境：替换最多 30 条历史蓝图记录 |
| [master](https://github.com/panghuMini/TearsBlueprintPC/tree/master) | 较早的 46 蓝图 mod 基础实现，保留作历史参考 |

这里的「19／20」沿用教学视频中的系统环境称呼，不是本软件的版本号。不同分支按各自工作流使用，历史记录位与永久收藏位需要区分。

### 本项目提供的主要能力

- 持续收集并分类接近 **400 个蓝图**，包括载具、MK2 和其他创意构建；实际资源以当前分支为准。
- 浏览蓝图预览、收藏喜欢的项目，并调整导出顺序。
- 通过存档编辑与对应导出流程，减少逐个手工配置蓝图的操作。
- 围绕玩家反馈持续答疑、排查问题、完善版本适配。

当前发布给玩家的是 **Windows `.exe` 桌面工具**。Windows 7 无法运行现有发行版本，macOS 用户也没有对应的可用发行包；**无需下载的 Web 版仍是后续开发目标**。

项目由 **Ye Chaoyao（panghuMini／胖虎mini版）**主要维护。我负责桌面工具的整合开发、蓝图资源整理、导出工作流和玩家支持；感谢存档编辑器、依盖队蓝图 mod、蓝图创作者，以及协助制作教程的社区作者。上游工具与蓝图创作的贡献归其原作者所有。

## 二、视频教学

本分支请优先阅读下面的 **19 系统教程**。20 及以上系统的 30 条历史记录流程请看 `Atmosphere20`。

| 作者／渠道 | 适用流程 | 视频 |
| --- | --- | --- |
| 联合教学 · B站 UP 主 Hahappify | 19 系统 | [塞尔达传说王国之泪突破蓝图喜爱8张限制，手残一键拥有mk2。19系统](https://www.bilibili.com/video/BV15TyQB1EHv/) |
| 联合教学 · B站 UP 主 Hahappify | 20 系统 | [20大气层版本，塞尔达传说王国之泪一键拥有mk2和各种高达蓝图商店教学](https://www.bilibili.com/video/BV1JK1EBcEqR/) |
| 作者自己的 B站教学 | 19 系统 | [王泪突破蓝图喜爱8张限制，手残一键拥有mk2｜王泪ns switch硬破 模拟器 蓝图商店](https://www.bilibili.com/video/BV1DX1GBeE8S/) |
| 作者自己的 B站教学 | 20 系统 | [20大气层版本，一键拥有mk2和各种高达蓝图商店教学](https://www.bilibili.com/video/BV18NyoBpE2r/) |
| 作者自己的抖音教学 · 等我AD进场 | 19 系统 | [王泪突破蓝图喜爱8张限制，手残一键拥有mk2](https://v.douyin.com/KLK_OrD4nJA/) |
| 作者自己的抖音教学 · 等我AD进场 | 20 系统 | [20大气层版本，一键拥有mk2和各种高达蓝图商店教学](https://v.douyin.com/XV9mihtqIow/) |

特别感谢 **Hahappify** 的联合视频教学与传播支持；作者自己的教学也发布在 B站与抖音（等我AD进场）。

## 三、社区、维护与 Codex for Open Source 申请

### 一个规模不大，但需求真实而坚定的玩家社区

这个工具面向的主要是热爱塞尔达的普通玩家，而不只是程序员。社区规模谈不上庞大，但这些玩家确实需要它，也持续帮助我发现问题、完善使用流程。

根据我在 **2026 年 10 月 22 日**提供的最新说明，用户群有 **196 名成员**；结合 B站、抖音和微信中的日常答疑，我估计工具已经服务过 **200 多名玩家**。后者是维护者基于日常交流的估计，不是去重下载统计。

我坚持**免费提供软件、教学和日常答疑**，也收到过用户的自愿打赏。这份支持不是使用门槛，而是大家对工具实际价值的认可。我们确实很爱塞尔达，也希望更多同好能体验这些有趣的创造。

### 为什么希望继续开发 Web 版？

用户持续反馈 Windows 安装包较大、下载困难；部分玩家使用 Windows 7，另一些使用 Mac，无法使用现有发行包。大家希望有一个打开浏览器就能使用的版本，也期待继续修复问题、增加更实用、更有趣的功能。

计划先把蓝图浏览、选择、排序，以及适合迁移的存档和蓝图文件处理流程逐步迁移到浏览器，再根据用户反馈完善兼容性、错误提示和回归验证。桌面程序依赖的本地文件访问和 Electron 能力需要重新设计，这也是后续开发的重要工作。

### 希望申请的支持与用途

我正在为本项目准备 [Codex for Open Source 项目支持申请](https://openai.com/zh-Hans-CN/form/codex-for-oss/)，主要希望获得**含 Codex 的 ChatGPT Pro 支持**，用于 Web 版开发、代码整理、调试、测试和持续维护。如果能获得支持，我和这个玩家社区都会非常感谢。

申请页面列出的入选支持包括 6 个月 ChatGPT Pro（含 Codex）；是否入选由 OpenAI 审核决定。**截至本页更新时，申请仍在准备和核对阶段，尚未提交，也尚未获得该计划支持。** 当前没有单独承诺 API 调用或 API 额度使用方案。

### 社群使用与持续答疑

以下四张截图由维护者提供，展示玩家社群、安装配置答疑，以及蓝图文件替换等实际维护工作。

<details>
<summary>展开查看四张社群与答疑截图</summary>

| 用户群成员快照 | 群内问题排查 |
| --- | --- |
| <img src="docs/images/community-douyin-group-members.png" width="320" alt="抖音塞尔达游戏交流群信息，截图显示197名成员"> | <img src="docs/images/community-douyin-group-support.png" width="320" alt="维护者在群里帮助玩家排查蓝图文件夹配置问题"> |
| **微信答疑：配置问题与语音协助** | **微信答疑：单个 CAI 蓝图文件替换** |
| <img src="docs/images/community-wechat-support-01.png" width="320" alt="微信中协助玩家处理配置问题并进行语音沟通"> | <img src="docs/images/community-wechat-support-02.png" width="320" alt="微信中说明如何替换单个CAI蓝图文件"> |

</details>

### 个人作品页的五张项目展示图

以下为[作者个人作品页](http://101.132.34.89:8888/#works)中 **「王泪蓝图自由软件.exe」** 的五张图，已保存到仓库内，阅读时不依赖个人网站持续在线。

<details>
<summary>展开查看全部五张项目展示与用户反馈图</summary>

**1. Windows 软件界面总览**

![Windows软件界面与分类蓝图库总览](docs/images/website-overview.webp)

**2. B站公开评价精选**

![B站用户关于软件使用的公开评价](docs/images/website-bilibili-comments.webp)

**3. B站私信与问题跟进**

![B站私信中的使用反馈和持续答疑](docs/images/website-bilibili-messages.webp)

**4. 抖音用户评价精选**

![抖音用户关于修改成功和及时答疑的反馈](docs/images/website-douyin-feedback.webp)

**5. 较早的社群与自愿支持记录**

![较早的作品页资料，记录175人社群和用户自愿支持](docs/images/website-community-support.webp)

</details>

图片来源链接见 [docs/image-sources.json](docs/image-sources.json)。截图保留各自时间点的记录：作品页旧图显示 175 人，本次提供的群截图显示 197 人，维护者最新说明的群人数为 196 人；这些数字不作为下载量或独立统计的活跃用户数。
