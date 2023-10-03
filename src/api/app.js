const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const timezoneOptions = {
  timeZone: 'Australia/Sydney',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

function getFirstDayOfMonth() {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  return firstDayOfMonth.toLocaleDateString(undefined, timezoneOptions);
}

function getLastDayOfMonth() {
  const currentDate = new Date();
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  return lastDayOfMonth.toLocaleDateString(undefined, timezoneOptions);
}

//Helper to get a table name
const getTableName = (entryType) => {
  if (entryType === 'expenses') {
    return 'expenses';
  } else if (entryType === 'income') {
    return 'income';
  } else {
    throw new Error('Invalid entry type.');
  }
};

// Insert the entry to either income or expense table
app.post('/entry', async (req, res) => {
  try {
    const { description, amount, type, entryType } = req.body;

    try {
      const tableName = getTableName(entryType);
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];

      const query = `INSERT INTO ${tableName} (description, type, amount, date) VALUES ($1, $2, $3, $4) RETURNING *`;
      const values = [description, type, amount, formattedDate];

      const result = await pool.query(query, values);

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// To get the total expenses
app.get('/expense', async (req, res) => {
  try {
    const firstDayOfMonth = getFirstDayOfMonth();
    const lastDayOfMonth = getLastDayOfMonth();

    const query = `
    SELECT SUM(amount) as "totalExpense" 
    FROM expenses 
    WHERE date::DATE >= $1::DATE AND date::DATE <= $2::DATE`;

    const values = [firstDayOfMonth, lastDayOfMonth];
    const result = await pool.query(query, values);
    const totalExpense = result.rows[0].totalExpense || 0;
    res.json({ totalExpense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

app.get('/entries/:tableType', async (req, res) => {
  try {
    const { tableType } = req.params;
    const firstDayOfMonth = getFirstDayOfMonth();
    const lastDayOfMonth = getLastDayOfMonth();

    try {
      const tableName = getTableName(tableType);
      const query = `
        SELECT * 
        FROM ${tableName} 
        WHERE date::DATE >= $1::DATE AND date::DATE <= $2::DATE`;

      const values = [firstDayOfMonth, lastDayOfMonth];
      const result = await pool.query(query, values);
      const expenses = result.rows || [];
      res.json({ expenses });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

//Request to delete an entry
app.delete('/entries/:tableType/:id', async (req, res) => {
  try {
    const { tableType, id } = req.params;
    try {
      const tableName = getTableName(tableType);

      const query = `
    DELETE FROM ${tableName}
    WHERE id = $1
    `;
      const result = await pool.query(query, [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Entry not found.' });
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
});

app.listen(port, () => {
  console.log(`Server is runnin on port ${port}.`);
});
