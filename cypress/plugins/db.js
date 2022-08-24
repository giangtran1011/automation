const sqlServer = require("cypress-sql-server");
const dbConfig = {
    host: '10.10.10.76',
    user: 'qateam',
    password: '~jsbDB__fA=H6?^C',
    database: DB_DATABASE,
};
module.exports = function queryDb(query, config, db) {

    // creates a new sql connection using credentials from cypress.json env's
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = config.env;



    if (db) {
        dbConfig.database = db;
    }

    const connection = sqlServer.createConnection(dbConfig);
    // start connection to db
    connection.connect();

    // exec query + disconnect to db as a Promise
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            if (error) reject(error);
            else {
                connection.end();
                return resolve(results);
            }
        });
    });
};