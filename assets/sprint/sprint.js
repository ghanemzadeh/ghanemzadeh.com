/* Sprint config helpers, shared by every Sprint page.

   Dates and prices live only in /assets/sprint/config.json. Pages fetch it at
   runtime (Cloudflare does not edge-cache .json by default, so an edit is live
   within GitHub Pages' 10-minute browser cache, no version bump needed) and
   render dates in the visitor's browser, so a past kickoff never shows.

   Markup hooks, filled on load by apply() and, for the static HTML, by
   scripts/render-sprint.mjs:
     data-sprint="key"         text content becomes fields()[key]
     data-sprint-needs="key"   hidden when fields()[key] is empty
     data-sprint-unless="key"  hidden when fields()[key] is set
     data-sprint-href="key"    href becomes fields()[key], removed when empty
     data-sprint-video="key"   renders config.urls[key] as a video, if set;
                               with data-video-facade and a thumbnail in
                               config[key + "Meta"], a click-to-load poster
     data-sprint-content="tpl" a meta tag's content, from a template with
                               {key} fields and [[optional]] segments
                               (render script only; crawlers read it)

   Also loadable from Node (module.exports) for scripts and tests. */
(function (root) {
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  var CONFIG_URL = '/assets/sprint/config.json';
  var pending = null;

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  // ISO dates are calendar days, not instants: parse them as local dates so
  // "2026-10-20" is a Tuesday in every timezone.
  function parseDate(iso) {
    var p = iso.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function todayISO(now) {
    var d = now || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  // "Tuesday October 20"
  function formatDate(iso) {
    var d = parseDate(iso);
    return DAYS[d.getDay()] + ' ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
  }

  // "October"
  function formatMonth(iso) {
    return MONTHS[parseDate(iso).getMonth()];
  }

  // "$5,000"
  function formatMoney(amount, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // The next n kickoffs still open for booking. A kickoff drops off once its
  // Scoping Call window closes, so it disappears before its date passes.
  function nextKickoffs(cfg, n, today) {
    var t = today || todayISO();
    return cfg.kickoffs
      .filter(function (k) { return k.callsCloseBy >= t; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; })
      .slice(0, n || 2);
  }

  function priceFor(cfg, kickoffDate) {
    return kickoffDate <= cfg.price.currentThroughKickoff ? cfg.price.current : cfg.price.next;
  }

  // Display strings for the {placeholders} used in page copy. A missing
  // kickoff comes back as '' so callers can fall back to evergreen copy.
  function fields(cfg, today) {
    var next = nextKickoffs(cfg, 2, today);
    var k1 = next[0];
    var k2 = next[1];
    var p = cfg.price;
    return {
      kickoff1: k1 ? formatDate(k1.date) : '',
      kickoff2: k2 ? formatDate(k2.date) : '',
      deposit1: k1 ? formatDate(k1.depositBy) : '',
      deposit2: k2 ? formatDate(k2.depositBy) : '',
      callsClose1: k1 ? formatDate(k1.callsCloseBy) : '',
      callsClose2: k2 ? formatDate(k2.callsCloseBy) : '',
      price: formatMoney(p.current, p.currency),
      nextPrice: formatMoney(p.next, p.currency),
      priceThrough: formatDate(p.currentThroughKickoff),
      priceThroughMonth: formatMonth(p.currentThroughKickoff),
      nextFrom: formatDate(p.nextFrom),
      depositPercent: p.depositPercent + '%',
      discoveryDayPrice: formatMoney(p.discoveryDay, p.currency),
      supportDays: String(cfg.supportDays),
      deposit: cfg.urls.deposit || '',
      booking: cfg.urls.booking,
      proofVideo: cfg.urls.proofVideo || '',
      callVideo: cfg.urls.callVideo || '',
      thanksVideo: cfg.urls.thanksVideo || ''
    };
  }

  function load() {
    if (!pending) {
      pending = fetch(CONFIG_URL).then(function (res) {
        if (!res.ok) throw new Error('Sprint config: HTTP ' + res.status);
        return res.json();
      });
    }
    return pending;
  }

  // Turn a share link into something embeddable: a file plays in <video>,
  // YouTube, Loom, and Vimeo links become their player URLs.
  function videoEmbed(url) {
    var m;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { type: 'file', src: url };
    if ((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/))) {
      return { type: 'frame', src: 'https://www.youtube-nocookie.com/embed/' + m[1] };
    }
    if ((m = url.match(/loom\.com\/(?:share|embed)\/(\w+)/))) {
      return { type: 'frame', src: 'https://www.loom.com/embed/' + m[1] };
    }
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) {
      return { type: 'frame', src: 'https://player.vimeo.com/video/' + m[1] };
    }
    return { type: 'frame', src: url };
  }

  function player(v, title, autoplay) {
    var node;
    if (v.type === 'file') {
      node = document.createElement('video');
      node.controls = true;
      node.preload = 'metadata';
      node.autoplay = autoplay;
      node.setAttribute('playsinline', '');
      node.src = v.src;
    } else {
      node = document.createElement('iframe');
      node.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
      node.setAttribute('allowfullscreen', '');
      node.setAttribute('loading', 'lazy');
      node.src = autoplay ? v.src + (v.src.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1' : v.src;
    }
    node.title = title;
    return node;
  }

  // With a thumbnail, the slot shows a poster button and loads the player only
  // on click, so the video host costs nothing until someone wants to watch.
  function renderVideo(slot, url, meta) {
    if (!url) {
      slot.hidden = true;
      return;
    }
    var v = videoEmbed(url);
    var title = slot.getAttribute('data-video-title') || 'Video';
    if (slot.hasAttribute('data-video-facade') && meta && meta.thumbnail) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'sp-video__facade';
      button.setAttribute('aria-label', 'Play video: ' + title);
      var img = document.createElement('img');
      img.src = meta.thumbnail;
      img.alt = '';
      img.width = 1280;
      img.height = 720;
      img.loading = 'lazy';
      img.decoding = 'async';
      var play = document.createElement('span');
      play.className = 'sp-video__play';
      play.setAttribute('aria-hidden', 'true');
      button.append(img, play);
      button.addEventListener('click', function () {
        var node = player(v, title, true);
        slot.replaceChildren(node);
        node.focus();
      });
      slot.replaceChildren(button);
    } else {
      slot.replaceChildren(player(v, title, false));
    }
    slot.hidden = false;
  }

  function apply(root, cfg, today) {
    var f = fields(cfg, today);
    function each(sel, fn) {
      Array.prototype.forEach.call(root.querySelectorAll(sel), fn);
    }
    each('[data-sprint]', function (el) {
      var k = el.getAttribute('data-sprint');
      if (k in f) el.textContent = f[k];
    });
    each('[data-sprint-needs]', function (el) {
      el.hidden = !f[el.getAttribute('data-sprint-needs')];
    });
    each('[data-sprint-unless]', function (el) {
      el.hidden = !!f[el.getAttribute('data-sprint-unless')];
    });
    each('[data-sprint-href]', function (el) {
      var v = f[el.getAttribute('data-sprint-href')];
      if (v) el.setAttribute('href', v);
      else el.removeAttribute('href');
    });
    each('[data-sprint-video]', function (el) {
      var key = el.getAttribute('data-sprint-video');
      renderVideo(el, cfg.urls[key], cfg[key + 'Meta']);
    });
  }

  var api = {
    load: load,
    todayISO: todayISO,
    formatDate: formatDate,
    formatMonth: formatMonth,
    formatMoney: formatMoney,
    nextKickoffs: nextKickoffs,
    priceFor: priceFor,
    fields: fields,
    videoEmbed: videoEmbed,
    apply: apply
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
    return;
  }
  root.Sprint = api;

  // Pages with config hooks fill themselves; the scorecard has none.
  var HOOKS = '[data-sprint],[data-sprint-needs],[data-sprint-unless],[data-sprint-href],[data-sprint-video]';
  if (document.querySelector(HOOKS)) {
    load().then(function (cfg) { apply(document, cfg); }, function () { /* keep the static values */ });
  }
})(this);
