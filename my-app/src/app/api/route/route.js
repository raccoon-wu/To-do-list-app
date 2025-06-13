import sqlite3 from "sqlite3";
import path from "path";

// Helper to get full path to data.db
function getDbPath() {
  return path.resolve(process.cwd(), "data.db");
}

export async function GET() {
  const dbPath = getDbPath();
  const db = new sqlite3.Database(dbPath);

  const sql = `SELECT * FROM data`;

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        reject(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
      } else {
        resolve(new Response(JSON.stringify(rows), { status: 200 }));
      }
    });
  });
}
