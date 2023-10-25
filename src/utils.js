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

module.exports = {
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getTableName,
};
