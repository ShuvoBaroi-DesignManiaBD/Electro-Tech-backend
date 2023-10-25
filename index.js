const express = require("express");
const cors = require("cors");
require('dotenv').config()
const {
  MongoClient,
  ServerApiVersion,
  ObjectId
} = require('mongodb');
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
    const cartItems = db.collection("cartItems");

    // ========================== Brand APIs
    app.get('/brands', async (req, res) => {
      const cursor = brands.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //=================== Products APIs
    // API for adding products
    app.post(`/add-product`, async (req, res) => {
      const product = req.body;
      const result = await products.insertOne(product);
      res.send(result);
    });

    // API for update a product
    app.put("/update-product/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const filter = {
        _id: new ObjectId(id),
      };
      const options = {
        upsert: true
      };
      const updatedData = {
        $set: {
          productName: data.productName,
          price: data.price,
          brand: data.brand,
          rating: data.rating,
          type: data.type,
          image: data.image,
          short_description: data.short_description,
        },
      };
      const result = await products.updateOne(
        filter,
        updatedData,
        options
      );
      res.send(result);
    });

    // API for getting all products
    app.get('/products', async (req, res) => {
      const cursor = products.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // API for getting products of a specific user
    app.get('/products/user/:id', async (req, res) => {
      const id = req.params.id;
      console.log("id", id);
      const query = {
        userId: id,
      };
      const result = await products.find(query).toArray();
      console.log(result);
      res.send(result);
    });
    
    // API for getting a product by id
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      console.log("id", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await products.findOne(query);
      console.log(result);
      res.send(result);
    });

    // API for getting products by brand
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

    // ============================ API for adding or updating cart items ============================
    app.post('/add-to-cart', async (req, res) => {
      try {
        const {id, product} = req.body;
        const userQuery = { id: id};
        const userCart = await cartItems.findOne(userQuery);
    
        if (userCart) {
          const updateQuery = { id: id};
          const updateOperation = { $push: { items: product } };
          const result = await cartItems.updateOne(updateQuery, updateOperation);
          res.send(result);
        } else {
          const newCartDocument = {
            id: id,
            items: [product],
          };
          const result = await cartItems.insertOne(newCartDocument);
          res.send(result);
        }
    
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    // API for deleting product from cart
    app.delete('/deleteProduct', async (req, res) => {
      try {
        const product = req.body;
        const userQuery = { id: product.userId};
        const updateOperation = { $pull: { items: { _id: product._id} } };
        const result = await cartItems.updateOne(userQuery, updateOperation);

        res.send(result);
      } catch (error) {
        console.error('Error:', error);
      }
    });

    // API for getting cart Items
    app.get("/cartItems/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id", id);
      const query = {
        id: id,
      };
      const result = await cartItems.findOne(query);
      console.log(result);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({
      ping: 1
    });
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