import secrets from "../res/secrets.json";
import youtubeSearch from "youtube-search";
import TitleFixer from "./TitleFixer";

class YoutubeSearch {
    async search(query, category, maxResults = 50) {
        const key = secrets.ytKey;

        return new Promise((resolve, error) => {
            const opts = {
                maxResults: maxResults,
                key: key,
                type: 'video'
            };
            if (category !== undefined)
                opts.videoCategoryId = category;

            youtubeSearch(query, opts, (err, results) => {
                if (err) error(err);

                if (results) {
                    let resultSongs = results.map(song => {
                        let [artist, title] = TitleFixer.artistAndTitleFromYtTitle(song.title.replace('&amp;','&'));
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