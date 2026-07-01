import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import AffixTable from './AffixTable.svelte'

const annotations = {
  tulis: {
    me: { state: 'valid', gloss: 'to write (active)' },
    ber: { state: 'unused', gloss: '' },
  },
}

describe('AffixTable', () => {
  it('shows the empty state when the root has no annotations', () => {
    render(AffixTable, { root: 'zzz', annotations: {} })
    expect(screen.getByText(/no affix forms annotated yet/i)).toBeInTheDocument()
  })

  it('renders a valid affix slot with its derived form and gloss', () => {
    render(AffixTable, { root: 'tulis', annotations })
    expect(screen.getByText('menulis')).toBeInTheDocument()
    expect(screen.getByText('to write (active)')).toBeInTheDocument()
  })

  it('gives each table a labelled column header row associated with its group heading', () => {
    render(AffixTable, { root: 'tulis', annotations })

    const table = screen.getByRole('table', { name: 'Verb forms' })
    expect(table).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Form' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Affix' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Meaning' })
    ).toBeInTheDocument()
  })

  it('renders an unused affix slot dimmed with a note instead of a gloss', () => {
    render(AffixTable, { root: 'tulis', annotations })
    expect(screen.getByText('bertulis')).toBeInTheDocument()
    expect(screen.getByText('(not commonly used)')).toBeInTheDocument()
  })

  it('hides affix slots that have no annotation at all', () => {
    render(AffixTable, { root: 'tulis', annotations })
    // 'di' is a real affix for tulis in the full dataset but isn't in this
    // fixture's annotations, so it must not be rendered as a row.
    expect(screen.queryByText('ditulis')).not.toBeInTheDocument()
  })
})
