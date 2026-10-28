# Sécurité

## Tu as trouvé une faille ?

Merci de **ne pas ouvrir de ticket public** : ça laisserait le temps à
quelqu'un d'en profiter avant qu'elle soit corrigée.

Signale-la en privé via l'onglet **Security → Report a vulnerability** du
repo :
https://github.com/Lets-Fork-The-System/ig-block/security/advisories/new

Explique ce que tu as trouvé et, si possible, comment le reproduire. Je te
réponds dès que possible et je te tiens au courant de la correction.

## Ce qui nous intéresse en priorité

- Tout ce qui permettrait au script de faire autre chose que bloquer les
  comptes de la liste (fuite de cookies, actions non prévues sur le compte…).
- Tout moyen de pousser du code chez les utilisateurs via la mise à jour
  automatique sans passer par le repo officiel.
- Une liste de comptes qui pourrait être détournée pour bloquer d'autres
  comptes que ceux prévus.

## Ce que fait (et ne fait pas) le script

- Il tourne uniquement sur `https://www.instagram.com/*`.
- Il ne contacte que deux sites : `www.instagram.com` (pour bloquer) et
  `www.onbloquelextremedroite.fr` (pour lire la liste).
- Il ne lit pas et n'envoie pas ton mot de passe ; le cookie de session
  Instagram est inaccessible au JavaScript.
- Il garde sa progression dans le navigateur (`localStorage`), nulle part ailleurs.
- Une liste téléchargée anormalement longue (plus de 200 comptes) est ignorée,
  et le script retombe sur la liste intégrée.

## Version officielle

La seule source officielle est ce repo, et le seul lien d'installation est :
https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js

Méfie-toi de toute copie envoyée en message privé ou hébergée ailleurs.
