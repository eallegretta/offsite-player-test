'use strict';
mm.module('appConfig', function () {
    return {
        apiFullUrl: window.apiFullUrl
    };
});

mm.app(['epiosdeService', 'AudioContextPlayer', 'playerControls', 'playerUI', 'SoundManagerPlayer', 'WaveformDraw'],
    function (episodeService, AudioContextPlayer, playerControls, playerUI, SoundManagerPlayer, WaveformDraw) {

        var rootPath = '/areas/offsiteplayer/',
            nextEpisodeInfo = null,
            episodePlayer = null,
            playingEpisode = null,
            draw = null,
            loadingMessage = mm.byId('loading-message'),
            episodePlayerOptions = {
                episodeUrl: null,
                autoPlay: null
            };

        function start() {
        var hashVals = mm.getQueryStringValues();
            if (hashVals.episodeId && hashVals.hostId) {
                episodeService.getEpisodeInfo(hashVals.hostId, hashVals.episodeId, function (episode) {
                    mm.hide(loadingMessage);
                    playerUI(episode);
                    initPlayer(episode);
                    playingEpisode = episode;
                });
            } else {
                throw 'episodeId and hostId are missing in the url';
            }
        }

        //tries to build first and AudioContextPlayer (HTML5) if it si not supported creates a SounManager2Player
        function initPlayer(episode, autoPlay) {

            episodePlayerOptions.episodeUrl = episode.fileName;
            episodePlayerOptions.autoPlay = autoPlay;

            episodePlayer = new AudioContextPlayer(episodePlayerOptions);
            if (episodePlayer.tryInit()) {
                draw = new WaveformDraw(episodePlayer);
                setupControlsAndDraw(episodePlayer);
                episodePlayer.onAlmostFinished(getNextEpisodeInfo);
                episodePlayer.onFinished(onFinishNextEpisode);
                episodePlayer.onError(createSoundManagerPlayer);
            } else { //if HTML5 is not supported
                createSoundManagerPlayer();
            }
        }

        function createSoundManagerPlayer() {
            episodePlayer = null;
            mm.getScript(rootPath + 'bower_components/soundmanager2/script/soundmanager2-nodebug-jsmin.js', function () {
                episodePlayer = new SoundManagerPlayer(window.soundManager, episodePlayerOptions);
                draw = new WaveformDraw(episodePlayer);
                setupControlsAndDraw(episodePlayer);
                episodePlayer.onAlmostFinished(getNextEpisodeInfo);
                episodePlayer.onFinished(onFinishNextEpisode);
            });
        }

        function setupControlsAndDraw(episodePlayer) {
            playerControls(episodePlayer);
            episodePlayer.onPause(stopDrawing);
            episodePlayer.onFinished(stopDrawing);
            episodePlayer.onStop(stopDrawing);

            mm.on(window, 'resize', function () {
                draw.stopDrawing();
                draw.start();
            });

            function stopDrawing() {
                draw.stopDrawing();
            }

            episodePlayer.onPlay(function () {
                draw.start();
            });
        }


        function getNextEpisodeInfo() {
            episodeService.nextEpisodeInfo(playingEpisode.Host.HostId, playingEpisode.Id, function (episode) {
                nextEpisodeInfo = episode;
            });
        }

        function onFinishNextEpisode() {
            if (nextEpisodeInfo && nextEpisodeInfo.Id !== playingEpisode.Id) {
                playerUI(nextEpisodeInfo);
                initPlayer(nextEpisodeInfo, true); //autoplay in true
                playingEpisode = nextEpisodeInfo;
                nextEpisodeInfo = null;
            } else {
                episodePlayer.stop();
                episodePlayer.play(); //endless episode loop
            }
        }

        //Start
        start();

    });