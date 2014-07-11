var $graphic = $('#graphic');
var graphic_data_url = 'data.csv';
var graphic_data;
var graphic_aspect_width = 16;
var graphic_aspect_height = 9;
var mobile_threshold = 500;
var pymChild = null;

function drawGraphic(container_width) {
    if (container_width == undefined || isNaN(container_width)) {
        container_width = 600;
    }

    var margin = { top: 10, right: 15, bottom: 25, left: 35 };
    var width = container_width - margin.left - margin.right;
    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;
    var num_ticks = 13;

    if (container_width < mobile_threshold) {
        num_ticks = 5;
    }

    // clear out existing graphics
    $graphic.empty();

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(function(d,i) {
            if (width <= mobile_threshold) {
                var fmt = d3.time.format('%y');
                return '\u2019' + fmt(d);
            } else {
                var fmt = d3.time.format('%Y');
                return fmt(d);
            }
        });

    var x_axis_grid = function() { return xAxis; }

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_ticks);

    var y_axis_grid = function() { return yAxis; }

    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.amt); });

    // parse data into columns
    var lines = {};
    for (var column in graphic_data[0]) {
        if (column == 'date') continue;
        lines[column] = graphic_data.map(function(d) {
            return {
                'date': d.date,
                'amt': d[column]
            };
        });
    }

    var svg = d3.select('#graphic').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    x.domain(d3.extent(graphic_data, function(d) { return d.date; }));

    y.domain([
        d3.min(d3.entries(lines), function(c) {
            return d3.min(c.value, function(v) {
                var n = v.amt;
                return Math.floor(n);
            });
        }),
        d3.max(d3.entries(lines), function(c) {
            return d3.max(c.value, function(v) {
                var n = v.amt;
                return Math.ceil(n);
            });
        })
    ]);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(x_axis_grid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
        );

    svg.append('g')
        .attr('class', 'y grid')
        .call(y_axis_grid()
            .tickSize(-width, 0, 0)
            .tickFormat('')
        );

    svg.append('g').selectAll('path')
        .data(d3.entries(lines))
        .enter()
        .append('path')
            .attr('class', function(d, i) {
                return 'line line-' + i;
            })
            .attr('d', function(d) {
                return line(d.value);
            });

    // This is calling an updated height.
    if (pymChild) {
        pymChild.sendHeight();
    }
}


$(window).load(function() {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart
        d3.csv(graphic_data_url, function(error, data) {
            graphic_data = data;

            graphic_data.forEach(function(d) {
                d.date = d3.time.format('%Y-%m').parse(d.date);
                d.jobs = d.jobs / 1000;
            });

            // This is instantiating the child message with a callback but AFTER the D3 charts are drawn.
            pymChild = new pym.Child({ renderCallback: drawGraphic });
        });
    } else { // If not, rely on static fallback image. No callback needed.
        pymChild = new pym.Child({ });
    }
});
