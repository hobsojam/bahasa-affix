import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import WordSearch from './WordSearch.svelte'

// The real search-index.json is ~5.7MB; importing and parsing it inside
// every test made findByText's default 1s timeout flaky depending on how
// fast that dynamic import happened to resolve. A small deterministic
// fixture removes that timing dependency entirely.
vi.mock('../../data/search-index.json', () => ({
  default: [
    ['menulis', 'tulis', 'me-'],
    ['tulis', 'tulis', null],
  ],
}))

const words = [{ root: 'tulis', pos: 'word', gloss: 'write, written' }]

describe('WordSearch', () => {
  it('shows no results for a query shorter than 2 characters', async () => {
    render(WordSearch, { words, onSelect: vi.fn() })
    const input = screen.getByLabelText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 't' } })
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('finds a derived form and links it back to its root via the affix label', async () => {
    render(WordSearch, { words, onSelect: vi.fn() })
    const input = screen.getByLabelText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'menulis' } })

    const root = await screen.findByText('tulis', {}, { timeout: 3000 })
    expect(root).toBeInTheDocument()
    expect(screen.getByText('via me-')).toBeInTheDocument()
  })

  it('finding a root word directly does not show a "via" affix label', async () => {
    render(WordSearch, { words, onSelect: vi.fn() })
    const input = screen.getByLabelText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'tulis' } })

    await screen.findByText('tulis', {}, { timeout: 3000 })
    expect(screen.queryByText(/^via /)).not.toBeInTheDocument()
  })

  it('calls onSelect with the root and clears the result list when a result is clicked', async () => {
    const onSelect = vi.fn()
    render(WordSearch, { words, onSelect })
    const input = screen.getByLabelText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'menulis' } })

    const button = await screen.findByRole('button', { name: /tulis/ }, { timeout: 3000 })
    await fireEvent.click(button)

    expect(onSelect).toHaveBeenCalledWith('tulis')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(input).toHaveValue('tulis')
  })
})
