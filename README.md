# 🌿 BioScan — AI Plant Disease Detector

BioScan is an AI-powered plant health scanner built with React. Upload or take a photo of any plant to get an instant diagnosis, care tips, and treatment recommendations.

## Features

- Scan plants via photo upload or camera
- AI-powered disease & pest detection
- Treatment plans (immediate, long-term, preventive)
- Disease library with 15+ conditions
- Plant care profiles & reminders
- Personal garden history

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/bioscan.git
cd bioscan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

```bash
cp .env.example .env
```

Open `.env` and paste your [Anthropic API key](https://console.anthropic.com/).

### 4. Run the app

```bash
npm start
```

App will open at `http://localhost:3000`

## Deployment

You can deploy this for free on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).  
Just connect your GitHub repo and add `REACT_APP_ANTHROPIC_KEY` as an environment variable in the platform's settings.

## Tech Stack

- React 18
- CSS-in-JS (inline styles)

## License

MIT
