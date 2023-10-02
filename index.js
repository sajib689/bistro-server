const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
   return res.status(401).send({ error: true, message: "Unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
     return res.status(402).send({ error: true, message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2m0rny5.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const menuCollection = await client.db("bistroDataBase").collection("menu");
    const reviewsCollection = await client
      .db("bistroDataBase")
      .collection("reviews");
    const cartsCollection = await client
      .db("bistroDataBase")
      .collection("carts");
    const usersCollection = await client
      .db("bistroDataBase")
      .collection("users");

    // get all the menus
    app.get("/menus", async (req, res) => {
      const query = await menuCollection.find().toArray();
      res.send(query);
    });

    // get all review
    app.get("/reviews", async (req, res) => {
      const query = await reviewsCollection.find().toArray();
      res.send(query);
    });
    // insert carts
    app.post("/carts", async (req, res) => {
      const item = req.body;
      const result = await cartsCollection.insertOne(item);
      res.send(result);
    });
    // get all data from carts
    app.get("/carts", verifyJWT, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.send([]);
      }
     const decodedEmail = req.decoded.email;
      const query = { email: email };
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: "Invalid" });
      }

      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });
    // delete carts products by id
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });

    // user related apis
    app.post("/users", verifyJWT, async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // get all users from database
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // delete user from database
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // get admin
    app.get('/users/admin/:email',verifyJWT, async (req, res) => {
      const email = req.params.email;
      if(req.decoded.email !== email) {
        res.send({admin: false});
      }
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === 'admin'}
      res.send(result);
    })
    // secret opration using by jwt token
    app.post("/jwt", (req, res) => {
      const users = req.body;
      const token = jwt.sign(users, process.env.JWT_KEY, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the Bistro Boss Website Server");
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
