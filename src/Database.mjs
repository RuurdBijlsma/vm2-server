import secrets from "../res/secrets.json";
import pg_promise from "pg-promise";

const pgp = pg_promise();

class Database {
    constructor() {
        this.db = pgp(secrets.connectionString);
    }

    async addSong(ytId, artist, title, thumbnail, duration, color) {
        try {
            return await this.db.none('INSERT INTO songs(ytid, title, artist, thumbnail, duration, color)  VALUES ($1, $2, $3, $4, $5, $6)',
                [ytId, title, artist, thumbnail, duration, color]);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async songById(ytId) {
        try {
            return await this.db.one('select * from songs where ytid = $1', ytId);
        } catch (e) {
            return false;
        }
    }

    async userIdByName(username) {
        try {
            return await this.db.one('select id from users where "name" = $1', username);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async passwordByUsername(username) {
        try {
            return await this.db.one('SELECT password FROM users WHERE "name" = $1', username);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async registerUser(username, hashedPassword) {
        try {
            return await this.db.none("insert into users(name, password) values ($1,$2)", [username, hashedPassword]);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async songsByUser(userId) {
        try {
            return await this.db.any('select ytid, title, artist, duration, thumbnail, color from songs inner join usersongs on usersongs.songid = songs.ytid where userid = $1 order by added desc', userId);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async addUserSong(userId, ytId, date) {
        try {
            return await this.db.none('INSERT INTO usersongs(userid, songid, added) VALUES ($1, $2, $3)', [userId, ytId, date]);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async removeUserSong(userId, ytId) {
        try {
            return await this.db.none('delete from usersongs where userid=$1 and songid = $2', [userId, ytId]);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }
}

export default new Database();