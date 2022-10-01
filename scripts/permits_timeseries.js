import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
import define from "https://api.observablehq.com/@zschafer/pdx_permits_timeseries.js?v=3";
// import define from "https://api.observablehq.com/d/54fe4c10d7a401f1.js?v=3&api_key=164bdc56233c261e112b874f37d745840019b4c0"
new Runtime().module(define, name => {
  if (name === "display") return new Inspector(document.querySelector("#graph"));
  if (name === "viewof cells") return new Inspector(document.querySelector("#selector"));
  return ["Tooltip"].includes(name);
});
