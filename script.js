// Import the Firebase SDK and initialize the app
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase configuration (your config object)
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

// Function to save a habit
function saveHabit(habitName) {
  const habitRef = ref(database, "habits/");
  const newHabitRef = push(habitRef);
  set(newHabitRef, {
    name: habitName,
    createdAt: new Date().toISOString(),
  })
    .then(() => {
      console.log("Habit saved successfully!");
    })
    .catch((error) => {
      console.error("Error saving habit: ", error);
    });
}

// Function to fetch habits
function fetchHabits() {
  const habitRef = ref(database, "habits/");
  onValue(habitRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      console.log("Habits fetched: ", data);
      updateUI(data);
    } else {
      console.log("No habits found.");
    }
  });
}

// Function to update the UI with habits
function updateUI(data) {
  const habitTable = document.querySelector("#habitTable tbody");
  habitTable.innerHTML = ""; // Clear existing habits
  for (const key in data) {
    const habit = data[key];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${habit.name}</td>
      <td>${new Date(habit.createdAt).toLocaleString()}</td>
    `;
    habitTable.appendChild(row);
  }
}

// Event listener for "Add Habit" button
document.querySelector("#addHabitButton").addEventListener("click", () => {
  const habitNameInput = document.querySelector("#habitNameInput");
  const habitName = habitNameInput.value.trim();
  if (habitName) {
    saveHabit(habitName);
    habitNameInput.value = ""; // Clear input
  } else {
    alert("Please enter a habit name.");
  }
});

// Call fetchHabits to load existing habits
fetchHabits();
