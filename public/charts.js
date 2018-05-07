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
    // var self;
    var x;
    var x1;
    var y;
    var g;
    var t;
    var stack;
    var currencies;

    // init d3 stuff to be loaded (?) 
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
    
    // return stuff that we want to be loaded (since the first line of code is a function)
    // we call the function towards the bottom of this file
    return {
        // overlap will be called in streamGraph function
        // i.e. nothing inserted inside overlap function is being utilized atm
        // let's pray that I don't make a typo somewhere along the way

        // where is 'values' being defined?
        overlap: () => {
            g = svg.selectAll('.currency');

            line.y((d) => {
                return y(d.average0 + d.average);
            });

            g.select('.line')
                .attr('d', (d) => {
                    return line(d.values);
                    // where is/are values being pulled from...?
                });
            
            y.domain([0, d3.max(currencies.map((d) => {
                return d.maxAverage;
            }))])
                .range([height, 0]);

            area.y0(height)
                .y1((d) => {
                    return y(d.average);
                });

            line.y((d) => {
                return y(d.average);
            });

            t = g.transition()
                // I am assuming transition is a built-in d3 function
                .duration(duration);

            t.select('line')
                .style('stroke-opacity', 1)
                // I suppose I can do this via CSS also
                .attr('d', (d) => {
                    return line(d.values);
                });

            t.select('area')
                .style('fill-opacity', 0.5)
                .attr('d', (d) => {
                    return area(d.values);
                });

            t.select('text')
                .attr('dy', '.31em')
                // I do not know what the above attributes are
                // maybe days in a month?
                .attr('transform', (d) => {
                    d = d.values[d.values.length - 1];
                    return `translate(${width - 60}, ${y(d.average)})`;
                });

            svg.append('line')
                .attr('class', 'line')
                .attr('x1', 0)
                .attr('x2', width - 60)
                .attr('y1', height)
                .attr('y2', height)
                .style('stroke-opacity', 1e-6)
                .transition()
                .duration(duration)
                .style('stroke-opacity', 1);

            setTimeout(this.groupedBar, duration + delay);
        },

        groupedBar: () => {
            x = d3.scale.ordinal()
                .domain(currencies[0].values.map((d) => {
                    return d.date;
                }))
                .rangeBands([0, width - 60], 0.1);
                // I'm assuming that 0.1 is the opacity?
                // rangeBand is d3's auto calculation for space available, bar width, inner/outer padding

            x1 = d3.scale.ordinal()
                .domain(currencies.map((d) => {
                    return d.key;
                }))
                .rangeBands([0, x.rangeBand()]);

            g = svg.selectAll('currency');

            t = g.transition()
                .duration(duration);

            t.select('.line')
                .style('stroke-opacity', 1e-6)
                .remove();

            t.select('.area')
                .style('full-opacity', 1e-6)
                .remove();

            g.each((p, j) => {
                // wonder why p and j are selected as parameters
                d3.select(this).selectAll('rect')
                    .data((d) => {
                        return d.values;
                    })
                    .enter().append('rect')
                    .attr('x', (d) => {
                        return x(d.time) + x1(p.key);
                    })
                    .attr('y', (d) => {
                        return y(d.average);
                    })
                    .attr('width', x1.rangeBand())
                    .attr('height', (d) => {
                        return height - y(d.average);
                    })
                    .style('fill', color(p.key))
                    // key will be defined in explodeArcTween
                    .style('fill-opacity', 1e-6)
                    .transition()
                    .duration(duration)
                    .style('fill-opacity', 1);
            });

            setTimeout(this.stackedBar, duration + delay);
        },

        stackedBar: () => {
            stack = d3.layout.stack()
                .values((d) => {
                    return d.values;
                })
                .x((d) => {
                    return d.time;
                })
                .y((d) => {
                    return d.average;
                })
                .out((d, y0, y) => {
                    d.average0 = y0;
                })
                .order('reverse');

            x.rangeRoundBands([0, width - 60], 0.1);
            g = svg.selectAll('.currency');
            stack(currencies);

            y.domain([0, d3.max(currencies[0].values.map((d) => {
                return d.average + d.average0;
            }))])
                .range([height, 0]);

            t = g.transition()
                .duration(duration / 2);
                // I don't understand why duration is divided in 2 here
                // don't see any difference when not dividing the duration in d3showreel

            t.select('text')
                .delay(currencies[0].values.length * 10)
                .attr('transform', (d) => {
                    d = d.values[d.values.length - 1];
                    return `translate(${width - 60}, ${y(d.average / 2 + d.average0)})`;
                });

            t.selectAll('rect')
                .delay((d, i) => {
                    return i * 10;
                })
                .attr('y', (d) => {
                    return height - y(d.average);
                })
                .each('end', () => {
                    d3.select(this)
                        .style('stroke', '#fff')
                        .style('stroke-opacity', 1e-6)
                        .transition()
                        .duration(duration / 2)
                        .attr('x', (d) => {
                            return x(d.time);
                        })
                        .attr('width', x.rangeBand())
                        .style('stroke-opacity', 1);
                });
            
            setTimeout(this.transposeBar, duration + currencies[0].values.length * 10 + delay);
        },

        transposeBar: () => {
            stack = d3.layout.stack()
                .x((d, i) => {
                    // why are 2 parameters being used if we're only returning 1...
                    return i;
                })
                .y((d) => {
                    return d.average;
                })
                .out((d, y0, y) => {
                    d.average0 = y0;
                });

            x.domain(currencies.map((d) => {
                return d.key;
            }))
                .rangeRoundBands([0, width], 0.2);

            y.domain([0, d3.max(currencies.map((d)=> {
                return d3.sum(d.values.map((d) => {
                    return d.average;
                    // why is there a nested return within a return...?
                }));
            }))]);

            stack(d3.zip.apply(null, currencies.map((d) => {
                // d3.zip returns an array of arrays, where the ith array contains the ith element from each of the argument arrays
                return d.values;
            })));

            g = svg.selectAll('.currency');

            t = g.transition()
                .duration(duration / 2);

            t.selectAll('rect')
                .delay((d, i) => {
                    return i * 10;
                })
                .attr('y', (d) => {
                    return y(d.average0 + d.average) - 1;
                })
                .attr('height', (d) => {
                    return height - y(d.average) + 1;
                })
                .attr('x', (d) => {
                    return x(d.currency);
                })
                .attr('width', x.rangeBand())
                .style('stroke-opacity', 1e-6);

            t.select('text')
                .attr('x', 0)
                .attr('transform', (d) => {
                    return `translate(${x(d.key) + x.rangeBand() / 2}, ${height})`;
                })
                .attr('dy', '1.31em')
                .each('end', () => {
                    d3.select(this).attr('x', null).attr('text-anchor', 'middle');
                });

            svg.select('line').transition()
                .duration(duration)
                .attr('x2', width);

            setTimeout(this.donut, duration / 2 + currencies[0].values.length * 10 + delay);
        },









        run: () => {
            // recycling some stuff from globe.js to loop through currency used
            // will need to modify .js files once i make the whole shabangabang into a single page app
            d3.json('https://blockchain.info/ticker', (data) => {
                let currency = [];
                
                for(var i in data) {
                    currency.push(i);
                };
                
                
                // need for loop here to be able to load all historical bitcoin data based on currencies being used
                for(let m = 0; m < currency.length; m++) {
                    // need to put loop in this format to match up the console log currencies and its respective data
                    d3.json(`https://apiv2.bitcoinaverage.com/indices/global/history/BTC${currency[m]}?period=monthly&?format=json`, (err, data) => {
                        // console.log(currency[m]);
                        // console.log(data);

                        // nest average price by currency
                        // ???
                        currencies = d3.nest()
                            .key((d) => {
                                return d.currency
                            })
                            .entries(data);
                        
                        // parse dates and average value
                        // assume that values are sorted by date
                        let parse = d3.time.format('%b %y').parse;

                        currencies.forEach((s) => {
                            s.values.forEach((d) => {
                                d.time = parse(d.time);
                                d.average = +d.average;
                            });

                            // compute the max average per currency
                            s.maxAverage = d3.max(s.values, (d) => {
                                return d.average;
                            });

                            s.sumAverage = d3.sum(s.values, (d) => {
                                return d.average;
                            });
                        });

                        // sort by max average, desc
                        currencies.sort((a, b) => {
                            return b.maxAverage - a.maxAverage;
                        });

                        g = svg.selectAll('g')
                            .data(currencies)
                            .enter().append('g')
                            .attr('class', 'currency');

                        setTimeout(this.lines, duration);
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