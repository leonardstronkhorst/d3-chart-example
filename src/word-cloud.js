import * as d3 from "d3";
import { schemeSet1 } from "d3-scale-chromatic";

// set up SVG
const width = 960;
const height = 500;
const margin = { top: 20, right: 20, bottom: 30, left: 80 };
const colorPalette = [
  "#1f77b4",
  "#aec7e8",
  "#ff7f0e",
  "#ffbb78",
  "#2ca02c",
  "#98df8a",
  "#d62728",
  "#ff9896",
  "#9467bd",
  "#c5b0d5",
  "#8c564b",
  "#c49c94",
  "#e377c2",
  "#f7b6d2",
  "#7f7f7f",
  "#c7c7c7",
  "#bcbd22",
  "#dbdb8d",
  "#17becf",
  "#9edae5"
];
const svg = d3
  .select("#app-word-cloud")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("overflow", "visible");

const g = svg
  .append("g")
  .attr("transform", `translate(${width >> 1},${height >> 1})`);

// set up animation transition
const t = d3.transition().duration(1500);

/*******************************************
 * Get data
 *******************************************/
const data = require("./data/data-word-cloud.json");
const common = require("./data/common-words.json");

// Process text data
let wordCounts = {};
const words = data.text.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
if (words.length === 1) {
  wordCounts[words[0]] = 1;
} else {
  words.forEach(word => {
    const text = word.toLowerCase();
    if (text !== "" && common.words.indexOf(text) === -1 && text.length > 1) {
      if (wordCounts[text]) {
        wordCounts[text]++;
      } else {
        wordCounts[text] = 1;
      }
    }
  });
}

const wordWithSizes = Object.keys(wordCounts).map(key => {
  return { text: key, size: wordCounts[key] };
});

/*******************************************
 * Scales
 *******************************************/
const colorScale = d3.scaleOrdinal(d3.schemeSet1);

const xScale = d3
  .scaleLinear()
  .domain([0, d3.max(wordWithSizes, d => d.size)])
  .range([10, 100]);

/*******************************************
 * Hover boxes
 *******************************************/
const hover = d3
  .select("#app")
  .append("div")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("color", "#333")
  .style("padding", 10)
  .style("max-width", "200px")
  .style("border", "1px solid #999")
  .style("display", "none");

/*******************************************
 * Draw word cloud
 *******************************************/
// load word cloud add on
const cloud = require("./third-party/d3.layout.cloud.js");

const layout = cloud()
  .size([500, 500])
  .words(wordWithSizes)
  .padding(5)
  .rotate(0)
  .font("Helvetica")
  .fontSize(d => d.size * 10)
  .on("end", words => {
    g.attr(
      "transform",
      `translate(${layout.size()[0] / 2} , ${layout.size()[1] / 2})`
    )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .attr("class", "word")
      .style("font-size", d => `${d.size}px`)
      .style("font-family", "Helvetica")
      .style("fill", (d, i) => colorScale(i))
      .attr("text-anchor", "middle")
      .attr("transform", d => `translate(${d.x}, ${d.y})rotate(${d.rotate})`)
      .text(d => d.text)
      .on("mouseover", d => {
        hover
          .style("left", `${d3.event.pageX - 50}px`)
          .style("top", `${d3.event.pageY - 50}px`)
          .style("display", "inline-block")
          .html(`Occurences ${d.size / 10}`);
      })
      .on("mouseout", d => {
        hover.style("display", "none");
      });
  });
layout.start();
layout.stop();
