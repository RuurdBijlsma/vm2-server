## How to set up:
### Requirements
* copy res/secrets.example.json to res/secrets.json
* fill in fields:
   * Postgres connection string
   * YoutubeSearch Data API V3 api key
   * LastFM api key
* Nodejs & npm
* Postgresql

### Setup
* Create postgresql database and execute res/database.sql in this database to create the required tables
   * Can be done on Linux with `psql -d databasename -f res/database.sql` assuming you are logged in to the proper postgres user
* Before first run, execute `npm install` in the main directory to install the required packages
* To run the server, execute `node main.js --experimental-modules`
* Point the client to the ip/domain of the server
