// Simple JSON memory backend for Shadow Apple
// Deploy on Replit/Glitch/Render. Persists to disk in data/*.json

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({limit:'2mb'}));

const DATA = path.join(__dirname, 'data');
if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });

const ACC_FILE = path.join(DATA, 'accounts.json');
const MEM_FILE = path.join(DATA, 'memory.json');

function readJSON(p, fallback){
  try{ return JSON.parse(fs.readFileSync(p, 'utf8')); }catch(e){ return fallback; }
}
function writeJSON(p, obj){
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function sha256(s){
  // tiny hash (not cryptographically perfect here, but fine for demo)
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

// init files
if (!fs.existsSync(ACC_FILE)) writeJSON(ACC_FILE, { users: {} });
if (!fs.existsSync(MEM_FILE)) writeJSON(MEM_FILE, { states: {} });

app.get('/', (req,res)=>res.json({ ok:true, service:'shadowapple-json' }));

// sign up
app.post('/signup', (req,res)=>{
  const { username, number, password, pfp } = req.body||{};
  if (!username || !password) return res.status(400).json({ error: 'missing fields' });
  const acc = readJSON(ACC_FILE, { users: {} });
  if (acc.users[username]) return res.status(409).json({ error: 'exists' });
  acc.users[username] = { username, number: String(number||'00'), passhash: sha256(password), pfp: pfp||null, created: Date.now() };
  writeJSON(ACC_FILE, acc);
  // init memory
  const mem = readJSON(MEM_FILE, { states: {} });
  if (!mem.states[username]) mem.states[username] = { vocab:[], facts:[], chats:[] };
  writeJSON(MEM_FILE, mem);
  res.json({ ok:true });
});

// login
app.post('/login', (req,res)=>{
  const { username, password } = req.body||{};
  const acc = readJSON(ACC_FILE, { users: {} });
  const u = acc.users[username];
  if (!u) return res.status(404).json({ error:'not found' });
  if (u.passhash !== sha256(password)) return res.status(403).json({ error:'bad password' });
  res.json({ username: u.username, number: u.number, pfp: u.pfp||null });
});

// load memory
app.get('/mem', (req,res)=>{
  const { username } = req.query;
  if (!username) return res.status(400).json({ error:'username required' });
  const mem = readJSON(MEM_FILE, { states: {} });
  const state = mem.states[username] || { vocab:[], facts:[], chats:[] };
  res.json({ state });
});

// save memory (replace for username)
app.post('/mem', (req,res)=>{
  const { username, state } = req.body||{};
  if (!username || !state) return res.status(400).json({ error:'username+state required' });
  const mem = readJSON(MEM_FILE, { states: {} });
  mem.states[username] = state;
  writeJSON(MEM_FILE, mem);
  res.json({ ok:true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('ShadowApple JSON backend on :'+PORT));
