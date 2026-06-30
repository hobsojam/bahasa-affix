# Bahasa Affix Explorer

An interactive study tool for learning Bahasa Indonesia affixes. Enter or browse a root word and see its meaning alongside all the common derived forms — prefixed, suffixed, and circumfixed — with notes on what each form means and how it is used.

## Goals

- Show a root word with its English gloss
- Display all applicable affix combinations with their meanings
- Make clear which combinations are valid/common and which are not
- No LLM at runtime — all data is pre-curated and static

## UI Design

### Screen layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Bahasa Affix Explorer                                          │
├─────────────────────────────────────────────────────────────────┤
│  [ menulis                                                    ] │
│    ↳ tulis  (via me-)  — to write                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  tulis  (verb)                                                  │
│  to write                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Derived forms                                                  │
├──────────────┬──────────────────────────────────────────────────┤
│  menulis     │  to write (active, actor focus)                  │
│  me-         │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│  ditulis     │  to be written (passive, patient focus)          │
│  di-         │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│  tulisan     │  writing, text, script (result noun)             │
│  -an         │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│  penulis     │  writer, author (agent noun)                     │
│  pe-         │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│  penulisan   │  the act of writing (process noun)               │
│  pe-...-an   │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│  menuliskan  │  to write something down (causative)             │
│  me-...-kan  │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│  menulisi    │  to write on/over a surface                      │
│  me-...-i    │                                                  │
├──────────────┼──────────────────────────────────────────────────┤
│  bertulis    │  (not commonly used)              ← dimmed       │
│  ber-        │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Design decisions

**English only.** No German glosses — English translations are better covered by the source data (FreeDict id-en).

**Root word at the top.** The root and its base meaning are always shown above the derived forms table, as the anchor for everything below.

**Derived forms are grouped by output type**, not by morphological category (prefix/suffix/circumfix), because learners think "how do I say *writer*?" not "what prefix does this take?":

| Group | Affixes |
|-------|---------|
| Verb forms | `me-`, `di-`, `ber-`, `ter-`, `me-...-kan`, `me-...-i`, `ber-...-an`, `-kan`, `-i` |
| Noun forms | `pe-`, `-an`, `pe-...-an`, `ke-...-an` |
| Modifiers  | `ke-`, `se-`, `-nya`, `-lah` |

`ter-` is placed in **Verb forms** even though its stative reading often translates as an adjective in English (e.g. *tertulis* = "written"). This is linguistically correct — `ter-` is a verbal prefix in Indonesian grammar. The English-adjective feeling is a translation artefact. The affix notes field records this ambiguity. If annotations ever become rich enough to handle per-word overrides, the grouping can be revisited.

**Three annotation states per affix slot:**
- *Has meaning* — shown normally with its English gloss
- *Marked as unused* — shown dimmed with a note such as "(not commonly used)"; this is an explicit claim, not a gap
- *Not yet annotated* — hidden by default; these are prompts to fill in, not claims that the form is invalid

This avoids false confidence: an empty slot means "we haven't decided yet", not "this form doesn't exist".

**Search works on derived forms too.** All affixed forms are computed at startup from the root list using the nasal assimilation rules. A reverse index maps every derived form back to its root, so searching "menulis" or "menuliskan" both surface the *tulis* card. Ambiguous derivations (where the same surface form could come from different roots) show all candidates.

## Data Sources

| File | Content | License | Origin |
|------|---------|---------|--------|
| `data/words.json` | 10,041 root words with English glosses | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Derived from [FreeDict eng-ind](https://freedict.org/) / [WikDict](http://www.wikdict.com/) / [Wiktionary](https://www.wiktionary.org/) |
| `data/affixes.json` | Affix rules and nasal assimilation patterns | Project authors | Hand-authored |
| `data/annotations.json` | Per-word affix applicability and derived meanings | Project authors | Hand-curated, grows over time |

See [`data/SOURCES.md`](data/SOURCES.md) for full attribution details.

### License note

`data/words.json` is derived from Wiktionary data (via WikDict and FreeDict) and is licensed under **CC BY-SA 3.0**. If you distribute this project publicly, that file must retain its CC BY-SA 3.0 license and attribution. The application code and the hand-authored data files (`affixes.json`, `annotations.json`) are not subject to this requirement.

### Why no LLM at runtime?

Delegating each page view to a language model would make the app slow, expensive, and unreliable offline. Instead, affix data is curated once and stored as plain JSON — easy to edit, version-controlled, and instant to serve.

## Affix Coverage

### Prefixes
| Affix | Primary function | Example |
|-------|----------------|---------|
| `me-` | Active verb (actor focus) | *tulis* → *menulis* (to write) |
| `ber-` | Intransitive verb / have/use | *bicara* → *berbicara* (to speak) |
| `di-` | Passive verb (patient focus) | *tulis* → *ditulis* (is written) |
| `ter-` | Accidental/stative passive | *tutup* → *tertutup* (accidentally closed) |
| `ke-` | Ordinal numbers; some nominals | *tiga* → *ketiga* (the third) |
| `se-` | One / same / as ... as | *kota* → *sekota* (same city) |
| `pe-` | Agent / instrument noun | *tulis* → *penulis* (writer) |

### Suffixes
| Affix | Primary function | Example |
|-------|----------------|---------|
| `-kan` | Causative / benefactive | *duduk* → *dudukkan* (to seat someone) |
| `-an` | Noun / result / instrument | *tulis* → *tulisan* (writing, text) |
| `-i` | Locative / repeated action on object | *tulis* → *tulisi* (to write on/over) |
| `-nya` | Definiteness / nominalisation | *besar* → *besarnya* (its size) |
| `-lah` | Softening imperative / emphasis | *pergi* → *pergilah* (do go) |

### Circumfixes (selected)
| Affix | Primary function |
|-------|----------------|
| `me-...-kan` | Causative active verb |
| `me-...-i` | Directional/repeated active verb |
| `pe-...-an` | Abstract noun / place noun |
| `ke-...-an` | Abstract noun / state |
| `ber-...-an` | Reciprocal / plural action |

### Nasal Assimilation (me- prefix)
The `me-` prefix undergoes consonant changes depending on the initial sound of the root:

| Root starts with | Prefix becomes | Example |
|-----------------|---------------|---------|
| `b`, `f`, `v` | `mem-` | *baca* → *membaca* |
| `p` (dropped) | `mem-` | *pukul* → *memukul* |
| `c`, `j`, `sy`, `z` | `men-` | *cuci* → *mencuci* |
| `d`, `t` (dropped) | `men-` | *tulis* → *menulis* |
| `g`, `h`, vowel | `meng-` | *ambil* → *mengambil* |
| `k` (dropped) | `meng-` | *kirim* → *mengirim* |
| `l`, `m`, `n`, `ny`, `ng`, `r`, `w`, `y` | `me-` | *lari* → *melari* |
| `s` (dropped) | `meny-` | *sapu* → *menyapu* |

## Tech Stack

- **[Svelte](https://svelte.dev/) + [Vite](https://vitejs.dev/)** — lightweight reactive UI, no heavy framework
- **Plain JSON files** — data is version-controlled and hand-editable
- **Static site** — no backend, deployable to GitHub Pages or Netlify

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Project Structure

```
bahasa-affix/
├── data/
│   ├── words.json         # root words + English glosses
│   ├── affixes.json       # affix rules + nasal assimilation
│   └── annotations.json   # per-word affix forms + meanings
├── src/
│   ├── App.svelte
│   ├── components/
│   │   ├── WordSearch.svelte
│   │   ├── WordCard.svelte
│   │   └── AffixTable.svelte
│   └── lib/
│       ├── affixEngine.js  # applies nasal assimilation rules
│       └── data.js         # loads and indexes JSON data
├── index.html
├── vite.config.js
└── package.json
```

## Roadmap

- [ ] Scaffold Svelte app
- [ ] Import and normalise FreeDict id-en word list
- [ ] Author `affixes.json` with rules and examples
- [ ] Implement nasal assimilation engine
- [ ] Build `WordCard` and `AffixTable` UI components
- [ ] Seed `annotations.json` with ~100 common root words
- [ ] Deploy to GitHub Pages
