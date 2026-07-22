/* svg-art.js — 参数化 SVG 配图生成器（零外部图片）
 * 用法：SVGArt.render(art, domainColor) -> SVG 字符串
 * art = { type: 'solar-term'|'character'|'object', params: {...} }
 */
(function () {
  "use strict";

  var SEASON = {
    spring: "#6f9c6b",
    summer: "#c0504d",
    autumn: "#c89b3c",
    winter: "#5a7a9a",
    cycle: "#9E2B25"
  };

  function frame(inner, bg) {
    bg = bg || "#fffdf7";
    return (
      '<svg class="art-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="装饰插图">' +
      '<rect x="0" y="0" width="320" height="200" rx="14" fill="' + bg + '" stroke="#e7ddc8" stroke-width="1.5"/>' +
      inner +
      "</svg>"
    );
  }

  /* ---------- 节气 / 时令 ---------- */
  function solarTerm(p, color) {
    var season = SEASON[p.season] || SEASON.cycle;
    var icon = p.icon || "☀️";
    var term = p.term || "节气";
    var rays = "";
    for (var i = 0; i < 12; i++) {
      var a = (Math.PI * 2 * i) / 12;
      var x1 = 160 + Math.cos(a) * 30,
        y1 = 64 + Math.sin(a) * 30;
      var x2 = 160 + Math.cos(a) * 42,
        y2 = 64 + Math.sin(a) * 42;
      rays +=
        '<line x1="' +
        x1.toFixed(1) +
        '" y1="' +
        y1.toFixed(1) +
        '" x2="' +
        x2.toFixed(1) +
        '" y2="' +
        y2.toFixed(1) +
        '" stroke="' +
        season +
        '" stroke-width="2" stroke-linecap="round" opacity="0.55"/>';
    }
    var inner =
      rays +
      '<circle cx="160" cy="64" r="22" fill="' + season + '" opacity="0.92"/>' +
      '<text x="160" y="78" font-size="26" text-anchor="middle" dominant-baseline="central">' +
      icon +
      "</text>" +
      '<line x1="40" y1="150" x2="280" y2="150" stroke="#cdbfa0" stroke-width="2"/>' +
      '<text x="160" y="128" font-size="26" font-family="\'Songti SC\',\'SimSun\',serif" text-anchor="middle" fill="' +
      (color || "#9E2B25") +
      '" font-weight="700">' +
      term +
      "</text>" +
      '<text x="160" y="174" font-size="12" letter-spacing="3" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">顺 天 应 时</text>';
    return frame(inner);
  }

  /* ---------- 汉字 / 描红 ---------- */
  function character(p, color) {
    var ch = p.char || "文";
    var seal = !!p.seal;
    var fill = seal ? color || "#9E2B25" : "#ffffff";
    var stroke = seal ? "#9E2B25" : color || "#9E2B25";
    var charColor = seal ? "#F7F1E3" : "#2B2B2B";
    var inner =
      '<rect x="92" y="32" width="136" height="136" rx="10" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/>' +
      '<rect x="104" y="44" width="112" height="112" rx="6" fill="none" stroke="' + stroke + '" stroke-width="1.5" opacity="0.5"/>' +
      '<text x="160" y="104" font-size="86" font-family="\'STKaiti\',\'KaiTi\',\'Songti SC\',serif" text-anchor="middle" dominant-baseline="central" fill="' +
      charColor +
      '">' +
      ch +
      "</text>";
    return frame(inner);
  }

  /* ---------- 器物 / 线描 ---------- */
  function object(p, color) {
    color = color || "#2F4F4F";
    var builders = {
      silkroad: function () {
        return (
          '<path d="M40 150 Q90 120 140 140 T260 132" fill="none" stroke="#cdbfa0" stroke-width="2"/>' +
          '<path d="M120 132 l8 -22 l10 4 l-4 -16 l12 2 l-2 -14 l10 6 l4 -10 l10 8 l-2 22 l-16 6 l-6 10 z" fill="none" stroke="' +
          color +
          '" stroke-width="3" stroke-linejoin="round"/>' +
          '<circle cx="134" cy="120" r="2.4" fill="' + color + '"/>' +
          '<circle cx="146" cy="122" r="2.4" fill="' + color + '"/>' +
          '<path d="M250 70 a18 18 0 1 0 0.1 0" fill="none" stroke="#c89b3c" stroke-width="3"/>' +
          '<text x="160" y="178" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "丝路") +
          "</text>"
        );
      },
      compass: function () {
        return (
          '<rect x="70" y="86" width="180" height="40" rx="8" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<path d="M150 118 q-4 -34 14 -40 q10 6 4 20 q14 -2 10 12 q-12 6 -28 8 z" fill="' + color + '" opacity="0.85"/>' +
          '<path d="M150 86 l10 -22 l4 22 z" fill="#9E2B25"/>' +
          '<text x="160" y="170" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "司南") +
          "</text>"
        );
      },
      greatwall: function () {
        return (
          '<path d="M40 150 q30 -30 70 -10 q30 18 70 -6 q30 -20 70 0" fill="none" stroke="' + color + '" stroke-width="2.5"/>' +
          '<path d="M60 150 v-26 h10 v8 h10 v-8 h10 v26 M110 138 v-26 h10 v8 h10 v-8 h10 v26 M170 132 v-26 h10 v8 h10 v-8 h10 v26 M220 138 v-26 h10 v8 h10 v-8 h10 v26" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<text x="160" y="178" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "长城") +
          "</text>"
        );
      },
      brush: function () {
        return (
          '<line x1="70" y1="150" x2="210" y2="60" stroke="' + color + '" stroke-width="8" stroke-linecap="round"/>' +
          '<line x1="70" y1="150" x2="120" y2="116" stroke="#8B4513" stroke-width="8" stroke-linecap="round"/>' +
          '<path d="M195 70 q22 6 18 26 q-10 -6 -22 -10 z" fill="#2B2B2B"/>' +
          '<text x="160" y="178" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "笔墨") +
          "</text>"
        );
      },
      ink: function () {
        return (
          '<path d="M40 120 q40 -40 80 -10 q30 -34 70 -8 q40 -30 90 0" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<path d="M50 150 q60 -10 110 0 t110 0" fill="none" stroke="#6f9c6b" stroke-width="2" opacity="0.7"/>' +
          '<circle cx="120" cy="70" r="14" fill="none" stroke="#c89b3c" stroke-width="2.5"/>' +
          '<text x="160" y="178" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "水墨") +
          "</text>"
        );
      },
      mask: function () {
        return (
          '<path d="M110 60 q50 -26 100 0 q14 40 -4 70 q-46 30 -92 0 q-18 -30 -4 -70 z" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<path d="M132 92 q14 -10 28 0 M160 92 q14 -10 28 0" fill="none" stroke="#9E2B25" stroke-width="3"/>' +
          '<path d="M140 120 q20 16 40 0" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<text x="160" y="178" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "脸谱") +
          "</text>"
        );
      },
      vase: function () {
        return (
          '<path d="M140 50 h40 v10 q26 14 22 50 q-4 40 -42 44 q-38 -4 -42 -44 q-4 -36 22 -50 z" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<path d="M138 96 q22 14 44 0 M134 116 q26 16 52 0 M138 136 q22 12 44 0" fill="none" stroke="#2E4A6B" stroke-width="2.5" opacity="0.8"/>' +
          '<text x="160" y="178" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "青花") +
          "</text>"
        );
      },
      cloud: function () {
        return (
          '<path d="M70 110 q-20 0 -20 -18 q0 -18 22 -16 q4 -20 28 -16 q14 -16 34 -4 q26 -6 28 18 q22 -2 20 18 q0 18 -22 16 q-10 14 -30 6 q-18 12 -40 0 q-22 8 -40 -4 z" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<path d="M150 120 q14 10 30 0" fill="none" stroke="#6f9c6b" stroke-width="2.5"/>' +
          '<text x="160" y="178" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "云纹") +
          "</text>"
        );
      },
      garden: function () {
        return (
          '<path d="M100 150 v-44 h60 v44 M96 106 l34 -22 l34 22 M100 150 h60" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<path d="M90 106 q10 -16 30 -16 q20 0 30 16" fill="none" stroke="' + color + '" stroke-width="2.5"/>' +
          '<line x1="130" y1="106" x2="130" y2="150" stroke="' + color + '" stroke-width="2.5"/>' +
          '<text x="160" y="178" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "园林") +
          "</text>"
        );
      },
      tea: function () {
        return (
          '<path d="M108 96 h84 v20 q0 30 -42 30 q-42 0 -42 -30 z" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<path d="M192 104 q22 2 20 20 q-2 16 -22 14" fill="none" stroke="' + color + '" stroke-width="3"/>' +
          '<path d="M138 80 q6 -12 0 -22 M160 80 q6 -12 0 -22 M182 80 q6 -12 0 -22" fill="none" stroke="#6f9c6b" stroke-width="2.5" opacity="0.8"/>' +
          '<text x="160" y="178" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "茶") +
          "</text>"
        );
      },
      robe: function () {
        return (
          '<path d="M120 56 l40 16 l40 -16 l16 24 l-22 14 l0 64 l-68 0 l0 -64 l-22 -14 z" fill="none" stroke="' + color + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M160 72 l-26 30 l26 18 l26 -18 z" fill="none" stroke="#9E2B25" stroke-width="2.5"/>' +
          '<line x1="160" y1="120" x2="160" y2="174" stroke="' + color + '" stroke-width="2.5"/>' +
          '<text x="160" y="190" font-size="13" font-family="\'Songti SC\',serif" text-anchor="middle" fill="#8A8175">' +
          (p.label || "深衣") +
          "</text>"
        );
      }
    };
    var b = builders[p.kind] || builders.vase;
    return frame(b());
  }

  var renderers = {
    "solar-term": solarTerm,
    character: character,
    object: object
  };

  window.SVGArt = {
    render: function (art, color) {
      if (!art || !art.type) return frame('<text x="160" y="104" font-size="14" font-family="serif" text-anchor="middle" fill="#8A8175">中华文化</text>');
      var r = renderers[art.type] || character;
      try {
        return r(art.params || {}, color);
      } catch (e) {
        return frame('<text x="160" y="104" font-size="14" font-family="serif" text-anchor="middle" fill="#8A8175">插图</text>');
      }
    }
  };
})();
