const express = require("express");
const Redis = require("ioredis");
const { nanoid } = require("nanoid");
const morgan = require("morgan");

const redis = new Redis(6379, "redis");
// Check if Redis connection is successful
redis.on("ready", () => {
  console.log("Connected to Redis");
});

// Handle Redis connection errors
redis.on("error", (error) => {
  console.error("Error connecting to Redis:", error);
  process.exit(1); // Exit the process with an error code
});

const newUrl = async (longUrl) => {
  const id = nanoid();
  await redis.set(`url:${id}`, longUrl, "EX", 60);
  return id;
};

const getUrl = async (id) => {
  return await redis.get(`url:${id}`);
};

const app = express();
const port = 3000;

app.set("trust proxy", 1); // Trust the first proxy

app.use(morgan("dev"));
app.use(express.json());

app.use((req, res, next) => {
  const protocol = req.get("X-Forwarded-Proto") || req.protocol;
  const host = req.get("X-Forwarded-Host") || req.get("host");
  const endpoint = `${protocol}://${host}`;
  console.log("host:", endpoint); // Use or log the full URL as needed
  app.locals.endpoint = endpoint;
  next();
});

app.get("/go/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`go/${id}`);
  const fullUrl = await getUrl(id);
  res.redirect(fullUrl);
});

app.post("/new", async (req, res) => {
  // get long url from json body url prop
  const longUrl = req.body.url;
  // const longUrl = req.query.url;
  const id = await newUrl(longUrl);
  res.send(`${app.locals.endpoint}/go/${id}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
