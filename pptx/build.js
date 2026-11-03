// Génère presentation.pptx (21 slides) à partir du contenu de la présentation.
// Les notes orales sont relues dans deck/project/slides/<id>.html (balise <aside>).
// Usage : node build.js
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const SKILL_THEME = process.env.APPLY_THEME_JS; // optionnel : chemin vers apply_theme.js
const SLIDES_DIR = path.join(__dirname, "..", "deck", "project", "slides");
const OUT = path.join(__dirname, "..", "presentation.pptx");

// ---------------------------------------------------------------- palette
const K = {
  navy: "16233B", light: "F6F4EE", alt: "EAE6DA", card: "FFFDF8", border: "DDD7C8",
  blue: "2C5F9E", orange: "B4551A", orangeLt: "F0A15E", soft: "4A5568", muted: "6A7179",
  softDark: "BFC8D6", tintBlue: "E3ECF7", tintOrange: "F7E7D9", band: "F1EEE5", code: "0E1728",
};
const HEAD = "Cambria", BODY = "Calibri", MONO = "Courier New";
const THEME = {
  name: "Ontology Generation",
  headFontFace: HEAD, bodyFontFace: BODY,
  colors: {
    dk1: K.navy, lt1: K.card, dk2: K.soft, lt2: K.light,
    accent1: K.blue, accent2: K.orange, accent3: K.orangeLt, accent4: K.softDark,
    accent5: K.border, accent6: K.muted, hlink: K.blue, folHlink: K.orange,
  },
};

// ---------------------------------------------------------------- géométrie (pouces, 13,333 × 7,5)
const W = 13.333, M = 0.75, CW = W - 2 * M, TOP = 1.95, BOTTOM = 6.65;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Ontology Generation using Large Language Models — étude d’article";
pres.author = "Master ISA";
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

function frame(name, bg, eyebrowColor, titleColor, numColor) {
  pres.defineSlideMaster({
    title: name,
    background: { color: bg },
    objects: [
      { placeholder: { options: { name: "eyebrow", type: "body", x: M, y: 0.45, w: CW, h: 0.35,
        fontFace: BODY, fontSize: 12, bold: true, color: eyebrowColor, charSpacing: 2, margin: 0, valign: "top" },
        text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.82, w: CW, h: 1.1,
        fontFace: HEAD, fontSize: 30, bold: true, color: titleColor, margin: 0, valign: "top", align: "left" },
        text: "" } },
    ],
    slideNumber: { x: W - M - 0.6, y: 6.95, w: 0.6, h: 0.3, fontFace: BODY, fontSize: 11, color: numColor, align: "right" },
  });
}
frame("CONTENU", K.light, K.orange, K.navy, K.muted);
frame("CONTENU_ALT", K.alt, K.orange, K.navy, "5A616B");
frame("SOMBRE", K.navy, K.orangeLt, K.light, K.softDark);
pres.defineSlideMaster({ title: "TITRE", background: { color: K.navy } });

// ---------------------------------------------------------------- utilitaires
function notesFor(id) {
  const html = fs.readFileSync(path.join(SLIDES_DIR, `${id}.html`), "utf8");
  const m = html.match(/<aside>([\s\S]*?)<\/aside>/);
  if (!m) return "";
  return m[1].replace(/&amp;/g, "&").replace(/&#160;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

let currentSection = null;
function section(title) { pres.addSection({ title }); currentSection = title; }

function content(id, eyebrow, title, { master = "CONTENU", source } = {}) {
  const s = pres.addSlide({ masterName: master, sectionTitle: currentSection });
  s.addText(eyebrow.toUpperCase(), { placeholder: "eyebrow" });
  s.addText(title, { placeholder: "title" });
  const n = notesFor(id);
  if (n) s.addNotes(n);
  if (source) {
    const dark = master === "SOMBRE";
    s.addText(source, { x: M, y: 6.95, w: CW - 1, h: 0.3, fontFace: BODY, fontSize: 11,
      color: dark ? K.softDark : K.muted, margin: 0, isTextBox: true, objectName: "source" });
  }
  return s;
}

function box(s, x, y, w, h, { fill = K.card, line = K.border, radius = 0.12, name } = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: radius,
    fill: { color: fill }, line: line ? { color: line, width: 0.75 } : { type: "none" }, objectName: name });
}

function text(s, t, x, y, w, h, o = {}) {
  s.addText(t, { x, y, w, h, fontFace: BODY, fontSize: 16, color: K.navy, margin: 0, valign: "top",
    isTextBox: true, paraSpaceAfter: 0, ...o });
}

const b = (t, o = {}) => ({ text: t, options: { bold: true, ...o } });
const r = (t, o = {}) => ({ text: t, options: o });

function table(s, rows, x, y, w, colW, { fontSize = 14, numFrom = Infinity } = {}) {
  const data = rows.map((row, i) => row.map((cell, j) => {
    const isHead = i === 0;
    const c = typeof cell === "object" ? cell : { text: String(cell) };
    return { text: c.text, options: {
      bold: isHead || c.bold, color: isHead ? K.light : K.navy,
      fill: { color: isHead ? K.navy : (i % 2 === 0 ? K.band : K.card) },
      align: c.align || (j >= numFrom ? "right" : "left"),
    } };
  }));
  s.addTable(data, { x, y, w, colW, fontFace: BODY, fontSize, color: K.navy,
    border: { type: "solid", pt: 0.5, color: K.border }, margin: [0.06, 0.1, 0.06, 0.1], valign: "middle" });
}

// ================================================================ 1. Problématique
section("Contexte et problématique");

{ // 1 — couverture
  const s = pres.addSlide({ masterName: "TITRE", sectionTitle: currentSection });
  s.addNotes(notesFor("cover"));
  text(s, "MASTER ISA · REPRÉSENTATION DES CONNAISSANCES & WEB SÉMANTIQUE", M, 0.75, CW, 0.4,
    { fontSize: 13, bold: true, color: K.orangeLt, charSpacing: 2 });
  text(s, "Ontology Generation using Large Language Models", M, 1.35, 11, 2.2,
    { fontFace: HEAD, fontSize: 50, bold: true, color: K.light, valign: "top" });
  text(s, "Peut-on faire rédiger un brouillon d’ontologie OWL à un LLM à partir de user stories et de questions de compétence ?",
    M, 3.65, 9.8, 1.0, { fontSize: 20, color: K.softDark });
  text(s, "A. S. Lippolis, M. J. Saeedizade, R. Keskisärkkä, S. Zuppiroli, M. Ceriani, A. Gangemi, E. Blomqvist, A. G. Nuzzolese",
    M, 5.75, 8.6, 0.65, { fontSize: 14, color: K.light });
  text(s, "ESWC 2025, Research Track (LNCS, pp. 321–341) · arXiv 2503.05388", M, 6.45, 8.6, 0.35,
    { fontSize: 12, color: K.softDark });
  text(s, "Lucas Lamiss · Bastien Teisseire", W - M - 5, 5.1, 5, 0.45, { fontSize: 16, bold: true, color: K.orangeLt, align: "right" });
}

{ // 2 — plan
  const s = content("plan", "Plan", "Six temps, environ 20 minutes");
  const items = [
    ["01", "Problématique", "Le coût de l’ingénierie ontologique, CQ et user stories"],
    ["02", "Solution", "Memoryless CQbyCQ et Ontogenia, deux modes de génération"],
    ["03", "État de l’art", "Méthodologies classiques et travaux LLM pour l’ontologie"],
    ["04", "Évaluation", "Couverture des CQ, OOPS!, éléments superflus, experts"],
    ["05", "Regard critique", "Méthode, sémantique OWL, lien avec nos cours M1/M2"],
    ["06", "Démo", "SPARQL et HermiT sur les ontologies publiées"],
  ];
  const gw = (CW - 2 * 0.3) / 3, gh = 2.05;
  items.forEach(([n, t, d], i) => {
    const x = M + (i % 3) * (gw + 0.3), y = TOP + 0.15 + Math.floor(i / 3) * (gh + 0.3);
    const dark = i === 5;
    box(s, x, y, gw, gh, { fill: dark ? K.navy : K.card, line: dark ? null : K.border });
    text(s, n, x + 0.3, y + 0.25, 1, 0.45, { fontFace: MONO, fontSize: 22, bold: true, color: dark ? K.orangeLt : K.orange });
    text(s, t, x + 0.3, y + 0.75, gw - 0.6, 0.4, { fontSize: 19, bold: true, color: dark ? K.light : K.navy });
    text(s, d, x + 0.3, y + 1.2, gw - 0.6, 0.7, { fontSize: 14, color: dark ? K.softDark : K.soft });
  });
}

{ // 3 — problème
  const s = content("probleme", "01 · Problématique", "Concevoir une ontologie coûte cher, même pour un expert");
  const rows = [
    ["Double expertise", " : connaissance du domaine et savoir-faire en modélisation (logique, OWL, patrons)."],
    ["Méthodes surtout manuelles", " : Methontology, NeOn, eXtreme Design, LOT encadrent le travail mais ne l’automatisent pas."],
    ["Coût cognitif", " : création, curation et validation des axiomes sont longues et sujettes à erreur."],
  ];
  rows.forEach(([h, t], i) => {
    const y = TOP + 0.2 + i * 1.4;
    s.addShape(pres.shapes.OVAL, { x: M, y, w: 0.55, h: 0.55, fill: { color: K.tintBlue }, line: { type: "none" } });
    text(s, String(i + 1), M, y, 0.55, 0.55, { fontSize: 18, bold: true, color: K.blue, align: "center", valign: "middle" });
    text(s, [b(h), r(t)], M + 0.8, y, 6.4, 1.1, { fontSize: 17, valign: "top" });
  });
  const cx = M + 7.65, cw = CW - 7.65;
  box(s, cx, TOP + 0.1, cw, 4.4, { fill: K.navy, line: null });
  text(s, "L’HYPOTHÈSE", cx + 0.4, TOP + 0.45, cw - 0.8, 0.35, { fontSize: 12, bold: true, color: K.orangeLt, charSpacing: 2 });
  text(s, [r("Un LLM bien guidé par le prompt peut produire un "), r("brouillon", { italic: true }),
    r(" OWL qui fait gagner du temps à l’ontologue.")], cx + 0.4, TOP + 0.9, cw - 0.8, 1.9,
    { fontFace: HEAD, fontSize: 22, color: K.light });
  text(s, "Sans fine-tuning : uniquement du prompt engineering (décomposition, chain-of-thought, prompting métacognitif).",
    cx + 0.4, TOP + 2.95, cw - 0.8, 1.3, { fontSize: 15, color: K.softDark });
}

{ // 4 — notions
  const s = content("notions", "01 · Problématique", "Les besoins s’expriment comme en eXtreme Design",
    { source: "Exemple tiré de l’histoire « Theatre » du jeu de données" });
  const cards = [
    ["User story", "Récit du domaine, en langue naturelle.",
      { t: "« Fabio Bianchi is an Italian actor employed at the theatre since May 2004… »", o: { fontFace: HEAD, italic: true } }],
    ["Question de compétence", "Ce à quoi l’ontologie doit permettre de répondre.",
      { t: "« At what time did a certain actor start working for a specific theatre? »", o: { fontFace: HEAD, italic: true } }],
    ["CQ verification", "Une CQ est « modélisée » si l’on peut écrire la requête SPARQL qui y répond.",
      { t: "?e a :Employment ;\n   :hasEmployee ?a ;\n   :hasStartDate ?d .", o: { fontFace: MONO, fontSize: 13 } }],
  ];
  const gw = (CW - 2 * 0.3) / 3, h = 3.0;
  cards.forEach(([t, d, ex], i) => {
    const x = M + i * (gw + 0.3), y = TOP + 0.1;
    box(s, x, y, gw, h);
    text(s, t, x + 0.3, y + 0.25, gw - 0.6, 0.4, { fontSize: 18, bold: true, color: K.blue });
    text(s, d, x + 0.3, y + 0.75, gw - 0.6, 0.8, { fontSize: 14, color: K.soft });
    text(s, ex.t, x + 0.3, y + 1.65, gw - 0.6, 1.2, { fontSize: 14, ...ex.o });
  });
  text(s, [r("Quatre catégories de CQ : "), b("propriété de données"), r(", "), b("propriété d’objet"),
    r(" (simples), "), b("réification"), r(" (relation n-aire, souvent datée) et "), b("restriction"),
    r(" (cardinalité, quantificateur).")], M, TOP + 3.45, CW, 0.9, { fontSize: 16, color: K.soft });
}

{ // 5 — questions de recherche
  const s = content("questions", "01 · Problématique", "Trois questions de recherche", { master: "CONTENU_ALT" });
  const qs = [
    [r("Dans quelle mesure un LLM peut-il générer une ontologie qui "), b("satisfait un ensemble d’exigences"), r(" donné (CQ + user story) ?")],
    [r("Quels "), b("critères d’évaluation"), r(" conviennent à des ontologies générées par LLM ?")],
    [r("Quelles sont les "), b("forces et faiblesses"), r(" typiques de ces ontologies ?")],
  ];
  qs.forEach((q, i) => {
    const y = TOP + 0.15 + i * 1.45;
    s.addShape(pres.shapes.LINE, { x: M, y, w: CW, h: 0, line: { color: K.navy, width: 1 } });
    text(s, `Q${i + 1}`, M, y + 0.3, 1.2, 0.8, { fontFace: HEAD, fontSize: 36, bold: true, color: K.orange });
    text(s, q, M + 1.5, y + 0.32, CW - 1.5, 0.95, { fontSize: 20 });
  });
  s.addShape(pres.shapes.LINE, { x: M, y: TOP + 0.15 + 3 * 1.45, w: CW, h: 0, line: { color: K.navy, width: 1 } });
}

// ================================================================ 2. Solution
section("La solution proposée");

{ // 6 — techniques
  const s = content("techniques", "02 · Solution", "Deux techniques de prompting, une CQ à la fois",
    { source: "D’après la Fig. 1 de l’article · prompts dans le dépôt dersuchendee/Onto-Generation" });
  const lanes = [
    { title: "Memoryless CQbyCQ", sub: " · décomposition, sans mémoire", color: K.blue, tint: K.tintBlue,
      steps: ["User story + CQ i", "LLM : persona, Turtle, pièges à éviter", "OWL i", "Fusion finale des n fichiers"],
      note: "Le modèle ne voit ni les autres CQ ni l’ontologie en cours : contexte réduit d’environ 60 %." },
    { title: "Ontogenia", sub: " · prompting métacognitif + eXtreme Design", color: K.orange, tint: K.tintOrange,
      steps: ["Story + CQ i + ODP + ontologie courante", "LLM : procédure en 9 étapes", "OWL 1…i", "Réinjecté pour CQ i+1"],
      note: "Analyser, décomposer, sous-classes, restrictions, valider, tester avec des individus." },
  ];
  const widths = [2.5, 2.9, 1.4, 2.45], arrow = 0.42, gap = 0.12, lh = 2.2;
  lanes.forEach((L, i) => {
    const y = TOP + 0.05 + i * (lh + 0.25);
    box(s, M, y, CW, lh);
    text(s, [b(L.title, { color: L.color }), r(L.sub, { color: K.soft })], M + 0.3, y + 0.2, CW - 0.6, 0.4, { fontSize: 18 });
    let x = M + 0.3;
    L.steps.forEach((st, j) => {
      const last = j === L.steps.length - 1;
      box(s, x, y + 0.75, widths[j], 0.8, { fill: last ? L.color : L.tint, line: null, radius: 0.08 });
      text(s, st, x + 0.12, y + 0.75, widths[j] - 0.24, 0.8, { fontSize: 14, valign: "middle", color: last ? K.light : K.navy });
      x += widths[j];
      if (!last) {
        s.addShape(pres.shapes.RIGHT_ARROW, { x: x + gap, y: y + 1.03, w: arrow, h: 0.24, fill: { color: L.color }, line: { type: "none" } });
        x += arrow + 2 * gap;
      }
    });
    text(s, L.note, M + 0.3, y + 1.7, CW - 0.6, 0.35, { fontSize: 13, color: K.soft });
  });
}

{ // 7 — comparaison
  const s = content("comparaison", "02 · Solution", "Ce qui distingue les deux prompts", { source: "Section 4.2 de l’article" });
  table(s, [
    ["Dimension", "Memoryless CQbyCQ", "Ontogenia"],
    ["Mémoire entre CQ", "Aucune, fusion à la fin", "Ontologie courante réinjectée"],
    ["Stratégie de prompt", "Décomposition en sous-tâches", "Prompting métacognitif"],
    ["Ontology Design Patterns", "Non", "Oui, injectés en OWL"],
    ["Labels, commentaires, inverses", "Non demandés", "Explicitement demandés"],
    ["Liste de pièges à éviter", "Oui", "Non"],
    ["Relations n-aires", "Classe pivot demandée", "Via les ODP"],
  ], M, TOP + 0.05, CW, [4.0, 3.9, 3.93], { fontSize: 15 });
  text(s, [r("Les deux prompts diffèrent sur "), b("six dimensions à la fois", { color: K.orange }),
    r(". Il n’y a pas d’étude d’ablation : on ne peut pas attribuer un écart de résultat à un ingrédient précis.")],
    M, TOP + 3.2, CW, 0.8, { fontSize: 16, color: K.soft });
}

{ // 8 — modes de génération
  const s = content("generation", "02 · Solution", "Deux modes de génération, des définitions pour mesurer",
    { source: "Sections 3 et 4.3 · GPT-4-1106 (temp. 0), o1-preview et Llama-3.1-405B (paramètres par défaut)" });
  const gw2 = (CW - 0.3) / 2;
  [["Génération indépendante", K.blue, "Une CQ + sa story → un module OWL. Toutes les ontologies du jeu, GPT-4 seul."],
   ["Génération incrémentale", K.orange, "Toutes les CQ d’une story → une ontologie. 3 stories × 15 CQ, 3 LLM."]]
    .forEach(([t, c, d], i) => {
      const x = M + i * (gw2 + 0.3);
      box(s, x, TOP + 0.05, gw2, 1.6);
      text(s, t, x + 0.3, TOP + 0.3, gw2 - 0.6, 0.4, { fontSize: 19, bold: true, color: c });
      text(s, d, x + 0.3, TOP + 0.8, gw2 - 0.6, 0.75, { fontSize: 15, color: K.soft });
    });
  const gw3 = (CW - 0.6) / 3;
  [["Module minimal", "L’ontologie de référence réduite aux éléments utiles à une CQ : le gold standard."],
   ["Élément superflu", "Classe ou propriété nommée absente de toutes les requêtes SPARQL de validation."],
   ["Problème mineur", "Il ne manque qu’une seule propriété pour que la CQ soit modélisée."]]
    .forEach(([t, d], i) => {
      const x = M + i * (gw3 + 0.3), y = TOP + 2.0;
      box(s, x, y, gw3, 1.9, { fill: K.alt, line: null });
      text(s, t, x + 0.3, y + 0.25, gw3 - 0.6, 0.4, { fontSize: 17, bold: true });
      text(s, d, x + 0.3, y + 0.75, gw3 - 0.6, 1.05, { fontSize: 14, color: K.soft });
    });
}

// ================================================================ 3. État de l'art
section("Positionnement par rapport à l’état de l’art");

{ // 9
  const s = content("etat-art", "03 · État de l’art", "Où se situe l’article", { source: "Section 2 de l’article" });
  table(s, [
    ["Travail", "Apport", "Limite selon les auteurs"],
    ["Methontology, NeOn, XD, LOT", "Méthodes d’ingénierie ontologique", "Largement manuelles"],
    ["LLMs4OL (ISWC 2023)", "Relations entre classes ou instances", "Pas d’ontologie complète"],
    ["Mateiu & Groza (2023)", "GPT affiné : phrases → axiomes DL", "Phrases peu réalistes"],
    ["NeOn-GPT, LLMs4Life", "Pipeline LLM inspiré de NeOn", "Un seul prompt, un seul cas"],
    ["CQbyCQ (ESWC 2024)", "Une CQ à la fois, au niveau des étudiants", "Contexte long qui distrait"],
    ["Ontogenia v1 (poster 2024)", "Prompting métacognitif + ODP", "Sans user story"],
    ["Rebboud et al. (ISWC 2024)", "Critères d’évaluation, benchmark", "Ontologies entières, peu de stories"],
  ], M, TOP, CW, [3.6, 4.4, 3.83], { fontSize: 14 });
  text(s, [r("Contribution revendiquée : "), b("deux prompts améliorés"), r(", "), b("un jeu de données de modules minimaux"),
    r(" et "), b("une évaluation multidimensionnelle"), r(".")], M, TOP + 3.0, CW, 0.8, { fontSize: 16, color: K.soft });
}

// ================================================================ 4. Évaluation
section("Protocole et résultats d’évaluation");

{ // 10 — protocole
  const s = content("protocole", "04 · Évaluation", "Un jeu de données et quatre angles d’évaluation",
    { source: "Sections 4.1 et 5 · évaluations 2 à 4 sur la génération incrémentale seulement" });
  const stats = [["10", "ontologies"], ["100", "CQ distinctes"], ["29", "user stories"]];
  stats.forEach(([n, l], i) => {
    const x = M + i * 2.35;
    box(s, x, TOP, 2.1, 1.5, { fill: K.navy, line: null });
    text(s, n, x + 0.25, TOP + 0.15, 1.8, 0.8, { fontFace: HEAD, fontSize: 40, bold: true, color: K.orangeLt });
    text(s, l, x + 0.25, TOP + 0.95, 1.8, 0.4, { fontSize: 14, color: K.softDark });
  });
  const sx = M + 3 * 2.35, sw = CW - 3 * 2.35;
  box(s, sx, TOP, sw, 1.5);
  text(s, [b("Sources"), r(" : Polifonia, Onto-DESIDE, WHOW, IKS + un cours de master")], sx + 0.3, TOP + 0.2, sw - 0.6, 0.7, { fontSize: 15 });
  text(s, "62 % des CQ relèvent de la réification", sx + 0.3, TOP + 0.95, sw - 0.6, 0.4, { fontSize: 15, color: K.soft });
  const ev = [["CQ modélisées", "Proportion, avec et sans problèmes mineurs (« IG »)"], ["OOPS!", "Pitfalls critiques uniquement"],
    ["Superflus", "Taux par classes, prop. d’objet, prop. de données"], ["Experts", "2 ingénieurs, « comme une copie d’étudiant », κ = 0,61"]];
  const gw4 = (CW - 3 * 0.25) / 4;
  ev.forEach(([t, d], i) => {
    const x = M + i * (gw4 + 0.25), y = TOP + 1.8;
    box(s, x, y, gw4, 1.55, { fill: K.tintBlue, line: null });
    text(s, t, x + 0.25, y + 0.2, gw4 - 0.5, 0.4, { fontSize: 17, bold: true, color: K.blue });
    text(s, d, x + 0.25, y + 0.65, gw4 - 0.5, 0.8, { fontSize: 13, color: K.soft });
  });
  text(s, [r("Référence humaine : les rendus "), b("première et dernière version", { color: K.navy }),
    r(" d’étudiants de master novices (avant et après retour de l’enseignant).")], M, TOP + 3.7, CW, 0.7, { fontSize: 16, color: K.soft });
}

{ // 11 — couverture (graphique natif)
  const s = content("res-couverture", "04 · Résultats · couverture des CQ",
    "Tous les LLM dépassent les étudiants novices",
    { source: "Fig. 3 · génération incrémentale, 3 stories × 15 CQ · IG = en ignorant les problèmes mineurs" });
  const labels = ["GPT-4 · CQbyCQ (2024)", "GPT-4 · Memoryless", "GPT-4 · Ontogenia", "Llama 3.1 · Memoryless",
    "Llama 3.1 · Ontogenia", "o1-preview · Memoryless", "o1-preview · Ontogenia", "Étudiants · 1re version", "Étudiants · version finale"];
  const strict = [0.73, 0.93, 0.86, 0.82, 0.82, 0.93, 1.0, 0.62, 0.83];
  const ig = [0.89, 1.0, 0.93, 0.93, 0.88, 0.97, 1.0, 0.71, 0.87];
  // ordre inversé : PowerPoint dessine les barres horizontales de bas en haut
  s.addChart(pres.charts.BAR, [
    { name: "CQ modélisées", labels: [...labels].reverse(), values: [...strict].reverse() },
    { name: "IG (sans problèmes mineurs)", labels: [...labels].reverse(), values: [...ig].reverse() },
  ], {
    x: M, y: TOP - 0.1, w: CW, h: 4.85, barDir: "bar", barGrouping: "clustered", barGapWidthPct: 45,
    chartColors: [K.blue, "A9C1E0"], showLegend: true, legendPos: "t", legendFontSize: 13, legendFontFace: "+mn-lt", legendColor: K.soft,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 11, dataLabelFontFace: "+mn-lt", dataLabelColor: K.navy,
    valAxisMinVal: 0, valAxisMaxVal: 1.1, valAxisHidden: true, valGridLine: { style: "none" },
    catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt", catAxisLabelColor: K.navy, catAxisLineShow: false,
    catGridLine: { style: "none" }, objectName: "graphique couverture",
  });
}

{ // 12 — OOPS!
  const s = content("res-oops", "04 · Résultats · OOPS!", "P19 domine : domaines et portées multiples",
    { source: "Tableau 1 · cumul sur les 3 stories · CQbyCQ évalué avec GPT-4 seulement" });
  table(s, [
    ["Pitfall critique", "CQbyCQ\nGPT-4", "Memoryless\nGPT-4", "Memoryless\nLlama", "Memoryless\no1", "Ontogenia\nGPT-4", "Ontogenia\nLlama", "Ontogenia\no1"],
    ["P05 Inverses erronées", "0", "1", "25", "0", "2", "7", "5"],
    ["P06 Cycles de hiérarchie", "0", "0", "2", "0", "5", "0", "11"],
    [{ text: "P19 Domaines / portées multiples", bold: true }, "0", "23", "32", "1", "4", "15", "0"],
    ["P29 Transitivité erronée", "0", "0", "0", "1", "0", "0", "0"],
    ["P37 Ontologie indisponible", "3", "2", "0", "0", "0", "0", "0"],
    ["P39 Espace de noms ambigu", "3", "2", "0", "1", "1", "0", "0"],
  ], M, TOP - 0.05, CW, [3.2, 1.233, 1.233, 1.233, 1.233, 1.233, 1.233, 1.232], { fontSize: 14, numFrom: 1 });
  text(s, [r("Plusieurs "), r("rdfs:domain", { fontFace: MONO, color: K.navy }), r(" = "), b("conjonction", { color: K.navy }),
    r(", équivalente à "), r("owl:intersectionOf", { fontFace: MONO, color: K.navy }), r(" : inférences non voulues, voire incohérence.")],
    M, TOP + 3.6, 7.3, 1.0, { fontSize: 16, color: K.soft });
  box(s, M + 7.7, TOP + 3.55, CW - 7.7, 0.95, { fill: K.tintOrange, line: null });
  text(s, "o1 a le moins de pitfalls avec Memoryless ; Llama le plus, avec les deux prompts.", M + 7.95, TOP + 3.55, CW - 8.2, 0.95,
    { fontSize: 15, valign: "middle" });
}

{ // 13 — superflus
  const s = content("res-superflus", "04 · Résultats · éléments superflus", "Plus de CQ couvertes, mais au prix de la concision",
    { source: "Tableau 2 · % d’éléments superflus, moyenne non pondérée des 3 stories (calcul de notre part)" });
  table(s, [
    ["Technique (LLM)", "Classes", "Prop. objet", "Prop. données"],
    [{ text: "CQbyCQ (GPT-4)", bold: true }, { text: "7,6", bold: true }, { text: "3,6", bold: true }, { text: "19,7", bold: true }],
    ["Memoryless (GPT-4)", "31,9", "18,2", "45,0"],
    ["Memoryless (Llama)", "37,3", "29,3", "44,8"],
    ["Memoryless (o1)", "36,0", "7,4", "12,9"],
    ["Ontogenia (GPT-4)", "10,9", "24,2", "41,1"],
    ["Ontogenia (Llama)", "38,9", "41,6", "38,9"],
    ["Ontogenia (o1)", "18,8", "40,5", "46,9"],
  ], M, TOP, 7.2, [2.85, 1.45, 1.45, 1.45], { fontSize: 15, numFrom: 1 });
  const x = M + 7.6, w = CW - 7.6;
  text(s, [r("L’ancien CQbyCQ reste "), b("le plus concis"), r(", mais il couvre moins de CQ.")], x, TOP + 0.05, w, 0.8, { fontSize: 16 });
  text(s, [r("Llama : environ "), b("40 % d’éléments superflus"), r(" pour tous les types.")], x, TOP + 1.0, w, 0.8, { fontSize: 16 });
  box(s, x, TOP + 2.0, w, 0.95);
  text(s, "employedSince\nemploymentStartDate", x + 0.25, TOP + 2.0, w - 0.5, 0.95, { fontFace: MONO, fontSize: 14, valign: "middle" });
  text(s, "Deux propriétés générées pour la même CQ (exemple de l’article).", x, TOP + 3.1, w, 0.7, { fontSize: 14, color: K.soft });
}

{ // 14 — experts
  const s = content("res-experts", "04 · Résultats · experts", "Les experts confirment : o1 + Ontogenia en tête",
    { source: "Tableau 3 · part des CQ jugées « adéquatement modélisées », moyenne des 2 experts, κ de Cohen = 0,61" });
  table(s, [
    ["Story", "Technique", "Llama 3.1", "o1-preview"],
    ["Musique", "Memoryless", "0,60", "0,90"],
    ["", "Ontogenia", "0,86", { text: "0,96", bold: true }],
    ["Théâtre", "Memoryless", "0,66", "0,73"],
    ["", "Ontogenia", "0,63", { text: "1,00", bold: true }],
    ["Hôpital", "Memoryless", "0,63", "0,73"],
    ["", "Ontogenia", "0,66", { text: "1,00", bold: true }],
  ], M, TOP, 6.6, [1.5, 1.9, 1.6, 1.6], { fontSize: 15, numFrom: 2 });
  const x = M + 7.0, w = CW - 7.0;
  text(s, "Défauts relevés chez Llama", x, TOP, w, 0.4, { fontSize: 18, bold: true });
  text(s, [
    { text: "nommage incohérent, classes redondantes", options: { bullet: true, breakLine: true } },
    { text: "références circulaires dans la taxonomie", options: { bullet: true, breakLine: true } },
    { text: "cardinalités mal formées", options: { bullet: true, breakLine: true } },
    { text: "labels et commentaires absents", options: { bullet: true } },
  ], x, TOP + 0.5, w, 1.9, { fontSize: 15, color: K.soft, paraSpaceAfter: 6 });
  box(s, x, TOP + 2.6, w, 0.9, { fill: K.tintOrange, line: null });
  text(s, "Pour tous les fichiers : domaines et portées incorrects.", x + 0.25, TOP + 2.6, w - 0.5, 0.9, { fontSize: 15, valign: "middle" });
}

// ================================================================ 5. Critique
section("Regard critique, démo et conclusion");

{ // 15 — énoncé
  const s = pres.addSlide({ masterName: "TITRE", sectionTitle: currentSection });
  s.addNotes(notesFor("statement"));
  text(s, "05 · REGARD CRITIQUE", M, 1.3, CW, 0.4, { fontSize: 13, bold: true, color: K.orangeLt, charSpacing: 2 });
  text(s, "Pouvoir écrire la requête SPARQL ne garantit pas une ontologie OWL utilisable", M, 1.9, 11, 2.4,
    { fontFace: HEAD, fontSize: 44, bold: true, color: K.light });
  text(s, [r("La métrique principale est "), b("syntaxique et lexicale", { color: K.light }),
    r(". Elle ne dit rien de ce que la sémantique formelle fait de l’ontologie.")], M, 4.6, 10, 1.0, { fontSize: 20, color: K.softDark });
}

{ // 16 — forces
  const s = content("forces", "05 · Regard critique · forces", "Un travail ancré dans la méthodologie et ouvert");
  const items = [
    ["Méthode de référence", "Les exigences suivent eXtreme Design : stories, CQ, ODP, tests par SPARQL."],
    ["Jeu de données réutilisable", "Modules minimaux par CQ, archive protégée par mot de passe contre la fuite vers l’entraînement."],
    ["Évaluation multidimensionnelle", "Quatre angles qui se contredisent en partie : un vrai résultat sur la difficulté d’évaluer."],
    ["Sorties publiées", "Prompts, 18 ontologies, rapports OOPS!, grilles des experts : l’évaluation est vérifiable."],
  ];
  const gw = (CW - 0.3) / 2, gh = 1.55;
  items.forEach(([t, d], i) => {
    const x = M + (i % 2) * (gw + 0.3), y = TOP + Math.floor(i / 2) * (gh + 0.25);
    box(s, x, y, gw, gh);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.3, w: 0.5, h: 0.5, fill: { color: K.tintBlue }, line: { type: "none" } });
    text(s, "+", x + 0.3, y + 0.3, 0.5, 0.5, { fontSize: 20, bold: true, color: K.blue, align: "center", valign: "middle" });
    text(s, t, x + 1.0, y + 0.28, gw - 1.3, 0.4, { fontSize: 17, bold: true });
    text(s, d, x + 1.0, y + 0.72, gw - 1.3, 0.75, { fontSize: 14, color: K.soft });
  });
  text(s, [r("Positionnement réaliste : un "), b("copilote", { color: K.navy }), r(" qui produit un brouillon, pas un remplaçant de l’ontologue.")],
    M, TOP + 3.75, CW, 0.5, { fontSize: 16, color: K.soft });
}

{ // 17 — limites
  const s = content("limites", "05 · Regard critique · méthode", "Des conclusions plus fortes que le protocole",
    { source: "Limites méthodologiques · en partie reconnues par les auteurs (annexe 9.3)" });
  const items = [
    ["Échelle réduite", "L’évaluation fine porte sur 3 stories / 45 CQ issues d’un cours de 2008."],
    ["Une seule exécution", "Pas de variance ni de test statistique ; o1 et Llama avec les paramètres par défaut, GPT-4 à T = 0."],
    ["Pas d’ablation", "Mémoire, ODP, métacognition, pièges : impossible de savoir ce qui fait la différence."],
    ["Critère « modélisée » laxiste", "Jugé à la main par l’équipe, « quelle que soit la qualité » ; les superflus dépendent des requêtes choisies."],
    ["Référence humaine faible", "Des novices, pas d’experts ; aucune mesure du temps gagné, pourtant l’argument du copilote."],
    ["Fuite et reproductibilité", "Stories et CQ en ligne depuis 2008 ; pas de script de génération publié (patterns.csv absent)."],
  ];
  const gw = (CW - 0.3) / 2, gh = 1.3;
  items.forEach(([t, d], i) => {
    const x = M + (i % 2) * (gw + 0.3), y = TOP + Math.floor(i / 2) * (gh + 0.2);
    box(s, x, y, gw, gh, { fill: K.card, line: K.border });
    text(s, t, x + 0.3, y + 0.18, gw - 0.6, 0.4, { fontSize: 16, bold: true });
    text(s, d, x + 0.3, y + 0.58, gw - 0.6, 0.65, { fontSize: 13, color: K.soft });
  });
}

{ // 18 — lecture RC & WS
  const s = content("kr-ws", "05 · Regard critique · lecture RC & Web sémantique", "Ce que nos cours M1/M2 obligent à regarder",
    { master: "CONTENU_ALT", source: "Lecture critique au regard des modules Représentation des connaissances et Web sémantique" });
  const items = [
    ["Sémantique RDFS / OWL", "Fusionner des fragments = union de graphes. Les domaines s’intersectent : P19 est mécanique."],
    ["Profil OWL 2 DL", "xsd:date, xsd:gYear hors de la datatype map ; propriété transitive sous cardinalité : hors DL."],
    ["« Réification »", "Il s’agit du motif de relation n-aire (W3C, ODP), pas de rdf:Statement ni de RDF-star."],
    ["Réutilisation", "3 fichiers sur 18 utilisent un vocabulaire externe (OWL-Time…) ; le reste en example.org."],
    ["Pas de raisonneur", "Ni cohérence, ni classes insatisfiables, ni tests SHACL sur des données."],
    ["Faible axiomatisation", "3 CQ de restriction sur 100 : on évalue surtout des schémas légers."],
  ];
  const gw = (CW - 0.5) / 3, gh = 1.6;
  items.forEach(([t, d], i) => {
    const x = M + (i % 3) * (gw + 0.25), y = TOP - 0.05 + Math.floor(i / 3) * (gh + 0.22);
    box(s, x, y, gw, gh, { fill: K.card, line: null });
    text(s, t, x + 0.25, y + 0.2, gw - 0.5, 0.4, { fontSize: 16, bold: true, color: K.blue });
    text(s, d, x + 0.25, y + 0.62, gw - 0.5, 0.9, { fontSize: 13, color: K.soft });
  });
  text(s, [r("Piste : boucler "), b("LLM → raisonneur / OOPS! / SHACL → LLM"),
    r(", une approche neuro-symbolique que l’article évoque sans la mettre en œuvre.")], M, TOP + 3.65, CW, 0.7, { fontSize: 16 });
}

{ // 19 — nos vérifications
  const s = content("verifs", "05 · Regard critique · nos vérifications", "Nous avons repassé les 18 ontologies publiées",
    { source: "rdflib 7, owlrl, HermiT via owlready2 · fichiers du dépôt dersuchendee/Onto-Generation" });
  const stats = [
    ["3/18", [r("fichiers Turtle "), b("invalides"), r(" : préfixes non déclarés (rdflib)")]],
    ["14/15", [r("fichiers lisibles avec au moins un "), b("P19"), r(" (requête SPARQL)")]],
    ["1/18", [r("ontologie acceptée par "), b("HermiT"), r(", donc en OWL 2 DL")]],
    ["4 ≠ 0", [r("cas P19 dans le rapport OOPS! publié (Théâtre, Ontogenia, o1) contre 0 dans le Tableau 1")]],
  ];
  const gw = (CW - 3 * 0.25) / 4, gh = 2.25;
  stats.forEach(([n, d], i) => {
    const x = M + i * (gw + 0.25), dark = i === 2;
    box(s, x, TOP - 0.05, gw, gh, { fill: dark ? K.navy : K.card, line: dark ? null : K.border });
    text(s, n, x + 0.25, TOP + 0.15, gw - 0.5, 0.8, { fontFace: HEAD, fontSize: 40, bold: true, color: dark ? K.orangeLt : K.orange });
    text(s, d, x + 0.25, TOP + 1.0, gw - 0.5, 1.15, { fontSize: 14, color: dark ? K.light : K.navy });
  });
  box(s, M, TOP + 2.45, CW, 1.95, { fill: K.card, line: K.border });
  text(s, ":hasStartDate rdfs:domain :Employment, :TimePeriod, :TimeInterval ;\n              rdfs:range  xsd:date, xsd:dateTime, xsd:gYear .",
    M + 0.3, TOP + 2.65, CW - 0.6, 0.75, { fontFace: MONO, fontSize: 14 });
  text(s, "Ontologie la mieux notée (100 % des CQ) : un contrat de travail est inféré comme une période, et aucune valeur ne satisfait les trois portées.",
    M + 0.3, TOP + 3.5, CW - 0.6, 0.75, { fontSize: 15, color: K.soft });
}

{ // 20 — démo
  const s = content("demo", "06 · Démo · environ 3 minutes", "Rejouer l’évaluation avec les outils du cours",
    { master: "SOMBRE", source: "Script demo/demo.py · Entrée pour passer d’une étape à l’autre" });
  const steps = [
    "Charger les 18 fichiers : 3 refusés par le parseur Turtle",
    "Requête SPARQL de détection de P19, puis HermiT sur chaque fichier",
    "Inférence RDFS : un Employment devient TimePeriod et TimeInterval",
    "CQ verification : SPARQL sur un ABox tiré de la story (Fabio Bianchi)",
    "Option --live : prompt Memoryless sur une CQ avec une clé d’API",
  ];
  text(s, steps.map((t, i) => ({ text: t, options: { bullet: { type: "number" }, breakLine: i < steps.length - 1 } })),
    M, TOP + 0.1, 6.4, 4.2, { fontSize: 17, color: K.light, paraSpaceAfter: 12 });
  const x = M + 6.8, w = CW - 6.8;
  box(s, x, TOP + 0.1, w, 1.8, { fill: K.code, line: null });
  text(s, [r("pip install -r requirements.txt", { breakLine: true }), r("python demo.py", { breakLine: true }),
    r("python demo.py --live", { color: K.orangeLt })], x + 0.3, TOP + 0.1, w - 0.6, 1.8,
    { fontFace: MONO, fontSize: 15, color: K.light, valign: "middle", paraSpaceAfter: 4 });
  text(s, "Python 3, rdflib, owlrl, owlready2 (HermiT, Java requis). Données : dépôt des auteurs, licence MIT.",
    x, TOP + 2.15, w, 0.8, { fontSize: 13, color: K.softDark });
}

{ // 21 — conclusion
  const s = content("conclusion", "Conclusion", "Un bon brouillon, pas encore une ontologie", { source: "Merci, questions ?" });
  const gw = (CW - 0.4) / 2;
  text(s, "CE QUE DIT L’ARTICLE", M, TOP, gw, 0.35, { fontSize: 12, bold: true, color: K.blue, charSpacing: 2 });
  text(s, [
    b("Q1 · "), r("o1 + Ontogenia fait au moins aussi bien qu’un novice.", { breakLine: true }),
    b("Q2 · "), r("Un seul critère ne suffit pas ; l’évaluation manuelle reste nécessaire.", { breakLine: true }),
    b("Q3 · "), r("Domaines et portées erronés, inverses fautives, éléments redondants."),
  ], M, TOP + 0.5, gw, 2.6, { fontSize: 16, paraSpaceAfter: 14 });
  const x = M + gw + 0.4;
  box(s, x, TOP - 0.05, gw, 3.25, { fill: K.navy, line: null });
  text(s, "NOTRE LECTURE", x + 0.35, TOP + 0.2, gw - 0.7, 0.35, { fontSize: 12, bold: true, color: K.orangeLt, charSpacing: 2 });
  text(s, [
    r("La couverture des CQ mesure le "), b("vocabulaire"), r(", pas la "), b("logique"), r(".", { breakLine: true }),
    r("Il faut ajouter à l’évaluation un raisonneur, un contrôle de profil OWL 2 et des tests sur des données.", { breakLine: true }),
    r("Utile pour démarrer, à condition de garder l’ontologue dans la boucle.", { color: K.softDark }),
  ], x + 0.35, TOP + 0.65, gw - 0.7, 2.45, { fontSize: 16, color: K.light, paraSpaceAfter: 12 });
  text(s, "Références : Lippolis et al., ESWC 2025 · Saeedizade & Blomqvist, ESWC 2024 · Presutti et al., eXtreme Design, 2009 · Poveda-Villalón et al., OOPS!, 2014 · W3C, OWL 2 Structural Specification et Note « n-ary relations ».",
    M, TOP + 3.5, CW, 0.8, { fontSize: 12, color: K.soft });
}

// ---------------------------------------------------------------- écriture
(async () => {
  await pres.writeFile({ fileName: OUT });
  if (SKILL_THEME) {
    const { applyTheme } = require(SKILL_THEME);
    await applyTheme(OUT, THEME);
  }
  console.log("écrit :", OUT);
})();
