# Inzichten als input voor voorbeeldvragen (niet tonen)

## Probleem

`AskLuminaSection` toont opgeslagen inzichten onder de vraag-sectie. De bedoeling was dat `ai_insights` **achter de schermen** dienen als context voor gepersonaliseerde voorbeeldvragen (chips), niet als zichtbare content.

## Gewenste flow

1. `getLuminaDashboardQuestions` op `/vandaag`
2. Haalt `getRecentInsights` intern op
3. Genereert chips via AI (primair) of regelgebaseerde fallback
4. Vult aan met generieke DB-vragen indien nodig

## Bestanden

| Actie | Bestand |
|-------|---------|
| Nieuw | `lib/ai/get-lumina-dashboard-questions.ts` |
| Wijzig | `components/dashboard/AskLuminaSection.tsx` |
| Wijzig | `components/dashboard/GoalsAndLuminaRow.tsx` |
| Wijzig | `app/(app)/vandaag/page.tsx` |

## Status

Geïmplementeerd.
