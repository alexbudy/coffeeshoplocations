# coffeeshoplocations
## A Node.js API application for keeping track of coffee shop locations, and retrieving nearest locations

## Table Of Contents
  * [Installation Instructions](#installation-Instructions)
  * [CRUD Operations](#crud-operations)
  * [Nearest Coffee Shop To Address](#nearest-coffee-shop-to-address)

## Installation Instructions
To start the server locally, first clone the repo using this command:

`git clone git@github.com:alexbudy/coffeeshoplocations.git`

Now install all needed Node.js dependencies, as declared in `package.json`:

`npm install`

After a succesful install of the dependencies to the `node_modules` folder, the server can be run with:

`node server.js`

And is live on `localhost:8000` (please make sure no other application is using port 8000 locally)

## CRUD Operations
The server provides four operations for managing existing coffee shop locations: Create (POST), Read (GET), Update (PUT), Delete (DELETE)
For sending POST, PUT, and DELETE requests to the server, I used a free app called Postman, available [here](https://www.getpostman.com/)

### Read a Coffee Shop by ID (GET)
The simplest request to the API is the GET request. In the URL enter `localhost:8000\location\[:id]` where id is the known id of the coffee shop. A successful response will show something like this:

![success](https://i.imgur.com/XfJJfmp.png?1)

And a failed response will show an error in the browser

### Create a New Coffee Shop Location (POST)
Using Postman (or another tool of preference) send a POST request to the server to `locahost:8000\location`, and add four key/value pairs to the body with the following keys:
`name, address, lng, lat`

![Postman POST](https://i.imgur.com/CJPWcV6.png)

Validation will be performed for the coordinates (making sure they are valid float values and within the appropriate latitude/longitude range) and if successful a new coffee shop will be added to memory, and its ID returned

### Update an Existing Coffee Shop (PUT)
Send a PUT request to `localhost:8000\location\[:id]`, with any/all of the valid keys: `name, address, lng, lat`. Valid values will be updated and invalid/not provided values skipped. A valid [:id] value needs to be provided for an existing coffee shop

### Delete a Coffee Shop (DELETE)
Send a DELETE request to `location:8000\location\[:id]` to delete an existing coffee shop in memory.  If a coffee shop is not in memory with that [:id], no deletion will take place

## Nearest Coffee Shop To Address
Along with managing the coffee shop locations, the API provides a nearest coffee shop (straight line distance) to a given address endpoint.
The `closestlocation` route with the `address` parameter does a lookup for the closest coffeeshop location. Here is an example:

`http://localhost:8000/closestlocation?address=252+Guerrero+St,+San+Francisco,+CA+94103,+USA`

252 Guerrero St, San Francisco, CA is input to the API, and Four Barrell Coffee is returned (id: 28) 

