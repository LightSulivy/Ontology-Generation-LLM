"""
Démo — « Ontology Generation using Large Language Models » (Lippolis et al., ESWC 2025)

On rejoue une partie de l'évaluation sur les ontologies que les auteurs ont publiées
(https://github.com/dersuchendee/Onto-Generation, licence MIT), sans clé d'API :

  1. Validité syntaxique des 18 fichiers Turtle générés (3 histoires x 2 prompts x 3 LLM)
  2. Détection du pitfall OOPS! P19 (domaines/portées multiples) par une requête SPARQL
  3. Conséquence logique de P19 : inférence RDFS (owlrl) puis test de cohérence OWL 2 DL (HermiT)
  4. Vérification de CQ par SPARQL (méthode « CQ verification ») sur un ABox tiré de l'histoire
  5. (optionnel) Génération live d'un module avec le prompt Memoryless CQbyCQ, si une clé est fournie

Usage :  python demo.py            (étapes 1 à 4)
         python demo.py --live     (ajoute l'étape 5 ; nécessite ANTHROPIC_API_KEY ou OPENAI_API_KEY)
"""

import logging
import os
import sys
import tempfile
from pathlib import Path

import owlrl
import pandas as pd
import rdflib
from rdflib import OWL, RDF, RDFS, XSD, Literal, Namespace

logging.disable(logging.CRITICAL)  # rdflib signale bruyamment les littéraux du type "XXXX-XX-XX"

HERE = Path(__file__).parent
DATA = HERE / "data"
GEN = DATA / "incremental"
THEATRE_O1 = GEN / "theatre_ontogenia_o1_preview.ttl"
T = Namespace("http://example.org/theatreontology#")


def title(txt):
    print("\n" + "=" * 78 + f"\n {txt}\n" + "=" * 78)


def pause():
    if sys.stdin.isatty() and "--auto" not in sys.argv:
        try:
            input("\n  [Entrée pour continuer] ")
        except EOFError:
            pass


def short(g, term):
    return term.n3(g.namespace_manager)


# ---------------------------------------------------------------------------
# 1. Validité syntaxique
# ---------------------------------------------------------------------------
def step_syntax():
    title("1. Les ontologies générées sont-elles du Turtle valide ?")
    graphs, ko = {}, []
    for f in sorted(GEN.glob("*.ttl")):
        try:
            graphs[f.name] = rdflib.Graph().parse(f, format="turtle")
            status = "OK"
        except Exception as e:  # noqa: BLE001 - on veut afficher toute erreur de parsing
            ko.append(f.name)
            status = "ERREUR : " + str(e).splitlines()[1].strip()[:45]
        print(f"  {f.name:58s} {status}")
    print(f"\n  -> {len(ko)}/{len(graphs) + len(ko)} fichiers ne se chargent pas (préfixes non déclarés).")
    print("     Cela correspond aux pitfalls P37/P39 du Tableau 1 : la sortie du LLM n'est pas")
    print("     directement exploitable sans post-traitement.")
    return graphs


# ---------------------------------------------------------------------------
# 2. Pitfall P19 par SPARQL
# ---------------------------------------------------------------------------
P19_QUERY = """
SELECT ?p (COUNT(DISTINCT ?d) AS ?nDom) (COUNT(DISTINCT ?r) AS ?nRange) WHERE {
  { ?p rdfs:domain ?d } UNION { ?p rdfs:range ?r }
}
GROUP BY ?p
HAVING (COUNT(DISTINCT ?d) > 1 || COUNT(DISTINCT ?r) > 1)
"""


def step_p19(graphs):
    title("2. Pitfall P19 « multiple domains or ranges » détecté en SPARQL")
    print(P19_QUERY)
    rows = []
    for name, g in graphs.items():
        n = len(list(g.query(P19_QUERY, initNs={"rdfs": RDFS})))
        rows.append(
            {
                "fichier": name.replace(".ttl", ""),
                "classes": len(set(g.subjects(RDF.type, OWL.Class))),
                "obj.prop": len(set(g.subjects(RDF.type, OWL.ObjectProperty))),
                "data.prop": len(set(g.subjects(RDF.type, OWL.DatatypeProperty))),
                "P19": n,
                "HermiT (OWL 2 DL)": hermit_consistency(g),
            }
        )
    print(pd.DataFrame(rows).to_string(index=False))
    ok = sum(r["HermiT (OWL 2 DL)"] == "COHÉRENTE" for r in rows)
    print(f"\n  -> Ontologies chargées par un raisonneur OWL 2 DL : {ok} sur 18.")
    print("     (le prompt Memoryless CQbyCQ suggère lui-même xsd:date et xsd:time, hors OWL 2)")
    print("\n  NB : le Tableau 1 de l'article rapporte P19 = 0 pour Ontogenia + o1-preview (3 histoires),")
    print("  alors que le rapport OOPS! publié par les auteurs pour theatre_ontogenia_o1_preview")
    print("  liste 4 cas (during, hasLocation, hasStartDate, hasEndDate), comme la requête ci-dessus.")


# ---------------------------------------------------------------------------
# 3. Sémantique de P19 : intersection des domaines / portées
# ---------------------------------------------------------------------------
def step_semantics():
    title("3. Pourquoi P19 est « critique » : la sémantique OWL des domaines multiples")
    g = rdflib.Graph().parse(THEATRE_O1)
    p = T.hasStartDate
    print(f"  Dans {THEATRE_O1.name}, la propriété :hasStartDate a été redéclarée à chaque CQ :")
    print("    rdfs:domain ->", ", ".join(sorted(short(g, d) for d in g.objects(p, RDFS.domain))))
    print("    rdfs:range  ->", ", ".join(sorted(short(g, r) for r in g.objects(p, RDFS.range))))
    print("  Plusieurs rdfs:domain = INTERSECTION (et non union) des classes.")
    pause()

    # 3a. Inférence RDFS : on asserte un seul fait tiré de l'histoire.
    abox = rdflib.Graph()
    abox.add((T.emp_Fabio, RDF.type, T.Employment))
    abox.add((T.emp_Fabio, T.hasStartDate, Literal("2004-05-01", datatype=XSD.date)))
    closure = g + abox
    owlrl.DeductiveClosure(owlrl.RDFS_Semantics).expand(closure)
    types = sorted(short(g, c) for c in closure.objects(T.emp_Fabio, RDF.type) if isinstance(c, rdflib.URIRef))
    print("\n  a) Fait asserté :  :emp_Fabio a :Employment ; :hasStartDate \"2004-05-01\"^^xsd:date")
    print("     Types inférés par RDFS (règle rdfs2) :", ", ".join(t for t in types if not t.startswith("rdfs:")))
    print("     -> un contrat de travail devient aussi un :TimePeriod et un :TimeInterval.")
    pause()

    print("     Et les portées xsd:gYear ∩ xsd:date ∩ xsd:dateTime ont des espaces de valeurs")
    print("     disjoints (XSD) : AUCUNE valeur ne peut satisfaire :hasStartDate.")
    pause()

    # 3b. Raisonneur OWL 2 DL (HermiT via owlready2, nécessite Java).
    fixed_abox = rdflib.Graph()
    fixed_abox.add((T.emp_Fabio, RDF.type, T.Employment))
    fixed_abox.add((T.emp_Fabio, T.hasStartDate, Literal("2004-05-01T00:00:00", datatype=XSD.dateTime)))
    print("\n  b) Raisonneur OWL 2 DL (HermiT) :")
    print(f"     {'ontologie générée, telle quelle':34s} -> {hermit_consistency(g + abox)}")
    print(f"     {'ontologie réparée à la main':34s} -> {hermit_consistency(repaired(g) + fixed_abox)}")
    print("     -> le fichier généré n'est même pas en OWL 2 DL : xsd:gYear / xsd:date ne sont pas")
    print("        dans la « datatype map » d'OWL 2. L'ontologie « couvre » la CQ (métrique de")
    print("        l'article) mais un raisonneur standard refuse de la charger.")


def repaired(g):
    """Réparation manuelle : types OWL 2 uniquement, une seule portée et pas de domaine pour les dates."""
    r = rdflib.Graph()
    for s, p, o in g:
        r.add((s, p, XSD.dateTime if o in (XSD.date, XSD.gYear) else o))
    for prop in (T.hasStartDate, T.hasEndDate):
        r.remove((prop, RDFS.domain, None))
        r.remove((prop, RDFS.range, None))
        r.add((prop, RDFS.range, XSD.dateTime))
    # Littéraux typés xsd:date/gYear de l'ABox éventuelle : retirés (non supportés par HermiT).
    for s, p, o in list(r):
        if isinstance(o, Literal) and o.datatype in (XSD.date, XSD.gYear):
            r.remove((s, p, o))
    return r


def hermit_consistency(graph):
    try:
        import owlready2
    except ImportError:
        return "owlready2 non installé"
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp:
        nt = Path(tmp) / "onto.nt"
        graph.serialize(nt, format="nt", encoding="utf-8")
        world = owlready2.World()
        with open(nt, "rb") as f:
            onto = world.get_ontology("http://example.org/theatreontology").load(fileobj=f, format="ntriples")
        try:
            with onto:
                owlready2.sync_reasoner_hermit(world, infer_property_values=False, debug=0)
            return "COHÉRENTE"
        except owlready2.OwlReadyInconsistentOntologyError:
            return "INCOHÉRENTE"
        except owlready2.OwlReadyJavaError as e:
            msg = str(e)
            if "UnsupportedDatatypeException" in msg:
                dt = msg.split("The datatype '")[1].split("'")[0].replace(str(XSD), "xsd:")
                return f"REFUSÉE (type {dt} hors OWL 2)"
            if "Non-simple property" in msg:
                return "REFUSÉE (prop. non simple dans une cardinalité)"
            return "erreur Java : " + msg.strip().splitlines()[-1][:80]
        except Exception as e:  # noqa: BLE001 - Java absent, etc.
            return f"raisonneur indisponible ({type(e).__name__})"


# ---------------------------------------------------------------------------
# 4. CQ verification par SPARQL
# ---------------------------------------------------------------------------
ABOX_THEATRE = """
@prefix : <http://example.org/theatreontology#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

:FabioBianchi a :Actor ; :isEmployeeIn :emp1 .
:GrandTheatreRome a :Theatre .
:emp1 a :Employment ; :hasEmployee :FabioBianchi ; :hasEmployer :GrandTheatreRome ;
      :hasStartDate "2004-05-01"^^xsd:dateTime .

:MerchantGrandTheatre a :TheatreProduction ;
      :hasPremiere :premiere1 ;
      :hasPremiereDate "2009-09-07"^^xsd:date .
:premiere1 a :Premiere .
"""

CQ_QUERIES = {
    "FestSCQ13 — At what time did a certain actor start working for a specific theatre?": """
        SELECT ?actor ?theatre ?start WHERE {
          ?e a :Employment ; :hasEmployee ?actor ; :hasEmployer ?theatre ; :hasStartDate ?start .
        }""",
    "FestSCQ11 — When was the premier of a certain production? (modélisation 1)": """
        SELECT ?prod ?date WHERE { ?prod a :TheatreProduction ; :hasPremiereDate ?date . }""",
    "FestSCQ11 — (modélisation 2, concurrente, dans le même fichier)": """
        SELECT ?prod ?premiere ?date WHERE {
          ?prod :hasPremiere ?premiere . OPTIONAL { ?premiere ?p ?date . FILTER(isLiteral(?date)) }
        }""",
}


def step_cq_verification():
    title("4. CQ verification : la CQ est « modélisée » si on peut écrire la requête SPARQL")
    g = rdflib.Graph().parse(THEATRE_O1)
    g.parse(data=ABOX_THEATRE, format="turtle")
    stories = pd.read_excel(DATA / "Dataset.xlsx", sheet_name="Story")
    story = stories[stories.StoryID == "FestS"].StoryText.iloc[0]
    print("  Extrait de l'histoire :", story.split("\n")[-1][:150], "...")
    for cq, q in CQ_QUERIES.items():
        print(f"\n  {cq}{q}")
        for row in g.query(q, initNs={"": T}):
            print("     ->", " | ".join(short(g, v) if v is not None else "∅" for v in row))
    print("\n  La CQ11 est modélisée deux fois (:hasPremiereDate ET :hasPremiere/:Premiere, sans date) :")
    print("  c'est un « élément superflu » au sens de l'article (Tableau 2).")


# ---------------------------------------------------------------------------
# 5. Génération live (optionnelle)
# ---------------------------------------------------------------------------
def step_live(cq_id="FestSCQ13"):
    title("5. Génération live avec le prompt Memoryless CQbyCQ")
    x = pd.ExcelFile(DATA / "Dataset.xlsx")
    cqs, stories = x.parse("CQs"), x.parse("Story")
    cq = cqs[cqs.CQID == cq_id].CQText.iloc[0]
    story = stories[stories.StoryID == "FestS"].StoryText.iloc[0]
    template = (DATA / "memoryless_cqbycq_prompt.txt").read_text(encoding="utf-8")
    # Memoryless : {rdf} toujours vide, et l'histoire ne contient pas les autres CQ.
    prompt = template.replace("{CQ}", cq).replace("{story}", story).replace("{rdf}", "")
    print(f"  CQ : {cq}\n  Taille du prompt : {len(prompt)} caractères. Appel du modèle...")

    if os.environ.get("ANTHROPIC_API_KEY"):
        import anthropic

        model = os.environ.get("DEMO_MODEL", "claude-sonnet-5-5")
        msg = anthropic.Anthropic().messages.create(
            model=model, max_tokens=4000, messages=[{"role": "user", "content": prompt}]
        )
        out = msg.content[0].text
    elif os.environ.get("OPENAI_API_KEY"):
        import openai

        model = os.environ.get("DEMO_MODEL", "gpt-4o")
        r = openai.OpenAI().chat.completions.create(
            model=model, temperature=0, messages=[{"role": "user", "content": prompt}]
        )
        out = r.choices[0].message.content
    else:
        print("  Aucune clé ANTHROPIC_API_KEY / OPENAI_API_KEY : étape ignorée.")
        return

    ttl = out.split("```turtle")[-1].split("```")[0] if "```" in out else out
    (HERE / f"live_{cq_id}.ttl").write_text(ttl, encoding="utf-8")
    try:
        g = rdflib.Graph().parse(data=ttl, format="turtle")
        print(f"  Turtle valide : {len(g)} triplets -> live_{cq_id}.ttl")
        print(f"  P19 sur la sortie : {len(list(g.query(P19_QUERY, initNs={'rdfs': RDFS})))} propriété(s)")
    except Exception as e:  # noqa: BLE001
        print("  Sortie non parsable :", str(e)[:120])


if __name__ == "__main__":
    graphs = step_syntax()
    pause()
    step_p19(graphs)
    pause()
    step_semantics()
    pause()
    step_cq_verification()
    if "--live" in sys.argv:
        pause()
        step_live()
