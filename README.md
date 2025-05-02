# Investwise: AI-Powered Investment Advisory Platform

An intelligent investment advisory platform providing personalized, real-time financial insights using artificial intelligence, machine learning, and market data analytics. The system offers tailored recommendations based on user profiles, risk preferences, and current market conditions.

## Key Features

- **AI-Powered Advice**: Multi-model integration with Gemini and Claude for intelligent recommendations
- **Machine Learning Analysis**: Real-time market predictions and sentiment analysis
- **Market Data Integration**: Live market data for various global markets (India, US, UK, etc.)
- **Portfolio Optimization**: Dynamic asset allocation based on risk profile and market conditions
- **Goal Tracking**: Set and monitor financial goals with visual progress indicators
- **Chat Interface**: Natural language interaction for financial advice
- **Country-Specific Insights**: Tailored recommendations for different market regions
- **Cross-Platform Compatibility**: Runs on Windows, macOS, and Linux

## Quick Installation

### Windows Setup (Recommended)
1. Extract the downloaded ZIP file
2. Double-click `setup.cmd` to run the installation script
3. Run `npm run dev` to start the application
4. Open `http://localhost:5000` in your browser

### macOS/Linux Setup
For macOS and Linux users, you'll need to:
1. Extract the downloaded ZIP file
2. Install Node.js version 18 or higher
3. Run `npm install` in the project directory
4. Run `npm run dev` to start the application
5. Open `http://localhost:5000` in your browser

## Detailed Installation Instructions

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Usually comes with Node.js
- **Modern web browser**: Chrome, Firefox, Edge, or Safari

### Windows Setup Process
The `setup.cmd` script handles everything for you:
1. Checks your Node.js version (must be 18+)
2. Creates necessary directories and configuration files
3. Sets up a `.env` file for your API keys
4. Adjusts settings for Windows compatibility
5. Installs all required dependencies

### Manual Installation (All Platforms)
If you prefer a manual installation:
1. Ensure Node.js 18+ is installed
2. Create a `.env` file with your API keys (optional)
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the server

## API Keys (Optional)

The application has fallback mechanisms and will work without API keys, but for optimal experience:

- **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/)
- **Claude API Key**: Get from [Anthropic Console](https://console.anthropic.com/)

Add these keys to your `.env` file:
```
GEMINI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Technical Architecture

The application uses a clean architecture:

- **Frontend**: React with TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Express.js server with RESTful API endpoints
- **Data Storage**: File-based local storage
- **State Management**: React hooks and TanStack Query
- **AI Integration**: Gemini API and Claude API with fallback mechanisms
- **ML Component**: Polynomial regression for market prediction

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start
```

## Data Privacy

This application stores all user data locally and only sends anonymized queries to AI providers when generating investment advice.

## Troubleshooting

- **Port conflicts**: Edit `.env` and set `PORT=3000` (or another free port)
- **Server won't start**: Ensure Node.js version 18+ is installed
- **Client errors**: Check browser console for JavaScript errors
- **Host restrictions**: The project is designed to run locally. If you see "host not allowed" errors in development environments, this is expected and normal. **This is not an error** - when you download and run locally with setup.cmd, the application will work correctly without any modifications.


> **The application is designed to run locally on your computer after downloading.** Simply follow these steps:
> 
> 1. Download the project files
> 2. Run setup.cmd on your Windows computer
>    - This automatically changes `server/index.ts` to use 'localhost' instead of '0.0.0.0'
> 3. Start the application with `npm run dev`
> 4. Open http://localhost:5000 in your browser
> 
> **If you prefer to manually make the change:**
> Open `server/index.ts` and change:
> ```javascript
> httpServer.listen(Number(port), '0.0.0.0', () => {
>   log(`Server running at http://localhost:${port}`);
> });
> ```
> to:
> ```javascript
> httpServer.listen(Number(port), 'localhost', () => {
>   log(`Server running at http://localhost:${port}`);
> });
> ```
> 
> This change is critical for Windows compatibility and is automatically done by setup.cmd.

## Credits

- Market data provided by Yahoo Finance API
- ML algorithms built with `ml-regression` library
- Sentiment analysis using `sentiment` package
- UI components from shadcn/ui