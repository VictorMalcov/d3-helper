

function drawBarChart(options, dataset) {
    let isOptionsValid = isBarOptionsValid(options);

    if (!isOptionsValid) {
        console.error('barChart() options are not valid');
        return;
    }

    // set width and height of svg element
    var svg = d3.select('#' + options.elementId);
    svg.attr("width", options.width)
        .attr("height", options.height);

    // set margins
    var margin = { top: 15, right: 15, bottom: 25, left: 25 }; // default margins
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
        .domain(d3.range(dataset.length))
        .rangeRound([0, width]);
    // outer padding for x-scale
    if (isNumber(options.xScale.paddingOuter))
        xScale.paddingOuter(options.xScale.paddingOuter);
    // inner padding for x-scale
    if (isNumber(options.xScale.paddingInner))
        xScale.paddingInner(options.xScale.paddingInner);

    // creating y-scale
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset)])
        .range([height, 0]);

    // creating color scale if needed
    var colorScale = null;
    if (options.colors && isArray(options.colors)) {
        colorScale = d3.scaleOrdinal()
            .range(options.colors)
            .domain(d3.range(0, dataset.length));
    }



    // making horizontal grid lines
    var yGridLines = function () { return d3.axisLeft(yScale) };    
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "d3-grid")
        .call(yGridLines().ticks(4).tickSize(-width).tickFormat(""));


    // this g contains chart elements
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var rects = g.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", function (d, i) { return xScale(i); })
        .attr("y", function (d) { return yScale(d) })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) { return height - yScale(d); });
    // using color scale if colors are passed in
    if (colorScale !== null) {
        rects.attr("fill", function (d, i) { return colorScale(i); });
    }


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
    if(isSet(options.xLabel)) {
        var labelY = height + 20;
        if(options.xAxis.visible !== false) {
            labelY += 20;
        }

        var labelX = (width / 2) - (options.xLabel.length * 2);

        svg.append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr('class', 'd3-x-label')
            .append('text')
            .text(options.xLabel)
            .attr('x', labelX)
            .attr('y', labelY);            
            
    }
}

function isBarOptionsValid(options) {
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