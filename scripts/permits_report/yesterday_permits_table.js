import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
import define from "https://api.observablehq.com/d/f22c76965ea910f4.js?v=3";
new Runtime().module(define, name => {
  if (name === "table") return new Inspector(document.querySelector("#yesterday_permits"));
});
