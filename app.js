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
const clientAuthRoutes = require('./routes/clientAuthRoutes');
const productImageRoutes = require('./routes/productImageRoutes');
const ordersproductRoute =require("./routes/ordersproductRoute");
const contactRoutes = require('./routes/contactRoutes');

const listingRoutes = require("./routes/listingRoutes");
const propertycategoryRoutes = require("./routes/propertycategoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const listingImageRoutes = require('./routes/listingImageRouters');
const inquiriesRoutes = require('./routes/inquiriesRoutes');

const searchRoutes = require("./routes/searchRoutes");

const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use("/uploads", express.static("uploads"));
 
app.use('/api', auth);
app.use('/api/client', clientAuthRoutes);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/product-images', productImageRoutes);
app.use('/api/productorders', ordersproductRoute); 
app.use('/api/contact', contactRoutes);

app.use("/api/listings", listingRoutes);
app.use("/api/propertycategories", propertycategoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use('/api/listing-images', listingImageRoutes);
app.use('/api/inquiries', inquiriesRoutes);

app.use("/api/search", searchRoutes);

  app.get("/", (req, res) => {
    res.status(200).json({
      status: "200",
      author: "hblab",
      message: "Most welcome to our API contact us on +250789028283 or habaruremajules@gmail.com",
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
  