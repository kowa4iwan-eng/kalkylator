const money = [
  { value: 1000, title: "1000 грн", text: "Купюра", img: "images/1000.png", type: "banknote" },
  { value: 500, title: "500 грн", text: "Купюра", img: "images/500.png", type: "banknote" },
  { value: 200, title: "200 грн", text: "Купюра", img: "images/200.png", type: "banknote" },
  { value: 100, title: "100 грн", text: "Купюра", img: "images/100.png", type: "banknote" },
  { value: 50, title: "50 грн", text: "Купюра", img: "images/50.png", type: "banknote" },
  { value: 20, title: "20 грн", text: "Купюра", img: "images/20.png", type: "banknote" },

  { value: 10, title: "10 грн", text: "Монета", img: "images/10.png", type: "coin" },
  { value: 5, title: "5 грн", text: "Монета", img: "images/5.png", type: "coin" },
  { value: 2, title: "2 грн", text: "Монета", img: "images/2.png", type: "coin" },
  { value: 1, title: "1 грн", text: "Монета", img: "images/1.png", type: "coin" }
];

const extra = [
  { id: "safe", title: "🏦 Сейф", text: "Кошти в сейфі" },
  { id: "packed", title: "📦 Запаковані", text: "Запаковані купюри / монети" },
  { id: "damaged", title: "🧾 Порвані", text: "Пошкоджені купюри / монети" }
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

function parseAmount(value) {
  if (!value) return 0;

  const cleaned = String(value)
    .replace(/\s/g, "")
    .replace(",", ".");

  const number = Number(cleaned);
  return isNaN(number) ? 0 : number;
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " грн";
}

function getKyivDate() {
  return new Date().toLocaleDateString("uk-UA", {
    timeZone: "Europe/Kyiv"
  });
}

function getKyivTime() {
  return new Date().toLocaleTimeString("uk-UA", {
    timeZone: "Europe/Kyiv"
  });
}

function getKyivDay() {
  return new Date().toLocaleDateString("uk-UA", {
    timeZone: "Europe/Kyiv",
    weekday: "long"
  });
}

function updateClock() {
  document.getElementById("liveDate").textContent = getKyivDate();
  document.getElementById("liveTime").textContent = getKyivTime();
  document.getElementById("liveDay").textContent = getKyivDay();
}

setInterval(updateClock, 1000);
updateClock();

function renderMoney() {
  moneyRows.innerHTML = "";

  money.forEach(item => {
    const row = document.createElement("div");
    row.className = "money-row";

    const imgClass = item.type === "coin" ? "coin-img" : "";

    row.innerHTML = `
      <div class="nominal">
        <img class="${imgClass}" src="${item.img}" alt="${item.title}" onerror="this.style.display='none'">
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
        type="text" 
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
    const value = parseAmount(input.value);
    total += value;

    const sumEl = document.querySelector(`[data-extra-sum="${input.dataset.id}"]`);
    if (sumEl) sumEl.textContent = formatMoney(value);
  });

  const expected = parseAmount(expectedInput.value);
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
      type: item.type,
      count,
      sum: count * item.value
    };
  });

  const extras = extra.map(item => {
    const input = document.querySelector(`[data-id="${item.id}"]`);
    const value = parseAmount(input.value);

    return {
      id: item.id,
      title: item.title,
      value
    };
  });

  return {
    id: Date.now(),
    cashName: cashNameInput.value,
    comment: commentInput.value,
    date: getKyivDate(),
    time: getKyivTime(),
    day: getKyivDay(),
    iso: new Date().toISOString(),
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
  localStorage.setItem("cashHistoryV3", JSON.stringify(history));

  renderHistory();

  alert("Перерахунок збережено ✅");
}

function getHistory() {
  return JSON.parse(localStorage.getItem("cashHistoryV3") || "[]");
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
  expectedInput.value = item.expected ? String(item.expected).replace(".", ",") : "";

  item.items.forEach(row => {
    const input = document.querySelector(`[data-value="${row.value}"]`);
    if (input) input.value = row.count || "";
  });

  item.extras.forEach(row => {
    const input = document.querySelector(`[data-id="${row.id}"]`);
    if (input) input.value = row.value ? String(row.value).replace(".", ",") : "";
  });

  calculate();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearForm() {
  document.querySelectorAll('[data-type="money"]').forEach(input => {
    input.value = "";
  });

  document.querySelectorAll('[data-type="extra"]').forEach(input => {
    input.value = "";
  });

  expectedInput.value = "";
  commentInput.value = "";

  localStorage.removeItem("cashDraftV3");

  calculate();
}

function buildPrintReport() {
  const data = getData();

  const rows = data.items.map(item => `
    <tr>
      <td>${item.title}</td>
      <td>${item.type === "coin" ? "Монета" : "Купюра"}</td>
      <td class="print-right">${item.count || ""}</td>
      <td class="print-right">${formatMoney(item.sum)}</td>
    </tr>
  `).join("");

  const extraRows = data.extras.map(item => `
    <tr>
      <td>${item.title.replace("🏦", "").replace("📦", "").replace("🧾", "").trim()}</td>
      <td>Додатково</td>
      <td class="print-right">—</td>
      <td class="print-right">${formatMoney(item.value)}</td>
    </tr>
  `).join("");

  document.getElementById("printArea").innerHTML = `
    <div class="print-sheet">
      <div class="print-title">ПІДРАХУНОК ГОТІВКИ В КАСІ</div>
      <div class="print-subtitle">Київський час: ${data.date}, ${data.time}, ${data.day}</div>

      <div class="print-meta">
        <div class="print-box"><b>Назва каси:</b> ${data.cashName || "—"}</div>
        <div class="print-box"><b>Дата і час:</b> ${data.date} ${data.time}</div>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th>Номінал / категорія</th>
            <th>Тип</th>
            <th class="print-right">Кількість</th>
            <th class="print-right">Сума</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          ${extraRows}
        </tbody>
      </table>

      <div class="print-summary">
        <div>
          Очікувана сума
          <strong>${formatMoney(data.expected)}</strong>
        </div>

        <div>
          Фактично пораховано
          <strong>${formatMoney(data.total)}</strong>
        </div>

        <div>
          Різниця
          <strong>${formatMoney(data.difference)}</strong>
        </div>
      </div>

      <div class="print-comment">
        <b>Коментар:</b><br>
        ${data.comment || "—"}
      </div>

      <div class="print-signatures">
        <div>Підпис касира</div>
        <div>Підпис перевіряючого</div>
      </div>
    </div>
  `;
}

function printReport() {
  buildPrintReport();
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

  localStorage.setItem("cashDraftV3", JSON.stringify(draft));
}

function restoreDraft() {
  const draft = JSON.parse(localStorage.getItem("cashDraftV3") || "null");
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

async function updateVisitorCounter() {
  const el = document.getElementById("visitorCounter");

  const namespace = "kasa.uz.ua";
  const action = "view";
  const key = "cash-calculator-v3";

  const url = `https://counterapi.com/api/${namespace}/${action}/${key}?unique=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && typeof data.value !== "undefined") {
      el.textContent = data.value;
    } else {
      el.textContent = "—";
    }
  } catch (error) {
    el.textContent = "—";
  }
}

document.addEventListener("input", calculate);
searchHistory.addEventListener("input", renderHistory);

renderMoney();
renderExtra();
restoreDraft();
calculate();
renderHistory();
updateVisitorCounter();
