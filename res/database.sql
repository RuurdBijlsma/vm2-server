DROP TABLE IF EXISTS songs, users, usersongs;

create table songs
(
    ytid      text not null
        constraint song_pkey
            primary key,
    title     text not null,
    artist    text not null,
    thumbnail text,
    duration  integer,
    color     text
);

alter table songs
    owner to ruurd;

create table users
(
    id       serial not null
        constraint user_pkey
            primary key,
    name     text   not null,
    password text   not null
);

alter table users
    owner to ruurd;

create unique index users_name_uindex
    on users (name);

create table playlists
(
    id      serial not null
        constraint playlists_pk
            primary key,
    name    text   not null,
    created date
);

alter table playlists
    owner to ruurd;

create table userplaylists
(
    userid     integer not null
        constraint userplaylists_users_id_fk
            references users,
    playlistid integer not null
        constraint userplaylists_playlists_id_fk
            references playlists,
    constraint userplaylists_pk
        primary key (playlistid, userid)
);

alter table userplaylists
    owner to ruurd;

create table playlistsongs
(
    playlistid integer not null
        constraint playlistsongs_playlists_id_fk
            references playlists,
    songid     text    not null
        constraint playlistsongs_songs_ytid_fk
            references songs,
    constraint playlistsongs_pk
        primary key (playlistid, songid)
);

alter table playlistsongs
    owner to ruurd;



--password is hashed version of "defaultpass"
insert into users(name, password) values ('defaultuser','$2b$10$DQSMmD8ejf41/7GwJyHG4OJs6eATcozR9qhnJHNXbxu8KezavYSvi');
insert into playlists(name) values ('favorites');
insert into userplaylists(userid, playlistid) values(1,1);
