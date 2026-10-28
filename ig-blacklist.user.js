// ==UserScript==
// @name         On bloque l'extrême droite — blocage automatique
// @namespace    obe-blocker
// @version      1.2.3
// @description  Bloque en masse les comptes de la blacklist MISE AU POING (onbloquelextremedroite.fr) depuis instagram.com. Fonctionne aussi collé dans la console DevTools.
// @match        https://www.instagram.com/*
// @grant        GM_xmlhttpRequest
// @connect      www.onbloquelextremedroite.fr
// @run-at       document-idle
// @homepageURL  https://lets-fork-the-system.github.io/ig-block/
// @updateURL    https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js
// @downloadURL  https://raw.githubusercontent.com/Lets-Fork-The-System/ig-block/stable/ig-blacklist.user.js
// ==/UserScript==
(function () {
  'use strict';

  const LIST_URL = 'https://www.onbloquelextremedroite.fr/liste';
  const IG_APP_ID = '936619743392459';
  const DOC_ID_SEARCH = '40560838120170065'; // PolarisAPITopsearchQuery (tourne au fil des deploys)
  const DELAY_MIN = 25_000, DELAY_MAX = 50_000;   // entre deux blocages
  const RESOLVE_DELAY = 3_500;                     // entre deux recherches
  const RATE_LIMIT_PAUSE = 10 * 60_000;

  // Liste embarquée (snapshot) — utilisée si le fetch de /liste échoue (ex: CORS en mode console).
  const FALLBACK_USERNAMES = [
    'emmanuelmacron','realdonaldtrump','marine_lepen','jordanbardella','cyrilhanouna',
    'b.netanyahu','ericzemmour_','gerald_darmanin','giorgiameloni','jairmessiasbolsonaro',
    'orbanviktor','javiermilei','marionmarechal_','bruno_retailleau','laurentnunezmi',
    'eciotti','pascalpraud','f_philippot','sarahknafo1','sebastien_chenu','julien_odoul',
    'messiha.jean','davidlisnard','charlotte_d.ornellas','buducnostsrbijeav','laurentjacobelli',
    'tanguyjeanphilippe','nicolasbay','rachel_khan88','erik_tegner','edwige_diaz',
    'flaviobolsonaro','tiffany_joncour','marcdefleurian','antoinegolliot','bernhardt_th',
    'milafique','louisemontangon','ugogiljimenez','thefrenchitch','bassem.6920',
    'liamdibenedettooff','damienrieu7','julien.rochedy','alice_cordier_',
    'tanguydavidofficiel_','jordanflorentin_','le_bracq','rassemblementnational_fr',
    'frontieresmedia','cnews','bfmtv','reconquete_officiel','tbt9w9','lesrepublicains',
    'valeurs_actuelles','collectif.nemesis','cocardeetudiante','institutiliade',
    'tvlofficiel','lafuriaofficiel','revue_elements','bvoltaire.fr','radiocourtoisie',
  ];

  const EXCLUDE = new Set(['mise__au__poing']);
  // Garde-fou : une liste live anormalement longue (site compromis, page cassée) est ignorée.
  const MAX_LIST = 200;
  const isUserId = (x) => /^\d{1,20}$/.test(String(x));
  const RESERVED = new Set(['p','reel','reels','stories','explore','accounts','direct','tv',
    'developer','about','legal','privacy','terms','web','api','graphql']);

  const cookie = (k) => (document.cookie.match(new RegExp('(?:^|; )' + k + '=([^;]+)')) || [])[1];
  // Safari iOS (Userscripts) ne voit pas toujours ds_user_id : on retombe sur l'ID du viewer embarqué dans la page.
  const pageUid = () => {
    const html = document.documentElement.innerHTML;
    for (const re of [/"USER_ID":"(\d+)"/, /"viewerId":"(\d+)"/, /"actorID":"(\d+)"/]) {
      const m = html.match(re);
      if (m && m[1] !== '0') return m[1];
    }
    return '';
  };
  const myUid = cookie('ds_user_id') || pageUid() || 'anon';
  const LS_KEY = 'oble_progress_' + myUid;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const jitter = (a, b) => a + Math.random() * (b - a);

  const progress = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  const save = () => localStorage.setItem(LS_KEY, JSON.stringify(progress));

  // ---------- réseau ----------

  async function fetchUsernames() {
    try {
      const html = await new Promise((resolve, reject) => {
        if (typeof GM_xmlhttpRequest === 'function') {
          GM_xmlhttpRequest({ method: 'GET', url: LIST_URL, timeout: 20000,
            onload: r => resolve(r.responseText), onerror: reject, ontimeout: reject });
        } else {
          fetch(LIST_URL).then(r => r.text()).then(resolve).catch(reject);
        }
      });
      const re = /instagram\.com\/([A-Za-z0-9][A-Za-z0-9_.]{0,29})(?:[/'"?]|$)/g;
      const seen = new Set(); const out = [];
      for (const m of html.matchAll(re)) {
        const n = m[1].replace(/\.$/, '');
        if (RESERVED.has(n.toLowerCase()) || EXCLUDE.has(n) || seen.has(n)) continue;
        seen.add(n); out.push(n);
      }
      if (out.length && out.length <= MAX_LIST) return { names: out, source: 'live' };
    } catch (e) { /* fallback */ }
    return { names: FALLBACK_USERNAMES.slice(), source: 'embarquée' };
  }

  function scrapeTokens() {
    const html = document.documentElement.innerHTML;
    const grab = (p) => (html.match(p) || [])[1] || '';
    return {
      fb_dtsg: grab(/DTSGInitData",\[\],\{"token":"([^"]+)/),
      lsd: grab(/"LSD",\[\],\{"token":"([^"]+)/),
      rev: grab(/"server_revision":(\d+)/),
      hsi: grab(/"hsi":"(\d+)"/),
    };
  }

  async function gql(friendlyName, docId, variables) {
    const tok = scrapeTokens();
    const body = new URLSearchParams({
      av: myUid, __d: 'www', __user: '0', __a: '1', __req: String(3 + Math.floor(Math.random() * 20)),
      dpr: '2', __ccg: 'EXCELLENT', __rev: tok.rev, __hsi: tok.hsi, __comet_req: '7',
      fb_dtsg: tok.fb_dtsg, jazoest: '26529', lsd: tok.lsd,
      __spin_r: tok.rev, __spin_b: 'trunk', __spin_t: String(Math.floor(Date.now() / 1000)),
      __crn: 'comet.igweb.PolarisSearchBoxRoute',
      fb_api_caller_class: 'RelayModern', fb_api_req_friendly_name: friendlyName,
      server_timestamps: 'true', variables: JSON.stringify(variables), doc_id: docId,
    });
    return fetch('https://www.instagram.com/api/graphql', {
      method: 'POST', credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-ig-app-id': IG_APP_ID, 'x-csrftoken': cookie('csrftoken') || '',
        'x-asbd-id': '129477', 'x-fb-lsd': tok.lsd, 'x-fb-friendly-name': friendlyName,
      },
      body: body.toString(),
    });
  }

  // pseudo -> id. Primaire : web_profile_info (l'appel que le site fait lui-même). Fallback : topsearch GraphQL.
  async function resolveUserId(username) {
    const r = await fetch(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`, {
      credentials: 'same-origin',
      headers: { 'x-ig-app-id': IG_APP_ID, 'x-requested-with': 'XMLHttpRequest' },
    });
    if (r.status === 404) return { id: null, status: 'not_found' };
    if (r.status === 200) {
      const j = await r.json();
      const id = j?.data?.user?.id;
      return id ? { id, status: 'ok' } : { id: null, status: 'not_found' };
    }
    // fallback GraphQL (429 ou autre)
    const g = await gql('PolarisAPITopsearchQuery', DOC_ID_SEARCH, { data: { query: username } });
    if (g.status === 429) return { id: null, status: 'rate_limited' };
    try {
      const j = await g.json();
      const users = j?.data?.xdt_api__v1__fbsearch__topsearch_connection?.users || [];
      const hit = users.find(x => (x.user?.username || '').toLowerCase() === username.toLowerCase());
      const id = hit && (hit.user.pk || hit.user.id);
      return { id: id || null, status: id ? 'ok' : 'not_found' };
    } catch (e) {
      return { id: null, status: 'http_' + g.status };
    }
  }

  async function blockUser(uid, username) {
    if (!isUserId(uid)) return 'bad_id';
    const r = await fetch(`/web/friendships/${uid}/block/`, {
      method: 'POST', credentials: 'same-origin',
      headers: {
        'x-ig-app-id': IG_APP_ID, 'x-csrftoken': cookie('csrftoken') || '',
        'x-asbd-id': '129477', 'x-requested-with': 'XMLHttpRequest',
      },
    });
    if (r.status === 429) return 'http_429';
    try {
      const j = await r.json();
      if (j.status === 'ok' || j.friendship_status?.blocking) return 'ok';
      return 'unexpected:' + JSON.stringify(j).slice(0, 150);
    } catch (e) {
      return 'http_' + r.status;
    }
  }

  // ---------- UI ----------

  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:999999;width:290px;' +
    'background:#141414;color:#eee;border:1px solid #333;border-radius:12px;padding:12px 14px;' +
    'font:13px/1.4 system-ui,sans-serif;box-shadow:0 4px 24px rgba(0,0,0,.5)';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <b>🚫 Blacklist OBE</b>
      <span id="oble-min" style="cursor:pointer;opacity:.7">—</span>
    </div>
    <div id="oble-body">
      <div id="oble-status" style="margin-bottom:8px">Chargement de la liste…</div>
      <div style="height:6px;background:#333;border-radius:3px;overflow:hidden;margin-bottom:8px">
        <div id="oble-bar" style="height:100%;width:0%;background:#e0245e;transition:width .3s"></div>
      </div>
      <div style="display:flex;gap:6px">
        <button id="oble-start" style="flex:1;padding:6px;border:0;border-radius:6px;background:#e0245e;color:#fff;cursor:pointer;font-weight:600">Démarrer</button>
        <button id="oble-pause" style="padding:6px 10px;border:0;border-radius:6px;background:#333;color:#eee;cursor:pointer" disabled>Pause</button>
        <button id="oble-reset" title="Oublier la progression" style="padding:6px 10px;border:0;border-radius:6px;background:#333;color:#eee;cursor:pointer">↺</button>
      </div>
      <div style="margin-top:8px;font-size:11px;opacity:.6">~40 min, espacé pour éviter le rate-limit. Reprend où ça s'est arrêté. Sur mobile : garde l'onglet au premier plan (l'écran reste allumé pendant la passe).</div>
    </div>`;
  (document.body || document.documentElement).appendChild(panel);
  const $ = (id) => panel.querySelector(id);
  const status = (t) => { $('#oble-status').innerHTML = t; };
  const setBar = (done, total) => { $('#oble-bar').style.width = (total ? (100 * done / total) : 0) + '%'; };
  $('#oble-min').onclick = () => {
    const b = $('#oble-body'); b.style.display = b.style.display === 'none' ? '' : 'none';
  };

  // ---------- moteur ----------

  let running = false;
  let wakeLock = null;

  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator) {
        wakeLock = wakeLock || await navigator.wakeLock.request('screen');
      } else if (!on && wakeLock) {
        await wakeLock.release(); wakeLock = null;
      }
    } catch (e) { /* API indispo ou refusée : pas grave */ }
  }
  document.addEventListener('visibilitychange', () => {
    if (running && document.visibilityState === 'visible') {
      wakeLock = null; keepAwake(true);
    }
  });

  async function run(names) {
    running = true;
    await keepAwake(true);
    $('#oble-start').disabled = true; $('#oble-pause').disabled = false;

    const done = () => names.filter(u => progress[u]?.status === 'blocked').length;
    setBar(done(), names.length);

    // résolution des ids manquants
    for (const u of names) {
      if (!running) break;
      const e = progress[u] = progress[u] || {};
      if (e.id || e.status === 'blocked') continue;
      status(`Recherche @${u}…`);
      const { id, status: st } = await resolveUserId(u);
      e.id = id; e.resolve_status = st; save();
      if (st === 'rate_limited') { status('Rate limit recherche, pause 60 s…'); await sleep(60000); }
      else await sleep(RESOLVE_DELAY + Math.random() * 2000);
    }

    // blocages
    let consecutiveErrors = 0;
    for (const u of names) {
      if (!running) { status('En pause — ' + done() + '/' + names.length); break; }
      const e = progress[u];
      if (!e?.id || e.status === 'blocked') continue;
      status(`Blocage @${u}… (${done()}/${names.length})`);
      const res = await blockUser(e.id, u);
      e.status = res === 'ok' ? 'blocked' : 'error';
      e.result = res; e.ts = Date.now(); save();
      setBar(done(), names.length);

      if (res === 'ok') { consecutiveErrors = 0; }
      else {
        consecutiveErrors++;
        if (res === 'http_429') {
          status('Rate limit — pause 10 min puis reprise auto…');
          await sleep(RATE_LIMIT_PAUSE);
        }
        if (consecutiveErrors >= 3) {
          status('Trop d\'erreurs, arrêt. Relance avec "Démarrer".');
          break;
        }
      }
      if (running) await sleep(jitter(DELAY_MIN, DELAY_MAX));
    }

    running = false;
    await keepAwake(false);
    $('#oble-start').disabled = false; $('#oble-pause').disabled = true;
    const remaining = names.filter(u => progress[u]?.status !== 'blocked');
    if (remaining.length === 0) {
      status(`✅ Terminé : ${done()}/${names.length} bloqués.`);
    } else {
      const why = remaining.map(u => {
        const e = progress[u] || {};
        return `@${u}${e.resolve_status === 'not_found' ? ' (introuvable — t\'a peut-être bloqué)' : e.result ? ' (' + e.result + ')' : ''}`;
      }).join(', ');
      status(`⏸ ${done()}/${names.length} bloqués.<br>
             <span style="font-size:11px;opacity:.8">Restants : ${why}</span>`);
    }
  }

  $('#oble-pause').onclick = () => { running = false; };
  $('#oble-reset').onclick = () => {
    if (!confirm('Oublier toute la progression ?')) return;
    for (const k of Object.keys(progress)) delete progress[k];
    save(); setBar(0, 1); status('Progression effacée.');
  };

  (async () => {
    // sessionid est HttpOnly (illisible en JS) — ds_user_id est le marqueur de login lisible
    if (myUid === 'anon') {
      const seen = ['ds_user_id', 'csrftoken', 'mid', 'ig_did']
        .map(k => k + (cookie(k) ? '✓' : '✗')).join(' ');
      status(`Non connecté à Instagram — connecte-toi puis recharge.<br>
             <span style="font-size:11px;opacity:.7">cookies lus : ${seen}</span>`);
      return;
    }
    const { names, source } = await fetchUsernames();
    const todo = names.filter(u => progress[u]?.status !== 'blocked');
    status(`${todo.length} comptes à bloquer (liste ${source}, ${names.length} entrées)`);
    setBar(names.length - todo.length, names.length);
    $('#oble-start').onclick = async () => {
      if (running) return;
      status('Actualisation de la liste…');
      const fresh = await fetchUsernames();
      const freshTodo = fresh.names.filter(u => progress[u]?.status !== 'blocked');
      status(`${freshTodo.length} comptes à bloquer (liste ${fresh.source}, ${fresh.names.length} entrées)`);
      setBar(fresh.names.length - freshTodo.length, fresh.names.length);
      if (confirm(`Bloquer ${freshTodo.length} comptes sur ce compte ? ~40 min.`)) run(fresh.names);
    };
  })();
})();
