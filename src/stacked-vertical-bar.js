import * as d3 from "d3";

/*******************************************
 * Get data
 *******************************************/
let csv = require("./data/data.csv");
/*******************************************
 * Create svg
 *******************************************/
const svg = d3
  .select("#app-stacked-bar")
  .append("svg")
  .attr("width", 960)
  .attr("height", 500);
/*******************************************
 * Constants
 *******************************************/
const margin = { top: 40, right: 100, bottom: 60, left: 60 },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom;

const g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const x0 = d3
  .scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.1);

const x1 = d3.scaleBand().padding(0.05);

const y = d3.scaleLinear().rangeRound([height, 0]);

const y1 = d3.scaleBand();

const z = d3
  .scaleOrdinal()
  .range([
    "#98abc5",
    "#8a89a6",
    "#7b6888",
    "#6b486b",
    "#a05d56",
    "#d0743c",
    "#ff8c00"
  ]);

const stack = d3.stack().offset(d3.stackOffsetExpand);

const csvData = d3.csvParse(csv, function(d) {
  d.Value = +d.Value; // convert to number
  return d;
});

x0.domain(
  csvData.map(function(d) {
    return d.State;
  })
);
x1.domain(
  csvData.map(function(d) {
    return d.Year;
  })
)
  .rangeRound([0, x0.bandwidth()])
  .padding(0.2);

z.domain(
  csvData.map(function(d) {
    return d.AgeGroup;
  })
);
const keys = z.domain();

var groupData = d3
  .nest()
  .key(function(d) {
    return d.Year + d.State;
  })
  .rollup(function(d, i) {
    var d2 = { Year: d[0].Year, State: d[0].State };
    d.forEach(function(d) {
      d2[d.AgeGroup] = d.Value;
    });
    //console.log("rollup d", d, d2);
    return d2;
  })
  .entries(csvData)
  .map(function(d) {
    return d.value;
  });

console.log("groupData", groupData);

const stackData = stack.keys(keys)(groupData);

console.log("stackData", stackData);
console.log("keys", keys);

const serie = g
  .selectAll(".serie")
  .data(stackData)
  .enter()
  .append("g")
  .attr("class", "serie")
  .attr("fill", function(d) {
    return z(d.key);
  });

serie
  .selectAll("rect")
  .data(function(d) {
    return d;
  })
  .enter()
  .append("rect")
  .attr("class", "serie-rect")
  .attr("transform", function(d) {
    return "translate(" + x0(d.data.State) + ",0)";
  })
  .attr("x", function(d) {
    return x1(d.data.Year);
  })
  .attr("y", function(d) {
    return y(d[1]);
  })
  .attr("height", function(d) {
    return y(d[0]) - y(d[1]);
  })
  .attr("width", x1.bandwidth())
  .on("click", function(d, i) {
    console.log("serie-rect click d", i, d);
  });

g.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x0));

g.append("g")
  .attr("class", "axis")
  .call(d3.axisLeft(y).ticks(null, "s"))
  .append("text")
  .attr("x", 2)
  .attr("y", y(y.ticks().pop()) + 0.5)
  .attr("dy", "0.32em")
  .attr("fill", "#000")
  .attr("font-weight", "bold")
  .attr("text-anchor", "start")
  .text("Population");

var legend = serie
  .append("g")
  .attr("class", "legend")
  .attr("transform", function(d) {
    var d = d[d.length - 1];
    return (
      "translate(" +
      (x0(d.data.State) + x1(d.data.Year) + x1.bandwidth()) +
      "," +
      (y(d[0]) + y(d[1])) / 2 +
      ")"
    );
  });

legend
  .append("line")
  .attr("x1", -6)
  .attr("x2", 6)
  .attr("stroke", "#000");

legend
  .append("text")
  .attr("x", 9)
  .attr("dy", "0.35em")
  .attr("fill", "#000")
  .style("font", "10px sans-serif")
  .text(function(d) {
    return d.key;
  });
