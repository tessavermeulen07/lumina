---
name: Analyse UI styling
overview: Styling-updates voor analyse-weergave (na schrijven + geschiedenis-modal), Invoer-datumnotatie, en Lumina-antwoordblokken zonder datum/tijd maar met actielabel.
todos:
  - id: analysis-content
    content: "EntryAnalysisContent: Inzicht label, witte tags, frameReflection prop"
    status: completed
  - id: date-format
    content: "history-format.ts: formatEntryDateCompact helper"
    status: completed
  - id: entry-modal
    content: "EntryDetailModal: frameReflection + nieuwe datum rechts op Invoer-tab"
    status: completed
  - id: journal-flow-ai
    content: "JournalFlow: geen datum/tijd bij Lumina-antwoorden, actielabel rechts"
    status: completed
isProject: false
---

# Analyse- en geschiedenis-UI styling

Zie dit document voor de volledige specificatie.

## Samenvatting

- **EntryAnalysisContent** (`src/components/features/history/EntryAnalysisContent.tsx`): `Kerninzicht` → Inzicht; witte tags voor gevoelens/personen/thema's; optionele `frameReflection` prop voor geschiedenis-modal
- **EntryDetailModal** (`src/components/features/history/EntryDetailModal.tsx`): compacte datum rechts op Invoer-tab (`DI 16 JUN · 14:32`); Analyse-tab met `frameReflection`
- **JournalFlow** (`src/components/features/journal/JournalFlow.tsx`): Lumina-blokken tonen actielabel rechts (Vraag, Ga dieper, …), geen tijdstempel meer
