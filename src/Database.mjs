import secrets from "../res/secrets.json";
import pg_promise from "pg-promise";

const pgp = pg_promise();

export default class Database {
    constructor() {
        this.db = pgp(secrets.connectionString);
    }

    async songsByUser(userId) {
        try {
            return await db.any('select ytid, title, artist, duration, viewcount, thumbnail, color from songs inner join usersongs on usersongs.songid = songs.ytid where userid = $1 order by added desc', userId);
        } catch (e) {
            console.log("PG ERROR", e)
        }
    }
}