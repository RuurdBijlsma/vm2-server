import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import https from "https";
import {homedir} from "os";
import AccountManager from "./AccountManager";
import YoutubeSearch from "./YoutubeSearch";
import Database from "./Database";
import Song from "./Song";
import SongLoader from "./SongLoader";
import request from 'request';

//todo
//when refreshing (after removing song oid) caching status gets removed
// when quickly skipping thorugh search results some results load slower and overwrite the proper audio source

class ApiController {
    constructor() {
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.json());

        this.setRoutes();
    }

    setRoutes() {
        this.app.post('/register/', async (req, res) => {
            let success = await AccountManager.register(req.body.user, req.body.password);
            if (success) res.send("Success");
            else res.send("Fail");
        });
        this.secureRoute('/search/:query', async (req, res) => {
            let query = req.params.query;
            if (!query) return;

            let results = await YoutubeSearch.search(query);
            let songResults = results.map(d => Song.fromSearchObject(d));
            res.send(songResults);
        });
        this.secureRoute('/playlists/', async (req, res, userId) => {
            let playlists = await Database.getPlaylistsByUser(userId);
            res.send(playlists);
        });
        this.secureRoute('/createPlaylist/:playlistName', async (req, res, userId) => {
            await Database.createPlaylist(userId, req.params.playlistName);
            res.send({success: true});
        });
        this.secureRoute('/deletePlaylist/:playlistId', async (req, res, userId) => {
            await Database.deletePlaylist(userId, req.params.playlistId);
            res.send({success: true});
        });
        this.secureRoute('/songs/:playlistId', async (req, res, userId) => {
            let songs = await Database.getPlaylistById(userId, req.params.playlistId);
            res.send(songs.map(d => Song.fromDbObject(d)));
        });
        this.secureRoute('/favorites/', async (req, res, userId) => {
            let songs = await Database.getPlaylistByName(userId, 'favorites');
            res.send(songs.map(d => Song.fromDbObject(d)));
        });
        this.secureRoute('/save/:ytId/:playlistId', async (req, res, userId) => {
            let result = await SongLoader.addUserSong(userId, req.params.ytId, req.params.playlistId);
            res.send({success: result});
        });
        this.secureRoute('/remove/:ytId/:playlistId', async (req, res, userId) => {
            let result = await Database.removeFromPlaylist(userId, req.params.ytId, req.params.playlistId);
            res.send({success: result});
        });
        this.secureRoute('/info/:id', async (req, res) => {
            let songInfo = await SongLoader.getCachedSongInfo(req.params.id, true);
            res.send(songInfo);
        });
        this.app.get('/pipe/:url', async (req, res) => {
            let url = req.params.url;

            req.pipe(request.get(url)).pipe(res);
        });
    }

    secureRoute(route, onVisit) {
        this.app.post(route, async (req, res) => {
            console.info('[SEC]', route, {get: req.params}, {post: req.body});
            let userId = (await AccountManager.login(req.body.user, req.body.password)).id;
            if (!userId) return res.send('Not logged in');

            await onVisit(req, res, userId);
        });
    }

    static getHttpsCredentials() {
        try {
            let certPath = path.join(homedir(), 'ruurd.dev-ssl-bundle');
            return {
                key: fs.readFileSync(path.join(certPath, 'private.key.pem')),
                cert: fs.readFileSync(path.join(certPath, 'domain.cert.pem')),
            }
        } catch (e) {
            return false;
        }
    }

    start(port = 3000) {
        let credentials = ApiController.getHttpsCredentials();
        if (credentials) {
            const httpsServer = https.createServer(credentials, this.app);
            httpsServer.listen(port, () => console.log(`HTTPS app listening on port ${port}!`));
        } else {
            console.warn("Could not get HTTPS credentials, switching to HTTP");
            this.app.listen(port, () => console.log(`HTTP app listening on port ${port}!`));
        }
    }
}

export default new ApiController();