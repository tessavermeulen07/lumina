---
name: Combinatie A emoties
overview: Twinword op vertaalde tekst als primaire bron voor balkjes, OpenAI-gevoelens (intensity) als fallback en voor Nederlandse labels per smiley-kolom — zonder extra OpenAI-call door vertaling in de bestaande analyse-prompt.
todos:
  - id: emotion-scores-util
    content: "Nieuw src/lib/ai/emotion-scores.ts: merge, scoresFromFeelings, groupFeelingsByColumn, isEmptyTwinwordScores"
    status: completed
  - id: analyze-entry-pipeline
    content: "analyze-entry.ts: prompt uitbreiden (english_plain_text, vaste feeling keys), volgorde OpenAI → Twinword → merge"
    status: completed
  - id: twinword-tools
    content: "twinword.ts + tools.ts: EN-input, agent-pad met vertaling/fallback"
    status: completed
  - id: weekly-aggregation
    content: "get-weekly-insights.ts: feelingsByColumn + runtime fallback voor null emotion_scores"
    status: completed
  - id: emotional-landscape-ui
    content: "EmotionalLandscape + inzichten page: labels per smiley-kolom, balken uit gemergde scores"
    status: completed
isProject: false
---

# Combinatie A: Twinword + OpenAI-gevoelens (fallback)

Zie dit document voor de volledige specificatie.

## Samenvatting

- OpenAI levert NL-analyse + `english_plain_text` + `feelings` met vaste keys
- Twinword analyseert Engelse tekst → `emotion_scores`
- `mergeEmotionScores` combineert Twinword + feelings-intensity (fallback)
- Inzichten-UI: labels per smiley-kolom, balken uit gemergde scores
