# Quick Fix Guide

## Error: "XMLHttpRequest onError callback"

This error means Flutter app cannot connect to backend.

### Checklist:

1. **Backend Running?**
   ```bash
   # Check if backend is running on port 3000
   # Open new terminal:
   cd C:\Users\ang\.gemini\antigravity\scratch\cinepay-backend
   npm run dev
   
   # Should show: "🚀 CinePay API running on http://localhost:3000"
   ```

2. **Test Backend Directly**
   ```bash
   # Open browser: http://localhost:3000/health
   # Should return: {"status":"OK","timestamp":"..."}
   ```

3. **CORS Fix Applied**
   - Already updated app.js with proper CORS config
   - Restart backend server

4. **Flutter App Port**
   ```bash
   # Check what port Flutter is running on
   # Should be: http://localhost:54319 (or similar)
   ```

5. **Restart Both**
   ```bash
   # Terminal 1: Backend
   cd cinepay-backend
   npm run dev
   
   # Terminal 2: Flutter (hot restart)
   Press 'R' in Flutter terminal
   # or full restart:
   flutter run -d chrome
   ```

### Still not working?

Check browser console (F12) for detailed error messages.
