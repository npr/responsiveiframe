var $graphic = $('#graphic');
var graphic_data_url = 'data-2.csv';
var graphic_data;
var graphic_aspect_width = 16;
var graphic_aspect_height = 9;
var mobile_threshold = 500;
var pymChild = null;

function drawGraphic(width) {
    var margin = {top: 10, right: 15, bottom: 25, left: 50};
    var width = width - margin.left - margin.right;
    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;
    var num_ticks = 13;
    if (width < mobile_threshold) {
        num_ticks = 5;
        margin.left = 35;
    }

    // clear out existing graphics
    $graphic.empty();

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var formatAsPercentage = d3.formatPrefix('%',0);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
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
        .ticks(num_ticks)
        .tickFormat(function(d, i) {
            var val = d;
            if (width >= mobile_threshold) {
                val = val.toPrecision(4);
            }
            return '$' + val;
        });

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
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(graphic_data, function(d) { return d.date; }));

    y.domain([
        d3.min(d3.entries(lines), function(c) {
            return d3.min(c.value, function(v) {
                var n = v.amt;
                return Math.floor(n) - 1;
            });
        }),
        d3.max(d3.entries(lines), function(c) {
            return d3.max(c.value, function(v) {
                var n = v.amt;
                return Math.ceil(n) + 1;
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

    if (pymChild) {
        pymChild.sendHeight();
    }
}

// initial setup
if (Modernizr.svg) {
    d3.csv(graphic_data_url, function(error, data) {
        graphic_data = data;

        graphic_data.forEach(function(d) {
            d.date = d3.time.format('%Y-%m-%d').parse(d.date);
            d.avg_wage = d.avg_wage;
        });

        var pymChild = new pym.Child({renderCallback: drawGraphic});
    });
}
