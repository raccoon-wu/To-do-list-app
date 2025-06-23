//custom HTTP request handler returning custom Response with JSON data/error message
import sqlite3 from "sqlite3";
import path, { resolve } from "path";
import { error } from "console";


function getDbPath() {
  return path.resolve(process.cwd(), "data.db");
}

//custom GET request handler that fetches all from db
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

// custom POST request handler for adding new task with all parameters required
// once updated, pull everything from db again to refresh list
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

// custom DELETE request handler where if an ID is provided, delete task associated with id
// error handling is present if id is missing
export async function DELETE(req) {

  const db = new sqlite3.Database(getDbPath());
  const body = await req.json();
  const { id } = body;
  const sql = `DELETE FROM data WHERE id = ?`;

  if (!id ) {
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

// custom PATCH request handler allowing edits, where all fields are optional (if provided, added to update [])
export async function PATCH(req) {
  const db = new sqlite3.Database(getDbPath());
  const body = await req.json();

  const { id, title, description, due_date, status: taskStatus } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID' }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let updates = [];
  let values = [];

  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }

  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }

  if (due_date !== undefined) {
    updates.push("due_date = ?");
    values.push(due_date);
  }

  if (taskStatus !== undefined) {
    updates.push("status = ?");
    values.push(taskStatus);
  }

  if (updates.length === 0) {
    return new Response(JSON.stringify({ error: 'No fields to update' }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Push ID to the end for the WHERE clause
  values.push(id);

  const sql = `UPDATE data SET ${updates.join(", ")} WHERE id = ?`;

  console.log("PATCH SQL:", sql);
  console.log("PATCH VALUES:", values);

  return new Promise((resolve) => {
    db.run(sql, values, function (err) {
      if (err) {
        console.error("DB error:", err); 
        return resolve(new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }));
      }

      db.all("SELECT * FROM data", [], (err, rows) => {
        db.close();
        if (err) {
          console.error("DB read error:", err); 
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
}