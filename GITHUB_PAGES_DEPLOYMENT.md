# Manual GitHub Pages Deployment

This package contains the existing static estimator at the repository root and the existing four-slide project carousel at `carousel/`. It has no server, database, form endpoint, build step, or login requirement.

## Publish

1. Create a **public** GitHub repository. A clear suggested name is `bok-outdoor-living-planning-tool`.
2. Upload every file and folder from this package to the repository root, preserving the `carousel/images/` folder structure exactly.
3. In the repository, open **Settings → Pages**. Select **Deploy from a branch**, choose `main`, choose `/(root)`, and save.
4. After the Pages deployment is shown as live, use these paths:

| Tool | Public path |
|---|---|
| Estimator | `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/` |
| Four-slide carousel | `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/carousel/` |

## Embed after Pages is live

Replace only the capitalized placeholders below with the actual GitHub username and repository name.

```html
<iframe
  src="https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/"
  title="Outdoor Living Planning Tool"
  width="100%"
  height="1500"
  style="border:0; display:block; width:100%; max-width:1260px; margin:0 auto;"
  loading="lazy"
  allow="clipboard-write"
></iframe>
```

```html
<iframe
  src="https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/carousel/"
  title="Featured Outdoor Living Projects"
  width="100%"
  height="1200"
  style="border:0; display:block; width:100%; max-width:1260px; margin:0 auto;"
  loading="lazy"
></iframe>
```

## Final checks

Open both public URLs in a private/incognito browser window. Confirm that the estimator works, the carousel advances and responds to arrow keys, all four images load, and neither page presents a login screen. Then check the published page’s response headers for the absence of `X-Frame-Options` and a restrictive CSP `frame-ancestors` directive before placing the embeds on a live website.
