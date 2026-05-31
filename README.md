# PollyGlot

PollyGlot is a small AI-powered translation chat app built as an OpenAI API integration project. It lets a user choose a target language, enter text, and receive a translated response in a styled chat interface.

The app is intentionally previewed with screenshots instead of a public live deployment because it depends on a server-side API key. Keeping it local avoids exposing an endpoint that could be spammed or abused.

## Preview

![PollyGlot app preview](docs/screenshots/pollyglot-preview.jpg)

## What It Does

- Translates user text into French, Spanish, or Japanese.
- Corrects obvious spelling and grammar issues before translating.
- Preserves the user's intended meaning, tone, punctuation, formatting, and emoji usage.
- Displays the conversation in a chat-style UI.
- Keeps API credentials on the server instead of exposing them in the browser.
- Uses a responsive layout with vertical-only scrolling and wrapping message bubbles.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Express
- OpenAI Responses API

## Project Structure

```text
PollyGlot/
|-- client/              # React + Vite frontend
|-- server/              # Express API server
|-- docs/screenshots/    # README preview assets
`-- README.md
```

## Local Setup

Clone the repository, then install dependencies in both app folders:

```bash
cd client
npm install

cd ../server
npm install
```

Create a `.env` file inside `server/`:

```bash
AI_URL=your_openai_compatible_base_url
AI_KEY=your_api_key
AI_MODEL=your_model_name
PORT=3000
```

Start the backend:

```bash
cd server
npm start
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Then open the local Vite URL, usually:

```text
http://127.0.0.1:5173/
```

## Scripts

Frontend:

```bash
cd client
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd server
npm start
npm run dev
```

## Notes

There is no public demo link by design. The project uses an API-backed translation route, and deploying it publicly without authentication or rate limiting would make the API key-backed endpoint easy to abuse.

For review purposes, the screenshot above serves as the project preview.
