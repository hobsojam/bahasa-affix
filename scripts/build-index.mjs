/**
 * Pre-builds the search index from words.json + affixes.json.
 * Run with: npm run build:index
 * Output: data/search-index.json — a sorted array of [form, root, affixLabel|null]
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'

// --- nasal assimilation (mirrors affixEngine.js) ---

function applyNasal(word, rules) {
  for (const rule of rules) {
    for (const s of rule.startsWith) {
      if (word.startsWith(s)) {
        const stem = rule.dropInitial ? word.slice(s.length) : word
        return rule.prefix + stem
      }
    }
  }
  return 'me' + word
}

function applyPeNasal(word, rules) {
  return applyNasal(word, rules).replace(/^me/, 'pe')
}

export function deriveForm(word, affixId, rules) {
  switch (affixId) {
    case 'me':     return applyNasal(word, rules)
    case 'ber':    return word.startsWith('r') ? 'be' + word : 'ber' + word
    case 'di':     return 'di' + word
    case 'ter':    return 'ter' + word
    case 'ke':     return 'ke' + word
    case 'se':     return 'se' + word
    case 'pe':     return applyPeNasal(word, rules)
    case 'an':     return word + 'an'
    case 'kan':    return word + 'kan'
    case 'i':      return word + 'i'
    case 'nya':    return word + 'nya'
    case 'lah':    return word + 'lah'
    case 'me_kan': return applyNasal(word, rules) + 'kan'
    case 'me_i':   return applyNasal(word, rules) + 'i'
    case 'pe_an':  return applyPeNasal(word, rules) + 'an'
    case 'ke_an':  return 'ke' + word + 'an'
    case 'ber_an': return (word.startsWith('r') ? 'be' : 'ber') + word + 'an'
    default:       return word
  }
}

// --- build index ---

export function buildIndex({ words, affixes, annotations, rules }) {
  // Every word's own root, e.g. "bilai" -- used to catch generated forms
  // that collide with an unrelated dictionary headword (see issue: "bila"
  // + "-i" mechanically produces "bilai", which is actually its own
  // unrelated root).
  const rootWords = new Set(words.map(w => w.root))

  // Entries are [form, root, affixLabel|null] with a trailing 1 appended to
  // "verified" entries: root self-entries and slots annotated state "valid".
  // The flag is sparse (only ~6% of entries carry it) to keep the generated
  // file small; a missing flag means the form was mechanically derived from
  // an un-annotated slot and nobody has reviewed it (#48).
  const entries = []
  const seen = new Set()

  function add(form, root, label, verified) {
    const key = form + '\0' + root
    if (!seen.has(key)) {
      seen.add(key)
      entries.push(verified ? [form, root, label, 1] : [form, root, label])
    }
  }

  for (const word of words) {
    add(word.root, word.root, null, true)
    for (const affix of affixes) {
      const ann = annotations[word.root]?.[affix.id]
      if (ann?.state === 'unused') continue

      // An annotation's `form` overrides the algorithmic one for lexically
      // irregular derivations (see affixEngine.js / #16).
      const form = ann?.form ?? deriveForm(word.root, affix.id, rules)
      if (form === word.root) continue
      if (rootWords.has(form)) continue // collides with an unrelated dictionary headword

      add(form, word.root, affix.label, ann?.state === 'valid')
    }
  }

  // Verified entries sort before unverified ones for the same form, so the
  // search UI's prefix scan surfaces curated derivations first.
  entries.sort((a, b) => a[0].localeCompare(b[0]) || (b[3] ?? 0) - (a[3] ?? 0))
  return entries
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const wordsData = JSON.parse(readFileSync(join(root, 'data/words.json'), 'utf8'))
  const affixData = JSON.parse(readFileSync(join(root, 'data/affixes.json'), 'utf8'))
  const annotations = JSON.parse(readFileSync(join(root, 'data/annotations.json'), 'utf8'))

  const words = wordsData.words
  const { rules } = affixData.nasalAssimilation
  const affixes = affixData.affixes

  const entries = buildIndex({ words, affixes, annotations, rules })

  writeFileSync(join(root, 'data/search-index.json'), JSON.stringify(entries))

  console.log(`Built search index: ${entries.length} entries from ${words.length} roots`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
