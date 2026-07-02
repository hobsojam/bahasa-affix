import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import App from './App.svelte'

// See WordSearch.test.js for why the real (~5.7MB) search index is mocked
// out rather than loaded for real in tests.
vi.mock('../data/search-index.json', () => ({
  default: [
    // tang.ber is un-annotated in the real annotations.json, so this entry
    // exercises the mechanical-row path (#53) end to end.
    ['bertang', 'tang', 'ber-'],
    ['menulis', 'tulis', 'me-'],
  ],
}))

describe('App', () => {
  it('renders the title and a prompt before any word is selected', () => {
    render(App)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Bahasa Indonesia Language Affix System' })
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'pemBILAS' })).toBeInTheDocument()
    expect(screen.getByText(/search for a root word above/i)).toBeInTheDocument()
  })

  it('selecting a search result shows the word card and its derived forms', async () => {
    render(App)
    const input = screen.getByLabelText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'menulis' } })

    const option = await screen.findByRole('option', { name: /tulis/ }, { timeout: 3000 })
    await fireEvent.click(option)

    expect(screen.getByText('write, written')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /derived forms/i })).toBeInTheDocument()
    expect(screen.getByText('menulis')).toBeInTheDocument()
  })

  it('shows the searched derivation as an unreviewed row when its slot is un-annotated (#53)', async () => {
    render(App)
    const input = screen.getByLabelText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'bertang' } })

    const option = await screen.findByRole('option', { name: /tang/ }, { timeout: 3000 })
    await fireEvent.click(option)

    expect(screen.getByText('bertang')).toBeInTheDocument()
    expect(screen.getByText('mechanically derived — not yet reviewed')).toBeInTheDocument()
    expect(screen.queryByText(/no affix forms annotated yet/i)).not.toBeInTheDocument()
  })

  it('announces the selected word in a status live region', async () => {
    render(App)
    const statusRegions = screen.getAllByRole('status')
    for (const region of statusRegions) expect(region).toHaveTextContent('')

    const input = screen.getByLabelText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'menulis' } })
    const option = await screen.findByRole('option', { name: /tulis/ }, { timeout: 3000 })
    await fireEvent.click(option)

    expect(
      screen.getByText('Showing derived forms for tulis: write, written')
    ).toBeInTheDocument()
  })

  it('opens and closes the Affix Guide dialog', async () => {
    render(App)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: /affix guide/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: /close affix guide/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
