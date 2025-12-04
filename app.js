import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(process.cwd(), "data.json");

// Read JSON
function readData() {
  const file = fs.readFileSync(dataPath);
  return JSON.parse(file);
}

// Write JSON
function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// GET all requests
app.get("/api/requests", (req, res) => { // <-- Must match '/api/requests'
    const data = readData();
    res.json(data.requests);
});

// Save new request
// backend.js (Ensure POST logic saves data)

app.post("/api/requests", (req, res) => {
  const data = readData();
  const newRequest = { ...req.body }; 
  
  data.requests.push(newRequest); 
  writeData(data); // <--- THIS STEP IS CRUCIAL
  
  res.json({ status: "ok", savedRequest: newRequest });
});


// Delete request
app.delete("/api/requests/:id", (req, res) => {
  const data = readData();
  const id = req.params.id;

  data.requests = data.requests.filter((r) => r.id !== id);
  writeData(data);
  res.json({ message: "Deleted" });
});




app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
