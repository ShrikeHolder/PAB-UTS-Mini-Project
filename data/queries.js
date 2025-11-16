import { db } from "./database";

export function getTransactionsByMonth(year, month) {
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

  const rows = db.getAllSync(
    `SELECT t.id, t.type, t.amount, t.date, t.desc, c.name AS category_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.date LIKE ?`,
    [`${monthStr}%`]
  );

  return rows;
}
