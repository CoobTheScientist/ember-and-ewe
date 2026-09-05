/* ==========================================================================
   E&E Knits — site behavior
   Plain JS, no build step, no dependencies. Works on any static host.
   ==========================================================================

   ▼▼▼ EVERYTHING YOU NEED TO EDIT IS IN THE CONFIG BLOCK BELOW ▼▼▼
*/

const CONFIG = {
  // Where order requests and contact messages go.
  email: "yacob.ahmad98@gmail.com",

  // Formspree form ID — makes the forms send real email instead of opening
  // the customer's mail app. Free tier: 50 submissions/month.
  //   1. Sign up at https://formspree.io  2. New Form  3. copy the ID from
  //      the endpoint URL (https://formspree.io/f/XXXXXXX  ->  "XXXXXXX")
  // Leave it "" and the forms fall back to opening a pre-filled email.
  formspreeId: "",

  // Optional: Stripe Payment Links, one per size. Create them at
  // https://dashboard.stripe.com/payment-links (no coding, no server).
  // Leave "" to hide the Pay Now button and just take order requests.
  stripeLinks: {
    throw: "",
    twin: "",
    queen: "",
  },

  // Pricing. Change freely — the page recalculates automatically.
  sizes: {
    throw: { name: "Throw",   dims: '50" × 60"',  price: 145 },
    twin:  { name: "Twin",    dims: '66" × 90"',  price: 235 },
    queen: { name: "Queen",   dims: '90" × 90"',  price: 325 },
  },

  // Added for each color beyond the first (extra yarn + color changes).
  extraColorFee: 20,

  // Max colors per blanket.
  maxColors: 3,

  // The eight yarn options.
  yarns: [
    { id: "blue",   name: "Blue",   hex: "#3A6EA5" },
    { id: "green",  name: "Green",  hex: "#4F7942" },
    { id: "yellow", name: "Yellow", hex: "#E8B93B" },
    { id: "red",    name: "Red",    hex: "#A8323B" },
    { id: "black",  name: "Black",  hex: "#26262B" },
    { id: "brown",  name: "Brown",  hex: "#7A5230" },
    { id: "white",  name: "White",  hex: "#F4F1EA" },
    { id: "purple", name: "Purple", hex: "#6B4C8A" },
  ],
};

/* ▲▲▲ END OF CONFIG — you shouldn't need to change anything below ▲▲▲ */

const money = (n) => "$" + n.toFixed(2).replace(/\.00$/, "");
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/**
 * Build a repeating stripe background from the chosen yarn colors.
 * One color reads as a solid; two or three become even bands.
 */
function stripes(hexes, band = 34) {
  if (!hexes.length) return "";
  if (hexes.length === 1) return hexes[0];
  const stops = hexes
    .map((hex, i) => `${hex} ${i * band}px, ${hex} ${(i + 1) * band}px`)
    .join(", ");
  return `repeating-linear-gradient(175deg, ${stops})`;
}

/** Paint any .blanket element with a set of colors. */
function paintBlanket(el, hexes) {
  el.style.background = hexes.length ? stripes(hexes) : "";
  el.classList.toggle("has-colors", hexes.length > 0);
  const fringe = $(".blanket__fringe", el);
  if (fringe) {
    $$("i", fringe).forEach((strand, i) => {
      strand.style.background = hexes.length ? hexes[i % hexes.length] : "transparent";
    });
  }
}

/** Give every .blanket a fringe row and (for the gallery) fixed colors. */
function initBlankets() {
  $$(".blanket").forEach((el) => {
    if (!$(".blanket__fringe", el)) {
      const fringe = document.createElement("div");
      fringe.className = "blanket__fringe";
      fringe.setAttribute("aria-hidden", "true");
      fringe.innerHTML = "<i></i>".repeat(26);
      el.appendChild(fringe);
    }
    const preset = el.dataset.colors;
    if (preset) paintBlanket(el, preset.split(",").map((s) => s.trim()));
  });
}

/* ------------------------------------------------------------------------
   The blanket builder (home page only)
   ---------------------------------------------------------------------- */

function initBuilder() {
  const root = $("#builder");
  if (!root) return;

  const selected = [];                       // yarn ids, in the order picked
  let size = "throw";

  const swatchWrap  = $("#swatches", root);
  const chosenWrap  = $("#chosen", root);
  const hintEl      = $("#colorHint", root);
  const preview     = $("#previewBlanket", root);
  const previewText = $("#previewCaption", root);
  const liveRegion  = $("#builderLive", root);
  const submitBtn   = $("#orderSubmit", root);
  const payBtn      = $("#payNow", root);
  const form        = $("#orderForm", root);

  const yarnById = (id) => CONFIG.yarns.find((y) => y.id === id);
  const hexes    = () => selected.map((id) => yarnById(id).hex);
  const names    = () => selected.map((id) => yarnById(id).name);

  /* --- Sizes -------------------------------------------------------- */
  $("#sizes", root).innerHTML = Object.entries(CONFIG.sizes)
    .map(
      ([id, s], i) => `
      <label class="size">
        <input type="radio" name="size" value="${id}" ${i === 0 ? "checked" : ""}>
        <span class="size__name">${s.name}</span>
        <span class="size__dims">${s.dims}</span>
        <span class="size__price">${money(s.price)}</span>
      </label>`
    )
    .join("");

  $$('input[name="size"]', root).forEach((input) =>
    input.addEventListener("change", () => {
      size = input.value;
      render();
    })
  );

  /* --- Swatches ----------------------------------------------------- */
  swatchWrap.innerHTML = CONFIG.yarns
    .map(
      (y) => `
      <button type="button" class="swatch" data-yarn="${y.id}"
              aria-pressed="false" aria-label="${y.name}">
        <span class="swatch__chip" style="background-color:${y.hex}"></span>
        <span class="swatch__name">${y.name}</span>
      </button>`
    )
    .join("");

  swatchWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".swatch");
    if (!btn || btn.disabled) return;
    toggle(btn.dataset.yarn);
  });

  chosenWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip__remove");
    if (btn) toggle(btn.dataset.yarn);
  });

  function toggle(id) {
    const at = selected.indexOf(id);
    if (at > -1) {
      selected.splice(at, 1);
      announce(`${yarnById(id).name} removed.`);
    } else if (selected.length < CONFIG.maxColors) {
      selected.push(id);
      announce(`${yarnById(id).name} added.`);
    } else {
      announce(`You can pick at most ${CONFIG.maxColors} colors. Remove one first.`);
      return;
    }
    render();
  }

  function announce(msg) {
    if (!liveRegion) return;
    const left = CONFIG.maxColors - selected.length;
    liveRegion.textContent = `${msg} ${selected.length} of ${CONFIG.maxColors} chosen, ${left} remaining.`;
  }

  /* --- Price -------------------------------------------------------- */
  function priceParts() {
    const base = CONFIG.sizes[size].price;
    const extras = Math.max(0, selected.length - 1) * CONFIG.extraColorFee;
    return { base, extras, total: base + extras };
  }

  /* --- Render ------------------------------------------------------- */
  function render() {
    const full = selected.length >= CONFIG.maxColors;

    // Swatch states
    $$(".swatch", swatchWrap).forEach((btn) => {
      const on = selected.includes(btn.dataset.yarn);
      btn.setAttribute("aria-pressed", String(on));
      btn.disabled = full && !on;
    });

    // Chosen chips
    chosenWrap.innerHTML = selected.length
      ? selected
          .map((id) => {
            const y = yarnById(id);
            return `<span class="chip">
              <span class="chip__dot" style="background:${y.hex}"></span>${y.name}
              <button type="button" class="chip__remove" data-yarn="${y.id}"
                      aria-label="Remove ${y.name}">×</button>
            </span>`;
          })
          .join("")
      : `<span class="chosen__empty">No colors picked yet — choose up to ${CONFIG.maxColors}.</span>`;

    hintEl.textContent = full
      ? `${CONFIG.maxColors} of ${CONFIG.maxColors} — remove one to swap`
      : `${selected.length} of ${CONFIG.maxColors} chosen`;
    hintEl.classList.toggle("is-full", full);

    // Preview
    paintBlanket(preview, hexes());
    previewText.textContent = selected.length
      ? `${CONFIG.sizes[size].name} · ${names().join(" + ")}`
      : `${CONFIG.sizes[size].name} · awaiting colors`;

    // Summary
    const p = priceParts();
    $("#sumSize", root).textContent  = `${CONFIG.sizes[size].name} (${CONFIG.sizes[size].dims})`;
    $("#sumBase", root).textContent  = money(p.base);
    $("#sumColors", root).textContent = selected.length
      ? names().join(", ")
      : "—";
    $("#sumExtras", root).textContent = p.extras ? "+ " + money(p.extras) : "included";
    $("#sumTotal", root).textContent  = money(p.total);

    // Buttons
    submitBtn.disabled = selected.length === 0;
    submitBtn.textContent = selected.length
      ? `Request this blanket — ${money(p.total)}`
      : "Pick at least one color";

    const link = CONFIG.stripeLinks[size];
    if (payBtn) {
      payBtn.hidden = !link || selected.length === 0;
      if (link) payBtn.href = link;
    }

    // Hidden fields so the order details ride along with the form
    $("#fSize", root).value   = `${CONFIG.sizes[size].name} (${CONFIG.sizes[size].dims})`;
    $("#fColors", root).value = names().join(", ");
    $("#fPrice", root).value  = money(p.total);
  }

  /* --- Submit ------------------------------------------------------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selected.length) return;
    const p = priceParts();
    const fd = new FormData(form);
    const body = [
      `Size:    ${CONFIG.sizes[size].name} (${CONFIG.sizes[size].dims})`,
      `Colors:  ${names().join(", ")}`,
      `Price:   ${money(p.total)}  (${money(p.base)} base${p.extras ? " + " + money(p.extras) + " extra colors" : ""})`,
      ``,
      `Name:    ${fd.get("name") || ""}`,
      `Email:   ${fd.get("email") || ""}`,
      ``,
      `Notes:`,
      `${fd.get("notes") || "(none)"}`,
    ].join("\n");

    sendForm({
      form,
      subject: `Blanket order — ${CONFIG.sizes[size].name}, ${names().join(" + ")}`,
      body,
      statusEl: $("#orderStatus", root),
      okMessage: "Order request sent. I'll reply within 2 business days with a payment link and a start date.",
    });
  });

  render();
}

/* ------------------------------------------------------------------------
   Shared form sender — Formspree if configured, pre-filled email otherwise
   ---------------------------------------------------------------------- */

async function sendForm({ form, subject, body, statusEl, okMessage }) {
  const setStatus = (msg, ok) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "form-status " + (ok ? "is-ok" : "is-err");
  };

  if (!CONFIG.formspreeId) {
    // No form backend yet — open the visitor's mail app with it all filled in.
    const href =
      `mailto:${CONFIG.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setStatus("Opening your email app with the details filled in — just hit send.", true);
    return;
  }

  const btn = $('button[type="submit"]', form);
  const label = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

  try {
    const data = new FormData(form);
    data.set("_subject", subject);
    data.set("message", body);
    const res = await fetch(`https://formspree.io/f/${CONFIG.formspreeId}`, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Formspree responded " + res.status);
    form.reset();
    setStatus(okMessage, true);
  } catch (err) {
    setStatus(
      `Something went wrong sending that. Please email me directly at ${CONFIG.email}.`,
      false
    );
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = label; }
  }
}

/* ------------------------------------------------------------------------
   Contact page form
   ---------------------------------------------------------------------- */

function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const body = [
      `Name:  ${fd.get("name") || ""}`,
      `Email: ${fd.get("email") || ""}`,
      `Topic: ${fd.get("topic") || ""}`,
      ``,
      `${fd.get("notes") || ""}`,
    ].join("\n");

    sendForm({
      form,
      subject: `Website inquiry — ${fd.get("topic") || "General question"}`,
      body,
      statusEl: $("#contactStatus"),
      okMessage: "Thanks! Your message is on its way — I usually reply within 2 business days.",
    });
  });
}

/* ---------------------------------------------------------- Email links */

function initEmailLinks() {
  $$("[data-email-link]").forEach((el) => {
    el.href = `mailto:${CONFIG.email}`;
    if (!el.textContent.trim()) el.textContent = CONFIG.email;
  });
  $$("[data-email-text]").forEach((el) => { el.textContent = CONFIG.email; });
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
}

document.addEventListener("DOMContentLoaded", () => {
  initBlankets();
  initBuilder();
  initContactForm();
  initEmailLinks();
});
