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
  <div class="brand">
    <img src="{import.meta.env.BASE_URL}logo.svg" alt="pemBILAS" class="logo" />
    <h1>Bahasa Indonesia Language Affix System</h1>
  </div>
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

  <div class="sr-only" role="status">
    {selectedWord ? `Showing derived forms for ${selectedWord.root}: ${selectedWord.gloss}` : ''}
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
    background: #222222;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem 1rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex: 1 1 auto;
    min-width: 0;
  }

  .logo {
    height: 40px;
    width: auto;
    flex-shrink: 0;
    border-radius: 4px;
    background: white;
    padding: 3px;
    display: block;
  }

  h1 { margin: 0; font-size: 1.25rem; font-weight: 600; min-width: 0; }

  @media (max-width: 480px) {
    h1 { font-size: 1.05rem; }
  }

  .guide-btn {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid #CE1126;
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

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .word-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .root-word  { font-size: 2rem; font-weight: 700; line-height: 1.1; }
  .pos        { font-size: 0.8rem; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin: 0.25rem 0; }
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
    color: #666;
  }

  .prompt { color: #666; text-align: center; margin-top: 4rem; }
</style>
