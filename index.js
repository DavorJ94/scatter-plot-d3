// ! Defining width and height of SVG container
const width = 900;
const height = 500;

// ! Create SVG Element
const scatterPlot = d3
  .select("body")
  .append("svg")
  .attr("height", height)
  .attr("width", width)
  .attr("id", "scatterPlot")
  .style("background-color", "white")
  .style("margin-top", "50px")
  .style("box-shadow", "2px 1px 20px 6px #000000");

// ! Rendering the chart using the function
const renderScatterPlot = (data) => {
  // ! Margin convention
  margin = { top: 70, right: 50, bottom: 80, left: 80 };
  const innerWidth = width - margin.right - margin.left;
  const innerHeight = height - margin.top - margin.bottom;

  // ! Setting the domain and scale of x and y axis

  // ! Adding min and max date so the graph looks nice
  var lastDate = new Date(d3.max(data, (d) => d.Year));
  var firstDate = new Date(d3.min(data, (d) => d.Year));
  var maxDate = new Date(lastDate.setFullYear(lastDate.getFullYear() + 1));
  var minDate = new Date(firstDate.setFullYear(firstDate.getFullYear() - 1));

  const xScale = d3
    .scaleTime()
    .range([0, innerWidth])
    .domain([minDate, maxDate]);
  var firstMins = new Date(d3.min(data, (d) => d.Time));
  var minMins = new Date(firstMins.setMinutes(firstMins.getMinutes()));

  const yScale = d3
    .scaleTime()
    .domain([minMins, d3.max(data, (d) => d.Time)])
    .range([innerHeight, 0])
    .nice();

  // ! Introducing subgroup "g"
  const gScatterPlot = scatterPlot
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // ! Introducing x axis
  const xAxisG = gScatterPlot
    .append("g")
    .call(d3.axisBottom(xScale))
    .attr("class", "forColoring")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${innerHeight})`);

  // ! Introducing y axis
  // const yAxisTickFormat = (number) =>
  //   d3.format(",.2s")(number).replace(".0", "").replace("k", "K");
  var specifier = d3.timeFormat("%M:%S");
  const yAxisG = gScatterPlot
    .append("g")
    .attr("class", "forColoring")
    .attr("id", "y-axis")
    .call(
      d3.axisLeft(yScale).tickFormat(function (d) {
        return d3.timeFormat(specifier)(d);
      })
    );

  // ! Introducing axis labels and title of chart
  xAxisG
    .append("text")
    .attr("class", "xAxisLabel")
    .text("Years")
    .attr("x", innerWidth / 2)
    .attr("y", 45);
  yAxisG
    .append("text")
    .attr("class", "yAxisLabel")
    .text("Time finished (minutes)")
    .attr("x", -innerHeight / 2)
    .attr("y", -45)
    .style("transform", "rotate(-90deg)");
  gScatterPlot
    .append("text")
    .text("Doping Allegations in Professional Cycling")
    .attr("id", "title")
    .attr("x", innerWidth / 2)
    .attr("y", -30);

  // ! Defining tooltip
  var tooltipForData = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // ! Creating the chart
  var keys = ["Doping allegations", "No doping allegations"];
  var color = ["#BD2D28", "#E3BA22"];
  var radSize = 8;
  var parseTime = d3.timeFormat("%M:%S");

  gScatterPlot
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", function (d) {
      return xScale(d.Year);
    })
    .attr("cy", (d) => yScale(d.Time))
    .attr("r", radSize)
    .attr("fill", (d) => (d.Doping == "" ? color[1] : color[0]))
    .style("stroke", "black")
    .attr("data-xvalue", (d) => d.Year.getFullYear())
    .attr("data-yvalue", (d) => d.Time)
    .on("mouseover", function (event, d) {
      tooltipForData.transition().duration(100).style("opacity", 0.95);
      tooltipForData
        .html(
          "<span>Name: </span>" +
            d.Name +
            "<br>" +
            "<span>Nationality: </span>" +
            d.Nationality +
            "<br>" +
            "<span>Year: </span>" +
            d.Year.getFullYear() +
            "<br>" +
            "<span>Time: </span>" +
            parseTime(d.Time) +
            "<br>" +
            "<span>Place: </span>" +
            d.Place +
            "<br>" +
            "<span>Doping allegations: </span>" +
            `${d.Doping !== "" ? d.Doping : "None"}`
        )
        .style("left", event.pageX + 25 + "px")
        .style("top", event.pageY + "px")
        .attr("data-year", d.Year.getFullYear());
    })
    .on("mouseout", function (d) {
      tooltipForData.transition().duration(100).style("opacity", 0);
    });

  // ! Creating the legend
  const radSizeLegend = 4;
  var legendContainer = d3
    .select("#scatterPlot")
    .append("g")
    .attr("id", "legend");
  var positionXLegend = innerWidth - 50;
  var positionYLegend = innerHeight;
  legendContainer
    .selectAll("dots")
    .data(color)
    .enter()
    .append("circle")
    .attr("cx", positionXLegend)
    .attr("cy", function (d, i) {
      return positionYLegend + i * (radSizeLegend + 15);
    })
    .attr("r", radSizeLegend)
    .style("fill", function (d) {
      return d;
    })
    .style("stroke", "black");
  let fontSize = 14;
  legendContainer
    .selectAll("#myLabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("class", "myLab")
    .attr("x", positionXLegend + radSizeLegend * 1.75)
    .attr("y", function (d, i) {
      return positionYLegend + i * (radSizeLegend + 15) + fontSize * 0.32;
    })
    .text(function (d) {
      return d;
    })
    .style("fill", (d, i) => color[i])
    .style("font-size", fontSize)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "center")
    .style("text-shadow", "0.2px 0.2px 0.5px #000000");

  // ! Adding source
  const divSource = d3
    .select("svg")
    .append("g")
    .attr("transform", `translate(${width - margin.right}, ${height - 20})`);
  divSource
    .append("text")
    .attr("class", "textSource")
    .text("Data source: ")
    .append("a")
    .attr("class", "linkSource")
    .attr(
      "href",
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
    )
    .attr("target", "_blank")
    .text("https://raw.githubusercontent.com/freeCodeCamp...");

  // ! Adding author
  const author = d3
    .select("body")
    .append("h1")
    .attr("class", "nameAuthor")
    .text("Created by ")
    .append("a")
    .attr("href", "https://www.linkedin.com/in/davor-jovanovi%C4%87/")
    .attr("target", "_blank")
    .text("DavorJ");
};

// ! Getting the data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then((data) => {
  var parseTime = d3.timeParse("%M:%S");
  data.forEach((d) => {
    d.Time = new Date(parseTime(d.Time));
    d.Year = new Date(d.Year, 0);
  });
  renderScatterPlot(data);
});
