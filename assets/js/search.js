/* search.js — 客户端全文检索（标题/正文/摘要/tags/领域） */
window.CH = window.CH || {};
CH.searchEntries = function (q, entries) {
  q = (q || "").trim().toLowerCase();
  if (!q) return [];
  var terms = q.split(/\s+/).filter(Boolean);
  var results = [];
  entries.forEach(function (e) {
    var hay = [
      e.title,
      e.summary,
      e.body,
      (e.tags || []).join(" "),
      e.domain,
      e.sub
    ]
      .join(" ")
      .toLowerCase();
    var score = 0;
    var hit = false;
    terms.forEach(function (t) {
      if (hay.indexOf(t) >= 0) {
        score++;
        hit = true;
      }
    });
    if (hit) results.push({ entry: e, score: score });
  });
  results.sort(function (a, b) {
    return b.score - a.score;
  });
  return results.map(function (r) {
    return r.entry;
  });
};
