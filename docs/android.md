---
title: Guide Android
---

[← Accueil](index.md)

# Sur téléphone ou tablette Android

Compte 5 minutes d'installation, puis une quarantaine de minutes avec l'écran allumé.

> ⚠️ **Petit piège : l'appli Instagram ne suffit pas.** Les applis ne
> peuvent pas faire tourner de scripts, il faut passer par le **navigateur
> Firefox**, qui accepte les extensions. Mais rassure-toi : une fois les
> comptes bloqués, ils le sont aussi dans l'appli.

## Étape 1 : installe Firefox

1. Ouvre le **Play Store**.
2. Cherche **Firefox** (l'éditeur, c'est Mozilla) et appuie sur **Installer**.

Tu l'as déjà ? Passe direct à l'étape 2.

## Étape 2 : ajoute Tampermonkey à Firefox

Tampermonkey, c'est l'extension qui va faire tourner le script. Gratuite, ultra répandue.

1. Ouvre **Firefox**.
2. Appuie sur le menu **⋮** (les trois petits points), puis sur **Extensions** (ou **Modules complémentaires**).
3. Va dans **Gérer les extensions** / **Découvrir plus d'extensions** et cherche **Tampermonkey**.
   - Raccourci : ouvre directement [Tampermonkey pour Firefox](https://addons.mozilla.org/fr/android/addon/tampermonkey/).
4. Appuie sur **Ajouter à Firefox**, puis **Ajouter**.

## Étape 3 : installe le script ig-block

1. **Dans Firefox**, ouvre ce lien : **[Installer ig-block](https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js)**
   - Tu lis ce guide depuis une autre appli ? Appuie longtemps sur le lien, copie-le, et colle-le dans la barre d'adresse de Firefox.
2. La page Tampermonkey s'ouvre. Appuie sur **Installer**.

## Étape 4 : connecte-toi à Instagram dans Firefox

1. Toujours dans Firefox, va sur **[www.instagram.com](https://www.instagram.com)**.
2. Instagram va sûrement te proposer d'**ouvrir l'appli** : refuse ! Reste dans le navigateur (« Pas maintenant » / « Continuer sur le web »).
3. Connecte-toi avec ton identifiant et ton mot de passe.

## Étape 5 : lance le blocage

1. Un panneau noir **« 🚫 Blacklist OBE »** apparaît en bas à droite de la page. Il n'est pas là ? Recharge la page.
2. Appuie sur **Démarrer**, puis **OK** pour confirmer.
3. **Garde Firefox ouvert, au premier plan, sur cet onglet.** Le script essaie de garder l'écran allumé tout seul.
   - Mets ton téléphone en charge, ce sera plus tranquille.
   - Si tu passes sur une autre appli, le script se met en pause (Android endort les pages qu'on ne regarde pas). Pas grave : il repart quand tu reviens sur Firefox. Au besoin, réappuie sur **Démarrer**.
4. Au bout d'une quarantaine de minutes, le panneau affiche **« ✅ Terminé »**.

Et voilà ! 🎉 Tu peux réduire le panneau avec le bouton **—**.

Un pépin ? → [FAQ et dépannage](faq.md)
