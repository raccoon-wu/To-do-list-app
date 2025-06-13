# 🖊️ SQLITE NOTES

1. Install SQLite extension from 'alexcvzz', then Press CTRL SHIFT P and select 'run query' to visuallize table

## Basic structure for CREATE TABLE statement in SQL

```SQL
CREATE TABLE table_name (
    column1_name COLUMN_TYPE [CONSTRAINTS],
    column2_name COLUMN_TYPE [CONSTRAINTS],
    ...
);
```

- COLUMN_TYPE can be INTEGER (no decimals), TEXT, REAL (decimals)

### Constraints:

- **NOT NULL** requires a value
- **PRIMARY KEY** means column must be unique and not null, otherwise error
- **UNIQUE** means all values must be different but can accept NULL values
- **DEFAULT** sets default value for columns even if it is omitted in `INSERT` statement
- **CHECK** ensures values in a column meet a specified condition, otherwise error


## Changing Data


- **INSERT** inserts rows into a table. Requires specifying table name, list the columns then provide corresponding values in the same order
```SQL
INSERT INTO table_name (column1_name, column2_name, ...)
VALUES (value1, value2, value3, ...)
```

- **UPDATE** modifies existing rows in a table. `WHERE` specifies which rows to update otherwise all rows will be updated!
```SQL
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
```

- **UPSERT** Not a seperate SQL command but a nickname for this pattern:
`INSERT ... ON CONFLICT ... DO UPDATE`.
This pattern inserts new row or updates existing ones with conflicts. Used to refresh old data or avoid manually checking if a row exists before deciding between `INSERT` or `UPDATE`.
```SQL
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...)
ON CONFLICT(conflict_column)
DO UPDATE SET
  column1 = excluded.column1,
  column2 = excluded.column2, ...;
```
- **DELETE** removes rows from a table. `WHERE` is also needed otherwise all rows are deleted!
```SQL
DELETE FROM table_name
WHERE condition;
```

- **REPLACE** replaces existing rows with same primary key or unique value, otherwise INSERTs
```SQL
REPLACE INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
```

- **RETURNING** returns data from a row that was just inserted, updated or deleted. Used to see the results of a query without doing a seperate SELECT
```SQL
-- returns all
RETURNING *;

-- returns specific columns
RETURNING column1, column2;
```

## SELECT Statement
Used to query the database and does not make any changes to the database. It is one of the most commonly used and complex statements in SQL(and SQLite), and can be used in conjunction with the following:

- **ORDER BY** clause to sort results, can be used with `DESC` (descending) and `ASC` (ascending).
```SQL
SELECT * FROM table_name
ORDER BY column1_name DESC;
```

- **SELECT DISTINCT** to query unique rows, removing duplicates
```SQL
SELECT DISTINCT column1, column2, ...
FROM table_name;
```
- **WHERE** filters rows based on one or more conditions, applied before `GROUP BY` clause.
```SQL
SELECT * FROM table_name
WHERE condition;
```
- **LIMIT OFFSET** constrain rows returned. For example, the following result would select 5 starting from the 11th row (offset 10).
```SQL
SELECT * FROM table_name
LIMIT 5 OFFSET 10;
```

- **GROUP BY** is used to group rows that have the same values, often used with aggregate functions like `COUNT()`, `SUM()`, `AVG()`, `MIN()`, and `MAX()` to calculate a value for each group.

Given db:

| product | amount |
| -------- | ------- |
| Apple | 25 |
| Pear | 67 |
| Apple | 14 |

To find total amount sold for each product:

```SQL
SELECT product, SUM(amount) AS total_amount
FROM table_name
GROUP BY product;
```
Would net the following result:
| product | total_amount |
| -------- | ------- |
| Apple | 39 |
| Pear | 67 |

- **HAVING** required to used with `GROUP BY` to filter groups based on specified condition, otherwise error. Applied after `GROUP BY` clause. Continuing from the example above:
```SQL
SELECT product, SUM(amount) AS total_amount
FROM table_name
GROUP BY product
HAVING SUM(amount) > 40;
```
Nets the following result where only pear is returned:
| product | total_amount |
| -------- | ------- |
| Pear | 67 |

- **INNER JOIN / LEFT JOIN** combines rows from two or more tables based on a related column between them.
```SQL
SELECT * FROM table_name
ORDER BY column1_name DESC;
```