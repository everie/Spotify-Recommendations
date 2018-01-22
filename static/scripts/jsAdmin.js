function addFlag(flags, track) {
    for (var i = 0; i < flags.length; i++) {
        if (flags[i].code === track.posterCountry) {
            track.flag = flags[i].flag;
            break;
        }
    }

    return track;
}

function populateRecommendations(callback) {
    var recContainer = $('#recommendations');
    recContainer.empty();
    $.ajax({
        url: '/list',
        method: 'GET',
        success: function (data) {

            if (data.tracks) {

                $.ajax({
                    url: '/playlist',
                    method: 'GET',
                    success: function (playlist) {

                        $.ajax({
                            url: '/flags',
                            method: 'GET',
                            success: function (flags) {

                                recContainer.append(recRow(headerRecObject(), false));

                                for (var i = 0; i < data.tracks.length; i++) {
                                    var t = data.tracks[i];

                                    recContainer
                                        .append(recRow(addFlag(flags, t),
                                            playlist.indexOf(getLastElement(t.uri, ':')) > -1, i));
                                }

                                $('.recAdd').click(function() {
                                    $.ajax({
                                        url: '/add',
                                        method: 'POST',
                                        data: {
                                            uri: $(this).data('uri')
                                        },
                                        success: function (res) {
                                            populateRecommendations(function() {
                                                scrollCheck();
                                            });
                                        }
                                    });
                                });
                                $('.recDelete').click(function() {
                                    $.ajax({
                                        url: '/delete/' + $(this).data('index'),
                                        method: 'POST',
                                        success: function (res) {
                                            populateRecommendations(function() {
                                                scrollCheck();
                                            });
                                        }
                                    });
                                });

                                callback();
                            }
                        });
                    }
                });

            } else {
                callback();
            }
        }
    });
}

function recRow(track, hasTrack, index) {

    var trackTable = '';
    if (!track.noTrack) {
        trackTable = makeTrackTable(track);
    }

    var trackComment = '';

    if (track.comment.trim().length > 0) {
        trackComment = $('<div></div>')
            .addClass('trackComment')
            .append('\"' + track.comment.trim() + '\"');
    }

    var divTrack = $('<div></div>')
        .addClass('recCol')
        .css('width', '70%')
        .append(trackTable)
        .append(trackComment);

    var spanFlag = $('<span></span>')
        .append(makeFlag(track.flag));

    var divPoster = $('<div></div>')
        .addClass('recCol')
        .css('width', '20%')
        .append(spanFlag)
        .append('<a target="_new" href="' + track.posterUrl + '">' + track.posterName + '</a>');

    var buttonClass = 'recAdd ion-checkmark-round';
    if (hasTrack) {
        buttonClass = 'recNoAdd ion-close-round';
    }

    var addButton = $('<button></button>')
        .data('uri', track.uri)
        .addClass(buttonClass);

    var delButton = $('<button></button>')
        .data('index', index)
        .addClass('recDelete ion-trash-b');

    var divAdd = $('<div></div>')
        .addClass('recCol')
        .css({'width': '10%', 'text-align': 'right'})
        .append('<div></div>').append(addButton)
        .append('<div></div>').append(delButton);

    var rowClass = 'recRow';

    if (track.noTrack) {
        rowClass = 'recHeaderRow';
        divTrack.html('Track');
        divPoster.html('Poster');
        divAdd.html('Add');
    }

    return $('<div></div>')
        .data('uri', track.uri)
        .addClass(rowClass)
        .append(divTrack)
        .append(divPoster)
        .append(divAdd);
}

function headerRecObject() {
    return {
        name: 'Name',
        album: 'Album',
        artist: 'Artist',
        cover: false,
        comment: 'Comment',
        date: 'Date',
        noTrack: true
    };
}

function makeFlag(url) {
    return $('<img>')
        .addClass('flagImage')
        .attr('src', url);
}

function makeTrackTable(track) {
    var cover = $('<div></div>')
        .addClass('trackCover')
        .css('background-image', 'url("' + track.cover + '")');

    var trackTitle = $('<div></div>')
        .addClass('trackInnerCell trackCol')
        .append('<a target="_new" href="' + trackLink(track.uri) + '">' + track.name + '</a>');
    var trackArtist = $('<div></div>')
        .addClass('trackInnerCell trackCol')
        .append(track.artist);

    var trackAlbum = $('<div></div>')
        .addClass('trackInnerCell trackCol')
        .append(track.album);
    var trackDuration = $('<div></div>')
        .addClass('trackInnerCell trackCol')
        .append(track.duration);

    var innerLeft = $('<div></div>')
        .addClass('innerLeft')
        .append(trackTitle)
        .append(trackArtist);
    var innerRight = $('<div></div>')
        .addClass('innerRight')
        .append(trackDuration)
        .append(trackAlbum);

    var trackLeft = $('<div></div>')
        .addClass('trackLeft')
        .append(cover);
    var trackRight = $('<div></div>')
        .addClass('trackRight')
        .append(innerLeft)
        .append(innerRight);

    return $('<div></div>')
        .addClass('trackContainer')
        .append(trackLeft)
        .append(trackRight);
}

function trackLink(uri) {
    return 'https://open.spotify.com/track/' + getLastElement(uri, ":");
}