d3.json('world110.json', (err, world) => {
    var countries = topojson.feature(world, world.objects.land);
    var width = 550
    var height = 550
    var projection = d3.geo.orthographic()
        .scale(270)
        .rotate([100,0,0])
        .translate([width/2, height/2])
        .clipAngle(90);

    var path = d3.geo.path()
        .projection(projection)
        .pointRadius(2.5);

    var svg = d3.select('svg');

    var graticule = d3.geo.graticule();
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    svg.append("path")
        .datum(countries)
        .attr("d", path)
        .classed("land", true);

    // for rotating and zooming into the globe
    var zoom = d3.geo.zoom()
        .projection(projection)
        .on('zoom.redraw', () => {
            d3.event.sourceEvent.preventDefault();
            svg.selectAll('path').attr('d', path);
            svg.selectAll('circle')
            .attr({
                cx: (d) => {
                    return projection(d)[0]
                },
                cy: (d) => {
                    return projection(d)[1]
                },
                r: 3,
            });
        });
    d3.selectAll('path').call(zoom);

    // load json containing data for locations' names, coordinates, etc
    d3.json('places.json', (err, places) => {
        svg.append('g').attr('class', 'points')
            .selectAll('text').data(places.features)
            // d3 automatically detects coordinates within json file
            .enter().append('path')
            .attr('class', 'point')
            // load point on globe on init
            .attr('d', path);

        svg.append('g').attr('class', 'labels')
            .selectAll('text').data(places.features)
            .enter().append('text')
            .attr('class', 'label')
            .text((d) => {
                return d.properties.name
            });
        
        // calling the function below
        labels();

        function labels() {
            var center = projection.invert([width / 2, height / 2]);
            var arc = d3.geo.greatArc();
          
            svg.selectAll(".label")
                .attr("text-anchor", (d) => {
                    var x = projection(d.geometry.coordinates)[0];
                    return x < width / 2-20 ? "end" :
                        x < width / 2+20 ? "middle" :
                        "start";
                })
                .attr("transform", (d) => {
                    var location = projection(d.geometry.coordinates);
                    var x = location[0];
                    var y = location[1];
                    var offset = x < width / 2 ? -5 : 5;
                    return `translate(${x+offset},${y-2})`;
                })
                .style("display", (d) => {
                    var d = arc.distance({source: d.geometry.coordinates, target: center});
                    return (d > 1.57) ? 'none' : 'inline';
                })
          }
    });
});