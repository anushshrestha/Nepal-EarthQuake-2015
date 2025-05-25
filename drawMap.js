/**
 * Created by silentflutes on 10/6/2015.
 */

//size of canvas
var width = 750;
var height = 750;

//formatting number as per required
var formatAsInteger = d3.format(",");

var quantizeHitIntoColor = function (i) {
  //console.log(i);
  if (i >= 100) return "red";
  else if (i < 100 && i >= 50) return "pink";
  else if (i < 50 && i > 0) return "yellow";
  else return "grey";
};

var quantizeMaxMagnitudeIntoColor = function (i) {
  //console.log(i);
  if (i > 6.0) return "red";
  else if (i <= 6.0 && i > 5.0) return "pink";
  else if (i <= 5.0 && i > 4.0) return "yellow";
  else if (i == 0) return "grey";
};

function setupBarChartBasics() {
  var margin = { top: 100, right: 5, bottom: 10, left: 100 },
    width = 500 - margin.left - 20 - margin.right,
    height = 250 - margin.top - margin.bottom,
    colorBar = d3.scale.category20(),
    barPadding = 2;
  return {
    margin: margin,
    width: width,
    height: height,
    colorBar: colorBar,
    barPadding: barPadding,
  };
}

d3.json("data/nepalDistricts.geojson", createMap);

function createMap(nepal) {
  var canvas = d3
    .select("#map")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("svg")
    .attr("width", "98%")
    .attr("height", "97%")
    .attr("viewBox", "0 0 804 621")
    //class to make it responsive
    .classed("svg-content-responsive", true);
  // .attr("style", "border: 1px solid red;")
  var group = canvas.selectAll("g").data(nepal.features).enter().append("g");
  var projection = d3.geo
    .mercator()
    .scale(5800)
    .center([84.915593872070313, 28.465876770019531]);
  var geoPath = d3.geo.path().projection(projection);

  //plotting map
  var plotDistricts = group
    .append("path")
    .attr("d", geoPath)
    //.attr("fill",function(d,i){return color(i);})
    .attr("class", function (d) {
      return quantizeHitIntoColor(d.no);
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", "1px")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    .on("click", mouseclick);

  var colorDomain = [150, 350, 1500];
  var extColorDomain = [0, 150, 350, 1500];
  var legendLabels;
  var color = d3.scale
    .threshold()
    .domain(colorDomain)
    //reverse order as of displayed
    .range(["#eee", "#fdcf58", "#f37735", "#cb0404"]);

  //rgb color codes
  /*  rgb(255,255,255)", "rgb(255,230,230)", "rgb(255,150,150)", "rgb(255,100,100)", "rgb(230,100,100)",
     "rgb(235,90,90)","rgb(240,80,80)","rgb(245,60,60)","rgb(250,50,50)","rgb(255,0,0)*/

  var legendTitle = canvas
    .selectAll("g.legendTitle")
    .data(["No of Earthquakes and Aftershocks"])
    .enter()
    .append("g")
    .attr("class", "legendTitle");
  legendLabels = ["0", "<50", "50-100", "100+"];
  legendTitle.data(["No of Earthquakes and Aftershocks"]);

  //legend title
  legendTitle
    .append("text")
    .attr("id", "legendTitleText")
    .attr("font-size", "15px")
    .attr("x", 0)
    .attr("y", 0.65 * height)
    .text(function (d) {
      return d;
    });

  var legend = canvas
    .selectAll("g.legend")
    .data(extColorDomain)
    .enter()
    .append("g")
    .attr("class", "legend");

  var legendWidth = 20,
    legendHeight = 20;

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", function (d, i) {
      return 0.8 * height - i * legendHeight - 2 * legendHeight;
    })
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", function (d) {
      return color(d);
    })
    .style("opacity", 0.8);

  legend
    .append("text")
    .attr("id", function (d, i) {
      return "legendText" + i;
    })
    .attr("font-size", "16px")
    .attr("x", 25)
    .attr("y", function (d, i) {
      return 0.8 * height - i * legendHeight - legendHeight - 4;
    })
    .text(function (d, i) {
      return legendLabels[i];
    });

  //selecting tab (data source)
  var hitTab = document.getElementById("noOfHitTab");
  var magnitudeTab = document.getElementById("maxMagnitudeTab");

  hitTab.setAttribute("thisValue", "noOfHit");
  hitTab.setAttribute("otherValue", "maxMagnitude");
  magnitudeTab.setAttribute("thisValue", "noOfHit");
  magnitudeTab.setAttribute("otherValue", "maxMagnitude");

  var selectedTab = document.getElementById("noOfHitTab");
  var links = document.getElementsByTagName("li");

  //selected is dark other light
  if (selectedTab.getAttribute("thisValue") == "noOfHit") {
    links.item(0).style.color = "black";
    links.item(1).style.color = "grey";
    links.item(0).style.borderBottom = "2px solid black";
  }

  if (selectedTab.getAttribute("thisValue") == "maxMagnitude") {
    links.item(1).style.color = "black";
    links.item(0).style.color = "grey";
    links.item(1).style.borderBottom = "3px solid black";
  }

  //mouse event handler
  var bodyNode = d3.select("body").node();
  var toolTipDiv;

  function mouseclick(nepal) {
    //displaying all district button

    document.getElementById("alldistrict").style.visibility = "visible";

    /*d3.select(this).select("path").transition().duration(500)
         .attr("stroke", "#fff");
         */
    //'stroke-opacity':1,'stroke':'#F00','stroke-width':'2px',

    /* d3.select(this.parentNode.appendChild(this)).transition().duration(300)
         .style({'fill':'#000'})
         .attr("id","tempColor");

         var active = d3.select(null);
         //zoom on click

         if (active.node() === this) return reset();
         active.classed("active", false);
         active = d3.select(this).classed("active", true);

         mouseout();
         var bounds =  geoPath.bounds(nepal),
         dx = bounds[1][0] - bounds[0][0],
         dy = bounds[1][1] - bounds[0][1],
         x = (bounds[0][0] + bounds[1][0]) / 2,
         y = (bounds[0][1] + bounds[1][1]) / 2,
         scale = .5 / Math.max(dx / width, dy / height),
         translate = [width / 2 - scale * x, height / 2 - scale * y];

         group.transition()
         .duration(750)
         .style("stroke","#000")
         .style("stroke-width", 0.5 / scale + "px")
         .attr("transform", "translate(" + translate + ")scale(" + scale + ")");


         var zoomOut = canvas.selectAll("g.zoomOut")
         .data(["Zoom out"])
         .enter().append("g")
         .attr("class", "zoomOut")
         ;

         zoomOut.append("text")
         .attr("font-size","20px")
         .attr("x", 20)
         .attr("y", 100)
         .text(function (d) {
         return d;
         })
         .attr("class","textZoomOut")
         .on("click",function(){reset();});

         function reset() {
         active.classed("active", false);
         active = d3.select(null);

         group.transition()
         .dura  tion(750)
         .style("stroke-width", "1.5px")
         .attr("transform", "");

         zoomOut.transition()
         .duration(700).remove();

         document.getElementById("tempColor").removeAttribute();
         }
         */

    var districtName;
    if (document.getElementById("langT").getAttribute("current") === "Nepali") {
      districtName = nepal.districtInNepali;
    } else {
      districtName =
        nepal.properties.DISTRICT.charAt(0).toUpperCase() +
        nepal.properties.DISTRICT.slice(1).toLowerCase();
    }
    //setting district name
    var titleElement = document.getElementById("districtSelected");
    titleElement.removeChild(titleElement.firstChild);
    titleElement.appendChild(
      titleElement.ownerDocument.createTextNode(districtName)
    );

    d3.csv("data/dataSource.csv", updateBar);
    function updateBar(data) {
      //calculating value
      function aggregateValues(subDivision) {
        var result = data
          .filter(function (data) {
            return (
              data.Subdivision == subDivision &&
              data.District.toLowerCase() ==
                nepal.properties.DISTRICT.toLowerCase()
            );
          })
          .map(function (data) {
            return data.no;
          })
          .reduce(function (a, b) {
            return parseInt(a) + parseInt(b);
          }, 0);
        return result;
      }

      var deaths = aggregateValues("Death");
      var injured = aggregateValues("Injured");
      var govtfull = aggregateValues("Govt. Houses Fully Damaged");
      var govtpartial = aggregateValues("Govt. Houses Partially Damaged");
      var prifull = aggregateValues("Private Houses Fully Damaged");
      var pripartial = aggregateValues("Private Houses Partially Damaged");

      var sum = [];
      var otherValue = 0,
        thisValue = 0;
      var basics = setupBarChartBasics();
      var margin = basics.margin,
        width = basics.width,
        height = basics.height,
        colorBar = basics.colorBar,
        barPadding = basics.barPadding;
      updateBarChart("#barChartHC", "#plotbarChartHC", colorBar);
      updateBarChart("#barChartID", "#plotbarChartID", colorBar);

      function updateBarChart(divId, barChartId, colorBar) {
        if (divId.localeCompare("#barChartHC") == 0) {
          title = "Human Casualties";
          divison = "Human Causalities";
          subDivision = ["Death", "Injured"];
          //
          sum[0] = deaths;
          sum[1] = injured;
          //console.log(sum);
        }
        if (divId.localeCompare("#barChartID") == 0) {
          subDivision = ["Fully Damaged", "Partially Damaged"];
          var selectedMode = document.getElementById("selectMode");
          if (selectedMode.value.localeCompare("Government") == 0) {
            title = "Government Infrastructure Damage";
            division = "Government Infrastructural Damage";

            //  getSum(districtArray, divison, subDivision);
            sum[0] = govtfull;
            sum[1] = govtpartial;
            //for swapping values when select option changed
            thisValue = govtfull + " " + govtpartial;
            otherValue = prifull + " " + pripartial;
            //console.log(sum);
          }
          if (selectedMode.value.localeCompare("Private") == 0) {
            title = "Private Infrastructure Damage";
            division = "Private Infrastructural Damage";
            sum[0] = prifull;
            sum[1] = pripartial;
            thisValue = prifull + " " + pripartial;
            otherValue = govtfull + " " + govtpartial;
            //console.log(sum);
          }
        }

        // console.log(districtArray);

        var xScale = d3.scale
          .linear()
          .domain([0, sum.length])
          .range([0, width]);
        var yScale = d3.scale
          .linear()
          .domain([0, d3.max(sum)])
          .range([height, 0]);
        var svg = d3.select(divId + " svg");
        var plot = svg.datum(sum);
        //just need to select element no more appending
        plot
          .selectAll("rect")
          .data(sum)
          .transition()
          .duration(750)
          //x and y are point from where plotting begins
          .attr("x", function (d, i) {
            return xScale(i);
          })
          .attr("width", width / (sum.length + 4) - barPadding)
          .attr("y", function (d) {
            //happens  if input is 0
            if (yScale(d) == height) return height; //bring y point to y=0
            else return yScale(d);
          })
          //.attr("y",function(sum){return sum;})
          .attr("height", function (d) {
            if (yScale(d) == height) return 0;
            else return height - (yScale(d) % height);
          })
          // .attr("height",function(d){return height;})
          .attr("fill", colorBar)
          .attr("otherValue", otherValue)
          .attr("thisValue", thisValue)
          .attr("district", districtName);

        //add y labels to plot
        var yLabel = plot
          .selectAll("text.yAxis")
          .data(sum)
          .transition()
          .duration(750)
          .attr("text-anchor", "middle")
          //set x position to the left edge of each bar plus half the har width
          .attr("x", function (d, i) {
            return (
              i * (width / sum.length) +
              (width / (sum.length + 4) - barPadding) / 2
            );
          })
          .attr("y", function (d) {
            if (yScale(d) == height) return height - 6;
            else return yScale(d) - 6;
          })
          .attr("class", "yAxis");
        //y label for translation
        if (document.getElementById("langT").innerHTML === "English") {
          //nepali
          yLabel.text(function (d) {
            var value = formatAsInteger(d3.round(d));

            if (value == 0) return "०";
            else return parseInt(value).toLocaleString("ne-NP");
          });
        } else {
          yLabel.text(function (d) {
            var value = formatAsInteger(d3.round(d));
            if (value == 0) return "0";
            else return value;
          });
        }
        //y labels for translation

        //console.log(districtName);
        svg
          .selectAll("text.title")
          .attr("x", 46)
          .attr("y", 30)
          .transition()
          .duration(750)
          //.attr("text-anchor", "middle")
          .text(title);

        /*    svg.selectAll("text.districtname")
                 .attr("x", (width + (margin.left-90) + margin.right) / 2)
                 .attr("y", 55)
                 .transition()
                 .duration(750)
                 .attr("class", "districtname")
                 .attr("text-anchor", "middle")
                 .text(districtName)
                 ;*/

        //x axis label are same as created so no need to be update
      }
    }
  }

  function mouseover(nepal) {
    var districtName;
    if (document.getElementById("langT").getAttribute("current") === "Nepali") {
      districtName = nepal.districtInNepali;
    } else {
      districtName =
        nepal.properties.DISTRICT.charAt(0).toUpperCase() +
        nepal.properties.DISTRICT.slice(1).toLowerCase();
    }

    var absoluteMousePos = d3.mouse(bodyNode);
    toolTipDiv = d3.select("body").append("div").attr("class", "tooltip");

    if (selectedTab.getAttribute("thisValue") == "noOfHit") {
      toolTipDiv
        //.text(d3.event.pageX + ", " + nepal.properties.DISTRICT +","+ d3.event.pageY)
        .style("left", absoluteMousePos[0] + "px")
        .style("top", absoluteMousePos[1] + "px")
        .style("opacity", 1)
        //jitter is due to displacement of one div by another
        .style("float", "left");
      //var value = document.getElementsByClassName("tooltip");
      if (document.getElementById("langT").innerHTML === "English") {
        toolTipDiv.html(
          "<span class='tooltipTitle'>" +
            districtName +
            "</span>" +
            "<span class='tooltipValue'>" +
            " कुल भुइचालोको शांख्य: " +
            nepal.no.toLocaleString("ne-NP") +
            "</span>"
        );
      } else {
        toolTipDiv.html(
          "<span class='tooltipTitle'>" +
            districtName +
            "</span>" +
            "<span class='tooltipValue'>" +
            " No of Earthquakes: " +
            nepal.no +
            "</span>"
        );
      }
    }

    if (selectedTab.getAttribute("thisValue") == "maxMagnitude") {
      toolTipDiv
        //.text(d3.event.pageX + ", " + nepal.properties.DISTRICT +","+ d3.event.pageY)
        .style("left", absoluteMousePos[0] + "px")
        .style("top", absoluteMousePos[1] + "px")
        .style("opacity", 1)
        //jitter is due to displacement of one div by another
        .style("float", "left");

      if (document.getElementById("langT").innerHTML === "English") {
        toolTipDiv.html(
          "<span class='tooltipTitle'>" +
            districtName +
            "</span>" +
            "<span class='tooltipValue'>" +
            " अधिकतम्  भुइचालो : " +
            nepal.maxHit.toLocaleString("ne-NP") +
            "</span>"
        );
      } else {
        toolTipDiv.html(
          "<span class='tooltipTitle'>" +
            districtName +
            "</span>" +
            "<span class='tooltipValue'>" +
            " Maximum Magnitude: " +
            nepal.maxHit +
            "</span>"
        );
      }
    }
  }
  function mousemove(nepal) {
    var districtName;
    if (document.getElementById("langT").getAttribute("current") === "Nepali") {
      districtName = nepal.districtInNepali;
    } else {
      districtName =
        nepal.properties.DISTRICT.charAt(0).toUpperCase() +
        nepal.properties.DISTRICT.slice(1).toLowerCase();
    }
    var absoluteMousePos = d3.mouse(bodyNode);

    if (selectedTab.getAttribute("thisValue") == "noOfHit") {
      toolTipDiv
        //.text(d3.event.pageX + ", " + nepal.properties.DISTRICT +","+ d3.event.pageY)
        .style("left", absoluteMousePos[0] + "px")
        .style("top", absoluteMousePos[1] + "px")
        .style("opacity", 1)
        //jitter is due to displacement of one div by another
        .style("float", "left");
      //var value = document.getElementsByClassName("tooltip");
      if (document.getElementById("langT").innerHTML === "English") {
        toolTipDiv.html(
          "<span class='tooltipTitle'>" +
            districtName +
            "</span>" +
            "<span class='tooltipValue'>" +
            " कुल भुइचालोको शांख्या : " +
            nepal.no.toLocaleString("ne-NP") +
            "</span>"
        );
      } else {
        toolTipDiv.html(
          "<span class='tooltipTitle'>" +
            districtName +
            "</span>" +
            "<span class='tooltipValue'>" +
            " No of Earthquakes: " +
            nepal.no +
            "</span>"
        );
      }
    }

    if (selectedTab.getAttribute("thisValue") == "maxMagnitude") {
      toolTipDiv
        //.text(d3.event.pageX + ", " + nepal.properties.DISTRICT +","+ d3.event.pageY)
        .style("left", absoluteMousePos[0] + "px")
        .style("top", absoluteMousePos[1] + "px")
        .style("opacity", 1)
        //jitter is due to displacement of one div by another
        .style("float", "left");

      if (document.getElementById("langT").innerHTML === "English") {
        toolTipDiv.html(
          "<span class='tooltipTitle'>" +
            districtName +
            "</span>" +
            "<span class='tooltipValue'>" +
            " अधिकतम्  भुइचालो : " +
            nepal.maxHit.toLocaleString("ne-NP") +
            "</span>"
        );
      } else {
        toolTipDiv.html(
          "<span class='tooltipTitle'>" +
            districtName +
            "</span>" +
            "<span class='tooltipValue'>" +
            " Maximum Magnitude: " +
            nepal.maxHit +
            "</span>"
        );
      }
    }
  }

  function mouseout() {
    toolTipDiv.remove();
  }
}

d3.csv("data/dataSource.csv", createBar);
function createBar(data) {
  function aggregateValues(subDivision) {
    var result = data
      .filter(function (data) {
        return data.Subdivision == subDivision;
      })
      .map(function (data) {
        return data.no;
      })
      .reduce(function (a, b) {
        return parseInt(a) + parseInt(b);
      }, 0);
    return result;
  }

  var deaths = aggregateValues("Death");
  var injured = aggregateValues("Injured");
  var govtfull = aggregateValues("Govt. Houses Fully Damaged");
  var govtpartial = aggregateValues("Govt. Houses Partially Damaged");
  var prifull = aggregateValues("Private Houses Fully Damaged");
  var pripartial = aggregateValues("Private Houses Partially Damaged");

  var sum = [];
  createBarChart("#barChartHC", "#plotbarChartHC");
  createBarChart("#barChartID", "#plotbarChartID");

  var otherValue, thisValue, className;

  var titleElement = document.getElementById("districtSelected");
  //titleElement.removeChild(titleElement.firstChild);
  titleElement.appendChild(
    titleElement.ownerDocument.createTextNode("Overall")
  );

  function createBarChart(divId, barChartId) {
    if (divId.localeCompare("#barChartHC") == 0) {
      title = "Human Casualties";
      divison = "Human Causalities";
      subDivision = ["Death", "Injured"];
      className = "HC";
      sum[0] = deaths;
      sum[1] = injured;
      //console.log(sum);

      //ids for language change
    }
    if (divId.localeCompare("#barChartID") == 0) {
      className = "ID";
      subDivision = ["Fully Damaged", "Partially Damaged"];
      var selectedMode = document.getElementById("selectMode");
      if (selectedMode.value.localeCompare("Government") == 0) {
        title = "Government Infrastructure Damage";
        division = "Government Infrastructural Damage";

        //  getSum(districtArray, divison, subDivision);
        sum[0] = govtfull;
        sum[1] = govtpartial;
        thisValue = govtfull + " " + govtpartial;
        otherValue = prifull + " " + pripartial;
        //console.log(sum);
      }
      if (selectedMode.value.localeCompare("Private") == 0) {
        title = "Private Infrastructure Damage";
        division = "Private Infrastructural Damage";
        sum[0] = prifull;
        sum[1] = pripartial;
        thisValue = prifull + " " + pripartial;
        otherValue = govtfull + " " + govtpartial;
        //console.log(sum);
      }
    }

    // console.log(districtArray);
    var basics = setupBarChartBasics();
    var margin = basics.margin,
      width = basics.width,
      height = basics.height,
      colorBar = basics.colorBar,
      barPadding = basics.barPadding;
    var xScale = d3.scale.linear().domain([0, sum.length]).range([0, width]);
    var yScale = d3.scale
      .linear()
      .domain([0, d3.max(sum)])
      .range([height, 0]);
    var svg = d3
      .select(divId)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("svg")
      .attr("viewBox", "0 0 385 311")
      //class to make it responsive
      .classed("svg-content-responsive", true)
      /*.style("width","100%")
                 .style("height", "100%")*/
      .attr("id", barChartId);
    // .attr("style", "border: 1px solid red;")
    //.attr("style","")
    var plot = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + (margin.left - 20) + "," + margin.top + ")"
      )
      .style("height", "100%")
      .style("width", "100%");
    //function setting class name based on hit no and css colours district based on class name

    /*var quantizeDeathIntoColor = d3.scale.quantize()
         // 9 is max no of hit
         .domain([0, deaths])
         .range(d3.range(deaths).map(function (i) {
         if (i>=0.75*deaths) return "red";
         else if (i>=0.50) return "pink";
         else if(i>=0.25) return "yellow";
         else return "green";
         }));
         */

    //data seq death injured fully partially
    //draw bargraph
    var plotBar = plot
      .selectAll("rect")
      .data(sum)
      .enter()
      .append("rect")
      .attr("x", function (sum, i) {
        return xScale(i);
      })
      .attr("width", width / (sum.length + 4))
      .attr("y", function (sum) {
        if (yScale(sum) == height) return height;
        else return yScale(sum);
      })
      //.attr("y",function(sum){return sum;})
      .attr("height", function (d) {
        if (yScale(d) == height) return height;
        return height - (yScale(d) % height);
        //);
      })
      // .attr("height",function(d){return height;})
      .attr("fill", colorBar)
      .attr("otherValue", otherValue)
      .attr("thisValue", thisValue)
      .attr("id", className)
      .attr("district", "Overall")
      //values saved series Death, Injured ,Gov full,Gov part, Pri full,Pri part
      .attr("overallValuesHC", deaths + " " + injured)
      .attr("overallGovernmentValuesID", govtfull + " " + govtpartial)
      .attr("overallPrivateValuesID", prifull + " " + pripartial);
    if (divId.localeCompare("#barChartHC") == 0)
      plotBar.attr("fill", function (d, i) {
        if (i == 0) return "#68c4af";
        else return "#96ead7";
      });
    //title
    svg
      .append("text")
      //width + (margin.left-190) + margin.right) / 2
      .attr("x", 46)
      .attr("y", 30)
      .transition()
      .duration(750)
      .attr("class", "barchartTitle")
      // .attr("text-anchor", "middle")
      .text(title);

    /*svg.append("text")
         .attr("x", (width + (margin.left-90) + margin.right) / 2)
         .attr("y", 55)
         .transition()
         .duration(750)
         .attr("class", "districtname")
         .attr("text-anchor", "middle")
         .text("Overall")
         ;*/

    //x axis label differs, add x labels to chart
    var xLabels = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + (margin.left - 18) + "," + (margin.top + height) + ")"
      )
      .style("height", "100%")
      .style("width", "100%");
    xLabels
      .selectAll("text.xAxis")
      .data(subDivision)
      .enter()
      .append("text")
      .text(function (d) {
        return d;
      })
      .attr("text-anchor", "middle")
      //set x position to the left edge of each bar plus half the bar width
      .attr("x", function (d, i) {
        return (
          i * (width / subDivision.length) +
          (width / (subDivision.length + 4) - barPadding) / 2
        );
      })
      .attr("y", 15)
      .attr("class", "xAxis");

    //add y labels to plot
    var yLabel = plot
      .selectAll("text")
      .data(sum)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      //set x position to the left edge of each bar plus half the har width
      .attr("x", function (d, i) {
        return (
          i * (width / sum.length) + (width / (sum.length + 4) - barPadding) / 2
        );
      })
      .attr("y", function (sum) {
        if (yScale(sum) == height) return height - 6;
        else return yScale(sum) - 6;
      })
      .attr("class", "yAxis")
      .attr("font-size", "25px");
    //y label for translation
    if (document.getElementById("langT").getAttribute("current") === "Nepali") {
      yLabel.text(function (d) {
        var value = formatAsInteger(d3.round(d));
        if (value == 0) return "0";
        else return value.toLocaleString("ne-NP");
      });
    } else {
      yLabel.text(function (d) {
        var value = formatAsInteger(d3.round(d));
        if (value == 0) return "0";
        else return value;
      });
    }
  }
}

function updateBarOnSelect() {
  var mySelect = document.getElementById("selectMode");
  var selected = mySelect.options[mySelect.selectedIndex].value;

  //interchange of the value
  //first value in array is full other is partial Infrastructure damage
  var barChartID = document.getElementById("ID");
  var thisValue = barChartID.getAttribute("otherValue").split(" ");
  var otherValue = barChartID.getAttribute("thisValue").split(" ");
  var sum = [];
  sum[0] = parseInt(thisValue[0]);
  sum[1] = parseInt(thisValue[1]);

  var districtName = barChartID.getAttribute("district");
  //console.log("selection: " + selected + " " + "district: " + districtName + " this value:" + thisValue + " other value:" + otherValue);
  //console.log(sum);

  var basics = setupBarChartBasics();
  var margin = basics.margin,
    width = basics.width,
    height = basics.height,
    colorBar = basics.colorBar,
    barPadding = basics.barPadding;

  subDivision = ["Fully Damaged", "Partially Damaged"];
  //var selectedMode=document.getElementById("selectMode");
  var title;
  if (
    document.getElementById("selectMode").value.localeCompare("Government") == 0
  ) {
    if (document.getElementById("langT").innerHTML === "English") {
      title = " सरकारी  पूर्वाधार क्षति";
    } else {
      title = "Government Infrastructure Damage";
    }
  }
  if (
    document.getElementById("selectMode").value.localeCompare("Private") == 0
  ) {
    if (document.getElementById("langT").innerHTML === "English") {
      title = " निजी  पूर्वाधार क्षति";
    } else {
      title = "Private Infrastructure Damage";
    }
  }

  var xScale = d3.scale.linear().domain([0, sum.length]).range([0, width]);

  var yScale = d3.scale
    .linear()
    .domain([0, d3.max(sum)])
    .range([height, 0]);

  var svg = d3.select("#barChartID svg");
  //svg.exit().remove();

  var plot = svg.datum(sum);
  //data seq death injured fully partially
  //just need to select element no more appending
  plot
    .selectAll("rect")
    .data(sum)
    .transition()
    .duration(750)
    .attr("x", function (sum, i) {
      return xScale(i);
    })
    .attr("width", width / (sum.length + 4) - barPadding)
    .attr("y", function (sum) {
      //happens  if input is 0
      if (yScale(sum) == height) return height; //bring y point to y=0
      else return yScale(sum);
    })
    //.attr("y",function(sum){return sum;})
    .attr("height", function (d) {
      if (yScale(d) == height) return 0;
      else return height - (yScale(d) % height);
      //);
    })
    // .attr("height",function(d){return height;})
    .attr("fill", colorBar)
    .attr("otherValue", otherValue[0] + " " + otherValue[1])
    .attr("thisValue", thisValue[0] + " " + thisValue[1]);

  //add y labels to plot
  var yLabel = plot
    .selectAll("text.yAxis")
    .data(sum)
    .transition()
    .duration(750)
    .attr("text-anchor", "middle")
    //set x position to the left edge of each bar plus half the har width
    .attr("x", function (d, i) {
      return (
        i * (width / sum.length) + (width / (sum.length + 4) - barPadding) / 2
      );
    })
    .attr("y", function (sum) {
      if (yScale(sum) == height) return height - 6;
      else return yScale(sum) - 6;
    })
    .attr("class", "yAxis");
  //y label for translation

  if (document.getElementById("langT").innerHTML === "English") {
    //page in nepali
    plot.selectAll("text.yAxis").text(function (d) {
      var value = formatAsInteger(d3.round(d));
      console.log(value);
      value = value.replace(/\,/g, "");
      if (value == 0) return "०";
      else return parseInt(value).toLocaleString("ne-NP");
      8;
    });
  } else {
    plot.selectAll("text.yAxis").text(function (d) {
      var value = formatAsInteger(d3.round(d));
      if (value == 0) return "0";
      else return value;
    });
  }

  //for x axis the data is diff
  //title
  // console.log(districtName);
  svg
    .selectAll("text.barchartTitle")
    .attr("x", 46)
    .attr("y", 30)
    .transition()
    .duration(750)
    // .attr("text-anchor", "middle")
    .text(title);

  /* svg.selectAll("text.districtname")
     .attr("x", (width + (margin.left-90) + margin.right) / 2)
     .attr("y", 55)
     .transition()
     .duration(750)
     .attr("class", "districtname")
     .attr("text-anchor", "middle")
     .text(districtName)
     ;*/
  //x axis label are same as created no need to update
}

function updateMapOnSelect(selectedTab) {
  // console.log(selectedTab);

  var canvas = d3.select("#map svg");
  var group = canvas.selectAll("g");
  //clearing color
  group.selectAll("path").attr("class", "white");

  var legend_labels;
  var legendTitle = canvas.selectAll("g.legendTitle");
  var legend = canvas.selectAll("g.legend");
  var plotDistricts = group.selectAll("path");

  var hitTab = document.getElementById("noOfHitTab");
  var magnitudeTab = document.getElementById("maxMagnitudeTab");

  var links = document.getElementsByTagName("li");
  if (selectedTab == "noOfHitTab") {
    hitTab.setAttribute("thisValue", "noOfHit");
    hitTab.setAttribute("otherValue", "maxMagnitude");
    magnitudeTab.setAttribute("thisValue", "noOfHit");
    magnitudeTab.setAttribute("otherValue", "maxMagnitude");

    plotDistricts.attr("class", function (d) {
      return quantizeHitIntoColor(d.no);
    });

    if (document.getElementById("langT").innerHTML === "English") {
      legend_labels = ["०", "<५०", "५०-१००", "१००+"];
      legendTitle.data(["कुल भुइचालोको शांख्या (पराकम्पन  सहित)"]);
    } else {
      legend_labels = ["0", "<50", "50-100", "100+"];
      legendTitle.data(["No of Earthquakes and Aftershocks"]);
    }

    links.item(0).style.color = "black";
    links.item(1).style.color = "grey";
    links.item(0).style.borderBottom = "3px solid black";
    links.item(1).style.borderBottom = "3px solid lightgrey";
  }

  if (selectedTab == "maxMagnitudeTab") {
    hitTab.setAttribute("thisValue", "maxMagnitude");
    hitTab.setAttribute("otherValue", "noOfHit");
    magnitudeTab.setAttribute("thisValue", "maxMagnitude");
    magnitudeTab.setAttribute("otherValue", "noOfHit");

    plotDistricts.attr("class", function (d) {
      //console.log(quantizeMaxMagnitudeIntoColor(d.maxHit));
      return quantizeMaxMagnitudeIntoColor(d.maxHit);
    });

    if (document.getElementById("langT").innerHTML === "English") {
      legend_labels = ["०", "४-५", "५-६", "६-७+"];
      legendTitle.data(["अधिकतम्  भुइचालो"]);
    } else {
      legend_labels = ["0", "4-5", "5-6", "6-7+"];
      legendTitle.data(["Maximum Magnitude of Earthquake"]);
    }
    links.item(1).style.color = "black";
    links.item(0).style.color = "grey";
    links.item(1).style.borderBottom = "3px solid black";
    links.item(0).style.borderBottom = "3px solid lightgrey";
  }

  //legend title
  legendTitle.select("text").text(function (d) {
    return d;
  });

  //no need to change legend rec it remains same
  legend.select("text").text(function (d, i) {
    return legend_labels[i];
  });
}

function resetBarChart() {
  //change title to overall
  var titleElement = document.getElementById("districtSelected");
  titleElement.removeChild(titleElement.firstChild);

  if (document.getElementById("langT").getAttribute("current") === "English") {
    titleElement.appendChild(
      titleElement.ownerDocument.createTextNode("Overall")
    );
  } else {
    titleElement.appendChild(
      titleElement.ownerDocument.createTextNode("सम्पुर्ण")
    );
  }

  var title, division, className, thisValue, otherValue;
  var subDivision = [];
  var sum = [];

  var basics = setupBarChartBasics();
  var margin = basics.margin,
    width = basics.width,
    height = basics.height,
    colorBar = basics.colorBar,
    barPadding = basics.barPadding;
  var overallValuesHC = document
    .getElementById("ID")
    .getAttribute("overallValuesHC")
    .split(" ");
  var overallGovtID = document
    .getElementById("ID")
    .getAttribute("overallGovernmentValuesID")
    .split(" ");
  var overallPrivateID = document
    .getElementById("ID")
    .getAttribute("overallPrivateValuesID")
    .split(" ");

  //console.log(overallValuesHC[0]);
  var deaths = parseInt(overallValuesHC[0]);
  var injured = parseInt(overallValuesHC[1]);

  var govtfull = parseInt(overallGovtID[0]);
  var govtpartial = parseInt(overallGovtID[1]);

  //console.log("gvtfull" + govtpartial);

  var prifull = parseInt(overallPrivateID[0]);
  var pripartial = parseInt(overallPrivateID[1]);

  updateBarChart("#barChartHC", "#plotbarChartHC", colorBar);
  updateBarChart("#barChartID", "#plotbarChartID", colorBar);

  function updateBarChart(divId, barChartId, colorBar) {
    if (divId.localeCompare("#barChartHC") == 0) {
      //clear sum array first
      // sum.length=0;
      if (document.getElementById("langT").innerHTML === "English") {
        title = "Human Casualties";
        divison = "Human Causalities";
        subDivision = ["Death", "Injured"];
      } else {
        title = "मानविय क्षति";
        divison = "मानविय क्षति";
        subDivision = ["मृत्यु", "घाइते"];
      }

      sum[0] = deaths;
      sum[1] = injured;
    }
    if (divId.localeCompare("#barChartID") == 0) {
      subDivision = ["Fully Damaged", "Partially Damaged"];
      if (
        document
          .getElementById("selectMode")
          .value.localeCompare("Government") == 0
      ) {
        if (document.getElementById("langT").innerHTML === "English") {
          title = "सरकारी  पूर्वाधार क्षति";
          division = "सरकारी  पूर्वाधार क्षति";
        } else {
          title = "Government Infrastructure Damage";
          division = "Government Infrastructural Damage";
        }

        //  getSum(districtArray, divison, subDivision);
        sum[0] = govtfull;
        sum[1] = govtpartial;
      }
      if (
        document.getElementById("selectMode").value.localeCompare("Private") ==
        0
      ) {
        if (document.getElementById("langT").innerHTML === "English") {
          title = "निजी  पूर्वाधार क्षति";
          division = "निजी  पूर्वाधार क्षति";
        } else {
          title = "Private Infrastructure Damage";
          division = "Private Infrastructural Damage";
        }

        sum[0] = prifull;
        sum[1] = pripartial;
      }
    }

    //console.log(d3.max(sum));
    //console.log(districtArray);

    var xScale = d3.scale.linear().domain([0, sum.length]).range([0, width]);
    var yScale = d3.scale
      .linear()
      .domain([0, d3.max(sum)])
      .range([height, 0]);
    var svg = d3.select(divId + " svg");
    var plot = svg.datum(sum);
    //for x axis the data is diff
    //title
    //data seq death injured fully partially

    //just need to select element no more appending
    plot
      .selectAll("rect")
      .data(sum)
      .transition()
      .duration(750)
      //x and y are point from where plotting begins
      .attr("x", function (d, i) {
        return xScale(i);
      })
      .attr("width", width / (sum.length + 4) - barPadding)
      .attr("y", function (d) {
        //happens  if input is 0
        if (yScale(d) == height) return height; //bring y point to y=0
        else return yScale(d);
      })
      //.attr("y",function(sum){return sum;})
      .attr("height", function (d) {
        if (yScale(d) == height) return 0;
        else return height - (yScale(d) % height);
      })
      // .attr("height",function(d){return height;})
      .attr("fill", colorBar)
      .attr("district", "Overall");

    //add y labels to plot
    var yLabel = plot
      .selectAll("text.yAxis")
      .data(sum)
      .transition()
      .duration(750)
      .attr("text-anchor", "middle")
      //set x position to the left edge of each bar plus half the har width
      .attr("x", function (d, i) {
        return (
          i * (width / sum.length) + (width / (sum.length + 4) - barPadding) / 2
        );
      })
      .attr("y", function (sum) {
        if (yScale(sum) == height) return height - 6;
        else return yScale(sum) - 6;
      })
      .attr("class", "yAxis");
    //y label for translation
    if (document.getElementById("langT").innerHTML === "English") {
      //page is in nepali
      plot.selectAll("text.yAxis").text(function (d) {
        var value = formatAsInteger(d3.round(d));
        //console.log("values",value);
        value = value.replace(/\,/g, "");
        if (value == 0) return "०";
        else return parseInt(value).toLocaleString("ne-NP");
      });
    } else {
      //page is in english
      plot.selectAll("text.yAxis").text(function (d) {
        var value = formatAsInteger(d3.round(d));

        if (value == 0) return "0";
        else return convert(value);
      });
    }

    //console.log(districtName);
    svg.selectAll("text.title").text(title);

    svg.selectAll("text.districtname").text("Overall");

    //x axis label are same as created so no need to be update
  }

  //hide button after change
  document.getElementById("alldistrict").style.visibility = "hidden";
}

var aboutPopup;
function displayPopup() {
  var content;
  if (document.getElementById("langT").innerHTML === "English") {
    content =
      "<div id='popupWrapper'>" +
      "<div id='popupTitle'>" +
      "<h1>नेपालको महाभूकम्प (विसं २०७२ बैसाख १२)</h1>" +
      "<img id='popUpClose' src='image/close_button.png' onclick ='closePopup()'>" +
      "</div>" +
      "<p id='popupContent'>" +
      " विसं २०७२ को महाभूकम्प विसं २०७२ बैसाख १२ गते शनिबार नेपालको प्रमाणिक समय अनुसार ११:५६ (६:११:२६ युटिसि)मा " +
      "लगभग ३४ किमी (२१ माइल) पूर्व-दक्षिणपूर्व बार्पाकलाई केन्द्रविन्दु बनाई ७.८ रेक्टर स्केलको भूकम्प १५ किमी (९.३ माइल) " +
      "गहिराईमा गएको हो ।विसं १९९० को महाभूकम्प पछिको यो सबैभन्दा ठुलो भूकम्प हो । भूकम्पले नेपाल सरकारको प्रारम्भिक " +
      "जानकारी अनुसार नेपालमा मात्रै ५१६२ मानिसको ज्यान गएको छ । एश विसुअलिऐज़तिओन्मा महाभूकम्पले निम्त्याएको मानविय तधा पूर्वाधार क्षति" +
      "देखाइएको छ । " +
      "<a href='https://github.com/silentflutes/map'>Source code.</a>" +
      "</p></div>";
  } else {
    content =
      "<div id='popupWrapper'>" +
      "<div id='popupTitle'>" +
      "<h1>Nepal Earthquake 2015</h1>" +
      "<img id='popUpClose' src='image/close_button.png' onclick ='closePopup()'>" +
      "</div>" +
      "<p id='popupContent'>" +
      " The April 2015 Nepal earthquake killed over 9,000 people and injured more than 23,000. " +
      "The visualization includes total number of Earthquakes (including aftershocks) and maximum magnitude of earthquake in effected district of Nepal. " +
      "The Human casualties and Infrastructure damage in each of the district are displayed in barchart. " +
      "<a href='https://github.com/silentflutes/map'>Source code.</a>" +
      "</p></div>";
  }

  aboutPopup = d3
    .select("body")
    .append("div")
    .attr("class", "popup")
    .html(content);
}

function closePopup() {
  aboutPopup.remove();
}

function changeLanguage() {
  const langT = document.getElementById("langT");
  const isEnglish = langT.getAttribute("current") === "English";
  const about = document.getElementById("about");
  const maptitle = document.getElementsByClassName("maptitle")[0];
  const noOfHitTab = document.getElementById("noOfHitTab");
  const maxMagnitudeTab = document.getElementById("maxMagnitudeTab");
  const alldistrict = document.getElementById("alldistrict");
  const districtSelected = document.getElementById("districtSelected");
  const selectMode = document.getElementById("selectMode");
  const barchartTitles = document.getElementsByClassName("barchartTitle");
  const xAxis = document.getElementsByClassName("xAxis");
  const yAxis = document.getElementsByClassName("yAxis");

  if (isEnglish) {
    langT.setAttribute("current", "Nepali");
    about.innerHTML = "एस बारेमा";
    langT.innerHTML = "English";
    maptitle.innerHTML = "नेपालको महाभूकम्प (विसं २०७२ बैसाख १२)";
    noOfHitTab.innerHTML = "कुल भुइचालोको शांख्या (पराकम्पन सहित)";
    maxMagnitudeTab.innerHTML = "अधिकतम्  भुइचालो";
    alldistrict.value = "सम्पुर्ण जिल्लाहरु";
    districtSelected.innerHTML = "सम्पुर्ण";
    selectMode.options[0].innerHTML = "सरकारी";
    selectMode.options[1].innerHTML = "निजी";
    barchartTitles[0].innerHTML = "मानविय क्षति";
    barchartTitles[1].innerHTML = "पूर्वाधार क्षति";
    xAxis[0].innerHTML = "मृत्यु";
    xAxis[1].innerHTML = "घाइते";
    xAxis[2].innerHTML = "सम्पुर्ण क्षति";
    xAxis[3].innerHTML = " आन्शिक क्षति";

    // Legend
    const selectedTab = noOfHitTab;
    if (selectedTab.getAttribute("thisValue") === "noOfHit") {
      document.getElementById("legendTitleText").innerHTML =
        "कुल भुइचालोको शांख्या (पराकम्पन  सहित)";
      document.getElementById("legendText3").innerHTML = "१००+";
      document.getElementById("legendText2").innerHTML = "५०-१००";
      document.getElementById("legendText1").innerHTML = "<५०";
      document.getElementById("legendText0").innerHTML = "०";
    }
    if (selectedTab.getAttribute("thisValue") === "maxMagnitude") {
      document.getElementById("legendTitleText").innerHTML = "अधिकतम्  भुइचालो";
      document.getElementById("legendText3").innerHTML = "६-७+";
      document.getElementById("legendText2").innerHTML = "५-६";
      document.getElementById("legendText1").innerHTML = "४-५";
      document.getElementById("legendText0").innerHTML = "०";
    }

    // Update yAxis values to Nepali numerals
    for (let i = 0; i < yAxis.length; i++) {
      const value = parseInt(yAxis[i].innerHTML.replace(/\,/g, ""));
      yAxis[i].innerHTML = isNaN(value) ? "" : value.toLocaleString("ne-NP");
    }
  } else {
    langT.setAttribute("current", "English");
    about.innerHTML = "About";
    langT.innerHTML = " नेपाली";
    maptitle.innerHTML = "Nepal Earthquake 2015";
    noOfHitTab.innerHTML = "NUMBER OF EARTHQUAKES/AFTERSHOCKS";
    maxMagnitudeTab.innerHTML = "MAXIMUM MAGNITUDE OF EARTHQUAKE";
    alldistrict.value = "All districts";
    districtSelected.innerHTML = "Overall";
    selectMode.options[0].innerHTML = "Government";
    selectMode.options[1].innerHTML = "Private";
    barchartTitles[0].innerHTML = "Human Causalities";
    barchartTitles[1].innerHTML = "Infrastructure Damage";
    xAxis[0].innerHTML = "Death";
    xAxis[1].innerHTML = "Injured";
    xAxis[2].innerHTML = "Fully Damaged";
    xAxis[3].innerHTML = "Partially Damaged";

    // Legend
    const selectedTab = noOfHitTab;
    if (selectedTab.getAttribute("thisValue") === "noOfHit") {
      document.getElementById("legendTitleText").innerHTML =
        "No of Earthquakes and Aftershocks";
      document.getElementById("legendText3").innerHTML = "100+";
      document.getElementById("legendText2").innerHTML = "50-100";
      document.getElementById("legendText1").innerHTML = "<50";
      document.getElementById("legendText0").innerHTML = "0";
    }
    if (selectedTab.getAttribute("thisValue") === "maxMagnitude") {
      document.getElementById("legendTitleText").innerHTML =
        "Maximum Magnitude of Earthquake";
      document.getElementById("legendText3").innerHTML = "6-7+";
      document.getElementById("legendText2").innerHTML = "5-6";
      document.getElementById("legendText1").innerHTML = "4-5";
      document.getElementById("legendText0").innerHTML = "0";
    }

    // Update yAxis values to English numerals
    for (let i = 0; i < yAxis.length; i++) {
      const value = convert(yAxis[i].innerHTML.replace(/\,/g, ""));
      yAxis[i].innerHTML = isNaN(parseInt(value))
        ? ""
        : parseInt(value).toLocaleString();
    }
  }
}

// Improved convert function using mapping
function convert(str) {
  const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return str.replace(/[०-९]/g, (d) => nepaliDigits.indexOf(d));
}
