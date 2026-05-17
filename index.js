import fs from "fs";
import https from "https";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY
});

// load all themes
const themes = fs.readFileSync("./themes-1m.txt", "utf-8")
  .split("\n")
  .filter(Boolean);

const folder = "./images";

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}

let imageCount = 1;

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

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const encodedPrompt = encodeURIComponent(prompt);

    const fileName = `${folder}/image-${imageCount++}-${Date.now()}.png`;

    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

    https.get(url, (res) => {
      const file = fs.createWriteStream(fileName);

      res.pipe(file);

      file.on("finish", () => {
        file.close();
        console.log(`✅ Generated: ${fileName}`);
        resolve();
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