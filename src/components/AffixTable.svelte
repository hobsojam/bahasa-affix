<script>
  import { deriveForm, affixes } from '../lib/affixEngine.js'
  import affixData from '../../data/affixes.json'

  let { root, annotations } = $props()

  const wordAnnotations = $derived(annotations[root] ?? {})

  const groups = affixData.groups

  function rowsForGroup(groupId) {
    return affixes
      .filter(affix => affix.group === groupId)
      .map(affix => {
        const ann = wordAnnotations[affix.id]
        const form = deriveForm(root, affix.id)
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
    groups.map(g => ({ ...g, rows: rowsForGroup(g.id) })).filter(g => g.rows.length > 0)
  )
</script>

{#if groupedRows.length === 0}
  <p class="empty">No affix forms annotated yet for <em>{root}</em>.</p>
{:else}
  {#each groupedRows as group (group.id)}
    <div class="group">
      <h3>{group.label}</h3>
      <table>
        <tbody>
          {#each group.rows as row (row.affix.id)}
            <tr class={row.state}>
              <td class="form">{row.form}</td>
              <td class="affix-label">{row.affix.label}</td>
              <td class="gloss">
                {#if row.state === 'unused'}
                  <span class="unused-note">(not commonly used)</span>
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
    color: #aaa;
    margin: 0 0 0.4rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }

  td { padding: 0.55rem 0.75rem; border-bottom: 1px solid #f0f0f0; }
  tr:last-child td { border-bottom: none; }

  .form        { font-weight: 600; font-size: 1rem; }
  .affix-label { color: #aaa; font-size: 0.85rem; white-space: nowrap; }
  .gloss       { color: #333; }

  tr.unused td { color: #bbb; }
  .unused-note { font-style: italic; }

  .empty { color: #999; font-style: italic; }
</style>
