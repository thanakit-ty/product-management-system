require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./db");

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error("❌ Failed to start:", err);
  process.exit(1);
});
