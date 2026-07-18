/* ==========================================================================
   RAPID DRY RESTORATION — quote-calculator.js
   Interactive price estimator: sq ft + damage type + severity + urgency
   All figures are illustrative placeholder rates — edit RATE CONFIG below
   to match your market before publishing.
   ========================================================================== */
(function () {
  'use strict';
  var root = document.getElementById('quoteCalculator');
  if (!root) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- RATE CONFIG (edit these to match your pricing) ---------------- */
  var RATES = {
    water: { clean: 3.75, grey: 5.5, black: 8.25 },   // $ per sq ft, by IICRC water category
    mold:  { minor: 12, moderate: 18, severe: 27 },    // $ per sq ft, by infestation severity
    urgency: { emergency: 1.15, soon: 1.05, flexible: 1.0 },
    comboDiscount: 0.92, // applied when both water + mold selected
    minJob: 450
  };

  /* ---------------- State ---------------- */
  var state = {
    step: 1,
    damageType: null,     // 'water' | 'mold' | 'both'
    sqft: 900,
    waterCategory: null,  // 'clean' | 'grey' | 'black'
    moldSeverity: null,   // 'minor' | 'moderate' | 'severe'
    urgency: null         // 'emergency' | 'soon' | 'flexible'
  };

  var totalSteps = 4;

  /* ---------------- Elements ---------------- */
  var panels = root.querySelectorAll('.qc-panel');
  var dots = root.querySelectorAll('.qc-steps .dot');
  var sqftSlider = document.getElementById('sqftSlider');
  var sqftValue = document.getElementById('sqftValue');
  var waterCatBlock = document.getElementById('waterCatBlock');
  var moldSevBlock = document.getElementById('moldSevBlock');
  var priceRangeEl = document.getElementById('priceRange');
  var gaugeNeedle = document.getElementById('qcGaugeNeedle');
  var gaugeReadout = document.getElementById('qcGaugeReadout');
  var summaryType = document.getElementById('summaryType');
  var summarySize = document.getElementById('summarySize');
  var summarySeverity = document.getElementById('summarySeverity');
  var summaryUrgency = document.getElementById('summaryUrgency');
  var nextBtns = root.querySelectorAll('[data-qc-next]');
  var backBtns = root.querySelectorAll('[data-qc-back]');
  var leadForm = document.getElementById('qcLeadForm');
  var hiddenSummary = document.getElementById('qcHiddenSummary');

  /* ---------------- Step navigation ---------------- */
  function showStep(n) {
    state.step = n;
    panels.forEach(function (p) {
      p.classList.toggle('is-active', parseInt(p.getAttribute('data-step'), 10) === n);
    });
    dots.forEach(function (d, i) {
      var idx = i + 1;
      d.classList.toggle('is-active', idx === n);
      d.classList.toggle('is-done', idx < n);
    });
    root.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function canAdvance(step) {
    if (step === 1) return !!state.damageType;
    if (step === 2) return state.sqft > 0;
    if (step === 3) {
      if (state.damageType === 'water') return !!state.waterCategory;
      if (state.damageType === 'mold') return !!state.moldSeverity;
      if (state.damageType === 'both') return !!state.waterCategory && !!state.moldSeverity;
      return false;
    }
    if (step === 4) return !!state.urgency;
    return true;
  }

  function showValidationError(step) {
    var panel = root.querySelector('.qc-panel[data-step="' + step + '"]');
    if (!panel) return;
    var err = panel.querySelector('[data-qc-error]');
    if (err) err.classList.add('is-shown');
    var grids = panel.querySelectorAll('.option-grid');
    grids.forEach(function (grid) {
      if (reduceMotion) return;
      grid.classList.remove('is-shaking');
      void grid.offsetWidth; // restart animation
      grid.classList.add('is-shaking');
    });
  }
  function hideValidationError(step) {
    var panel = root.querySelector('.qc-panel[data-step="' + step + '"]');
    if (!panel) return;
    var err = panel.querySelector('[data-qc-error]');
    if (err) err.classList.remove('is-shown');
  }

  nextBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!canAdvance(state.step)) {
        showValidationError(state.step);
        return;
      }
      hideValidationError(state.step);
      if (state.step < totalSteps) {
        showStep(state.step + 1);
        updateEstimate();
      }
    });
  });
  backBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (state.step > 1) showStep(state.step - 1);
    });
  });

  /* ---------------- Step 1: damage type ---------------- */
  root.querySelectorAll('[data-damage-type]').forEach(function (card) {
    card.addEventListener('click', function () {
      root.querySelectorAll('[data-damage-type]').forEach(function (c) { c.classList.remove('is-selected'); });
      card.classList.add('is-selected');
      state.damageType = card.getAttribute('data-damage-type');
      root.querySelectorAll('[data-qc-next="1"]').forEach(function (b) { b.disabled = false; });
      hideValidationError(1);
      renderStep3Options();
      updateEstimate();
    });
  });

  /* ---------------- Step 2: sq ft slider ---------------- */
  if (sqftSlider) {
    sqftSlider.addEventListener('input', function () {
      state.sqft = parseInt(sqftSlider.value, 10);
      sqftValue.textContent = state.sqft.toLocaleString();
      updateEstimate();
    });
  }

  /* ---------------- Step 3: severity (depends on step 1) ---------------- */
  function renderStep3Options() {
    if (!waterCatBlock || !moldSevBlock) return;
    waterCatBlock.style.display = (state.damageType === 'water' || state.damageType === 'both') ? 'block' : 'none';
    moldSevBlock.style.display = (state.damageType === 'mold' || state.damageType === 'both') ? 'block' : 'none';
  }
  root.querySelectorAll('[data-water-cat]').forEach(function (card) {
    card.addEventListener('click', function () {
      root.querySelectorAll('[data-water-cat]').forEach(function (c) { c.classList.remove('is-selected'); });
      card.classList.add('is-selected');
      state.waterCategory = card.getAttribute('data-water-cat');
      hideValidationError(3);
      updateEstimate();
    });
  });
  root.querySelectorAll('[data-mold-sev]').forEach(function (card) {
    card.addEventListener('click', function () {
      root.querySelectorAll('[data-mold-sev]').forEach(function (c) { c.classList.remove('is-selected'); });
      card.classList.add('is-selected');
      state.moldSeverity = card.getAttribute('data-mold-sev');
      hideValidationError(3);
      updateEstimate();
    });
  });

  /* ---------------- Step 4: urgency ---------------- */
  root.querySelectorAll('[data-urgency]').forEach(function (card) {
    card.addEventListener('click', function () {
      root.querySelectorAll('[data-urgency]').forEach(function (c) { c.classList.remove('is-selected'); });
      card.classList.add('is-selected');
      state.urgency = card.getAttribute('data-urgency');
      updateEstimate();
    });
  });

  /* ---------------- Estimate engine ---------------- */
  function computeEstimate() {
    var perSqFt = 0;
    var n = 0;
    if (state.damageType === 'water' || state.damageType === 'both') {
      perSqFt += RATES.water[state.waterCategory || 'clean'];
      n++;
    }
    if (state.damageType === 'mold' || state.damageType === 'both') {
      perSqFt += RATES.mold[state.moldSeverity || 'minor'];
      n++;
    }
    if (n === 2) perSqFt *= RATES.comboDiscount;

    var urgencyMult = RATES.urgency[state.urgency || 'soon'];
    var base = Math.max(perSqFt * state.sqft * urgencyMult, RATES.minJob);

    var low = Math.round((base * 0.85) / 25) * 25;
    var high = Math.round((base * 1.2) / 25) * 25;
    return { low: low, high: high, base: base };
  }

  function severityScore() {
    // Maps current selections to a 0-100 "site risk" score for the gauge.
    var score = 20;
    if (state.damageType === 'water') score += 20;
    if (state.damageType === 'mold') score += 28;
    if (state.damageType === 'both') score += 42;

    var catScore = { clean: 6, grey: 14, black: 24 };
    var sevScore = { minor: 8, moderate: 16, severe: 26 };
    if (state.waterCategory) score += catScore[state.waterCategory];
    if (state.moldSeverity) score += sevScore[state.moldSeverity];

    score += Math.min(state.sqft / 100, 12);

    var urgScore = { emergency: 10, soon: 4, flexible: 0 };
    if (state.urgency) score += urgScore[state.urgency];

    return Math.max(4, Math.min(100, Math.round(score)));
  }

  function setGauge(value) {
    if (!gaugeNeedle) return;
    var angle = -90 + (value / 100) * 180;
    gaugeNeedle.style.transform = 'rotate(' + angle + 'deg)';
    if (gaugeReadout) gaugeReadout.textContent = value;
  }

  function fmt(n) { return '$' + n.toLocaleString(); }

  function updateEstimate() {
    var score = severityScore();
    setGauge(score);

    if (!state.damageType) {
      if (priceRangeEl) priceRangeEl.textContent = '$ — . — —';
      return;
    }
    var est = computeEstimate();
    if (priceRangeEl) priceRangeEl.textContent = fmt(est.low) + ' \u2013 ' + fmt(est.high);

    if (summaryType) {
      var labels = { water: 'Water Damage', mold: 'Mold Remediation', both: 'Water + Mold' };
      summaryType.textContent = labels[state.damageType] || '\u2014';
    }
    if (summarySize) summarySize.textContent = state.sqft.toLocaleString() + ' sq ft';
    if (summarySeverity) {
      var bits = [];
      if (state.waterCategory) bits.push('Cat ' + ({ clean: '1 \u2013 Clean', grey: '2 \u2013 Grey', black: '3 \u2013 Black' }[state.waterCategory]));
      if (state.moldSeverity) bits.push(state.moldSeverity.charAt(0).toUpperCase() + state.moldSeverity.slice(1) + ' mold');
      summarySeverity.textContent = bits.length ? bits.join(' / ') : '\u2014';
    }
    if (summaryUrgency) {
      var uLabels = { emergency: 'Emergency (now)', soon: 'Within 24\u201348h', flexible: 'Flexible' };
      summaryUrgency.textContent = state.urgency ? uLabels[state.urgency] : '\u2014';
    }

    if (hiddenSummary) {
      hiddenSummary.value = [
        'Damage type: ' + (state.damageType || '-'),
        'Area: ' + state.sqft + ' sq ft',
        state.waterCategory ? 'Water category: ' + state.waterCategory : null,
        state.moldSeverity ? 'Mold severity: ' + state.moldSeverity : null,
        'Urgency: ' + (state.urgency || '-'),
        'Estimated range: ' + fmt(est.low) + ' - ' + fmt(est.high)
      ].filter(Boolean).join(' | ');
    }
  }

  /* ---------------- Lead form success ---------------- */
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      var action = leadForm.getAttribute('action') || '';
      if (action.indexOf('YOUR_FORM_ID') !== -1 || action === '') {
        e.preventDefault();
        var success = document.getElementById('qcSuccess');
        // Hide only the form itself — it's a sibling of #qcSuccess inside
        // #qcFormWrap, so hiding the whole wrap would hide the success
        // message too and leave the page looking broken.
        leadForm.style.display = 'none';
        if (success) success.classList.add('is-visible');
      }
    });
  }

  /* ---------------- Init ---------------- */
  showStep(1);
  renderStep3Options();
  updateEstimate();
})();
