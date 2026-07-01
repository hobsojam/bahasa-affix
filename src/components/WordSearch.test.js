import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import wordsData from '../../data/words.json'
import WordSearch from './WordSearch.svelte'

const words = wordsData.words

describe('WordSearch', () => {
  it('shows no results for a query shorter than 2 characters', async () => {
    render(WordSearch, { words, onSelect: vi.fn() })
    const input = screen.getByPlaceholderText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 't' } })
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('finds a derived form and links it back to its root via the affix label', async () => {
    render(WordSearch, { words, onSelect: vi.fn() })
    const input = screen.getByPlaceholderText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'menulis' } })

    const root = await screen.findByText('tulis')
    expect(root).toBeInTheDocument()
    expect(screen.getByText('via me-')).toBeInTheDocument()
  })

  it('finding a root word directly does not show a "via" affix label', async () => {
    render(WordSearch, { words, onSelect: vi.fn() })
    const input = screen.getByPlaceholderText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'tulis' } })

    await screen.findByText('tulis')
    expect(screen.queryByText(/^via /)).not.toBeInTheDocument()
  })

  it('calls onSelect with the root and clears the result list when a result is clicked', async () => {
    const onSelect = vi.fn()
    render(WordSearch, { words, onSelect })
    const input = screen.getByPlaceholderText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'menulis' } })

    const button = await screen.findByRole('button', { name: /tulis/ })
    await fireEvent.click(button)

    expect(onSelect).toHaveBeenCalledWith('tulis')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(input).toHaveValue('tulis')
  })
})
