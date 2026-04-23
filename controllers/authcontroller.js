const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../services/mailService");

exports.registerUser = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, role } = req.body;

    // check user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role || "customer";
    const isPrivilegedRole = ["admin", "manager", "superadmin"].includes(userRole);

    // Check if this is the first user ever
    const totalUsers = await pool.query("SELECT COUNT(*) FROM users");
    const isFirstUser = parseInt(totalUsers.rows[0].count) === 0;

    if (isPrivilegedRole && !isFirstUser) {
      return res.status(403).json({
        message: "Registration of privileged roles via the API is forbidden. These must be added directly via the database.",
      });
    }

    const finalRole = isFirstUser ? "admin" : userRole;

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // insert user (unverified)
    const newUser = await pool.query(
      "INSERT INTO users(name,email,password,role,otp,otp_expires,is_verified) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [name, email, hashedPassword, finalRole, otp, otpExpires, false]
    );

    // send OTP asynchronously so it doesn't hang the request on restrictive hosts like Render.
    // We also log the OTP directly to the server terminal so you can verify accounts without needing the email!
    console.log(`\n================================`);
    console.log(`[DEV MODE] OTP for ${email} is: ${otp}`);
    console.log(`================================\n`);
    
    sendOTPEmail(email, otp).catch(err => console.error("Background email failed:", err.message));

    res.status(201).json({
      message: "User registered. Please verify your OTP sent to email.",
      email: email,
      is_verified: false
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      error: "Internal Server Error during login",
      message: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const userData = user.rows[0];

    if (userData.is_verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (userData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(userData.otp_expires)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Mark as verified
    await pool.query(
      "UPDATE users SET is_verified=true, otp=NULL, otp_expires=NULL WHERE email=$1",
      [email]
    );

    res.status(200).json({ message: "Email verified successfully. You can now login." });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (user.rows[0].is_blocked) {
      return res.status(403).json({
        message: "Your account has been temporarily suspended by an administrator.",
      });
    }

    // check if verified
    if (!user.rows[0].is_verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const token = jwt.sign(
      {
        id: user.rows[0].id,
        role: user.rows[0].role,
      },
      process.env.SECRET_KEY || "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: user.rows[0],
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      error: "Internal Server Error during login",
      message: error.message,
    });
  }
};