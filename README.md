# MMA Training Tracker 🥊

A semester project for managing and tracking MMA (Mixed Martial Arts) training sessions and fighters using MongoDB Atlas and a RESTful API architecture.

---

## Developer

Ahmed Abdelrahman Mohamed Hassan

---

## Tech Stack

- MongoDB Atlas
- Node.js
- Express.js
- Thunder Client (API Testing)
- HTML
- CSS
- JavaScript
---

## Application Architecture

Client ↓ REST API ↓ MongoDB Atlas
 
---

## Database Design

The database consists of two collections:
- sessions
- fighters

Each collection will contain at least 5 documents.

### Collection A: sessions

Stores MMA training session records.

Fields:

- _id
- title
- type
- duration_minutes
- date
- fighter_id

Example session types:

- Striking
- Grappling
- Wrestling
- Sparring
- Shadow Boxing
- Drills
- Strength Training

### Collection B: fighters

Stores fighter information.

Fields:

- _id
- name
- weight_class
- team
- experience_level

---

## Collection Relationship

A fighter can participate in multiple training sessions.

```text
fighters._id
      │
      ▼
sessions.fighter_id
```

Each fighter can have multiple training sessions.

---

## MongoDB Text Search

Text Index:

```javascript
db.sessions.createIndex({
  title: "text"
})
```

Used to search training sessions by title.

---

## REST API Endpoints

### Sessions

```http
GET /sessions
```

Returns all sessions.

```http
GET /sessions/:id
```

Returns one session.

```http
POST /sessions
```

Creates a new session.

```http
PUT /sessions/:id
```

Updates an existing session.

```http
DELETE /sessions/:id
```

Deletes a session.

```http
GET /sessions/search?query=keyword
```

Searches sessions using MongoDB text search.

### Fighters

```http
GET /fighters/:id
```

Returns a fighter profile.

---

## Project Features

- Manage MMA fighters
- Track training sessions
- Full CRUD operations
- MongoDB text search
- One-to-Many relationship between collections
- REST API architecture
---

## Home Screen

- Displays all sessions
- Search sessions
- Select a session
- New button
---

## Details Screen

- Displays selected session information
- Displays fighter information using fighter_id
- Edit session
- Delete session
- Add new session
---

## Run Locally

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
MONGODB_URI=your_connection_string
PORT=3000
```

Start the server:

```bash
node server.js
```

---
