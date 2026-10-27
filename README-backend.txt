PhoneMarket KE — PostgreSQL backend

The backend creates its PostgreSQL table automatically when it starts.

Files:
- server.js: API and automatic database setup
- package.json: dependencies and start command
- schema.sql: database schema reference

Render steps:
1. Create a Render PostgreSQL database.
2. Open your backend Web Service > Environment.
3. Add DATABASE_URL and paste the database's Internal Database URL. Keep it private.
4. Keep PGSSL unset for a Render internal connection unless your provider instructions require TLS.
5. Replace server.js and package.json in your GitHub repository root with these files; keep index.html.
6. Build Command: npm install. Start Command: npm start.
7. Open https://YOUR-BACKEND-URL/health. Expected: {"status":"ok","database":"connected"}.

API:
- GET /api/phones lists active listings.
- POST /api/phones creates a listing. JSON fields: brand, model, price, condition, storage, location, seller, whatsapp, description, photo_url.

Never commit DATABASE_URL or a database password to GitHub.
The frontend must also be updated to call this API; the backend alone does not automatically change website behavior.
photo_url should be a hosted image URL; this backend does not upload image files.
