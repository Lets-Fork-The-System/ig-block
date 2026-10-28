#!/usr/bin/env bash
# Publie une nouvelle version du userscript sur le canal "stable".
# Tous les utilisateurs la recevront via la mise à jour auto de Tampermonkey / Userscripts.
set -euo pipefail

SCRIPT=ig-blacklist.user.js
STABLE_URL=https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/$SCRIPT

die() { echo "❌ $*" >&2; exit 1; }
version_of() { sed -n 's#^// @version *\([0-9.]*\).*#\1#p' | head -1; }

cd "$(git rev-parse --show-toplevel)"

[ "$(git branch --show-current)" = main ] || die "Lance la release depuis la branche main."
[ -z "$(git status --porcelain)" ] || die "Il reste des modifs non commitées."

git fetch -q origin
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || \
  [ "$(git merge-base HEAD origin/main)" = "$(git rev-parse origin/main)" ] || \
  die "main est en retard sur origin/main : fais un git pull d'abord."

new=$(version_of < "$SCRIPT")
old=$(git show origin/stable:"$SCRIPT" 2>/dev/null | version_of || true)
[ -n "$new" ] || die "@version introuvable dans $SCRIPT."
if [ -n "$old" ]; then
  [ "$new" != "$old" ] && [ "$(printf '%s\n%s\n' "$old" "$new" | sort -V | tail -1)" = "$new" ] || \
    die "@version ($new) doit être plus grande que celle en ligne ($old)."
fi

grep -q "^// @updateURL *$STABLE_URL\$" "$SCRIPT"   || die "@updateURL doit pointer vers $STABLE_URL"
grep -q "^// @downloadURL *$STABLE_URL\$" "$SCRIPT" || die "@downloadURL doit pointer vers $STABLE_URL"
node --check "$SCRIPT"         || die "Erreur de syntaxe dans $SCRIPT."
python3 -m py_compile block.py || die "Erreur de syntaxe dans block.py."

echo "Version en ligne : ${old:-aucune}  →  nouvelle : $new"
echo "Changements depuis la dernière release :"
git log --oneline "${old:+origin/stable..}HEAD" -- "$SCRIPT" | sed 's/^/  /'
read -r -p "Publier v$new pour tout le monde ? [o/N] " ok
[ "$ok" = o ] || [ "$ok" = O ] || die "Annulé."

git tag -a "v$new" -m "v$new"
git push origin main "v$new"
git push origin main:stable
echo "✅ v$new publiée. Les utilisateurs la recevront à la prochaine vérif de mise à jour."
