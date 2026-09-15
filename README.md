# Repory

**Understand your codebase.** Repory est un outil en ligne de commande qui
analyse un dépôt réel, local ou hébergé sur GitHub, puis affiche un diagnostic
clair directement dans le terminal. Le projet est créé et maintenu par **7Myo**.

## Installation rapide

Repory fonctionne sur **Windows, Linux et macOS** avec Node.js et Git.

### Windows PowerShell

```powershell
winget install OpenJS.NodeJS.LTS Git.Git
npm install --global https://github.com/7Myo/Repory/archive/refs/heads/main.tar.gz
repory
```

### Linux

```bash
sudo apt install nodejs npm git
npm install --global https://github.com/7Myo/Repory/archive/refs/heads/main.tar.gz
repory
```

### macOS

```bash
brew install node git
npm install --global https://github.com/7Myo/Repory/archive/refs/heads/main.tar.gz
repory
```

La commande `repory` ouvre un prompt : saisissez une URL GitHub ou un chemin
local, puis validez. Pour analyser directement sans prompt :

```text
repory https://github.com/7Myo/Repory
repory .
```

L'installation depuis l'archive `.tar.gz` est la procédure recommandée pour
les trois systèmes : elle installe une copie complète avec `dist`, et npm crée
`repory.cmd` sous Windows ou `repory` sous Linux/macOS. Une installation npm
publique (`npm install --global repory`) ne sera disponible qu'après
publication effective du paquet.

Repory ne crée ni serveur, ni compte, ni tableau de bord. Les métriques sont
calculées à partir des fichiers et de l'historique Git disponibles. Lorsqu'une
information ne peut pas être calculée, Repory affiche `N/A` au lieu d'inventer
une valeur.

## Démarrage en deux commandes

Depuis un clone du projet, le parcours le plus court est :

```bash
npm install
npm run repory
```

Repory compile le CLI, ouvre le prompt `Dépôt à analyser :`, puis attend une
URL GitHub ou un chemin local. Entrez par exemple
`https://github.com/7Myo/Repory` ou `.`. Pour fournir directement la source
sans prompt, utilisez `npm run repory -- <url-ou-chemin>`.

## Prérequis

- Node.js 18 ou une version plus récente
- npm
- Git 2.25 ou une version plus récente pour analyser l'historique et cloner une
  URL GitHub

## Installation

### Installer le projet depuis les sources

```bash
git clone https://github.com/7Myo/Repory.git
cd Repory
npm install
```

### Installer globalement depuis GitHub

L'archive GitHub fonctionne sur Windows, Linux et macOS :

```bash
npm install --global https://github.com/7Myo/Repory/archive/refs/heads/main.tar.gz
repory
```

La commande `repory` ouvre le prompt interactif. Pour analyser directement :

```bash
repory https://github.com/7Myo/Repory
```

Sur Windows, npm ajoute normalement le dossier global des exécutables au
`PATH`. Si `repory` n'est pas reconnu, fermez puis rouvrez PowerShell ou CMD,
puis vérifiez :

```powershell
npm prefix --location=global
where.exe repory
```

Le dossier retourné par `npm prefix --location=global` doit être présent dans
le `PATH` utilisateur. Vous pouvez aussi lancer directement
`<prefix>\repory.cmd`. Désinstallez une ancienne copie avant de réinstaller :

```powershell
npm uninstall --global repory
npm install --global https://github.com/7Myo/Repory/archive/refs/heads/main.tar.gz
```

Le build `dist` est versionné dans Git et inclus dans l'archive. Le hook
`prepack` reconstruit ces fichiers avant un paquet npm, et le champ `bin`
génère le lanceur adapté au système.

## Lancer une analyse

### Lancer depuis les sources

`npm run repory` est le raccourci recommandé. Les arguments placés après `--`
sont transmis au CLI :

```bash
npm run repory
npm run repory -- https://github.com/7Myo/Repory
```

Les alias `npm run dev` et `npm start` restent disponibles :

```bash
npm run dev -- https://github.com/7Myo/Repory
npm start -- .
```

Toutes ces commandes compilent puis affichent un résumé lisible. Il n'y a pas
de serveur à démarrer.

### URL GitHub

```bash
repory https://github.com/7Myo/Repory
```

Repory valide l'URL, clone le dépôt dans un dossier temporaire, analyse son
contenu et son historique, puis supprime le clone à la fin. Utilisez `--keep`
pour conserver ce dossier.

### Dépôt local

```bash
repory .
npm run dev -- ./mon-projet
```

Le chemin local peut être absolu ou relatif. Le dépôt n'a pas besoin d'être
publié sur GitHub.

### Mode interactif

Après l'installation par archive, la commande `repory` sans source ouvre le
même prompt :

```bash
repory
```

Le mode direct reste disponible avec `repory <url-ou-chemin>`. Une entrée vide
est refusée et `Ctrl+C` ou `Ctrl+D` interrompt proprement la commande.

## Exemple de sortie

La sortie par défaut reste volontairement synthétique :

```text
REPORY — Understand your codebase

REPOSITORY
7Myo/Repory

PROJECT
Architecture       TypeScript project
Files              17
Lines              777
Commits            2
Contributors       1

SCORES
Architecture       75/100
Complexity         92/100
Maintainability    84/100
Documentation      80/100
Security           N/A
Repository DNA     82/100

HOTSPOTS
None detected.
```

Les chiffres ci-dessus sont uniquement un exemple de présentation. Les valeurs
affichées par Repory sont toujours calculées pour le dépôt analysé.

## Options principales

```text
--json              Produit uniquement un objet JSON
--markdown          Produit un rapport Markdown
--no-color          Désactive les couleurs
--quiet             Supprime les messages de progression
--ci                Active --no-color et --quiet
--verbose           Affiche la pile d'erreur en cas d'échec
--keep              Conserve le clone temporaire d'une URL
--branch <nom>      Analyse une branche GitHub précise
--depth <n>         Utilise un clone Git superficiel
--ignore <dossier>  Ignore un dossier supplémentaire, option répétable
--explain           Explique la méthode de calcul des scores
--help              Affiche l'aide
--version           Affiche la version
```

Exemples :

```bash
repory https://github.com/7Myo/Repory --no-color
repory . --ci
repory . --branch develop --depth 50
repory . --ignore vendor --ignore fixtures
```

## JSON et Markdown

Le JSON est adapté aux scripts et à l'intégration continue. Aucun texte
décoratif n'est mélangé à la sortie :

```bash
repory https://github.com/7Myo/Repory --json > rapport.json
```

Le rapport Markdown peut être archivé ou relu dans un éditeur :

```bash
repory . --markdown > rapport.md
```

En automatisation, préférez `--ci` pour obtenir une sortie non colorée et sans
message de nettoyage.

## Ce qui est analysé

Repory regroupe des analyseurs déterministes pour :

- la structure et le type d'architecture ;
- les langages et le volume de code ;
- les dépendances déclarées ;
- la présence de README, documentation et tests ;
- les fichiers volumineux, TODO et FIXME ;
- l'historique Git, les commits, branches, dates et auteurs ;
- les fichiers fréquemment modifiés et les hotspots ;
- une chronologie basée sur les changements observés ;
- des indicateurs de sécurité limités, sans prétendre réaliser un audit.

La méthode de calcul détaillée est documentée dans
[docs/metrics.md](docs/metrics.md). La sécurité n'est jamais présentée comme
un audit complet et aucune vulnérabilité n'est déclarée sans source fiable.

## Dépannage

### `Git is required` ou échec du clonage

Vérifiez l'installation et le PATH :

```bash
git --version
```

Pour un dépôt privé, configurez l'accès Git habituel sur votre machine. Repory
ne demande ni jeton ni compte.

### URL refusée

Utilisez une URL HTTPS GitHub de la forme
`https://github.com/<proprietaire>/<depot>` ou analysez un chemin local.

### Analyse lente ou volumineuse

Utilisez un clone superficiel et ignorez les dossiers lourds :

```bash
repory <url> --depth 1 --ignore vendor
```

Les dossiers comme `node_modules`, `.git`, `dist`, `build`, `.next`, `target`
et `coverage` sont ignorés par défaut.

### Obtenir plus de détails

Ajoutez `--verbose` à la commande pour afficher la pile d'erreur.

## Architecture du projet

```text
src/
  analyze.ts   Analyse des fichiers, dépendances, scores et hotspots
  git.ts       Validation des sources et opérations Git
  report.ts    Sorties terminal et Markdown
  types.ts     Types des résultats
  cli.ts       Arguments, exécution et gestion des erreurs
tests/         Tests automatisés
docs/          Méthodologie des métriques
```

Le moteur reste local et déterministe. Les rapports JSON, Markdown et terminal
utilisent la même structure d'analyse afin d'éviter les divergences.

## Développement

Installer les dépendances puis lancer les contrôles :

```bash
npm install
npm run repory
npm run typecheck
npm run format:check
npm test
npm run build
```

`npm test` compile d'abord TypeScript puis exécute les tests Node natifs. Les
tests n'appellent aucun service distant.

## Publication

Le paquet expose l'exécutable `repory` :

```bash
npm run build
npm pack --dry-run
npm publish
```

Le champ `bin` de `package.json` permet ensuite l'installation globale avec
`npm install --global repory`.

## Licence

Repory est distribué sous licence MIT. Voir [LICENSE](LICENSE).
