# MMA-Training-Tracker
Advanced Database Systems Semester Project: An MMA Training Tracker application designed to manage fighters and sessions with complete CRUD functionalities and Express API integration.
# MMA Training Tracker 🥊

A Database Course Semester Project designed to manage and track mixed martial arts training sessions and fighters. This application demonstrates database design principles, collection relationships, and full CRUD capabilities using a modern tech stack.

## 👥 Team Members & Contribution
* **[Your Name]** - Database Design & API Development

## 🛠️ Tech Stack
* **Database:** MongoDB Atlas (NoSQL)
* **Backend:** Node.js & Express.js API
* **Documentation:** Markdown

## 🗄️ Database Architecture & Design

### Collections
The database consists of two core collections:
1. `fighters` - Stores detailed profiles of the athletes.
2. `sessions` - Tracks individual training logs, dates, and activities.

### Database Relationships
The architecture implements a **One-to-Many (1:N) relationship**:
* **One Fighter** can have **Many Training Sessions**.
* Referenced using the fighter's unique identifier (`fighter_id`) inside the sessions collection to ensure data normalization.

---

## 🚀 Key Features

* **Complete CRUD Operations:** Full capability to Create, Read, Update, and Delete both Fighters and Sessions.
* **Advanced Search:** Integrated query endpoints to search and filter training sessions smoothly.
* **Cloud Hosted:** Fully connected and deployed via MongoDB Atlas cloud cluster.

## 🏁 How to Run the Project Locally

### 1. Clone the repository
```bash
git clone https://github.com
cd MMA-Training-Tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your MongoDB Atlas connection string:
```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=3000
```

### 4. Start the server
```bash
npm start
```
