import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const DATA_URL = "../data/this_week_permits.csv";

const container = document.querySelector("#yesterday_permits");

const formatSqft  = d3.format(",.0f");
const formatMoney = d3.format("$,.0f");

const FORMATTED_COLS = {
  "New_Square_Feet":    v => formatSqft(+v),
  "Construction_Value": v => formatMoney(+v),
  "Buildings_Stories":  v => (+v || 0).toFixed(0),
};

// Search input (outside the table container so it isn't cleared on re-render)
const searchInput = document.createElement("input");
searchInput.type        = "text";
searchInput.placeholder = "Search…";
searchInput.style.cssText = [
  "width:100%",
  "margin-bottom:0.5rem",
  "padding:0.25rem 0.5rem",
  "font-family:inherit",
  "font-size:0.9rem",
  "border:1px solid var(--border)",
  "border-radius:3px",
  "background:var(--background)",
  "color:var(--text)",
  "box-sizing:border-box",
].join(";");

const tableWrap = document.createElement("div");
tableWrap.style.overflowX = "auto";

container.appendChild(searchInput);
container.appendChild(tableWrap);

function renderTable(data) {
  if (!data.length) {
    tableWrap.innerHTML = "<p style='color:var(--text-muted);'>No results.</p>";
    return;
  }
  const cols  = Object.keys(data[0]);
  const table = document.createElement("table");

  const thead = table.createTHead();
  const hrow  = thead.insertRow();
  cols.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    hrow.appendChild(th);
  });

  const tbody = table.createTBody();
  data.forEach(row => {
    const tr = tbody.insertRow();
    cols.forEach(col => {
      const td  = tr.insertCell();
      const raw = row[col];
      const fmt = FORMATTED_COLS[col];
      td.textContent = (fmt && raw != null && raw !== "") ? fmt(raw) : (raw ?? "");
      if (col === "Description") {
        td.style.cssText = "max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
      }
    });
  });

  tableWrap.innerHTML = "";
  tableWrap.appendChild(table);
}

const DUMMY_PERMITS = [
  { "Issued Date": "2025-04-28", "Address": "412 NW Couch St",        "Description": "New single family dwelling",     "Permit Type": "New Construction", "Work Type": "1-2 Family Dwelling", "New Square Feet": 2200,  "Construction Value": 380000  },
  { "Issued Date": "2025-04-28", "Address": "1834 SE Hawthorne Blvd", "Description": "New 24-unit apartment building", "Permit Type": "New Construction", "Work Type": "Apartment",          "New Square Feet": 18400, "Construction Value": 3200000 },
  { "Issued Date": "2025-04-27", "Address": "723 N Alberta St",        "Description": "Commercial tenant improvement", "Permit Type": "Alteration",       "Work Type": "Commercial",         "New Square Feet": 0,     "Construction Value": 145000  },
  { "Issued Date": "2025-04-27", "Address": "3309 SE Division St",    "Description": "Accessory dwelling unit",        "Permit Type": "New Construction", "Work Type": "ADU",                "New Square Feet": 640,   "Construction Value": 120000  },
  { "Issued Date": "2025-04-26", "Address": "2100 NW Lovejoy St",     "Description": "Mixed-use building, 40 units",  "Permit Type": "New Construction", "Work Type": "Apartment",          "New Square Feet": 36200, "Construction Value": 7100000 },
  { "Issued Date": "2025-04-26", "Address": "845 SW Broadway",        "Description": "Office tenant improvement",     "Permit Type": "Alteration",       "Work Type": "Commercial",         "New Square Feet": 0,     "Construction Value": 88000   },
  { "Issued Date": "2025-04-25", "Address": "5618 NE Sandy Blvd",     "Description": "New single family dwelling",    "Permit Type": "New Construction", "Work Type": "1-2 Family Dwelling", "New Square Feet": 1950, "Construction Value": 310000  },
  { "Issued Date": "2025-04-25", "Address": "201 SW Morrison St",     "Description": "Structural repairs",            "Permit Type": "Alteration",       "Work Type": "Commercial",         "New Square Feet": 0,     "Construction Value": 62000   },
];

d3.csv(DATA_URL).catch(() => DUMMY_PERMITS).then(allData => {
  renderTable(allData);

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { renderTable(allData); return; }
    renderTable(allData.filter(row =>
      Object.values(row).some(v => String(v ?? "").toLowerCase().includes(q))
    ));
  });
});
