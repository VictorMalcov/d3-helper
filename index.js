

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
    var margin = createMargin(options);

    // width and height of element that contains chart bars
    var width = calculateWidth(options, margin);
    var height = calculateHeight(options, margin);


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


    drawBackground(svg, options);
    drawHorizontalGridLines(svg, options, margin, width, yScale);

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
        .attr("x", function (d) {
            var textLength = d.label.length * 2;
            return xScale(d.label) + (xScale.bandwidth() / 2) - textLength;
        })
        .attr("y", function (d) { return yScale(d.value) - 4; });
    applyDataLabelStyles(dataLabels, options);

    drawVerticalAxis(g, yScale, options)
    drawHorizontalAxis(g, xScale, options, height);
    drawHorizontalLabel(svg, options, margin, width, height);


    // data legends
    if (options.legends === 'horizontal') {
        var labelsArr = dataset.map(function (d) { return d.label });
        drawHorizontalDataLegends(svg, options, labelsArr, margin, colorScale);
    }
    else if (options.legends === 'vertical') {
        var labelsArr = dataset.map(function (d) { return d.label });
        drawVerticalDataLegends(svg, options, labelsArr, margin, colorScale);
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
    var margin = createMargin(options);

    // width and height of element that contains chart bars
    var width = calculateWidth(options, margin);
    var height = calculateHeight(options, margin);


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
        .rangeRound([0, xScale.bandwidth()]);
    if (isNumber(options.xInnerScale.paddingInner))
        xInnerScale.paddingInner(options.xInnerScale.paddingInner);


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


    drawBackground(svg, options);
    drawHorizontalGridLines(svg, options, margin, width, yScale);

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
    var dataLabels = groupsG
        .selectAll("text")
        .data(function (d) { return d.values })
        .enter()
        .append("text")
        .text(function (d) { return d.value })
        .attr("x", function (d) {
            var textLength = d.label.length * 2;
            return xInnerScale(d.label) + (xInnerScale.bandwidth() / 2) - textLength;
        })
        .attr("y", function (d) { return yScale(d.value) - 4; });
    applyDataLabelStyles(dataLabels, options);

    drawVerticalAxis(g, yScale, options)
    drawHorizontalAxis(g, xScale, options, height);


    // data legends
    if (options.legends === 'horizontal' || !options.legends) {
        var labelsArr = dataset.labels.map(function (d) { return d.label });
        drawHorizontalDataLegends(svg, options, labelsArr, margin, colorScale);
    }
    else if (options.legends === 'vertical') {
        var labelsArr = dataset.labels.map(function (d) { return d.label });
        drawVerticalDataLegends(svg, options, labelsArr, margin, colorScale);
    }
}

function drawStackedColumnChart(options, dataset) {
    let isOptionsValid = areOptionsValid(options);

    if (!isOptionsValid) {
        console.error('drawStackedColumnChart() options are not valid');
        return;
    }

    // set width and height of svg element
    var svg = d3.select('#' + options.elementId);
    svg.attr("width", options.width)
        .attr("height", options.height);

    // set margins
    var margin = createMargin(options);

    // width and height of element that contains chart bars
    var width = calculateWidth(options, margin);
    var height = calculateHeight(options, margin);


    // change shape of incoming dataset
    var shapedData = [];
    var groupLabels = [];
    for (var dataIndex = 0; dataIndex < dataset.data.length; dataIndex++) {
        var dataItem = dataset.data[dataIndex];
        var item = {};
        item.__total = 0;
        item.__label = dataItem.label;
        item.values = [];

        groupLabels.push(dataItem.label);

        var yValueForGroup = 0;
        for (var valueIndex = 0; valueIndex < dataItem.values.length; valueIndex++) {
            item.values.push({
                value: dataItem.values[valueIndex].value,
                yValue: yValueForGroup,
                label: dataItem.values[valueIndex].label,
                groupLabel: dataItem.label
            })
            yValueForGroup += dataItem.values[valueIndex].value;

            // accumulate total 
            if (isNumber(dataItem.values[valueIndex].value)) {
                item.__total += dataItem.values[valueIndex].value;

                if (item.__total.toString().indexOf('.') !== -1) {
                    item.__total = +item.__total.toFixed(1);
                }
            }
        }
        shapedData.push(item);
    }



    var labels = dataset.labels.map(function (d) { return d.label });

    // creating group x-scale
    var xScale = d3.scaleBand()
        .domain(shapedData.map(function (d) { return d.__label }))
        .rangeRound([0, width]);
    // outer padding for x-scale
    if (isNumber(options.xScale.paddingOuter))
        xScale.paddingOuter(options.xScale.paddingOuter);
    // inner padding for x-scale
    if (isNumber(options.xScale.paddingInner))
        xScale.paddingInner(options.xScale.paddingInner);

    // create y-scale
    var yScaleMaxNumber = d3.max(shapedData, function (d) { return d.__total });
    if (options.yAxis.roundToMax === true)
        yScaleMaxNumber = getWholeMaxNumber(yScaleMaxNumber);
    var yScale = d3.scaleLinear()
        .domain([0, yScaleMaxNumber])
        .range([height, 0])
        .nice();

    // creating color scale if needed
    var colorScale = d3.scaleOrdinal()
        .domain(dataset.labels.map(function (d) { return d.label }))
        .range(dataset.labels.map(function (d) { return d.color }));


    drawBackground(svg, options);
    drawHorizontalGridLines(svg, options, margin, width, yScale);

    // this g contains chart elements
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gGroup = g.append("g")
        .selectAll("g")
        .data(shapedData)
        .enter()
        .append("g");


    gGroup.selectAll("rect")
        .data(function (d) { return d.values; })
        .enter()
        .append("rect")
        .attr("x", function (d) { return xScale(d.groupLabel); })
        .attr("y", function (d) { return yScale(d.value + d.yValue); })
        .attr("height", function (d) { return height - yScale(d.value); })
        .attr("fill", function (d) { return colorScale(d.label); })
        .attr("width", xScale.bandwidth());


    var dataLabels = gGroup.selectAll(".d3-stack-label")
        .data(function (d) { return d.values; })
        .enter()
        .append("text")
        .text(function (d) {
            var heightOfRect = height - yScale(d.value);
            return heightOfRect >= 15 ? d.value : "";
        })
        .attr('class', 'd3-stack-label')
        .attr("x", function (d) {
            var textLength = d.groupLabel.length * 2;
            return xScale(d.groupLabel) + (xScale.bandwidth() / 2) - textLength;
        })
        .attr("y", function (d) { return yScale(d.value + d.yValue) + 13 });
    applyDataLabelStyles(dataLabels, options);


    drawVerticalAxis(g, yScale, options)
    drawHorizontalAxis(g, xScale, options, height);


    // data legends
    if (options.legends === 'horizontal' || !options.legends) {
        var labelsArr = dataset.labels.map(function (d) { return d.label });
        drawHorizontalDataLegends(svg, options, labelsArr, margin, colorScale);
    }
    else if (options.legends === 'vertical') {
        var labelsArr = dataset.labels.map(function (d) { return d.label });
        drawVerticalDataLegends(svg, options, labelsArr, margin, colorScale);
    }

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
    var margin = createMargin(options);

    // width and height of element that contains chart bars
    var width = calculateWidth(options, margin);
    var height = calculateHeight(options, margin);

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

    drawBackground(svg, options);
    drawVerticalGridLines(svg, options, margin, height, xScale);

    // this g contains chart elements
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // creating bars
    g.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
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
        .attr("y", function (d) { return yScale(d.label) + (yScale.bandwidth() / 2) + 5; });
    applyDataLabelStyles(dataLabels, options);


    drawVerticalAxis(g, yScale, options)
    drawHorizontalAxis(g, xScale, options, height);
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

    // legends will be drawn at the bottom
    var heightOfLegends = dataset.length * 20; // each line takes about 14 pixels

    // width and height of element that contains chart bars
    var width = options.width - margin.left - margin.right;
    var height = options.height - margin.top - margin.bottom - heightOfLegends;
    var radius = Math.min(width, height) / 2;

    // defining radius for pie chart
    var innerRadius = 0;
    if (isNumber(options.donutWidth) && options.donutWidth > 0)
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


    // drawing legends at the bottom of chart        
    var legendsYScale = d3.scaleBand()
        .domain(dataset.map(function (d) { return d.label }))
        .rangeRound([0, heightOfLegends])
        .padding(0.05);

    // creating g that contains all legends
    var gLegends = svg.append("g")
        .attr('class', 'd3-pie-legends')
        .attr("transform", "translate(" + 0 + "," + (options.height - heightOfLegends) + ")");

    // creating g for each legen
    var gLegend = gLegends.selectAll('g')
        .data(dataset)
        .enter()
        .append('g')
        .attr("transform", function (d) {
            return "translate(" + 0 + "," + legendsYScale(d.label) + ")";
        });

    // creating text for each legend
    gLegend.append('text')
        .text(function (d) { return d.label })
        .attr('x', 25)
        .attr('y', 13);
    // creating rect with color    
    gLegend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', function (d) {
            return colorScale(d.label);
        });

}

function drawBackground(svg, options) {
    // making background if needed
    if (isSet(options.backgroundColor) && options.backgroundColor.length > 0) {
        svg.append('rect')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", options.width)
            .attr("height", options.height)
            .attr("fill", options.backgroundColor);
    }
}

function drawHorizontalGridLines(svg, options, margin, width, yScale) {
    gridLineTicks = isNumber(options.yAxis.ticks)
        ? yScale.ticks(options.yAxis.ticks)
        : yScale.ticks();
    var gGrid = svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr('class', function () {
            return isSet(options.grid.className) ? options.grid.className : "";
        });
    var gGridLines = gGrid.selectAll('line')
        .data(gridLineTicks)
        .enter()
        .append("line")
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', function (d) { return yScale(d); })
        .attr('y2', function (d) { return yScale(d); })
        .attr('stroke', function () { return isSet(options.grid.stroke) ? options.grid.stroke : '#e2e2e2'; });
}

function drawVerticalGridLines(svg, options, margin, height, xScale) {
    gridLineTicks = isNumber(options.xAxis.ticks)
        ? xScale.ticks(options.xAxis.ticks)
        : xScale.ticks();
    var gGrid = svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr('class', function () {
            return isSet(options.grid.className) ? options.grid.className : "";
        });
    var gGridLines = gGrid.selectAll('line')
        .data(gridLineTicks)
        .enter()
        .append("line")
        .attr('x1', function (d) { return xScale(d); })
        .attr('x2', function (d) { return xScale(d); })
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', function () { return isSet(options.grid.stroke) ? options.grid.stroke : '#e2e2e2'; });
}

function drawVerticalAxis(g, yScale, options) {
    var axisLeft = d3.axisLeft(yScale);
    if (isNumber(options.yAxis.ticks))
        axisLeft.ticks(options.yAxis.ticks);
    g.append("g")
        .call(axisLeft);
}

function drawHorizontalAxis(g, xScale, options, height) {
    if (options.xAxis.visible !== false) {
        var axisBottom = d3.axisBottom(xScale);
        if (isNumber(options.xAxis.ticks))
            axisBottom.ticks(options.xAxis.ticks);
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(axisBottom);
    }
}

function drawHorizontalLabel(svg, options, margin, width, height) {
    // horizontal label
    if (isSet(options.xLabel)) {

        var yPosition = height + margin.top + 15; // constant number is added because text is drawm from bottom to top
        if (options.xAxis.visible !== false) {
            yPosition += 20;
        }

        var xPosition = (width / 2) - (options.xLabel.length * 2);

        svg.append('text')
            .text(options.xLabel)            
            .attr('x', xPosition)
            .attr('y', yPosition)
            .attr('font-size', 12)
            .attr('fill', '#000');
    }
}

function drawHorizontalDataLegends(svg, options, labelsArr, margin, colorScale) {
    // data legends will be drawn at the bottom of SVG

    var legendsTextScale = d3.scaleOrdinal()
        .range(labelsArr)
        .domain(d3.range(0, labelsArr.length));

    var legendsBandScale = d3.scaleBand()
        .domain(labelsArr)
        .rangeRound([0, calculateWidth(options, margin)]);


    var gLegendY = options.height - 15;

    var gLegends = svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + gLegendY + ")");

    var gLegendsRects = gLegends.selectAll("rect")
        .data(labelsArr)
        .enter()
        .append('g')
        .attr('class', 'd3-legends')
        .attr("transform", function (d) { return "translate(" + legendsBandScale(d) + "," + 0 + ")"; });

    gLegendsRects.append('text')
        .text(function (d, i) { return legendsTextScale(i) })
        .attr('x', 12)
        .attr('y', 9)
        .attr('font-size', 12)
        .attr('fill', '#000');
    gLegendsRects.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', function (d, i) { return colorScale(d); });
}

function drawVerticalDataLegends(svg, options, labelsArr, margin, colorScale) {
    var legendsTextScale = d3.scaleOrdinal()
        .range(labelsArr)
        .domain(d3.range(0, labelsArr.length));

    var legendsBandScale = d3.scaleBand()
        .domain(labelsArr)
        .rangeRound([0, labelsArr.length * 15]);

    var y = options.height - (labelsArr.length * 15);
    var gLegends = svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + y + ")");

    var gLegendsItem = gLegends.selectAll("g")
        .data(labelsArr)
        .enter()
        .append('g')
        .attr('class', 'd3-legends')
        .attr("transform", function (d, i) { return "translate(0, " + legendsBandScale(d) + ")"; });

    gLegendsItem.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', function (d, i) { return colorScale(d); });
    gLegendsItem.append('text')
        .text(function (d, i) { return legendsTextScale(i) })
        .attr('x', 15)
        .attr('y', 10)
        .attr('fill', '#000')
        .attr('font-size', 12);
}

function applyDataLabelStyles(dataLabels, options) {
    dataLabels
        .attr('font-family', function () {
            return isSet(options.dataPoint.fontFamily) ? options.dataPoint.fontFamily : 'sans-serif';
        })
        .attr('font-size', function () {
            return isSet(options.dataPoint.fontSize) ? options.dataPoint.fontSize : 12;
        })
        .attr('fill', function () {
            return isSet(options.dataPoint.color) ? options.dataPoint.color : 'black';
        })
        .attr('font-weight', function () {
            return (isSet(options.dataPoint.fontWeight) && options.dataPoint.fontWeight.length > 0)
                ? options.dataPoint.fontWeight
                : '';
        });
}

function createMargin(options) {
    options = options || {};
    var margin = { top: 20, right: 15, bottom: 25, left: 25 }; // default margins
    if (options.margin) {
        margin.top = isNumber(options.margin.top) ? options.margin.top : margin.top;
        margin.right = isNumber(options.margin.right) ? options.margin.right : margin.right;
        margin.bottom = isNumber(options.margin.bottom) ? options.margin.bottom : margin.bottom;
        margin.left = isNumber(options.margin.left) ? options.margin.left : margin.left;
    }
    return margin;
}

function calculateWidth(options, margin) {
    return options.width - margin.left - margin.right;
}

function calculateHeight(options, margin) {
    return options.height - margin.top - margin.bottom;
}

function areOptionsValid(options) {
    if (typeof (options) === 'undefined' || options === null)
        return false;

    let valid = true;

    // create empty objects to avoit errors when accessing object fields
    options.xScale = options.xScale || {};
    options.xInnerScale = options.xInnerScale || {};
    options.xAxis = options.xAxis || {};
    options.yAxis = options.yAxis || {};
    options.dataPoint = options.dataPoint || {};
    options.grid = options.grid || {};

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

    if (num >= wholeNum)
        return (Math.floor(num / wholeNum) * wholeNum) + wholeNum;
    else
        return num;

}