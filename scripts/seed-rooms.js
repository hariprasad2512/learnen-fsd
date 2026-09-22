require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Room = require('../models/room');

const MENTOR_EMAIL = 'mentor@test.com';

const SEED_DEFS = [
  // wellbeing x3
  { title: 'Mindful Mornings', description: 'Start your day with guided mindfulness, breathing exercises and journaling prompts.', tags: ['wellbeing'], syllabus: 'Week 1-4: mindfulness foundations, breathwork, sleep hygiene.' },
  { title: 'Sleep & Focus', description: 'Learn the science of sleep, deep-work sprints and digital detox habits.', tags: ['wellbeing'], syllabus: 'Sleep cycles, focus blocks, evening routines.' },
  { title: 'Yoga for Beginners', description: 'Gentle yoga flows, mobility drills and posture correction for desk workers.', tags: ['wellbeing'], syllabus: 'Foundations, vinyasa basics, 21-day flexibility plan.' },
  // mechanics x3
  { title: 'Engineering Mechanics 101', description: 'Statics, dynamics and free-body diagrams explained with visual problem-solving.', tags: ['mechanics'], syllabus: 'Units, vectors, equilibrium, friction, kinematics.' },
  { title: 'Dynamics in Motion', description: 'Newtonian dynamics, work-energy methods and real-world machine examples.', tags: ['mechanics'], syllabus: 'Kinetics, impulse-momentum, vibrations intro.' },
  { title: 'Thermodynamics Intro', description: 'Laws of thermodynamics, heat engines and everyday energy systems.', tags: ['mechanics'], syllabus: 'Zeroth to second law, cycles, entropy intuition.' },
  // security x3
  { title: 'AppSec Basics', description: 'Secure coding fundamentals: injection, auth flaws and safe defaults.', tags: ['security'], syllabus: 'OWASP intro, input validation, auth & sessions.' },
  { title: 'OWASP Top 10 Walkthrough', description: 'Hands-on walkthrough of the OWASP Top 10 with demo vulnerable apps.', tags: ['security'], syllabus: 'One module per vulnerability with labs.' },
  { title: 'Network Security Essentials', description: 'Firewalls, TLS, VPNs and packet-level thinking for beginners.', tags: ['security'], syllabus: 'TCP/IP refresh, TLS handshake, firewall rules.' },
  // technology x3
  { title: 'Intro to IoT', description: 'Sensors, ESP32 boards and MQTT — build your first connected device.', tags: ['technology'], syllabus: 'Hardware basics, MQTT, dashboard project.' },
  { title: 'Web Dev Kickstart', description: 'HTML, CSS and JavaScript fundamentals with a portfolio project at the end.', tags: ['technology'], syllabus: 'Semantic HTML, flexbox/grid, DOM & fetch.' },
  { title: 'AI Primer for Everyone', description: 'What LLMs actually do, prompt patterns and responsible AI use.', tags: ['technology'], syllabus: 'ML intuition, prompting, evaluation basics.' },
  // safety x3
  { title: 'Lab Safety Fundamentals', description: 'PPE, chemical handling, fire response and incident reporting.', tags: ['safety'], syllabus: 'Hazard signs, MSDS, emergency drills.' },
  { title: 'Fire Safety & Prevention', description: 'Fire classes, extinguisher types and evacuation planning for homes and labs.', tags: ['safety'], syllabus: 'Fire triangle, extinguisher PASS, escape plans.' },
  { title: 'Fieldwork Safety', description: 'Staying safe during outdoor surveys, site visits and workshops.', tags: ['safety'], syllabus: 'Risk assessment, first-aid basics, checklists.' },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');
  await mongoose.connect(uri);
  console.log('Connected:', mongoose.connection.name);

  let mentor = await User.findOne({ Email: MENTOR_EMAIL });
  if (!mentor) {
    mentor = new User({
      userId: 'mentor_seed',
      Email: MENTOR_EMAIL,
      Password: 'Test@123',
      Security_Question: 'seed',
      Security_Answer: 'seed',
      Joined_Room: [],
      Created_Room: [],
      Position: 'mentor',
      Tags: [],
      Premium: false,
    });
    await mentor.save();
    console.log('Created dummy mentor:', MENTOR_EMAIL, '/ Test@123');
  } else {
    console.log('Reusing mentor:', MENTOR_EMAIL);
  }

  await Room.deleteMany({ title: /^\[SEED\]/ });
  await Room.deleteMany({ title: { $in: SEED_DEFS.map((r) => r.title) } });
  const docs = SEED_DEFS.map((r) => ({
    title: r.title,
    description: r.description,
    participants: [{ user: mentor._id, notes: [] }],
    syllabus: r.syllabus,
    tags: r.tags,
    assignments: [],
    resources: [],
    mentor: mentor._id,
  }));
  const inserted = await Room.insertMany(docs);
  console.log(`Seeded ${inserted.length} rooms (3 per tag).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
