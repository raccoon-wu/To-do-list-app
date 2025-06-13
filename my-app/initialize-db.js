console.log("initialize-db.js triggered");

// loads sqlite3 module and .verbose() gives more detailed logging
const sqlite3 = require("sqlite3").verbose();
let sql;

// creates new SQLite database connection with a callback function logging errors to the console
const db = new sqlite3.Database("./data.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) { return console.error(err.message); }
    console.log("Database connected");
});

// .serialize does not run queries itself but ensures operations are executed sequentially in the order they are written
// whilst javascript execute code sequentially, operations in sqlite3 are asynchronous (does not wait for each other to finish before starting the next one)
db.serialize(() => {

    // CREATE TABLE will only execute if table does not exist yet, IF NOT EXISTS safeguards against errors if table exists already
    sql = `
    CREATE TABLE IF NOT EXISTS data (
    id INTEGER PRIMARY KEY, 
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'Pending'
    );`;

    // .run executes single SQL statements like INSERT, UPDATE or DELETE. 
    // Used to run queries that modify the database, not return results.
    db.run(sql, (err) => {
        if (err) { return console.error(err.message); }
        console.log("Created data table");
    });

    // deletes all data from the table but keeps the table itself
    sql = `DELETE FROM data;`;
    db.run(sql, (err) => {
        if (err) { return console.error(err.message); }
        console.log("All rows deleted from data table");
    })

    const tester1 = [
        "Grocery run",
        "Grab milk, egg, onions and pasta",
        "19/06/2025",
    ];

    const tester2 = [
        "Book tickets",
        "Melbourne to Hong Kong, preferably in the morning",
        "02/05/2026"
    ];

    const tester3 = [
        "Visit dentist",
        "",
        "28/03/2026"
    ];

    const insertSql = `INSERT INTO data(title, description, due_date) VALUES(?,?,?)`;

    db.run(insertSql, tester1, (err) => {
        if (err) { return console.error(err.message); }
        console.log(tester1[0] + " is logged.");
    })

    db.run(insertSql, tester2, (err) => {
        if (err) { return console.error(err.message); }
        console.log(tester2[0] + " is logged.");
    })

    db.run(insertSql, tester3, (err) => {
        if (err) { return console.error(err.message); }
        console.log(tester3[0] + " is logged.");
    })

    db.close((err) => {
        if (err) { return console.error(err.message); }
        console.log("Database is closed.");
    });
})