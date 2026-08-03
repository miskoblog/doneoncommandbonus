# Landed — Client Acquisition Toolkit

Free launch bonus for **Done On Command** buyers. Done On Command delivers the
finished marketing work (pages, video, email, social) — but its own sales page
says finding and closing the client is on the buyer. This toolkit is the piece
that fills that gap: find a prospect, price the pitch, and track the close.

Three tools, one static page, zero setup:

- **How to Use** — a plain-language walkthrough of every tool and button,
  shown first on load.
- **Outreach Scripts** — pick a prospect's niche and the service you're
  pitching, get a ready-to-send cold email or DM.
- **Pricing Proposal** — pick services and set your price inside verified
  market ranges, get a clean one-page proposal you can print or save as a PDF.
- **Prospect Tracker** — a lightweight list to track who you've contacted,
  who got a proposal, and who's closed.

No AI API, no accounts, no backend. Everything (agency profile, prospects)
is saved to the browser's local storage.

## Access

The page is gated behind a password (checked client-side against a SHA-256
hash in `app.js` — a soft deterrent to keep it off search engines and casual
visitors, not real security; anyone with dev tools could bypass it). The
password itself isn't stored in this repo since it's public — get it from
whoever's distributing the bonus. Once entered, it's remembered on that
browser via `localStorage` so it isn't asked for again.

To change the password: replace `GATE_HASH` in `app.js` with the SHA-256 hex
digest of the new password, e.g. `echo -n "newpassword" | shasum -a 256`.

## Run it locally

Any static file server works, e.g.:

```
npx http-server -p 8420
```

Then open `http://localhost:8420/`.

## Deploy it

It's three static files (`index.html`, `styles.css`, `app.js`) — drop them on
any static host (Netlify, Vercel, GitHub Pages, S3, etc.) with no build step.
