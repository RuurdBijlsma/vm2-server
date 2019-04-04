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
        this.secureRoute('/songs/', async (req, res, userId) => {
            let songs = await Database.songsByUser(userId);
            res.send(songs.map(d => Song.fromDbObject(d)));
        });
        this.secureRoute('/save/:id', async (req, res) => {
            res.send({success: true});
        });
        this.secureRoute('/remove/:id', async (req, res) => {
            res.send({success: true});
        });
        this.secureRoute('/await/:id', async (req, res) => {
            res.send({loaded: ytId});
        });
        this.app.get('/stream/:id', async (req, res) => {
            res.sendFile(fileName);
        });
        this.app.get('/download/:id', async (req, res) => {
            res.sendFile(fileName);
        });
    }

    secureRoute(route, onVisit) {
        this.app.post(route, async (req, res) => {
            console.info('[SEC]', route, req.param, req.body);
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