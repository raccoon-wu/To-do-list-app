// Promises represent the eventual result(resolve)/failure(reject) of an asynchronous operation
// Typically handles things that take time (reading files, api calls, querying database) without blocking the rest of the program

export const fetchAll = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};