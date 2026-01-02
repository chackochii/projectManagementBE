import { db } from "../../config/database.js";

// ----------------------------------------------------
// 1️⃣ Add Client Service
// ----------------------------------------------------
export async function addClientService({ name, email, phone, address, amount }) {
  return await db.Client.create({
    name,
    email,
    phone,
    address,
    amount,
    status: "active",
  });
}

// ----------------------------------------------------
// 2️⃣ Get Clients Service
// ----------------------------------------------------
export async function getClientsService() {
  return await db.Client.findAll({
    order: [["createdAt", "DESC"]],
  });
}
