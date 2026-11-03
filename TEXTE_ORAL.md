# Texte oral — « Ontology Generation using Large Language Models »

Lippolis, Saeedizade, Keskisärkkä, Zuppiroli, Ceriani, Gangemi, Blomqvist, Nuzzolese — ESWC 2025.

- **Durée visée** : environ 19 min 40 s, démo comprise, ce qui laisse une marge sur les 20 minutes.
- **Répartition** : l’orateur **A** (Lucas Lamiss) présente le contexte et la solution, puis les forces, les limites et la conclusion. L’orateur **B** (Bastien Teisseire) présente l'état de l'art, les résultats et la lecture critique sous l'angle des cours. La démo se fait à deux.
- **Rythme** : environ 130 à 140 mots par minute. Le temps cumulé est indiqué entre crochets.
- *En italique* : les gestes et indications de scène.

---

## Partie 1 — Problématique (A, ≈ 3 min 45)

### Slide 1 · Titre — A · 0:40 [0:40]

Bonjour à tous. Nous allons vous présenter *Ontology Generation using Large Language Models*, un article publié à l'ESWC 2025, dans la Research Track.

Il réunit deux équipes très connues en ingénierie ontologique : celle de Bologne et de l'ISTC-CNR, avec Aldo Gangemi et Andrea Nuzzolese, et celle de Linköping, avec Eva Blomqvist. Ce sont, entre autres, les auteurs de la méthodologie eXtreme Design et des Ontology Design Patterns que nous avons vus en cours.

La question est simple : un LLM peut-il écrire un brouillon d'ontologie OWL à partir des besoins tels qu'on les exprime en eXtreme Design, c'est-à-dire des user stories et des questions de compétence ?

### Slide 2 · Plan — A · 0:20 [1:00]

Nous suivons six temps : la problématique, la solution, le positionnement, les résultats, puis notre regard critique. Nous terminerons par une courte démo. Les auteurs n'ont pas publié de pipeline exécutable, mais ils ont publié leurs ontologies générées : nous les avons vérifiées nous-mêmes.

### Slide 3 · Problématique — A · 1:00 [2:00]

Le point de départ est connu : concevoir une ontologie coûte cher, même pour un expert.

D'abord, il faut une double compétence : connaître le domaine et savoir modéliser, c'est-à-dire maîtriser la logique, OWL et les patrons de conception.

Ensuite, les méthodologies que nous avons étudiées, Methontology, NeOn, eXtreme Design et plus récemment LOT, encadrent le travail mais ne l'automatisent pas. Tout reste essentiellement manuel.

Enfin, créer, relire et valider des axiomes est long et cognitivement coûteux.

*(montrer l'encadré sombre)* L'hypothèse des auteurs est donc qu'un LLM bien guidé peut produire un **brouillon** qui fait gagner du temps. Le but n'est pas de remplacer l'ontologue. Ils se limitent volontairement au prompt engineering, sans fine-tuning : c'est simple à mettre en place et facile à faire évoluer.

### Slide 4 · Notions — A · 1:15 [3:15]

Trois notions sont nécessaires pour la suite.

La **user story** est un petit récit du domaine en langue naturelle. Par exemple : « Fabio Bianchi est un acteur italien employé au théâtre depuis mai 2004. »

La **question de compétence**, ou CQ, est une question à laquelle l'ontologie doit permettre de répondre : « À quel moment tel acteur a-t-il commencé à travailler pour tel théâtre ? »

La **CQ verification**, enfin, vient des travaux de Blomqvist en 2012 : une CQ est dite modélisée si l'ontologie contient tous les éléments nécessaires pour écrire la requête SPARQL qui y répond. *(montrer le code)* Ici, il faut une classe Employment, une propriété hasEmployee et une propriété hasStartDate.

Retenez une chose : ce critère ne juge pas la qualité de la modélisation, seulement la présence du vocabulaire. Nous y reviendrons.

Les CQ sont classées en quatre catégories : propriété de données, propriété d'objet, réification et restriction. La « réification » est de loin la plus fréquente : ce sont des relations n-aires, souvent datées, comme « qui joue quel rôle, dans quelle production, à quel moment ».

### Slide 5 · Questions de recherche — A · 0:30 [3:45]

L'article pose trois questions. Q1 : jusqu'où un LLM satisfait-il un ensemble d'exigences ? Q2 : comment évaluer une ontologie générée ? Q3 : quelles sont les forces et les faiblesses typiques de ces ontologies ? La Q2 contient selon nous à la fois l'apport le plus intéressant et le point le plus discutable de l'article.

---

## Partie 2 — Solution (A, ≈ 3 min 10)

### Slide 6 · Deux techniques — A · 1:30 [5:15]

L'article propose deux techniques de prompting, qui traitent toutes les deux **une CQ à la fois**.

*(bande bleue)* La première, **Memoryless CQbyCQ**, reprend la technique CQbyCQ présentée par Saeedizade et Blomqvist à l'ESWC 2024, en lui retirant la mémoire. Pour chaque CQ, le modèle reçoit la user story et la question, avec un persona d'ontologue, des rappels sur la syntaxe Turtle et une liste de pièges à éviter. En revanche, il ne voit ni les autres CQ ni l'ontologie déjà construite. On obtient un fichier OWL par CQ, et on fusionne tout à la fin. Le contexte est ainsi réduit d'environ 60 %. Selon les auteurs, un contexte long distrait le modèle, et des petits chevauchements entre morceaux se corrigent plus facilement que des incohérences.

*(bande orange)* La seconde, **Ontogenia**, développe un poster de 2024. Elle combine le *prompting métacognitif* de Wang et Zhao (le modèle doit comprendre, juger, critiquer, confirmer et évaluer sa confiance) avec la méthode eXtreme Design. Le prompt contient des Ontology Design Patterns en OWL. Surtout, l'ontologie produite à l'étape *i* est réinjectée dans le prompt de l'étape *i+1*. La procédure compte neuf étapes : analyser la CQ, la décomposer, ajouter des sous-classes et des restrictions, valider, puis tester avec des individus.

### Slide 7 · Comparaison — A · 0:50 [6:05]

Ce tableau résume ce qui distingue les deux prompts : la mémoire, la stratégie (décomposition ou métacognition), l'injection d'ODP, la demande explicite de labels et de propriétés inverses, la liste de pièges et la manière de traiter les relations n-aires.

*(montrer la phrase en bas)* Première remarque critique : les deux prompts diffèrent sur six dimensions à la fois, et l'article ne fait pas d'étude d'ablation. Quand Ontogenia fait mieux, on ne sait pas si c'est grâce à la mémoire, aux patrons ou à la métacognition.

### Slide 8 · Modes de génération — A · 0:50 [6:55]

Les deux techniques sont testées dans deux modes.

En **génération indépendante**, chaque CQ produit son propre module. C'est fait sur tout le jeu de données, mais avec GPT-4 seulement.

En **génération incrémentale**, toutes les CQ d'une story produisent une seule ontologie. C'est fait avec trois modèles (GPT-4, o1-preview et Llama 3.1 405B), mais uniquement sur trois stories d'un cours de master : hôpital, musique et théâtre, avec 15 CQ chacune.

Les auteurs définissent trois notions qui serviront de mesures. Le **module minimal** est l'ontologie de référence réduite à ce qui sert à une CQ. Un **élément superflu** est une classe ou une propriété qu'aucune requête de test n'utilise. Un **problème mineur** signifie qu'il ne manque qu'une seule propriété pour que la CQ soit modélisée.

Je passe la parole à Bastien pour le positionnement et les résultats.

---

## Partie 3 — État de l'art (B, ≈ 1 min)

### Slide 9 · Positionnement — B · 1:00 [7:55]

Merci. Côté méthodologie, l'article s'inscrit dans la lignée d'eXtreme Design, ce qui est logique vu ses auteurs.

Côté LLM, les travaux précédents traitent soit des sous-tâches, soit des cas isolés. LLMs4OL, à l'ISWC 2023, extrait des relations entre classes, mais ne construit pas d'ontologie complète. Mateiu et Groza affinent GPT pour traduire des phrases contrôlées en axiomes de logique de description, mais ces phrases sont peu réalistes. NeOn-GPT et LLMs4Life proposent un pipeline complet, mais avec un seul prompt et un seul cas d'étude.

Les deux vrais prédécesseurs sont ceux des auteurs eux-mêmes : CQbyCQ à l'ESWC 2024 et le poster Ontogenia. L'évaluation, elle, reprend les critères proposés par Rebboud et al. à l'ISWC 2024.

En résumé, la contribution revendiquée est triple : deux prompts améliorés, un jeu de données de modules minimaux et une évaluation multidimensionnelle. C'est un travail de consolidation, pas une rupture.

---

## Partie 4 — Évaluation (B, ≈ 4 min 20)

### Slide 10 · Protocole — B · 1:00 [8:55]

Le jeu de données compte dix ontologies, cent CQ et vingt-neuf user stories. Elles viennent de quatre projets européens réels (Polifonia, Onto-DESIDE, WHOW et IKS) et d'un cours de master. Pour chaque CQ, un module minimal sert de référence. La réification domine : 62 CQ sur 100.

L'évaluation a quatre angles : la proportion de CQ modélisées, avec une version tolérante qui ignore les problèmes mineurs, notée « IG » ; les pitfalls critiques détectés par OOPS! ; le taux d'éléments superflus ; et l'avis de deux experts, qui ont corrigé les ontologies comme des copies d'étudiants, avec un accord κ de 0,61.

Attention : faute de temps, d'après les auteurs, les trois derniers angles ne portent que sur la génération incrémentale, donc sur 45 CQ.

La référence humaine est constituée d'étudiants novices, dans la première et la dernière version de leur rendu.

### Slide 11 · Couverture des CQ — B · 1:00 [9:55]

Voici le résultat principal. *(montrer la barre noire)* o1-preview avec Ontogenia modélise **les 45 CQ**.

Plus largement, toutes les combinaisons de LLM et de nouveaux prompts dépassent la version finale des étudiants, à 0,83, alors que ces étudiants avaient eu un retour de l'enseignant.

Memoryless CQbyCQ bat aussi l'ancien CQbyCQ : 0,93 contre 0,73 avec GPT-4. Les auteurs y voient la preuve que raccourcir le contexte aide le modèle.

En génération indépendante, avec GPT-4 sur tout le jeu, on obtient 0,91 et 0,84. Mais sur les CQ complexes, les scores tombent à 0 et 0,66.

Rappel important : « modélisée » veut seulement dire qu'on peut écrire la requête SPARQL.

### Slide 12 · OOPS! — B · 0:50 [10:45]

Deuxième angle : le scanner OOPS!. Le pitfall critique le plus fréquent est **P19 : plusieurs domaines ou portées** pour une même propriété.

C'est une notion centrale du cours de M1. En RDFS comme en OWL, deux rdfs:domain ne signifient pas « l'un ou l'autre » mais **« les deux à la fois »**, comme un owl:intersectionOf. Cela produit des inférences non voulues, et parfois une incohérence.

Llama est le modèle qui cumule le plus de pitfalls ; o1 avec Memoryless en a le moins. *(pointer la dernière colonne)* Retenez le 0 en face de P19 pour Ontogenia avec o1 : nous y reviendrons.

### Slide 13 · Éléments superflus — B · 0:50 [11:35]

Troisième angle : les éléments superflus. Pour la lisibilité, nous avons calculé la moyenne des trois stories du Tableau 2.

Le constat est inversé : l'ancien CQbyCQ est le plus concis. Les nouveaux prompts produisent beaucoup de redondance, et Llama atteint environ 40 % d'éléments superflus. L'article donne un exemple : *employedSince* et *employmentStartDate*, générés pour la même CQ.

Les auteurs relativisent : un élément de trop se supprime plus facilement qu'une CQ manquante se rajoute. Ils reconnaissent aussi que cette mesure pénalise les taxonomies et la généralisation.

### Slide 14 · Experts — B · 0:40 [12:15]

Enfin, deux ingénieurs de la connaissance ont corrigé les sorties de Llama et d'o1. Le jugement « adéquat » est plus exigeant que « modélisé » : il tient compte de l'utilisabilité et du nommage. o1 avec Ontogenia obtient 1,0 sur deux stories. Llama reste autour de 0,6, avec un nommage incohérent, des cycles dans la taxonomie et des cardinalités mal formées.

*(pointer l'encadré orange)* Et selon les experts, **tous les fichiers sans exception** ont des domaines et des portées incorrects. C'est notre transition vers la critique.

---

## Partie 5 — Regard critique (A puis B, ≈ 4 min)

### Slide 15 · Phrase clé — B · 0:15 [12:30]

*(laisser lire, puis)* Notre critique tient en une phrase : pouvoir écrire la requête SPARQL ne garantit pas une ontologie OWL utilisable. La métrique principale de l'article est lexicale. Elle ne dit rien de ce qu'un raisonneur fera de l'ontologie.

### Slide 16 · Forces — A · 0:40 [13:10]

Commençons par être justes avec l'article. Il est ancré dans une vraie méthodologie, eXtreme Design, avec des CQ testables. Il fournit un jeu de données réutilisable et le protège contre la fuite vers les données d'entraînement grâce à une archive chiffrée. Son évaluation sur quatre angles montre que ces angles se contredisent : c'est un résultat en soi. Enfin, tout est publié, et c'est ce qui nous a permis de vérifier nous-mêmes. Sa conclusion reste mesurée : un copilote, pas un remplaçant.

### Slide 17 · Limites méthodologiques — A · 1:00 [14:10]

Côté méthode, nous avons six réserves.

Un : l'**échelle**. L'évaluation détaillée porte sur 45 CQ issues d'un cours de 2008.

Deux : une **seule exécution** par configuration, sans mesure de variance, alors que les LLM sont stochastiques. o1 et Llama tournent avec leurs paramètres par défaut et GPT-4 à température 0. L'article écrit « significantly » sans aucun test statistique.

Trois : **pas d'ablation**, comme nous l'avons vu.

Quatre : le critère « modélisée » est volontairement tolérant et appliqué à la main par l'équipe. Quant aux superflus, ils dépendent des requêtes choisies.

Cinq : la **référence humaine** est faible. Ce sont des novices et non des experts, et le gain de temps, qui est l'argument principal du copilote, n'est jamais mesuré.

Six : la **fuite et la reproductibilité**. Les stories sont en ligne depuis 2008, donc probablement dans les données d'entraînement. Et le dépôt ne contient pas le script de génération : le fichier de patrons qu'il référence est absent.

Je repasse la parole à Bastien pour la lecture sous l'angle de nos cours.

### Slide 18 · Lecture RC et Web sémantique — B · 1:15 [15:25]

Avec les notions du master, six points ressortent.

**La sémantique.** Fusionner les fragments CQ par CQ revient à faire une union de graphes RDF. Comme les domaines s'intersectent, P19 apparaît mécaniquement dès que deux CQ redéclarent la même propriété. Il faudrait une vraie intégration d'ontologies, pas une concaténation.

**Le profil OWL 2 DL.** xsd:date et xsd:gYear ne font pas partie de la datatype map d'OWL 2. Et une propriété transitive ne peut pas apparaître dans une restriction de cardinalité, puisque seules les propriétés simples y sont autorisées. Ces ontologies sortent donc d'OWL 2 DL.

**La terminologie.** Ce que les auteurs appellent « réification » est en fait le motif de relation n-aire de la note W3C, ou le patron *Situation*. À ne pas confondre avec la réification RDF, rdf:Statement, ni avec RDF-star.

**La réutilisation.** Seuls 3 fichiers sur 18 utilisent un vocabulaire externe comme OWL-Time ; tout le reste est en example.org. C'est contraire aux principes du Linked Data comme à LOT.

**Le raisonneur.** L'évaluation n'en utilise aucun : pas de test de cohérence, pas de recherche de classes insatisfiables, pas de test SHACL sur des données.

**L'axiomatisation.** Avec seulement 3 CQ de restriction sur 100, on évalue surtout des schémas légers.

La piste naturelle est une boucle neuro-symbolique : renvoyer au LLM le diagnostic du raisonneur, d'OOPS! ou de SHACL, puis lui faire corriger son ontologie.

### Slide 19 · Nos vérifications — B · 0:50 [16:15]

Nous avons repassé les 18 ontologies publiées.

*(une carte à la fois)* Trois fichiers ne sont même pas du Turtle valide, parce qu'il manque des préfixes. Sur les quinze fichiers lisibles, quatorze ont au moins un P19, détecté par une requête SPARQL. Un seul fichier sur dix-huit est accepté par HermiT. Enfin, pour Théâtre avec Ontogenia et o1, le rapport OOPS! publié par les auteurs liste **4** cas de P19, alors que le Tableau 1 affiche **0**. C'est probablement une erreur de report.

*(montrer le code)* Voici l'exemple concret, tiré de l'ontologie classée première : hasStartDate a trois domaines et trois portées incompatibles. Passons à la démo.

---

## Partie 6 — Démo (A au clavier, B commente, ≈ 2 min 45)

### Slide 20 · Démo — 2:45 [19:00]

*Préparation avant la séance : un terminal ouvert dans `demo/`, police agrandie, `pip install -r requirements.txt` déjà fait, et la commande déjà lancée une fois pour vérifier que Java répond.*

**A** *(tape `python demo.py`)*

**Étape 1, ≈ 25 s.**
**B** : « Le parseur rdflib charge les 18 fichiers. Trois sont refusés : *Prefix owl: not bound*. Le LLM a oublié de déclarer ses préfixes, c'est le P37/P39 du Tableau 1. »

*(Entrée)*

**Étape 2, ≈ 50 s.**
**B** : « Voici la requête SPARQL qui détecte P19 : on regroupe par propriété et on garde celles qui ont plus d'un domaine ou d'une portée distincte, avec GROUP BY et HAVING. *(montrer le tableau)* La colonne P19 est presque partout positive. La dernière colonne, c'est HermiT : un seul fichier sur dix-huit est accepté, les autres sont refusés pour des types de données hors OWL 2 ou pour une propriété non simple sous une cardinalité. »

*(Entrée)*

**Étape 3, ≈ 50 s.**
**B** : « On zoome sur la meilleure ontologie. hasStartDate a trois domaines. On ajoute un seul fait tiré de la story : le contrat de Fabio commence le 1er mai 2004. *(Entrée)* Avec la règle rdfs2, le contrat devient aussi une TimePeriod et un TimeInterval. *(Entrée)* HermiT refuse le fichier tel quel ; après une réparation manuelle de quelques triplets, l'ontologie est cohérente. »

*(Entrée)*

**Étape 4, ≈ 40 s.**
**B** : « Pour finir, la CQ verification comme dans l'article. La requête de la CQ13 renvoie bien Fabio Bianchi, le Grand Theatre et la date : la CQ est modélisée. La CQ11, la date de la première, est modélisée deux fois dans le même fichier, une fois avec une date et une fois avec un objet Premiere vide. C'est un élément superflu au sens de l'article. »

**Plan B** si Java ou le script échoue : rester sur la slide 19, qui reprend exactement ces sorties, et dire : « Les résultats que nous allions montrer sont ceux-ci. »

### Slide 21 · Conclusion — A · 0:40 [19:40]

Pour conclure, reprenons les trois questions.

Pour l'article, un LLM récent bien guidé fait au moins aussi bien qu'un novice ; un seul critère d'évaluation ne suffit pas ; et les erreurs typiques portent sur les domaines et portées, les propriétés inverses et la redondance.

Notre lecture est que la couverture des CQ mesure le **vocabulaire**, pas la **logique**. Il faut ajouter à l'évaluation ce que nous apprenons en cours : un raisonneur, un contrôle de profil OWL 2 et des tests sur des données. L'outil est utile pour démarrer une ontologie, à condition de garder l'ontologue dans la boucle.

Merci de votre attention, nous prenons vos questions.

---

## Préparation aux questions

**« Pourquoi HermiT refuse-t-il xsd:date ? C'est pourtant un type XSD courant. »**
La datatype map d'OWL 2 (Structural Specification, § 4) inclut xsd:dateTime et xsd:dateTimeStamp, mais pas xsd:date, xsd:time ni xsd:gYear. Protégé accepte ces types, mais un raisonneur OWL 2 DL strict les rejette. On peut le reprocher en partie au prompt lui-même : Memoryless CQbyCQ cite explicitement xsd:date et xsd:time comme exemples.

**« Vous dites que le Tableau 1 est faux : en êtes-vous sûrs ? »**
Nous disons qu'il y a une incohérence. Le rapport OOPS! publié dans leur dépôt, `theatre_ontogenia_o1_preview.ttl.pdf`, liste 4 cas de P19 (during, hasLocation, hasStartDate, hasEndDate). Le Tableau 1 indique 0 pour cette colonne, cumulée sur les trois stories. Notre requête SPARQL trouve elle aussi 4 cas. L'explication la plus probable est une erreur de recopie.

**« Plusieurs domaines, est-ce vraiment une erreur ? »**
Pas toujours en théorie : c'est voulu quand on cherche réellement l'intersection. Ici, c'est un artefact de la fusion, puisque chaque CQ a redéclaré la propriété avec son propre domaine. Le résultat est qu'un contrat de travail est inféré comme une période. Les portées xsd:date, xsd:dateTime et xsd:gYear ont en plus des espaces de valeurs disjoints : aucune valeur ne peut les satisfaire toutes.

**« Quelle est la différence entre réification et relation n-aire ? »**
La réification RDF décrit un triplet : rdf:Statement avec rdf:subject, rdf:predicate et rdf:object, ou aujourd'hui RDF-star. La relation n-aire introduit une classe pivot, par exemple Employment, reliée à chaque participant : c'est la note W3C « Defining N-ary Relations on the Semantic Web » et le patron Situation ou time-indexed participation. Les auteurs font la seconde mais l'appellent « réification ».

**« Pourquoi ne pas avoir relancé la génération vous-mêmes ? »**
Le dépôt ne fournit que les prompts : le fichier `patterns.csv` des ODP et le script d'orchestration ne sont pas publiés, et o1-preview n'est plus disponible. Notre script propose un mode `--live` qui rejoue le prompt Memoryless sur une CQ avec un modèle actuel. Mais une seule exécution sur un autre modèle ne serait pas comparable aux chiffres de l'article.

**« Que proposeriez-vous pour améliorer l'approche ? »**
Trois choses. (1) Intégrer un raisonneur et OOPS! dans la boucle : le LLM reçoit les erreurs et corrige son ontologie. (2) Ajouter au prompt des vocabulaires à réutiliser, comme OWL-Time ou FOAF, et faire la fusion au niveau sémantique (alignement, réutilisation des propriétés existantes) plutôt qu'une concaténation de fichiers. (3) Exécuter chaque configuration plusieurs fois, avec des tests statistiques et une ablation des ingrédients des prompts.

**« Est-ce que ça marche avec des modèles ouverts ? »**
D'après l'article, pas encore : Llama 3.1 405B obtient une couverture proche de celle de GPT-4, mais avec environ 40 % d'éléments superflus et les pires notes des experts. Les auteurs concluent qu'un copilote fondé sur un modèle ouvert n'est pas encore réaliste.
