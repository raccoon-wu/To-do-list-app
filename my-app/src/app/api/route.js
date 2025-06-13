import sqlite3 from "sqlite3";

export async function GET(req, res) {

  const db = new sqlite3.Database("../../../data.db");
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
