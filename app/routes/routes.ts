import express = require("express");
import { Location } from "./loc";
import parse = require("csv-parse");
import googleMaps = require("@google/maps");
import fs = require("fs");
import multer = require("multer")
let upload = multer()

let googleMapsClient = googleMaps.createClient({
    key: 'AIzaSyCROFsqlAjTB7Y4U-sNSW-10tK3HUXJK4M'
});

let inputFile = "locations.csv"
let locations: { [id: number] : Location; } = {}
let deletedKeys: number[] = []
let largestUsedKey: number = 0;

let parser = parse({delimiter: ','}, function (err, data) {
    data.forEach(function(line) {
        let id:   number = parseInt(line[0])
        let name: string = line[1]
        let addr: string = line[2]
        let lat:  number = parseFloat(line[3])
        let lng:  number = parseFloat(line[4])
        for (var i = 0; i < line.length; i++) {
            locations[id] = new Location(id, name, addr, lat, lng); 
            if (largestUsedKey < id) {
                largestUsedKey = id
            }
        }
    });
})

fs.createReadStream(inputFile).pipe(parser)

function nearestLoc(lat: number, lng: number): Location {
    let smallestDistance: number = Infinity;
    let closestLoc:Location = null;

    for (let locIdx in locations) {
        let dist:number = locations[locIdx].getDistanceInKm(lat, lng)
        if (dist < smallestDistance) {
            smallestDistance = dist;
            closestLoc = locations[locIdx]
        }
    }

    return closestLoc;
}

function isValidLng(lng:string):boolean {
    if (lng == undefined) return false
    let f_lng:number = parseFloat(lng)
    return (f_lng >= -180 && f_lng <= 180)
}

function isValidLat(lat:string):boolean {
    if (lat == undefined) return false
    let f_lat:number = parseFloat(lat)
    return (f_lat >=-90 && f_lat <= 90)
}

function createNewIdx(): number {
    if (deletedKeys.length > 0) {
        return deletedKeys.pop()
    } else {
        largestUsedKey++;
        while (largestUsedKey in locations) {
            largestUsedKey++;
        }
        return largestUsedKey;
    }

}

// Routes Here
let locRouter = express.Router();

// CREATE
locRouter.post('/location', upload.array(),(req: express.Request, res: express.Response) => {

    if (req.body.name != undefined && req.body.address != undefined         && isValidLng(req.body.lng) && isValidLat(req.body.lat)) {
        let newIdx:number = createNewIdx()
        let newLoc:Location = new Location(newIdx, req.body.name, req.body.address, parseFloat(req.body.lat), parseFloat(req.body.lng))

        locations[newIdx] = newLoc 

        res.send("Created new Location: <br>" + newLoc.toHTMLString())
    } else {
        res.send("Invalid location passed");
    }
});

// READ
locRouter.get('/location/:id', (req: express.Request, res: express.Response) => {
    let id: number = req.params.id
    if (id in locations) {
        res.send(locations[id].toHTMLString())
    } else {
        res.send("Could not find location for id: " + id)
    }
});

// UPDATE
locRouter.put('/location/:id', upload.array(), (req: express.Request, res: express.Response) => {
    let id: number = req.params.id
    if (id in locations) {
        let curLoc:Location = locations[id]

        if (req.body.name != undefined) {
            curLoc.setName(req.body.name);
        }

        if (req.body.address != undefined) {
            curLoc.setAddress(req.body.address);
        }

        if (isValidLng(req.body.lng)) {
            curLoc.setLng(parseFloat(req.body.lng))
        }

        if (isValidLat(req.body.lat)) {
            curLoc.setLat(parseFloat(req.body.lat))
        }

        res.send("Updated location: <br>" + curLoc.toHTMLString())
    } else {
        res.send("No location to update with id: " + id)
    }
});

// DELETE
locRouter.delete('/location/:id', (req: express.Request, res: express.Response) => {
    let id: number = req.params.id
    if (id in locations) {
        delete locations[id]
        deletedKeys.push(id)
        res.send("Deleted location with id: " + id)
    } else {
        res.send("No location to delete with id: " + id)
    }
});

locRouter.get('/closestlocation', (req: express.Request, res: express.Response) => {
    let addrs:string = req.query['address']
    if (Object.keys(locations).length == 0) {
        res.send("No stored locations in memory")
        return
    }

    googleMapsClient.geocode({
        address: addrs
    }, function(err, resp) {
        if (!err) {
            let loc = resp.json.results[0].geometry.location
            let closestLoc:Location = nearestLoc(loc.lat, loc.lng)

            res.send(closestLoc.toHTMLString())
        } else {
            console.log(err)
            res.send("An error occurred: " + err)
        }
    });
});

export = locRouter
