queue()
    .defer(d3.json, "/vis2/initialize")
    .await(initialize);

function onClickPCA(e){
$('.nav').children('li').removeClass('active');
$(e.currentTarget).parent().addClass('active');
    queue()
    .defer(d3.json, "/vis2/initialize")
    .await(initialize);
    }

function initialize(error,data){
/*
		var testdata = {
			"random":{
			"test1":123,
			"test2":1354,
		},
		"stratified":{
			"test4":34545,
			"test5": 34343
		}
		}
*/
        enableSplitPlot();
        d3.selectAll("svg")
         .remove();
		var xyRandomData = [];
		//get the random data.
		randomdata = data["random"];
		//console.log(randomdata);
		for(td in randomdata){
		    temp =randomdata[td];
		    xyRandomData.push({
             x: temp[0],
             y: temp[1]
         })
     };
    //console.log(xyRandomData);
    //Render bar for the random data.
	 renderBar('#random_sample',xyRandomData);

    var xyStratifiedData = [];
    //get the stratified data
		stratifieddata = data["stratified"];
		//console.log(stratifieddata);
		for(ts in stratifieddata){
		    temp1=stratifieddata[ts];
		    xyStratifiedData.push({
             x: temp1[0],
             y: temp1[1]
         })
     };
     //console.log(xyStratifiedData);
     //render bar for the stratified data.
	 renderBar('#stratified_sample',xyStratifiedData);
}

function onClickScatterplotMatrixRandom(e){
$('.nav').children('li').removeClass('active');
$(e.currentTarget).parent().addClass('active');
document.getElementById("scattertittle").innerHTML = 'Scatter Plot Matrix - Random Sample';
    queue()
        .defer(d3.json, "/vis2/scatterplotmatrixRandom")
        .await(scatterplotMatrix);
}

function onClickScatterplotMatrixStratified(e){
$('.nav').children('li').removeClass('active');
$(e.currentTarget).parent().addClass('active');
document.getElementById("scattertittle").innerHTML = 'Scatter Plot Matrix - Stratified Sample';
    queue()
        .defer(d3.json, "/vis2/scatterplotmatrixStratified")
        .await(scatterplotMatrix);
}


function scatterplotMatrix(error,input){
console.log(input);
enableSplitPlot();
enableSinglePagePlot('#fullpage2');
        d3.selectAll("svg")
         .remove();
    attr=input["attr"];
    data = input["data"];
    console.log(data);

  // Scatter plot matrix code
  var width = 960,
    size = 230,
    padding = 20;
    svgpadding=50;

var x = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(6);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(6);

var color = d3.scale.category10();


  var domainByTrait = {},
      traits = d3.keys(data[0]).filter(function(d) { return d}),
      n = traits.length;

  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
  });

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);
document.getElementById("matrixcard").style.height = "900px";
  var svg = d3.select("#Scatterplot").append("svg")
      .attr("width", size * n + svgpadding)
      .attr("height", size * n + svgpadding)
    .append("g")
      .attr("transform", "translate(" + svgpadding + "," + svgpadding / 2 + ")");

  svg.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d,i) { return attr[i]; });

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 4)
        .style("fill", function(d) { return color(d.species); });
  }

function cross(a, b) {
  var c = [], n = a.length, m = b.length, i, j;
  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
  return c;
}


}

function onClickMdsEuclidean(e){
$('.nav').children('li').removeClass('active');
$(e.currentTarget).parent().addClass('active');
    queue()
        .defer(d3.json, "/vis2/mds_euclidean")
        .await(mdsEuclidean);
}
function mdsEuclidean(error,data){
        enableSplitPlot();
        d3.selectAll("svg")
         .remove();
         console.log(data);
    randomdata = data["random"];
     plot_scatter('#random_sample',randomdata,'Component 2','Component 1');
    stratifieddata = data["stratified"];
    plot_scatter('#stratified_sample',stratifieddata,'Component 2','Component 1');
}

function onClickMdsCorrelation(e){
$('.nav').children('li').removeClass('active');
$(e.currentTarget).parent().addClass('active');
    queue()
        .defer(d3.json, "/vis2/mds_correlation")
        .await(mdsCorrelation);
}

function mdsCorrelation(error,data){
        enableSplitPlot();
        d3.selectAll("svg")
         .remove();
    randomdata = data["random"];
     plot_scatter('#random_sample',randomdata,'Component 2','Component 1');
    stratifieddata = data["stratified"];
    plot_scatter('#stratified_sample',stratifieddata,'Component 2','Component 1');
}

function onClickScatter(e){
$('.nav').children('li').removeClass('active');
$(e.currentTarget).parent().addClass('active');
    queue()
        .defer(d3.json, "/vis2/scatterplot")
        .await(scatterplot);
}

function scatterplot(error,data){
        //console.log(data);
   /*
        var testdata = {
			"random":[[1,2],[3,4]],
		"stratified"::[[1,6],[9,4]],
		}
		*/
		enableSplitPlot();
	    d3.selectAll("svg")
         .remove();
		randomdata = data["random"];
		//console.log(randomdata);

	 plot_scatter('#random_sample',randomdata,'Principal Component 2','Principal Component 1');

		stratifieddata = data["stratified"];
		//console.log(stratifieddata);
	 plot_scatter('#stratified_sample',stratifieddata,'Principal Component 2','Principal Component 1');
}

function plot_scatter(id,data,ylabel,xlabel){
 var margin = {
         top: 10,
         right: 10,
         bottom: 65,
         left: 80
     },
     width = 800 - margin.left - margin.right,
     height = 300 - margin.top - margin.bottom;
     var x = d3.scale.linear()
              .domain([d3.min(data, function(d) { return d[0]; }), d3.max(data, function(d) { return d[0]; })])
              .range([ 0, width]);

    var y = d3.scale.linear()
    	      .domain([d3.min(data, function(d) { return d[1]; }), d3.max(data, function(d) { return d[1]; })])
    	      .range([ height, 0 ]);

    var chart = d3.select(id)
	.append('svg:svg')
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart')

    var main = chart.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('width', width)
	.attr('height', height)
	.attr('class', 'main')

    // draw the x axis
    var xAxis = d3.svg.axis()
	.scale(x)
	.orient('bottom');

    main.append('g')
	.attr('transform', 'translate(0,' + height + ')')
	.attr('class', 'main axis date')
	.call(xAxis)
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 180)
    .text(xlabel)

    // draw the y axis
    var yAxis = d3.svg.axis()
	.scale(y)
	.orient('left');

    main.append('g')
	.attr('transform', 'translate(0,0)')
	.attr('class', 'main axis date')
	.call(yAxis)
    .append("text")
     .attr("transform", "rotate(-90)")
     .attr("x", -height / 2)
     .attr("dy", "-3em")
     .style("text-anchor", "middle")
     .text(ylabel);

    var g = main.append("svg:g");

    g.selectAll("scatter-dots")
      .data(data)
      .enter().append("svg:circle")
          .attr("cx", function (d,i) { return x(d[0]); } )
          .attr("cy", function (d) { return y(d[1]); } )
          .attr("r", 5);}

function renderBar(id,barData) {
 var margin = {
         top: 10,
         right: 10,
         bottom: 68,
         left: 95,
         adjust: 20
     },
     width = 800 - margin.left - margin.right,
     height = 300 - margin.top - margin.bottom;
     //d3.selectAll("svg")
       //  .remove()
     //console.log(barData);
     var xScale = d3.scale.ordinal()
         .rangeRoundBands([0, width], 0.2, 0.2)
         .domain(barData.map(function(d) {
             return d.x;

         }));

     var yScale = d3.scale.linear()
         .range([height, 0])
         .domain([0, d3.max(barData, function(d) {
             return d.y;
         })]);

     // define x axis and y axis
     var xAxis = d3.svg.axis()
         .scale(xScale)
         .orient("bottom");

     var yAxis = d3.svg.axis()
         .scale(yScale)
         .orient("left");

     var svg = d3.select(id).append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom+margin.adjust)
         .append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.adjust + ")");

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
         .text("Mean Squared loading");

     var bars = svg.selectAll(".bar")
         .data( barData)
         .enter()
         .append("g")

     bars.append("rect")

         .attr("class", "rect")
//         .attr("id", function(d, i) {
//             return "rect" + i;
//         })
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
//             d3.select("#text" + i)
//                 .style("visibility", "visible")
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


         .text(function(d) {
             return d.y;
         })
 }

function onClickIntrinsic(e){
$('.nav').children('li').removeClass('active');
$(e.currentTarget).parent().addClass('active');
    queue()
        .defer(d3.json, "/vis2/intrinsic")
        .await(intrinsic);
}

function intrinsic(error, data) {
        enableSplitPlot();
	    d3.selectAll("svg")
         .remove();
        // console.log(data);
    randomdata = data["random"];
    //console.log(randomdata);
    plotlinear('#random_sample',randomdata,'Eigen Value','Component Number');

    stratifieddata = data["stratified"];
    //console.log(stratifieddata);
    plotlinear('#stratified_sample',stratifieddata,'Eigen Value','Component Number' );

}

function plotlinear(id, data,ylabel,xlabel) {
 var margin = {
         top: 10,
         right: 10,
         bottom: 65,
         left: 180
     },
     width = 500 - margin.left - margin.right,
     height = 300 - margin.top - margin.bottom;

		var xScale = d3.scale.linear().domain([0, data.length]).range([0, width]);
		var yScale = d3.scale.linear().domain([0, d3.max(data)]).range([height, 0]);

		// create a line function that can convert data[] into x and y points
		var line = d3.svg.line()
			// assign the X function to plot our line as we wish
			.x(function(d,i) {
				return xScale(i);
			})
			.y(function(d) {
				return yScale(d);
			})

		     // define x axis and y axis
     var xAxis = d3.svg.axis()
         .scale(xScale)
         .orient("bottom");

     var yAxis = d3.svg.axis()
         .scale(yScale)
         .orient("left");

     var svg = d3.select(id).append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
         .call(xAxis)
         .append("text")
         .attr("text-anchor", "end")
         .attr("x", width)
         .attr("y", height - 180)
         .text(xlabel)
     displacement = '-3em';
     if (xlabel==="K"){
     displacement = '-7em';
     }
     svg.append("g")
         .attr("class", "y axis")
         .call(yAxis)
         .append("text")
         .attr("transform", "rotate(-90)")
         .attr("x", -height / 2)
         .attr("dy", displacement)
         .style("text-anchor", "middle")
         .text(ylabel);

  		svg.append("svg:path").attr("d", line(data));

  	    var lineData = [{"x":0, "y": yScale(1)}, {"x": width, "y": yScale(1)}]

        var func = d3.svg.line()
            .x(function(d) {return d.x;})
            .y(function(d) {return d.y;})
            .interpolate("linear")

        var lineGraph = svg.append('path')
            .attr("d", func(lineData))
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", "none")
}

function onClickKmeans(e){
$('.nav').children('li').removeClass('active');
$(e.currentTarget).parent().addClass('active');
    queue()
    .defer(d3.json, "/vis2/kmeans")
    .await(kmeans);
    }

function kmeans(error,data){
    enableSplitPlot();
    enableSinglePagePlot('#fullpage');
   console.log(data);
   kmeans_data = data["0"];
   console.log(kmeans_data);
 plotlinear('#Kmeans_Elbow',kmeans_data,'Squared Error','K')
}

function enableSplitPlot(){
d3.selectAll('#topcard')
   .style("display","block")
d3.selectAll('#botcard')
   .style("display","block")
d3.selectAll('#fullpage')
   .style("display","none")
   d3.selectAll('#fullpage2')
   .style("display","none")
}

function enableSinglePagePlot(pageid){
d3.selectAll('#topcard')
   .style("display","none")
d3.selectAll('#botcard')
   .style("display","none")
d3.selectAll(pageid)
   .style("display","block")
}

