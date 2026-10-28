# ig-block

Bloque en quelques clics, sur ton compte Instagram, tous les comptes de la
liste [onbloquelextremedroite.fr](https://www.onbloquelextremedroite.fr/liste)
(~64 comptes, sélection communautaire MISE AU POING). Fini les soixante
recherches et les soixante clics « Bloquer » : tu lances, tu vas te faire un
café, c'est fait. ☕

## 👉 [Le guide pas à pas, c'est par ici](https://lets-fork-the-system.github.io/ig-block/)

Pas besoin d'être geek. Choisis ton appareil :

| Appareil | Guide |
|---|---|
| 💻 Ordi (Chrome, Edge, Firefox, Safari) | [Guide ordinateur](docs/ordinateur.md) |
| 🤖 Android | [Guide Android](docs/android.md) |
| 🍏 iPhone / iPad | [Guide iPhone / iPad](docs/iphone.md) |
| 💻 Ordi, sans rien installer | [Méthode console](docs/sans-installation.md) |
| ❓ Un souci ? | [FAQ et dépannage](docs/faq.md) |

**Tu as déjà Tampermonkey ou Userscripts ?** Installe direct le script :
[ig-blacklist.user.js](https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js)

---

## Pour les curieux·ses et les devs

Deux versions du même outil :

| | Userscript (recommandé) | CLI Python |
|---|---|---|
| Pour qui | Tout le monde | Devs / power users |
| Prérequis | Tampermonkey / Userscripts + être connecté à instagram.com | Python 3 + `curl_cffi` + cookie de session |
| Install | 1 fichier, 2 clics | quelques commandes |

### Fonctionnement du userscript — `ig-blacklist.user.js`

- Récupère la liste live sur `/liste` (fallback : liste embarquée).
- Résout pseudo → ID via `web_profile_info` (fallback : recherche GraphQL).
- Bloque via `POST /web/friendships/<id>/block/` — le même appel que l'UI.
- Blocages espacés de 25-50 s (~40 min pour toute la liste).
- Progression sauvegardée dans `localStorage`, **clé par compte** (`ds_user_id`) :
  reprend où ça s'est arrêté, fonctionne pour plusieurs comptes.
- Sur 429 (rate limit) : pause automatique de 10 min puis reprise. Après 3 erreurs
  consécutives : arrêt propre, relancer avec « Démarrer ».
- Wake Lock pour garder l'écran allumé sur mobile ; mise à jour automatique via
  `@updateURL`.
- Collé dans la console DevTools, il marche aussi (liste embarquée : le `fetch`
  de /liste est bloqué par CORS hors userscript).

### CLI — `block.py`

```bash
pip install -r requirements.txt
python3 block.py --list                          # affiche les 64 comptes
python3 block.py --resolve                       # résout les IDs seulement
python3 block.py --limit 3                       # teste sur 3 comptes
python3 block.py                                 # tout, espacé ~25-50 s
python3 block.py --cookie cookie_bob.txt         # autre compte
python3 block.py --delay-min 40 --delay-max 90   # pacing plus lent
```

**Cookies** : créer `cookie.txt` avec soit le header `cookie:` complet d'une
requête instagram.com (DevTools → Network → copier la valeur), soit l'export
JSON « Cookies de la requête » de Firefox. Requis : `sessionid`, `csrftoken`,
`ds_user_id`.

**Progression** : `progress_<ds_user_id>.json` (par compte, reprise auto).
`--progress` pour forcer un chemin.

### Limites & avertissements

- **Comptes introuvables en recherche** : si un compte vous a déjà bloqué, il
  n'apparaît pas dans votre recherche et ne peut pas être résolu (ex. constaté :
  `@cyrilhanouna`, `@cnews`). Il faudrait son `user_id` d'une source externe.
- **Rate limiting** : Instagram limite les blocages. Le pacing (~1 blocage/35 s)
  minimise le risque d'« action bloquée » temporaire, ne l'élimine pas. Si ça
  arrive : attendre quelques heures, relancer (la reprise est automatique).
- **ToS** : l'automatisation est contraire aux conditions d'Instagram. Usage à
  vos risques sur votre compte.
- **Cookies = credentials** : `cookie.txt` / `sessionid` donne un accès complet
  au compte. Ne jamais le commit/partager, le supprimer après usage.
- **doc_id GraphQL** (fallback recherche) : les IDs de persisted queries
  tournent à chaque déploiement Instagram. Si le fallback cesse de marcher,
  recapturer une requête de recherche dans DevTools et mettre à jour
  `DOC_ID_SEARCH`.

### Publier une mise à jour

Le script se met à jour tout seul chez les utilisateurs depuis la branche
`stable`. Toute la procédure (version, release, rollback) est dans
[RELEASING.md](RELEASING.md).

## Sécurité

Une faille ? Signale-la en privé, pas dans un ticket public : voir
[SECURITY.md](SECURITY.md).

## Licence

[MIT](LICENSE) : tu peux copier, modifier et repartager librement. Fais tourner ! ✊
