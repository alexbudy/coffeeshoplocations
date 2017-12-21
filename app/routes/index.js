const locRoutes = require('./location_routes');

module.exports = function(app, db) {
    locRoutes(app, db);
};
