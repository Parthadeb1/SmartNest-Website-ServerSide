const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fump7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("smartnest");
    const packageCollection = database.collection("packages");
    const orderCollection = database.collection("order");
    const usersCollection = database.collection("users");

    //get api
    app.get("/packages", async (req, res) => {
      const packages = await packageCollection.find({}).toArray();
      res.send(packages);
    });

    //get single package
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Get the single package", id);
      const query = { _id: ObjectId(id) };
      const package = await packageCollection.findOne(query);
      res.json(package);
    });
    //get myorder
    app.get('/managemyorder/:email', async(req, res)=>{
      const email =req.params.email;
      console.log("Get the manageMyOrder",email);
      const query ={email: email};
      const package = await orderCollection.find(query).toArray();
      console.log(package);
      res.send(package);
    })

    // manage all order
    app.get("/manageallorder", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });

    //manage status
    // Update Order status
    app.put("/manageallorder/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: false };
      const updateDoc = {
        $set: {
          status: "shipped",
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //add package post api
    app.post('/packages', async (req, res) =>{
      const package = req.body;
      console.log('add package', package);
      const result = await packageCollection.insertOne(package);
      console.log(result);

      res.json(result);
    })

    

    //add order post api
    app.post("/myorder", async (req, res) => {
      const order = req.body;
      console.log("order done", order);
      const result = await orderCollection.insertOne(order);
      console.log(result);
      res.json(result);
    });

    //delete api
    app.delete("/manageallorder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    //-----------------user data collect api -----------------------
    
    //get special user information
    app.get('/users/:email', async (req, res)=>{
      const email = req.params.email;
      console.log('special user', email)
      const query = { email: email}
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if(user?.role== 'admin'){
        isAdmin = true;
      }
      res.json({admin : isAdmin})
    })



    //user data
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("User Created successfully", user);
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put('/users', async (req, res)=>{
      const user =req.body;
      console.log("User update successfully", user);
      const filter = { email: user.email };
      const options = { upsert: true};
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result)
    })

    // make admin
    app.put('/users/admin', async (req, res)=>{
      const user = req.body;
      console.log('put', user)
      const filter = {email: user.email};
      const updateDoc = {$set:{role: 'admin'}}
      const result = await usersCollection.updateOne(filter,updateDoc);
      res.json(result);
    })
  } 
  finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" this is from smartnest server.");
});

app.listen(port, () => {
  console.log("Running smartnest server on port", port);
});
