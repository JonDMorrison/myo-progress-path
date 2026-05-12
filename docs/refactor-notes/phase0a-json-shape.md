# Phase 0a — JSON shape

Total week entries: 50

## Top-level keys on a week object

- `week`: int — 3
- `module`: int — 2
- `title`: str — Module 2
- `program_variant`: str — frenectomy
- `introduction`: str — This module, we retrain your swallow.
- `objectives`: list — ['Strengthen posterior tongue muscles by practicing lingual palatal suction', 'I...
- `exercises`: list — [{'name': 'Lingual Palatal Suction', 'type': 'active', 'duration': '1 minute', '...
- `checklist`: list — [{'id': 'm2-video-first', 'label': 'First attempt videos submitted', 'type': 'ch...
- `tracking`: dict — {'nasal_breathing_percent': True, 'tongue_on_spot_percent': True, 'bolt_score': ...
- `requires_video_first`: bool — True
- `requires_video_last`: bool — True

## How is 'part' encoded?

- Any top-level key containing 'part': **False**

- String literal matches for 'Part 1/2/One/Two' across entire JSON: **0**

## Exercise structure (one sample)

- `name`
- `type`
- `duration`
- `frequency`
- `props`
- `description`
- `compensations`
- `demo_video_url`
