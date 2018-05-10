window.bitcoin = window.bitcoin || (function(d3) {

    var self = null;
    var m = [20, 20, 30, 20];
    var w = 960 - m[1] - m[3];
    var h = 500 - m[0] - m[2];
    var k = 1;
    var n = 0;
    var x = null;
    var x1 = null;
    var y = null;
    var duration = 1500;
    var delay = 500;
    var color = d3.scale.category10();
    var color2 = d3.scale.ordinal()
        .range(['#c6dbef', '#9ecae1', '#6baed6']);

    var svg = d3.select('body').append('svg')
        .attr('width', w + m[1] + m[3])
        .attr('height', h + m[0] + m[2])
        .append('g')
        .attr(`transform`, `translate(${m[3]}, ${m[0]})`);
        
    var pie = d3.layout.pie()
        .value((d) => {
            return d.sumAverage;
        });

    var arc = d3.svg.arc();
    var g = null;
    var t = null;
    var stack = null;
    var currencies = null;
    var API = [];

    var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) {
            return x(d.time);
        })
        .y(function(d) {
            return y(d.average);
        });
        
    var axis = d3.svg.line()
        .interpolate('basis')
        .x((d) => {
            return x(d.date);
        })
        .y(h);
        
    var area = d3.svg.area()
        .interpolate('basis')
        .x((d) => {
            return x(d.date);
        })
        .y1((d) => {
            return y(d.average);
        });

        







    

    
    
    // return stuff that we want to be loaded (since the first line of code is a function)
    // we call the function towards the bottom of this file
    return {
        // so apparently using some ES6 syntax in some places doesn't produce what I want
        lines: function() {
            k = 1;
            n = currencies[0].values.length;
            x = d3.time.scale().range([0, w - 60]);
            y = d3.scale.linear().range([h / 4 - 20, 0]);
            x.domain([
                d3.min(currencies, function(d) {
                    return d.values[0].time;
                }),
                d3.max(currencies, function(d) {
                    return d.values[d.values.length - 1].time;
                })
            ]);

            g = svg.selectAll('.currency')
                .attr('transform', function(d, i) {
                    return `translate(0, ${i * h / 4 + 10})`;
                });

            g.each(function(d) {
                var e = d3.select(this);
                
                e.append('path')
                .attr('class', 'line');

                e.append('circle')
                    .attr('r', 5)
                    .style('fill', function(d) {
                        return color(d.key);
                    })
                    .style('stroke', '#000')
                    .style('stroke-width', '2px');

                e.append('text')
                    .attr('x', 12)
                    .attr('dy', '.31em')
                    .text(d.key);
            });

            d3.timer(function() {
                self.draw(k);

                if((k += 2) >= n - 1) {
                    self.draw(n - 1);
                    setTimeout(self.lines, 500);

                    return true;
                }
            });
        },

        draw: function(k) {
            g.each(function(d) {
                var e = d3.select(this);
                y.domain([0, d.maxAverage]);
                
                e.select('path')
                .attr('d', function(d) {
                    return line(d.values.slice(0, k + 1));
                });

                e.selectAll('circle, text')
                .data(function(d) {
                    return [d.values[k], d.values[k]];
                })
                .attr('transform', function(d) {
                    // console.log(`translate(${x(d.time)}, ${y(d.average)})`);
                    return `translate(${x(d.time)}, ${y(d.average)})`;
                });
            });
        },


        run: function() {
            self = this;
            let stuff = ["USD", "AUD"];
            // stuff is an array of currencies that we will work with
            
            for(let mm = 0; mm < stuff.length; mm++) {
                d3.json(`https://apiv2.bitcoinaverage.com/indices/global/history/BTC${stuff[mm]}?period=monthly&?format=json`, function(data) {

                    for(var nn in data) {
                        data[nn]['currency'] = stuff[mm];
                        API.push(data[nn]);
                    }

                    var parse = d3.time.format("%Y-%d-%m %H:%M:%S").parse;

                    currencies = d3.nest()
                        .key(function(d) {
                            return d.currency;
                        })
                        .entries(API);
                        
                        currencies.forEach(function(s) {
                            s.values.forEach(function(d) {
                                d.time = parse(d.time);
                                d.average = +d.average;
                            });
                            
                            s.maxAverage = d3.max(s.values, function(d) {
                                return d.average;
                            });
                            
                            s.sumAverage = d3.sum(s.values, function(d) {
                                return d.average;
                            });
                        });
                        
                        currencies.sort(function(a, b) {
                            return b.maxAverage - a.maxAverage;
                        });
                        
                    g = svg.selectAll('g')
                        .data(currencies)
                        .enter().append('g')
                        .attr('class', 'currency');
                    setTimeout(self.lines, duration);
                });
                };
            }
        }
}(d3));

window.document.addEventListener('DOMContentLoaded', function(e) {
    
    var bitcoin = window.bitcoin;

    bitcoin.run();
});