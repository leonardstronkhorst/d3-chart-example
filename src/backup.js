import * as d3 from "d3";

/*******************************************
 * Get data
 *******************************************/
//let data = require("./data/data-survey-metrics.json");
const data = {
  Id: "9229a650-87f3-402c-ae77-54338afd1d54",
  PublishedCount: 1,
  TotalCount: 2,
  counts: [
    { name: "BlockExecutionCount", type: "All", Kill: 0, Warn: 0, Ok: 2 },
    { name: "BlockExecutionCount", type: "Published", Kill: 0, Warn: 0, Ok: 1 },
    {
      name: "ExpressionInstructionCount",
      type: "All",
      Kill: 0,
      Warn: 0,
      Ok: 2
    },
    {
      name: "ExpressionInstructionCount",
      type: "Published",
      Kill: 0,
      Warn: 0,
      Ok: 1
    },
    { name: "InterviewStateSize", type: "All", Kill: 1, Warn: 1, Ok: 0 },
    { name: "InterviewStateSize", type: "Published", Kill: 1, Warn: 0, Ok: 0 }
  ]
};
const keys = ["Kill", "Warn", "Ok"];

/*******************************************
 * Create svg
 *******************************************/
const svg = d3
  .select("#app-stacked-horizontal-bar")
  .append("svg")
  .attr("width", 960)
  .attr("height", 500);
/*******************************************
 * Constants
 *******************************************/
const margin = { top: 40, right: 100, bottom: 60, left: 60 },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom;

const green = "#8bc34a";
const yellow = "#ffee58";
const red = "#ea592e";

const g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/*******************************************
 * Scales
 *******************************************/
const x00 = d3
  .scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.1)
  .domain(data.counts.map(d => d.name));

const x1 = d3
  .scaleBand()
  .padding(0.05)
  .domain(data.counts.map(d => d.type))
  .rangeRound([0, x00.bandwidth()])
  .padding(0.2);

const y = d3.scaleLinear().rangeRound([height, 0]);

/*******************************************
 * Stack
 *******************************************/
const stack = d3.stack().offset(d3.stackOffsetExpand);
const stackData = stack.keys(keys)(data.counts);

// console.log("stackData", stackData);
// console.log("keys", keys);

const serie = g
  .selectAll(".serie")
  .data(stackData)
  .enter()
  .append("g")
  .attr("class", "serie")
  .attr("fill", d => {
    switch (d.key) {
      case "Kill":
        return red;
      case "Warn":
        return yellow;
      default:
        return green;
    }
  });

serie
  .selectAll("rect")
  .data(d => d)
  .enter()
  .append("rect")
  .attr("class", "serie-rect")
  .attr("transform", d => "translate(" + x00(d.data.name) + ",0)")
  .attr("x", d => x1(d.data.type))
  .attr("y", d => y(d[1]))
  .attr("height", d => y(d[0]) - y(d[1]))
  .attr("width", x1.bandwidth());
//.on("click", (d, i) => console.log("serie-rect click d", i, d));

g.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x00));

g.append("g")
  .attr("class", "axis")
  .call(d3.axisLeft(y).ticks(null, "s"))
  .append("text")
  .attr("x", 2)
  .attr("y", y(y.ticks().pop()) + 0.5)
  .attr("dy", "0.32em")
  .attr("fill", "#000")
  .attr("font-weight", "bold")
  .attr("text-anchor", "start");
//  .text("Population");

// var legend = serie
//   .append("g")
//   .attr("class", "legend")
//   .attr("transform", d => {
//     var d = d[d.length - 1];
//     return (
//       "translate(" +
//       (x00(d.data.State) + x1(d.data.Year) + x1.bandwidth()) +
//       "," +
//       (y(d[0]) + y(d[1])) / 2 +
//       ")"
//     );
//   });

// legend
//   .append("line")
//   .attr("x1", -6)
//   .attr("x2", 6)
//   .attr("stroke", "#000");

// legend
//   .append("text")
//   .attr("x", 9)
//   .attr("dy", "0.35em")
//   .attr("fill", "#000")
//   .style("font", "10px sans-serif")
//   .text(d => d.key);

/*******************************************
 * Axis
 *******************************************/
