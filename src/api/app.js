const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.use(cors());

app.post('/expense', async (req, res) => {
  try {
    const { description, amount, type } = req.body;
    const query =
      'INSERT INTO expenses (description, type, amount) VALUES ($1, $2, $3) RETURNING *';
    const values = [description, type, amount];

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

app.listen(port, () => {
  console.log(`Server is runnin on port ${port}.`);
});
