/**
 * Pre-builds the search index from words.json + affixes.json.
 * Run with: npm run build:index
 * Output: data/search-index.json — a sorted array of [form, root, affixLabel|null]
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const wordsData = JSON.parse(readFileSync(join(root, 'data/words.json'), 'utf8'))
const affixData = JSON.parse(readFileSync(join(root, 'data/affixes.json'), 'utf8'))

const words = wordsData.words
const { rules } = affixData.nasalAssimilation
const affixes = affixData.affixes

// --- nasal assimilation (mirrors affixEngine.js) ---

function applyNasal(word) {
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

function applyPeNasal(word) {
  return applyNasal(word).replace(/^me/, 'pe')
}

function deriveForm(word, affixId) {
  switch (affixId) {
    case 'me':     return applyNasal(word)
    case 'ber':    return word.startsWith('r') ? 'be' + word : 'ber' + word
    case 'di':     return 'di' + word
    case 'ter':    return 'ter' + word
    case 'ke':     return 'ke' + word
    case 'se':     return 'se' + word
    case 'pe':     return applyPeNasal(word)
    case 'an':     return word + 'an'
    case 'kan':    return word + 'kan'
    case 'i':      return word + 'i'
    case 'nya':    return word + 'nya'
    case 'lah':    return word + 'lah'
    case 'me_kan': return applyNasal(word) + 'kan'
    case 'me_i':   return applyNasal(word) + 'i'
    case 'pe_an':  return applyPeNasal(word) + 'an'
    case 'ke_an':  return 'ke' + word + 'an'
    case 'ber_an': return (word.startsWith('r') ? 'be' : 'ber') + word + 'an'
    default:       return word
  }
}

// --- build index ---

const entries = [] // [form, root, affixLabel|null]
const seen = new Set()

function add(form, root, label) {
  const key = form + '\0' + root
  if (!seen.has(key)) {
    seen.add(key)
    entries.push([form, root, label])
  }
}

for (const word of words) {
  add(word.root, word.root, null)
  for (const affix of affixes) {
    const form = deriveForm(word.root, affix.id)
    if (form !== word.root) {
      add(form, word.root, affix.label)
    }
  }
}

entries.sort((a, b) => a[0].localeCompare(b[0]))

writeFileSync(join(root, 'data/search-index.json'), JSON.stringify(entries))

console.log(`Built search index: ${entries.length} entries from ${words.length} roots`)
