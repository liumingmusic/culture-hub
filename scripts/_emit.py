# -*- coding: utf-8 -*-
# 一次性脚本：从 data/entries.json 提取元数据，生成新的 scripts/gen_entries.py
# 新生成器只硬编码元数据，正文统一引用 scripts/bodies.py 的 BODIES[id]
import json

SRC = "data/entries.json"
OUT = "scripts/gen_entries.py"

d = json.load(open(SRC, encoding="utf-8"))
entries = d["entries"]

L = []
L.append("# -*- coding: utf-8 -*-")
L.append("# 本文件由 scripts/_emit.py 从 data/entries.json 生成（仅元数据）。")
L.append("# 正文长文集中在 scripts/bodies.py 的 BODIES 字典中，便于逐篇维护。")
L.append("import json, collections")
L.append("from bodies import BODIES, EXTRA, EXTRA2")
L.append("import json as _json")
L.append('_OLD = {e["id"]: e["body"] for e in _json.load(open("data/entries.json", encoding="utf-8"))["entries"]}')
L.append("")
L.append("entries = []")
L.append("")
L.append("")
L.append("def E(id, title, domain, sub, summary, body, classic, art, tags):")
L.append("    entries.append({")
L.append('        "id": id, "title": title, "domain": domain, "sub": sub,')
L.append('        "summary": summary, "body": body, "classic": classic,')
L.append('        "art": art, "tags": tags,')
L.append("    })")
L.append("")
L.append("")
L.append('def C(lib, i):')
L.append('    return [{"lib": lib, "id": i}]')
L.append("")
L.append('def CH(ch, seal=False):')
L.append('    return {"type": "character", "params": {"char": ch, "seal": seal}}')
L.append("")
L.append('def OB(kind, label=None):')
L.append('    return {"type": "object", "params": {"kind": kind, "label": label}}')
L.append("")
L.append('def ST(term, icon, season):')
L.append('    return {"type": "solar-term", "params": {"term": term, "icon": icon, "season": season}}')
L.append("")
L.append("")
L.append("# ============ 以下为各条目元数据（正文见 bodies.py） ============")
L.append("")

for e in entries:
    cid = e["id"]
    title = json.dumps(e["title"], ensure_ascii=False)
    domain = json.dumps(e["domain"], ensure_ascii=False)
    sub = json.dumps(e["sub"], ensure_ascii=False)
    summary = json.dumps(e["summary"], ensure_ascii=False)
    classic = repr(e["classic"]) if e.get("classic") else "None"
    art = repr(e["art"])
    tags = repr(e["tags"])
    body_arg = '((BODIES.get("%s", "") + EXTRA.get("%s", "") + EXTRA2.get("%s", "")) or _OLD.get("%s", ""))' % (cid, cid, cid, cid)
    L.append("E(%s, %s, %s, %s, %s, %s, %s, %s, %s)" % (
        repr(cid), title, domain, sub, summary, body_arg, classic, art, tags))

L.append("")
L.append("")
L.append("# ============ 写出 entries.json ============")
L.append("dist = collections.Counter(e['domain'] for e in entries)")
L.append('empty = [e["id"] for e in entries if not e["body"]]')
L.append('json.dump({"entries": entries}, open("data/entries.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)')
L.append('print("条目总数:", len(entries))')
L.append("print('各领域分布:', dict(dist))")
L.append('print("使用旧正文(待写厚)的条目数:", len(empty))')

open(OUT, "w", encoding="utf-8").write("\n".join(L))
print("已生成", OUT, "共", len(entries), "条元数据")
