import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// GET users
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// POST create user
router.post("/", async (req, res) => {
  const { name, email } = req.body;

  const { data, error } = await supabase.from("users").insert([{ name, email }]);

  if (error) return res.status(400).json({ error });

  res.json(data);
});

export default router;
