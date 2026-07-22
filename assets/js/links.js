/* links.js — 按 tags 生成「拓展」rail 的纯函数 */
window.CH = window.CH || {};
CH.buildRail = function (tags, links) {
  if (!links || !links.map) return [];
  var seen = {};
  var out = [];
  (tags || []).forEach(function (t) {
    var apps = links.map[t];
    if (!apps) return;
    apps.forEach(function (a) {
      var app = a.app;
      var info = (links.apps && links.apps[app]) || {};
      var key = app + "|" + (a.label || "");
      if (seen[key]) return;
      seen[key] = 1;
      out.push({
        app: app,
        label: a.label || "了解更多",
        url: info.url || "#",
        color: info.color || "#9E2B25"
      });
    });
  });
  return out;
};
