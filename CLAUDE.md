Projet: Self Inflicted Vandalism — Mini Book

But: fournir un mini-book en ligne, mobile-first, pour un tattoo artist. Contenu: 30-40 feuilles A4 de petits flashs (images) — chaque feuille est une photo/scan A4 contenant de nombreux petits dessins. Il faudra pouvoir:

- Afficher en mode miniatures (grille compacte)
- Afficher en mode full (carousel slide gauche/droite)
- Ouvrir un viewer zoom/pan pour zoomer sur des détails d'une seule feuille (double-tap ou double-click)
- Format adapté aux téléphones (mobile-first) et simple à naviguer
- QR flashcode unique pour le book entier

Notes techniques / suggestions:
- Site statique simple (HTML/CSS/JS) — facile et gratuit à héberger (GitHub Pages / Netlify / Cloudflare Pages / GitLab Pages)
- Les miniatures sont générées en WebP dans `images/Siv/thumbs/`
- Le plein format reste l'image originale, chargée à la demande pour conserver le zoom utile
- Le site charge automatiquement `images/Siv/manifest.js` généré à partir du dossier.
- J'ai inclus un simple viewer dans `index.html` + `script.js`.
Déploiement rapide (suggestion):
- Hébergement gratuit: GitHub Pages (simple), Netlify (CI + déploiement continu), Cloudflare Pages (performances), GitLab Pages (alternative simple)
- Je recommande GitHub Pages pour commencer: il suffit de push et d'activer Pages depuis `main` branch.
