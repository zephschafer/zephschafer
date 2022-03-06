// set the dimensions and margins of the graph
var margin = {top: 10, right: 20, bottom: 10, left: 150},
    width = 500,
    graph1Height = 200;

var button1Options = {
  'Function':'data/graph_1_function_type.csv',
  'Structure':'data/graph_1_structure_type.csv',
  'Work':'data/graph_1_work_type.csv',
}

d3.select("#selectButton1")
  .selectAll('button1')
   	.data(Object.keys(button1Options))
    .enter()
	.append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return button1Options[d]; })


var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", graph1Height)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + (margin.top + margin.bottom) + ")");

var duration = 800;


var drawGraph1 = function(data) {
  var valuesArray = []
  for (let i = 0; i < Object.keys(data).length - 1; i++) {
      valuesArray.push(+data[i]['value'])
  }
  var maxValue = d3.max(valuesArray);
  var x = d3.scaleLinear()
    .domain([0, maxValue])
    .range([ 0, width - margin.left - margin.right]);

  var y = d3.scaleBand()
    .range([ 0, graph1Height - margin.top - margin.right])
    .domain(data.map(function(d) { return d.type; }))
    .padding(.1);

  var bars = svg.selectAll("rect")
    .data(data);

  var yaxis = d3.axisLeft(y);

  svg.append('g')
      .attr('class', 'y axis');

  bars.enter()
    .append("rect")
  .merge(bars)
    .attr("x", x(0) )
    .transition()
    .duration(duration)
    .attr("y", function(d) { return y(d.type); })
    .attr("width", function(d) { return x(d.value); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#69b3a2");

  bars.exit().remove();

  svg.select('.y.axis')
      .transition()
      .duration(duration)
      .call(yaxis);


}

d3.csv("data/graph_1_function_type.csv", function(data) {
  drawGraph1(data)
})

d3.select("#selectButton1").on("change", function(d) {
    var selectedOption = d3.select(this).property("value")
    d3.csv(selectedOption, function (data) {
      drawGraph1(data)
    })
})
