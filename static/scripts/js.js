var timer = undefined;
var time = 500;
var scrollDiv = $('.scrollable');

function scrollCheck() {
    var sHeight = Math.round(scrollDiv.prop('scrollHeight'));
    var dHeight = Math.round(scrollDiv.height());

    if (sHeight > dHeight) {
        scrollDiv.slimScroll({
            position: 'right',
            color: '#30a',
            opacity: 0.75,
            width: '100%',
            height: '100%',
            wheelStep: '10'
        })
            .css({
                'padding-right':'10px'
            });
    } else {
        scrollDiv.unbind()
            .css({
                'padding-right':'0'
            });
    }
}

$(window).resize(function() {
    scrollCheck();
});

$('#searchResults').append(showRequirements());



$('#searchField').on('input', function () {
    setTimer();
});

function setTimer() {
    clearTimeout(timer);
    timer = setTimeout(function() {
        populateResults(function() {
            scrollCheck();
        });
    }, time);
}

function trackRow(track) {
    var obj = trackObject(track);

    var colArtist = $('<div></div>')
        .addClass('searchCol')
        .css('width', '25%')
        .text(obj.artist);
    var colName = $('<div></div>')
        .addClass('searchCol')
        .css('width', '25%')
        .text(obj.name);
    var colAlbum = $('<div></div>')
        .addClass('searchCol')
        .css('width', '20%')
        .text(obj.album);
    var colCover = $('<div></div>')
        .addClass('searchCol')
        .css('width', '5%')
        .html(makeImage(obj.cover));
    var colDuration = $('<div></div>')
        .addClass('searchCol')
        .css({'width': '10%', 'text-align': 'right'})
        .text(obj.duration);

    if (track.noPic) {
        colCover.html('Cover');
    }
    if (track.noDur) {
        colDuration.html('Duration');
    }

    var rowClass = 'searchRow';

    if (track.noClick) {
        rowClass = 'searchHeaderRow';
    }

    return $('<div></div>')
        .data('uri', obj.uri)
        .addClass(rowClass)
        .append(colCover)
        .append(colArtist)
        .append(colName)
        .append(colAlbum)
        .append(colDuration);
}

function trackObject(track) {
    var obj = {
        name: track.name,
        album: track.album.name,
        artist: '',
        cover: track.album.images[0].url,
        uri: track.uri,
        duration: millisToMinutesAndSeconds(track.duration_ms)
    };

    for (var i = 0; i < track.artists.length; i++) {
        if (i > 0) {
            obj.artist += ', '
        }
        obj.artist += track.artists[i].name;
    }

    return obj;
}

function populateResults(callback) {
    var text = $('#searchField').val().trim();
    var uri = isURI(text);
    if (uri.bool) {
        $.get('/track/' + uri.id, function(data) {
            var obj = trackObject(data);
            showForm(obj);
        });
    } else {
        var searchContainer = $('#searchResults');
        searchContainer.empty();
        $.ajax({
            url: '/search',
            method: 'POST',
            data: {text: text},
            success: function (data) {
                if (data.tracks) {

                    searchContainer.append(trackRow(headerObject()));

                    var tracks = data.tracks.items;
                    for (var i = 0; i < tracks.length; i++) {
                        searchContainer.append(trackRow(tracks[i]));
                    }

                    $('.searchRow').click(function() {

                        var div = $(this);
                        var children = div.children('div');
                        var obj = {
                            uri: div.data('uri'),
                            cover: $($(children[0]).html()).attr('src'),
                            artist: $(children[1]).html(),
                            name: $(children[2]).html(),
                            album: $(children[3]).html(),
                            duration: $(children[4]).html()
                        };

                        showForm(obj);
                    });

                    callback();

                } else {
                    searchContainer
                        .empty()
                        .append(showRequirements());

                    callback();
                }
            }
        });
    }
}

function makeImage(url) {
    return $('<img>')
        .addClass('roundImage coverImage')
        .attr('src', url);
}

function getLastElement(input, symbol) {
    var arr = input.split(symbol);
    return arr[arr.length -1];
}

function isURI(text) {
    if (text.indexOf('spotify:') > -1) {
        var last = getLastElement(text, ':');
        if (last.length === 22) {
            return {
                id: last,
                bool: true
            };
        }
    } else if (text.indexOf('https://') > -1) {
        var last = getLastElement(text, '/');
        if (last.length === 22) {
            return {
                id: last,
                bool: true
            };
        }
    }
    return {bool: false};
}

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function headerObject() {
    return {
        name: 'Name',
        album: {
            name: 'Album',
            images: [{
                url: false
            }]
        },
        artists: [{
            name: 'Artist'
        }],
        noPic: true,
        noDur: true,
        noClick: true,
        uri: false
    };
}

function showForm(track) {
    $('#formSubmit').prop('disabled', true);
    $('#formTitle').text(track.name);
    $('#formDuration').text(track.duration);
    $('#formCover').css('background-image', 'url(' + track.cover + ')');
    $('#formArtist').text(track.artist);
    $('#formAlbum').text(track.album);
    $('#formContainer')
        .css({
            'opacity': 0,
            'top':'-200px'
        })
        .show()
        .animate({
            opacity: 1,
            top: '0px'
        }, 500);

    $('#hAlbum').val(track.album);
    $('#hArtist').val(track.artist);
    $('#hCover').val(track.cover);
    $('#hDuration').val(track.duration);
    $('#hName').val(track.name);
    $('#hUri').val(track.uri);
}

$('#suggestForm').submit(function(e) {
    e.preventDefault();
    var obj = {};

    var arr = $(this).serializeArray();
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i].name] = arr[i].value;
    }

    submitForm(obj);
    hideForm();
});

function hideForm() {
    var field = $('#searchField');
    if (isURI(field.val()).bool) {
        field.val('');
    }

    $('#formContainer')
        .animate({
            opacity: 0,
            top: '-200px'
        }, 500, function() {
            $(this).hide();
            $('#commentField').val('');
            //$('#formSubmit').off();
        });
}

function enableSubmit() {
    $('#formSubmit').prop('disabled', false);
}
function disableSubmit() {
    $('#formSubmit').prop('disabled', true);
}

function submitForm(data) {
    $('#searchField').val('');

    data.posterName = posterName;
    data.posterUrl = posterUrl;
    data.posterId = posterId;
    data.posterCountry = posterCountry;

    $.ajax({
        url: '/send',
        method: 'POST',
        data: data,
        success: function (res) {
            $('#searchResults').html(res.msg);
        }
    });
}

function showHelp() {
    var div = $('#helper');
    div.show();

    var innerDiv = $('<div></div>')
        .addClass('helperPic');

    div.append(innerDiv);

    $(div).click(function () {
        div.hide();
        div.empty();
    });
}

function showRequirements() {
    var list = $('<ul></ul>')
        .append(listItem('Has to feature female vocals.'))
        .append(listItem('Has to be produced electronically or have electronic elements.'));

    return $('<div></div>')
        .addClass('requirements')
        .append('The only requirements for your recommendations:')
        .append(list);
}

function listItem(text) {
    return $('<li></li>').append(text);
}