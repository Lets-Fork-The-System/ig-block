#!/usr/bin/env python3
"""Block Instagram accounts listed on onbloquelextremedroite.fr/liste.

Cookies: put your instagram.com cookies into cookie.txt next to this
script — either the full "cookie:" request header (k=v; k=v) or the
JSON export from Firefox DevTools. Required keys: sessionid, csrftoken
(ds_user_id recommended). Or export IG_COOKIE.

doc_id values are persisted-query ids extracted from the current IG web
bundles (rev 1052035169). They rotate on deploys — if calls start
failing, recapture a block request in DevTools and update DOC_ID_BLOCK.
"""

import argparse
import json
import random
import re
import sys
import time
from pathlib import Path

from curl_cffi import requests as creq
import requests

HERE = Path(__file__).parent
PROGRESS_FILE = HERE / "progress.json"
LIST_URL = "https://www.onbloquelextremedroite.fr/liste"
IG_APP_ID = "936619743392459"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
DOC_ID_SEARCH = "40560838120170065"   # PolarisAPITopsearchQuery
DOC_ID_BLOCK = "39536170752648758"    # usePolarisBlockManyMutation
JAZOEST = "26529"

EXCLUDE_USERNAMES = {"mise__au__poing"}
# Garde-fou : une liste anormalement longue (site compromis, page cassee) est refusee.
MAX_LIST = 200
RESERVED = {"p", "reel", "reels", "stories", "explore", "accounts", "direct",
            "tv", "developer", "about", "legal", "privacy", "terms", "web",
            "api", "graphql"}


def load_cookies(cookie_file):
    raw = None
    f = Path(cookie_file)
    if f.exists():
        raw = f.read_text().strip()
        if f.stat().st_mode & 0o077:
            print(f"Attention : {f} est lisible par d'autres utilisateurs "
                  f"(chmod 600 {f} conseille).", file=sys.stderr)
    import os
    raw = os.environ.get("IG_COOKIE", raw)
    if not raw:
        sys.exit("cookie.txt manquant (ou IG_COOKIE non defini).")
    cookies = {}
    try:
        data = json.loads(raw)
        stack = [data]
        while stack:
            node = stack.pop()
            if isinstance(node, dict):
                if "sessionid" in node or "csrftoken" in node:
                    cookies = {k: str(v) for k, v in node.items()}
                    break
                stack.extend(node.values())
    except (json.JSONDecodeError, AttributeError):
        raw = raw.removeprefix("Cookie:").removeprefix("cookie:").strip()
        for part in raw.split(";"):
            if "=" in part:
                k, v = part.split("=", 1)
                cookies[k.strip()] = v.strip()
    for k in ("sessionid", "csrftoken"):
        if k not in cookies:
            sys.exit(f"cookie '{k}' absent de cookie.txt")
    return cookies


def fetch_usernames():
    html = requests.get(LIST_URL, timeout=20).text
    names = re.findall(r"instagram\.com/([A-Za-z0-9][A-Za-z0-9_.]{0,29})(?:[/'\"?]|$)",
                       html)
    seen, out = set(), []
    for n in names:
        n = n.rstrip(".")
        if n.lower() in RESERVED or n in EXCLUDE_USERNAMES or n in seen:
            continue
        seen.add(n)
        out.append(n)
    if len(out) > MAX_LIST:
        sys.exit(f"Liste suspecte ({len(out)} comptes > {MAX_LIST}), abandon.")
    return out


def refresh_tokens(s, cookies):
    r = s.get("https://www.instagram.com/", headers={"User-Agent": UA},
              cookies=cookies, timeout=20)
    html = r.text
    def grab(pat):
        m = re.search(pat, html)
        return m.group(1) if m else ""
    return {
        "fb_dtsg": grab(r'DTSGInitData",\[\],\{"token":"([^"]+)'),
        "lsd": grab(r'"LSD",\[\],\{"token":"([^"]+)'),
        "rev": grab(r'"server_revision":(\d+)'),
        "hsi": grab(r'"hsi":"(\d+)"'),
    }


class IG:
    def __init__(self, cookies):
        self.cookies = cookies
        self.s = creq.Session(impersonate="chrome")
        self.tok = refresh_tokens(self.s, cookies)
        if not self.tok["fb_dtsg"]:
            sys.exit("Tokens introuvables — session expiree ?")
        self.req_n = random.randint(3, 20)

    def gql(self, friendly_name, doc_id, variables, crn):
        self.req_n += 1
        body = {
            "av": self.cookies.get("ds_user_id", "0"),
            "__d": "www",
            "__user": "0",
            "__a": "1",
            "__req": str(self.req_n),
            "dpr": "2",
            "__ccg": "EXCELLENT",
            "__rev": self.tok["rev"],
            "__hsi": self.tok["hsi"],
            "__comet_req": "7",
            "fb_dtsg": self.tok["fb_dtsg"],
            "jazoest": JAZOEST,
            "lsd": self.tok["lsd"],
            "__spin_r": self.tok["rev"],
            "__spin_b": "trunk",
            "__spin_t": str(int(time.time())),
            "__crn": crn,
            "fb_api_caller_class": "RelayModern",
            "fb_api_req_friendly_name": friendly_name,
            "server_timestamps": "true",
            "variables": json.dumps(variables, separators=(",", ":")),
            "doc_id": doc_id,
        }
        return self.s.post(
            "https://www.instagram.com/api/graphql", data=body,
            headers={
                "User-Agent": UA,
                "x-ig-app-id": IG_APP_ID,
                "x-csrftoken": self.cookies["csrftoken"],
                "x-asbd-id": "129477",
                "x-fb-lsd": self.tok["lsd"],
                "x-fb-friendly-name": friendly_name,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            cookies=self.cookies, timeout=20)

    def resolve_user_id(self, username):
        r = self.gql("PolarisAPITopsearchQuery", DOC_ID_SEARCH,
                     {"data": {"query": username}},
                     "comet.igweb.PolarisSearchBoxRoute")
        if r.status_code == 429:
            return None, "rate_limited"
        try:
            conn = r.json()["data"]["xdt_api__v1__fbsearch__topsearch_connection"]
            for item in conn.get("users", []):
                u = item.get("user", {})
                if u.get("username", "").lower() == username.lower():
                    return u.get("pk") or u.get("id"), "ok"
            return None, "not_found"
        except Exception:
            return None, f"http_{r.status_code}"

    def block_web(self, uid, username):
        r = self.s.post(
            f"https://www.instagram.com/web/friendships/{uid}/block/",
            headers={"User-Agent": UA, "x-ig-app-id": IG_APP_ID,
                     "x-csrftoken": self.cookies["csrftoken"],
                     "x-asbd-id": "129477",
                     "x-requested-with": "XMLHttpRequest",
                     "Referer": f"https://www.instagram.com/{username}/"},
            cookies=self.cookies, timeout=20)
        if r.status_code in (404, 429):
            return "endpoint_dead" if r.status_code == 404 else "http_429"
        try:
            j = r.json()
            if j.get("status") == "ok" or j.get("friendship_status", {}).get("blocking"):
                return "ok"
            return f"unexpected:{str(j)[:200]}"
        except ValueError:
            return f"http_{r.status_code}"

    def block_graphql(self, uid, username):
        r = self.gql("usePolarisBlockManyMutation", DOC_ID_BLOCK,
                     {"surface": None, "target_user_ids": [str(uid)]},
                     "comet.igweb.PolarisProfilePostsTabRoute")
        if r.status_code == 429:
            return "http_429"
        try:
            j = r.json()
        except ValueError:
            return f"http_{r.status_code}"
        if "errors" in j:
            return f"gql_error:{str(j['errors'])[:180]}"
        if j.get("data") or j.get("status") == "ok":
            return "ok"
        return f"unexpected:{str(j)[:180]}"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--list", action="store_true", help="list usernames and exit")
    ap.add_argument("--resolve", action="store_true", help="resolve ids only")
    ap.add_argument("--limit", type=int, default=0, help="block at most N accounts")
    ap.add_argument("--delay-min", type=float, default=25.0)
    ap.add_argument("--delay-max", type=float, default=50.0)
    ap.add_argument("--resolve-delay", type=float, default=3.0)
    ap.add_argument("--cookie", default=str(HERE / "cookie.txt"),
                    help="path to cookie file (default: cookie.txt)")
    ap.add_argument("--progress", default=None,
                    help="path to progress file (default: progress_<ds_user_id>.json)")
    args = ap.parse_args()

    usernames = fetch_usernames()
    if args.list:
        print(f"{len(usernames)} comptes:")
        print("\n".join(usernames))
        return

    cookies = load_cookies(args.cookie)
    ig = IG(cookies)
    progress_path = Path(args.progress) if args.progress else \
        HERE / f"progress_{cookies.get('ds_user_id', 'anon')}.json"
    progress = json.loads(progress_path.read_text()) if progress_path.exists() else {}

    def save():
        progress_path.write_text(json.dumps(progress, indent=2, ensure_ascii=False))

    todo = [u for u in usernames if progress.get(u, {}).get("status") != "blocked"]
    print(f"{len(usernames)} comptes sur la liste, {len(todo)} a traiter.")

    for u in todo:
        ent = progress.setdefault(u, {})
        if ent.get("id"):
            continue
        uid, st = ig.resolve_user_id(u)
        ent.update({"id": uid, "resolve_status": st})
        print(f"  resolve @{u}: {st}" + (f" -> {uid}" if uid else ""))
        save()
        if st == "rate_limited":
            print("Rate limit resolution, pause 60s.")
            time.sleep(60)
        else:
            time.sleep(args.resolve_delay + random.random() * 2)

    if args.resolve:
        print("Resolution terminee (--resolve).")
        return

    use_graphql = False
    done = 0
    for u in todo:
        ent = progress[u]
        if ent.get("status") == "blocked" or not ent.get("id"):
            continue
        if args.limit and done >= args.limit:
            break
        if not str(ent["id"]).isdigit():
            print(f"  skip @{u}: id invalide {ent['id']!r}")
            continue

        if not use_graphql:
            res = ig.block_web(ent["id"], u)
            if res == "endpoint_dead":
                print("Endpoint /web/friendships/ mort, bascule GraphQL.")
                use_graphql = True
                continue
        else:
            res = ig.block_graphql(ent["id"], u)

        ok = res == "ok"
        ent.update({"status": "blocked" if ok else "error",
                    "result": res, "ts": int(time.time())})
        save()
        print(f"  block @{u} ({ent['id']}): {res}")
        done += 1

        if "429" in res:
            print("Rate limit blocage. Etat sauvegarde, relance plus tard.")
            break
        if res.startswith("gql_error") or res.startswith("http_4"):
            print("Erreur client (session/doc_id), abandon.")
            break
        time.sleep(random.uniform(args.delay_min, args.delay_max))

    n = sum(1 for e in progress.values() if e.get("status") == "blocked")
    print(f"Terminé: {n}/{len(usernames)} bloques. Progression: {progress_path}")


if __name__ == "__main__":
    main()
