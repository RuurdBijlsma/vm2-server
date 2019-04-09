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
            let lastUserId = 0,
                lastPlaylistId = 0;
            try {
                lastUserId = (await this.db.one('select id from users order by id desc limit 1')).id
            } catch (e) {
            }
            await this.db.none("insert into users(id, name, password) values ($1,$2,$3)", [lastUserId + 1, username, hashedPassword]);
            try {
                lastPlaylistId = (await this.db.one('select id from playlists order by id desc limit 1')).id;
            } catch (e) {
            }
            await this.db.none("insert into playlists(id, name, created) values ($1,$2,$3)", [lastPlaylistId + 1, 'favorites', new Date()]);
            await this.db.none("insert into userplaylists(userid, playlistid) values ($1,$2)", [lastUserId + 1, lastPlaylistId + 1]);
            return lastUserId + 1;
        } catch (e) {
            console.error("PG ERROR", e);
            return false;
        }
    }

    async getPlaylistsByUser(userId) {
        try {
            return await this.db.any('select playlistid, name, created\n' +
                'from playlists inner join userplaylists u on playlists.id = u.playlistid\n' +
                'where userid = $1', userId);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async createPlaylist(userId, playlistName) {
        // todo playlist name unique voor zelfde user requirement
        try {
            let lastPlaylistId = (await this.db.one('select id from playlists order by id desc limit 1')).id;
            await this.db.none('INSERT INTO playlists(id, name, created) VALUES ($1, $2, $3)', [lastPlaylistId + 1, playlistName, new Date()]);
            await this.db.none('INSERT INTO userplaylists(userid, playlistid) VALUES ($1, $2)', [userId, lastPlaylistId + 1]);
            return lastPlaylistId + 1;
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async deletePlaylist(userId, playlistId) {
        await this.db.none('delete\n' +
            'from userplaylists\n' +
            'where userid = $1\n' +
            '  and playlistid = $2);', [userId, playlistId]);
        //check for dangling play lists
    }

    async getPlaylistByName(userId, playlistName) {
        try {
            return await this.db.any('select ytid, title, artist, duration, thumbnail, color\n' +
                'from songs\n' +
                '         inner join playlistsongs p on songs.ytid = p.songid\n' +
                '         inner join playlists p2 on p.playlistid = p2.id\n' +
                '         inner join userplaylists u on p2.id = u.playlistid\n' +
                'where userid = $1\n' +
                '  and p2.name = $2\n' +
                'order by added desc', [userId, playlistName]);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async getPlaylistById(userId, playlistId) {
        try {
            return await this.db.any('select ytid, title, artist, duration, thumbnail, color\n' +
                'from songs\n' +
                '         inner join playlistsongs p on songs.ytid = p.songid\n' +
                '         inner join playlists p2 on p.playlistid = p2.id\n' +
                '         inner join userplaylists u on p2.id = u.playlistid\n' +
                'where userid = $1\n' +
                '  and p2.id = $2\n' +
                'order by added desc', [userId, playlistId]);
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async addToPlaylist(userId, ytId, playlistId) {
        try {
            let owner = (await this.db.one('select userid from userplaylists where playlistid = $1', playlistId)).userid;
            if (owner !== userId) // This user does not have rights to alter this playlist
                return false;
            await this.db.none('INSERT INTO playlistsongs(playlistId, songid, added) VALUES ($1, $2, $3)', [playlistId, ytId, new Date()]);
            return true;
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }

    async removeFromPlaylist(userId, ytId, playlistId) {
        try {
            let owner = (await this.db.one('select userid from userplaylists where playlistid = $1', playlistId)).userid;
            if (owner !== userId) // This user does not have rights to alter this playlist
                return false;
            await this.db.none('delete from playlistsongs where playlistid=$1 and songid = $2', [playlistId, ytId]);
            return true;
        } catch (e) {
            console.error("PG ERROR", e);
        }
    }
}

export default new Database();