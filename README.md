# PIL.AGRIGEA

> The observation deck. An iceberg of inference, a tree of pills, a skool of fishes.

`www.pilagrigea.com` — a static site that distills the **Iceberg** (an
inference engine with five layers) and the **Tree** (a pharmacology of five
pills) into an interactive **skool of fishes**: a network of posts, each a
structured fishbone, swimming through the iceberg at a depth, tinted by a
pill, carried by a current.

- **Astro 5** + **React islands** + **TypeScript**
- Static HTML output — zero runtime backend, zero tracking
- Hosted on **Cloudflare Pages**
- The repo is the CMS: every fish is data in `src/data/fishes.ts`

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
```

Build and preview:

```bash
npm run build    # → dist/
npm run preview  # http://localhost:4321
```

## Pages

| route | what it is |
| --- | --- |
| `/` | The deck — hero, interactive skool network, iceberg descent, fishbone anatomy, tree teaser |
| `/concept/` | The iceberg — five layers of the inference engine |
| `/tree/` | The tree — interactive pharmacology of the pills |
| `/fishes/` | The skool — every fish, grouped by depth |
| `/fishes/<id>/` | A single fish — fishbone anatomy, pill, related fish, discussion |
| `/contribute/` | How to add a fish and activate comments |
| `/about/` | What PIL.AGRIGEA is |

## Deploy to Cloudflare Pages

1. Create a public GitHub repository (e.g. `Pilagrigea/pilagrigea.com`) and push this directory.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
   Pick the repo, framework preset **Astro**:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy. Done — no server, no database, no runtime.

No GitHub? Deploy with wrangler instead:

```bash
npx wrangler login
npx wrangler pages deploy dist --project-name pilagrigea
```

## Comments (giscus)

Comments are off until the public repo exists. To activate:

1. Create the public repo and enable **Discussions** on it.
2. Install the [giscus app](https://github.com/apps/giscus) and open [giscus.app](https://giscus.app).
3. Select the repo, mapping = *pathname*, create a Discussions category.
4. Set the four values as build variables (Cloudflare Pages → Settings → Environment variables, or a local `.env`):

```
GISCUS_REPO=Pilagrigea/pilagrigea.com
GISCUS_REPO_ID=<from giscus.app>
GISCUS_CATEGORY=<name of your category>
GISCUS_CATEGORY_ID=<from giscus.app>
```

5. Rebuild. Every fish page gains a comment thread; without the variables the
   site ships a `// DISCUSSION OFFLINE` placeholder.

## Community

- **Repository** — github.com/Pilagrigea/pilagrigea.com (create it)
- **Discussions** — propose fish, argue with pills, split a current
- **Contributing** — see [CONTRIBUTING.md](./CONTRIBUTING.md)

## Structure

```
src/
  data/ontology.ts      # iceberg layers, pills, tree parts, schools, domains
  data/fishes.ts        # THE SCHOOL — every fish, one block each
  layouts/              # BaseLayout (shell), PostLayout (fish page)
  components/           # SkoolNetwork, TreeExplorer (islands) + astro components
  pages/                # index, concept, tree, fishes, contribute, about, 404
```

PIL.AGRIGEA — `SELF.HOSTED // NO.DEPENDENCIES // OBSERVE → INFER → ANALYZE → DISTILL`
