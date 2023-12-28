const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const { createServer } = require("http");
const server = createServer(app);
const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: `http://localhost:5173`,
  },
});

app.use(cors());
app.use(express.json());

// socket connection

io.on("connection", (socket) => {
  console.log("someone has connected");
  io.emit("firstEvent", "Hello, this is test event!");

  // socket.on("disconnect", () => {
  //   console.log("someone has left");
  // });
});

app.get("/", (req, res) => {
  res.send(`<h2> Exploring Socket.io </h2>`);
});

io.listen(5000);

// server.listen(port, () => {
//   console.log(`socket is running on port ${port}`);
// });

const uri =
  "mongodb+srv://mrabir8097:6sg4n7T0hcwEa6OK@cluster0.esabfel.mongodb.net/?retryWrites=true&w=majority";

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
    await client.connect();

    const database = client.db("usersDB");
    const userCollection = database.collection("users");

    // POST API

    app.post("/api/v1/user/create-user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log(user);
      res.send(result);
    });

    // GET API (ALL USERS)

    app.get("/api/v1/get-users", async (req, res) => {
      // const result = await userCollection.find().toArray();

      const { query } = req.query;
      console.log(query);
      const filter = { sort: query };
      const cursor = userCollection.find(filter);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    // GET SINGLE USER API BY ID (Path Parameters)

    app.get("/api/v1/user/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const query = { user_id: id };
      const result = await userCollection.findOne(query);
      // res.send({ success: "true" });
      res.send(result);
    });

    // GET API (QUERY PARAMS)

    app.get("/api/v1/search", async (req, res) => {
      const { email } = req.query;
      let query = { email: email };
      const options = { projection: { name: 1, address: 1 } };
      const result = await userCollection.findOne(query, options);
      // console.log(req.query);
      res.send(result);
      // res.send(`this is the data for email : ${email}`);
    });

    // DELETE API

    app.delete("/api/v1/user/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // PUT API

    app.put("/api/v1/user/:id", async (req, res) => {
      const updateInfo = req.body;
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const body = {
        $set: {
          address: updateInfo.address,
        },
      };
      const result = await userCollection.updateOne(filter, body, options);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// app.listen(port, () => {
//   console.log(`App is running on ${port}`);
// });

// mrabir8097
// 6sg4n7T0hcwEa6OK
