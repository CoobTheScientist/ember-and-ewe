# Ember & Ewe

A static website for a custom hand-knit blanket business. No build step, no
framework, no server — three HTML files, one CSS file, one JS file. That's
deliberate: it means it runs free forever on GitHub Pages and you can edit it
with any text editor.

```
ember-and-ewe/
├── index.html        Home — hero, how it works, the blanket designer, gallery
├── about.html        About Me (placeholder text for you to replace)
├── contact.html      Contact form + FAQ
├── assets/
│   ├── styles.css    All styling
│   └── app.js        Color picker, price math, form sending — CONFIG at the top
└── README.md         This file
```

---

## 1. Look at it right now

Double-click `index.html`. It opens in your browser and works.

To be safe (some browsers restrict local files), serve it instead:

```bash
cd ember-and-ewe
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## 2. Things to change before you go live

Everything configurable lives in the `CONFIG` block at the top of
`assets/app.js`. Open it — it's commented.

| What | Where |
|---|---|
| **Your email address** | `CONFIG.email` in `assets/app.js` (currently your Gmail — swap it for a business address if you'd rather not publish that one) |
| **Prices and sizes** | `CONFIG.sizes` — the page recalculates automatically |
| **Fee per extra color** | `CONFIG.extraColorFee` (currently $20) |
| **Yarn colors / hex values** | `CONFIG.yarns` |
| **Business name** | Search all three `.html` files for `Ember &amp; Ewe` and replace |
| **About Me text** | `about.html` — all placeholder, marked with tan boxes |
| **FAQ answers** | `contact.html` — two answers are marked *edit this* |
| **Gallery photos** | `index.html`, in the `#gallery` section — instructions in a comment there |

### Swapping the fake blankets for real photos

The colored rectangles are CSS, not images. To use a real photo:

```html
<!-- before -->
<div class="blanket" data-colors="#4F7942,#E8B93B" aria-hidden="true"></div>

<!-- after -->
<img src="assets/meadow-throw.jpg" alt="Green and yellow knit throw" class="blanket">
```

Put the image files in `assets/`. Resize them to about 1200px wide first —
large photos are the number one cause of slow sites.

---

## 3. Put it online, free, on GitHub Pages

GitHub Pages hosts static sites for free with HTTPS included. No credit card.

**One-time setup**

1. Make a free account at [github.com](https://github.com).
2. Click **+ → New repository**. Name it `ember-and-ewe`. Set it **Public**
   (Pages is free on private repos only with a paid plan). Don't add a README —
   you already have one. Click **Create**.
3. Back in your terminal:

```bash
cd ember-and-ewe
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ember-and-ewe.git
git push -u origin main
```

4. In the repo on github.com: **Settings → Pages**. Under *Source*, choose
   **Deploy from a branch**, branch `main`, folder `/ (root)`. **Save**.
5. Wait about a minute. Your site is live at
   `https://YOUR-USERNAME.github.io/ember-and-ewe/`

**Every update after that**

```bash
git add .
git commit -m "Updated the About page"
git push
```

The live site refreshes in under a minute.

> Don't want to use the command line? On the repo page use **Add file → Upload
> files**, drag the whole folder in, and commit. Same result.

### Other free hosts (all equally good)

- **Netlify** — drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Live in ten seconds, no git required.
- **Cloudflare Pages** — connect the GitHub repo, free, very fast.

### A custom domain (~$12/year, optional but worth it)

`emberandewe.com` reads better than a github.io URL. Buy one at Namecheap,
Porkbun, or Cloudflare, then follow
[GitHub's custom domain guide](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
Hosting stays free; you're only paying for the name.

---

## 4. Make the forms actually send email

Right now, with `CONFIG.formspreeId` empty, both forms open the visitor's email
app with everything pre-filled. That works, but some people abandon at that
step. To get real submissions in your inbox:

1. Sign up free at [formspree.io](https://formspree.io) (50 submissions/month).
2. Create a new form, pointing at your email.
3. Copy the ID out of the endpoint URL — `https://formspree.io/f/**xayzabcd**`.
4. Paste it into `CONFIG.formspreeId` in `assets/app.js`.
5. Push. Submit a test order to yourself and confirm it lands.

Alternatives if you outgrow it: [Web3Forms](https://web3forms.com) (free,
unlimited), [Basin](https://usebasin.com), [Netlify Forms](https://docs.netlify.com/forms/setup/)
(free tier, only if you host on Netlify).

---

## 5. Accepting payments

A static site can't process cards itself — there's no server to keep a secret
key on. That's fine. Every option below works by sending the customer to the
payment company's own secure page, which is also the safest arrangement for
you: **you never touch card numbers.**

Custom made-to-order work is a bit different from off-the-shelf retail. Pick
based on how you want to run it:

### Option A — Invoice after confirming (recommended to start)

This is what the site does today. Customer submits an order request, you check
you can actually make it, then you send a payment link.

- **Stripe Invoicing** — free to send, 2.9% + 30¢ when paid.
- **PayPal Invoicing** — same idea, ~3.5%.
- **Square Invoices** — same.

Best fit for custom work: no refund headaches from orders you can't fulfill,
and you can quote a real delivery date before taking money.

### Option B — Stripe Payment Links (buy now, on the site)

Free, no coding, no server. In the
[Stripe dashboard](https://dashboard.stripe.com/payment-links) create one link
per size (Throw / Twin / Queen), then paste the URLs into
`CONFIG.stripeLinks` in `assets/app.js`. A **"Pay now by card"** button
appears under the order form automatically — the code for it is already there.

To capture which colors they picked, add a custom field to the payment link in
Stripe (Dashboard → the link → *Custom fields* → add a text field called
"Colors"), and tell customers to copy their selection in. Slightly clunky, but
free and instant.

Fees: 2.9% + 30¢ per charge. Payouts hit your bank in ~2 days.

### Option C — A real store platform

If you get busy enough that inventory, shipping labels, and tax tracking start
eating your evenings:

- **Shopify** (~$39/mo) — has native "product options" so customers pick colors as part of checkout. Best fit for custom work, worst fit for a low-volume budget.
- **Etsy** — no monthly fee, ~6.5% + listing fees, but brings its own buyers. Many makers run Etsy *and* a site like this one, and link between them.
- **Square Online** — free tier with a Square-branded subdomain.

### My suggestion

Launch with **Option A**. It costs nothing, it fits made-to-order work, and it
lets you talk to your first customers before locking anything in. Add
**Option B** once the same questions start repeating and you want the site to
close the sale on its own. Only look at Option C if orders outgrow your
evenings.

### Two practical notes

- **Deposits.** For a Queen at $325, consider a 50% deposit up front and the
  balance before shipping. Stripe and PayPal both support this with two
  invoices. It protects you against abandoned custom orders.
- **Taxes.** Selling goods usually means sales tax obligations in your state,
  and this becomes real income. Worth a one-time conversation with an
  accountant once orders are steady — cheaper than fixing it later.

---

## 6. Before you tell people about it

- [ ] Real photos in the gallery
- [ ] About page written
- [ ] `CONFIG.email` is the address you want public
- [ ] Submitted a test order and a test contact message, and both arrived
- [ ] Prices reflect your yarn cost **and** your time (make-to-order pricing is
      usually 2–3× materials — the placeholder prices are a starting guess, not
      a recommendation)
- [ ] Opened the site on your phone
- [ ] Decided your return/damage policy and written it into the FAQ

---

## Notes on the code

- No dependencies, no build step. Edit a file, refresh, done.
- The blanket previews are generated with CSS gradients — `stripes()` in
  `app.js` builds a repeating gradient from the chosen hex values, and a
  crossing-diagonal overlay in `styles.css` fakes the knit stitch texture.
- The three-color limit is `CONFIG.maxColors`. Change it and the counter,
  the disabling, the price math, and the announcements all follow.
- Colors are stored in pick order, so the stripe sequence matches the order
  the customer clicked them in.
- Keyboard and screen-reader accessible: swatches are real buttons with
  `aria-pressed`, selections are announced through a live region, and there's
  a skip link.
