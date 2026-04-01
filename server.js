const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API Kalit o'z joyiga qotirildi!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBvoE851Dc0iCc4Hr2WZNseaFE8OtMj46s';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Virtual Olim — savol-javob
app.post('/api/ask', async (req, res) => {
  const { question, lang } = req.body;
  if (!question) return res.status(400).json({ error: 'Savol kerak' });

  const systemPrompts = {
    uz: `Sen O'zbek-Xitoy qo'shma kafedrasi muzeyidagi virtual olimsan.
Ixtisosliging: Tan sulolasi (618-907) san'ati, Buyuk Ipak yo'li, O'rta Osiyo arxeologiyasi.
Qoidalar:
- Qisqa, aniq va ilmiy javob ber (2-4 gap)
- Faqat O'zbek tilida gapir
- Iliq va qiziqarli uslubda gapir
- Noma'lum narsani tan ol`,

    zh: `你是乌兹别克斯坦-中国联合教研室博物馆的虚拟学者。
专业：唐代艺术（618-907年）、丝绸之路、中亚考古学。
规则：简洁回答（2-4句话），只用中文，保持学术且友好的语气。`
  };

  const prompt = `${systemPrompts[lang] || systemPrompts.uz}\n\nSavol: ${question}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400,
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Gemini xatosi:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Javob ololmadim.';
    res.json({ answer });

  } catch (err) {
    console.error('Server xatosi:', err.message);
    res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log('\n✅  Smart Museum server ishga tushdi!');
  console.log(`🌐  Sayt: http://localhost:${PORT}`);
});
