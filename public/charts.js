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

        donutArcTween: (d) => {
            // animation function?
            var donutPath = d3.select(this);
            var donutText = d3.select(this.parentNode.appendChild(this.previousSibling));
            var x0 = x(d.data.key);
            var y0 = height - y(d.date.sumAverage);

            return (t) => {
                var r = height / 2 / Math.min(1, t + 1e-3);
                var a = Math.cos(t * Math.PI / 2);
                var xx = (-r + (a) * (x0 + x.rangeBand()) + (1 - a) * (w + h) / 2);
                var yy = ((a) * height + (1 - a) * height / 2);
                var f = {
                    innerRadius: r - x.rangeBand() / (2 - a),
                    outerRadius: r,
                    startAngle: a * (Math.PI / 2 - y0 / r) + (1 - a) * d.startAngle,
                    endAngle: a * (Math.PI / 2) + (1 - a) * d.endAngle
                };

                donutPath.attr('transform', `translate(${xx}, ${yy})`);
                donutPath.attr('d', arc(f));
                donutText.attr('transform', `translate(${arc.centroid(f)})translate(${xx}, ${yy})rotate(${((f.startAngle + f.endAngle) / 2 + 3 * Math.PI / 2) * 180 / Math.PI})`);
            };
        },

        donut: () => {
            g = svg.selectAll('.currency');
            g.selectAll('rect').remove();

            g.append('path')
                .style('fill', (d) => {
                    return color(d.key);
                })
                .data(() => {
                    return pie(currencies);
                })
                .transition()
                .duration(duration)
                .tween('arc', this.donutArcTween);

            g.select('text').transition()
                .duration(duration)
                .attr('dy', '.31em');

            svg.select('line').transition()
                .duration(duration)
                .attr('y1', 2 * height)
                .attr('y2', 2 * height)
                .remove();

            setTimeout(this.donutExplode, duration + delay);
        },

        explodeArcTween: (b) => {
            return (b) => {
                var explodeArcPath = d3.select(this);
                var explodeArcText = d3.select(this.nextSibling);
                var i = d3.interpolate(a, b);
                var key;

                for(key in b) {
                    if (b.hasOwnProperty(key)) {
                        // update data
                        a[key] = b[key]
                    };
                };

                return (t) => {
                    var a = i(t);

                    explodeArcPath.attr('d', arc(a));
                    explodeArcText.attr('transform', `translate(${arc.centroid(a)})translate(${width / 2}, ${height / 2})rotate(${((a.startAngle + a.endAnggle) / 2 + 3 * Math.PI / 2) * 180 / Math.PI})`);
                };
            };
        },

        transitionExplode: (d, i) => {
            var r0a = height / 2 - x.rangeBand() / 2;
            var r1a = height / 2;
            var r0b = 2 * height - x.rangeBand() / 2;
            var r1b = 2 * height;

            d.innerRadius = r0a;
            d.outerRadius = r1a;

            d.select(this).transition()
                .duration(duration / 2)
                .tween('arc', this.explodeArcTween({
                    innerRadius: r0b,
                    outerRadius: r1b
                }));
        },

        donutExplode: () => {
            svg.selectAll('.symbol path')
                .each(this.transitionExplode);

            setTimeout(() => {
                svg.selectAll('*').remove();
                svg.selectAll('g').data(currencies)
                    .enter().append('g')
                    .attr('class', 'currency');
                this.lines();
            }, duration);
        },

        streamGraph: () => {
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
                .order('reverse')
                .offset('wiggle');
                // what is wiggle offset?

            stack(currencies);

            line.y((d) => {
                return y(d.average0);
            });

            t = svg.selectAll('.currency').transition()
                .duration(duration);

            t.select('path.area')
                .attr('d', (d) => {
                    return area(d.values);
                });

            t.select('path.line')
                .style('stroke-opacity', 1e-6)
                .attr('d', (d) => {
                    return line(d.values);
                });

            t.select('text')
                .attr('transform', (d) => {
                    d = d.values[d.values.length - 1];
                    return `translate${(width - 60)}, ${y(d.average / 2 + d.average0)})`;
                });

            setTimeout(this.overlap, duration + delay);
        },

        stackedArea: () => {
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

            stack(currencies);

            y.domain([0, d3.max(currencies[0].values.map((d) => {
                return d.average + d.average0;
            }))])
                .range([height, 0]);

            line.y((d) => {
                return y(d.average0);
            });

            area.y0((d) => {
                return y(d.average0);
            })
                .y1((d) => {
                    return y(d.average0 + d.average);
                });

            t = svg.selectAll('.currency').transition()
                .duration(duration)
                .attr('transform', 'translate(0, 0)')
                .each('end', (d) => {
                    d3.select(this).attr('transform', null);
                });

            t.select('path.area')
                .attr('d', (d) => {
                    return area(d.values);
                });

            t.select('path.line')
                .style('stroke-opacity', (d, i) => {
                    return i < 3 ? 1e-6 : 1;
                })
                .attr('d', (d) => {
                    return line(d.values);
                });
            
            t.select('text')
                .attr('transform', (d) => {
                    d = d.values[d.values.length - 1];
                    return `translate(${(width - 60)}, ${y(d.average / 2 + d.average0)})`;
                });

            setTimeout(this.streamGraph, duration + delay);
        },

        areas: () => {
            g = svg.selectAll('.currency');

            axis.y(height / 4 - 21);

            g.select('.line')
                .attr('d', (d) => {
                    return axis(d.values);
                });

            g.each((d) => {
                y.domain([0, d.maxAverage]);

                d3.select(this).select('.line').transition()
                    .duration(duration)
                    .style('stroke-opacity', 1)
                    .each('end', () => {
                        d3.select(this).style
                        ('stroke-opacity', null);
                    });

                d3.select(this).selectAll('.area')
                    .filter((d, i) => {
                        return i;
                    })
                    .transition()
                    .duration(duration)
                    .style('fill-opacity', 1e-6)
                    .attr('d', area(d.values))
                    .remove();

                d3.select(this).selectAll('area')
                    .filter((d, i) => {
                        return i;
                    })
                    .transition()
                    .duration(duration)
                    .style('fill-opacity', 1e-6)
                    .attr('d', area(d.values))
                    // identical to the block above minus the remove method
            });

            svg.select('defs').transition()
                .duration(duration)
                .remove();

            g.transition()
                .duration(duration)
                .each('end', () => {
                    d3.select(this).attr('clip-path', null);
                });

            setTimeout(this.stackedArea, duration + delay);
        },

        draw: (k) => {
            g.each((d) => {
                var e = d3.select(this);

                y.domain([0, d.maxAverage]);

                e.select('path')
                    .attr('d', (d) => {
                        return line(d.values.slice(0, k + 1));
                    });

                e.selectAll('circle, text')
                    .data((d) => {
                        return [d.values[k], d.values[k]];
                    })
                    .attr('transform', (d) => {
                        return `translate(${x(d.time)}, ${y(d.average)})`;
                    });
            });
        },

        lines: () => {
            k = 1;
            n = currencies[0].values.length;
            x = d3.time.scale().range([0, width - 60]);
            // might need to change the above 'time' var name to something else
            y = d3.scale.linear().range([height / 4 - 20, 0]);

            // compute min and max date across currencies
            x.domain([
                d3.min(currencies, (d) => {
                    return d.values[0].time;
                }),
                d3.max(currencies, (d) => {
                    return d.values[d.values.length - 1].time;
                })
            ]);

            g = svg.selectAll('.currency')
                .attr('transform', (d, i) => {
                    return `translate(0${i * height / 4 + 10})`;
                });

            g.each((d) => {
                var e = d3.select(this);

                e.append('path')
                    .attr('class', 'line');

                e.append('circle')
                    .attr('r', 5)
                    .style('fill', (d) => {
                        return color(d.key);
                    })
                    .style('stroke', '#000')
                    .style('stroke-width', '2px');

                e.append('text')
                    .attr('x', 12)
                    .attr('dy', '.31em')
                    .text(d.key);
            });

            d3.timer(() => {
                this.draw(k);

                if((k += 2) >= n - 1) {
                    this.draw(n - 1);
                    setTimeout(this.horizons, 500);

                    return true;
                }
            });
        },

        horizons: () => {
            svg.insert('defs', '.currency')
                .append('clipPath')
                .attr('id', 'clip')
                .append('rect')
                .attr('width', width)
                .attr('height', height / 4 - 20);

            g = svg.selectAll('.currency')
                .attr('clip-path', 'url(#clip)');

            area.y0(height / 4 - 20);

            g.select('circle').transition()
                .duration(duration)
                .attr('transform', (d) => {
                    return `translate(${(width - 60)}, ${(-height / 4)})`;
                })
                .remove();

            g.select('text').transition()
                .duration(duration)
                .attr('transform', (d) => {
                    return `translate(${width - 60}, ${height / 4 - 20})`;
                })
                .attr('dy', '0em');

            g.each((d) => {
                y.domain([0, d.maxAverage]);

                d3.select(this).selectAll('.area')
                    .data(d3.range(3))
                    .enter().insert('path', '.line')
                    .attr('class', 'area')
                    .attr('transform', (d) => {
                        return `translate(0${(d * (height / 4 - 20))})`;
                    })
                    .attr('d', area(d.values))
                    .style('fill', (d, i) => {
                        return color2(i);
                    })
                    .style('fill-opacity', 1e-6);

                y.domain([0, d.maxAverage / 3]);

                d3.select(this).selectAll('.line').transition()
                    .duration(duration)
                    .attr('d', line(d.values))
                    .style('stroke-opacity', 1e-6);

                d3.select(this).selectAll('.area').transition()
                    .duration(duration)
                    .style('fill-opacity', 1)
                    .attr('d', area(d.values))
                    .each('end', () => {
                        d3.select(this).style('fill-opacity', null);
                    });
            });

            setTimeout(this.areas, duration + delay);
        },

        









        run: () => {
            // recycling some stuff from globe.js to loop through currency used
            // will need to modify .js files once i make the whole shabangabang into a single page app
            d3.json('https://blockchain.info/ticker', (data) => {
                let currency = [];
                
                for(var ii in data) {
                    currency.push(ii);
                };
                
                
                // need for loop here to be able to load all historical bitcoin data based on currencies being used
                for(let mm = 0; mm < currency.length; mm++) {
                    // need to put loop in this format to match up the console log currencies and its respective data
                    d3.json(`https://apiv2.bitcoinaverage.com/indices/global/history/BTC${currency[mm]}?period=monthly&?format=json`, (err, data) => {
                        // console.log(currency[mm]);
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