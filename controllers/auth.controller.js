const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const createError = require("../utils/createError");
const sendEmail = require("./email.controller");
const crypto = require("crypto");

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "3d" });
};

const register = async (req, res, next) => {
  try {
    const { firstName, surName, email, password, birth, gender } = req.body;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      const newUser = await User.create({
        firstName,
        surName,
        fullName: firstName + " " + surName,
        email,
        password,
        birth,
        gender,
      });
      res.json(newUser);
    } else {
      next(createError(401, "User Already Exists"));
    }
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      next(createError(400, "Please fill all the fields"));
    }

    const findUser = await User.findOne({ email: email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findUser._id);
      await User.findByIdAndUpdate(
        findUser._id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });
      res.json({
        _id: findUser?._id,
        token: generateAccessToken(findUser?._id),
      });
    } else {
      return next(createError(401, "Invalid username or password!"));
    }
  } catch (err) {
    next(err);
  }
};

const getRefreshToken = async (req, res, next) => {
  const cookie = req?.cookies;
  if (!cookie?.refreshToken) return next(createError(404, "No refresh token in cookies"));
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) return next(createError(404, "No refresh token present in database or not matched"));
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) return next(createError("400", "There is something wrong with refresh token"));
    const accessToken = generateAccessToken(user?._id);
    res.json({ accessToken });
  });
};

const logout = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) return next(createError(400, "No refresh token in cookies"));

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (user) {
      await User.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: null } });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: true,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;

  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    await user.save();
    res.json("Password updated successfully!");
  } else {
    res.json(user);
  }
};

const forgotPasswordToken = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(create("404", "User not found with this email"));

  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `
      <p>Please follow this link to reset your password. This link is valid till 10 minutes from now.</p>
      <button>
        <a href='http://localhost:3000/reset-password/${token}'>Click Here</>
      </button>
    `;
    const data = {
      to: email,
      text: "",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmail(data);
    res.json("Send email successfully");
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(create("400", "Token expired, please try again later"));
  user.password = password;
  (user.passwordResetToken = undefined), (user.passwordResetExpires = undefined);
  await user.save();
  res.json("Reset password successfully");
};

module.exports = { register, login, getRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword };
