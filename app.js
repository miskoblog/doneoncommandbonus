"use strict";

/* ========================================================================
   Access gate
   ======================================================================== */

const GATE_HASH = "c4350db7121bca2619465b4fcf67547490c2ff95349e90547298dd144497d9de";

async function sha256Hex(str) {
  const bytes = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function initGate() {
  const gate = document.getElementById("gate");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("gatePassword");
  const error = document.getElementById("gateError");

  if (gate.classList.contains("is-unlocked")) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const hash = await sha256Hex(input.value.trim());
    if (hash === GATE_HASH) {
      localStorage.setItem("landed_access", "granted");
      gate.classList.add("is-unlocked");
      error.classList.remove("is-visible");
    } else {
      error.classList.add("is-visible");
      input.value = "";
      input.focus();
    }
  });
}

/* ========================================================================
   Theme toggle
   ======================================================================== */

function initTheme() {
  const toggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  function effectiveTheme() {
    const attr = root.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  toggle.addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("landed_theme", next);
  });
}

/* ========================================================================
   Data
   ======================================================================== */

const NICHES = [
  { id: "dentist",     label: "Dental practice",        pain: "the booking page hasn't changed in years and after-hours inquiries just go to voicemail" },
  { id: "roofer",      label: "Roofing / home services", pain: "storm-season leads go to whoever answers first, and there's still no quote form on the site" },
  { id: "salon",       label: "Salon / spa",             pain: "the Instagram hasn't posted in weeks and there's no way to book straight from it" },
  { id: "gym",         label: "Gym / fitness studio",    pain: "membership promos still go out as a group text instead of a real campaign" },
  { id: "restaurant",  label: "Restaurant / café",       pain: "specials never make it past a chalkboard sign — nothing online, nothing scheduled" },
  { id: "realestate",  label: "Real estate agent",       pain: "every new listing needs its own page and video, and that's a week of work per listing right now" },
  { id: "lawfirm",     label: "Law firm",                pain: "the intake page looks a decade old and there's no follow-up sequence for new leads" },
  { id: "ecom",        label: "E-commerce brand",        pain: "product drops don't get a real campaign behind them — one email and a hope" },
  { id: "coach",       label: "Coach / course creator",  pain: "the offer page hasn't changed since the last launch and there's no lead magnet catching cold traffic" },
  { id: "generic",     label: "Local business (general)", pain: "marketing happens whenever there's time left over from running the actual business" },
];

const SERVICES = [
  { id: "page",   label: "Landing page",     deliverable: "a hosted landing page, live on a real URL, built in their brand", priceMin: 500,  priceMax: 2000, unit: "one-time", pitch: "get a real offer page live" },
  { id: "video",  label: "Promo video",      deliverable: "a rendered, captioned promo video — or a spokesperson video built from a single photo", priceMin: 1500, priceMax: 2500, unit: "one-time", pitch: "get a scroll-stopping promo video made" },
  { id: "email",  label: "Email management", deliverable: "monthly campaigns drafted, approved, and sent through their own list", priceMin: 500, priceMax: 3000, unit: "per month", pitch: "get their email list actually worked every month" },
  { id: "social", label: "Social management", deliverable: "a month of on-brand posts, scheduled across every network from one calendar", priceMin: 750, priceMax: 3000, unit: "per month", pitch: "keep their socials alive without them touching it" },
];

const STATUSES = [
  { id: "contacted", label: "Contacted" },
  { id: "proposal",  label: "Proposal sent" },
  { id: "won",       label: "Won" },
  { id: "lost",       label: "Lost" },
];

const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

/* ========================================================================
   Storage
   ======================================================================== */

const Store = {
  profile() {
    try { return JSON.parse(localStorage.getItem("landed_profile") || "{}"); }
    catch { return {}; }
  },
  saveProfile(p) { localStorage.setItem("landed_profile", JSON.stringify(p)); },

  prospects() {
    try { return JSON.parse(localStorage.getItem("landed_prospects") || "[]"); }
    catch { return []; }
  },
  saveProspects(list) { localStorage.setItem("landed_prospects", JSON.stringify(list)); },
};

/* ========================================================================
   Toast
   ======================================================================== */

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 1800);
}

/* ========================================================================
   Tabs
   ======================================================================== */

function initTabs() {
  const btns = document.querySelectorAll(".tab-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("is-active"));
      document.getElementById("panel-" + btn.dataset.tab).classList.add("is-active");
    });
  });
}

/* ========================================================================
   Agency profile modal
   ======================================================================== */

function initProfile() {
  const backdrop = document.getElementById("profileBackdrop");
  const openBtn = document.getElementById("openProfile");
  const closeBtn = document.getElementById("closeProfile");
  const form = document.getElementById("profileForm");
  const nameInput = document.getElementById("pf-name");
  const contactInput = document.getElementById("pf-contact");
  const taglineInput = document.getElementById("pf-tagline");
  const logoInput = document.getElementById("pf-logo");
  const logoPreview = document.getElementById("pf-logo-preview");
  const logoClear = document.getElementById("pf-logo-clear");
  const btnLabel = document.getElementById("profileBtnLabel");

  let profile = Store.profile();

  function applyToForm() {
    nameInput.value = profile.name || "";
    contactInput.value = profile.contact || "";
    taglineInput.value = profile.tagline || "";
    if (profile.logo) { logoPreview.src = profile.logo; logoPreview.classList.add("has-logo"); }
    else { logoPreview.src = ""; logoPreview.classList.remove("has-logo"); }
    btnLabel.textContent = profile.name ? profile.name : "My Agency";
  }
  applyToForm();

  openBtn.addEventListener("click", () => backdrop.classList.add("is-open"));
  closeBtn.addEventListener("click", () => backdrop.classList.remove("is-open"));
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.classList.remove("is-open"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") backdrop.classList.remove("is-open"); });

  logoInput.addEventListener("change", () => {
    const file = logoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      profile.logo = reader.result;
      logoPreview.src = profile.logo;
      logoPreview.classList.add("has-logo");
    };
    reader.readAsDataURL(file);
  });
  logoClear.addEventListener("click", () => {
    profile.logo = "";
    logoInput.value = "";
    logoPreview.src = "";
    logoPreview.classList.remove("has-logo");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    profile = {
      ...profile,
      name: nameInput.value.trim(),
      contact: contactInput.value.trim(),
      tagline: taglineInput.value.trim(),
    };
    Store.saveProfile(profile);
    btnLabel.textContent = profile.name ? profile.name : "My Agency";
    backdrop.classList.remove("is-open");
    showToast("Agency profile saved");
    document.dispatchEvent(new CustomEvent("profile:updated"));
  });

}

/* ========================================================================
   Outreach Script Generator
   ======================================================================== */

const SCRIPT_TEMPLATES = {
  email: {
    direct: ({ businessLabel, niche, service, agencyName, agencySign }) =>
`Subject: A quick idea for ${businessLabel}

Hi there,

I work with ${niche.label.toLowerCase()} businesses on their marketing, and I noticed ${businessLabel} — like a lot of businesses in that space — could be losing customers because ${niche.pain}.

I'd like to ${service.pitch}: I'll deliver ${service.deliverable}, done for you, in your brand.

If that's useful, I can have the first draft ready this week. Want me to send over a quick proposal?

${agencySign}`,
    casual: ({ businessLabel, niche, service, agencyName, agencySign }) =>
`Subject: Noticed something about ${businessLabel}

Hey!

Quick one — I help ${niche.label.toLowerCase()} businesses with their marketing, and I was looking at ${businessLabel} and noticed ${niche.pain}.

I could ${service.pitch} pretty fast — I'd hand you ${service.deliverable}, fully done, in your brand, no work on your end.

Worth a 2-minute proposal? Happy to send one over, no pressure either way.

${agencySign}`,
  },
  dm: {
    direct: ({ businessLabel, niche, service, agencySign }) =>
`Hi — I noticed ${niche.pain}. I can ${service.pitch}: ${service.deliverable}, delivered done-for-you in your brand. Want me to send a quick price on it?

${agencySign}`,
    casual: ({ businessLabel, niche, service, agencySign }) =>
`Hey! Saw that ${businessLabel} could use a hand — ${niche.pain}. I could ${service.pitch}, fully handled, in your brand. Want a quick proposal?

${agencySign}`,
  },
};

function initScripts() {
  const nicheSelect = document.getElementById("s-niche");
  const serviceSelect = document.getElementById("s-service");
  const nameInput = document.getElementById("s-name");
  const toneGroup = document.getElementById("s-tone");
  const formatGroup = document.getElementById("s-format");
  const output = document.getElementById("scriptOutput");
  const copyBtn = document.getElementById("copyScript");

  NICHES.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n.id; opt.textContent = n.label;
    nicheSelect.appendChild(opt);
  });
  SERVICES.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id; opt.textContent = s.label + ` (${money(s.priceMin)}–${money(s.priceMax)} ${s.unit})`;
    serviceSelect.appendChild(opt);
  });

  let tone = "direct";
  let format = "email";

  function bindSegmented(group, onChange) {
    group.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        onChange(btn.dataset.value);
        render();
      });
    });
  }
  bindSegmented(toneGroup, (v) => (tone = v));
  bindSegmented(formatGroup, (v) => (format = v));

  function render() {
    const niche = NICHES.find((n) => n.id === nicheSelect.value) || NICHES[0];
    const service = SERVICES.find((s) => s.id === serviceSelect.value) || SERVICES[0];
    const businessLabel = nameInput.value.trim() || `your ${niche.label.toLowerCase()}`;
    const profile = Store.profile();
    const agencyName = profile.name || "[Your Name]";
    const agencySign = profile.contact ? `${agencyName}\n${profile.contact}` : agencyName;

    const template = SCRIPT_TEMPLATES[format][tone];
    output.value = template({ businessLabel, niche, service, agencyName, agencySign });
  }

  [nicheSelect, serviceSelect, nameInput].forEach((el) => el.addEventListener("input", render));
  document.addEventListener("profile:updated", render);

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      showToast("Script copied to clipboard");
    } catch {
      output.select();
      document.execCommand("copy");
      showToast("Script copied to clipboard");
    }
  });

  render();
}

/* ========================================================================
   Pricing Proposal Builder
   ======================================================================== */

function initProposal() {
  const container = document.getElementById("p-services");
  const businessInput = document.getElementById("p-business");
  const contactInput = document.getElementById("p-contact");
  const doc = document.getElementById("proposalDoc");
  const printBtn = document.getElementById("printProposal");

  const state = {}; // id -> { checked, price }

  SERVICES.forEach((s) => {
    const mid = Math.round((s.priceMin + s.priceMax) / 2 / 25) * 25;
    state[s.id] = { checked: false, price: mid };

    const row = document.createElement("div");
    row.className = "service-row";
    row.innerHTML = `
      <div class="service-row-top">
        <input type="checkbox" id="chk-${s.id}" />
        <label for="chk-${s.id}">${s.label}</label>
        <span class="service-row-unit">${s.unit}</span>
      </div>
      <div class="service-price">
        <input type="range" id="rng-${s.id}" min="${s.priceMin}" max="${s.priceMax}" step="25" value="${mid}" />
        <span class="service-price-value" id="val-${s.id}">${money(mid)}</span>
      </div>
      <div class="service-price-range">Market range: ${money(s.priceMin)}–${money(s.priceMax)} ${s.unit}</div>
    `;
    container.appendChild(row);

    const chk = row.querySelector(`#chk-${s.id}`);
    const rng = row.querySelector(`#rng-${s.id}`);
    const val = row.querySelector(`#val-${s.id}`);

    chk.addEventListener("change", () => {
      state[s.id].checked = chk.checked;
      row.classList.toggle("is-checked", chk.checked);
      render();
    });
    rng.addEventListener("input", () => {
      state[s.id].price = Number(rng.value);
      val.textContent = money(rng.value);
      render();
    });
  });

  function render() {
    const profile = Store.profile();
    const business = businessInput.value.trim();
    const contact = contactInput.value.trim();
    const selected = SERVICES.filter((s) => state[s.id].checked);

    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    if (selected.length === 0) {
      doc.innerHTML = `
        <div class="doc-header">
          <div>
            <div class="doc-agency-name">${escapeHtml(profile.name || "Your Agency")}</div>
            <div class="doc-agency-contact">${escapeHtml(profile.contact || "")}</div>
          </div>
          <div class="doc-date">${today}</div>
        </div>
        <p class="doc-empty">Pick at least one service on the left to build the proposal.</p>
      `;
      return;
    }

    const oneTime = selected.filter((s) => s.unit === "one-time").reduce((sum, s) => sum + state[s.id].price, 0);
    const monthly = selected.filter((s) => s.unit === "per month").reduce((sum, s) => sum + state[s.id].price, 0);

    const rows = selected.map((s) => `
      <tr>
        <td>
          <div class="doc-item-name">${s.label}</div>
          <div class="doc-desc">${s.deliverable}</div>
        </td>
        <td class="doc-price">${money(state[s.id].price)}${s.unit === "per month" ? "/mo" : ""}</td>
      </tr>
    `).join("");

    let totalsHtml = "";
    if (oneTime > 0) totalsHtml += `<div class="total-line">Due to start: <strong>${money(oneTime)}</strong></div>`;
    if (monthly > 0) totalsHtml += `<div class="total-line">Then monthly: <strong>${money(monthly)}/mo</strong></div>`;

    doc.innerHTML = `
      <div class="doc-header">
        <div>
          ${profile.logo ? `<img class="doc-logo" src="${profile.logo}" alt="" />` : `<div class="doc-agency-name">${escapeHtml(profile.name || "Your Agency")}</div>`}
          <div class="doc-agency-contact">${escapeHtml(profile.contact || "")}</div>
        </div>
        <div class="doc-date">${today}</div>
      </div>
      <h2>Marketing proposal</h2>
      <div class="doc-for">Prepared for ${escapeHtml(contact ? contact + ", " : "")}${escapeHtml(business || "[Business name]")}</div>
      <table>
        <thead><tr><th>Deliverable</th><th style="text-align:right">Price</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="doc-totals">${totalsHtml}</div>
      <div class="doc-footer">
        Prepared by ${escapeHtml(profile.name || "[Your Agency]")}${profile.tagline ? " — " + escapeHtml(profile.tagline.replace(/\.+$/, "")) + "." : "."}
        Questions? ${escapeHtml(profile.contact || "[add your contact info in My Agency]")}.
      </div>
    `;
  }

  [businessInput, contactInput].forEach((el) => el.addEventListener("input", render));
  document.addEventListener("profile:updated", render);
  printBtn.addEventListener("click", () => window.print());

  render();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ========================================================================
   Prospect Tracker
   ======================================================================== */

function initTracker() {
  const summary = document.getElementById("trackerSummary");
  const body = document.getElementById("trackerBody");
  const empty = document.getElementById("trackerEmpty");
  const table = document.getElementById("trackerTable");
  const form = document.getElementById("addProspectForm");
  const nameInput = document.getElementById("t-name");
  const nicheSelect = document.getElementById("t-niche");
  const notesInput = document.getElementById("t-notes");

  NICHES.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n.id; opt.textContent = n.label;
    nicheSelect.appendChild(opt);
  });

  let prospects = Store.prospects();

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function renderSummary() {
    const counts = { total: prospects.length };
    STATUSES.forEach((s) => (counts[s.id] = prospects.filter((p) => p.status === s.id).length));
    summary.innerHTML = `
      <div class="summary-chip"><strong>${counts.total}</strong> total</div>
      ${STATUSES.map((s) => `
        <div class="summary-chip"><span class="dot" style="background:var(--status-${s.id})"></span><strong>${counts[s.id]}</strong> ${s.label}</div>
      `).join("")}
    `;
  }

  function renderTable() {
    body.innerHTML = "";
    empty.style.display = prospects.length ? "none" : "block";
    table.style.display = prospects.length ? "table" : "none";

    prospects
      .slice()
      .sort((a, b) => b.updated - a.updated)
      .forEach((p) => {
        const niche = NICHES.find((n) => n.id === p.niche);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(p.name)}</td>
          <td>${niche ? escapeHtml(niche.label) : ""}</td>
          <td>
            <select class="status-select st-${p.status}" data-id="${p.id}">
              ${STATUSES.map((s) => `<option value="${s.id}" ${s.id === p.status ? "selected" : ""}>${s.label}</option>`).join("")}
            </select>
          </td>
          <td class="t-notes">${escapeHtml(p.notes || "")}</td>
          <td class="t-date">${fmtDate(p.updated)}</td>
          <td><button class="row-delete" data-id="${p.id}" aria-label="Delete prospect">✕</button></td>
        `;
        body.appendChild(tr);
      });

    body.querySelectorAll(".status-select").forEach((sel) => {
      sel.addEventListener("change", () => {
        const p = prospects.find((x) => x.id === sel.dataset.id);
        p.status = sel.value;
        p.updated = Date.now();
        sel.className = "status-select st-" + p.status;
        persist();
      });
    });
    body.querySelectorAll(".row-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        prospects = prospects.filter((p) => p.id !== btn.dataset.id);
        persist();
      });
    });
  }

  function persist() {
    Store.saveProspects(prospects);
    renderSummary();
    renderTable();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;
    prospects.push({
      id: "p" + Date.now() + Math.random().toString(36).slice(2, 7),
      name,
      niche: nicheSelect.value,
      notes: notesInput.value.trim(),
      status: "contacted",
      updated: Date.now(),
    });
    nameInput.value = "";
    notesInput.value = "";
    nameInput.focus();
    persist();
    showToast("Prospect added");
  });

  renderSummary();
  renderTable();
}

/* ========================================================================
   Boot
   ======================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initGate();
  initTheme();
  initTabs();
  initProfile();
  initScripts();
  initProposal();
  initTracker();
});
