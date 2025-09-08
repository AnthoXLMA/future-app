// server.js
import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Endpoint pour générer un challenge
app.post("/api/generate-challenge", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt manquant" });

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4", // ou gpt-3.5-turbo
      messages: [
        { role: "system", content: "Tu es un assistant qui aide à créer des challenges de rencontre." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const responseText = completion.data.choices[0].message.content;
    res.json({ challenge: responseText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Serveur démarré sur le port ${process.env.PORT}`);
});
