/* FDE cost calculator (/fde-cost-calculator/).

   Compares a full-time hire, a contractor, and the FDE Sprint on first-year
   cost, cost per workflow, and time to the first shipped workflow. Runs
   entirely in the browser. The Sprint price comes from
   /assets/sprint/config.json through sprint.js, so it is never hard-coded
   here; until the config loads, the static worked example in the HTML stands. */
(function () {
  var form = document.getElementById('fde-calc');
  if (!form) return;

  var FALLBACK_PRICE = 5000;
  var price = null;
  var tracked = false;

  function num(id, min, max) {
    var v = parseFloat(document.getElementById(id).value);
    if (!isFinite(v)) v = 0;
    if (min !== undefined && v < min) v = min;
    if (max !== undefined && v > max) v = max;
    return v;
  }

  function money(v) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(Math.round(v));
  }

  function set(id, text) {
    document.getElementById(id).textContent = text;
  }

  function plural(n, one, many) {
    return n + ' ' + (n === 1 ? one : many);
  }

  function render() {
    var sprintPrice = price || FALLBACK_PRICE;
    var workflows = Math.round(num('c-workflows', 1, 50));
    var salary = num('c-salary', 0);
    var overhead = num('c-overhead', 1, 3);
    var hireMonths = Math.round(num('c-hire-months', 0, 12));
    var rate = num('c-rate', 0);
    var hours = num('c-hours', 0);

    var hireTotal = salary * overhead * (12 - hireMonths) / 12;
    var contractTotal = rate * hours * workflows;
    var sprintTotal = sprintPrice * workflows;
    var buildWeeks = Math.max(1, Math.round(hours / 40));

    if (hireMonths >= 12) {
      set('r-hire-total', money(0));
      set('r-hire-per', 'Nothing ships in year one');
      set('r-hire-time', 'Twelve months or more to hire');
    } else {
      set('r-hire-total', money(hireTotal));
      set('r-hire-per', money(hireTotal / workflows));
      set('r-hire-time', hireMonths === 0
        ? 'The build, if the hire is already in seat'
        : plural(hireMonths, 'month', 'months') + ' to hire, then the build');
    }
    set('r-contract-total', money(contractTotal));
    set('r-contract-per', money(rate * hours));
    set('r-contract-time', 'About ' + plural(buildWeeks, 'week', 'weeks') + ' of build, once you have found one');
    set('r-sprint-total', money(sprintTotal));
    set('r-sprint-per', money(sprintPrice));
    set('r-sprint-time', 'Ten business days');

    // Break-even: the workflows a year at which a hire costs less per
    // workflow than a Sprint does.
    var summary;
    if (hireMonths >= 12 || hireTotal <= 0) {
      summary = 'With ' + plural(hireMonths, 'month', 'months') + ' to hire, a full-time engineer ships nothing in the first year, so the comparison is between a contractor and Sprints.';
    } else {
      var breakEven = Math.ceil(hireTotal / sprintPrice);
      summary = 'At these inputs, a full-time hire costs less per workflow than Sprints once you need ' +
        plural(breakEven, 'workflow', 'workflows') + ' or more in the first year. ' +
        (workflows < breakEven
          ? 'You need ' + workflows + ', so Sprints cost ' + money(hireTotal - sprintTotal) + ' less than a hire this year, and a hire still buys you capacity the Sprints do not.'
          : 'You need ' + workflows + ', which is past the break-even, so a hire is the cheaper way to get this much AI work done, if you can hire in ' + plural(hireMonths, 'month', 'months') + '.');
    }
    set('calc-summary', summary);
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('input', function () {
    render();
    if (!tracked) {
      tracked = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'fde_cost_calculator_used' });
    }
  });

  if (window.Sprint) {
    window.Sprint.load().then(function (cfg) {
      price = cfg && cfg.price ? cfg.price.current : null;
      render();
    }, render);
  } else {
    render();
  }
})();
