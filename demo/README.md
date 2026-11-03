# Démo : Ontology Generation using LLMs (Lippolis et al., ESWC 2025)

Ce dossier contient une démo de 3 à 4 minutes qui rejoue une partie de l'évaluation de l'article sur les **18 ontologies générées publiées par les auteurs**
(dépôt <https://github.com/dersuchendee/Onto-Generation>, licence MIT : `data/incremental/`, `data/Dataset.xlsx`, prompt Memoryless CQbyCQ).

Le dépôt ne fournit **pas** de pipeline exécutable : on y trouve les prompts, le jeu de données et les sorties. La démo vérifie donc ces sorties avec les outils vus en cours (RDF/Turtle, SPARQL, RDFS, OWL 2 DL).

## Installation

```bash
pip install -r requirements.txt
```

Java (≥ 8) doit être installé pour HermiT (embarqué dans owlready2).

## Lancement

```bash
python demo.py
```

- Entrée : passe à l'étape suivante. `--auto` : enchaîne tout sans pause.
- `--live` : ajoute une génération en direct d'un module pour la CQ FestSCQ13 avec le prompt Memoryless CQbyCQ. Il faut définir `ANTHROPIC_API_KEY` ou `OPENAI_API_KEY` ; `DEMO_MODEL` permet de choisir le modèle.

## Ce que montre la démo

| Étape | Notion du cours | Résultat obtenu |
|---|---|---|
| 1. Parsing Turtle | syntaxe RDF | 3 fichiers sur 18 sont invalides (préfixes non déclarés) |
| 2. P19 en SPARQL + HermiT | SPARQL 1.1 (GROUP BY/HAVING), profils OWL 2 | P19 présent dans 14 fichiers sur 15 ; **1 seul fichier sur 18** accepté par HermiT (xsd:date/gYear hors datatype map, propriété transitive dans une cardinalité) |
| 3. Sémantique de rdfs:domain | règle rdfs2, intersection | un `Employment` est inféré comme `TimePeriod` et `TimeInterval` |
| 4. CQ verification | requêtes SPARQL de test | CQ13 OK ; CQ11 modélisée deux fois (éléments superflus) |
