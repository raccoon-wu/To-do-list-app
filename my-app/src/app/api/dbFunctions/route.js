// src/app/api/dbFunctions/route.js
import sqlite3 from "sqlite3";
import path, { resolve } from "path";
import { error } from "console";

function getDbPath() {
  return path.resolve(process.cwd(), "data.db");
}

export async function GET() {
  const db = new sqlite3.Database(getDbPath());

  return new Promise((resolve) => {
    db.all("SELECT * FROM data", [], (err, rows) => {
      db.close();
      if (err) {
        return resolve(new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }));
      }
      resolve(new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }));
    });
  });
};

export async function POST(req) {
  const db = new sqlite3.Database(getDbPath());
  const body = await req.json();
  const { title, description, due_date, status } = body;

  const sql = `INSERT INTO data (title, description, due_date, status) VALUES (?, ?, ?, ?)`;

  return new Promise((resolve) => {
    db.run(sql, [title, description, due_date, status], function (err) {
      if (err) {
        return resolve(new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }));
      }

      db.all("SELECT * FROM data", [], (err, rows) => {
        db.close();
        if (err) {
          return resolve(new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }));
        }
        resolve(new Response(JSON.stringify(rows), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }));
      });
    });
  });
};

export async function DELETE(req) {

  const db = new sqlite3.Database(getDbPath());
  const body = await req.json();
  const { id } = body;
  const sql = `DELETE FROM data WHERE id = ?`;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID' }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Promise((resolve) => {
    db.run(sql, [id], function (err) {
      if (err) {
        return resolve(new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }));
      }

      db.all("SELECT * FROM data", [], (err, rows) => {
        db.close();
        if (err) {
          return resolve(new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }));
        }

        resolve(new Response(JSON.stringify(rows), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }));
      });
    });
  });
};

export async function PATCH(req) {
  const db = new sqlite3.Database(getDbPath());
  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) {
    return new Response(JSON.stringify({ error: 'Missing ID or status' }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Promise((resolve) => {
    db.run("UPDATE data SET status = ? WHERE id = ?", [status, id], function (err) {
      if (err) {
        return resolve(new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }));
      }

      db.all("SELECT * FROM data", [], (err, rows) => {
        db.close();
        if (err) {
          return resolve(new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }));
        }

        resolve(new Response(JSON.stringify(rows), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }));
      });
    });
  });
};
