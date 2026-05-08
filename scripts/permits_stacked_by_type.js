import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const DATA_OPTIONS = {
  "Function Type":  "../data/rolling_permits_by_function_type.csv",
  "Structure Type": "../data/rolling_permits_by_structure_type.csv",
  "Work Type":      "../data/rolling_permits_by_work_type.csv",
};

const selectorEl = document.querySelector("#permits-stacked-by-type-viewof-selector");
const keyEl      = document.querySelector("#permits-stacked-by-type-key");
const chartEl    = document.querySelector("#permits-stacked-by-type-chart");

// Build dropdown
const select = document.createElement("select");
select.style.cssText = "font-family:inherit;font-size:0.95rem;background:var(--background);border:1px solid var(--border);color:var(--text);padding:0.2rem 0.5rem;border-radius:3px;";
Object.keys(DATA_OPTIONS).forEach(opt => {
  const o = document.createElement("option");
  o.value = opt;
  o.textContent = opt;
  select.appendChild(o);
});
selectorEl.appendChild(select);

function stackedAreaChart(data, width) {
  const height      = 500;
  const marginTop   = 20;
  const marginRight = 30;
  const marginBot   = 30;
  const marginLeft  = 60;

  // Ensure dates are Date objects and strip future rows
  const today = new Date();
  data.forEach(d => { if (!(d.date instanceof Date)) d.date = new Date(d.date); });
  data = data.filter(d => d.date <= today);

  const zDomain  = [...new Set(data.map(d => d.type))].sort();
  const allDates = [...new Set(data.map(d => d.date.getTime()))].sort().map(t => new Date(t));

  // Pivot: one record per date with each type as a key
  const byDate = new Map(allDates.map(d => [d.getTime(), { date: d }]));
  data.forEach(d => {
    const rec = byDate.get(d.date.getTime());
    if (rec) rec[d.type] = d.value;
  });
  const pivoted = allDates.map(d => byDate.get(d.getTime()));

  const series = d3.stack()
    .keys(zDomain)
    .value((d, k) => d[k] ?? 0)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)
    (pivoted);

  const xScale = d3.scaleUtc()
    .domain(d3.extent(allDates))
    .range([marginLeft, width - marginRight]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
    .nice()
    .range([height - marginBot, marginTop]);

  const color = d3.scaleOrdinal(zDomain, d3.schemeTableau10);

  const area = d3.area()
    .x(d => xScale(d.data.date))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]));

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", "100%")
    .attr("height", height);

  // Y axis
  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(yScale).ticks(height / 50).tickFormat(d3.format(",.0s")))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
      .attr("x2", width - marginLeft - marginRight)
      .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
      .attr("x", -marginLeft)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("font-size", "12px")
      .text("↑ Permitted Square Footage"));

  // Stacked areas
  svg.append("g")
    .selectAll("path")
    .data(series)
    .join("path")
      .attr("fill",  d => color(d.key))
      .attr("d",     area)
    .append("title")
      .text(d => d.key);

  // X axis
  svg.append("g")
    .attr("transform", `translate(0,${height - marginBot})`)
    .call(d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0));

  return { node: svg.node(), color, zDomain };
}

function renderLegend(color, zDomain) {
  keyEl.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:4px 16px;font-size:0.85rem;";
  zDomain.forEach(key => {
    const item   = document.createElement("span");
    item.style.cssText = "display:inline-flex;align-items:center;gap:4px;";
    const swatch = document.createElement("span");
    swatch.style.cssText = `width:12px;height:12px;border-radius:2px;background:${color(key)};display:inline-block;flex-shrink:0;`;
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(key));
    wrap.appendChild(item);
  });
  keyEl.appendChild(wrap);
}

// Fallback data when URLs are unreachable (monthly data, 2020–2025)
function makeDummyStacked(types, bases) {
  const rows = [];
  const t0 = Date.UTC(2020, 0, 1);
  for (let i = 0; i < 61; i++) {
    const t    = i / 12;
    const date = new Date(t0 + i * 30.44 * 864e5);
    types.forEach((type, j) => {
      rows.push({ date, type, value: Math.max(0, bases[j] * (1 + Math.sin(t * 2 * Math.PI + j) * 0.25 + t * 0.04)) });
    });
  }
  return rows;
}

const DUMMY_STACKED = {
  "Function Type":  makeDummyStacked(["Single Family", "Multi-Family", "Commercial", "Industrial", "Other"],   [8000, 12000, 6000, 3000, 1500]),
  "Structure Type": makeDummyStacked(["Wood Frame", "Masonry", "Concrete", "Steel", "Other"],                  [13000, 4000, 3500, 5000, 2000]),
  "Work Type":      makeDummyStacked(["New Construction", "Addition", "Alteration", "Repair", "Other"],        [10000, 8000, 5000, 3000, 1500]),
};

async function loadAndRender(option) {
  const url  = DATA_OPTIONS[option];
  const data = await d3.csv(url, d3.autoType).catch(() => DUMMY_STACKED[option]);
  const width = chartEl.getBoundingClientRect().width || 800;
  const { node, color, zDomain } = stackedAreaChart(data, width);
  chartEl.innerHTML = "";
  chartEl.appendChild(node);
  renderLegend(color, zDomain);
}

loadAndRender(select.value);
select.addEventListener("change", () => loadAndRender(select.value));
