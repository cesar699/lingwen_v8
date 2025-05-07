const fs = require('fs');
const EPub = require('epub-gen');
const officegen = require('officegen');

const path = require('path');
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(helmet());
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 60*1000, max: 100 }));
app.use(cors());
app.use(bodyParser.json());
app.use('/export', express.static(path.join(__dirname, '../export')));


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// AI创作接口 - GPT 对接
app.post('/api/create', async (req, res) => {
  try {
    const { prompt, prevText } = req.body;
    const fullPrompt = `请根据以下内容续写章节：前文：${prevText}
提示：${prompt}`;
    const completion = await openai.createCompletion({
      model: "gpt-4",
      prompt: fullPrompt,
      max_tokens: 1024,
      temperature: 0.7
    });
    const text = completion.data.choices[0].text.trim();
    res.json({ title: 'AI生成章节', content: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI生成失败' });
  }
});

// 设定管理
app.get('/api/setting', (req, res) => {
  db.all('SELECT * FROM settings', (err, rows) => res.json(rows));
});
app.post('/api/setting', (req, res) => {
  const { type, data } = req.body;
  db.run('INSERT INTO settings (type, data) VALUES (?, ?)', [type, JSON.stringify(data)], function(err) {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, type, data });
  });
});
app.put('/api/setting/:id', (req, res) => {
  const { id } = req.params;
  const { type, data } = req.body;
  db.run('UPDATE settings SET type=?, data=? WHERE id=?', [type, JSON.stringify(data), id], function(err) {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
app.delete('/api/setting/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM settings WHERE id=?', [id], function(err) {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 章节管理

// 接口提供者管理
app.get('/api/provider', (req, res) => {
  db.all('SELECT * FROM api_providers', (err, rows) => res.json(rows));
});
app.post('/api/provider/:id/activate', (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    db.run('UPDATE api_providers SET active=0');
    db.run('UPDATE api_providers SET active=1 WHERE id=?', [id], (err) => {
      if(err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});
app.get('/api/chapter', (req, res) => {
  db.all('SELECT * FROM chapters', (err, rows) => res.json(rows));
});
app.post('/api/chapter', (req, res) => {
  const { title, content } = req.body;
  db.run('INSERT INTO chapters (title, content) VALUES (?, ?)', [title, content], function(err) {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});


// 导出章节接口 - TXT & EPUB (简单TXT实现)
app.post('/api/export', (req, res) => {
  db.all('SELECT * FROM chapters ORDER BY id', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const lines = rows.map(ch => `# ${ch.title}\n${ch.content}\n`).join('\n');
    const exportDir = path.join(__dirname, '../export');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);
    const filePath = path.join(exportDir, 'novel.txt');
    fs.writeFileSync(filePath, lines, 'utf-8');
    res.json({ link: '/export/novel.txt' });
  });
});


// EPUB导出接口
app.post('/api/export/epub', (req, res) => {
  db.all('SELECT * FROM chapters ORDER BY id', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const options = {
      title: "小说导出",
      content: rows.map(ch => ({ title: ch.title, data: ch.content })),
      output: "./export/novel.epub"
    };
    new EPub(options).promise.then(() => {
      res.json({ link: '/export/novel.epub' });
    }).catch(e => res.status(500).json({ error: e.message }));
  });
});


// Word导出接口
app.post('/api/export/docx', (req, res) => {
  db.all('SELECT * FROM chapters ORDER BY id', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const docx = officegen('docx');
    rows.forEach(ch => {
      docx.createP().addText(ch.title, { bold: true, font_size: 16 });
      docx.createP().addText(ch.content);
    });
    const out = fs.createWriteStream('./export/novel.docx');
    docx.generate(out);
    out.on('close', () => res.json({ link: '/export/novel.docx' }));
    out.on('error', err => res.status(500).json({ error: err.message }));
  });
});

// 计划管理

// 计划管理 - 增删改
app.get('/api/schedule', (req, res) => {
  db.all('SELECT * FROM schedule', (err, rows) => res.json(rows));
});
app.post('/api/schedule', (req, res) => {
  const { date, target } = req.body;
  db.run('INSERT INTO schedule (date, target) VALUES (?, ?)', [date, target], function(err) {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});
app.put('/api/schedule/:id', (req, res) => {
  const { id } = req.params;
  const { date, target } = req.body;
  db.run('UPDATE schedule SET date=?, target=? WHERE id=?', [date, target, id], function(err) {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
app.delete('/api/schedule/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM schedule WHERE id=?', [id], function(err) {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
app.get('/api/schedule', (req, res) => {
  db.all('SELECT * FROM schedule', (err, rows) => res.json(rows));
});
app.post('/api/schedule', (req, res) => {
  const { date, target } = req.body;
  db.run('INSERT INTO schedule (date, target) VALUES (?, ?)', [date, target], function(err) {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
