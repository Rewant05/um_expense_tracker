let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let bankAmount = localStorage.getItem("bankAmount");

if (!bankAmount) {
  bankAmount = prompt("Enter your current bank amount:");
  while (isNaN(bankAmount) || bankAmount.trim() === "") {
    bankAmount = prompt("Please enter a valid number for your current bank amount:");
  }
  localStorage.setItem("bankAmount", bankAmount);
}

// DOM Elements
const form = document.getElementById("transaction-form");
const list = document.getElementById("transaction-list");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");
const netBalance = document.getElementById("net-balance");
const bankDisplay = document.getElementById("bank-amount");
const filter = document.getElementById("category-filter");

bankDisplay.innerText = parseFloat(bankAmount).toFixed(2);

form.addEventListener("submit", addOrUpdateTransaction);
filter.addEventListener("change", displayTransactions);

let expenseChart;
let editTransactionId = null;

function addOrUpdateTransaction(e) {
  e.preventDefault();

  const date = document.getElementById("date").value;
  const desc = document.getElementById("description").value.trim();
  const amount = +document.getElementById("amount").value;
  const category = document.getElementById("category").value;

  if (!date || !desc || !amount || !category) {
    alert("Please fill all fields correctly!");
    return;
  }

  if (editTransactionId !== null) {
    transactions = transactions.map(t =>
      t.id === editTransactionId
        ? { id: editTransactionId, date, desc, amount, category }
        : t
    );
    editTransactionId = null;
    form.querySelector("button[type='submit']").innerText = "Add Transaction";
  } else {
    const transaction = {
      id: Date.now(),
      date,
      desc,
      amount,
      category
    };
    transactions.push(transaction);
  }

  updateLocalStorage();
  displayTransactions();
  updateChart();
  form.reset();
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  displayTransactions();
  updateChart();
}

function editTransaction(id) {
  const t = transactions.find(tx => tx.id === id);
  if (!t) return;

  document.getElementById("date").value = t.date;
  document.getElementById("description").value = t.desc;
  document.getElementById("amount").value = t.amount;
  document.getElementById("category").value = t.category;

  editTransactionId = id;
  form.querySelector("button[type='submit']").innerText = "Update Transaction";
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function displayTransactions() {
  list.innerHTML = "";
  let income = 0, expense = 0;
  const selectedCategory = filter.value;

  transactions.forEach((t) => {
    if (selectedCategory !== "All" && t.category !== selectedCategory) return;

    const li = document.createElement("li");
    li.classList.add("transaction-item", t.category === "Income" ? "income" : "expense");
    li.innerHTML = `
      ${t.date} | ${t.desc} | ₹${t.amount} [${t.category}]
      <button class="edit-btn" onclick="editTransaction(${t.id})">Edit</button>
      <button class="delete-btn" onclick="deleteTransaction(${t.id})">X</button>
    `;

    if (t.category === "Income") income += t.amount;
    else expense += t.amount;

    list.appendChild(li);
  });

  totalIncome.innerText = income.toFixed(2);
  totalExpense.innerText = expense.toFixed(2);
  netBalance.innerText = (parseFloat(bankAmount) + income - expense).toFixed(2);
}

function updateChart() {
  const categoryTotals = {};

  transactions.forEach(t => {
    if (t.category !== "Income") {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
      }
      categoryTotals[t.category] += t.amount;
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (expenseChart) {
    expenseChart.destroy();
  }

  const ctx = document.getElementById("expenseChart").getContext("2d");

  expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          "#f94144", "#f3722c", "#f8961e",
          "#f9844a", "#43aa8b", "#577590"
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true,
          text: 'Expense Breakdown by Category'
        }
      }
    }
  });
}

window.onload = function () {
  displayTransactions();
  updateChart();
};

// 🌙 DARK MODE
const darkModeToggle = document.getElementById("toggle-dark-mode");
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  darkModeToggle.textContent = "☀️ Light Mode";
}
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  darkModeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
