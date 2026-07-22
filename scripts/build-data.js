/* scripts/build-data.js
 * 校验 entries / domains / classics / links 的一致性与完整性。
 * 用法：node scripts/build-data.js
 * 不依赖任何第三方包。
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
function read(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

const domains = read("data/domains.json").domains;
const entries = read("data/entries.json").entries;
const classics = read("data/classics.json");
const links = read("data/links.json");

const issues = [];
const domByName = {};
domains.forEach((d) => (domByName[d.name] = d));
const classicIndex = {};
Object.keys(classics).forEach((src) => {
  classicIndex[src] = {};
  classics[src].forEach((q) => (classicIndex[src][q.id] = q));
});

const byDomain = {};
entries.forEach((e) => (byDomain[e.domain] = (byDomain[e.domain] || 0) + 1));

entries.forEach((e) => {
  if (!e.id) issues.push("条目缺少 id");
  if (!e.title) issues.push((e.id || "?") + " 缺少 title");
  if (!domByName[e.domain]) issues.push(e.id + " 的 domain 无效：" + e.domain);
  if (!Array.isArray(e.tags) || !e.tags.length) issues.push(e.id + " 缺少 tags");
  if (!e.art || !e.art.type) issues.push(e.id + " 缺少 art");
  (e.classic || []).forEach((c) => {
    if (!classicIndex[c.lib] || !classicIndex[c.lib][c.id])
      issues.push(e.id + " 的经典引用无效：" + c.lib + "/" + c.id);
  });
});

Object.keys(links.map || {}).forEach((tag) => {
  links.map[tag].forEach((a) => {
    if (!links.apps[a.app])
      issues.push("links.map 的 tag " + tag + " 引用了未定义的 app：" + a.app);
  });
});

console.log("领域数：", domains.length);
console.log("条目数：", entries.length);
console.log("各领域条目分布：");
Object.keys(byDomain).forEach((k) => console.log("  - " + k + "：" + byDomain[k]));
console.log("经典原文来源数：", Object.keys(classics).length);
console.log("links 标签映射数：", Object.keys(links.map || {}).length);

if (issues.length) {
  console.error("\n❌ 发现问题：");
  issues.forEach((i) => console.error("  - " + i));
  process.exit(1);
} else {
  console.log("\n✅ 校验通过：所有条目 domain / classic / tags / art 均有效。");
}
