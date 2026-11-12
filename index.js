import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

const client = new MongoClient(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.qgagqeu.mongodb.net/`,
);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const connectedClient = await connectToMongoDB();
const database = connectedClient.db("hireloop");
const users = database.collection("user");
const jobs = database.collection("jobs");


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post('/jobs', async (req, res) => {
    const job = req.body;
    const result = await jobs.insertOne(job);
    res.send(result);
})

// List every job posting. The dashboard table reads this on the server.
app.get('/jobs', async (req, res) => {
    try {
        const cursor = jobs.find({});
        const result = await cursor.toArray();
        res.json(result);
    } catch (err) {
        console.error('GET /jobs failed:', err);
        res.status(500).json({ error: 'Failed to load jobs' });
    }
})

// Remove one posting. `id` is the hex string form of the document's ObjectId.
app.delete('/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid job id' });
        }
        const result = await jobs.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(result);
    } catch (err) {
        console.error('DELETE /jobs/:id failed:', err);
        res.status(500).json({ error: 'Failed to delete job' });
    }
})





app.get('/users', async (req, res) => {
    const cursor = users.find({});
    const result = await cursor.toArray();
    res.send(result);
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
