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
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
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

    const option = await screen.findByRole('option', { name: /tulis/ }, { timeout: 3000 })
    await fireEvent.click(option)

    expect(onSelect).toHaveBeenCalledWith('tulis')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('tulis')
  })

  describe('combobox semantics', () => {
    it('exposes the input as a combobox wired to the results listbox', async () => {
      render(WordSearch, { words, onSelect: vi.fn() })
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-expanded', 'false')

      await fireEvent.input(input, { target: { value: 'menulis' } })
      const listbox = await screen.findByRole('listbox', {}, { timeout: 3000 })

      expect(input).toHaveAttribute('aria-expanded', 'true')
      expect(input).toHaveAttribute('aria-controls', listbox.id)
    })

    it('announces the result count in a status live region', async () => {
      render(WordSearch, { words, onSelect: vi.fn() })
      const input = screen.getByRole('combobox')

      expect(screen.getByRole('status')).toHaveTextContent('')

      await fireEvent.input(input, { target: { value: 'menulis' } })
      await screen.findByRole('listbox', {}, { timeout: 3000 })

      expect(screen.getByRole('status')).toHaveTextContent('1 result available')
    })
  })

  describe('keyboard navigation', () => {
    async function openResults() {
      const onSelect = vi.fn()
      render(WordSearch, { words, onSelect })
      const input = screen.getByRole('combobox')
      await fireEvent.input(input, { target: { value: 'menulis' } })
      await screen.findByRole('listbox', {}, { timeout: 3000 })
      return { input, onSelect }
    }

    it('ArrowDown highlights the first option via aria-activedescendant', async () => {
      const { input } = await openResults()
      const option = screen.getByRole('option', { name: /tulis/ })

      await fireEvent.keyDown(input, { key: 'ArrowDown' })

      expect(option).toHaveAttribute('aria-selected', 'true')
      expect(input).toHaveAttribute('aria-activedescendant', option.id)
    })

    it('ArrowUp from no selection does not select a nonexistent prior option', async () => {
      const { input } = await openResults()
      const option = screen.getByRole('option', { name: /tulis/ })

      await fireEvent.keyDown(input, { key: 'ArrowUp' })

      expect(option).toHaveAttribute('aria-selected', 'false')
      expect(input).not.toHaveAttribute('aria-activedescendant')
    })

    it('Enter selects the highlighted option', async () => {
      const { input, onSelect } = await openResults()

      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      await fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSelect).toHaveBeenCalledWith('tulis')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('Enter with nothing highlighted does not select anything', async () => {
      const { input, onSelect } = await openResults()

      await fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSelect).not.toHaveBeenCalled()
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('Escape closes the results without selecting', async () => {
      const { input, onSelect } = await openResults()

      await fireEvent.keyDown(input, { key: 'Escape' })

      expect(onSelect).not.toHaveBeenCalled()
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(input).toHaveValue('menulis')
    })
  })
})
