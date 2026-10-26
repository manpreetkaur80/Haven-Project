
// const express = require("express");
// const cors = require("cors");

// require("dotenv").config();

// const productRoutes = require("./routes/productRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("Welcome to HAVEN API!");
// });

// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// module.exports = app;


const express = require("express");
const cors = require("cors");

require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to HAVEN API!");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;
