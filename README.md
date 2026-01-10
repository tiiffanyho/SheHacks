# ReceiptJars

ReceiptJars is a React + Vite web app for turning receipts and photos into a memory collage. Upload receipts to auto-extract purchase details with Gemini, add photos and stickers, and see a simple spending breakdown by category.

## Features

- Receipt uploads with AI-powered extraction (merchant, date, total, category, items)
- Photo uploads and draggable collage items
- Stickers for quick decoration
- Spending summary by category

## Tech stack

- React + TypeScript
- Vite
- Zustand state management
- Gemini API for receipt analysis

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create a `.env` file in the project root with your Gemini API key:

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

### 3) Run the app

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Build for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project structure

- `src/pages/Home.tsx`: main collage workflow and receipt handling
- `src/services/gemini.ts`: Gemini API integration and receipt parsing
- `src/store.ts`: Zustand store for collage items and totals
- `src/styles/`: component-level styles

## Notes

- Receipt analysis depends on the Gemini API and requires a valid API key.
- If the API rate limits or a model is unavailable, the app falls back to other Gemini models.
