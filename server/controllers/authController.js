const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Organization = require("../models/Organization");

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            role,
            organization,
        } = req.body;

        // 1. Check required fields
        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({
                message: "Please provide all required user fields",
            });
        }

        // 2. Check whether email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists",
            });
        }

        // 3. Validate role
        if (!["hospital", "organBank"].includes(role)) {
            return res.status(400).json({
                message: "Invalid registration role",
            });
        }

        // 4. Organization is required for hospital/organBank
        if (!organization) {
            return res.status(400).json({
                message: "Organization details are required",
            });
        }

        // 5. Check organization registration number
        const existingOrganization =
            await Organization.findOne({
                registrationNumber: organization.registrationNumber,
            });

        if (existingOrganization) {
            return res.status(409).json({
                message: "Organization already registered",
            });
        }

        // 6. Create organization
        const newOrganization = await Organization.create({
            ...organization,
            type: role,
        });

        // 7. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 8. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            organization: newOrganization._id,
        });

        // 9. Return response
        res.status(201).json({
            message: "Registration successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
            },
        });

    } catch (error) {
        console.error("Registration Error:", error);

        res.status(500).json({
            message: "Server error during registration",
        });
    }
};

const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        // 2. Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // 3. Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been deactivated",
            });
        }

        // Check if user's organization is active
        if (user.organization) {
            const organization = await Organization.findById(
                user.organization
            );

            if (!organization) {
                return res.status(403).json({
                    message: "Your organization no longer exists",
                });
            }

            if (!organization.isActive) {
                return res.status(403).json({
                    message: "Your organization has been deactivated",
                });
            }
        }

        // 4. Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // 5. Create JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                organizationId: user.organization,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        // 6. Return response
        res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            message: "Server error during login",
        });
    }
};

module.exports = {
    register,
    login,
};