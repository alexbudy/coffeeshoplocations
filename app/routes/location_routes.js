var fs = require('fs')
var parse = require('csv-parse')
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCROFsqlAjTB7Y4U-sNSW-10tK3HUXJK4M'
});

var inputFile='locations.csv'

var locations = {}      // all locations stored in memory
var deletedKeys = []    // keep track of all deleted keys

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

function generateUnusedKey() {
    if (deletedKeys.length > 0) {
        return deletedKeys.pop()
    } else {
        largestUsedKey++
        while (largestUsedKey in locations) {
            largestUsedKey++
        }
        return largestUsedKey
    }
}

// must be between [-90, 90]
function validateLat(lat) {
    lat = parseFloat(lat)
    if (lat >= -90 && lat <= 90) {
        return lat + ""
    } else {
        return undefined
    }
}

// must be between [-180, 180]
function validateLng(lng) {
    lng = parseFloat(lng)
    if (lng >= -180 && lng <= 180) {
        return lng + ""
    } else {
        return undefined
    }
}

module.exports = function(app, db) {
    // CREATE
    app.post('/location', (req, res) => {
        name = req.body.name
        addrs = req.body.address
        lat = validateLat(req.body.lat)
        lng = validateLng(req.body.lng)

        newLoc = [name, addrs, lat, lng]

        for (var i = 0; i < newLoc.length; i++) {
            if (newLoc[i] == undefined || newLoc[i] == "NaN") {
               res.send("Invalid location: " + newLoc)
               return
            }
        }
        newKey = generateUnusedKey()

        locations[newKey] = newLoc
        res.send("Added new location with id: " + newKey)
    });

    // READ
    app.get('/location/:id', (req, res) => {
        id = req.params.id
        if (id in locations) {
            res.send("Id: " + id + "</br> Name: " + locations[id][0] + "</br> Address: " + locations[id][1] + 
                "</br> Latitude: " + locations[id][2] + "</br> Longitude: " + locations[id][3])
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
            lat = validateLat(req.body.lat)
            lng = validateLng(req.body.lng)

            newLoc = [name, addrs, lat, lng]

            for (var i = 0; i < newLoc.length; i++) {
                if (newLoc[i] != undefined && !isNaN(newLoc[i])) { // update the valid values only
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
            deletedKeys.push(id)
            res.send("Deleted location with id: " + id)
        } else {
            res.send("No location to delete with id: " + id)    
        }
    })

    // closestlocation
    app.get('/closestlocation', (req, res) => {
        address = req.query['address']
        if (Object.keys(locations).length == 0) {
            res.send("No stored locations in memory!")
            return
        }

        googleMapsClient.geocode({
            address: address
        }, function(err, resp) {
            if (!err) {
                loc = resp.json.results[0].geometry.location
                lat = loc.lat
                lng = loc.lng

                closestlocationIdx = nearestLocIdx(lat, lng)
                res.send(closestlocationIdx + ": " + locations[closestlocationIdx])
            } else {
                console.log(err)
                res.send("An error occurred: " + err)
            }
        });
    })
};

// return the nearest location from given lat and lng values
function nearestLocIdx(lat, lng) {
    smallestDistance = Infinity
    closestIdx = -1
    for (var idx in locations) {
        lat2 = locations[idx][2]
        lng2 = locations[idx][3]

        dist = getDistanceFromLatLonInKm(lat, lng, lat2, lng2)

        if (dist < smallestDistance) {
            smallestDistance = dist
            closestIdx = idx
        }
    }

    return closestIdx
}

// https://stackoverflow.com/a/27943/4725731
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}