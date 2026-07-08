const denominations = [
  500, 200, 100, 50, 20, 10, 5,
  2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01
];

const moneyGrid = document.getElementById("moneyGrid");
const totalEl = document.getElementById("total");
const historySelect = document.getElementById("historySelect");
const historyInfo = document.getElementById("historyInfo");

function formatMoney(value) {
  return value.toFixed(2) + " €";
}

function nowLocalDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

document.getElementById("countDate").value = nowLocalDateTime();

function createGrid() {
  moneyGrid.innerHTML = "";

  denominations.forEach(value => {
    const div = document.createElement("div");
    div.className = "money-item";

    div.innerHTML = `
      <span>${formatMoney(value)}</span>
      <small>Кількість</small>
      <input type="number" min="0" value="0" data-value="${value}">
      <small class="subtotal">0.00 €</small>
    `;

    moneyGrid.appendChild(div);
  });

  document.querySelectorAll("[data-value]").forEach(input => {
    input.addEventListener("input", calculateTotal);
  });
}

function calculateTotal() {
  let total = 0;

  document.querySelectorAll("[data-value]").forEach(input => {
    const value = Number(input.dataset.value);
    const count = Number(input.value) || 0;
    const subtotal = value * count;

    input.parentElement.querySelector(".subtotal").textContent =
      "Сума: " + formatMoney(subtotal);

    total += subtotal;
  });

  totalEl.textContent = formatMoney(total);
  return total;
}

function getFormData() {
  const items = [];

  document.querySelectorAll("[data-value]").forEach(input => {
    const value = Number(input.dataset.value);
    const count = Number(input.value) || 0;

    items.push({
      denomination: value,
      count: count,
      sum: value * count
    });
  });

  return {
    id: Date.now(),
    date: document.getElementById("countDate").value,
    comment: document.getElementById("comment").value,
    total: calculateTotal(),
    items
  };
}

function getHistory() {
  return JSON.parse(localStorage.getItem("cashCounts") || "[]");
}

function setHistory(data) {
  localStorage.setItem("cashCounts", JSON.stringify(data));
}

function saveCount() {
  const data = getFormData();
  const history = getHistory();

  history.unshift(data);
  setHistory(history);

  renderHistory();
  alert("Перерахунок збережено ✅");
}

function renderHistory() {
  const history = getHistory();
  historySelect.innerHTML = "";

  if (history.length === 0) {
    historySelect.innerHTML = `<option>Немає збережених перерахунків</option>`;
    historyInfo.innerHTML = "";
    return;
  }

  history.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.date} — ${formatMoney(item.total)} ${item.comment ? "— " + item.comment : ""}`;
    historySelect.appendChild(option);
  });

  loadSelected();
}

function loadSelected() {
  const history = getHistory();
  const id = Number(historySelect.value);
  const selected = history.find(item => item.id === id);

  if (!selected) return;

  document.getElementById("countDate").value = selected.date;
  document.getElementById("comment").value = selected.comment || "";

  selected.items.forEach(item => {
    const input = document.querySelector(`[data-value="${item.denomination}"]`);
    if (input) input.value = item.count;
  });

  calculateTotal();

  historyInfo.innerHTML = `
    <h3>Перерахунок від ${selected.date}</h3>
    <p><b>Коментар:</b> ${selected.comment || "—"}</p>
    <p><b>Загальна сума:</b> ${formatMoney(selected.total)}</p>
  `;
}

function deleteSelected() {
  const id = Number(historySelect.value);
  let history = getHistory();

  history = history.filter(item => item.id !== id);
  setHistory(history);

  renderHistory();
}

function clearForm() {
  document.querySelectorAll("[data-value]").forEach(input => input.value = 0);
  document.getElementById("comment").value = "";
  document.getElementById("countDate").value = nowLocalDateTime();
  calculateTotal();
}

function printReport() {
  window.print();
}

function exportJSON() {
  const history = getHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], {
    type: "application/json"
  });

  downloadFile(blob, "cash-history.json");
}

function exportCSV() {
  const history = getHistory();

  let csv = "Дата;Коментар;Номінал;Кількість;Сума;Загальна сума\n";

  history.forEach(entry => {
    entry.items.forEach(item => {
      csv += `${entry.date};${entry.comment || ""};${item.denomination};${item.count};${item.sum.toFixed(2)};${entry.total.toFixed(2)}\n`;
    });
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8"
  });

  downloadFile(blob, "cash-history.csv");
}

function downloadFile(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      setHistory(data);
      renderHistory();
      alert("Файл імпортовано ✅");
    } catch {
      alert("Помилка файлу ❌");
    }
  };

  reader.readAsText(file);
}

createGrid();
renderHistory();
calculateTotal();
