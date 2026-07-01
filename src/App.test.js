import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import App from './App.svelte'

describe('App', () => {
  it('renders the title and a prompt before any word is selected', () => {
    render(App)
    expect(screen.getByRole('heading', { level: 1, name: 'pemBILAS' })).toBeInTheDocument()
    expect(screen.getByText(/search for a root word above/i)).toBeInTheDocument()
  })

  it('selecting a search result shows the word card and its derived forms', async () => {
    render(App)
    const input = screen.getByPlaceholderText(/search root or derived form/i)
    await fireEvent.input(input, { target: { value: 'menulis' } })

    const button = await screen.findByRole('button', { name: /tulis/ })
    await fireEvent.click(button)

    expect(screen.getByText('write, written')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /derived forms/i })).toBeInTheDocument()
    expect(screen.getByText('menulis')).toBeInTheDocument()
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
