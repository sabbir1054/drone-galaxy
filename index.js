const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//MONGODB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xyvia.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("drone-galaxy");
    const usersCollection = database.collection("users");
    const productsCollection = database.collection("products");
    const commentsCollection = database.collection("comments");
    const ordersCollection = database.collection("orders");

    //Get all products API
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });
    //Get comments API
    app.get("/comments", async (req, res) => {
      const cursor = commentsCollection.find({});
      const comments = await cursor.toArray();
      res.send(comments);
    });

    //post user
    app.post("/users", async (req, res) => {
      const user = req.body;
      user.role = "user";
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    //get single user
    app.get("/users/:emailId", async (req, res) => {
      const id = req.params.emailId;
      const query = { email: id };
      const user = await usersCollection.findOne(query);
      res.json(user);
    });

    //Get Single product Api
    app.get("/purchases/:productId", async (req, res) => {
      const id = req.params.productId;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.json(product);
    });
      
      
    //get all orders
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    //Get single user all orders
    app.get("/userOrders/:email", async (req, res) => {
      const id = req.params.email;

      const cursor = ordersCollection.find({ email: id });
      const orders = await cursor.toArray();

      res.json(orders);
    });

    // POST API
    // add new product offer
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });

    //post a order post api
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });
    //post a feedback post api
    app.post("/comments", async (req, res) => {
      const comment = req.body;
      const result = await commentsCollection.insertOne(comment);
      res.json(result);
    });

    //Update order  condition API
    app.put("/orders/:updateId", async (req, res) => {
      const id = req.params.updateId;
      const updateOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          condition: "shipped",
        },
      };

      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
      
      
    //delete product   API
    app.delete("/products/:deleteId", async (req, res) => {
      const id = req.params.deleteId;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });
      
      
    //Update admin role
    app.put("/users/:emailId", async (req, res) => {
      const id = req.params.emailId;
      const updateUser = req.body;
      const filter = { email: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // delete orders api
    app.delete("/orders/:deleteId", async (req, res) => {
      const id = req.params.deleteId;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//server response
app.get("/", (req, res) => {
  res.send("Server Is Running ");
});

//server port response
app.listen(port, () => {
  console.log("Listen from", port);
});
