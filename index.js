

function drawColumnChart(options, dataset) {
    let isOptionsValid = areOptionsValid(options);

    if (!isOptionsValid) {
        console.error('drawColumnChart() options are not valid');
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
    var yScaleMaxNumber = d3.max(dataset, function (d) { return d.value });
    if (options.yAxis.roundToMax === true)
        yScaleMaxNumber = getWholeMaxNumber(yScaleMaxNumber);
    var yScale = d3.scaleLinear()
        .domain([0, yScaleMaxNumber])
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

function drawGroupedColumnChart(options, dataset) {
    let isOptionsValid = areOptionsValid(options);

    if (!isOptionsValid) {
        console.error('drawGroupedColumnChart() options are not valid');
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


    // get array of labels from groups
    var groupLabels = [];
    for (var groupLabelIndex = 0; groupLabelIndex < dataset.data.length; groupLabelIndex++) {
        groupLabels.push(dataset.data[groupLabelIndex].label);
    }


    // creating group x-scale
    var xScale = d3.scaleBand()
        .domain(dataset.data.map(function (d) { return d.label }))
        .rangeRound([0, width]);
    // outer padding for x-scale
    if (isNumber(options.xScale.paddingOuter))
        xScale.paddingOuter(options.xScale.paddingOuter);
    // inner padding for x-scale
    if (isNumber(options.xScale.paddingInner))
        xScale.paddingInner(options.xScale.paddingInner);


    // create group inner x-scale    
    var xInnerScale = d3.scaleBand()
        .domain(dataset.labels.map(function (d) { return d.label }))
        .rangeRound([0, xScale.bandwidth()])
        .padding(0.05); // todo: move this to configuration object

    // create y-scale
    var yScaleMaxNumber = d3.max(dataset.data, function (d) {
        return d3.max(d.values, function (d) { return d.value; });
    });
    if (options.yAxis.roundToMax === true)
        yScaleMaxNumber = getWholeMaxNumber(yScaleMaxNumber);
    var yScale = d3.scaleLinear()
        .domain([0, yScaleMaxNumber])
        .rangeRound([height, 0])
        .nice();

    // creating color scale if needed
    var colorScale = d3.scaleOrdinal()
        .domain(dataset.labels.map(function (d) { return d.label }))
        .range(dataset.labels.map(function (d) { return d.color }));


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

    var groupsG = g.append("g")
        .selectAll("g")
        .data(dataset.data)
        .enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + xScale(d.label) + ",0)"; });
    // creating rects for values in single group
    var groupRects = groupsG
        .selectAll("rect")
        .data(function (d) { return d.values })
        .enter()
        .append("rect")
        .attr("x", function (d) { return xInnerScale(d.label); })
        .attr("y", function (d) { return yScale(d.value); })
        .attr("width", xInnerScale.bandwidth())
        .attr("height", function (d) { return height - yScale(d.value); })
        .attr("fill", function (d) { return colorScale(d.label); });
    // creating texts for values in single group
    var groupTexts = groupsG
        .selectAll("text")
        .data(function (d) { return d.values })
        .enter()
        .append("text")
        .text(function (d) { return d.value })
        .attr("x", function (d) { return xInnerScale(d.label) + (xInnerScale.bandwidth() / 2) - 5; })
        .attr("y", function (d) { return yScale(d.value) - 4; })
        .attr('fill', function (d) { return 'black' })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px");





    // horizontal axis
    if (options.xAxis.visible !== false) {
        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));
    }

    // vertical axes and ticks
    var axisLeft = d3.axisLeft(yScale);
    if (isNumber(options.yAxis.ticks))
        axisLeft.ticks(options.yAxis.ticks);
    g.append("g")
        .attr("class", "d3-axix-y")
        .call(axisLeft);



    // showing horizontal legends
    var legendsTextScale = d3.scaleOrdinal()
        .range(dataset.labels.map(function (d) { return d.label }))
        .domain(d3.range(0, dataset.labels.length));

    var legendsBandScale = d3.scaleBand()
        .domain(dataset.labels.map(function (d) { return d.label }))
        .rangeRound([0, width]);
    var gLegendY = height + margin.top + 30;
    var gLegends = svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + gLegendY + ")");

    var gLegendsRects = gLegends.selectAll("rect")
        .data(dataset.labels)
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

function drawBarChart(options, dataset) {
    let isOptionsValid = areOptionsValid(options);

    if (!isOptionsValid) {
        console.error('drawBarChart() options are not valid');
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
    var xScaleMaxNumber = d3.max(dataset, function (d) { return d.value }); // get the max number from dataset
    if (options.xAxis.roundToMax === true)
        xScaleMaxNumber = getWholeMaxNumber(xScaleMaxNumber);
    var xScale = d3.scaleLinear()
        .domain([0, xScaleMaxNumber])
        .range([0, width]);

    // creating y-scale
    var yScale = d3.scaleBand()
        .domain(dataset.map(function (d) { return d.label }))
        .rangeRound([height, 0]);
    // outer padding for y-scale
    if (isNumber(options.yScale.paddingOuter))
        yScale.paddingOuter(options.yScale.paddingOuter);
    // inner padding for y-scale
    if (isNumber(options.yScale.paddingInner))
        yScale.paddingInner(options.yScale.paddingInner);


    // creating color scale
    var colorScale = d3.scaleOrdinal()
        .domain(dataset.map(function (d) { return d.label }))
        .range(dataset.map(function (d) { return d.color }));


    // making vertical grid lines
    var xGridLines = function () {
        if (isNumber(options.xAxis.ticks))
            return d3.axisBottom(xScale).ticks(options.xAxis.ticks);
        else
            return d3.axisBottom(xScale);
    };
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .attr("class", "d3-grid")
        .call(xGridLines().tickFormat("").tickSizeInner([-height]));


    // this g contains chart elements
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // creating bars
    g.selectAll(".d3-bar")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("class", "d3-bar")
        .attr("x", 0)
        .attr("y", function (d) { return yScale(d.label) })
        .attr("height", yScale.bandwidth())
        .attr("width", function (d) { return xScale(d.value); })
        .attr("fill", function (d) { return colorScale(d.label); });

    // building data point labels
    var dataLabels = g.selectAll('text')
        .data(dataset)
        .enter()
        .append("text")
        .text(function (d) { return d.value; })
        .attr("text-anchor", "middle")
        .attr("x", function (d) { return xScale(d.value) + 10 })
        .attr("y", function (d) { return yScale(d.label) + (yScale.bandwidth() / 2) + 5; })
        .attr('fill', function (d) { return 'black' })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px");


    // horizontal axis
    if (options.xAxis.visible !== false) {
        var axisBottom = d3.axisBottom(xScale);
        if (isNumber(options.xAxis.ticks))
            axisBottom.ticks(options.xAxis.ticks);
        g.append("g")
            .attr("class", "d3-axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisBottom);
    }

    // vertical axis
    var axisLeft = d3.axisLeft(yScale);
    g.append("g")
        .attr("class", "d3-axix-y")
        .call(axisLeft);



}

function drawPieChart(options, dataset) {
    let isOptionsValid = areOptionsValid(options);

    if (!isOptionsValid) {
        console.error('drawPieChart() options are not valid');
        return;
    }

    // set width and height of svg element
    var svg = d3.select('#' + options.elementId);
    svg.attr("width", options.width)
        .attr("height", options.height);

    // set margins
    var margin = { top: 0, right: 0, bottom: 0, left: 0 }; // default margins
    if (options.margin) {
        margin.top = isNumber(options.margin.top) ? options.margin.top : margin.top;
        margin.right = isNumber(options.margin.right) ? options.margin.right : margin.right;
        margin.bottom = isNumber(options.margin.bottom) ? options.margin.bottom : margin.bottom;
        margin.left = isNumber(options.margin.left) ? options.margin.left : margin.left;
    }

    // width and height of element that contains chart bars
    var width = options.width - margin.left - margin.right;
    var height = options.height - margin.top - margin.bottom;
    var radius = Math.min(width, height) / 2;

    // defining radius for pie chart
    var innerRadius = 0;
    if(isNumber(options.donutWidth) && options.donutWidth > 0)
        innerRadius = radius - options.donutWidth;
    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(innerRadius);

    // define function to create slices for pie chart
    var pie = d3.pie()
        .sort(null) // disable sorting, since dataset should be sorted in correct way
        .value(function (d) { return d.value; });

    // drawing labels for each slice
    var labelsPadding = isNumber(options.labelPadding) ? options.labelPadding : 0;
    var label = d3.arc()
        .outerRadius(radius - 17 - labelsPadding)
        .innerRadius(radius - 17 - labelsPadding);

    // creating color scale
    var colorScale = d3.scaleOrdinal()
        .domain(dataset.map(function (d) { return d.label }))
        .range(dataset.map(function (d) { return d.color }));

    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var gPie = g.selectAll(".d3-arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "d3-arc");

    gPie.append("path")
        .attr("d", arc)
        .attr("fill", function (d) { return colorScale(d.data.label); });

    gPie.append("text")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function (d) { return d.value; });
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

function getWholeMaxNumber(num) {
    var len = Math.floor(num).toString().length;
    var wholeNum = 1;
    switch (len) {
        case 2:
            wholeNum = 10;
            break;
        case 3:
            wholeNum = 100;
            break;
        case 4:
            wholeNum = 1000;
            break;
        case 5:
            wholeNum = 10000;
            break;
        case 6:
            wholeNum = 100000;
            break;
        case 7:
            wholeNum = 1000000;
            break;
        case 8:
            wholeNum = 10000000;
            break;
        case 9:
            wholeNum = 100000000;
            break;
    }

    return (Math.floor(num / wholeNum) * wholeNum) + wholeNum;

}