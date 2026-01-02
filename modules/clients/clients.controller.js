import { addClientService, getClientsService } from "./clients.service.js";

// ----------------------------------------------------
// 1️⃣ Add Client
// ----------------------------------------------------
export const addClient = async (req, res) => {
  try {
    const { name, email, phone, address, amount } = req.body;

    if (!name || amount === undefined) {
      return res.status(400).json({ error: "Name and amount are required" });
    }

    const client = await addClientService({
      name,
      email,
      phone,
      address,
      amount,
    });

    res.json({
      message: "Client added successfully",
      client,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// ----------------------------------------------------
// 2️⃣ Get Clients
// ----------------------------------------------------
export const getClients = async (req, res) => {
  try {
    const clients = await getClientsService();
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
