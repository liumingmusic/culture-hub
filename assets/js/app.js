/* app.js — 路由 + 渲染（首页 / 分类 / 详情 / 搜索）+ 今日通识 */
(function () {
  "use strict";
  var CH = (window.CH = window.CH || {});
  var app = document.getElementById("app");
  var qbox = document.getElementById("q");
  var DATA = { domains: [], entries: [], classics: {}, links: null };
  var DOMBYID = {};
  var DOMBYNAME = {};
  var CLASSIC = {};

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function colorOf(domainName) {
    var d = DOMBYNAME[domainName];
    return d ? d.color : "#9E2B25";
  }
  function art(artObj, domainName) {
    try {
      return SVGArt.render(artObj, colorOf(domainName));
    } catch (e) {
      return "";
    }
  }
  function resolveClassic(list) {
    if (!list) return [];
    return list
      .map(function (c) {
        var src = CLASSIC[c.lib];
        if (!src) return null;
        var q = src.filter(function (x) {
          return x.id === c.id;
        })[0];
        if (!q) return null;
        return { src: c.lib, text: q.text, ref: q.ref };
      })
      .filter(Boolean);
  }
  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments,
        self = this;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(self, a);
      }, ms);
    };
  }
  function dateHash() {
    var d = new Date();
    var key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return h;
  }
  function todayEntry() {
    var h = dateHash();
    var list = DATA.entries;
    return list[h % list.length];
  }
  function highlight(text, q) {
    text = esc(text);
    q = (q || "").trim();
    if (!q) return text;
    var terms = q.split(/\s+/).filter(Boolean).map(function (t) {
      return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    if (!terms.length) return text;
    var re = new RegExp("(" + terms.join("|") + ")", "gi");
    return text.replace(re, '<span class="search-hl">$1</span>');
  }

  /* ---------- 数据加载 ---------- */
  function loadJSON(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " " + path);
      return r.json();
    });
  }

  function boot() {
    Promise.all([
      loadJSON("data/domains.json"),
      loadJSON("data/entries.json"),
      loadJSON("data/classics.json"),
      loadJSON("data/links.json")
    ])
      .then(function (res) {
        DATA.domains = res[0].domains;
        DATA.entries = res[1].entries;
        DATA.classics = res[2];
        CLASSIC = res[2];
        DATA.links = res[3];
        DATA.domains.forEach(function (d) {
          DOMBYID[d.id] = d;
          DOMBYNAME[d.name] = d;
        });
        window.addEventListener("hashchange", router);
        if (qbox) {
          qbox.addEventListener(
            "input",
            debounce(function () {
              var v = qbox.value.trim();
              if (v) {
                if (location.hash.indexOf("#/search") !== 0)
                  location.hash = "#/search?q=" + encodeURIComponent(v);
                else renderSearch();
              } else if (location.hash.indexOf("#/search") === 0) {
                renderSearch();
              }
            }, 160)
          );
        }
        router();
      })
      .catch(function (err) {
        app.innerHTML =
          '<div class="search-empty">数据加载失败：' +
          esc(err.message) +
          "<br>请通过本地服务器（python3 -m http.server）访问，勿用 file:// 直接打开。</div>";
      });
  }

  /* ---------- 路由 ---------- */
  function router() {
    var h = location.hash || "#/";
    if (h.indexOf("#/entry/") === 0) return renderEntry(decodeURIComponent(h.slice(8)));
    if (h.indexOf("#/domain/") === 0) return renderDomain(decodeURIComponent(h.slice(9)));
    if (h.indexOf("#/search") === 0) return renderSearch();
    return renderHome();
  }

  /* ---------- 首页 ---------- */
  function renderHome() {
    var today = todayEntry();
    var tc = colorOf(today.domain);
    var domainsHTML = DATA.domains
      .map(function (d) {
        var cnt = DATA.entries.filter(function (e) {
          return e.domain === d.name;
        }).length;
        return (
          '<div class="card domain fade" data-domain="' +
          d.id +
          '" style="--dc:' +
          d.color +
          '">' +
          '<div class="d-icon">' +
          esc(d.icon) +
          "</div>" +
          "<h3>" +
          esc(d.name) +
          "</h3>" +
          '<div class="d-desc">' +
          esc(d.desc) +
          "</div>" +
          '<div class="d-meta">子分类 <b>' +
          d.subs.length +
          "</b> · 条目 <b>" +
          cnt +
          "</b></div>" +
          "</div>"
        );
      })
      .join("");

    // 推荐：用日期哈希取相邻几条，保证同日稳定
    var base = dateHash();
    var recs = [];
    for (var i = 1; recs.length < 4; i++) {
      recs.push(DATA.entries[(base + i * 7) % DATA.entries.length]);
    }
    var recHTML = recs
      .map(function (e) {
        return entryCard(e);
      })
      .join("");

    app.innerHTML =
      '<section class="today card fade">' +
      '<div class="art">' +
      art(today.art, today.domain) +
      "</div>" +
      "<div>" +
      '<div class="tagline">· 每日一张 ·</div>' +
      "<h2>" +
      esc(today.title) +
      "</h2>" +
      '<div class="summary">' +
      esc(today.summary) +
      "</div>" +
      '<button class="btn-back" data-entry="' +
      today.id +
      '">查看详情 →</button>' +
      "</div>" +
      "</section>" +
      '<div class="section-title">九大领域 <span class="more">点领域卡进入分类</span></div>' +
      '<div class="domains">' +
      domainsHTML +
      "</div>" +
      '<div class="section-title">通识推荐</div>' +
      '<div class="entry-list">' +
      recHTML +
      "</div>";
  }

  function entryCard(e) {
    var c = colorOf(e.domain);
    return (
      '<div class="card entry-item fade" data-entry="' +
      e.id +
      '" style="--dc:' +
      c +
      '">' +
      '<div class="e-sub">' +
      esc(e.domain) +
      " · " +
      esc(e.sub) +
      "</div>" +
      "<h4>" +
      esc(e.title) +
      "</h4>" +
      "<p>" +
      esc(e.summary) +
      "</p>" +
      "</div>"
    );
  }

  /* ---------- 分类页 ---------- */
  function renderDomain(id) {
    var d = DOMBYID[id];
    if (!d) return router();
    var list = DATA.entries.filter(function (e) {
      return e.domain === d.name;
    });
    var subs = d.subs;
    var chips = ['<button class="tag" data-sub="" style="background:' + d.color + ';color:#fff;border:none">全部</button>']
      .concat(
        subs.map(function (s) {
          return '<button class="tag" data-sub="' + esc(s) + '">' + esc(s) + "</button>";
        })
      )
      .join("");
    app.innerHTML =
      '<button class="btn-back" data-home="1">← 返回首页</button>' +
      '<div class="detail-head"><div class="crumbs">中华文化通识 / ' +
      esc(d.name) +
      "</div>" +
      '<h1 style="color:' + d.color + '">' + esc(d.name) + "</h1>" +
      '<div class="sub">' + esc(d.desc) + "</div></div>" +
      '<div class="tags" id="subchips">' + chips + "</div>" +
      '<div class="entry-list" id="domlist" style="margin-top:16px">' +
      list.map(entryCard).join("") +
      "</div>";

    var chipWrap = document.getElementById("subchips");
    chipWrap.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-sub]");
      if (!btn) return;
      var sub = btn.getAttribute("data-sub");
      var filtered = sub
        ? list.filter(function (e) {
            return e.sub === sub;
          })
        : list;
      document.getElementById("domlist").innerHTML = filtered.length
        ? filtered.map(entryCard).join("")
        : '<div class="search-empty">该子分类暂无条目</div>';
    });
  }

  /* ---------- 详情页 ---------- */
  function renderEntry(id) {
    var e = null;
    for (var i = 0; i < DATA.entries.length; i++)
      if (DATA.entries[i].id === id) {
        e = DATA.entries[i];
        break;
      }
    if (!e) return router();
    var c = colorOf(e.domain);
    var classics = resolveClassic(e.classic);
    var classicHTML = classics
      .map(function (q) {
        return (
          '<div class="classic"><div class="c-label">— ' +
          esc(q.src) +
          " · 经典原文 —</div>" +
          "<blockquote>" +
          esc(q.text) +
          "</blockquote>" +
          '<div class="c-ref">《' +
          esc(q.src) +
          "》 " +
          esc(q.ref) +
          "</div></div>"
        );
      })
      .join("");

    var tagsHTML = (e.tags || [])
      .map(function (t) {
        return '<span class="tag">#' + esc(t) + "</span>";
      })
      .join("");

    var rail = CH.buildRail(e.tags, DATA.links);
    var railHTML = rail.length
      ? '<div class="rail-cards">' +
        rail
          .map(function (r) {
            return (
              '<a class="rail-card" href="' +
              esc(r.url) +
              '" target="_blank" rel="noopener">' +
              '<span class="r-dot" style="background:' +
              r.color +
              '"></span>' +
              "<span><div class=\"r-app\">" + esc(r.app) + "</div>" +
              '<div class="r-label">' + esc(r.label) + " →</div></span></a>"
            );
          })
          .join("") +
        "</div>"
      : '<div class="rail-empty">本条暂无跨应用拓展（相关应用将持续接入）。</div>';

    // 延伸资料（出处链接 / 参考书目 / 相关条目）
    var ext = e.extends || {};
    var extLinks = (ext.links || []).map(function (l) {
      return '<a class="ext-link" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.title) + " ↗</a>";
    }).join("");
    var extBooks = (ext.books || []).map(function (b) {
      return '<span class="ext-book">' + esc(b) + "</span>";
    }).join("");
    var extRel = (ext.related || []).map(function (rid) {
      var re = null;
      for (var i = 0; i < DATA.entries.length; i++) if (DATA.entries[i].id === rid) { re = DATA.entries[i]; break; }
      if (!re) return "";
      return '<span class="ext-rel" data-entry="' + esc(rid) + '" style="--dc:' + colorOf(re.domain) + '">' + esc(re.title) + "</span>";
    }).join("");
    var extHTML = (extLinks || extBooks || extRel)
      ? '<div class="ext"><div class="ext-title">延伸资料</div>' +
        (extLinks ? '<div class="ext-sec"><div class="ext-h">出处链接</div><div class="ext-links">' + extLinks + "</div></div>" : "") +
        (extBooks ? '<div class="ext-sec"><div class="ext-h">参考书目</div><div class="ext-books">' + extBooks + "</div></div>" : "") +
        (extRel ? '<div class="ext-sec"><div class="ext-h">相关条目</div><div class="ext-rels">' + extRel + "</div></div>" : "") +
        "</div>"
      : "";

    app.innerHTML =
      '<button class="btn-back" data-home="1">← 返回首页</button>' +
      '<div class="detail-head">' +
      '<div class="crumbs"><a data-home="1" style="cursor:pointer">中华文化通识</a> / ' +
      esc(e.domain) +
      " / " +
      esc(e.sub) +
      "</div>" +
      "<h1>" +
      esc(e.title) +
      "</h1>" +
      '<div class="sub">' +
      esc(e.domain) +
      " · " +
      esc(e.sub) +
      "</div>" +
      "</div>" +
      '<div class="detail-art">' + art(e.art, e.domain) + "</div>" +
      '<div class="detail-body">' +
        e.body
          .split(/\n\s*\n/)
          .map(function (p) { return "<p>" + esc(p.trim()) + "</p>"; })
          .join("") +
        "</div>" +
      classicHTML +
      '<div class="tags">' + tagsHTML + "</div>" +
      extHTML +
      '<div class="rail"><div class="rail-title">拓展 · 相关应用</div>' + railHTML + "</div>";
  }

  /* ---------- 搜索页 ---------- */
  function parseQ() {
    var h = location.hash || "";
    var idx = h.indexOf("?");
    if (idx < 0) return "";
    try {
      return new URLSearchParams(h.slice(idx + 1)).get("q") || "";
    } catch (e) {
      return "";
    }
  }
  function renderSearch() {
    var q = parseQ();
    if (qbox && document.activeElement !== qbox) qbox.value = q;
    if (!q) {
      app.innerHTML =
        '<button class="btn-back" data-home="1">← 返回首页</button>' +
        '<div class="search-empty">输入关键词，检索标题 / 正文 / 标签 / 领域。<br>试试：<b>节气</b> · <b>诗词</b> · <b>礼</b> · <b>青花</b></div>';
      return;
    }
    var hits = CH.searchEntries(q, DATA.entries);
    if (!hits.length) {
      app.innerHTML =
        '<button class="btn-back" data-home="1">← 返回首页</button>' +
        '<div class="search-empty">未找到与“' + esc(q) + "”相关的内容。</div>";
      return;
    }
    // 按领域分组
    var groups = {};
    hits.forEach(function (e) {
      (groups[e.domain] = groups[e.domain] || []).push(e);
    });
    var body = "";
    Object.keys(groups).forEach(function (dom) {
      var c = colorOf(dom);
      body +=
        '<div class="search-group"><div class="g-head" style="--dc:' + c + '">' + esc(dom) + " · " + groups[dom].length + " 条</div>";
      body += groups[dom]
        .map(function (e) {
          return (
            '<div class="card entry-item fade" data-entry="' + e.id + '" style="--dc:' + c + '">' +
            '<div class="e-sub">' + esc(e.domain) + " · " + esc(e.sub) + "</div>" +
            "<h4>" + highlight(e.title, q) + "</h4>" +
            "<p>" + highlight(e.summary, q) + "</p></div>"
          );
        })
        .join("");
      body += "</div>";
    });
    app.innerHTML =
      '<button class="btn-back" data-home="1">← 返回首页</button>' +
      '<div class="detail-head"><div class="crumbs">搜索</div>' +
      "<h1>“" + esc(q) + "” 的 " + hits.length + " 条结果</h1></div>" +
      body;
  }

  /* ---------- 全局点击委托 ---------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-entry],[data-domain],[data-home]");
    if (!t) return;
    if (t.hasAttribute("data-domain"))
      location.hash = "#/domain/" + encodeURIComponent(t.getAttribute("data-domain"));
    else if (t.hasAttribute("data-entry"))
      location.hash = "#/entry/" + encodeURIComponent(t.getAttribute("data-entry"));
    else if (t.hasAttribute("data-home")) location.hash = "#/";
  });

  boot();
})();
