import 'dotenv/config'
import genCont from "./agents.js";
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'https://luizfelipedossantos.github.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
  res.send('Home');
});

app.get('/post/:subject', async (req, res) => {
  const subject = req.params.subject;
  const cont = await genCont(subject);
  res.send(cont);
})
