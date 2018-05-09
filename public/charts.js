window.bitcoin = window.bitcoin || (function(d3) {

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
        // will probably change these colors to something to better suit me

    // initialize variables to be used later
    var self;
    var x;
    var x1;
    var y;
    var g;
    var t;
    var stack;
    var currencies;
    // var API = [];

    // init d3 stuff to be loaded (?) 
    var svg = d3.select('svg')
        .attr('width', width + m[1] + m[3])
        .attr('height', height + m[0] + m[2])
        .append('g')
        .attr(`transform`, `translate(${m[3]}, ${m[0]})`);

    var pie = d3.layout.pie()
        .value((d) => {
            return d.sumAverage;
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
    
    // return stuff that we want to be loaded (since the first line of code is a function)
    // we call the function towards the bottom of this file
    return {


        run: () => {
            self = this;
            var API = [];
            
            d3.json('https://blockchain.info/ticker', (data) => {
                let stuff = [];
                
                for(var ii in data) {
                    stuff.push(ii);
                };

                // stuff is an array of currencies that we will work with
                
                for(let mm = 0; mm < stuff.length; mm++) {
                    d3.json(`https://apiv2.bitcoinaverage.com/indices/global/history/BTC${stuff[mm]}?period=monthly&?format=json`, (data) => {
                        var parse = d3.time.format('%b %Y').parse;

                        for(var nn in data) {
                            data[nn]['currency'] = stuff[mm];
                            API.push(data[nn]);
                        }
                        // console.log(stuff[mm]);
                        // console.log(data);

                        // console.log(API);

                        currencies = d3.nest()
                            .key((d) => {
                                return d.currency;
                            })
                            .entries(API);

                        currencies.forEach((s) => {
                            s.values.forEach((d) => {
                                d.average = +d.average;
                            });
                            
                            s.maxAverage = d3.max(s.values, (d) => {
                                return d.average;
                            });
                            
                            s.sumAverage = d3.sum(s.values, (d) => {
                                return d.average;
                            });
                        });

                        currencies.sort((a, b) => {
                            return b.maxAverage - a.maxAverage;
                        });

                        g = svg.selectAll('g')
                            .data(currencies)
                            .enter().append('g')
                            .attr('class', 'currency');

                        setTimeout(self.lines, duration);
                    });
                };
            });
        }
    }
}(d3));

window.document.addEventListener('DOMContentLoaded', (e) => {
    
    var bitcoin = window.bitcoin;

    bitcoin.run();
});