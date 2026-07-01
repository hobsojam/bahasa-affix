/**
 * Validates data/annotations.json structure.
 * Run with: npm run validate:data
 *
 * Checks, per issue #20:
 *   - the file is valid JSON
 *   - every entry's `state` is one of "valid" | "unused"
 *   - every "valid" entry has a non-empty `gloss`
 *   - every affix id referenced actually exists in data/affixes.json
 *
 * Plus, per issue #16:
 *   - an entry's optional `form` (irregular-derivation override, see
 *     affixEngine.js) is a non-empty string when present, and only appears
 *     on "valid" entries (an unused slot has no form to override)
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const VALID_STATES = new Set(['valid', 'unused'])

let annotations
try {
  annotations = JSON.parse(readFileSync(join(root, 'data/annotations.json'), 'utf8'))
} catch (err) {
  console.error(`data/annotations.json is not valid JSON: ${err.message}`)
  process.exit(1)
}

const affixData = JSON.parse(readFileSync(join(root, 'data/affixes.json'), 'utf8'))
const knownAffixIds = new Set(affixData.affixes.map(a => a.id))

const errors = []

for (const [word, entries] of Object.entries(annotations)) {
  for (const [affixId, entry] of Object.entries(entries)) {
    const where = `${word}.${affixId}`

    if (!knownAffixIds.has(affixId)) {
      errors.push(`${where}: unknown affix id (not in data/affixes.json)`)
    }

    if (!VALID_STATES.has(entry.state)) {
      errors.push(`${where}: state must be "valid" or "unused", got ${JSON.stringify(entry.state)}`)
    }

    if (entry.state === 'valid' && !entry.gloss?.trim()) {
      errors.push(`${where}: state is "valid" but gloss is empty`)
    }

    if ('form' in entry) {
      if (typeof entry.form !== 'string' || !entry.form.trim()) {
        errors.push(`${where}: form is present but empty (must be a non-empty string)`)
      }
      if (entry.state !== 'valid') {
        errors.push(`${where}: form is set but state is not "valid" (an unused slot has nothing to override)`)
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`data/annotations.json failed validation (${errors.length} issue(s)):`)
  for (const err of errors) console.error(`  - ${err}`)
  process.exit(1)
}

const wordCount = Object.keys(annotations).length
const entryCount = Object.values(annotations).reduce((n, e) => n + Object.keys(e).length, 0)
console.log(`data/annotations.json OK: ${entryCount} entries across ${wordCount} roots`)
