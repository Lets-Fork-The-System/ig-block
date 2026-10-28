# Publier une mise à jour (guide dev)

Ce guide explique comment marche la mise à jour automatique du userscript et
comment publier une nouvelle version sans casser quoi que ce soit chez les gens.

## Comment marche l'auto-update

Quand quelqu'un installe le script, Tampermonkey (ou Userscripts) retient deux
lignes de l'en-tête :

```js
// @version      1.2.0
// @updateURL    https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js
// @downloadURL  https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js
```

Régulièrement (par défaut une fois par jour sur Tampermonkey), l'extension va
lire le fichier à l'adresse `@updateURL` et compare son `@version` avec celle
installée :

- **version en ligne plus grande** → elle télécharge `@downloadURL` et remplace le script, sans rien demander ;
- **version identique ou plus petite** → elle ne fait rien, même si le code a changé.

👉 Retiens bien ça : **si tu oublies d'augmenter `@version`, personne ne reçoit
ta modif.**

## Les deux branches : `main` et `stable`

| Branche | À quoi elle sert | Qui la lit |
|---|---|---|
| `main` | Ton espace de travail : code, doc, tests. Pousse autant que tu veux. | Toi, et GitHub Pages (le dossier `docs/`) |
| `stable` | Ce qui est **réellement distribué**. Ne bouge qu'au moment d'une release. | Tampermonkey / Userscripts de tous les utilisateurs |

Pourquoi deux branches ? Parce que chaque push sur la branche lue par les
extensions part **chez tout le monde dans les 24 h**, et tourne avec leur
session Instagram. Avec `stable` à part, une faute de frappe sur `main` ne
casse rien, et publier devient un geste volontaire.

Petit détail : GitHub met en cache les fichiers `raw.githubusercontent.com`
quelques minutes. Après une release, il peut falloir ~5 min avant que la
nouvelle version soit visible.

## Publier une nouvelle version, pas à pas

1. **Fais tes modifs sur `main`** et commite-les comme d'habitude.
2. **Augmente `@version`** dans l'en-tête de `ig-blacklist.user.js`, en suivant
   la logique `MAJEUR.MINEUR.CORRECTIF` :
   - `1.2.0 → 1.2.1` : correction de bug (ex. nouveau `DOC_ID_SEARCH`) ;
   - `1.2.0 → 1.3.0` : nouvelle fonctionnalité ;
   - `1.2.0 → 2.0.0` : changement qui casse quelque chose (ex. nouvelle clé de progression).
3. Commite ce changement de version (par ex. `git commit -am "v1.2.1"`).
4. **Teste en local** avant de publier : dans Tampermonkey, ouvre le script
   installé, colle ta nouvelle version, enregistre, et lance une passe sur
   instagram.com (le bouton **Pause** est ton ami pour tester 2-3 comptes).
5. **Lance la release :**

   ```bash
   ./scripts/release.sh
   ```

   Le script vérifie tout seul que :
   - tu es sur `main`, sans modif en cours, à jour avec GitHub ;
   - `@version` est bien plus grande que celle déjà en ligne ;
   - `@updateURL` et `@downloadURL` pointent bien vers `stable` ;
   - la syntaxe du userscript et du CLI est correcte.

   Il t'affiche la liste des commits qui vont partir, te demande confirmation,
   puis pousse `main`, crée le tag `vX.Y.Z` et avance `stable`.

6. Optionnel mais sympa : crée une release GitHub à partir du tag avec un mot
   sur ce qui a changé :

   ```bash
   gh release create v1.2.1 --generate-notes
   ```

## Vérifier qu'une release est bien partie

- Ouvre https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js
  et regarde la ligne `@version` (attends quelques minutes à cause du cache).
- Dans Tampermonkey : **Tableau de bord → Utilitaires → Rechercher des mises à
  jour** (ou clic droit sur le script → *Rechercher des mises à jour*) pour
  forcer la vérif sur ta machine.
- L'onglet **Actions** du repo doit être vert sur la branche `stable`.
  Le script de release relance lui-même les vérifications sur `stable`. Tu
  peux aussi les lancer à la main quand tu veux :
  `gh workflow run check.yml --ref stable`.

## Oups, j'ai publié une version cassée

Pas de panique. On ne revient **jamais** en arrière sur le numéro de version
(les extensions ignoreraient une version plus petite). On publie une version
corrigée par-dessus :

1. Sur `main`, annule le commit fautif : `git revert <commit>`.
2. Augmente `@version` (ex. `1.3.0` cassée → `1.3.1`).
3. `./scripts/release.sh`

Ne force jamais le push sur `stable` : la branche est protégée contre ça, et
c'est voulu.

## Garde-fous en place

- **Branches `main` et `stable` protégées** : pas de suppression ni de
  `push --force`.
- **CI (GitHub Actions)** : à chaque push, vérification de la syntaxe et des
  URLs de mise à jour ; sur `stable`, vérification que `@version` a bien augmenté.
- **Secret scanning + push protection** : GitHub refuse un push qui contient
  un token reconnu.
- **`.gitignore`** : `cookie*.txt`, `*.har`, `.env`, fichiers de progression…
  ne peuvent pas partir par accident.

Et le plus important, côté toi : **active la double authentification (2FA)
sur ton compte GitHub.** Quiconque prend ton compte peut pousser du code qui
tournera dans la session Instagram de tous les utilisateurs.

## Ce qui change souvent

- **`DOC_ID_SEARCH` / `DOC_ID_BLOCK`** : les identifiants GraphQL d'Instagram
  changent à chaque déploiement de leur côté. Si la recherche de secours ne
  marche plus, ouvre DevTools → Network sur instagram.com, fais une recherche,
  récupère le `doc_id` de la requête `PolarisAPITopsearchQuery`, et mets-le à
  jour. C'est une release en `x.y.Z+1`.
- **`FALLBACK_USERNAMES`** : la liste embarquée, à resynchroniser de temps en
  temps avec https://www.onbloquelextremedroite.fr/liste (`python3 block.py --list`
  te la sort). C'est aussi une release.
