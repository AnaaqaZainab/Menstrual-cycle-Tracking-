let periodDays = [];
let notes = {};
let selectedDate = null;

function saveCycle() {
  const start = new Date(document.getElementById("periodStart").value);
  const cycleLength = parseInt(document.getElementById("cycleLength").value) || 28;

  periodDays = [];
  for (let i = 0; i < 5; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    periodDays.push(day.toISOString().split('T')[0]);
  }

  localStorage.setItem("periodDays", JSON.stringify(periodDays));
  generateCalendar();
}

function generateCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = new Date(year, month, i).toISOString().split('T')[0];
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    if (periodDays.includes(dateStr)) {
      dayDiv.classList.add("period");
    }
    dayDiv.textContent = i;
    dayDiv.onclick = () => selectDate(dateStr);
    cal.appendChild(dayDiv);
  }
}

function selectDate(date) {
  selectedDate = date;
  document.getElementById("logOutput").textContent = notes[date] || "No notes for this date.";
}

function saveNote() {
  if (!selectedDate) {
    alert("Select a date from the calendar first.");
    return;
  }

  const text = document.getElementById("dailyNote").value;
  notes[selectedDate] = text;
  localStorage.setItem("notes", JSON.stringify(notes));
  document.getElementById("logOutput").textContent = text;
}

window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("periodDays"));
  if (saved) periodDays = saved;

  const storedNotes = JSON.parse(localStorage.getItem("notes"));
  if (storedNotes) notes = storedNotes;

  generateCalendar();
};
function saveMood() {
  const mood = document.getElementById("moodSelect").value;
  if (!mood) {
    alert("Please select a mood.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const moodEntry = { date: today, mood: mood };

  const moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];
  moodHistory.push(moodEntry);
  localStorage.setItem("moodHistory", JSON.stringify(moodHistory));
  loadMoods();
}

function loadMoods() {
  const list = document.getElementById("moodList");
  list.innerHTML = "";
  const moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];

  moodHistory.slice().reverse().forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.date}: ${entry.mood}`;
    list.appendChild(li);
  });
}

window.onload = loadMoods;
function saveEntry() {
  const date = document.getElementById("date").value;
  const selectedOptions = [];
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    if (checkbox.checked) {
      selectedOptions.push(checkbox.value);
      checkbox.checked = false; // Clear after save
    }
  });

  if (!date || selectedOptions.length === 0) {
    alert("Please enter the date and select at least one option.");
    return;
  }

  const entry = { date, options: selectedOptions };
  let logs = JSON.parse(localStorage.getItem("healthLog")) || [];
  logs.push(entry);
  localStorage.setItem("healthLog", JSON.stringify(logs));

  renderLogs();
}

function renderLogs() {
  const logList = document.getElementById("logList");
  logList.innerHTML = "";
  const logs = JSON.parse(localStorage.getItem("healthLog")) || [];

  logs.slice().reverse().forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.date}: ${entry.options.join(", ")}`;
    logList.appendChild(li);
  });
}

window.onload = renderLogs;
function setPillReminder() {
  const time = document.getElementById("pillTime").value;
  if (!time) {
    alert("Please select a time.");
    return;
  }
  localStorage.setItem("pillReminder", time);
  document.getElementById("pillStatus").textContent = `Reminder set for ${time}`;

  scheduleReminder(time);
}

function scheduleReminder(time) {
  const [targetHour, targetMinute] = time.split(":").map(Number);

  setInterval(() => {
    const now = new Date();
    if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
      alert("💊 Time to take your pill!");
    }
  }, 60000); // check every minute
}

window.onload = () => {
  const savedTime = localStorage.getItem("pillReminder");
  if (savedTime) {
    document.getElementById("pillStatus").textContent = `Reminder set for ${savedTime}`;
    scheduleReminder(savedTime);
  }
};
function saveSleep() {
  const date = document.getElementById("sleepDate").value;
  const sleepTime = document.getElementById("sleepTime").value;
  const wakeTime = document.getElementById("wakeTime").value;

  if (!date || !sleepTime || !wakeTime) {
    alert("Please fill in all fields.");
    return;
  }

  // Parse time and calculate duration
  const sleepDateTime = new Date(`${date}T${sleepTime}`);
  let wakeDateTime = new Date(`${date}T${wakeTime}`);
  
  // If wake time is next day
  if (wakeDateTime <= sleepDateTime) {
    wakeDateTime.setDate(wakeDateTime.getDate() + 1);
  }

  const durationMs = wakeDateTime - sleepDateTime;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);

  const sleepEntry = {
    date,
    sleepTime,
    wakeTime,
    duration: `${hours}h ${minutes}m`
  };

  const sleepLogs = JSON.parse(localStorage.getItem("sleepLogs")) || [];
  sleepLogs.push(sleepEntry);
  localStorage.setItem("sleepLogs", JSON.stringify(sleepLogs));

  renderLogs();
}

function renderLogs() {
  const logList = document.getElementById("sleepLog");
  logList.innerHTML = "";
  const logs = JSON.parse(localStorage.getItem("sleepLogs")) || [];

  logs.slice().reverse().forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.date}: Slept at ${log.sleepTime}, woke at ${log.wakeTime}, Duration: ${log.duration}`;
    logList.appendChild(li);
  });
}

window.onload = renderLogs;
// Simulate data
let cycleLengths = [28, 30, 35, 32];
let symptomCounts = {
  cramps: 3,
  headache: 2,
  moodSwings: 4,
  acne: 1
};

// Line chart for cycle lengths
const ctx1 = document.getElementById('cycleChart').getContext('2d');
new Chart(ctx1, {
  type: 'line',
  data: {
    labels: cycleLengths.map((_, i) => `Cycle ${i + 1}`),
    datasets: [{
      label: 'Cycle Length (days)',
      data: cycleLengths,
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: '#ff4d6d',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true
  }
});

// Bar chart for symptoms
const ctx2 = document.getElementById('symptomChart').getContext('2d');
new Chart(ctx2, {
  type: 'bar',
  data: {
    labels: Object.keys(symptomCounts),
    datasets: [{
      label: 'Symptom Frequency',
      data: Object.values(symptomCounts),
      backgroundColor: '#6a0dad'
    }]
  },
  options: {
    responsive: true
  }
});
// Average cycle length
let avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
console.log("Average Cycle Length:", avg.toFixed(1));

// Detect irregular cycles
function isIrregular(cycles) {
  const min = Math.min(...cycles);
  const max = Math.max(...cycles);
  return (max - min) > 7;
}
console.log("Irregular Cycles:", isIrregular(cycleLengths));
function saveCycleLength() {
  const length = document.getElementById("cycleLength").value;
  if (length && length > 0) {
    localStorage.setItem("cycleLength", length);
    alert(`Cycle length saved: ${length} days`);
  } else {
    alert("Please enter a valid number.");
  }
}
function savePCODSymptoms() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const symptoms = Array.from(checkboxes).map(cb => cb.value);
  localStorage.setItem("pcodSymptoms", JSON.stringify(symptoms));
  alert("Symptoms saved: " + symptoms.join(", "));
}
function showNextPeriodPrediction() {
  const cycle = parseInt(localStorage.getItem("cycleLength"));
  const last = JSON.parse(localStorage.getItem("lastPeriod"));

  if (last && cycle) {
    const nextDate = new Date(last.start);
    nextDate.setDate(nextDate.getDate() + cycle);
    alert(`Next predicted period: ${nextDate.toDateString()}`);
  } else {
    alert("Missing cycle info or last period date.");
  }
}
function checkPCOD() {
  const checked = Array.from(document.querySelectorAll('input[name="symptom"]:checked'));
  const result = document.getElementById("result");

  if (checked.length >= 3) {
    result.innerHTML = `⚠️ You selected ${checked.length} symptoms. Please consult a gynecologist. These may indicate PCOD.`;
    result.style.color = "red";
  } else if (checked.length > 0) {
    result.innerHTML = `ℹ️ Some symptoms present. Track consistently. If it continues, consider a checkup.`;
    result.style.color = "orange";
  } else {
    result.innerHTML = `✅ No major symptoms selected. Stay healthy and track regularly.`;
    result.style.color = "green";
  }
}
function generateCalendar() {
  const start = new Date(document.getElementById("periodStart").value);
  const cycleLength = parseInt(document.getElementById("cycleLength").value);
  const symptomInput = document.getElementById("symptomDays").value;
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  if (!start || isNaN(cycleLength)) {
    alert("Please enter valid period start date and cycle length.");
    return;
  }

  const ovulationDay = new Date(start);
  ovulationDay.setDate(start.getDate() + cycleLength - 14);

  const fertileWindow = [];
  for (let i = 5; i >= 1; i--) {
    const date = new Date(ovulationDay);
    date.setDate(date.getDate() - i);
    fertileWindow.push(date.toISOString().split("T")[0]);
  }
  const ovulationDateStr = ovulationDay.toISOString().split("T")[0];

  const symptomDays = symptomInput.split(",").map(s => s.trim());

  // Generate current month's calendar
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split("T")[0];

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = d;

    if (fertileWindow.includes(dateStr)) {
      dayDiv.classList.add("fertile");
    }
    if (dateStr === ovulationDateStr) {
      dayDiv.classList.add("ovulation");
    }
    if (symptomDays.includes(dateStr)) {
      dayDiv.classList.add("symptom");
    }

    calendar.appendChild(dayDiv);
  }
}
const tips = [
  "Try child’s pose or butterfly stretch for cramps.",
  "Drink ginger or chamomile tea to ease discomfort.",
  "Take a warm bath with Epsom salt to relax.",
  "Do 5 minutes of deep breathing or meditation.",
  "Avoid screen time before bed for better sleep.",
  "Try a short walk or gentle yoga to boost mood."
];

function showSelfCareTip() {
  const randomIndex = Math.floor(Math.random() * tips.length);
  document.getElementById("selfCareTip").textContent = tips[randomIndex];
}

function saveCraving() {
  const craving = document.getElementById("cravingInput").value.trim();
  const log = document.getElementById("cravingLog");
  const suggestion = document.getElementById("foodSuggestion");

  if (craving === "") {
    alert("Please enter a craving.");
    return;
  }

  log.textContent = `You craved: ${craving}`;

  // Basic suggestions (can expand with AI/ML later!)
  let response = "Try staying hydrated and choose whole foods.";

  if (craving.toLowerCase().includes("sweet")) {
    response = "Try dark chocolate, dates, or fruit with yogurt.";
  } else if (craving.toLowerCase().includes("salty")) {
    response = "Go for nuts, seeds, or homemade popcorn.";
  } else if (craving.toLowerCase().includes("chocolate")) {
    response = "Dark chocolate contains magnesium and can help!";
  } else if (craving.toLowerCase().includes("fried")) {
    response = "Consider baked sweet potatoes or grilled snacks.";

  }

  suggestion.textContent = `✅ Suggested foods: ${response}`;
}
function toggleFAQs() {
  const faq = document.getElementById("faqList");
  faq.style.display = faq.style.display === "none" ? "block" : "none";
}
