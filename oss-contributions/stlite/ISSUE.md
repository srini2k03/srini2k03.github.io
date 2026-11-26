**Title:** Theme font with a URL (`"Family:https://..."`) crashes the app in HelmetDispatcher before it renders

### Summary
Since Streamlit added custom theme fonts, `config.toml` accepts a font with a stylesheet URL, e.g.
`font = "Inter:https://fonts.googleapis.com/css2?family=Inter"`. Passing the same value to stlite through
`streamlitConfig` (`"theme.font"`, `"theme.headingFont"` or `"theme.codeFont"`) stops the app from
rendering: the page stays on the loading state and the console shows an error from react-helmet.

### Steps to reproduce
Live repro: https://srini2k03.github.io/repro/stlite-theme-font.html (DevTools → Console).
`?version=latest` tries another release; `?url=0` passes only the family name, which works.

The essential part:

```js
mount({
  entrypoint: "app.py",
  files: { "app.py": 'import streamlit as st\nst.title("Hello from stlite")\n' },
  streamlitConfig: {
    "theme.font": "Inter:https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap",
  },
}, document.getElementById("root"));
```

### Expected
The title renders, with the font stylesheet loaded (as with `streamlit run` and the same config).

### Actual
The app never renders (1.10.0 and 1.12.3). Console on 1.10.0 (bundled Streamlit 1.62.0, headless Chromium):

```
TypeError: Cannot read properties of undefined (reading 'add')
    at HelmetDispatcher.init (.../@stlite/browser@1.10.0/build/index-DWKuW7lB-DhdO9tHE.js:7480:6)
    at HelmetDispatcher.render (.../@stlite/browser@1.10.0/build/index-DWKuW7lB-DhdO9tHE.js:7483:15)
```

Passing only the family name (`"theme.font": "Inter"`) and loading the stylesheet with a normal
`<link>` tag works, which is my current workaround.

### Notes
- The stack trace suggests the `<Helmet>` that Streamlit's frontend uses to inject the font
  stylesheet is rendered without a `HelmetProvider` context in stlite's mount path, so the
  dispatcher's `helmetInstances` is undefined.
- Found while deploying a Streamlit dashboard with stlite on GitHub Pages; the failing and fixed
  CI runs are public:
  - failing: https://github.com/srini2k03/olist-ecommerce-analytics/actions/runs/45367884918
  - workaround: https://github.com/srini2k03/olist-ecommerce-analytics/blob/main/scripts/build_site.py
    (`streamlit_theme()` strips the URL part)

Environment: reproduced on @stlite/browser 1.10.0 (Streamlit 1.62.0 wheel; headless Chromium via
Playwright 1.64.1 on an Ubuntu 24.04 GitHub runner) and on the current release, 1.12.3, in desktop
Chrome. With the same page and `?url=0` (family name only), the title renders on 1.12.3.
