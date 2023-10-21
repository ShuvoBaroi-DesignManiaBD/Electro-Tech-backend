const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:");
  next();
});
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use(cors(corsConfig))
app.options("", cors(corsConfig))


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@design-mania-bd.kt3v02q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    const db = client.db("electro-tech");
    const brands = db.collection("Brands");
    const products = db.collection("products");

    // ========================== Brand APIs
    app.get('/brands', async (req,res) => {
      const cursor = brands.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //=================== Products APIs
    app.post(`/add-product`, async (req,res) => {
      const product = req.body;
      const result = await products.insertOne(product);
      res.send(result);
    });

    app.get('/products', async (req,res) => {
      const cursor = products.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get product by id
    app.get('/products/:id', async (req,res) => {
      const id = req.params.id;
      console.log("id", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await products.findOne(query);
      console.log(result);
      res.send(result);
    });

    // get products by brand
    app.get("/brands/:brand", async (req, res) => {
      const brand = req.params.brand;
      console.log("brand", brand);
      const query = {
        brand: brand,
      };
      const result = await products.find(query).toArray();
      console.log(result);
      res.send(result);
    });
    // app.post(`/products/:brand`, async (req,res) => {
    //   const product = req.body;
    //   const brand = req.params.brand;
    //   const query = { name: brand}
    //   const cursor = await brands.find(query);
    //   const result = await cursor.insertOne(product);
    //   res.send(result);
    // });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Server is running.....");
});

app.listen(port, () => {
    console.log(`Server is running in port: ${port}`);
  });
  
  
  
  



