Self Inflicted Vandalism — Mini Book

Aperçu
- Mini-site statique responsive pour présenter des feuilles A4 de flashs tattoo.
- Modes: miniatures (grid) et full (carousel). Double-clic/double-tap pour zoomer.
- Les miniatures sont générées en WebP depuis `images/Siv` via `images/Siv/manifest.js`.
- La vue full ouvre l'image originale à la demande, pour garder le zoom utile sans charger toute la galerie en même temps.

QR code
- Un seul QR code doit pointer vers la page d'accueil du book entier.
- Pour le générer, utilisez n'importe quel générateur QR gratuit à partir de l'URL finale du site.

Installation & aperçu local
1. Placez vos planches dans `images/Siv/`.
2. Régénérez les assets avec `npm run build:assets` si vous ajoutez ou renommez des images.
3. Ouvrez `index.html` dans un navigateur (double-cliquez ou `python3 -m http.server` pour un serveur simple).

Hébergement gratuit (rapide)
- GitHub Pages: push repo -> Settings -> Pages -> Source: Deploy from a branch -> Branch: `main` / Folder: `/root` -> Save.
- Netlify: drag & drop du dossier `dist` ou connectez le repo pour déploiement automatique.
- Cloudflare Pages: connecter le repo et configurer build (site static simple, pas de build si pur HTML/CSS/JS).
- GitLab Pages: bonne alternative gratuite si le repo est déjà sur GitLab.

Recommandation simple
- Si vous voulez le plus simple: GitHub Pages.
- Si vous voulez le plus pratique pour des mises à jour fréquentes: Netlify ou Cloudflare Pages.

Checklist GitHub Pages
1. Mettre le code dans un dépôt GitHub.
2. Pousser la branche `main`.
3. Activer Pages avec la branche `main` et le dossier `/root`.
4. Récupérer l'URL publique du type `https://<votre-compte>.github.io/<repo>/`.
5. Générer le QR code du book entier à partir de cette URL.

Extensions recommandées
- VS Code Frontend-Design: installez l'extension marketplace `/marketplace/frontend-design` (ou cherchez "Anthropic Frontend-Design").
	Vous pouvez ajouter une recommandation d'extensions au workspace: voir `.vscode/extensions.json`.

Optimisations recommandées
- Garder les originaux pour le zoom, mais utiliser les miniatures WebP générées pour la grille
- Redimensionner les images à une largeur raisonnable (par ex. 2400px pour A4 scans)

À faire ensuite
- Ajuster le style final et préparer éventuellement une version optimisée pour impression.
