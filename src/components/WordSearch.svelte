<script>
  let { words, onSelect } = $props()

  // The search index is ~5.7MB of JSON -- by far the biggest single
  // contributor to the JS bundle -- and isn't needed until the user starts
  // typing, so it's loaded as a separate lazy chunk instead of bundled into
  // the initial payload. Kicked off immediately on mount (not on first
  // keystroke) so it's very likely already loaded by the time the user
  // types 2+ characters.
  let index = $state(null)
  import('../../data/search-index.json').then(m => { index = m.default })

  // Set for O(1) root-word lookup (used to label results as direct vs via-affix)
  const rootSet = new Set(words.map(w => w.root))
  const glossMap = new Map(words.map(w => [w.root, w.gloss]))

  let query = $state('')
  let results = $state([])
  let justSelected = false

  function binarySearchLeft(q) {
    let lo = 0, hi = index.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (index[mid][0] < q) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  function search(q) {
    if (justSelected) { justSelected = false; return }
    if (!q || q.length < 2 || !index) { results = []; return }
    const lower = q.toLowerCase()

    const found = []
    // Local dedup set, discarded at the end of this call -- not reactive state, so a plain Set is correct here.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const seenRoots = new Set()

    let i = binarySearchLeft(lower)
    while (i < index.length && index[i][0].startsWith(lower)) {
      const [form, root, via] = index[i]
      if (!seenRoots.has(root)) {
        seenRoots.add(root)
        found.push({
          root,
          form,
          via,
          gloss: glossMap.get(root) ?? '',
          isDirect: rootSet.has(form) && form === root,
        })
      }
      i++
      if (found.length >= 8) break
    }

    results = found
  }

  $effect(() => { search(query) })

  function select(root) {
    justSelected = true
    query = root
    results = []
    onSelect(root)
  }
</script>

<div class="search">
  <input
    type="text"
    placeholder="Search root or derived form (e.g. menulis)…"
    bind:value={query}
  />
  {#if results.length > 0}
    <ul class="results">
      {#each results as r (r.root)}
        <li>
          <button onclick={() => select(r.root)}>
            <span class="root">{r.root}</span>
            {#if r.via}
              <span class="via">via {r.via}</span>
            {/if}
            <span class="gloss">{r.gloss}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .search { position: relative; }

  input {
    width: 100%;
    padding: 0.6rem 0.8rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .results {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    list-style: none;
    margin: 0; padding: 0;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  li { border-bottom: 1px solid #f0f0f0; }
  li:last-child { border-bottom: none; }

  button {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 0.5rem 0.8rem;
    cursor: pointer;
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
  }

  button:hover { background: #f5f5f5; }

  .root  { font-weight: 600; }
  .via   { font-size: 0.8rem; color: #888; }
  .gloss { font-size: 0.9rem; color: #555; margin-left: auto; }
</style>
