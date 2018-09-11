import * as d3 from "d3";

/*******************************************
 * Get data
 *******************************************/
const originalData = require("./data/data-survey-metrics.json");
let dataObject = [];
originalData.Counts.reverse().forEach((item, i) => {
  dataObject.push({
    name: item.MetricName,
    type: "All",
    Kill: item.All.Kill,
    Warn: item.All.Warn,
    Ok: originalData.TotalCount - item.All.Kill - item.All.Warn
  });
  dataObject.push({
    name: item.MetricName,
    type: "Published",
    Kill: item.Published.Kill,
    Warn: item.Published.Warn,
    Ok: originalData.PublishedCount - item.Published.Kill - item.Published.Warn
  });
});
const keys = ["Kill", "Warn", "Ok"];
//console.log(dataObject);
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
const yScaleName = d3
  .scaleBand()
  .rangeRound([height, 0])
  .paddingInner(0.1)
  .domain(dataObject.map(d => d.name));

const yScaleType = d3
  .scaleBand()
  .padding(0.05)
  .domain(dataObject.map(d => d.type))
  .rangeRound([0, yScaleName.bandwidth()])
  .padding(0.45);

const x = d3.scaleLinear().rangeRound([0, width]);

/*******************************************
 * Stack
 *******************************************/
const stack = d3.stack().offset(d3.stackOffsetExpand);
const stackData = stack.keys(keys)(dataObject);

const concatArray = Array(dataObject.length)
  .fill(0)
  .concat(Array(dataObject.length).fill(1))
  .concat(Array(dataObject.length).fill(2));

/*******************************************
 * Draw Graph
 *******************************************/
const serie = g
  .selectAll(".serie")
  .data(stackData)
  .enter()
  .append("g")
  .attr("class", d => {
    return `serie ${d.key.toLowerCase()}`;
  })
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
  .data(d => d.filter(v => v[1] - v[0] > 0))
  .enter()
  .append("rect")
  .attr("d", d => d)
  .attr("class", d => {
    return `serie-rect ${d.data.type.toLowerCase()} ${d.data.name.toLowerCase()}`;
  })
  .attr("transform", d => `translate(80,0)`)
  .attr("x", d => x(d[0]))
  .attr("y", d => {
    return yScaleName(d.data.name) + yScaleType(d.data.type);
  })
  .attr("height", d => yScaleType.bandwidth())
  .attr("width", 0)
  .transition()
  .duration(750)
  .delay(function(d, i) {
    const index = concatArray.shift();
    return index * 750 - 20;
  }) //a different delay for each bar
  .ease(d3.easeLinear)
  .attr("width", d => {
    return x(d[1]) - x(d[0]);
  });

/*******************************************
 * Axis
 *******************************************/
g.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(${margin.left + 20},0)`)
  .call(d3.axisLeft(yScaleName));

g.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(${margin.left + 20},${height})`)
  .call(d3.axisBottom(x).ticks(null, "s"))
  .append("text")
  .attr("x", x(x.ticks().pop()) + 0.5)
  .attr("y", 2)
  .attr("dx", "0.32em")
  .attr("fill", "#000")
  .attr("font-weight", "bold")
  .attr("text-anchor", "start");
//  .text("Population");

/*******************************************
 * Legend __All__Published__
 *******************************************/
g.append("g")
  .selectAll("text.type")
  .data(stackData[0])
  .enter()
  .append("text")
  .attr("class", "type")
  .style("fill", "#02a79c")
  .style("font-size", "14px")
  .style("text-anchor", "end")
  .attr("fill-opacity", 0)
  .attr("x", width + margin.left)
  .attr("y", d => {
    return yScaleName(d.data.name) + yScaleType(d.data.type) + margin.top;
  })
  .text(d => d.data.type)
  .transition()
  .duration(2250)
  .delay((d, i) => 0)
  .ease(d3.easeLinear)
  .attr("fill-opacity", 1);
//.attr("x", width + margin.left);

g.append("g")
  .selectAll("text.value")
  .data(
    stackData
      .reduce((acc, val) => acc.concat(val), []) // flatten array one depth
      .filter(v => v[1] - v[0] > 0)
  )
  .enter()
  .append("text")
  .attr("x", d => {
    return (x(d[1]) + x(d[0]) + margin.right) / 2;
  })
  .attr("y", d => {
    return yScaleName(d.data.name) + yScaleType(d.data.type) - 5;
  })
  .text(d => {
    const value = d[1] - d[0];
    const total =
      d.data.type === "Published"
        ? originalData.PublishedCount
        : originalData.TotalCount;
    return `${value * total} (%${value * 100})`;
  });
