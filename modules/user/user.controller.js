import * as userService from "./user.service.js";

export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
       console.log("HIT /users/login");
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);
    console.log("Password received:", password);
    const data = await userService.loginUser(email, password);

    res.json({
      message: "Login successful",
      token: data.token,
      user: data.user,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const clientLoginUser = async (req, res) => {
  try {
    console.log("HIT /users/client-login");

    const { email, password } = req.body;

    const data = await userService.clientLoginUser(email, password);

    res.json({
      message: "Client login successful",
      token: data.token,
      user: data.user,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
};

export const getUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  user ? res.json(user) : res.status(404).json({ error: "User not found" });
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const user = await userService.updateUser(id, updatedData);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: mark user as 'blocked'
    const userDeleted = await userService.softDeleteUser(id);

    if (!userDeleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User blocked successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password){
      return res.status(400).json({ error: "Email and password are required" });
    }
    const data = await userService.loginAdminService(email, password);

    res.json({
      message: "Login successful",
      token: data.token,
      user: data.user,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const user = await userService.updateUserStatus(id, status);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User status updated", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
