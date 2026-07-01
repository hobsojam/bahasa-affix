import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import AffixGuide from './AffixGuide.svelte'

const annotations = {
  tulis: {
    me: { state: 'valid', gloss: 'to write (active)' },
  },
}

describe('AffixGuide', () => {
  it('renders an example derivation when annotation and root gloss are both available', () => {
    render(AffixGuide, { annotations, onClose: vi.fn() })
    expect(screen.getByText('menulis')).toBeInTheDocument()
    expect(screen.getByText('"to write (active)"')).toBeInTheDocument()
  })

  it('omits the example for an affix with no matching annotation', () => {
    render(AffixGuide, { annotations: {}, onClose: vi.fn() })
    expect(screen.queryByText('menulis')).not.toBeInTheDocument()
    // The affix entry itself still renders, just without an example.
    expect(screen.getByText('me-')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(AffixGuide, { annotations, onClose })
    await fireEvent.click(screen.getByRole('button', { name: /close affix guide/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn()
    render(AffixGuide, { annotations, onClose })
    await fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when the dialog body itself is clicked', async () => {
    const onClose = vi.fn()
    render(AffixGuide, { annotations, onClose })
    await fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn()
    render(AffixGuide, { annotations, onClose })
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})
