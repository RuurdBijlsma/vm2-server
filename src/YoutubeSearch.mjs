import secrets from "../res/secrets.json";
import youtubeSearch from "youtube-search";
import TitleFixer from "./TitleFixer";

class YoutubeSearch {
    decodeEntities(encodedString) {
        const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
        const translate = {
            "nbsp": " ",
            "amp": "&",
            "quot": "\"",
            "lt": "<",
            "gt": ">"
        };
        return encodedString.replace(translate_re, function(match, entity) {
            return translate[entity];
        }).replace(/&#(\d+);/gi, function(match, numStr) {
            const num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
    }

    async search(query, category, maxResults = 50) {
        const key = secrets.ytKey;

        return new Promise((resolve, error) => {
            const opts = {
                maxResults,
                key: key,
                type: 'video'
            };
            if (category !== undefined)
                opts.videoCategoryId = category;

            youtubeSearch(query, opts, (err, results) => {
                if (err) error(err);

                if (results) {
                    let resultSongs = results.map(song => {
                        let [artist, title] = TitleFixer.artistAndTitleFromYtTitle(this.decodeEntities(song.title));
                        return {
                            ytid: song.id,
                            title: title,
                            artist: artist,
                            thumbnail: song.thumbnails.high.url
                        }
                    });

                    resolve(resultSongs);
                }
            });
        });
    }
}

export default new YoutubeSearch();