# GitHub Copilot Instructions – Carnet de Dressage React

## Vision d’ensemble
- **React SPA (Vite)** : Application monopage, navigation gérée par React Router dans `src/App.jsx` et les vues de `src/views/`.
- **Données 100% locales** : Stockage dans IndexedDB via `src/db.js`, aucune API externe ; l’app doit rester utilisable hors-ligne.
- **Domaines fonctionnels** : Trois familles de fiches (Recherche, Obéissance, Divers) avec chacune :
  - un formulaire (`src/views/*Form.jsx`)
  - une vue de consultation (`src/views/Voir*.jsx`)
  - une intégration dans la liste (`src/views/Liste.jsx`) et l’impression (`src/views/Imprimer.jsx`).
- **PWA** : Manifest + Service Worker dans `public/` (gérés par Vite) pour installation et offline.

## Fichiers clés
- `src/main.jsx` : Entrée React, montage de l’app.
- `src/App.jsx` : Layout global (Navbar, Footer, routes principales).
- `src/components/Navbar.jsx` : Navigation, affichage du nom du chien, liens vers les vues.
- `src/components/Footer.jsx` : Liens GitHub (repo, FAQ/Support).
- `src/views/` : Toutes les pages (Home, Welcome, formulaires, liste, tirage au sort, réglages, FAQ…).
- `src/db.js` : API IndexedDB (CRUD fiches + paramètres, export/import, etc.).
- `src/utils.js` : Fonctions utilitaires (par ex. toasts, helpers de formatage).
- `src/styles/*.css` : Styles par vue ou composant (pas de CSS inline dans JSX).

## Conventions projet
- **React** :
  - Composants de pages dans `src/views/`, composants réutilisables dans `src/components/`.
  - Hooks React (state/effects) pour la logique, pas de classes.
- **Formulaires** :
  - Bouton principal "Enregistrer" toujours en bas du formulaire (jamais dans la Navbar).
  - Les champs reflètent les besoins métier (substances, poseurs, contexte…), s’inspirer des fichiers existants par type de fiche.
- **Navigation** :
  - Utiliser `react-router-dom` (`<Link>`, routes dans `App.jsx`).
  - La Navbar reste fixe, ne pas y mettre de logique métier lourde.
- **CSS & UI** :
  - Aucun style inline en JSX ; utiliser les fichiers sous `src/styles/` ou `App.css`.
  - Styles responsive et compatibles impression (voir `imprimer.css`).
  - Les formulaires doivent être **imprimables en A4 strict** : une fiche par page A4, marges et mise en page pensées pour l'impression (adapter les styles dans `imprimer.css` et les vues de formulaire si nécessaire).
  - Émojis bienvenus dans titres/boutons/labels pour améliorer l’UX (ex : 🐕, 🎲, 💾).
- **DB** :
  - Un seul store IndexedDB ; paramètres (dont `nom_chien`) centralisés via `db.js`.
  - Toujours passer par les fonctions de `db.js` plutôt que manipuler IndexedDB directement.

## Workflows développeur
- **Lancement en dev** :
  - `npm install`
  - `npm run dev` puis ouvrir `http://localhost:5173`.
- **Build / preview** :
  - `npm run build`
  - `npm run preview` pour vérifier la version de prod.
- **Debug** :
  - Utiliser la console du navigateur, React DevTools et l’inspecteur IndexedDB pour vérifier les données.

## Patterns à suivre
- Ajout d’une nouvelle opération sur les fiches :
  - Étendre `src/db.js` (fonctions async) puis appeler ces fonctions depuis les vues concernées.
- Nouvelles pages :
  - Créer un composant dans `src/views/`, l’ajouter aux routes de `App.jsx`, puis, si nécessaire, ajouter un lien dans `Navbar.jsx`.
- Support / FAQ :
  - Orienter les utilisateurs vers GitHub (issues/discussions) pour les questions depuis la FAQ ou le Footer.
