
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

// Import routers
const usersRouter = require('./routes/usersRouter');
const categoriesRouter = require('./routes/categoriesRouter');
const productsRouter = require('./routes/productsRouter');
const customersRouter = require('./routes/customersRouter');
const ordersRouter = require('./routes/ordersRouter');
const subscriptionsRouter = require('./routes/subscriptionsRouter');
const promotionsRouter = require('./routes/promotionsRouter');
const auth = require('./routes/authRoutes')

const app = express();

app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use("/uploads", express.static("uploads"));

app.use('/api', auth);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/promotions', promotionsRouter);


app.get("/", (req, res) => {
    res.status(200).json({
      status: "200",
      author: "Bambe group",
      message: "Most welcome to our API",
    });
  });
  
  db.getConnection()
    .then((connection) => {
      console.log("Connected to the database successfully.");
      connection.release();
  
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🔥🔥🔥`);
      });
    })
    .catch((error) => {
      console.error("Failed to connect to the database:", error.message);
      process.exit(1);
    });
  
  module.exports = app;
  