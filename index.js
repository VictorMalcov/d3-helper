

function drawColumnChart(options, dataset) {
    let isOptionsValid = areOptionsValid(options);

    if (!isOptionsValid) {
        console.error('barChart() options are not valid');
        return;
    }

    // set width and height of svg element
    var svg = d3.select('#' + options.elementId);
    svg.attr("width", options.width)
        .attr("height", options.height);

    // set margins
    var margin = { top: 20, right: 15, bottom: 25, left: 25 }; // default margins
    if (options.margin) {
        margin.top = isNumber(options.margin.top) ? options.margin.top : margin.top;
        margin.right = isNumber(options.margin.right) ? options.margin.right : margin.right;
        margin.bottom = isNumber(options.margin.bottom) ? options.margin.bottom : margin.bottom;
        margin.left = isNumber(options.margin.left) ? options.margin.left : margin.left;
    }

    // width and height of element that contains chart bars
    var width = options.width - margin.left - margin.right;
    var height = options.height - margin.top - margin.bottom;


    // creating x-scale
    var xScale = d3.scaleBand()
        .domain(dataset.map(function (d) { return d.label }))
        .rangeRound([0, width]);
    // outer padding for x-scale
    if (isNumber(options.xScale.paddingOuter))
        xScale.paddingOuter(options.xScale.paddingOuter);
    // inner padding for x-scale
    if (isNumber(options.xScale.paddingInner))
        xScale.paddingInner(options.xScale.paddingInner);

    // creating y-scale
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function (d) { return d.value })])
        .range([height, 0]);

    // creating color scale if needed
    var colorScale = d3.scaleOrdinal()
        .domain(dataset.map(function (d) { return d.label }))
        .range(dataset.map(function (d) { return d.color }));



    // making horizontal grid lines
    var yGridLines = function () {
        if (isNumber(options.yAxis.ticks))
            return d3.axisLeft(yScale).ticks(options.yAxis.ticks);
        else
            return d3.axisLeft(yScale);
    };
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "d3-grid")
        .call(yGridLines().tickSize(-width).tickFormat(""));


    // this g contains chart elements
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // building rect objects
    var rects = g.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", function (d) { return xScale(d.label); })
        .attr("y", function (d) { return yScale(d.value) })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) { return height - yScale(d.value); })
        .attr("fill", function (d) { return colorScale(d.label); });


    // building data point labels
    var dataLabels = g.selectAll('text')
        .data(dataset)
        .enter()
        .append("text")
        .text(function (d) { return d.value; })
        .attr("text-anchor", "middle")
        .attr("x", function (d) { return xScale(d.label) + (xScale.bandwidth() / 2) - 5; })
        .attr("y", function (d) { return yScale(d.value) - 4; })
        .attr('fill', function (d) { return 'black' })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px");


    // vertical axes and ticks
    var axisLeft = d3.axisLeft(yScale);
    if (isNumber(options.yAxis.ticks))
        axisLeft.ticks(options.yAxis.ticks);
    g.append("g")
        .attr("class", "d3-axix-y")
        .call(axisLeft);


    // horizontal axis
    if (options.xAxis.visible !== false) {
        g.append("g")
            .attr("class", "d3-axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));
    }


    // horizontal label
    if (isSet(options.xLabel)) {

        var yPosition = height + margin.top + 15; // constant number is added because text is drawm from bottom to top
        if (options.xAxis.visible !== false) {
            yPosition += 20;
        }

        var xPosition = (width / 2) - (options.xLabel.length * 2);

        svg.append('text')
            .text(options.xLabel)
            .attr('class', 'd3-x-label')
            .attr('x', xPosition)
            .attr('y', yPosition);
    }

    // horizontal legends
    if (options.labelsBottom === true) {
        var legendsTextScale = d3.scaleOrdinal()
            .range(dataset.map(function (d) { return d.label }))
            .domain(d3.range(0, dataset.length));

        var legendsBandScale = d3.scaleBand()
            .domain(dataset.map(function (d) { return d.label }))
            .rangeRound([0, width]);


        var gLegendY = height + margin.top + 10;
        if (isSet(options.xLabel))
            gLegendY += 20;

        var gLegends = svg.append('g')
            .attr("transform", "translate(" + margin.left + "," + gLegendY + ")");

        var gLegendsRects = gLegends.selectAll("rect")
            .data(dataset)
            .enter()
            .append('g')
            .attr('class', 'd3-legends')
            .attr("transform", function (d, i) { return "translate(" + legendsBandScale(d.label) + "," + 0 + ")"; });

        gLegendsRects.append('text')
            .text(function (d, i) { return legendsTextScale(i) })
            .attr('x', 12)
            .attr('y', 9);
        gLegendsRects.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', function (d, i) {
                return colorScale(d.label);
            });

    }
}

function areOptionsValid(options) {
    if (typeof (options) === 'undefined' || options === null)
        return false;

    let valid = true;

    // create empty objects to avoit errors when accessing object fields
    options.xScale = options.xScale || {};
    options.xAxis = options.xAxis || {};
    options.yAxis = options.yAxis || {};

    // element id
    if (!isSet(options.elementId)) {
        valid = false;
        console.error('bar options is missing element id');
    }

    // width
    if (!isNumber(options.width)) {
        valid = false;
        console.error('bar options is missing width');
    }
    // height
    if (!isNumber(options.height)) {
        valid = false;
        console.error('bar options is missing height');
    }

    return valid;
}

// returns true if value is number
function isNumber(value) {
    if (typeof (value) !== 'undefined' && value !== null)
        return !isNaN(value);

    return false;
}

function isSet(value) {
    return typeof (value) !== 'undefined' && value !== null;
}

function isArray(value) {
    if (typeof (value) !== 'undefined' && value !== null) {
        return typeof (value) === 'object' && typeof (value.length) !== 'undefined';
    }

    return false;
}