
## クイズ作成AIの仕様メモ

- Node.js(Express)で動作する
- ExpressでAPIサーバーを立てる
- OpenAIのAPIを利用してクイズを生成する
- microCMSのcontentsのデータを引数にしてクイズを生成する
- 生成したクイズはJSON形式で返す

### リクエストの定義



microCMSのcontentsの一つを引数に取る

例: 
```json
{
    "id": "v6_5i1yfr",
    "createdAt": "2023-01-18T06:32:59.656Z",
    "updatedAt": "2023-01-18T06:32:59.656Z",
    "publishedAt": "2023-01-18T06:32:59.656Z",
    "revisedAt": "2023-01-18T06:32:59.656Z",
    "title": "Many a true word is spoken in jest. (嘘から出た真実)",
    "number": "3",
    "thumbnail": {
        "url": "https://images.microcms-assets.io/assets/fb5ac5fcb9434437bc286d63c7ad6b87/3a4040b8b2334ada87c722e69c4d05e8/AAAABZxfpopmufWDxhlw4ijph9L1q-Ueno4vwCXuOztOqyx47C75X6ahdYa9n3KNEFg4AxJengYbk_7-sOy9Y-RKApR7RDIQGdi5qH9YM97T2Zgq0f-_jCAmCpYH.jpg",
        "height": 252,
        "width": 448
    },
    "description": "期待の新人ヒーロの足を引っ張っていると上司から責められる虎徹。そんな中、\"HERO TV\"の企画で、バーナビーへの密着取材が始まるが...。"
}
```

最小:

```json
{
    "id": "v6_5i1yfr",
    "createdAt": "2023-01-18T06:32:59.656Z",
    "updatedAt": "2023-01-18T06:32:59.656Z",
    "publishedAt": "2023-01-18T06:32:59.656Z",
    "revisedAt": "2023-01-18T06:32:59.656Z",
    "title": "Many a true word is spoken in jest. (嘘から出た真実)",
    "number": "3",
    "thumbnail": {
        "url": "https://images.microcms-assets.io/assets/fb5ac5fcb9434437bc286d63c7ad6b87/3a4040b8b2334ada87c722e69c4d05e8/AAAABZxfpopmufWDxhlw4ijph9L1q-Ueno4vwCXuOztOqyx47C75X6ahdYa9n3KNEFg4AxJengYbk_7-sOy9Y-RKApR7RDIQGdi5qH9YM97T2Zgq0f-_jCAmCpYH.jpg",
        "height": 252,
        "width": 448
    },
    "description": "期待の新人ヒーロの足を引っ張っていると上司から責められる虎徹。そんな中、\"HERO TV\"の企画で、バーナビーへの密着取材が始まるが...。"
}
```


### レスポンスの定義

```json
{
  "question": "クイズの質問文",
  "options": [
    "選択肢1",
    "選択肢2",
    "選択肢3",
    "選択肢4"
  ],
  "answer": {
    "correct": "正解の選択肢の番号（0〜3の整数）",
    "explanation": "正解の解説文"
  }
}
```





const express = require("express");
const app = express();
const port = 3000;

const dummyData = {
    question: "ここにクイズの質問文が入ります。",
    options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    answer: {
        correct: "1",
        explanation: "正解の解説文正解の解説文正解の解説文正解の解説文",
    },
};

app.get("/", (req, res) => {
    res.json(dummyData);
    res.end();
});

app.post("/", (req, res) => {
    // パラメータの中にcontentが存在しない場合、400エラーを返す
    if (!req.body || !req.body.content) {
        res.status(400).send("Bad Request: 'content' parameter is required.");
        return;
    }

    // ここでcontentを使った処理を行う
    const content = req.body.content;
    // contentがjsonに変換できない場合、400エラーを返す
    let parsedContent;
    try {
        parsedContent = JSON.parse(content);
    } catch (e) {
        res.status(400).send(
            "Bad Request: 'content' parameter must be valid JSON."
        );
        return;
    }

    res.json(dummyData);
    res.end();
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
 
