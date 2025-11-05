import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());

const dummyData = {
  question: "ここにクイズの質問文が入ります。",
  options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  answer: {
    index: 1,
    explanation: "正解の解説文正解の解説文正解の解説文正解の解説文",
  },
  meta: {
    difficulty: "easy",
    sourceId: "dummy",
    sourceTitle: "dummy",
    type: "single",
  },
  cached: true, // 今はキー無しのモックなので true
};

// ヘルスチェック
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "quiz-generator-mock" });
});

app.post("/quiz", (req, res) => {
  const content = req.body?.content;
  if (!content || typeof content !== "object") {
    return res.status(400).json({ error: "Bad Request: 'content' object is required." });
  }

  const quiz = {
    ...dummyData,
    meta: {
      ...dummyData.meta,
      sourceId: content.id ?? "dummy",
      sourceTitle: content.title ?? "dummy",
    },
  };

  return res.json(quiz);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});