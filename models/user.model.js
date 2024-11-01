const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

var userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    surName: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mobile: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    birth: {
      type: Date,
      require: true,
    },
    gender: {
      type: String,
      enum: ["female", "male", "other"],
      require: true,
    },
    avatar: [
      {
        url: String,
        createdAt: Date,
      },
    ],
    cover: [
      {
        url: String,
        createdAt: Date,
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sentFriendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", function (next) {
  if (this.isNew && !this.avatar.length) {
    this.avatar.push({ url: "https://antimatter.vn/wp-content/uploads/2022/11/anh-avatar-trang-fb-mac-dinh.jpg" });
  }
  if (this.isNew && !this.cover.length) {
    this.cover.push({ url: "https://data.pixiz.com/output/user/frame/preview/400x400/9/2/2/1/2071229_96fa2.jpg" });
  }
  next();
});

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
