import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const DATA_URL = "../data/rolling_permits_timeseries.csv";

const SERIES = [
  { id: "CP", label: "Count Permits",     color: "#506880", field: "count_permits_issued" },
  { id: "SF", label: "Total Square Feet", color: "#5f9194", field: "total_sqft_issued_amt" },
  { id: "NU", label: "New Units",         color: "#5f7194", field: "total_new_units_issued_amt" },
];

const margin = { top: 150, right: 120, bottom: 30, left: 80 };
const height = 400;

const parseDate  = d3.utcParse("%Y-%m-%d");
const formatDate = d3.timeFormat("%b %-d, '%y");
const formatNum  = d3.format(",.1f");

const selectorEl = document.querySelector("#selector");
const graphEl    = document.querySelector("#graph");

// Build checkboxes
SERIES.forEach(({ id, label, color }) => {
  const lbl = document.createElement("label");
  lbl.style.cssText = `display:inline-flex;align-items:center;gap:4px;margin-right:16px;color:${color};cursor:pointer;font-size:0.9rem;`;
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.id   = `ts-cb-${id}`;
  cb.checked = true;
  lbl.appendChild(cb);
  lbl.appendChild(document.createTextNode(label));
  selectorEl.appendChild(lbl);
});

function checked() {
  const out = {};
  SERIES.forEach(({ id }) => { out[id] = document.getElementById(`ts-cb-${id}`).checked; });
  return out;
}

// Fallback used when the data URL is unreachable (weekly data, 2020–2025)
const DUMMY_DATA = (() => {
  const rows = [];
  const t0 = Date.UTC(2020, 0, 1);
  for (let i = 0; i < 261; i++) {
    const t    = i / 52;
    const date = new Date(t0 + i * 7 * 864e5).toISOString().slice(0, 10);
    rows.push({
      date,
      count_permits_issued:       (7.5 + Math.sin(t * 2 * Math.PI) * 1.5 + t * 0.35).toFixed(2),
      total_sqft_issued_amt:      (16000 + Math.sin(t * 2 * Math.PI - 0.5) * 4000 + t * 700).toFixed(0),
      total_new_units_issued_amt: (9 + Math.sin(t * 2 * Math.PI + 0.4) * 2 + t * 0.45).toFixed(2),
    });
  }
  return rows;
})();

d3.csv(DATA_URL).catch(() => DUMMY_DATA).then(raw => {
  const today = new Date();
  const data = raw
    .map(d => ({
      date: parseDate(d.date),
      CP:   +d.count_permits_issued,
      SF:   +d.total_sqft_issued_amt,
      NU:   +d.total_new_units_issued_amt,
    }))
    .filter(d => d.date && d.date <= today);

  const width = graphEl.getBoundingClientRect().width || 800;

  const x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

  const yScales = {};
  const lineGens = {};
  SERIES.forEach(({ id }) => {
    yScales[id] = d3.scaleLinear()
      .domain([0, d3.max(data, d => isNaN(d[id]) ? undefined : d[id])])
      .range([height - margin.bottom, margin.top]);
    lineGens[id] = d3.line()
      .defined(d => !isNaN(d[id]))
      .x(d => x(d.date))
      .y(d => yScales[id](d[id]));
  });

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", "100%");

  // Lines
  const paths = {};
  SERIES.forEach(({ id, color }) => {
    paths[id] = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("stroke-miterlimit", 1)
      .attr("d", lineGens[id]);
  });

  // X axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .style("font-size", "12px")
    .call(d3.axisBottom(x).ticks(width / 100).tickSizeOuter(0));

  // Tooltip group (lives in the top margin area, y=0..150)
  const tt = svg.append("g")
    .attr("pointer-events", "none")
    .attr("display", "none")
    .attr("font-family", "sans-serif")
    .attr("font-size", "18")
    .attr("text-anchor", "middle");

  const ttLine = tt.append("line").attr("stroke", "#aaa").attr("stroke-width", 1);

  const ttDate = tt.append("text").attr("font-weight", "bold").attr("fill", "#333");
  const ttTexts   = {};
  const ttCircles = {};
  SERIES.forEach(({ id, color }) => {
    ttTexts[id]   = tt.append("text").attr("fill", color);
    ttCircles[id] = tt.append("circle").attr("r", 5).attr("fill", color)
      .attr("stroke", "white").attr("stroke-width", 1.5);
  });

  // Hover rects
  svg.append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .selectAll("rect")
    .data(d3.pairs(data))
    .join("rect")
      .attr("x",      ([a])    => x(a.date))
      .attr("y",      0)
      .attr("height", height)
      .attr("width",  ([a, b]) => x(b.date) - x(a.date))
      .on("mouseover", (event, [a]) => {
        const d    = a;
        const xPos = x(d.date);
        const c    = checked();
        const fh   = 30;

        tt.attr("display", null);
        ttLine.attr("x1", xPos).attr("x2", xPos).attr("y1", 0).attr("y2", height - margin.bottom);
        ttDate.attr("x", xPos).attr("y", fh).text(formatDate(d.date));

        SERIES.forEach(({ id, label }, i) => {
          const yPos = yScales[id](d[id]);
          ttCircles[id]
            .attr("cx", xPos).attr("cy", yPos)
            .attr("opacity", c[id] ? 0.75 : 0);
          ttTexts[id]
            .attr("x", xPos).attr("y", fh * (i + 2) + 10)
            .attr("opacity", c[id] ? 1 : 0)
            .text(`${label}: ${formatNum(d[id])}`);
        });
      })
      .on("mouseleave", () => tt.attr("display", "none"));

  graphEl.appendChild(svg.node());

  // Checkbox toggle
  SERIES.forEach(({ id }) => {
    document.getElementById(`ts-cb-${id}`).addEventListener("change", () => {
      const c = checked();
      SERIES.forEach(({ id }) => paths[id].attr("opacity", c[id] ? 1 : 0));
    });
  });
});
