// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 600;
    graph4Height = 200;

// append the chart object to the body of the page
var chart3 = d3.select("#chart3")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", graph4Height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("data/graph_1_avg_days_to_issue.csv", function(data) {

    const parseTime = d3.timeParse("%Y-%m-%d");

    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return parseTime(d.date); }))
      .range([ 0, width ]);

    chart3.append("g")
      .attr("transform", "translate(0," + graph4Height + ")")
      .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.value; })])
      .range([ graph4Height, 0 ]);
    chart3.append("g")
      .call(d3.axisLeft(y));

    chart3.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(parseTime(d.date)) })
        .y(function(d) { return y(d.value) })
        )

})
