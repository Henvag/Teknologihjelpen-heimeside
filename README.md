# teknologihjelpen.no

The website for Teknologihjelpen (enkeltpersonforetak, org.nr. 829 416 042), the company behind
[Tenant Access](https://tenantaccess.me).

Plain static HTML and CSS, no build step. Open `index.html` in a browser to preview.

- `index.html`: the whole site, one page in Norwegian (bokmål).
- `style.css`: burgundy from the original logo, Archivo (expanded) for headlines and Schibsted Grotesk
  for text, the same text face as Tenant Access.
- `script.js`: the hero figure, five tangled cables that sort themselves into their ports when they
  come into view. Reduced motion shows the tidy state.
- `bilder/logo/`: the cable-tie logo (header lockup, 512 px logo for structured data, 1200 x 630 link preview
  image). Source files and the generator live outside this repo in the project's logo folder.
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`: browser and home-screen icons.
- `info-om-oss/info.html`, `kontakt-oss/kontakt.html`: redirects from the old site's URLs.

## Deploy

Any static host works. Since the domain's DNS is on Cloudflare, Cloudflare Pages is the simplest:
connect this repo, leave the build command empty, set the output directory to `/`, then add
`teknologihjelpen.no` as a custom domain.
