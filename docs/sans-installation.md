---
title: Sans rien installer
---

[← Accueil](index.md)

# Sur ordi, sans rien installer (méthode « console »)

Tu ne veux pas installer d'extension ? Il y a une autre option : copier-coller
le script dans la « console » de ton navigateur. La console, c'est un outil
caché dans tous les navigateurs, normalement réservé aux développeurs, qui
permet de lancer du code sur la page que tu regardes.

Deux limites à connaître :

- **Ça ne marche que sur ordi**, pas sur téléphone (il n'y a pas de console).
- Le script utilise la liste qu'il a en mémoire, qui peut être un poil moins à jour que celle du site.

> 🔒 **Règle d'or :** ne colle jamais dans la console du code venant de
> quelqu'un en qui tu n'as pas confiance. C'est une technique classique
> d'arnaque ! Ici, le code d'ig-block est public : n'importe qui peut le lire
> et vérifier ce qu'il fait.

## Étape par étape

1. Ouvre **[le code du script](https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js)**.
2. Sélectionne tout (**Ctrl + A**, ou **Cmd + A** sur Mac) et copie (**Ctrl + C**, ou **Cmd + C**).
3. Va sur **[www.instagram.com](https://www.instagram.com)** et connecte-toi.
4. Ouvre la console :
   - **Chrome / Edge / Firefox** : appuie sur **F12** (ou **Ctrl + Maj + J** ; sur Mac **Cmd + Option + J**), puis clique sur l'onglet **Console**.
   - **Safari** : active d'abord **Safari → Réglages → Avancées → Afficher les fonctionnalités pour les développeurs web**, puis fais **Cmd + Option + C**.
5. Clique dans la zone où on peut écrire, en bas de la console, et colle (**Ctrl + V** / **Cmd + V**).
   - Le navigateur râle et refuse le collage ? C'est une protection anti-arnaque. Tape `autoriser le collage` (ou `allow pasting` s'il est en anglais), Entrée, puis recolle.
6. Appuie sur **Entrée**.
7. Le panneau **« 🚫 Blacklist OBE »** apparaît en bas à droite. Tu peux fermer la console.
8. Clique sur **Démarrer**, confirme, et laisse l'onglet ouvert une quarantaine de minutes.

Bon à savoir : si tu fermes ou recharges la page, le script disparaît et il
faudra le recoller. Par contre, ta progression est gardée en mémoire : il
reprendra là où il s'était arrêté.

Un pépin ? → [FAQ et dépannage](faq.md)
