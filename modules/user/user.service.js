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
    { expiresIn: "17d" }
  );
};

export const createUser = async (data) => {
    const User = getUserModel(); 
  const { name, email, password, role, address, phone, identification,hourlyRate,monthlySalary } = data;

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
    hourlyRate: hourlyRate || 0,
    monthlySalary: monthlySalary || null
  });
};

export const loginUser = async (email, password) => {
      const User = getUserModel(); 
  const user = await User.findOne({ where: { email, status: "active" }, });
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

export const clientLoginUser = async (email, password) => {
  const User = getUserModel();

  const user = await User.findOne({
    where: {
      email,
      status: "active",
      role: "client"
    }
  });

  if (!user) {
    throw new Error("Client account not found");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  return { user, token };
};

export const getUsers = async () => {
  const User = getUserModel();

  return await User.findAll({
    where: {
      status: 'active'
    }
  });
};


export const getUserById = async (id) => {
  const User = getUserModel();
  return await User.findByPk(id);
};

export const updateUser = async (id, data) => {
  const User = getUserModel();

  const updateData = { ...data };

  if (!updateData.password) {
    delete updateData.password;
  } else {
    const saltRounds = 10;
    updateData.password = await bcrypt.hash(updateData.password, saltRounds);
  }

  await User.update(updateData, { where: { id } });

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


export const softDeleteUser = async (id) => {
  const User = getUserModel();
  const user = await User.findByPk(id);
  if (!user) return null;

  // Mark user as blocked instead of deleting
  user.status = "blocked";
  await user.save();
  return true;
};
