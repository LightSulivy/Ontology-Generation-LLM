# Étude d'article : Ontology Generation using Large Language Models

Ce dépôt contient la présentation (≈ 20 min, en binôme) pour le Master ISA, modules Représentation des connaissances et Web sémantique.

Article étudié : A. S. Lippolis, M. J. Saeedizade, R. Keskisärkkä, S. Zuppiroli, M. Ceriani, A. Gangemi, E. Blomqvist, A. G. Nuzzolese, *Ontology Generation using Large Language Models*, ESWC 2025, LNCS pp. 321–341, arXiv:2503.05388.

## Contenu

| Chemin | Contenu |
|---|---|
| [TEXTE_ORAL.md](TEXTE_ORAL.md) | Texte oral minuté, slide par slide (orateurs A et B), avec la préparation aux questions |
| [deck/](deck/) | Sources des 21 slides (une section HTML par slide, notes dans `<aside>`). Version en ligne : https://claude.ai/artifact/WUEyr73hTjBzq2MRyExESb, exportable en PPTX ou PDF |
| [demo/](demo/) | Démo Python : parsing Turtle, détection de P19 en SPARQL, inférence RDFS, cohérence avec HermiT, CQ verification. Voir [demo/README.md](demo/README.md) |

## Lancer la démo

```bash
cd demo
pip install -r requirements.txt
python demo.py
```

Java est nécessaire pour HermiT, embarqué dans owlready2.

## Données tierces

Les fichiers `demo/data/` (ontologies générées, `Dataset.xlsx`, prompt Memoryless CQbyCQ) proviennent du dépôt des auteurs, https://github.com/dersuchendee/Onto-Generation, sous licence MIT.
