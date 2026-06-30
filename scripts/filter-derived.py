"""
Remove words from words.json that are derived forms of other words already in the list.
Handles nasal assimilation reversal for me- and pe-.
"""
import json, re
from pathlib import Path

root = Path(__file__).parent.parent
data = json.loads((root / 'data/words.json').read_text(encoding='utf-8'))
words = data['words']
roots = {w['root'] for w in words}

# Loanword endings that superficially look like Indonesian -i or -an suffixes
LOANWORD_ENDINGS = (
    'ologi', 'nomi', 'grafi', 'skopi', 'metri', 'logi', 'terapi',
    'krasi', 'foni', 'nasi', 'kasi', 'sasi', 'tasi', 'rasi',
)

MIN_STEM = 4   # stems shorter than this are too ambiguous

def is_loanword_suffix(word):
    return any(word.endswith(e) for e in LOANWORD_ENDINGS)

def is_gloss_same_as_root(word_entry, stem_entry):
    """True if the word's gloss is essentially the same as its own root — likely a proper noun."""
    return word_entry['gloss'].lower().strip() == word_entry['root'].lower().strip()

def candidate_stems(word):
    """
    Yield (prefix_label, stem) pairs for every plausible decomposition of word.
    Stems must be >= MIN_STEM characters.
    """
    w = word

    # ber- / be- (before r-initial stem)
    if w.startswith('ber') and len(w[3:]) >= MIN_STEM:
        yield 'ber-', w[3:]
    if w.startswith('be') and w[2:3] == 'r' and len(w[2:]) >= MIN_STEM:
        yield 'ber-', w[2:]

    # di-
    if w.startswith('di') and len(w[2:]) >= MIN_STEM:
        yield 'di-', w[2:]

    # ter-
    if w.startswith('ter') and len(w[3:]) >= MIN_STEM:
        yield 'ter-', w[3:]

    # ke-
    if w.startswith('ke') and len(w[2:]) >= MIN_STEM:
        yield 'ke-', w[2:]

    # se-
    if w.startswith('se') and len(w[2:]) >= MIN_STEM:
        yield 'se-', w[2:]

    # pe- variants
    if w.startswith('peny') and len('s'+w[4:]) >= MIN_STEM:
        yield 'pe-', 's' + w[4:]
    if w.startswith('peng') and len(w[4:]) >= MIN_STEM:
        yield 'pe-', w[4:]
        yield 'pe-', 'k' + w[4:]
    if w.startswith('pen') and not w.startswith('peng') and len(w[3:]) >= MIN_STEM:
        yield 'pe-', w[3:]
        yield 'pe-', 't' + w[3:]
    if w.startswith('pem') and len(w[3:]) >= MIN_STEM:
        yield 'pe-', w[3:]
        yield 'pe-', 'p' + w[3:]
    if w.startswith('pe') and not any(w.startswith(p) for p in ('pen','pem','peng','peny')) and len(w[2:]) >= MIN_STEM:
        yield 'pe-', w[2:]

    # me- variants
    if w.startswith('meny') and len('s'+w[4:]) >= MIN_STEM:
        yield 'me-', 's' + w[4:]
    if w.startswith('meng') and len(w[4:]) >= MIN_STEM:
        yield 'me-', w[4:]
        yield 'me-', 'k' + w[4:]
    if w.startswith('men') and not w.startswith('meng') and len(w[3:]) >= MIN_STEM:
        yield 'me-', w[3:]
        yield 'me-', 't' + w[3:]
    if w.startswith('mem') and len(w[3:]) >= MIN_STEM:
        yield 'me-', w[3:]
        yield 'me-', 'p' + w[3:]
    if w.startswith('me') and not any(w.startswith(p) for p in ('men','mem','meng','meny')) and len(w[2:]) >= MIN_STEM:
        yield 'me-', w[2:]

    # suffix -an (skip loanword endings)
    if w.endswith('an') and len(w[:-2]) >= MIN_STEM and not is_loanword_suffix(w):
        yield '-an', w[:-2]

    # suffix -kan
    if w.endswith('kan') and len(w[:-3]) >= MIN_STEM and not is_loanword_suffix(w):
        yield '-kan', w[:-3]

    # suffix -i (strictest: skip loanword endings, require longer stem)
    if w.endswith('i') and len(w[:-1]) >= MIN_STEM and not is_loanword_suffix(w):
        yield '-i', w[:-1]


root_map_entry = {w['root']: w for w in words}

to_remove = []
for word in words:
    # Skip proper nouns / untranslated loanwords (gloss == root)
    if is_gloss_same_as_root(word, None):
        continue
    for prefix, stem in candidate_stems(word['root']):
        if stem in roots and stem != word['root']:
            to_remove.append((word['root'], word['gloss'], prefix, stem))
            break

print(f"Words to remove: {len(to_remove)}")
print()
for form, gloss, pfx, stem in sorted(to_remove)[:40]:
    print(f"  {form:25} ({gloss[:30]:30}) <- {pfx} + {stem}")
if len(to_remove) > 40:
    print(f"  ... and {len(to_remove) - 40} more")

print()
answer = input("Remove these from words.json? [y/N] ").strip().lower()
if answer == 'y':
    remove_set = {t[0] for t in to_remove}
    data['words'] = [w for w in words if w['root'] not in remove_set]
    data['meta']['count'] = len(data['words'])
    (root / 'data/words.json').write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8'
    )
    print(f"Done. {len(data['words'])} words remaining.")
else:
    print("Aborted — no changes made.")
