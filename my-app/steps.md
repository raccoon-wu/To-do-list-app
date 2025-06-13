# Plan:
- **SQLite** to store data. 

SQI can only run on the server since browsers have no access to SQLite databases for security reasons. So we need to make API calls from Next.js to access database.
- **Next.js** API routes to access database

Runs SQL on the server and returns the results as JSON, which is a format that the browser understands. The frontend would then fetch this JSON and show it to users.
- **TailwindCSS** for 🎨 pretty