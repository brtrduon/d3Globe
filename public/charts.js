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

    // console.log(result);

    for(var keys in result) {
        console.log(`https://apiv2.bitcoinaverage.com/indices/global/history/BTC${keys}?period=alltime&?format=json`);
        // need to d3.json pull from that api and draw it into that altering chart thing
    }
});