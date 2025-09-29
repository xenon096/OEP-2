@echo off
echo Stopping all Exam Portal services...

echo Killing Java processes (Spring Boot services)...
taskkill /f /im java.exe

echo Killing Node.js processes (Frontend)...
taskkill /f /im node.exe

echo All services stopped!
pause