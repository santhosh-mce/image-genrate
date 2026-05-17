import fs from "fs";
import https from "https";
import dotenv from "dotenv";
import OpenAI from "openai";
import { uploadToCloudinary } from "./uploadImage.js";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY
});

// load themes
const themes = fs.readFileSync("./themes-1m.txt", "utf-8")
  .split("\n")
  .filter(Boolean);

// random theme picker
function getRandomTheme() {
  return themes[Math.floor(Math.random() * themes.length)];
}

async function generatePrompt() {
  const randomTheme = getRandomTheme();

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b:free",
    messages: [
      {
        role: "user",
        content: `Generate a detailed AI image prompt for: ${randomTheme}`
      }
    ]
  });

  return response.choices[0].message.content;
}

// download → upload → delete temp file
async function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const encodedPrompt = encodeURIComponent(prompt);
    const tempFile = `temp-${Date.now()}.png`;

    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

    const file = fs.createWriteStream(tempFile);

    https.get(url, (res) => {
      res.pipe(file);

      file.on("finish", async () => {
        file.close();

        try {
          const cloudUrl = await uploadToCloudinary(tempFile);

          fs.unlinkSync(tempFile);

          console.log("✅ Uploaded:", cloudUrl);

          resolve(cloudUrl);
        } catch (err) {
          reject(err);
        }
      });

    }).on("error", reject);
  });
}

async function autoLoop() {
  console.log("🚀 Auto image generation started...");

  while (true) {
    try {
      const prompt = await generatePrompt();
      await generateImage(prompt);

      await new Promise(r => setTimeout(r, 5000));

    } catch (err) {
      console.error("Error:", err.message);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

autoLoop();