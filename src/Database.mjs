import secrets from "../res/secrets.json";
import pg_promise from "pg-promise";

const pgp = pg_promise();

class Database {
    constructor() {
        this.db = pgp(secrets.connectionString);
    }

    async getUserIdByName(username) {
        try {
            return await this.db.one('select id from users where "name" = $1', username);
        } catch (e) {
            console.log("PG ERROR", e)
        }
    }

    async getPasswordByUsername(username) {
        try {
            return await this.db.one('SELECT password FROM users WHERE "name" = $1', username);
        } catch (e) {
            console.log("PG ERROR", e)
        }
    }

    async registerUser(username, hashedPassword) {
        try {
            return await this.db.none("insert into users(name, password) values ($1,$2)", [username, hashedPassword]);
        } catch (e) {
            console.log("PG ERROR", e)
        }
    }

    async songsByUser(userId) {
        try {
            return await db.any('select ytid, title, artist, duration, viewcount, thumbnail, color from songs inner join usersongs on usersongs.songid = songs.ytid where userid = $1 order by added desc', userId);
        } catch (e) {
            console.log("PG ERROR", e)
        }
    }
}

export default new Database();