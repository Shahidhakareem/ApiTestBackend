import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(process.cwd(), "data.json");

// READ JSON FILE
function readData() {
  if (!fs.existsSync(dataPath)) {
    // Ensure history array exists in the default structure
    return { requests: [], history: [] }; 
  }
  const file = fs.readFileSync(dataPath);
  return JSON.parse(file);
}

// WRITE JSON FILE
function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

/* -------------------------------------------------------
   HISTORY ROUTES
--------------------------------------------------------- */

// GET ALL HISTORY
app.get("/api/history", (req, res) => {
  const data = readData(); 
  if (!data.history) {
    data.history = [];
  }
  res.json(data.history); 
});

// POST HISTORY ENTRY (Add new entry)
app.post("/api/history", (req, res) => {
  const data = readData();
  
  if (!data.history) {
    data.history = [];
  }
  
  // Generate an ID for the history item
  const newHistoryItem = { id: Date.now().toString(), ...req.body };
  data.history.push(newHistoryItem);
  
  writeData(data);
  
  return res.json({ status: "success", savedHistoryItem: newHistoryItem }); 
});

// ⭐ NEW ROUTE: DELETE SINGLE HISTORY ENTRY (Used by deleteHistory)
app.delete("/api/history/:id", (req, res) => {
  const data = readData();
  const id = req.params.id;
  
  const initialLength = data.history.length;
  // Filter out the item with the matching ID
  data.history = data.history.filter((h) => h.id !== id);

  if (data.history.length === initialLength) {
    // Item not found, but we still return success to the client store
    console.warn(`Attempted to delete non-existent history item: ${id}`);
  }
  
  writeData(data);
  
  return res.status(204).send(); // 204 No Content is standard for successful deletion
});

// ⭐ NEW ROUTE: DELETE ALL HISTORY ENTRIES (Used by clearHistory)
app.delete("/api/history", (req, res) => {
    const data = readData();
    data.history = []; // Clear the history array
    writeData(data);
    
    return res.status(204).send(); // 204 No Content is standard for successful bulk deletion
});


/* -------------------------------------------------------
   REQUESTS (Collections) ROUTES
--------------------------------------------------------- */

// GET ALL REQUESTS (Collections)
app.get("/api/requests", (req, res) => {
  const data = readData();
  res.json(data.requests);
});

// GET SINGLE REQUEST BY ID
app.get("/api/requests/:id", (req, res) => {
  const data = readData();
  const id = req.params.id;

  const request = data.requests.find((r) => r.id === id);

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  return res.json(request);
});

// CREATE NEW REQUEST
app.post("/api/requests", (req, res) => {
  const data = readData();
  const newRequest = { id: Date.now().toString(), ...req.body }; 
  data.requests.push(newRequest);
  writeData(data);
  return res.json({ status: "success", saved: newRequest });
});

// UPDATE REQUEST (PUT)
app.put("/api/requests/:id", (req, res) => {
  const data = readData();
  const id = req.params.id;

  const index = data.requests.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Request not found" });
  }

  const updated = {
    ...data.requests[index],
    ...req.body,
  };

  data.requests[index] = updated;
  writeData(data);

  return res.json({ status: "updated", updated });
});

// DELETE REQUEST
app.delete("/api/requests/:id", (req, res) => {
  const data = readData();
  const id = req.params.id;

  data.requests = data.requests.filter((r) => r.id !== id);
  writeData(data);

  return res.json({ status: "deleted", id });
});

// START SERVER
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
