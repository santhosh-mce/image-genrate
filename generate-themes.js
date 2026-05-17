import fs from "fs";

const subjects = [
  "portrait", "city", "forest", "robot", "girl", "boy",
  "warrior", "car", "spaceship", "mountain", "ocean",
  "dragon", "castle", "street", "night", "sunset",
  "future world", "cyber city", "AI universe"
];

const styles = [
  "cinematic", "ultra realistic", "anime style", "3D render",
  "digital art", "fantasy art", "cyberpunk", "HDR photography",
  "surreal", "low light", "golden hour"
];

const moods = [
  "dark", "bright", "moody", "vibrant", "dreamy",
  "epic", "mysterious", "romantic", "futuristic"
];

const actions = [
  "standing", "walking", "flying", "running", "glowing",
  "floating", "looking at camera", "battle scene"
];

const TARGET = 1_000_000;

const stream = fs.createWriteStream("./themes-1m.txt");

for (let i = 0; i < TARGET; i++) {
  const theme =
    `${styles[i % styles.length]} ` +
    `${moods[Math.floor(Math.random() * moods.length)]} ` +
    `${subjects[Math.floor(Math.random() * subjects.length)]} ` +
    `${actions[Math.floor(Math.random() * actions.length)]}`;

  stream.write(theme + "\n");
}

stream.end();

console.log("✅ 1,000,000 themes generated in themes-1m.txt");