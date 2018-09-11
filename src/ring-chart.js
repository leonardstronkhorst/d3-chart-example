import * as d3 from "d3";

// Global constants
const width = 300;
const height = 350;
const svgWidth = 500;
const margin = { top: 20, right: 20, bottom: 30, left: 80 };

/*******************************************
 * set up SVG
 *******************************************/
const svg = d3
  .select("#app-ring")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", height + margin.bottom)
  .style("overflow", "visible")
  .attr("class", "shadow");

/*******************************************
 * Data
 *******************************************/

const monitorData = require("./data/data-ring-chart.json");

const dataset = [
  // order is importanr for color scale
  {
    name: "Successful interviews (earlier)",
    percent:
      ((monitorData.Successful - monitorData.SuccessfulToday) * 100) /
      monitorData.Target
  },
  {
    name: "Successful interviews (24h)",
    percent: (monitorData.SuccessfulToday * 100) / monitorData.Target
  },
  {
    name: "", // should be empty grey one
    percent:
      ((monitorData.Target - monitorData.Successful) * 100) / monitorData.Target
  }
];

/*******************************************
 * Pie
 *******************************************/
const pie = d3
  .pie()
  .value(d => d.percent)
  .sort(null)
  .padAngle(0.02);

const outerRadius = width / 2;
const innerRadius = 100;

/*******************************************
 * Color schema
 *******************************************/
const color = ["#8EC14D", "#EA592E", "#E1E1E1"];

/*******************************************
 * Draw Ring chart
 *******************************************/
const g = svg
  .append("g")
  .attr("transform", `translate(${width / 2},${height / 2})`);

const arcGenerator = d3
  .arc()
  .outerRadius(outerRadius)
  .innerRadius((d, i) => {
    if (d.data.name.length > 0) {
      return innerRadius - 15;
    }
    return innerRadius;
  });

const path = g
  .selectAll("path")
  .data(pie(dataset))
  .enter()
  .append("path")
  .attr("d", arcGenerator)
  .attr("fill", (d, i) => color[i]);

path
  .transition()
  .duration(1000)
  .attrTween("d", d => {
    var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
    return t => {
      return arcGenerator(interpolate(t));
    };
  });

/*******************************************
 * Show legend
 *******************************************/
var legendHolder = svg
  .append("g")
  // translate the holder to the bottom side of the graph
  .attr("transform", `translate(0,${height + margin.top})`);

var legend = legendHolder
  .selectAll(".legend")
  .data(dataset.filter((d, i) => d.name))
  .enter()
  .append("g")
  .attr("class", "legend")
  .attr("transform", (d, i) => {
    return `translate(${(i + 1) * 170},0)`;
  });
legend
  .append("rect")
  .attr("x", 2)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", (d, i) => color[i]);
legend
  .append("text")
  .attr("x", 0)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .text(d => d.name);
