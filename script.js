const money = [
  { value: 1000, title: "1000 грн", text: "Одна тисяча гривень", img: "images/1000.png" },
  { value: 500, title: "500 грн", text: "Пʼятсот гривень", img: "images/500.png" },
  { value: 200, title: "200 грн", text: "Двісті гривень", img: "images/200.png" },
  { value: 100, title: "100 грн", text: "Сто гривень", img: "images/100.png" },
  { value: 50, title: "50 грн", text: "Пʼятдесят гривень", img: "images/50.png" },
  { value: 20, title: "20 грн", text: "Двадцять гривень", img: "images/20.png" },
  { value: 10, title: "10 грн", text: "Десять гривень", img: "images/10.png" },
  { value: 5, title: "5 грн", text: "Пʼять гривень", img: "images/5.png" },
  { value: 2, title: "2 грн", text: "Дві гривні", img: "images/2.png" },
  { value: 1, title: "1 грн", text: "Одна гривня", img: "images/1.png" }
];

const extra = [
  { id: "safe", title: "🏦 Сейф", text: "Кошти в сейфі" },
  { id: "packed", title: "📦 Запаковані", text: "Запаковані купюри / гривні" },
  { id: "damaged", title: "🧾 Порвані", text: "Пошкоджені купюри / гривні" }
];

const moneyRows = document.getElementById("moneyRows");
const extraRows = document.getElementById("extraRows");

const actualTotal = document.getElementById("actualTotal");
const expectedTotal = document.getElementById("expectedTotal");
const differenceTotal = document.getElementById("differenceTotal");

const expectedInput = document.getElementById("expected");
const commentInput = document.getElementById("comment");
const cashNameInput = document.getElementById("cashName");

const historyList = document.getElementById("historyList");
const searchHistory = document.getElementById("searchHistory");

function formatMoney(num) {
  return Number(num || 0).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " грн";
}

function updateClock() {
  const now = new Date();

  document.getElementById("liveDate").textContent =
    now.toLocaleDateString("uk-UA");

  document.getElementById("liveTime").textContent =
    now.toLocaleTimeString("uk-UA");

  document.getElementById("liveDay").textContent =
    now.toLocaleDateString("uk-UA", { weekday: "long" });
}

setInterval(updateClock, 1000);
updateClock();

function renderMoney() {
  moneyRows.innerHTML = "";

  money.forEach(item => {
    const row = document.createElement("div");
    row.className = "money-row";

    row.innerHTML = `
      <div class="nominal">
        <img src="${item.img}" alt="${item.title}" onerror="this.style.display='none'">
        <div>
          ${item.title}
          <small>${item.text}</small>
        </div>
      </div>

      <input 
        type="number" 
        min="0" 
        inputmode="numeric" 
        placeholder="" 
        data-type="money" 
        data-value="${item.value}"
      >

      <div class="sum" data-sum="${item.value}">0,00 грн</div>
    `;

    moneyRows.appendChild(row);
  });
}

function renderExtra() {
  extraRows.innerHTML = "";

  extra.forEach(item => {
    const row = document.createElement("div");
    row.className = "extra-row";

    row.innerHTML = `
      <div class="nominal">
        <div>
          ${item.title}
          <small>${item.text}</small>
        </div>
      </div>

      <input 
        type="number" 
        step="0.01" 
        min="0" 
        inputmode="decimal" 
        placeholder="" 
        data-type="extra" 
        data-id="${item.id}"
      >

      <div class="sum" data-extra-sum="${item.id}">0,00 грн</div>
    `;

    extraRows.appendChild(row);
  });
}

function calculate() {
  let total = 0;

  document.querySelectorAll('[data-type="money"]').forEach(input => {
    const count = Number(input.value || 0);
    const value = Number(input.dataset.value);
    const sum = count * value;

    total += sum;

    const sumEl = document.querySelector(`[data-sum="${value}"]`);
    if (sumEl) sumEl.textContent = formatMoney(sum);
  });

  document.querySelectorAll('[data-type="extra"]').forEach(input => {
    const value = Number(input.value || 0);
    total += value;

    const sumEl = document.querySelector(`[data-extra-sum="${input.dataset.id}"]`);
    if (sumEl) sumEl.textContent = formatMoney(value);
  });

  const expected = Number(expectedInput.value || 0);
  const difference = total - expected;

  actualTotal.textContent = formatMoney(total);
  expectedTotal.textContent = formatMoney(expected);
  differenceTotal.textContent = formatMoney(difference);

  differenceTotal.classList.remove("green", "red", "orange");

  if (difference === 0) {
    differenceTotal.classList.add("green");
  } else if (difference < 0) {
    differenceTotal.classList.add("red");
  } else {
    differenceTotal.classList.add("orange");
  }

  autoSaveDraft();

  return {
    total,
    expected,
    difference
  };
}

function getData() {
  const calc = calculate();

  const items = money.map(item => {
    const input = document.querySelector(`[data-value="${item.value}"]`);
    const count = Number(input.value || 0);

    return {
      title: item.title,
      value: item.value,
      count,
      sum: count * item.value
    };
  });

  const extras = extra.map(item => {
    const input = document.querySelector(`[data-id="${item.id}"]`);
    const value = Number(input.value || 0);

    return {
      title: item.title,
      value
    };
  });

  const now = new Date();

  return {
    id: Date.now(),
    cashName: cashNameInput.value,
    comment: commentInput.value,
    date: now.toLocaleDateString("uk-UA"),
    time: now.toLocaleTimeString("uk-UA"),
    iso: now.toISOString(),
    items,
    extras,
    total: calc.total,
    expected: calc.expected,
    difference: calc.difference
  };
}

function saveCount() {
  const data = getData();
  const history = getHistory();

  history.unshift(data);
  localStorage.setItem("cashHistoryV2", JSON.stringify(history));

  renderHistory();

  alert("Перерахунок збережено ✅");
}

function getHistory() {
  return JSON.parse(localStorage.getItem("cashHistoryV2") || "[]");
}

function renderHistory() {
  const query = searchHistory.value.toLowerCase();
  const history = getHistory();

  historyList.innerHTML = "";

  const filtered = history.filter(item => {
    const text = `
      ${item.date}
      ${item.time}
      ${item.total}
      ${item.comment}
      ${item.cashName}
    `.toLowerCase();

    return text.includes(query);
  });

  if (filtered.length === 0) {
    historyList.innerHTML = "<p>Немає збережених перерахунків</p>";
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <div>
        <strong>${item.date} ${item.time}</strong><br>
        ${item.cashName || "Каса"} — ${item.comment || "Без коментаря"}
      </div>
      <strong>${formatMoney(item.total)}</strong>
    `;

    div.onclick = () => loadHistory(item.id);

    historyList.appendChild(div);
  });
}

function loadHistory(id) {
  const history = getHistory();
  const item = history.find(x => x.id === id);

  if (!item) return;

  cashNameInput.value = item.cashName || "";
  commentInput.value = item.comment || "";
  expectedInput.value = item.expected || "";

  item.items.forEach(row => {
    const input = document.querySelector(`[data-value="${row.value}"]`);
    if (input) input.value = row.count || "";
  });

  item.extras.forEach(row => {
    const clearTitle = row.title || "";

    if (clearTitle.includes("Сейф")) {
      document.querySelector('[data-id="safe"]').value = row.value || "";
    }

    if (clearTitle.includes("Запаковані")) {
      document.querySelector('[data-id="packed"]').value = row.value || "";
    }

    if (clearTitle.includes("Порвані")) {
      document.querySelector('[data-id="damaged"]').value = row.value || "";
    }
  });

  calculate();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function printReport() {
  calculate();
  window.print();
}

function autoSaveDraft() {
  const draft = {
    cashName: cashNameInput.value,
    comment: commentInput.value,
    expected: expectedInput.value,
    money: {},
    extra: {}
  };

  document.querySelectorAll('[data-type="money"]').forEach(input => {
    draft.money[input.dataset.value] = input.value;
  });

  document.querySelectorAll('[data-type="extra"]').forEach(input => {
    draft.extra[input.dataset.id] = input.value;
  });

  localStorage.setItem("cashDraftV2", JSON.stringify(draft));
}

function restoreDraft() {
  const draft = JSON.parse(localStorage.getItem("cashDraftV2") || "null");
  if (!draft) return;

  cashNameInput.value = draft.cashName || "";
  commentInput.value = draft.comment || "";
  expectedInput.value = draft.expected || "";

  Object.keys(draft.money || {}).forEach(value => {
    const input = document.querySelector(`[data-value="${value}"]`);
    if (input) input.value = draft.money[value];
  });

  Object.keys(draft.extra || {}).forEach(id => {
    const input = document.querySelector(`[data-id="${id}"]`);
    if (input) input.value = draft.extra[id];
  });
}

document.addEventListener("input", calculate);
searchHistory.addEventListener("input", renderHistory);

renderMoney();
renderExtra();
restoreDraft();
calculate();
renderHistory();
