@echo off
echo ===================================================
echo     Investment Advisor Setup for Windows
echo ===================================================
echo.



echo.
echo Step 1: Creating data directory...
if not exist data mkdir data

echo.
echo Step 2: Creating environment file...
(
echo # Add your API keys below
echo GEMINI_API_KEY=
echo ANTHROPIC_API_KEY=
) > .env

echo.
echo Step 3: Installing dependencies...
call npm install

echo.
echo ===================================================
echo Setup complete!
echo.
echo Next steps:
echo 1. Add your API keys to the .env file
echo 2. Run 'npm run dev' to start the application
echo 3. Open http://localhost:5000 in your browser
echo ===================================================
echo.

pause