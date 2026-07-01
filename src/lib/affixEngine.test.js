import { describe, it, expect } from 'vitest'
import { deriveForm, affixes } from './affixEngine.js'

describe('nasal assimilation (me- prefix)', () => {
  it.each([
    ['b/f/v -> mem (no drop)', 'baca', 'membaca'],
    ['p -> mem (dropped)', 'pukul', 'memukul'],
    ['c/j/sy/z -> men (no drop)', 'cuci', 'mencuci'],
    ['d -> men (no drop)', 'dengar', 'mendengar'],
    ['t -> men (dropped)', 'tulis', 'menulis'],
    ['g/h -> meng (no drop)', 'gambar', 'menggambar'],
    ['k -> meng (dropped)', 'kirim', 'mengirim'],
    ['vowel -> meng (no drop)', 'ambil', 'mengambil'],
    ['s -> meny (dropped)', 'sapu', 'menyapu'],
    ['l/m/n/r/w/y/ng/ny -> me (no drop)', 'lari', 'melari'],
  ])('%s: %s -> %s', (_label, root, expected) => {
    expect(deriveForm(root, 'me')).toBe(expected)
  })
})

describe('r-elision (ber-, ter-, per-, ber-...-an, per-...-an)', () => {
  it.each([
    ['ber', 'rasa', 'berasa'],
    ['ber', 'tulis', 'bertulis'],
    ['ter', 'rasa', 'terasa'],
    ['ter', 'tulis', 'tertulis'],
  ])('%s + %s -> %s', (affixId, root, expected) => {
    expect(deriveForm(root, affixId)).toBe(expected)
  })

  it.each([
    ['ber_an', 'rasa', 'berasaan'],
    ['ber_an', 'kenal', 'berkenalan'],
    ['per_an', 'resmi', 'peresmian'],
    ['per_an', 'teman', 'pertemanan'],
  ])('%s + %s -> %s', (affixId, root, expected) => {
    expect(deriveForm(root, affixId)).toBe(expected)
  })
})

describe('golden real-word cases', () => {
  it.each([
    ['tulis', 'me', 'menulis'],
    ['tulis', 'di', 'ditulis'],
    ['tulis', 'ter', 'tertulis'],
    ['tulis', 'pe', 'penulis'],
    ['tulis', 'an', 'tulisan'],
    ['tulis', 'pe_an', 'penulisan'],
    ['tulis', 'me_kan', 'menuliskan'],
    ['tulis', 'me_i', 'menulisi'],
    ['teman', 'ber', 'berteman'],
    ['teman', 'per_an', 'pertemanan'],
    ['kenal', 'ber_an', 'berkenalan'],
    ['dua', 'ke', 'kedua'],
    ['besar', 'se', 'sebesar'],
    ['besar', 'nya', 'besarnya'],
    ['ambil', 'kan', 'ambilkan'],
    ['tulis', 'i', 'tulisi'],
    ['makan', 'lah', 'makanlah'],
    ['cantik', 'ke_an', 'kecantikan'],
  ])('%s + %s -> %s', (root, affixId, expected) => {
    expect(deriveForm(root, affixId)).toBe(expected)
  })
})

describe('deriveForm fallback', () => {
  it('returns the root unchanged for an unknown affix id', () => {
    expect(deriveForm('tulis', 'not-a-real-affix')).toBe('tulis')
  })
})

describe('affixes data', () => {
  it('exports a non-empty list of affix definitions with unique ids', () => {
    expect(affixes.length).toBeGreaterThan(0)
    const ids = affixes.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every affix belongs to one of the three known groups', () => {
    const knownGroups = new Set(['verb', 'noun', 'modifier'])
    for (const affix of affixes) {
      expect(knownGroups.has(affix.group)).toBe(true)
    }
  })
})
