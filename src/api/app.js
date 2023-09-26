const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.use(cors());

app.post('/entry', async (req, res) => {
  try {
    const { description, amount, type, entryType } = req.body;
    let tableName;
    if (entryType === 'expense') {
      tableName = 'expenses';
    } else if (entryType === 'income') {
      tableName = 'income';
    } else {
      return res.status(400).json({ error: 'Invalid entry type.' });
    }

    const query = `INSERT INTO ${tableName} (description, type, amount) VALUES ($1, $2, $3) RETURNING *`;
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
