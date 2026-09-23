/* Workflow Scorecard: scores the form in the browser and renders the verdict.
   Nothing is posted anywhere. The Book button carries the result to the
   Scoping Call page as query parameters (workflow, score, gaps), which that
   page forwards to Cal.com as prefilled booking answers. */
(function () {
  var form = document.getElementById('scorecard');
  if (!form) return;

  var resultSection = document.getElementById('result');
  var resultBody = document.getElementById('sc-result-body');
  var resultTitle = document.getElementById('sc-result-title');
  var status = document.getElementById('sc-status');

  var SCOPE = ['user', 'trigger', 'process', 'output', 'value'];

  // One line per dimension on what closes the gap. Order matches the form.
  var DIMS = [
    { key: 'value', gap: 'Tie it to a number the board already tracks, like churn, sales cycle, or support cost, and put that number in the sentence.' },
    { key: 'frequency', gap: 'Pick the version of this that runs weekly or daily. A workflow that runs a few times a year never gets enough runs to tune or to pay back.' },
    { key: 'pain', gap: 'Find the task people put off or hand to the newest hire, and ask the person who does it how long it takes.' },
    { key: 'data', gap: 'Get one month of real examples, the inputs and what people produced from them, into one export, folder, or table.' },
    { key: 'feasibility', gap: 'Narrow it until it reads only from systems you already have an API or export for. New infrastructure does not fit in ten days.' },
    { key: 'risk', gap: 'Make v1 a draft that a person reviews before anything leaves the building. Autonomy comes later.' },
    { key: 'adoption', gap: 'Name the one person who will use it every week, and get them to ask for it.' },
    { key: 'reuse', gap: 'Describe it by its shape, input to draft to review, so the same build can carry your next two workflows.' }
  ];

  // When scores tie, the dimensions the verdict rules lean on come first.
  var TIE_ORDER = ['data', 'feasibility', 'risk', 'value', 'adoption', 'pain', 'frequency', 'reuse'];

  var READY = [
    { key: 'code', short: 'Codebase access', gap: 'Ask whoever administers GitHub or GitLab for a read-only account or a scoped deploy key. It is usually a one-day task.' },
    { key: 'sample', short: 'Sample data', gap: 'Export 20 to 50 real examples, anonymized if you need to, into one shared folder.' },
    { key: 'owner', short: 'Decision-maker', gap: 'Name one person who can say yes or no within a business day, and hold 15 minutes a day on their calendar for the ten days.' },
    { key: 'dpa', short: 'Data processing agreement', gap: 'Check that your model provider\'s data processing agreement covers your account. Anthropic and OpenAI both offer one to business and API customers.' }
  ];

  var ANSWER_TEXT = { yes: 'yes', no: 'no', unsure: 'not sure', '': 'no answer' };

  var RED_RULES = {
    risk: {
      reason: function (s) { return 'Risk manageability is 1: a wrong output would be irreversible, legal, or financial, and a first Sprint can\'t carry that.'; },
      fix: 'Redefine it as a draft-for-review workflow: the AI drafts, a person approves, and nothing leaves without them.'
    },
    data: {
      reason: function (s) { return 'Data availability is ' + s.scores.data + ' out of 5, so the workflow has nothing solid to run on yet.'; },
      fix: 'Get one month of sample data into one place, then score it again.'
    },
    value: {
      reason: function (s) { return 'Business value is ' + s.scores.value + ' out of 5, so even a perfect build wouldn\'t move a number that matters.'; },
      fix: 'Pick a different workflow, one tied to a number the board already asks about.'
    },
    feasibility: {
      reason: function (s) { return 'Technical feasibility is ' + s.scores.feasibility + ' out of 5: it needs infrastructure you don\'t have, and ten days won\'t build it.'; },
      fix: 'Pick a different workflow, one that runs on the APIs and exports you already have.'
    },
    total: {
      reason: function (s) { return 'The total is ' + s.total + ' out of 40, and a ten-day Sprint needs at least 22.'; },
      fix: 'Pick a different workflow, one that runs more often and hurts more when it\'s done by hand.'
    }
  };

  var VERDICT_NAME = { green: 'Green', yellow: 'Yellow', red: 'Red' };

  var config = null;
  var scored = false;
  var started = false;
  var lastVerdict = '';

  function $(id) { return document.getElementById(id); }

  function labelText(id) {
    var el = document.querySelector('label[for="' + id + '"]');
    return el ? el.textContent.trim() : id;
  }

  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: event };
    for (var k in data) payload[k] = data[k];
    window.dataLayer.push(payload);
  }

  // Read the form into a plain state object.
  function read() {
    var s = { scope: {}, scores: {}, ready: {}, total: 0, yes: 0, missing: [] };
    SCOPE.forEach(function (k) {
      var v = $('s-' + k).value.trim().replace(/\s+/g, ' ');
      s.scope[k] = v;
      if (!v) s.missing.push(k);
    });
    DIMS.forEach(function (d) {
      var n = parseInt($('d-' + d.key).value, 10);
      s.scores[d.key] = n;
      s.total += n;
    });
    READY.forEach(function (r) {
      var checked = form.querySelector('input[name="r-' + r.key + '"]:checked');
      s.ready[r.key] = checked ? checked.value : '';
      if (s.ready[r.key] === 'yes') s.yes++;
    });
    return s;
  }

  function judge(s) {
    var d = s.scores;
    var fired = [];
    if (d.risk === 1) fired.push('risk');
    if (d.data <= 2) fired.push('data');
    if (d.value <= 2) fired.push('value');
    if (d.feasibility <= 2) fired.push('feasibility');
    if (s.total < 22) fired.push('total');
    if (fired.length) return { verdict: 'red', fired: fired };

    var green = s.total >= 30 && d.data >= 4 && d.feasibility >= 4 && d.risk >= 3 && s.yes >= 3;
    // An unfinished sentence caps the verdict at Yellow.
    if (green && !s.missing.length) return { verdict: 'green' };
    return { verdict: 'yellow' };
  }

  function sentence(s) {
    function part(k) { return s.scope[k] || '[' + k + ']'; }
    var value = part('value').replace(/[.\s]+$/, '');
    return 'For ' + part('user') + ', when ' + part('trigger') + ', the workflow will ' +
      part('process') + ' and produce ' + part('output') + ', so that ' + value + '.';
  }

  function lowestTwo(s) {
    return DIMS.slice()
      .filter(function (d) { return s.scores[d.key] < 5; })
      .sort(function (a, b) {
        return (s.scores[a.key] - s.scores[b.key]) ||
          (TIE_ORDER.indexOf(a.key) - TIE_ORDER.indexOf(b.key));
      })
      .slice(0, 2);
  }

  function readinessGaps(s) {
    return READY.filter(function (r) { return s.ready[r.key] !== 'yes'; });
  }

  function gapsParam(s) {
    var gaps = readinessGaps(s).map(function (r) {
      return r.short + ': ' + ANSWER_TEXT[s.ready[r.key]];
    });
    return gaps.length ? gaps.join('; ') : 'None';
  }

  function kickoffLine() {
    if (!config) return '';
    var next = window.Sprint.nextKickoffs(config, 2).map(function (k) {
      return window.Sprint.formatDate(k.date);
    });
    if (next.length === 2) return 'Next kickoffs: ' + next[0] + ' and ' + next[1] + '.';
    if (next.length === 1) return 'Next kickoff: ' + next[0] + '.';
    return '';
  }

  function bookHref(s, j) {
    var base = (config && config.urls.call) || '/call/';
    return base +
      '?workflow=' + encodeURIComponent(sentence(s)) +
      '&score=' + encodeURIComponent(s.total + '/40 ' + VERDICT_NAME[j.verdict]) +
      '&gaps=' + encodeURIComponent(gapsParam(s));
  }

  // The verdict as a list of blocks, used for both the page and the copy text.
  // Each block: { lead } | { text } | { heading, items: [text] }.
  function verdictCopy(s, j) {
    var out = [];
    if (j.verdict === 'green') {
      out.push({ lead: 'Sprint-ready.' });
      var line = kickoffLine();
      out.push({ text: (line ? line + ' ' : '') + 'Book a 15-minute Scoping Call and bring this result.' });
    } else if (j.verdict === 'yellow') {
      out.push({ lead: 'Fixable.' });
      var items = [];
      if (s.missing.length) {
        var blanks = s.missing.map(function (k) { return '[' + k + ']'; });
        var last = blanks.pop();
        items.push('Scope sentence: ' + (blanks.length ? blanks.join(', ') + ' and ' + last + ' are' : last + ' is') +
          ' still blank. The Sprint Brief is written from this sentence, so fill every blank.');
      }
      lowestTwo(s).forEach(function (d) {
        items.push(labelText('d-' + d.key) + ' (' + s.scores[d.key] + '/5): ' + d.gap);
      });
      readinessGaps(s).forEach(function (r) {
        items.push(r.short + ' (' + ANSWER_TEXT[s.ready[r.key]] + '): ' + r.gap);
      });
      if (items.length) out.push({ heading: 'What to close', items: items });
      out.push({ text: 'Close these, or book the call now and we\'ll scope around them.' });
    } else {
      out.push({ lead: 'Not a Sprint yet.' });
      out.push({ text: RED_RULES[j.fired[0]].reason(s) });
      // Value, feasibility, and total all say "pick a different workflow";
      // keep only the first of those.
      var fixes = [];
      var switched = false;
      j.fired.forEach(function (k) {
        var isSwitch = k === 'value' || k === 'feasibility' || k === 'total';
        if (isSwitch && switched) return;
        if (isSwitch) switched = true;
        fixes.push(RED_RULES[k].fix);
      });
      out.push({ heading: 'What to do instead', items: fixes });
    }
    return out;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function scoreClass(n) {
    return n >= 4 ? 'diag-status--ok' : n === 3 ? 'diag-status--warn' : 'diag-status--fail';
  }

  function answerClass(a) {
    return a === 'yes' ? 'diag-status--ok' : a === 'no' ? 'diag-status--fail' : a === 'unsure' ? 'diag-status--warn' : 'sc-status--none';
  }

  function row(name, value, cls) {
    return el('div', { class: 'diag-row' }, [
      el('dt', { text: name }),
      el('dd', { class: 'diag-status ' + cls, text: value })
    ]);
  }

  function render(s, j) {
    var blocks = verdictCopy(s, j);
    var panel = el('div', { class: 'sc-verdict sc-verdict--' + j.verdict }, [
      el('p', { class: 'sc-verdict__score' }, [
        el('span', { class: 'sc-verdict__num', text: String(s.total) }),
        el('span', { class: 'sc-verdict__of', text: '/40' }),
        el('span', { class: 'sc-verdict__badge', text: VERDICT_NAME[j.verdict] })
      ])
    ]);
    blocks.forEach(function (b) {
      if (b.lead) panel.appendChild(el('p', { class: 'sc-verdict__lead', text: b.lead }));
      if (b.text) panel.appendChild(el('p', { text: b.text }));
      if (b.items) {
        panel.appendChild(el('h3', { class: 'sc-verdict__heading', text: b.heading }));
        panel.appendChild(el('ul', { class: 'afs-list-tight sc-verdict__list' },
          b.items.map(function (t) { return el('li', { text: t }); })));
      }
    });
    var red = j.verdict === 'red';
    panel.appendChild(el('div', { class: 'afs-cta-row' }, [
      el('a', {
        class: 'afs-cta ' + (red ? 'afs-cta-secondary' : 'afs-cta-primary'),
        href: bookHref(s, j),
        'data-book': '',
        text: red ? 'Book the call to pick a different workflow' : 'Book the Scoping Call'
      })
    ]));

    var scoreRows = DIMS.map(function (d) {
      return row(labelText('d-' + d.key), s.scores[d.key] + '/5', scoreClass(s.scores[d.key]));
    });
    var readyRows = READY.map(function (r) {
      return row(r.short, ANSWER_TEXT[s.ready[r.key]], answerClass(s.ready[r.key]));
    });

    var summary = el('div', { class: 'diag sc-summary', role: 'group', 'aria-label': 'Your scorecard' }, [
      el('div', { class: 'diag-chrome', 'aria-hidden': 'true' }, [
        el('span', { class: 'diag-dot diag-dot--red' }),
        el('span', { class: 'diag-dot diag-dot--yellow' }),
        el('span', { class: 'diag-dot diag-dot--green' }),
        el('span', { class: 'diag-title', text: '~/scorecard/result.txt' })
      ]),
      el('div', { class: 'diag-body' }, [
        el('p', { class: 'sc-summary__label', text: 'scope' }),
        el('p', { class: 'sc-summary__sentence', text: sentence(s) }),
        el('div', { class: 'diag-divider' }),
        el('p', { class: 'sc-summary__label', text: 'scores' }),
        el('dl', { class: 'diag-rows diag-rows--leaders' }, scoreRows),
        el('div', { class: 'diag-divider' }),
        el('p', { class: 'sc-summary__label', text: 'readiness' }),
        el('dl', { class: 'diag-rows diag-rows--leaders' }, readyRows),
        el('div', { class: 'diag-divider' }),
        el('div', { class: 'sc-summary__foot' }, [
          el('p', { class: 'diag-recommend', text: '→ total ' + s.total + '/40 · ' + VERDICT_NAME[j.verdict].toLowerCase() }),
          el('button', { type: 'button', class: 'sc-copy', 'data-copy': '', text: 'Copy result' })
        ])
      ])
    ]);

    resultBody.replaceChildren(panel, summary);
  }

  function plainText(s, j) {
    var lines = ['Workflow Scorecard: ' + s.total + '/40, ' + VERDICT_NAME[j.verdict], ''];
    verdictCopy(s, j).forEach(function (b) {
      if (b.lead) lines.push(b.lead);
      if (b.text) lines.push(b.text);
      if (b.items) {
        lines.push('', b.heading + ':');
        b.items.forEach(function (t) { lines.push('- ' + t); });
      }
    });
    lines.push('', 'Scope:', sentence(s), '', 'Scores:');
    DIMS.forEach(function (d) { lines.push('- ' + labelText('d-' + d.key) + ': ' + s.scores[d.key] + '/5'); });
    lines.push('', 'Readiness:');
    READY.forEach(function (r) { lines.push('- ' + r.short + ': ' + ANSWER_TEXT[s.ready[r.key]]); });
    lines.push('', 'Scored at https://ghanemzadeh.com/scorecard/');
    return lines.join('\n');
  }

  function update(announce) {
    var s = read();
    var j = judge(s);
    render(s, j);
    if (announce || j.verdict !== lastVerdict) {
      status.textContent = 'Score ' + s.total + ' out of 40. ' + VERDICT_NAME[j.verdict] + '.';
    }
    lastVerdict = j.verdict;
    return j;
  }

  function syncOutputs() {
    DIMS.forEach(function (d) {
      $('d-' + d.key + '-out').textContent = $('d-' + d.key).value;
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = el('textarea', { readonly: '', class: 'visually-hidden' });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }

  function onChange() {
    syncOutputs();
    if (!started) {
      started = true;
      track('scorecard_started');
    }
    if (scored) update(false);
  }

  form.addEventListener('input', onChange);
  form.addEventListener('change', onChange);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var j = update(true);
    scored = true;
    resultSection.hidden = false;
    resultTitle.focus();
    track('scorecard_completed', { verdict: j.verdict });
  });

  resultBody.addEventListener('click', function (e) {
    var book = e.target.closest('[data-book]');
    if (book) {
      track('scorecard_call_click', { verdict: lastVerdict });
      return;
    }
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var s = read();
    copyText(plainText(s, judge(s))).then(function () {
      btn.textContent = 'Copied';
      status.textContent = 'Result copied to the clipboard.';
      setTimeout(function () { btn.textContent = 'Copy result'; }, 2000);
    }, function () {
      status.textContent = 'Copy didn\'t work in this browser. Select the result and copy it by hand.';
    });
  });

  // Dates come from the shared config; the result renders without them if it
  // fails to load.
  if (window.Sprint) {
    window.Sprint.load().then(function (cfg) {
      config = cfg;
      if (scored) update(false);
    }, function () { /* keep the dateless copy */ });
  }

  syncOutputs();
  form.querySelector('.sc-submit').hidden = false;
})();
