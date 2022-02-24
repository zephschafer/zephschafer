var dataset = [];
for (var i = 0; i < 200; i++) {
    var newNumber = Math.random() * 50;
    dataset.push(newNumber);
}


var svg = d3
  .select("#bubbles");

  function circleTransition() {

      var timeCircle = svg.selectAll("circle")
          .data(dataset)
          .enter()
          .append("circle")
          .attr("cx",300)
          .attr("cy",500)
          .attr("r", d=>d)
          .attr("z-index", '-1');

      repeat();
      function repeat() {
        timeCircle
          .transition()
          .duration(2000)
          .attr("cx",d=>(Math.random()-.2)*(d*50))
          .attr("cy", d => Math.random() * (d-4) * 25)
          .attr("r", d => Math.random() * 15)
          .attr("fill", d => "rgb(" + (Math.random()) + ", " + Math.pow(d,1.2) + "," + (d+70)+")")
          .attr("stroke",d => "rgb(" + (d^2) + ", " + (d^2) + "," + (100) +")")
          .attr("stroke-width", d => d/10)
          .transition()
          .duration(20000)
          .attr("cx",d=>Math.random()*d*50)
          .attr("cy", Math.random() * 500)
          .attr("r", d=> d/4 * Math.random() * 5)
          .attr("fill", d => "rgb(" + (d^20) + ", " + (Math.random() * 50) + "," + (d+70)+")")
          .attr("stroke",d => "rgb(" + (d^2) + ", " + (d^2) + "," + (100) +")")
          .attr("stroke-width", d => d/10)
          .transition()
          .duration(30000)
          .attr("cx",d=>Math.random()*d*200)
          .attr("cy", d=>Math.random() * d * 100)
          .attr("r", d=>Math.random() * d * 10)
          .attr("fill", d => "rgb(" + (d^20) + ", " + Math.pow(d,1.2) + "," + (d+70)+")")
          .attr("stroke",d => "rgb(" + (d^2) + ", " + (d^2) + "," + (100) +")")
          .attr("stroke-width", d => d/10)
          .transition()
          .duration(30000)
          .attr("cx",800)
          .transition()
          .duration(30000)
          .attr("cx",d=>Math.random()*d*200)
          .attr("cy", d=>Math.random() * d * 100)
          .attr("r", d=>Math.random() * d * 10)
          .attr("fill", d => "rgb(" + (d^20) + ", " + Math.pow(d,1.2) + "," + (d+70)+")")
          .attr("stroke",d => "rgb(" + (d^2) + ", " + (d^2) + "," + (100) +")")
          .attr("stroke-width", d => d/10)
          .duration(30000)
          .attr("cx",d=>Math.random()*d*200)
          .attr("cy", d=>Math.random() * d * 100)
          .attr("r", d=>Math.random() * d * 10)
          .attr("fill", d => "rgb(" + (d^20) + ", " + Math.pow(d,1.2) + "," + (d+70)+")")
          .attr("stroke",d => "rgb(" + (d^2) + ", " + (d^2) + "," + (100) +")")
          .attr("stroke-width", d => d/10)
          .transition()
          .duration(20000)
          .attr("cx",d=>Math.random()*d*50)
          .attr("cy", Math.random() * 500)
          .attr("r", d=> d/4 * Math.random() * 5)
          .attr("fill", d => "rgb(" + (d^20) + ", " + (Math.random() * 50) + "," + (d+70)+")")
          .attr("stroke",d => "rgb(" + (d^2) + ", " + (d^2) + "," + (100) +")")
          .attr("stroke-width", d => d/10)
          .transition()
          .duration(30000)
          .attr("cx",d=>Math.random()*d*200)
          .attr("cy", d=>Math.random() * d * 100)
          .attr("r", d=>Math.random() * d * 10)
          .attr("fill", d => "rgb(" + (d^20) + ", " + Math.pow(d,1.2) + "," + (d+70)+")")
          .attr("stroke",d => "rgb(" + (d^2) + ", " + (d^2) + "," + (100) +")")
          .attr("stroke-width", d => d/10)
          .transition()
          .duration(30000)
          .attr("cx",800)
          .transition()
          .duration(30000)
          .attr("cx",d=>Math.random()*d*200)
          .attr("cy", d=>Math.random() * d * 100)
          .attr("r", d=>Math.random() * d * 10)
          .attr("fill", d => "rgb(" + (d^20) + ", " + Math.pow(d,1.2) + "," + (d+70)+")")
          .attr("stroke",d => "rgb(" + (d^2) + ", " + (d^2) + "," + (100) +")")
          .attr("stroke-width", d => d/10)
          .duration(30000)
          .attr("cx",d=>Math.random()*d*200)
          .attr("cy", d=>Math.random() * d * 100)
          .attr("r", d=>Math.random() * d * 10)
          .attr("fill", d => "rgb(" + (d^20) + ", " + Math.pow(d,1.2) + "," + (d+70)+")")
          .attr("stroke",d => "rgb(" + (d^2) + ", " + (d^2) + "," + (100) +")")
          .attr("stroke-width", d => d/10);
          // .on("end", repeat);
      };

  };

  circleTransition();
