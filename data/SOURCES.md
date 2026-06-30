# Data Sources

## words.json

**License:** [Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)](https://creativecommons.org/licenses/by-sa/3.0/legalcode)

This file is derived from the **English-Bahasa Indonesia FreeDict+WikDict dictionary** (version 2025.11.23, 15,262 headwords), which is itself derived from:

- [Wiktionary](https://www.wiktionary.org/) — the free dictionary
- [DBnary](http://kaiko.getalp.org/about-dbnary/) — structured extraction of Wiktionary data
- [WikDict](http://www.wikdict.com/) — bilingual dictionary generation from DBnary
- [FreeDict](https://freedict.org/) — open dictionary project, maintainer Karl Bartel

The original dictionary was downloaded from:
`https://download.freedict.org/dictionaries/eng-ind/2025.11.23/freedict-eng-ind-2025.11.23.src.tar.xz`

The data was inverted (English→Indonesian to Indonesian→English) and reformatted as JSON using the extraction script at `scripts/extract_dict.py`.

## affixes.json

**License:** authored by the project contributors.

Hand-authored reference data on Bahasa Indonesia affix rules and nasal assimilation patterns, based on standard Indonesian grammar descriptions.

## annotations.json

**License:** authored by the project contributors.

Hand-curated per-word affix applicability and derived meanings. Grows incrementally as words are annotated.
