<script>
  import { deriveForm, affixes } from '../lib/affixEngine.js'
  import affixData from '../../data/affixes.json'

  let { root, annotations, searched = null } = $props()

  const wordAnnotations = $derived(annotations[root] ?? {})

  const groups = affixData.groups

  // When the user arrived via an un-annotated derived-form search result,
  // show that one derivation as an explicitly unreviewed row instead of a
  // dead end (#53). Curated slots (valid or unused) render normally, so
  // the row only appears when nobody has looked at the slot yet.
  const mechanicalRow = $derived.by(() => {
    if (!searched?.via) return null
    const affix = affixes.find(a => a.label === searched.via)
    if (!affix || wordAnnotations[affix.id]) return null
    return { affix, form: searched.form, state: 'mechanical', gloss: '' }
  })

  function rowsForGroup(groupId) {
    return affixes
      .filter(affix => affix.group === groupId)
      .map(affix => {
        const ann = wordAnnotations[affix.id]
        // Some derived forms are lexically irregular and can't be produced
        // by the phonological rules deriveForm() encodes (e.g. gunung's
        // pe_an form is "pegunungan", not the nasalized "penggunungan" the
        // regular rule would give). An annotation can supply the literal
        // surface form to override the algorithmic one -- see #16.
        const form = ann?.form ?? deriveForm(root, affix.id)
        return {
          affix,
          form,
          state: ann?.state ?? 'unannotated',
          gloss: ann?.gloss ?? '',
        }
      })
      .filter(r => r.state !== 'unannotated')
  }

  const groupedRows = $derived(
    groups
      .map(g => {
        const rows = rowsForGroup(g.id)
        if (mechanicalRow && mechanicalRow.affix.group === g.id) rows.push(mechanicalRow)
        return { ...g, rows }
      })
      .filter(g => g.rows.length > 0)
  )
</script>

{#if groupedRows.length === 0}
  <p class="empty">No affix forms annotated yet for <em>{root}</em>.</p>
{:else}
  {#each groupedRows as group (group.id)}
    <div class="group">
      <h3 id="group-heading-{group.id}">{group.label}</h3>
      <table aria-labelledby="group-heading-{group.id}">
        <thead>
          <tr>
            <th scope="col">Form</th>
            <th scope="col">Affix</th>
            <th scope="col">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {#each group.rows as row (row.affix.id)}
            <tr class={row.state}>
              <td class="form">{row.form}</td>
              <td class="affix-label">{row.affix.label}</td>
              <td class="gloss">
                {#if row.state === 'unused'}
                  <span class="unused-note">(not commonly used)</span>
                {:else if row.state === 'mechanical'}
                  <span class="mechanical-note">mechanically derived — not yet reviewed</span>
                {:else}
                  {row.gloss}
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/each}
{/if}

<style>
  .group { margin-bottom: 1.5rem; }
  .group:last-child { margin-bottom: 0; }

  h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #666;
    margin: 0 0 0.4rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }

  th {
    padding: 0 0.75rem 0.35rem;
    text-align: left;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    color: #666;
  }

  td { padding: 0.55rem 0.75rem; border-bottom: 1px solid #f0f0f0; }
  tr:last-child td { border-bottom: none; }

  .form        { font-weight: 600; font-size: 1rem; }
  .affix-label { color: #666; font-size: 0.85rem; white-space: nowrap; }
  .gloss       { color: #333; }

  tr.unused td { color: #6b6b6b; }
  .unused-note { font-style: italic; }

  tr.mechanical td { color: #6b6b6b; }
  /* Same marker treatment as the search result "unverified" chip (#50) */
  .mechanical-note { font-style: italic; color: #7a5f12; }

  .empty { color: #666; font-style: italic; }
</style>
