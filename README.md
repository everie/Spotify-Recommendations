# Spotify Recommendations
A small program to manage recommendations for spotify playlists.

# Why?
I have a playlist on Spotify which have gained popularity and wanted a way for people to recommend me new music.

Thought it would be too simple to add an email, so I decided to make a small web application for it. Turned out more advanced than I had initially intended.

# Features
* Users can send recommendations via links or on-site search.
* Owner can add tracks to the playlist from the Admin-view.

# Future features
* Send an email when receiving a new recommendation
* Add more than one "owner" of a playlist.
* We'll see.

# How hard is it to implement as-is?
With a bit of knowledge of javascript and css it should be fairly easy to customise for your own needs.

# Setup

1. Make sure `nodejs` and `npm` are installed.

2. You will also need the following:

    * __A Spotify API key.__ This can be obtained at the Spotify Developer Dashboard. Detailed instructions can be found [here](https://developer.spotify.com/documentation/web-api/quick-start/)
    * __A reCAPTCHA API key.__ This can be obtained [here](https://www.google.com/recaptcha). Make sure to apply for reCAPTCHA v2.

3. Clone the repository to a folder, enter the folder and run `npm install` to install the required dependencies.

4. Copy or rename the file `settings.json-mock` to `settings.json` and edit it to your liking.

    #### title

    The title that will be shown to the users. This should preferrably be the title of your Spotify playlist to which you want users to submit their recommendation.

    #### playlistId

    The id of your Spotify playlist. This should take the form of the last part of the Spotify URI to the Playlist, for example `3Al0Ufw0MzsuRFqh6OG03v`.

    #### callback

    The callback to be used by the Spotify API to send the user back to your site. If you are hosting the app at the default port of `3000` at your own computer for example, this might be `http://localhost:3000/callback`. Also make sure to add this URL to the list of allowed callback URLs for your Spotify app in the Spotify Developer Dashboard.

    #### port

    The port where this web app is to be hosted.

    #### clientId

    This should be set to the client id as provided by the Spotify Developer Dashboard.

    #### clientSecret

    This should be set to the client secret as provided by the Spotify Developer Dashboard.

    #### ownerId

    The Spotify account name for the owner of the site.

    #### recaptchaSiteKey

    The site key as provided by the reCAPTCHA dashboard.

    #### recaptchaSecret

    The secret as provided by the reCAPTCHA dashboard.

    #### useSmtp

    Set this to true if you want to use SMTP for sending an email whenever a new track is submitted. If set to `false`, all other SMTP settings will be ignored.

    #### smtpPort

    The port to use for connecting to the SMTP server. This will usually be 465 if SSL is used.

    #### smtpHost

    The host to use for connecting to the server, for example `smtp.gmail.com` to use GMail's SMTP servers.

    #### smtpSecure

    Whether or not to use secure connection for the SMTP communication.

    #### smtpUser

    The username to use when authenticating with the SMTP server. In most cases, this will be your e-mail address.

    #### smtpPassword

    The password to use when authenticating with the SMTP server.

    #### smtpFrom

    The sender address to use for the emails sent. This does not have to be a valid e-mail address.

    #### smtpTo

    The e-mail address which will receive the emails. Probably your own e-mail address in most cases.

5. Copy or rename the file `db/db.json-mock` to `db/db.json`.

6. Launch the app using the `rec.sh` script.

You are now ready to accept recommendations to your playlist!

