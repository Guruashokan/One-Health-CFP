@echo off
title One Health Platform Startup
echo ==============================================
echo  Starting One Health Platform Full-Stack App  
echo ==============================================
echo.

:: Set port environment variable
set PORT=8080

:: Start the Node.js backend in a minimized command window
echo Launching Node.js backend server...
start /min cmd /c "node server.js"

:: Wait 2 seconds for server initialization
ping -n 3 127.0.0.1 >nul

:: Launch browser to localhost:8080
echo Opening One Health Platform in browser...
start http://localhost:8080

echo.
echo Application started successfully!
echo You can close this window now. Node.js is running in the background.
ping -n 4 127.0.0.1 >nul
exit
