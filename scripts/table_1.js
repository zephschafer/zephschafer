var tabulate = function (data,columns) {
  var table = d3.select('#thetable').append('table').attr("id","table1")
	var thead = table.append('thead')
	var tbody = table.append('tbody')

	thead.append('tr')
	  .selectAll('th')
	    .data(columns)
	    .enter()
	  .append('th')
	    .text(function (d) { return d })

	var rows = tbody.selectAll('tr')
	    .data(data)
	    .enter()
	  .append('tr')

	var cells = rows.selectAll('td')
	    .data(function(row) {
	    	return columns.map(function (column) {
	    		return { column: column, value: row[column] }
	      })
      })
      .enter()
    .append('td')
      .text(function (d) { return d.value })

  return table;
}

var groupOptions = {
  'Issues':'data/table_1_issued.csv',
  'Reviews':'data/table_1_reviewed.csv',
}
var columns = ['structure_type', 'work_type', 'function_type', 'total_sqft_amt', 'description', 'stories_amt', 'new_units_amt', 'value']

d3.select("#selectButton2")
    .selectAll("button2")
   	.data(Object.keys(groupOptions))
    .enter()
	.append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return groupOptions[d]; })


d3.csv('data/table_1_reviewed.csv',function (data) {
  tabulate(data,columns)
})

d3.select("#selectButton2").on("change", function(d) {
    var oldTable = document.getElementById("table1");
    oldTable.remove()
    var selectedOption = d3.select(this).property("value")
    d3.csv(selectedOption, function (data) {
      tabulate(data,columns)
    })
})
