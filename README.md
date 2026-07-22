# 中华文化通识 · Culture Hub

一张可浏览、可检索的「中华文化地图」——按文化领域组织零散知识点，并在每个知识点底部把相关应用互相链起来。

> 纯静态 · 零 key · 零外部图片 · 离线可用 · GitHub Pages 直接托管

## 定位

- **百科分类门户**：按文化领域组织知识点，可分类浏览、可全文搜索、可看图文与经典原文。
- **四大内容支柱**：中华古典常识 / 通识百科 / 民俗风物 / 礼节家训。
- **六大领域**：思想哲学 · 汉字·文学 · 节俗·时令 · 历史脉络 · 艺术·工艺 · 衣食·礼制。
- **整合枢纽**：每条通识底部挂「拓展」rail，按 `tags` 跳到你已上线的应用（成语故事 / 每日诗词 / 历史上的今天 / 养生日历 / 知识闯关），让孤立应用第一次互相连通。
- **今日通识卡**：首页每日轮转一张通识（日期哈希选，同日一致）。

## 目录结构

```
culture-hub/
├── index.html            # 单页应用入口（hash 路由：#/分类 / #/条目 / 搜索）
├── assets/
│   ├── css/style.css     # 宣纸·朱印 主题
│   └── js/
│       ├── app.js        # 路由 + 渲染（首页/分类/详情/搜索）+ 今日通识
│       ├── search.js     # 客户端全文检索（标题/正文/tags）
│       ├── links.js      # 读 links.json，按 tags 生成「拓展」rail
│       └── svg-art.js    # 参数化 SVG 配图（节气/汉字/器物/线描）
├── data/
│   ├── domains.json      # 六大领域 + 子分类 + 各域主色
│   ├── entries.json      # 通识条目（标题/领域/子分类/正文/经典原文/配图参数/tags）
│   ├── classics.json     # 经典原文库（道德经/论语/诗经/楚辞/四书…公版摘句）
│   └── links.json        # 跨应用关联索引（tag → 已上线应用 URL + 打开方式）
├── scripts/build-data.js # 整理/校验 entries、补全 tags
├── package.json
├── .gitignore
└── README.md
```

## 本地运行

```bash
cd culture-hub
python3 -m http.server 8080
# 打开 http://localhost:8080
```

> 必须通过 http 服务器访问（数据用 fetch 加载）。直接双击 `index.html`（file://）会因浏览器安全策略无法读取 JSON。

## 部署（GitHub Pages）

仓库根目录即站点根。推送 `main` 分支后，在仓库 **Settings → Pages** 选择 `main` / `root` 即可。

```bash
git init && git add -A && git commit -m "init culture-hub"
git remote add origin git@github.com:liumingmusic/culture-hub.git
git push -u origin main
```

## 内容边界与安全

- 纯文化 / 教育内容，无新闻、无医疗诊断、无占卜。
- 本站不做重复功能：节气只做文化科普（健康建议跳养生日历），历史事件只做脉络（具体某日跳历史上的今天）。
- 配图全为参数化 SVG，无任何外部图片 / API / key。

## 反向导流（可选）

可在你其它应用的提示词 / 页面里加「通识门户」跳转，URL 见 `data/links.json` 的 `reverse` 字段，与本站「拓展」rail 形成双向导流。
