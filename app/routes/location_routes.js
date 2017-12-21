var fs = require('fs')
var parse = require('csv-parse')

var inputFile='locations.csv'

var locations = {}
var largestUsedKey = 0 // this key may become unused but was used at one point

// id, name, address, lat, long
var parser = parse({delimiter: ','}, function (err, data) {
    data.forEach(function(line) {
        id = parseInt(line[0])
        locations[id] = line.slice(1, 5)
        if (id > largestUsedKey) {
            largestUsedKey = id
        }
    });
})

fs.createReadStream(inputFile).pipe(parser)

console.log('Read all locations into memory from locations.csv')

function genLargestUnusedKey() {
    largestUsedKey++
    while (largestUsedKey in locations) {
        largestUsedKey++
    }
    return largestUsedKey
}

module.exports = function(app, db) {
    // CREATE
    app.post('/location', (req, res) => {
        name = req.body.name
        addrs = req.body.address
        lat = parseFloat(req.body.lat) + ""
        lng = parseFloat(req.body.lng) + ""

        newLoc = [name, addrs, lat, lng]

        for (var i = 0; i < newLoc.length; i++) {
            if (newLoc[i] == undefined || newLoc[i] == "NaN") {
               res.send("Invalid location: " + newLoc)
               return
            }
        }
        newKey = genLargestUnusedKey()

        locations[newKey] = newLoc
        res.send("Added new location with id: " + newKey)
    });

    // READ
    app.get('/location/:id', (req, res) => {
        id = req.params.id
        if (id in locations) {
            res.send(locations[id])
        } else {
            res.send("No location found with id: " + id)
        }
    });
    
    // UPDATE
    app.put('/location/:id', (req, res) => {
        id = req.params.id
        if (id in locations) {
            curLoc = locations[id]
            name = req.body.name
            addrs = req.body.address
            lat = parseFloat(req.body.lat) + "" // convert to string
            lng = parseFloat(req.body.lng) + ""

            newLoc = [name, addrs, lat, lng]

            for (var i = 0; i < newLoc.length; i++) {
                if (newLoc[i] != undefined && !isNaN(newLoc[i])) {
                    curLoc[i] = newLoc[i]
                }
            }
            
            locations[id] = curLoc
            res.send("Updated location " + id + ": " + curLoc)
        } else {
            res.send("No location to update with id: " + id)
        }
    });
    
    // DELETE
    app.delete('/location/:id', (req, res) => {
        const id = req.params.id;

        if (id in locations) {
            delete locations[id]
            res.send("Deleted location with id: " + id)
        } else {
            res.send("No location to delete with id: " + id)    
        }
    })
};
