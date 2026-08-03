# Contributing

The site is a static site and the repository is the CMS. There is no admin
panel — the school grows by pull request.

## Add a fish

1. Open `src/data/fishes.ts`.
2. Copy any existing fish block and fill every field.
3. Run `npm run build` — the page is generated at `/fishes/<your-id>/`.
4. Open a pull request.

### Fish fields

| field | meaning |
| --- | --- |
| `id` | URL slug — kebab-case, unique |
| `emoji` | one glyph that swims with the post |
| `title` / `subtitle` | the hook |
| `domain` | `tech` · `culture` · `economy` · `geopolitics` |
| `depth` | `SURFACE` · `MID-WATER` · `ABYSSAL` · `HADAL` |
| `layer` | the iceberg layer the fish lives in (`MATRIX` · `FRAMES` · `PILLS` · `DEEP` · `SOURCE`) |
| `pill` | `blue` · `red` · `black` · `white` · `grey` |
| `schools` | one or more currents: `neural-net` · `memetic-engine` · `attention-mine` · `supply-chain` |
| `date` | ISO date — used for ordering |
| `excerpt` | one-line teaser for cards and `<meta>` |
| `anatomy.tail` | observed effects — what is on the surface |
| `anatomy.ribs` | four variables: `UPSTREAM_CAUSE` · `DOWNSTREAM_EFFECT` · `HIDDEN_VARIABLE` · `REFLEX_ACTION`, each with a value |
| `anatomy.spine` | the mechanism — the thread connecting head to tail |
| `anatomy.head` | the distilled conclusion |
| `links` | ids of real fish this one relates to, plus a label |

### What makes a good fish

- Every rib filled. The spine must connect head to tail — effects traced to
  variables, variables to a mechanism, mechanism to a paradigm.
- Links point to existing fish ids. The school is a network, not a pile.
- One dominant pill, one dominant layer.
- Pills are hypotheses, not facts. Write as if you could be wrong — you are,
  eventually.

## Discussions

Anything that should become a post starts as a GitHub Discussion. Argue with
pills, split a current, propose a fish before you write it.

## Comments (giscus)

Comments activate once all four `GISCUS_*` build variables are set:

1. Create the public repo and enable **Discussions**.
2. Install the [giscus app](https://github.com/apps/giscus), open
   [giscus.app](https://giscus.app), select the repo, mapping = *pathname*,
   and create a Discussions category.
3. Set `GISCUS_REPO`, `GISCUS_REPO_ID`, `GISCUS_CATEGORY`,
   `GISCUS_CATEGORY_ID` (Cloudflare Pages environment variables or a local
   `.env`), and rebuild.

Without them the site ships a `// DISCUSSION OFFLINE` placeholder on every
fish page.

`OBSERVE → INFER → ANALYZE → DISTILL — then write it down and open a PR.`
