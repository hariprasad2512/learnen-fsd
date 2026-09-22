require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/room');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');
  await mongoose.connect(uri);
  const rooms = await Room.find({ title: /^\[SEED\]/ });
  let n = 0;
  for (const r of rooms) {
    const clean = r.title.replace(/^\[SEED\]\s*/, '');
    await Room.updateOne({ _id: r._id }, { $set: { title: clean } });
    n++;
  }
  console.log(`Stripped [SEED] from ${n} rooms.`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error('Strip failed:', e.message); process.exit(1); });
