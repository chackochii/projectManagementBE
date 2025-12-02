import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {db} from "../../config/database.js";

const getUserModel = () => db.User;  


// const User = db.User;

// 🔐 Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const createUser = async (data) => {
    const User = getUserModel(); 
  const { name, email, password, role, address, phone, identification } = data;

  const exists = await User.findOne({ where: { email } });
  if (exists) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(password, 10);

  return await User.create({
    name,
    email,
    password: hashed,
    role,
    address,
    phone,
    identification,
  });
};

export const loginUser = async (email, password) => {
      const User = getUserModel(); 
  const user = await User.findOne({ where: { email } });
  if(user){
    console.log("User found:", user.email);
  }
  if (!user) throw new Error("Invalid email or password");

  const match = await bcrypt.compare(password, user.password);
  if(match){
    console.log("Password match successful for user:", user.email);
  }
  if (!match) throw new Error("Invalid email or password");

  const token = generateToken(user);

  return { user, token };
};

export const getUsers = async () => {
      const User = getUserModel(); 
  return await User.findAll();
};

export const getUserById = async (id) => {
  const User = getUserModel();
  return await User.findByPk(id);
};

export const updateUser = async (id, data) => {
      const User = getUserModel();
  await User.update(data, { where: { id } });
  return await User.findByPk(id);
};

export const deleteUser = async (id) => {
      const User = getUserModel();
  return await User.destroy({ where: { id } });
};



export const loginAdminService = async (email, password) => {
  const User = getUserModel(); 
  const user = await User.findOne({ where: { email } });
  if(user){
    console.log("User found:", user.email);
  }
  if (!user || user.role !== "admin") throw new Error("Invalid email, password, or not an admin");

  const match = await bcrypt.compare(password, user.password);
  if(match){
    console.log("Password match successful for user:", user.email);
  }
  if (!match) throw new Error("Invalid email or password");

  const token = generateToken(user);

  return { user, token };
};

export const updateUserStatus = async (id, status) => {
      const User = getUserModel();
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }
  user.status = status;
  await user.save();
  return user;
};