// 1. Load the libraries we installed with npm
const express = require("express");
const {MongoClient} = require("mongodb");

// 2. Create the API application
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// 3. Prepare the connection to MongoDB Atlas
if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Start with: node --env-file=.env server.js");
    process.exit(1);
}
const client = new MongoClient(process.env.MONGODB_URI);
let db;

// 4. Test endpoint: is the API running?
app.get("/", (req, res) => {
    res.send("My API is running!");
})

// 5. Get /directors: return all documents from the directors collection
app.get("/directors", async (req, res) => {
    try {
        const directors = await db.collection("directors").find().toArray();
        res.status(200).json(directors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not read directors from the database" });
    }
});

// 5. Get /directors: return all documents from the directors collection
app.get("/movies", async (req, res) => {
    try {
        const movies = await db.collection("movies").find().toArray();
        res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Could not read movies from the database"});
    }
});
// 6. GET /movies/search?query=...: search movies with the text index
app.get("/movies/search", async (req, res) => {
try {
const query = req.query.query;
if (typeof query !== "string" || query.trim() === "") {
return res.status(200).json([]);
}
const movies = await db.collection("movies")
.find({ $text: { $search: query } }, { projection: { score: { $meta: "textScore" } } })
.sort({ score: { $meta: "textScore" } })
.toArray();
res.status(200).json(movies);
} catch (error) {
console.error(error);
res.status(500).json({ error: "Could not search the movies" });
}
});
// Playing around route parameter
// GET /director:id -> Practice 1, 3
app.get("/directors/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({error: "director ID must be a whole number"});
        }
        const director = await db.collection("directors").findOne({director_id: id}, {projection: {_id: 0}});
        if (!director) {
            return res.status(404).json({error: `directors ${id} not found`});
        }
        res.status(200).json(director);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Could not read directors from the database"});
    }
});

// GET /movies/:id 
app.get("/movies/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const movie = await db.collection("movies").findOne({movie_id: id});
        if (!movie) {
            return res.status(404).json({error: `movies ${id} not found`});
        }
        res.status(200).json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Could not read movies from the database"});
    }
});

// POST /movies: add a new movie
app.post("/movies", async (req, res) => {
    try {
        const body = req.body || {};
        
        const errors = [];
        if (typeof body.movie_id !== "string" || body.movie_id.trim() === "") {
            errors.push("movie_id is required and must be text (e.g. 'M01')");
        }
        if (typeof body.title !== "string" || body.title.trim() === "") {
            errors.push("title is required and must be text");
        }
        if (!Number.isInteger(body.year) || body.year < 1888 || body.year > 2100) {
            errors.push("year is required and must be a valid integer");
        }
        if (typeof body.genre !== "string" || body.genre.trim() === "") {
            errors.push("genre is required and must be text");
        }
        if (!Number.isInteger(body.director_id)) {
            errors.push("director_id is required and must be an integer");
        }
        
        if (errors.length > 0) {
            return res.status(400).json({ errors: errors });
        }

        const existing = await db.collection("movies").findOne({ movie_id: body.movie_id });
        if (existing) {
            return res.status(409).json({ error: `Movie ${body.movie_id} already exists` });
        }

        const newMovie = {
            movie_id: body.movie_id,
            title: body.title,
            year: body.year,
            genre: body.genre,
            director_id: body.director_id,
            description: body.description || ""
        };

        await db.collection("movies").insertOne(newMovie);
        return res.status(201).json(newMovie);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Could not add the movie" });
    }
});
// 10. PUT /directors/:id: change an existing course
app.put("/directors/:id", async (req, res) => {
try {
const id = req.params.id;
const body = req.body || {};
// Check only the fields the client sent
const errors = [];
if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim() === "")) {
errors.push("name must be text and not empty");
}
if (body.credits !== undefined &&
(!Number.isInteger(body.credits) || body.credits < 1 || body.credits > 30)) {
errors.push("credits must be a whole number from 1 to 30");
}
if (errors.length > 0) {
return res.status(400).json({ errors: errors });
}
// Copy the fields that may be changed into "changes"
const allowed = ["name", "credits", "teacher", "department", "description"];
const changes = {};
for (const field of allowed) {
if (body[field] !== undefined) {
changes[field] = body[field];
}
}
if (Object.keys(changes).length === 0) {
return res.status(400).json({ error: "Send at least one field to change: " + allowed.join(", ") });
}
// Change the course in MongoDB
const result = await db.collection("directors").updateOne({ course_id: id }, { $set: changes });
if (result.matchedCount === 0) {
return res.status(404).json({ error: `Course ${id} not found` });
}
// Send back the course as it is now
const course = await db.collection("directors").findOne({ course_id: id });
res.status(200).json(course);
} catch (error) {
console.error(error);
res.status(500).json({ error: "Could not change the course" });
}
});

// 10. PUT /movies/:id: change an existing movie
app.put("/movies/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body || {};

        const errors = [];
        if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim() === "")) {
            errors.push("title must be text and not empty");
        }
        if (body.year !== undefined && (!Number.isInteger(body.year) || body.year < 1888 || body.year > 2100)) {
            errors.push("year must be a valid integer between 1888 and 2100");
        }
        if (body.genre !== undefined && (typeof body.genre !== "string" || body.genre.trim() === "")) {
            errors.push("genre must be text and not empty");
        }
        if (body.director_id !== undefined && !Number.isInteger(body.director_id)) {
            errors.push("director_id must be an integer");
        }
        if (body.description !== undefined && typeof body.description !== "string") {
            errors.push("description must be text");
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors: errors });
        }

        // Copy the fields that may be changed into "changes"
        const allowed = ["title", "year", "genre", "director_id", "description"];
        const changes = {};
        for (const field of allowed) {
            if (body[field] !== undefined) {
                changes[field] = body[field];
            }
        }

        if (Object.keys(changes).length === 0) {
            return res.status(400).json({ error: "Send at least one field to change: " + allowed.join(", ") });
        }

        // Change the movie in MongoDB
        const result = await db.collection("movies").updateOne({ movie_id: id }, { $set: changes });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: `Movie ${id} not found` });
        }

        // Send back the movie as it is now
        const movie = await db.collection("movies").findOne({ movie_id: id });
        res.status(200).json(movie);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not change the movie" });
    }
});

// 11. DELETE /movies/:id: delete one movie
app.delete("/movies/:id", async (req, res) => {
try {
const id = req.params.id;
const result = await db.collection("movies").deleteOne({ movie_id: id });
if (result.deletedCount === 0) {
return res.status(404).json({ error: `movie ${id} not found` });
}
res.status(200).json({ message: `movie ${id} deleted` });
} catch (error) {
console.error(error);
res.status(500).json({ error: "Could not delete the movie" });
}
});

// Deprecated to the one for the test //
/*
// GET /movies:id/enrollments
// Practice 2
app.get("/movies/:id/enrollments", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(404).json({error: "Student ID must be a whole number, for example 1001"});
        }
        const enrollments = await db.collection("enrollments").find({student_id: id}).toArray();
        res.status(200).json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Could not read movies from the database"});
    }
});
*/
// 6. Connection to Atlas first, then start the API
async function start(){
    console.log("URI from env:", process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, (error) => {
        if (error) {
            console.error("Could not start the API:", error.message);
            process.exit(1);
        }
        console.log('API running at http://localhost:$(PORT)');
    });
}

start().catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
});

// ---------- Test 10 ----------

// 10a. GET /directors/:id/short
app.get("/directors/:id/short", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(404).json({error: "director ID must be a whole number"});
        }
        const short = await db.collection("directors").findOne({course_id: id},
            {projection: {_id: 0, description: 0}});
        if (!short) {
            return res.status(404).json({error: `directors ${id} not found`});
        }
        res.status(200).json(short);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Could not read directors from the database"});
    }
});

// 10b. GET /movies/:id/enrollments
app.get("/movies/:id/enrollments", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({error: "Student ID must be a whole number, for example 1001"});
        }
        
        const student = await db.collection("movies").findOne({student_id: id});
        if (!student) {
            return res.status(404).json({error: `Student ${id} is not found`});
        }

        const enrollments = await db.collection("enrollments").find({student_id: id},
        {projection: {_id: 0, course_id: 1, grade: 1}}).sort({course_id: 1}).toArray();
        res.status(200).json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Could not read movies from the database"});
    }
});

// 10c. GET /movies/:id/a-directors
app.get("/movies/:id/a-directors", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({error: "Student ID must be a whole number, for example 1001"});
        }
        
        const student = await db.collection("movies").findOne({student_id: id});
        if (!student) {
            return res.status(404).json({error: `Student ${id} is not found`});
        }

        const enrollments = await db.collection("enrollments").find({student_id: id, grade: "A"}).toArray();

        const courseIds = enrollments.map((e) => e.course_id);

        const directors = await db.collection("directors").find({course_id: {$in: courseIds}})
        .sort({name: 1}).toArray();

        const courseNames = directors.map((c) => c.name);


        res.status(200).json({student_id: student.student_id, name: student.name, a_directors: courseNames});

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Could not read movies from the database"});
    }
});