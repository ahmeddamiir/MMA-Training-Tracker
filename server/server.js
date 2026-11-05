// 1. Load the libraries we installed with npm
const express = require("express");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

// 2. Create the API application
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// 3. Prepare the connection to MongoDB Atlas
if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Start with: node --env-file=.env server/server.js");
    process.exit(1);
}
const client = new MongoClient(process.env.MONGO_URI);
let db;

// 4. Test endpoint: is the API running?
app.get("/", (req, res) => {
    res.send("MMA Tracker API is running!");
});

// 5. GET /sessions: return all documents from the sessions collection
app.get("/sessions", async (req, res) => {
    try {
        const sessions = await db.collection("sessions").find().toArray();
        res.status(200).json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not read sessions from the database" });
    }
});

// Get /fighters
app.get("/fighters", async (req, res) => {
    try {
        const fighters = await db.collection("fighters").find().sort("name").toArray();
        res.status(200).json(fighters);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not read fighters from the database" });
    }
});

// GET /sessions/count: return the number of sessions
app.get("/sessions/count", async (req, res) => {
    try {
        const sessionsCount = await db.collection("sessions").countDocuments();
        res.status(200).json(sessionsCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not count the number of sessions from the database" });
    }
});

// Experiencing route parameters with custom fighter_id (e.g., F001)
app.get("/fighters/:id", async (req, res) => {
    try {
        const fighter = await db.collection("fighters").findOne({ fighter_id: req.params.id });
        
        if (!fighter) return res.status(404).json({ error: "Fighter not found" });
        res.status(200).json(fighter);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not read fighter data" });
    }
});


// 6. Connect to Atlas first, then start the API
async function start() {
    await client.connect();
    db = client.db('mma_tracker');
    console.log("Connected to MongoDB Atlas");
    app.listen(PORT, (error) => {
        if (error) {
            console.error("Could not start the API:", error.message);
            process.exit(1);
        }
        console.log(`API running at http://localhost:${PORT}`);
    });
}

start().catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
});


