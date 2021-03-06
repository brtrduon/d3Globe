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

    var svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height)
        .on('mousedown', mousedown);

    var graticule = d3.geo.graticule();
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    svg.append("path")
        .datum(countries)
        .attr("d", path)
        .classed("land", true);

    // setup for labels moving when rotating globe
    d3.select(window)
        .on('mousemove', mousemove)
        .on('mouseup', mouseup);

    // initialize variables for mouse events
    var m0;
    var o0;

    function mousedown() {
        m0 = [d3.event.pageX, d3.event.pageY];
        o0 = projection.rotate();
        d3.event.preventDefault();
    }
    
    function mousemove() {
        if (m0) {
            var m1 = [d3.event.pageX, d3.event.pageY];
            var o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
            o1[1] = o1[1] > 30 ? 30 : 
            o1[1] < -30 ? -30 : 
            o1[1];
            projection.rotate(o1);
            refresh();
        }
    }
    
    function mouseup() {
        if (m0) {
            mousemove();
            m0 = null;
        }
    }

    function refresh() {
        svg.selectAll('.land').attr('d', path);
        svg.selectAll('.countries path').attr('d', path);
        svg.selectAll('.graticule').attr('d', path);
        svg.selectAll('.point').attr('d', path);
        labels();
    }

    // create new object from blockchain data
    // might be doing more work than I should be doing
    d3.json('https://blockchain.info/ticker', (err, data) => {
        var currency = [];
        var price = [];
        
        for(var i in data) {
            currency.push(i);
            
            var holder = data[i];
            for(var j in holder) {
                price.push(holder[j]);
                if (j === j) {
                    break;
                }
            };
        };
        
        var result = {};
        currency.forEach((k, l) => {
            result[k] = price[l];
        });
        console.log(result);
        
        // load json containing data for locations' names, coordinates, etc
        // need to make json pull inside blockchain's json pull in order to be able to access blockchain's data
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
                    return d.properties.currency
                });

            

            // create "artificial one-to-one relationship" with places.json and blockchain API
            var temp;
            var temp1;
            var temp2;

            for(var m in places.features) {
                temp = places.features[m];
                for(var n in temp) {
                    temp1 = temp[n].currency;

                    // loop through modified blockchain object
                    for(var o in result) {
                        // if the two currencies are the same, then set the currency price of the remote json as the currency price of blockchain
                        if (o === temp1) {
                            temp2 = result[o];
                            break;
                        }
                    }
                    temp[n].price = temp2;
                }
            }
            // console.log(places.features);

            // call the function below
            labels();
        });
    });


    // labels function needs to be placed on outer scope for mouse events' accessibility
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