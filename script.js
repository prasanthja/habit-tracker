const SPREADSHEET_ID = "your-spreadsheet-id"; // Replace with your spreadsheet ID
const SHEET_NAME = "Sheet1"; // Name of the sheet
const API_KEY = "your-api-key"; // Replace with your API key
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

// Save habits to Google Sheets
const saveHabitsToSheets = async () => {
  const data = habits.map(habit => [
    habit.name,
    JSON.stringify(habit.dates),
    habit.total,
    habit.streak,
    habit.longest,
    habit.last7,
    habit.last30
  ]);

  try {
    await axios.put(
      `${BASE_URL}/${SHEET_NAME}?valueInputOption=RAW&key=${API_KEY}`,
      {
        range: SHEET_NAME,
        majorDimension: "ROWS",
        values: [["Habit Name", "Dates", "Total", "Streak", "Longest", "Last 7 Days", "Last 30 Days"], ...data],
      }
    );
    console.log("Habits saved to Google Sheets");
  } catch (error) {
    console.error("Error saving habits to Google Sheets:", error);
  }
};

// Load habits from Google Sheets
const loadHabitsFromSheets = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${SHEET_NAME}?key=${API_KEY}`);
    const rows = response.data.values;
    habits = rows.slice(1).map(row => ({
      name: row[0],
      dates: JSON.parse(row[1]),
      total: parseInt(row[2], 10),
      streak: parseInt(row[3], 10),
      longest: parseInt(row[4], 10),
      last7: parseInt(row[5], 10),
      last30: parseInt(row[6], 10),
    }));
    generateLayout();
    console.log("Habits loaded from Google Sheets");
  } catch (error) {
    console.error("Error loading habits from Google Sheets:", error);
  }
};

// Initialize
window.onload = loadHabitsFromSheets;
