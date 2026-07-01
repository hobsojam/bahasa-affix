<script>
  import WordSearch from './components/WordSearch.svelte'
  import AffixTable from './components/AffixTable.svelte'
  import AffixGuide from './components/AffixGuide.svelte'
  import wordsData from '../data/words.json'
  import annotations from '../data/annotations.json'

  const words = wordsData.words

  let selectedRoot = $state(null)
  const selectedWord = $derived(words.find(w => w.root === selectedRoot))

  let guideOpen = $state(false)
  let guideButtonEl = $state()

  function closeGuide() {
    guideOpen = false
    guideButtonEl?.focus()
  }
</script>

<header>
  <h1>Bahasa Indonesia Language Affix System</h1>
  <button class="guide-btn" bind:this={guideButtonEl} onclick={() => guideOpen = true}>
    Affix Guide
  </button>
</header>

{#if guideOpen}
  <AffixGuide {annotations} onClose={closeGuide} />
{/if}

<main>
  <div class="search-wrapper">
    <WordSearch {words} onSelect={root => selectedRoot = root} />
  </div>

  {#if selectedWord}
    <section class="word-card">
      <div class="root-word">{selectedWord.root}</div>
      <div class="pos">{selectedWord.pos}</div>
      <div class="base-gloss">{selectedWord.gloss}</div>
    </section>

    <section class="affix-section">
      <h2>Derived forms</h2>
      <AffixTable root={selectedRoot} {annotations} />
    </section>
  {:else}
    <p class="prompt">Search for a root word above to explore its affix forms.</p>
  {/if}
</main>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; }
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: #fafafa;
    color: #222;
  }

  header {
    background: #1a5276;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  h1 { margin: 0; font-size: 1.25rem; font-weight: 600; }

  .guide-btn {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: white;
    padding: 0.4rem 0.85rem;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .guide-btn:hover { background: rgba(255, 255, 255, 0.22); }
  .guide-btn:focus-visible { outline: 2px solid white; outline-offset: 2px; }

  main {
    max-width: 760px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .search-wrapper { margin-bottom: 2rem; }

  .word-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .root-word  { font-size: 2rem; font-weight: 700; line-height: 1.1; }
  .pos        { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin: 0.25rem 0; }
  .base-gloss { font-size: 1.1rem; color: #444; }

  .affix-section {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 1.25rem 1.5rem;
  }

  h2 {
    margin: 0 0 1rem;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #888;
  }

  .prompt { color: #aaa; text-align: center; margin-top: 4rem; }
</style>
