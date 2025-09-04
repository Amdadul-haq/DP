// // src/lib/medicine.ts
// import pool from "./db";

// export interface Medicine {
//   id: number;
//   brand_name: string;
//   dosage_form: string;
//   generic: string;
//   strength: string | null;
//   manufacturer: string;
// }

// export async function getMedicines(): Promise<Medicine[]> {
//   const result = await pool.query("SELECT * FROM medicines ORDER BY brand_name ASC");
//   return result.rows;
// }

// export async function addMedicine(medicine: Omit<Medicine, "id">): Promise<Medicine> {
//   const result = await pool.query(
//     `INSERT INTO medicines (brand_name, dosage_form, generic, strength, manufacturer)
//      VALUES ($1, $2, $3, $4, $5)
//      RETURNING *`,
//     [medicine.brand_name, medicine.dosage_form, medicine.generic, medicine.strength, medicine.manufacturer]
//   );
//   return result.rows[0];
// }

// export async function updateMedicine(id: number, medicine: Partial<Omit<Medicine, "id">>): Promise<Medicine> {
//   // Build dynamic update query
//   const fields = Object.keys(medicine);
//   const values = Object.values(medicine);
//   const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(", ");
//   const result = await pool.query(
//     `UPDATE medicines SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
//     [...values, id]
//   );
//   return result.rows[0];
// }

// src/lib/medicine.ts
import pool from "./db";

export interface Medicine {
  id: number;
  brand_name: string;
  dosage_form: string;
  generic: string;
  strength: string | null;
  manufacturer: string;
}

// All medicines (full list, if needed)
export async function getMedicines(): Promise<Medicine[]> {
  const result = await pool.query(
    "SELECT * FROM medicines ORDER BY brand_name ASC"
  );
  return result.rows;
}

// Search medicines by brand_name (starts with input, max 15 results)
export async function searchMedicines(search: string): Promise<Medicine[]> {
  const result = await pool.query(
    `SELECT * FROM medicines 
     WHERE brand_name ILIKE $1 
     ORDER BY brand_name ASC 
     LIMIT 15`,
    [search + "%"] // starts with
  );
  return result.rows;
}

export async function addMedicine(
  medicine: Omit<Medicine, "id">
): Promise<Medicine> {
  const result = await pool.query(
    `INSERT INTO medicines (brand_name, dosage_form, generic, strength, manufacturer)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      medicine.brand_name,
      medicine.dosage_form,
      medicine.generic,
      medicine.strength,
      medicine.manufacturer,
    ]
  );
  return result.rows[0];
}

export async function updateMedicine(
  id: number,
  medicine: Partial<Omit<Medicine, "id">>
): Promise<Medicine> {
  const fields = Object.keys(medicine);
  const values = Object.values(medicine);
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 1}`)
    .join(", ");
  const result = await pool.query(
    `UPDATE medicines SET ${setClause} WHERE id = $${
      fields.length + 1
    } RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
}
