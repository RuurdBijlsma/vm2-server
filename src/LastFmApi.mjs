import secrets from "../res/secrets.json";
import http from "http";
import * as https from "https";

class LastFmApi {
    constructor() {
        this.baseUrl = 'https://ws.audioscrobbler.com/2.0/?';
    }

    async search(query) {
        let url = `${this.baseUrl}method=track.search&track=${query}&api_key=${secrets.lastFmKey}&format=json`;
        url = encodeURI(url);
        return JSON.parse(await this.get(url)).results.trackmatches.track;
    }

    async get(url) {
        return new Promise((resolve, error) => {
            https.get(url, res => {
                if (Math.floor(res.statusCode / 100) === 2) {
                    let str = '';
                    res.on('data', chunk => {
                        str += chunk;
                    });
                    res.on('end', function () {
                        resolve(str);
                    });
                } else {
                    error(res)
                }
            });
        })
    }
}

export default new LastFmApi();