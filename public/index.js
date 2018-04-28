d3.json('world110.json', (err, world) => {
    var countries = topojson.feature(world, world.objects.land);

    var width = 550
    var height = 550
    var projection = d3.geo.orthographic()
    // var projection = d3.geo.albers()
    // var projection = d3.geo.mercator()
        .scale(270)
        .rotate([100,0,0])
        .translate([width/2, height/2])
        .clipAngle(90);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select('svg')

    var graticule = d3.geo.graticule()
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    svg.append("path")
        .datum(countries)
        .attr("d", path)
        .classed("land", true);

    var zoom = d3.geo.zoom()
        .projection(projection)
        // .scaleExtent([projection.scale() * 0.7, projection.scale() * 10])
        .on('zoom.redraw', () => {
            d3.event.sourceEvent.preventDefault();
            svg.selectAll('path').attr('d', path);
        })
        d3.selectAll('path').call(zoom);
});