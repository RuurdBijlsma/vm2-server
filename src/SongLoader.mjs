import LastFmApi from "./LastFmApi";
import horizon from "horizon-youtube-mp3";
import Database from "./Database";
import Vibrant from "node-vibrant";

class SongLoader {
    constructor() {
        this.youtubeBaseUrl = 'https://youtube.com/watch?v=';
    }

    async addUserSong(userId, ytId) {
        await this.getCachedSongInfo(ytId);
        await Database.addUserSong(userId, ytId, new Date());
    }

    async getCachedSongInfo(ytId, includeUrl = false) {
        let songInfo = Database.songById(ytId);

        if (includeUrl || !songInfo) {
            let updatedInfo = await this.getCurrentSongInfo(ytId);
            let {artist, title, thumbnail, duration, color} = updatedInfo;
            if (!songInfo)
                await Database.addSong(ytId, artist, title, thumbnail, duration, color);
            songInfo = updatedInfo;
        }

        if (!includeUrl)
            delete songInfo.url;

        return songInfo;
    }

    async getCurrentSongInfo(ytId) {
        let songInfo = await this.getCleanYtInfo(ytId);
        let dbSongInfo = await Database.songById(ytId);
        if (dbSongInfo) {
            dbSongInfo.url = songInfo.url;
            return dbSongInfo;
        }

        let lastFmInfo = await this.getLastFmInfo(songInfo.fullName);

        delete songInfo.fullName;

        if (!lastFmInfo) return songInfo;

        songInfo.artist = lastFmInfo.artist;
        songInfo.title = lastFmInfo.title;
        if (lastFmInfo.thumbnail)
            songInfo.thumbnail = lastFmInfo.thumbnail;

        songInfo.color = await this.getThumbnailColor(songInfo.thumbnail);

        return songInfo;
    }

    async getCleanYtInfo(ytId) {
        let ytInfo = await this.getFullYtInfo(ytId);

        let audioUrls = ytInfo.videoFormats.filter(format => format.type.includes('audio'));
        if (audioUrls.length === 0)
            audioUrls = ytInfo.videoFormats;

        let sorted = audioUrls.sort((a, b) => b.audioBitrate - a.audioBitrate);
        if (!sorted[0].audioBitrate)
            sorted = audioUrls.sort((a, b) => (+b.bitrate) - (+a.bitrate));

        if (!sorted[0].bitrate)
            sorted = audioUrls.sort((a, b) => (+b.audio_sample_rate) - (+a.audio_sample_rate));

        let url = sorted[0].url;
        let duration = ytInfo.videoTimeSec;
        let artist = 'Unknown';
        let title = ytInfo.videoName;
        let thumbnail = '';

        let info = title.split('-');
        if (info.length > 1) {
            artist = info[0];
            title = info.slice(1).join('-');
            thumbnail = ytInfo.videoThumbList[ytInfo.videoThumbList.length - 1].url;
        }

        return {fullName: ytInfo.videoName, artist, title, thumbnail, duration, url};
    }


    async getLastFmInfo(name) {
        let lastFmInfo = await LastFmApi.search(name);
        if (lastFmInfo.length === 0) return false;

        let artist = lastFmInfo[0].artist;
        let title = lastFmInfo[0].name;
        let thumbnail = lastFmInfo[0].image.find(i => i.size === 'extralarge')['#text'];
        if (!thumbnail)
            thumbnail = ytInfo.videoThumbList[ytInfo.videoThumbList.length - 1].url;

        return {artist, title, thumbnail};
    }

    async getFullYtInfo(ytId) {
        return new Promise((resolve, error) => {
            horizon.getInfo(this.youtubeBaseUrl + ytId, (err, data) => {
                if (err) return error(err);
                resolve(data);
            })
        });
    }

    async getThumbnailColor(thumbnailUrl) {
        let palette = await Vibrant.from(thumbnailUrl).getPalette();
        if (palette.Vibrant) {
            return palette.Vibrant.getHex();
        } else {
            for (let prop in palette)
                if (palette[prop] !== null)
                    return palette[prop].getHex();
            return '#6a23ff';
        }
    }
}

export default new SongLoader();