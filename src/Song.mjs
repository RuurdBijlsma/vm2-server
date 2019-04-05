class Song {
    constructor(id, title, artist, thumbnail, color, duration) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.thumbnail = thumbnail;
        this.duration = duration;
        this.color = color;
    }

    static fromDbObject(data) {
        //db data: ytid, title, artist, duration, thumbnail, color
        return new Song(data.ytid, data.title, data.artist, data.thumbnail, data.color, data.duration);
    }

    static fromSearchObject(data) {
        //search data: ytid, title, artist, thumbnail, color
        return new Song(data.ytid, data.title, data.artist, data.thumbnail, data.color);
    }
}

export default Song;