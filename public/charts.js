// view/graph dimensions (?)

var m = [20, 20, 30, 20];
// I have no idea what the var above is for
var width = 960 - m[1] - m[3];
var height = 500 - m[0] - m[2];

var x;
var y;
var duration = 1500;
var delay = 500;

var color = d3.scale.category10();

var svg = d3.select('svg')
    .attr('width', width + m[1] + m[3])
    .attr('height', height + m[0] + m[2])
    .append('g')
        .attr('transform', `translate(${m[3]}, ${m[0]})`);

// initialize stuff
var bitcoin;
var symbols;

var line = d3.svg.line()
    .interpolate('basis')
    .x((d) => {
        return x(d.time);
        // might need to change 'time' for x axis if nothing is displaying on graph
    })
    .y((d) => {
        return y(d.average);
        // same thing as x axis
    });

var axis = d3.svg.line()
    .interpolate('basis')
    .x((d) => {
        return x(d.date);
    })
    .y(height);
    // not sure why I need this AND var line

var area = d3.svg.area()
    .interpolate('basis')
    .x((d) => {
        return x(d.time);
    })
    .y1((d) => {
        return y(d.average);
    });
    // same thing here as the stuff above







// recycling some stuff from globe.js to loop through currency used
// will need to modify .js files once i make the whole shabangabang into a single page app

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


    // need for loop here to be able to load all historical bitcoin data based on currencies being used
    for(var keys in result) {
        d3.json(`https://apiv2.bitcoinaverage.com/indices/global/history/BTC${keys}?period=monthly&?format=json`, (err, data) => {
            console.log(data);

            var parse = d3.time.format('%b %Y').parse;
            // i have no idea what the var above does

            
        });
    };

    // for(var m in realTime) {
    //     d3.json(realTime[m], (err, data) => {
    //         console.log(data);
    //     });
    // };
});