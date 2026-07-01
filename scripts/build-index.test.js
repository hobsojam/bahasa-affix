import { describe, it, expect } from 'vitest'
import affixData from '../data/affixes.json'
import realAnnotations from '../data/annotations.json'
import { deriveForm, buildIndex } from './build-index.mjs'

const { rules } = affixData.nasalAssimilation

describe('deriveForm', () => {
  it('applies nasal assimilation for me-', () => {
    expect(deriveForm('tulis', 'me', rules)).toBe('menulis')
  })

  it('falls back to the root for an unknown affix id', () => {
    expect(deriveForm('tulis', 'bogus', rules)).toBe('tulis')
  })
})

describe('buildIndex', () => {
  const affixes = [
    { id: 'me', label: 'me-' },
    { id: 'pe_an', label: 'pe-...-an' },
  ]
  const words = [{ root: 'gunung' }, { root: 'tulis' }]

  it('uses an annotation form override instead of the algorithmic derivation (#16)', () => {
    const annotations = {
      gunung: {
        pe_an: { state: 'valid', gloss: 'mountain range', form: 'pegunungan' },
      },
    }
    const entries = buildIndex({ words, affixes, annotations, rules })

    expect(entries).toContainEqual(['pegunungan', 'gunung', 'pe-...-an'])
    // The algorithmic (wrong) nasal-assimilated form must not sneak in too.
    expect(entries.some(([form]) => form === 'penggunungan')).toBe(false)
  })

  it('skips slots marked unused', () => {
    const annotations = { tulis: { me: { state: 'unused', gloss: '' } } }
    const entries = buildIndex({ words, affixes, annotations, rules })
    expect(entries.some(([, root, label]) => root === 'tulis' && label === 'me-')).toBe(false)
  })

  it("always includes each word's own root with a null label", () => {
    const entries = buildIndex({ words, affixes, annotations: {}, rules })
    expect(entries).toContainEqual(['gunung', 'gunung', null])
    expect(entries).toContainEqual(['tulis', 'tulis', null])
  })
})

describe('real gunung data (#16 regression)', () => {
  it('data/annotations.json overrides gunung.pe_an to the irregular pegunungan', () => {
    expect(realAnnotations.gunung.pe_an).toEqual({
      state: 'valid',
      gloss: 'mountain range',
      form: 'pegunungan',
    })
  })
})
