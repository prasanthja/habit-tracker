const SPREADSHEET_ID = "1IW5riwOvTlWgnYvA6gCBXdavMT4x9L6HvHF77ONYtjA"; // Your spreadsheet ID
const SHEET_NAME = "Habits2025"; // Your sheet name
const API_KEY = "AIzaSyAKLfJTveVA2s4dvQMzbPNV52BK7O43zAo"; // Your API key
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

// Declare habits globally
let habits = [];

// Save habits to Google Sheets
const saveHabitsToSheets = async () => {
  const data = habits.map(habit => [
    habit.name,
    JSON.stringify(habit.dates),
    habit.total,
    habit.streak,
    habit.longest,
    habit.last7,
    habit.last30,
  ]);

  try {
    const response = await axios.put(
      `${BASE_URL}/${SHEET_NAME}?valueInputOption=RAW&key=${API_KEY}`,
      {
        range: SHEET_NAME,
        majorDimension: "ROWS",
        values: [["Habit Name", "Dates", "Total", "Streak", "Longest", "Last 7 Days", "Last 30 Days"], ...data],
      }
    );
    console.log("Habits saved to Google Sheets:", response.data);
  } catch (error) {
    console.error("Error saving habits to Google Sheets:", error.response?.data || error.message);
    console.error("Full error response:", error);
    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Data:", error.response.data);
      console.error("Error Headers:", error.response.headers);
    }
  }
};

// Load habits from Google Sheets
const loadHabitsFromSheets = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${SHEET_NAME}?key=${API_KEY}`);
    console.log("Google Sheets response:", response.data);

    const rows = response.data.values;
    if (rows && rows.length > 1) {
      habits = rows.slice(1).map(row => ({
        name: row[0],
        dates: JSON.parse(row[1] || "{}"),
        total: parseInt(row[2] || 0, 10),
        streak: parseInt(row[3] || 0, 10),
        longest: parseInt(row[4] || 0, 10),
        last7: parseInt(row[5] || 0, 10),
        last30: parseInt(row[6] || 0, 10),
      }));
      generateLayout();
    } else {
      habits = [];
      console.log("No habits found in Google Sheets.");
    }
  } catch (error) {
    console.error("Error loading habits from Google Sheets:", error.response?.data || error.message);
    console.error("Full error response:", error);
    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Data:", error.response.data);
      console.error("Error Headers:", error.response.headers);
    }
  }
};

// Initialize habits from Google Sheets on page load
window.onload = loadHabitsFromSheets;

// Add new habit and save it
document.getElementById("add-habit").addEventListener("click", async () => {
  console.log("Add Habit button clicked");

  const habitInput = document.getElementById("habit-input");
  const habitName = habitInput.value.trim();
  if (!habitName) {
    console.error("Habit name is empty");
    return;
  }

  console.log("Habit name entered:", habitName);

  habits.push({ name: habitName, dates: {}, total: 0, streak: 0, longest: 0, last7: 0, last30: 0 });
  console.log("Habit added to local array:", habits);

  habitInput.value = ""; // Clear input
  generateLayout();
  await saveHabitsToSheets(); // Save updated data to Sheets
  console.log("Habits saved to Google Sheets");
});

// Delete all habits
document.getElementById("clear-habits").addEventListener("click", async () => {
  if (confirm("Are you sure you want to delete all habits?")) {
    habits = [];
    generateLayout();
    await saveHabitsToSheets(); // Save empty data to Sheets
    console.log("All habits cleared and saved to Google Sheets.");
  }
});

// Generate the habit tracker layout
const generateLayout = () => {
  const thead = document.querySelector("#habit-table thead tr");
  const tbody = document.querySelector("#habit-table tbody");

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  thead.innerHTML = "<th>Date</th>";
  habits.forEach((habit, habitIndex) => {
    const th = document.createElement("th");
    th.innerHTML = `
      <div>
        ${habit.name} <button data-index="${habitIndex}" class="delete-habit">✖</button>
        <div>${habit.total || 0}/365 total days</div>
        <div>Current streak: ${habit.streak || 0} days</div>
        <div>Longest streak: ${habit.longest || 0} days</div>
        <div>Last 7 days: ${habit.last7 || 0}/7</div>
        <div>Last 30 days: ${habit.last30 || 0}/30</div>
      </div>
    `;
    th.querySelector(".delete-habit").addEventListener("click", async () => {
      if (confirm(`Are you sure you want to delete the habit "${habit.name}"?`)) {
        habits.splice(habitIndex, 1); // Remove habit
        await saveHabitsToSheets(); // Update Sheets
        generateLayout(); // Refresh layout
      }
    });
    thead.appendChild(th);
  });

  tbody.innerHTML = "";
  for (let i = 0; i < 365; i++) {
    const date = new Date(new Date("2025-01-01").setDate(i + 1));
    const formattedDate = dateFormatter.format(date);

    const row = document.createElement("tr");
    const rowColor = date.getMonth() % 2 === 0 ? "color1" : "color2"; // Alternate row colors by month
    row.classList.add(rowColor);
    row.innerHTML = `<td>${formattedDate}</td>`;

    habits.forEach((habit, habitIndex) => {
      const td = document.createElement("td");
      const button = document.createElement("button");
      button.className = habit.dates[formattedDate] ? "green" : "red";
      button.addEventListener("click", async () => {
        habit.dates[formattedDate] = !habit.dates[formattedDate];
        updateHabitStats(habit, habitIndex);
        await saveHabitsToSheets(); // Save updated data to Sheets
        generateLayout();
      });
      td.appendChild(button);
      row.appendChild(td);
    });

    tbody.appendChild(row);
  }
};

// Update habit statistics
const updateHabitStats = (habit, habitIndex) => {
  let total = 0,
    streak = 0,
    longest = 0;

  const dates = Object.keys(habit.dates).sort((a, b) => new Date(a) - new Date(b));
  dates.forEach(date => {
    if (habit.dates[date]) {
      total++;
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 0;
    }
  });

  habit.total = total;
  habit.streak = streak;
  habit.longest = longest;
  habits[habitIndex] = habit;
};
