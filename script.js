import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2LV0KjpKw68y7XnQ410HINhm2_PtB_v8",
  authDomain: "habit-tracker-e469f.firebaseapp.com",
  databaseURL: "https://habit-tracker-e469f-default-rtdb.firebaseio.com",
  projectId: "habit-tracker-e469f",
  storageBucket: "habit-tracker-e469f.firebasestorage.app",
  messagingSenderId: "798400313959",
  appId: "1:798400313959:web:565643f1236a861fe9f2c2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const habitTable = document.getElementById("habitTable");
const addHabitButton = document.getElementById("addHabitButton");
const deleteAllHabitsButton = document.getElementById("deleteAllHabitsButton");
const habitNameInput = document.getElementById("habitNameInput");
const habitsHeader = document.getElementById("habitsHeader");

let habits = {};

// Function to Generate Dates
function generateDates() {
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-12-31");
  const dates = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dates.push(
      currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    );
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

// Function to Render the Table
function renderTable() {
  habitTable.innerHTML = "";
  const dates = generateDates();
  dates.forEach((date, index) => {
    const row = document.createElement("tr");
    const dateCell = document.createElement("td");
    dateCell.textContent = date;
    row.appendChild(dateCell);

    for (const habitId in habits) {
      const buttonCell = document.createElement("td");
      const button = document.createElement("button");
      button.textContent = " ";
      button.className = "red"; // Default Red Button
      button.onclick = () => toggleHabitCompletion(habitId, date, button);
      buttonCell.appendChild(button);
      row.appendChild(buttonCell);
    }
    habitTable.appendChild(row);
  });
}

// Function to Toggle Habit Completion
function toggleHabitCompletion(habitId, date, button) {
  const habitRef = ref(database, `habits/${habitId}/dates/${date}`);
  const isCompleted = button.classList.contains("green");
  set(habitRef, !isCompleted)
    .then(() => {
      button.classList.toggle("green");
      button.classList.toggle("red");
    })
    .catch((error) => console.error("Error updating habit completion: ", error));
}

// Function to Fetch Habits
function fetchHabits() {
  const habitRef = ref(database, "habits/");
  onValue(habitRef, (snapshot) => {
    habits = snapshot.val() || {};
    habitsHeader.innerHTML = "";
    for (const habitId in habits) {
      const habit = habits[habitId];
      const habitColumn = document.createElement("th");
      habitColumn.textContent = habit.name;
      habitsHeader.appendChild(habitColumn);
    }
    renderTable();
  });
}

// Function to Add a Habit
function addHabit() {
  const habitName = habitNameInput.value.trim();
  if (!habitName) {
    alert("Please enter a habit name!");
    return;
  }
  const habitRef = ref(database, "habits/");
  const newHabitRef = push(habitRef);
  set(newHabitRef, { name: habitName, dates: {} })
    .then(() => {
      habitNameInput.value = "";
    })
    .catch((error) => console.error("Error adding habit: ", error));
}

// Function to Delete All Habits
function deleteAllHabits() {
  const habitRef = ref(database, "habits/");
  remove(habitRef)
    .then(() => console.log("All habits deleted!"))
    .catch((error) => console.error("Error deleting habits: ", error));
}

// Event Listeners
addHabitButton.addEventListener("click", addHabit);
deleteAllHabitsButton.addEventListener("click", deleteAllHabits);

// Initial Fetch
fetchHabits();
