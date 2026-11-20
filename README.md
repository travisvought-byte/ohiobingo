# ohiobingo.org

Ohio Bingo: the Ohio site for players, halls and distributors, run by Veteran Home Guardians. Pages for players, halls (listings, promotion, featured events, websites and community partnership), distributors, Ohio bingo law, causes and access.

This repository is the master copy of the site. The site is hosted on Wix as a headless site
("Ohio Bingo", site id `e246b7de-4fac-46bb-8794-6b72ccaa5636`), which serves exactly the files here. Make changes here, then publish.

Copied from Wix on November 20, 2026, byte for byte. Before that the pages lived only in Wix.

## What lives elsewhere

This site links to the guides and finders rather than copying them, so nothing is kept twice:

- Finding a game: the Ohio Bingo Finder at findbingo.org/ohio, built with its data in `travisvought-byte/vhg-veteran-resident-guide` (`scripts/bingo_site.py`). The ZIP box on the home page sends people there.
- Featured events ($100) and the national finder: findbingo.org, same repository (`data/findbingo-events.json`, `docs/FINDBINGO.md`).
- The Veteran Home Guardians website: `travisvought-byte/vethomeguard` (vethomeguard.org).

## Files

- The pages are plain HTML at the top level, with `site.css` and small scripts beside them.
- `js/wix/` is the Wix forms client, as Wix's headless kit installs it. `js/wix/config.js` holds this
  site's Wix client id. The forms on the pages send their entries to Wix Forms through it.
- Wix serves its own `robots.txt` and `/sitemap.xml` in place of the files here. Keep them anyway.
- Because Wix's own `/sitemap.xml` for this site answers "not found," the page list is also published as
  `site-pages.xml`. That is the address to give Google Search Console. Keep the two files the same.
- `assets/share.png` is the picture shown when a page is shared (1200 by 630). Pages load it from this repository on GitHub (raw.githubusercontent.com), so it is kept in one place and is not uploaded to Wix.

## Publishing to Wix

Merging to `main` does not change the live site by itself.

- **Through Claude's Wix connection.** The changed files are sent, and the live copies are read back and
  compared with this repository.
- **From GitHub.** `.github/workflows/publish.yml`, run by hand from the Actions tab, runs
  `scripts/publish_wix.py` (the same script as the Ohiomom repository). **check** compares the live site
  with this repository and changes nothing. **publish** sends the files, reads the site back and compares
  again; it never deletes a live file and only publishes from `main`. It needs the repository secrets
  `WIX_API_KEY` and `WIX_ACCOUNT_ID`; until they are added it says so and does nothing.
- **From a shell.** `WIX_TOKEN=$(npx @wix/cli@latest token) python3 scripts/publish_wix.py --check`, then
  `--publish`, after `npx @wix/cli@latest login`.
