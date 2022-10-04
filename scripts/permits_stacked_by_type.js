import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
import define from "https://api.observablehq.com/d/permits-by-type-public.js?v=3";
new Runtime().module(define, name => {
  if (name === "viewof selector") return new Inspector(document.querySelector("#permits-stacked-by-type-viewof-selector"));
	if (name === "key") return new Inspector(document.querySelector("#permits-stacked-by-type-key"));
  if (name === "chart") return new Inspector(document.querySelector("#permits-stacked-by-type-chart"));
  return ["dataPath","data"].includes(name);
});
