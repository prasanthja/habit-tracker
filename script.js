// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration
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
const habitsRef = ref(database, "habits");

// Add a new habit to Firebase
function addHabit(name) {
  const habitRef = push(habitsRef);
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  set(habitRef, {
    name: name,
    createdAt: formattedDate,
    dates: {
      [formattedDate]: false,
    },
  });
}

// Delete a specific habit from Firebase
function deleteHabit(habitId) {
  const habitRef = ref(database, `habits/${habitId}`);
  remove(habitRef)
    .then(() => {
      console.log(`Habit ${habitId} deleted successfully`);
    })
    .catch((error) => {
      console.error("Error deleting habit:", error);
    });
}

// Load habits from Firebase and display in the table
function loadHabits() {
  onValue(habitsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      updateTable(data);
    } else {
      updateTable({});
      console.log("No habits found.");
    }
  });
}

// Update the habit table in the HTML
function updateTable(habits) {
  const tableBody = document.getElementById("habitTableBody");
  tableBody.innerHTML = "";

  Object.keys(habits).forEach((habitId) => {
    const habit = habits[habitId];
    const row = document.createElement("tr");

    // Habit Name
    const nameCell = document.createElement("td");
    nameCell.textContent = habit.name;
    row.appendChild(nameCell);

    // Created At
    const createdAtCell = document.createElement("td");
    createdAtCell.textContent = habit.createdAt;
    row.appendChild(createdAtCell);

    // Delete Button
    const deleteCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", () => {
      deleteHabit(habitId);
    });
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);

    tableBody.appendChild(row);
  });
}

// Add habit button event listener
document.getElementById("addHabitButton").addEventListener("click", () => {
  const habitInput = document.getElementById("habitInput");
  const habitName = habitInput.value.trim();
  if (habitName) {
    addHabit(habitName);
    habitInput.value = "";
  }
});

// Load habits on page load
loadHabits();
