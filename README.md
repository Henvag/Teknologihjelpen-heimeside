# teknologihjelpen.no

The website for Teknologihjelpen (enkeltpersonforetak, org.nr. 829 416 042), the company behind
[Tenant Access](https://tenantaccess.me).

Plain static HTML and CSS, no build step. Open `index.html` in a browser to preview.

- `index.html`: the whole site, one page in Norwegian (bokmål).
- `style.css`: follows the type and shape rules in Tenant Access's `DESIGN.md`; the accent is the
  burgundy from the original logo.
- `info-om-oss/info.html`, `kontakt-oss/kontakt.html`: redirects from the old site's URLs.

## Deploy

Any static host works. Since the domain's DNS is on Cloudflare, Cloudflare Pages is the simplest:
connect this repo, leave the build command empty, set the output directory to `/`, then add
`teknologihjelpen.no` as a custom domain.
