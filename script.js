// CHART INIT ------------------------------

// create svg with margin convention

const margin = { top: 20, left: 50, right: 20, bottom: 20 };
const totalWidth = 650;
const totalHeight = 500;
const width = totalWidth - margin.left - margin.right,
  height = totalHeight - margin.top - margin.bottom;

const svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", totalWidth)
  .attr("height", totalHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// create scales without domains

const xScale = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);

const yScale = d3.scaleLinear().range([height, 0]);

// create axes and axis title containers

svg
  .append("g")
  .attr("class", "axis x-axis")
  .attr("transform", `translate(0, ${height})`);

svg.append("g").attr("class", "axis y-axis");

svg.append("text").attr("class", "y-axis-title").attr("x", -25).attr("y", -5);

// Define update parameters: measure type, sorting direction

let data;
let type = d3.select("#group-by").node().value;
let isReversed = false;

// CHART UPDATE FUNCTION -------------------
function update(data, type, isReversed) {
  console.log("Data: ", data, "Type: ", type, "Reversed: ", isReversed);
  // update domains

  data.sort((a, b) => b[type] - a[type]);

  if (isReversed) {
    data.reverse();
  }

  xScale.domain(data.map((d) => d.company));

  yScale.domain([0, d3.max(data, (d) => d[type])]);

  // update bars

  const bars = svg.selectAll(".bar").data(data, (d) => d.company);

  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d, i) {
      return xScale(d.company);
    })
    .attr("y", function (d, i) {
      return height;
    })
    .attr("width", function (d, i) {
      return xScale.bandwidth();
    })
    .attr("height", function (d, i) {
      return 0;
    })
    .attr("fill", "white")
    .merge(bars)
    .transition()
    .duration(1000)
    .attr("x", function (d, i) {
      return xScale(d.company);
    })
    .attr("y", function (d, i) {
      return yScale(d[type]);
    })
    .attr("height", function (d, i) {
      return height - yScale(d[type]);
    })
    .attr("fill", "maroon");

  // update axes and axis title

  const xAxis = d3.axisBottom(xScale);

  svg.select(".x-axis").transition().duration(1000).call(xAxis);

  const yAxis = d3.axisLeft(yScale);

  svg.select(".y-axis").transition().duration(1000).call(yAxis);

  d3.select(".y-axis-title").text(
    type === "stores" ? "Stores" : "Billion (USD)"
  );
}

// CHART UPDATES ---------------------------

// Loading data
d3.csv("coffee-house-chains.csv", d3.autoType).then((d) => {
  data = d;
  update(data, type, isReversed); // simply call the update function with the supplied data
});

// Handling the type change
d3.select("#group-by").on("change", (event) => {
  type = d3.select("#group-by").node().value;
  update(data, type, isReversed);
});

// Handling the sorting direction change

d3.select("#reverse-btn").on("click", (event) => {
  isReversed = !isReversed;
  update(data, type, isReversed);
});
