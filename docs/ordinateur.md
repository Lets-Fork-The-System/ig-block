---
title: Guide ordinateur
---

[← Accueil](index.md)

# Sur ordi (Windows, Mac, Linux)

Compte 5 minutes d'installation, puis une quarantaine de minutes où la page bosse toute seule.

D'abord, quel navigateur tu utilises ?

- [Chrome, Edge, Brave ou Opera](#chrome-edge-brave-opera)
- [Firefox](#firefox)
- [Safari (Mac)](#safari-mac)

Tu ne sais pas ? Regarde l'icône sur laquelle tu cliques pour aller sur internet : un rond rouge-jaune-vert, c'est Chrome ; un renard orange, Firefox ; une boussole bleue, Safari ; une vague bleu-vert, Edge.

---

## Chrome, Edge, Brave, Opera

### Étape 1 : installe Tampermonkey

Tampermonkey, c'est l'extension qui va faire tourner le script. Elle est gratuite et utilisée par des millions de personnes.

1. Ouvre la page de Tampermonkey dans la boutique de ton navigateur :
   - Chrome, Brave, Opera : [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Edge : [Modules Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
2. Clique sur **Ajouter à Chrome** (ou **Obtenir** sur Edge), puis confirme avec **Ajouter l'extension**.

### Étape 2 : autorise les scripts (Chrome et Edge récents seulement)

Les dernières versions de Chrome et Edge demandent une petite autorisation en plus. C'est une sécurité : ils veulent être sûrs que c'est bien toi qui veux faire tourner des scripts.

1. Tape `chrome://extensions` dans la barre d'adresse (sur Edge : `edge://extensions`) puis Entrée.
2. Sur la carte **Tampermonkey**, clique sur **Détails**.
3. Active l'interrupteur **Autoriser les scripts utilisateur**.
   - Tu ne le vois pas ? Active plutôt le **Mode développeur** (l'interrupteur en haut à droite de la page des extensions).

### Étape 3 : installe le script ig-block

1. Clique sur ce lien : **[Installer ig-block](https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js)**
2. Une page Tampermonkey s'ouvre avec le nom « On bloque l'extrême droite ». Clique sur **Installer**.

C'est installé ! → File à [Lancer le blocage](#lancer-le-blocage).

---

## Firefox

### Étape 1 : installe Tampermonkey

Tampermonkey, c'est l'extension qui va faire tourner le script. Gratuite, ultra répandue.

1. Ouvre [Tampermonkey sur le site des modules Firefox](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/).
2. Clique sur **Ajouter à Firefox**, puis **Ajouter**.

### Étape 2 : installe le script ig-block

1. Clique sur ce lien : **[Installer ig-block](https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js)**
2. Une page Tampermonkey s'ouvre. Clique sur **Installer**.

C'est installé ! → File à [Lancer le blocage](#lancer-le-blocage).

---

## Safari (Mac)

Sur Safari, l'extension gratuite qui fait le job s'appelle **Userscripts**.

### Étape 1 : installe Userscripts

1. Ouvre [Userscripts sur le Mac App Store](https://apps.apple.com/app/userscripts/id1463298887) et clique sur **Obtenir**.
2. Ouvre l'appli **Userscripts** une fois. Si elle te demande de choisir un dossier, prends celui qu'elle propose, ça ira très bien.
3. Dans Safari, va dans le menu **Safari → Réglages… → Extensions** et coche **Userscripts**.
4. Sur ce même écran, clique sur **Modifier les sites web…** et mets **instagram.com** sur **Autoriser**.

### Étape 2 : installe le script ig-block

1. Dans Safari, clique sur ce lien : **[Installer ig-block](https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js)**
   Une page remplie de code s'affiche : t'inquiète, c'est normal, c'est le script.
2. Clique sur l'icône **Userscripts** (à gauche de la barre d'adresse), puis sur **Installer** / **Install**.

> Tu préfères Chrome ou Firefox sur ton Mac ? Aucun souci, suis juste leurs instructions plus haut.

---

## Lancer le blocage

Dernière ligne droite !

1. Va sur **[www.instagram.com](https://www.instagram.com)** et connecte-toi si ce n'est pas déjà fait.
2. Si besoin, recharge la page. Un panneau noir **« 🚫 Blacklist OBE »** apparaît en bas à droite.
3. Attends qu'il affiche un truc du genre « 63 comptes à bloquer ».
4. Clique sur **Démarrer**, puis sur **OK** pour confirmer.
5. **Laisse l'onglet ouvert.** Tu peux faire autre chose à côté (autres onglets, autres logiciels), mais ne ferme pas celui-là et ne mets pas l'ordi en veille.
6. Au bout d'une quarantaine de minutes, le panneau affiche **« ✅ Terminé »**.

Et voilà, c'est fait ! 🎉 Les comptes sont bloqués sur ton compte Instagram, sur tous tes appareils.

### À quoi servent les boutons du panneau ?

| Bouton | Ce qu'il fait |
|---|---|
| **Démarrer** | Lance (ou relance) le blocage. |
| **Pause** | Met en pause. Reclique sur **Démarrer** pour reprendre. |
| **↺** | Oublie la progression. Tu n'en auras normalement jamais besoin. |
| **—** | Réduit le panneau pour qu'il prenne moins de place. |

Tu as fermé la page en plein milieu ? Pas de panique : reviens sur instagram.com, clique sur **Démarrer**, et le script reprend pile là où il s'était arrêté.

Un pépin ? → [FAQ et dépannage](faq.md)
