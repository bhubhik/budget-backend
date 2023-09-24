const createExpenseTable = `
CREATE TABLE public.expenses (
  id serial PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL
  )
`;

const getAllExpenses = 'SELECT * FROM expenses';
