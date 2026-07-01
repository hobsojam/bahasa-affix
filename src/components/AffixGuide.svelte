<script>
  import { deriveForm, affixes } from '../lib/affixEngine.js'
  import affixData from '../../data/affixes.json'
  import wordsData from '../../data/words.json'

  let { annotations, onClose } = $props()

  const groups = affixData.groups
  const rootGloss = new Map(wordsData.words.map(w => [w.root, w.gloss]))

  function rowsForGroup(groupId) {
    return affixes
      .filter(affix => affix.group === groupId)
      .map(affix => ({ affix, example: exampleFor(affix) }))
  }

  function exampleFor(affix) {
    if (!affix.example) return null
    const gloss = annotations[affix.example]?.[affix.id]?.gloss
    const rootMeaning = rootGloss.get(affix.example)
    if (!gloss || !rootMeaning) return null
    return {
      form: deriveForm(affix.example, affix.id),
      root: affix.example,
      rootMeaning,
      gloss,
    }
  }

  const groupedRows = groups.map(g => ({ ...g, rows: rowsForGroup(g.id) }))

  let dialogEl = $state()

  function focusableElements() {
    return dialogEl.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const focusable = focusableElements()
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  $effect(() => {
    dialogEl?.focus()
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="backdrop" onclick={onClose} role="presentation">
  <div
    class="dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="affix-guide-title"
    tabindex="-1"
    bind:this={dialogEl}
    onclick={e => e.stopPropagation()}
  >
    <div class="dialog-header">
      <h2 id="affix-guide-title">Affix Guide</h2>
      <button class="close-btn" onclick={onClose} aria-label="Close affix guide">✕</button>
    </div>

    <div class="dialog-body">
      {#each groupedRows as group (group.id)}
        <div class="group">
          <h3>{group.label}</h3>
          <ul>
            {#each group.rows as { affix, example } (affix.id)}
              <li>
                <div class="row-head">
                  <span class="affix-label">{affix.label}</span>
                  <span class="function">{affix.function}</span>
                </div>
                {#if example}
                  <div class="example">
                    <span class="root-word">{example.root}</span>
                    <span class="root-gloss">"{example.rootMeaning}"</span>
                    <span class="arrow">→</span>
                    <strong>{example.form}</strong>
                    <span class="derived-gloss">"{example.gloss}"</span>
                  </div>
                {/if}
                {#if affix.notes}
                  <div class="notes">{affix.notes}</div>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 3rem 1rem;
    z-index: 100;
    overflow-y: auto;
  }

  .dialog {
    background: white;
    border-radius: 8px;
    max-width: 640px;
    width: 100%;
    max-height: calc(100vh - 6rem);
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  }

  .dialog:focus {
    outline: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .dialog-header h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    color: #666;
    padding: 0.25rem 0.5rem;
    line-height: 1;
  }

  .close-btn:hover { color: #222; }
  .close-btn:focus-visible { outline: 2px solid #CE1126; outline-offset: 2px; }

  .dialog-body {
    padding: 1.25rem;
    overflow-y: auto;
  }

  .group { margin-bottom: 1.5rem; }
  .group:last-child { margin-bottom: 0; }

  .group h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #aaa;
    margin: 0 0 0.6rem;
  }

  ul { list-style: none; margin: 0; padding: 0; }

  li {
    padding: 0.6rem 0;
    border-bottom: 1px solid #f0f0f0;
  }
  li:last-child { border-bottom: none; }

  .row-head {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .affix-label { font-weight: 600; }
  .function { color: #555; font-size: 0.9rem; }

  .example {
    margin-top: 0.35rem;
    font-size: 0.9rem;
    color: #333;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem;
    row-gap: 0.15rem;
  }

  .root-word { font-weight: 600; }
  .root-gloss, .derived-gloss { color: #666; font-style: italic; }
  .arrow { color: #aaa; }

  .notes {
    margin-top: 0.3rem;
    font-size: 0.82rem;
    color: #888;
    font-style: italic;
  }
</style>
