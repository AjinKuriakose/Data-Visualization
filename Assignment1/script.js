 var cloneData = [];
 var selection ="Height";
 var binSize = 5;
 var ischoicePie = false;
 var margin = {
         top: 50,
         right: 50,
         bottom: 50,
         left: 50
     },
     width = 960 - margin.left - margin.right,
     height = 500 - margin.top - margin.bottom;

//function to read the Data from the csv file.	
 function getData() {
     d3.csv("baseball_data.csv", function(error, data) {
         createHist(selection, binSize, data);
     })
 }
 
//function to filter and format/modify the data as per the requirement. 
 //arg1 -Selected attribute from drop down, arg2 -- binSize , arg3 - formated data from csv
 function createHist(arg1, arg2, arg3) {
     var histVar = [];
     arg3.forEach(function(d) {
         histVar.push(+d[arg1]);
     })
     cloneData = arg3;
     var histogram = d3.layout.histogram()
         .bins(arg2)
         (histVar);
     //console.log(arg1);
     var xyData = [];

     histogram.forEach(function(d) {
         xyData.push({
             x: "" + (d.x).toFixed(3) + " - " + (d.x + d.dx).toFixed(3),
             y: d.y
         })
     });
     if (ischoicePie) {
         renderPie(xyData);
     } else {
         renderBar(xyData);
     }
 }

 //function to render the bar graphs based on the formatted data.
 function renderBar(csvData) {

     d3.selectAll("svg")
         .remove()
     //console.log(csvData);
     var xScale = d3.scale.ordinal()
         .rangeRoundBands([0, width], 0.2, 0.2)
         .domain(csvData.map(function(d) {
             return d.x;

         }));

     var yScale = d3.scale.linear()
         .range([height, 0])
         .domain([0, d3.max(csvData, function(d) {
             return d.y;
         })]);

     // define x axis and y axis
     var xAxis = d3.svg.axis()
         .scale(xScale)
         .orient("bottom");

     var yAxis = d3.svg.axis()
         .scale(yScale)
         .orient("left");

     var svg = d3.select("body").append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
         .call(xAxis)
         .selectAll("text")
         .attr("dx", "-.8em")
         .attr("dy", ".25em")
         .attr("transform", "rotate(-30)")
         .style("text-anchor", "end")
         .attr("font-size", "10px");

     svg.append("g")
         .attr("class", "y axis")
         .call(yAxis)
         .append("text")
         .attr("transform", "rotate(-90)")
         .attr("x", -height / 2)
         .attr("dy", "-3em")
         .style("text-anchor", "middle")
         .text("Frequency");

     var bars = svg.selectAll(".bar")
         .data(csvData)
         .enter()

         .append("g")

     bars.append("rect")

         .attr("class", "rect")
         .attr("id", function(d, i) {
             return "rect" + i;
         })
         .on("mouseover", function(d, i) {
             d3.select(this)
                 .attr("width", xScale.rangeBand() + 6)
                 .attr("x", function(d) {
                     return xScale(d.x) - 3;
                 })
                 .attr("y", function(d) {
                     return yScale(d.y) - 10;
                 })
                 .attr("height", function(d) {
                     return height + 10 - yScale(d.y)
                 })
             d3.select("#text" + i)
                 .style("visibility", "visible")
         })
         .on("mouseout", function(d, i) {
             d3.select(this)
                 .attr("width", xScale.rangeBand())
                 .attr("x", function(d) {
                     return xScale(d.x);
                 })
                 .attr("y", function(d) {
                     return yScale(d.y);
                 })
                 .attr("height", function(d) {
                     return height - yScale(d.y)
                 })
             d3.select("#text" + i)
                 .style("visibility", "hidden")
            // console.log("text" + i)
         })
         .on("click", function(d) {
             ischoicePie = true;
             renderPie(csvData);
         })
         .attr({
             "x": function(d) {
                 return xScale(d.x);
             },
             "y": function(d) {
                 return yScale(d.y);
             },
             "width": xScale.rangeBand(),
             "height": function(d) {
                 return height - yScale(d.y);
             }
         })

         .attr("fill", "red")

         .style("fill", function(d, i) {
             return 'rgb(10, 50, ' + ((i * 30) + 100) + ')'
         })
         .transition()
         .ease(d3.easeLinear)
         .duration(2000)
     //.on("mouseover", hoverBar(this.d.x);

     bars.append("text")
         .attr("id", function(d, i) {
             return "text" + i;
         })
         .attr("x", function(d) {
             return xScale(d.x) + xScale.rangeBand() / 2;
         })
         .attr("y", function(d) {
             return yScale(d.y) - 15;
         })
         .attr("dy", "2px")
         .attr("fill", "red")
         .attr("text-anchor", "middle")
         .style("visibility", "hidden")
         /*  .on("mouseover", function() {
            d3.select(this)
			.style("visibility","visible")
			console.log(this)
		 })
		 .on("mouseout", function(){
			 d3.select(this)
			 .style("visibility","hidden")
		 })
*/
         .text(function(d) {
             return d.y;
         })
 }

 ////function to render the pie chart based on the formatted data.
 function renderPie(csvData) {
     d3.selectAll("svg")
         .remove()

     var svg = d3.select("body").append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform", "translate(" + 520 + "," + 250 + ")");


     var radius = 250;

     var color = d3.scale.ordinal()
         .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

     var arc = d3.svg.arc()
         .outerRadius(radius - 10)
         .innerRadius(0);
		      
	var hoverArc = d3.svg.arc()
         .outerRadius(radius-3)
         .innerRadius(0);

     var labelArc = d3.svg.arc()
         .outerRadius(radius - 60)
         .innerRadius(radius - 60);

     var pie = d3.layout.pie()
         .sort(null)
         .value(function(d) {
             return d.y;
         });

    // console.log(csvData);

     var g = svg.selectAll(".arc")
         .data(pie(csvData))
         .enter().append("g")
         .attr("class", "arc");

     g.append("path")
         .attr("d", arc)
		 .attr("id", function(d, i) {
             return "path" + i;
         })
         .style("fill", function(d) {
             return color(d.data.y);
         })
         .on("click", function(d) {
             ischoicePie = false;
             renderBar(csvData);
         })
		 .on("mouseover", function(d, i) {
             d3.select(this)
			 .attr("d",hoverArc)
           /*  d3.select("#pieText" + i)
                 .style("visibility", "visible")*/
         })
         .on("mouseout", function(d, i) {
             d3.select(this)
			.attr("d",arc)
			/*d3.select("#pieText" + i)
                 .style("visibility", "hidden")*/
             //console.log("text" + i)
         })
         .transition()
         .ease(d3.easeLinear)
         .duration(2000)
         .attrTween("d", pieTween);

     g.append("text")
         .transition()
         .ease(d3.easeLinear)
         .duration(2000)
		 .attr("id",function(d,i){
			 return "pieText"+i;
		 })
         .attr("transform", function(d) {
             return "translate(" + labelArc.centroid(d) + ")";
         })
         .text(function(d) {
             return d.data.x;
         })
		 .attr("fill","black")
		 .style("visibility","visible")


     //console.log("inside Pie")


     function pieTween(b) {
         b.innerRadius = 0;
         var i = d3.interpolate({
             startAngle: 0,
             endAngle: 0
         }, b);
         return function(t) {
             return arc(i(t));
         };
     }
 }

 //function  to implement the choice list in the page.
 function set_attribute(choice) {
    // console.log(d);
	 selection = choice;
     d3.selectAll("svg")
         .remove()
     createHist(choice, binSize, cloneData);
 }
 
 //function to adjust the bin width/size based on mouse movement.
 function adjustBin(event){
	 //console.log(event)
	var x = event.clientX;
    var y = event.clientY;
    var coords = "X coords: " + x + ", Y coords: " + y;
	console.log(x);
	binSize=Math.round(6000/x);
	//console.log(binSize);
	 d3.selectAll(".box")
	 .text("Number of Bins :" + binSize)
	 .attr("text-anchor", "middle")
	 .on("mouseout", function(d, i){
		 d3.selectAll(".box")
			.text("Slide your mouse here to change the number of Bins");
	 })
	 
	 
	 if(cloneData !=null)
	 {
		 createHist(selection,binSize,cloneData);
	 }
 }
 getData();