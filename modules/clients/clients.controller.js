import { addClientService, getClientsService, getClientBilling, updateClientService, deleteClientService} from "./clients.service.js";

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


export const getClientBillingController = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.query;

    const billing = await getClientBilling(clientId, { startDate, endDate });
    res.json(billing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}


export const editClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { name, email, phone, address, amount } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: "Client ID is required" });
    }

    // You need to implement this service in clients.service.js
    const updatedClient = await updateClientService(clientId, {
      name,
      email,
      phone,
      address,
      amount,
    });

    if (!updatedClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

export const deleteClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ error: "Client ID is required" });
    }

    // You need to implement this service in clients.service.js
    const deleted = await deleteClientService(clientId);

    if (!deleted) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
