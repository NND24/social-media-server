const express = require("express");
require("dotenv").config();
require("express-async-errors");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const connectDB = require("./utils/connectDB");
const { errorHandler } = require("./middlewares/errorHandler");
const authRoute = require("./routes/auth.route");

const app = express();
connectDB();

app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);

app.use(errorHandler);

PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
