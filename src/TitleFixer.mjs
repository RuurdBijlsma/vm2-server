class TitleFixer {
    constructor() {
        this.brackets = ['[]', '()', '{}'];
        this.removeWords = ['audio', 'official', 'video', 'original',
            'music', 'lyrics', 'ultra', '4k', 'hd', '1080p', 'hq', 'edm',
            'audio', 'cover', 'art', 'lyric', 'club', 'radio', 'edit', 'vocals'];
        //by order of priority
        this.titleArtistSplitters = ['-', '–', '↬'];
        this.featuredArtistSplitter = ['ft.', ',', '&', 'vs', 'vs.','feat','feat.'];
    }

    getFeaturedArtists(artistString) {
        for (let splitter of this.featuredArtistSplitter) {
            artistString = artistString.replace(splitter, ',');
        }
        return artistString.split(',').map(a => a.trim());
    }

    static getMatchingBracket(word, openBracketIndex, openBracket = '(', closeBracket = ')') {
        let openBrackets = 0;
        for (let i = openBracketIndex; i < word.length; i++) {
            if (word[i] === openBracket)
                openBrackets++;
            if (word[i] === closeBracket)
                openBrackets--;
            if (openBrackets === 0)
                return i;
        }
        return -1;
    }

    artistAndTitleFromYtTitle(ytTitle) {
        let title = ytTitle;
        let artist = 'Unknown';

        for (let splitter of this.titleArtistSplitters) {
            if (ytTitle.includes(splitter)) {
                let info = title.split(splitter);
                if (info.length > 1) {
                    artist = this.fix(info[0]);
                    title = this.fix(info.slice(1).join('-'));
                }
                break;
            }
        }

        return [artist, title];
    }

    fixSong(song) {
        song.title = this.fix(song.title);
        song.artist = this.fix(song.artist);
        return song;
    }

    fix(title) {
        // Gets applied to title and artist strings
        for (let bracketType of this.brackets) {
            let openBracketIndices = [];
            for (let i = 0; i < title.length; i++)
                if (title[i] === bracketType[0]) {
                    let openBracketIndex = i;
                    let closeBracketIndex = TitleFixer.getMatchingBracket(title, openBracketIndex, bracketType[0], bracketType[1]);
                    if (closeBracketIndex >= 0) {
                        i = closeBracketIndex;
                        openBracketIndices.push([openBracketIndex, closeBracketIndex]);
                    }
                }

            for (let [openBracketIndex, closeBracketIndex] of openBracketIndices)
                for (let badWord of this.removeWords) {
                    let bracketPart = title.slice(openBracketIndex, closeBracketIndex).toLowerCase();
                    if (bracketPart.includes(badWord)) {
                        title = title.slice(0, openBracketIndex) + title.substr(closeBracketIndex + 1);
                        title = title.trim();
                    }
                }
        }

        //remove emojiis
        title = title.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
        return title.trim();
    }
}

export default new TitleFixer();