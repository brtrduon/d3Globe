// view/graph dimensions (?)
var m = [20, 20, 30, 20];
// I have no idea what var m is for
var width = 960 - m[1] - m[3];
var height = 500 - m[0] - m[2];
var k = 1;
var n = 0;
var duration = 1500;
var delay = 500;
var color = d3.scale.category10();
var color1 = d3.scale.ordinal()
    .range(['#c6dbef', '#9ecae1', '#6baed6']);

// initialize some stuff
var self;
var x;
var x1;
var y;
var g;
var t;
var stack;
var symbols;
// might need to change the name of 'var symbols' to 'currency' or whatever it is that i am using

var svg = d3.select('svg')
    .attr('width', width + m[1] + m[3])
    .attr('height', height + m[0] + m[2])
    .append('g')
    .attr(`transform`, `translate(${m[3]}, ${m[0]})`);

var pie = d3.layout.pie()
    .value((d) => {
        return d.sumPrice;
    });

var arc = d3.svg.arc();

var line = d3.svg.line()
    .interpolate('basis')
    .x((d) => {
        return x(d.time);
    })
    .y((d) => {
        return y(d.average);
    });

var axis = d3.svg.line()
    .interpolate('basis')
    .x((d) => {
        return x(d.time);
    })
    .y(height);

var area = d3.svg.area()
    .interpolate('basis')
    .x((d) => {
        return x(d.time);
    })
    .y1((d) => {
        return y(d.average);
    });








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
            
        });
    };
});