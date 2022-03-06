// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 600;
    graph2Height = 200;

var parseTime = d3.timeParse("%Y-%m-%d");

var chart = d3.select("#graph2")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", graph2Height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var line = chart.append("path")

var button3Options = {
  'Square Foot':'data/graph_2_days_to_issue_sqft.csv',
  'New Unit':'data/graph_2_days_to_issue_new_units.csv',
  'Permit':'data/graph_2_avg_days_to_issue.csv',
}

d3.select("#selectButton3")
  .selectAll('button3')
   	.data(Object.keys(button3Options))
    .enter()
	.append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return button3Options[d]; })

const drawGraph2 = function(data) {
  var xAxis = chart.append("g")
      .attr("transform", "translate(0," + graph2Height + ")")
      .attr('class','xAxis2');
  var yAxis = chart.append("g").attr('class','yAxis2');
  var xScale = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return parseTime(d.date); }))
    .range([ 0, width ]);
  var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.value; })])
    .range([ graph2Height, 0 ]);

  line.datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .transition()
    .duration(duration)
    .attr("d", d3.line()
      .x(function(d) { return xScale(parseTime(d.date)) })
      .y(function(d) { return yScale(+d.value) })
    )


  chart.select('.yAxis2')
      .transition()
      .duration(duration)
      .call(d3.axisLeft(yScale));
  chart.select('.xAxis2')
      .transition()
      .duration(duration)
      .call(d3.axisBottom(xScale));

}

d3.csv("data/graph_1_avg_days_to_issue.csv", function(data) {
  drawGraph2(data)
})

d3.select("#selectButton3").on("change", function(d) {
    var selectedOption = d3.select(this).property("value")
    d3.csv(selectedOption, function (data) {
      drawGraph2(data)
    })
})
