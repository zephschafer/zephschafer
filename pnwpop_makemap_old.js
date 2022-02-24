d3.csv("locations.csv", function(error, cities) {
  var dataset = cities;

  var width = window.innerWidth;
  var height = window.innerHeight;

  var svg = d3.select('#mapbox').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr("id","map")
    .style("opacity","0.99");


  var tip = d3.tip()
    .attr('class', 'tooltip')
    .direction('s')
    .offset([30, 10])
    .html(d => d);


  var projection = d3.geoOrthographic()
    .scale((height - 10) / .2)
    .translate([width / 2, height / 2])
    .rotate([124, -47, 0])
    .precision(0.1);

  var path = d3.geoPath()
    .projection(projection)
    .pointRadius(2);

  d3.geoZoom()
    .projection(projection)
    .onMove(render)
    (svg.node());

  var g = svg.append("g").attr("id","g").style("opacity","0.99");;




  Promise.all([
    fetch('basemap1.json').then(r => r.json()),
    fetch('basemap2.json').then(r => r.json()),
    // fetch('static/data/newtest/newcities.json').then(r => r.json())
  ]).then(([region, world, cities]) => {
    svg.append('path').attr('class', 'geo sphere')
      .datum({ type: 'Sphere' })
      .style("position","relative");

    svg.append('path').attr('class', 'geo graticule')
      .datum(d3.geoGraticule10())
      .style("position","relative");

    svg.append('path').attr('class', 'geo land')
      .datum(topojson.feature(world, world.objects.land).features[0])
      .style("position","relative");

    svg.append('path').attr('class', 'geo region')
      .data(region.features)
      .style("position","relative")
      .style("stroke","#8DE4AF")
      .style("stroke-width","0.1px")
      .style("fill","#08396B")
      .style("position","relative")
      .style("z-index","10")
      .style("opacity","1");

    render();
  });

  //




  function plotc(data) {

    var tip = d3.select("#tooltip")

      function city_radius(d) {
        return d.value*projection.scale()/(10**8) + (7.5*projection.scale()/20000)
      }

      var mouseover = function(d) {
        // console.log(d3.event.pageX)
        d3.select(this).attr("r", d => city_radius(d) + 4);
      };

      var mousemove = function(d) {
        // console.log(d3.event.pageX)
      };

      var mouseleave = function(d) {
        d3.select(this).attr("r", d => city_radius(d));
        tip.style("opacity",0);
        d3.selectAll("#tooltip_text").remove();
      };


      function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      }

      var click = function(d) {
        d3.select(this).attr("r", d => city_radius(d) + 3);
        var xPosition_tip = parseFloat(d3.select(this).attr("cx")-10);
        var yPosition_tip = parseFloat(d3.select(this).attr("cy") - 175);
        d3.select("#tooltip")
          .style("left", xPosition_tip + "px")
          .style("top", yPosition_tip + "px")
          .style("opacity",0.8)
          .select("#value")
          .text(d.name.concat(" (Population: ", formatNumber(d.value), ")"));
        d3.select("#tooltip").classed("hidden", false);
      };


    circles = svg.selectAll("circle")
                .data(data);

    circles
      .enter()
      .append("circle")
      .attr("id","citycircles")
      .attr("cx", d => projection([+d.lon, +d.lat])[0])
      .attr("cy", d => projection([+d.lon, +d.lat])[1])
      .attr("r", d => city_radius(d))
      .style("opacity",".92")
      .style("z-index","100")
      .style("fill", "#e74998")
      .style("position","relative")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click",click);;

  }


  var formatDateIntoYear = d3.timeFormat("%Y");
  var formatDate = d3.timeFormat("%b %Y");
  var parseDate = d3.timeParse("%Y-%m-%d");
  var parse2 = d3.timeParse("%b %Y")

  var startDate = new Date("1800-01-01"),
      endDate = new Date("2010-12-31");

  var margin = {top:0, right:35, bottom:0, left:35},
      width = '90%'
      height = 100 - margin.top - margin.bottom;


  ////////// slider //////////

  var svgSlider = d3.select("#slider")
      .append("svg")
      // .attr("id","#slider")
      .attr("width", width)
      .attr("height", height);

  var calcWidth = svgSlider.node().getBoundingClientRect().width - margin.left - margin.right ;

  var x = d3.scaleTime()
      .domain([startDate, endDate])
      // .ticks(d3.timeMinute.every(15))
      .range([0, calcWidth])
      .clamp(true);

  var slider = svgSlider.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

  slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { slider.interrupt(); })
          .on("start drag", function() { update(x.invert(d3.event.x)) }));

  slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
      .data(x.ticks(4))
      .enter()
      .append("text")
      .attr("x", x)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .text(function(d) { return formatDateIntoYear(d); });

  var handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 12);

  var label = slider.append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .text(formatDate(startDate))
      .attr("transform", "translate(0," + (-25) + ")")


  function update(h) {

    svg.selectAll("circle").remove();
    handle.attr("cx", x(h));
    label
    .attr("x", x(h))
    .attr("id","circleLabelValue")
    .text(formatDate(h));

    var filteredCities = dataset.filter(function(d) {
      if((parseDate(d.value_start) < h)
          &&  (h < parseDate(d.value_end))) {
        return d;
      };
    });
    plotc(filteredCities);

  }

  update((endDate))

  function render() {
    svg.selectAll("circle").remove();
    svg.selectAll('path.geo')
      .attr('d', path)
      .style("position","relative");
    var selectedDate = parse2(d3.select("#circleLabelValue").text())
      var filteredCities = dataset.filter(function(d) {
        if((parseDate(d.value_start) < selectedDate)
            &&  (selectedDate < parseDate(d.value_end))) {
          return d;
        };
      });
      // console.log("render");
      // console.log(selectedDate);
      plotc(filteredCities);
  }
});
