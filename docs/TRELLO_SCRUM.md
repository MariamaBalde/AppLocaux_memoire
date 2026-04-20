# Organisation du projet sur Trello (Scrum)

Ce document décrit l'organisation du tableau Trello du projet **app-produits-locaux**.

## Modele visuel pret a capturer

Un tableau style Trello est deja genere ici:

- `docs/trello-board.html`

Ouvre ce fichier dans ton navigateur puis fais une capture ecran pour ton rapport.

## Capture d'ecran du tableau Trello

1. Fais une capture complete de ton tableau Trello.
2. Renomme-la en `trello-tableau-scrum.png`.
3. Place l'image dans `docs/images/`.

Exemple d'affichage dans Markdown:

![Tableau Trello Scrum](./images/trello-tableau-scrum.png)

## Colonnes obligatoires du tableau

Le tableau Trello est organise pour suivre l'avancement selon Scrum:

| Liste | Description |
|---|---|
| Product Backlog | Toutes les user stories priorisees |
| Sprint Backlog | US selectionnees pour le sprint en cours |
| To Do | Taches a faire |
| In Progress | Taches en cours de developpement |
| Review | Taches en revue/test |
| Done | Taches terminees et validees |
| Blockers | Obstacles necessitant resolution urgente |

## Regles de progression

- Une carte commence dans `Product Backlog`.
- Au demarrage du sprint, les US retenues passent dans `Sprint Backlog`.
- Les taches techniques du sprint passent ensuite dans `To Do`.
- Pendant l'execution: `To Do` -> `In Progress` -> `Review` -> `Done`.
- Toute tache bloquee est deplacee dans `Blockers` avec la cause du blocage.
- Quand le blocage est resolu, la carte revient dans `In Progress`.

## Convention de nommage conseillee

- User stories: `US X.Y - Titre`
- Taches techniques: `TASK - Description`
- Bugs: `BUG - Description`

## Exemple adapte a app-produits-locaux

- `US 1.1 - Authentification client`
- `US 1.2 - Authentification vendeur`
- `US 2.1 - Catalogue produits`
- `US 2.2 - Panier`
- `US 2.3 - Commande`
- `US 3.1 - Dashboard vendeur`
- `US 4.1 - Dashboard admin`
