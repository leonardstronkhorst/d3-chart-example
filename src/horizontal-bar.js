import * as d3 from "d3";

// set up SVG
const width = 960;
const height = 500;
const margin = { top: 20, right: 20, bottom: 30, left: 80 };

const svg = d3
  .select("#app-horizontal")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("overflow", "visible");

const g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set up animation transition
const t = d3.transition().duration(1500);

/*******************************************
 * Get data
 *******************************************/
let data = require("./data/data.json");

const getTicksCount = maxValue => {
  return 5;
};

/*******************************************
 * Scales
 *******************************************/
const xScale = d3
  .scaleLinear()
  .domain([0, data.numberOfUniqueAnswers])
  .range([0, width - margin.left - margin.right]);

const yScale = d3
  .scaleBand()
  .domain(data.labels)
  .range([height - margin.top - margin.bottom, 0])
  .padding(0.1);

/*******************************************
 * Axis
 *******************************************/
const yAxis = d3.axisLeft().scale(yScale);
const yAxisG = g
  .append("g")
  .attr("transform", `translate(0,0)`)
  .classed("y-axis", true)
  .call(yAxis);

const xAxis = d3
  .axisBottom()
  .ticks(getTicksCount(data.numberOfUniqueAnswers))
  .tickSizeInner([-(height - margin.top - margin.bottom)])
  .scale(xScale);

const xAxisG = g
  .append("g")
  .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
  .classed("x-axis", true)
  .call(xAxis);

/*******************************************
 * Draw chart
 *******************************************/
const rect = g
  .append("g")
  .attr("class", "bars")
  .selectAll(".bar")
  .data(data.values)
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("fill", "#02a79c")
  .attr("x", 0)
  .attr("height", yScale.bandwidth())
  .attr("y", (d, i) => yScale(data.labels[i]))
  .attr("width", 0);

d3.selectAll(".bar")
  .transition(t)
  .attr("width", d => xScale(d));

/*******************************************
 * Draw hover boxes
 *******************************************/
const hover = d3
  .select("#app")
  .append("div")
  .style("position", "absolute")
  .style("background", "#80CBC4")
  .style("color", "#000")
  .style("padding", 5)
  .style("max-width", "200px")
  .style("border", "1px solid #fff")
  .style("display", "none");

rect
  .on("mousemove", (d, i) => {
    const percentace = (d * 100) / data.numberOfUniqueAnswers;
    hover
      .style("left", `${d3.event.pageX - 50}px`)
      .style("top", `${d3.event.pageY - 30}px`)
      .style("display", "inline-block")
      .html(`${d3.format(".1f")(percentace)}% ${data.labels[i]}`);
  })
  .on("mouseout", d => {
    hover.style("display", "none");
  });

/*******************************************
 * Text
 *******************************************/
d3.select(".bars")
  .selectAll("text")
  .data(data.values)
  .enter()
  .append("text")
  .style("fill", d => (d > 0 ? "#fff" : "#02a79c"))
  .style("font-size", "14px")
  .attr("x", d => xScale(d) / 2 + 2)
  .attr("y", (d, i) => yScale(data.labels[i]) + margin.bottom + margin.top - 5)
  .text(d => d);
