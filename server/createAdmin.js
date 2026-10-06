const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@organlink.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@12345",
      10
    );

    const admin = await User.create({
      name: "OrganLink Admin",
      email: "admin@organlink.com",
      password: hashedPassword,
      role: "admin",
      phone: "9999999999",
      organization: null,
    });

    console.log("Admin created successfully.");
    console.log("Email:", admin.email);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation error:", error);
    process.exit(1);
  }
};

createAdmin();