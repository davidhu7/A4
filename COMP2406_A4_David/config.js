let config = {};
config.db = {};

// create properties on the config.db object for the host and database names
const username = ""; // username for the MongoDB Atlas on cloud
const password = ""; // password for the MongoDB on cloud
const dbname = "community-fridge"; // name of the database that we want to connect to

const connectionURL = ""

// create properties on the config.db object for the host and database names
config.db.host = connectionURL;
config.db.name = dbname;

module.exports = config;
