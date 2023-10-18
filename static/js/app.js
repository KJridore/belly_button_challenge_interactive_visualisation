let samples = null;
let metadata = null;
let plot = null;
let plotBubbleChart = null;
const getSampleDictionary = ({ otu_ids, sample_values, otu_labels }) => {
  const data = [];
  for (let i = 0; i < otu_ids.length; i++) {
    data.push({
      otu_id: otu_ids[i],
      sample_value: sample_values[i],
      otu_label: otu_labels[i],
    });
  }
  return data.sort((a, b) => b.sample_value - a.sample_value);
};

function mouseOver(d) {
  console.log(d);
  d3.select(this.parentNode)
    .append("text") //appending it to path's parent which is the g(group) DOM
    .attr("x", function () {
      return d.otu_id;
    })
    .attr("dx", "6") // margin
    .attr("dy", ".35em") // vertical-align
    .text(function () {
      return d.otu_label;
    });
}

function optionChanged(value) {
  if (!plot) throw new Error("Bar plot is not available");
  if (!plotBubbleChart) throw new Error("Bubble plot is not available");
  const sample = getSampleByID(value);
  const reformedData = getSampleDictionary(sample);
  plot(reformedData.slice(0, 10));
  plotBubbleChart(reformedData);

  const meta = getMetaByID(value);
  showDemography(meta);
}

function showDemography(meta) {
  const demographyElement = document.getElementById("sample-metadata");
  demographyElement.replaceChildren();
  Object.keys(meta).forEach((key) => {
    const dataElement = document.createElement("div");
    dataElement.innerHTML = `${key}: ${meta[key]}`;
    demographyElement.appendChild(dataElement);
  });
}

function getSampleByID(id) {
  if (!samples) throw new Error("No samples available");
  return samples.find((sample) => sample.id === id);
}
function getMetaByID(id) {
  console.log("metadata, id", typeof metadata[0].id, typeof id);
  if (!metadata) throw new Error("No meta available");
  return metadata.find((meta) => meta.id === Number(id));
}

const addOptions = (samples) => {
  const selectElement = document.getElementById("selDataset");

  samples.forEach((sample) => {
    const option = document.createElement("option");
    option.innerHTML = sample.id;
    selectElement.appendChild(option);
  });
};

const horizontalBarChat = () => {
  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 30, bottom: 40, left: 90 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#bar")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const plotBarChart = (data) => {
    svg.text("");
    // Add X axis
    var x = d3.scaleLinear().domain([0, 200]).range([0, width]);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    var y = d3
      .scaleBand()
      .range([0, height])
      .domain(
        data.map(function (d) {
          return d.otu_id;
        })
      )
      .padding(0.1);
    svg.append("g").call(d3.axisLeft(y));

    //Bars
    svg
      .selectAll("blah")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", x(0))
      .attr("y", function (d) {
        return y(d.otu_id);
      })
      .attr("width", function (d) {
        return x(d.sample_value);
      })
      .attr("height", y.bandwidth())
      .attr("fill", "#69b3a2");
    //   .on("mouseover", mouseOver);

    // .attr("x", function(d) { return x(d.Country); })
    // .attr("y", function(d) { return y(d.Value); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.Value); })
    // .attr("fill", "#69b3a2")
  };

  return plotBarChart;
};

const bubbleChart = () => {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 20, bottom: 30, left: 50 },
    width = 1000 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#bubble")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function plotBubbleChart(data) {
    svg.text("");
    // Add X axis
    var x = d3.scaleLinear().domain([0, 4000]).range([0, width]);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 300]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Add a scale for bubble size
    var z = d3.scaleLinear().domain([0, 300]).range([1, 40]);

    // Add dots
    svg
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.otu_id);
      })
      .attr("cy", function (d) {
        return y(d.sample_value);
      })
      .attr("r", function (d) {
        return z(d.sample_value);
      })
      .style("fill", function (d) {
        return `hsl(${d.otu_id}, 100%, 50%)`;
      })
      .style("opacity", "0.7")
      .attr("stroke", "black");
  }

  return plotBubbleChart;
};

d3.json(
  "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json"
)
  .then((data) => {
    console.log("data", data);
    samples = data.samples;
    metadata = data.metadata;
    addOptions(samples);
    const reformedData = getSampleDictionary(samples[0]);
    plot = horizontalBarChat();
    plot(reformedData.slice(0, 10));

    plotBubbleChart = bubbleChart();
    plotBubbleChart(reformedData);

    showDemography(metadata[0]);
  })
  .catch((error) => {
    console.error(error);
  });
