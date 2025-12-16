# Learn Hub Content

This directory contains all educational articles for the Montrose Myo Learn Hub.

## File Structure

- `index.json` - Registry of all articles with metadata
- `*.md` - Individual article content files in Markdown format

## Adding a New Article

1. Create a new `.md` file in this directory
2. Add an entry to `index.json` with slug, title, and tags
3. The article will automatically appear in the Learn Hub

## Updating Articles

Simply edit the `.md` files. Changes will be reflected immediately.

## Image Placeholders

Current placeholders in articles (marked with `#`):
- Photo A: Normal vs High-Arched Palate
- Photo B: The "Spot" (incisive papilla)
- Photo C: Vu and Hickey

To add real images:
1. Upload images to a public location
2. Replace `#` with the actual image URL

## Article Format

Use standard Markdown:
- `#` for H1 headings
- `##` for H2 headings  
- `###` for H3 headings
- `-` for bullet lists
- `**text**` for bold

Headings will automatically generate:
- Table of contents navigation
- Anchor links (for contextual linking from week pages)

## Contextual Linking

Edit `src/lib/learn.ts` to control which articles appear on which week pages.
