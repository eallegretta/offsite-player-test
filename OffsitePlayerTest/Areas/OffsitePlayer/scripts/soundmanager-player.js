//Episode player has the responsability of playing an Episode
//And expose the progress and waveDate data
//SMPlayer will work with browsers that do not have AudioContext
'use strict';
mm.module('SoundManagerPlayer', function () {

    return function(sm, options) {
        var swfFolder = '/Areas/OffsitePlayer/bower_components/soundmanager2/swf/',
            config = {
                episodeUrl: null
            };
        mm.extend(config, options);

        var self = this,
            empty512Array = new Array(513).join(0).split(''), //array length 512 filled with 0
            episodeToPlay = null, //the SM audio
            almostFinishedPercentage = 95,
            almostFinishedEventFired = false,
            readyToPlayEvent = mm.Callbacks('readyToPlayCallbacks'),
            onDownloadedEvent = mm.Callbacks('onFinishDonwloadEpisode'),
            onPlayEvent = mm.Callbacks('onPlay'),
            onPauseEvent = mm.Callbacks('onPause'),
            onFinishEvent = mm.Callbacks('onFinished'),
            onStopEvent = mm.Callbacks('onStop'),
            onAlmostFinishEvent = mm.Callbacks('onAlmostFinished-AudioContext'),
            whilePlayingEvent = mm.Callbacks('whilePlayingCallbacks');


        //PROPERTIES
        //whave data is updated in each whilePlaying
        this.waveformData = null;
        //the position on the episode while playing
        this.percentagePosition = 0;
        //the percentage of downloaded audio
        this.percentageDownloaded = 0;
        //when the player is playing
        this.isPlaying = false;
        //the total duration of the episode in string
        this.duration = 0;
        //duration in MS
        this.durationMs = 0;
        //the played time of the episode in string
        this.time = 0;

        //EVENTS
        this.onReadyToPlay = readyToPlayEvent.add;
        this.onWhilePlaying = whilePlayingEvent.add;
        this.onDownloaded = onDownloadedEvent.add;
        this.onPlay = onPlayEvent.add;
        this.onPause = onPauseEvent.add;
        this.onStop = onStopEvent.add;
        this.onFinished = onFinishEvent.add;
        this.onAlmostFinished = onAlmostFinishEvent.add;

        //Player Actions
        this.setPosition = null;

        this.play = function(url) {
            if (url && config.episodeUrl !== url) { //if is a new audio create it
                episodeToPlay = null;
                createEpisodeAudio(url);
                config.episodeUrl = url;
            }

            if (!this.isPlaying) {
                episodeToPlay.play();
                onPlayEvent.fire();
                this.isPlaying = true;
            }

            setWaveFormData(); //init data for the outside
        };

        this.stop = function() {
            if (this.isPlaying) {
                episodeToPlay.stop();
                this.isPlaying = false;
                onStopEvent.fire();
            }
        };

        this.pause = function() {
            if (this.isPlaying) {
                episodeToPlay.pause();
                this.isPlaying = false;
                onPauseEvent.fire();
            }
        };

        this.togglePause = function(url) {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play(url);
            }
        };

        //convert milliseconds to hh:mm:ss, return as object literal or string
        this.getTime = function getTime(msec, useString) {
            var nSec = Math.floor(msec / 1000),
                hh = Math.floor(nSec / 3600),
                min = Math.floor(nSec / 60) - Math.floor(hh * 60),
                sec = Math.floor(nSec - (hh * 3600) - (min * 60));

            // if (min === 0 && sec === 0) return null; // return 0:00 as null
            return (useString ? ((hh ? hh + ':' : '') + (hh && min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec)) : { 'min': min, 'sec': sec });
        };

        //HANDLE EVENTS
        this.onWhilePlaying(whilePlaying);
        this.onDownloaded(function(ok) {
            if (ok) { //update final duration
                self.duration = self.getTime(self.duration, true);
                self.durationMs = episodeToPlay.durationEstimate;
            } else if (this._iO && this._iO.onerror) {
                this._iO.onerror();
            }
        });

        this.onReadyToPlay(function () {
            if (config.autoPlay) {
                self.play();
            }
        });

        function setWaveFormData() {
            self.waveformData = episodeToPlay.waveformData && episodeToPlay.waveformData.left && episodeToPlay.waveformData.left.length > 1 ?
                episodeToPlay.waveformData.left.concat(episodeToPlay.waveformData.right) : empty512Array;
        }

        function whilePlaying() {
            if (episodeToPlay.position && episodeToPlay.durationEstimate) {
                self.percentagePosition = episodeToPlay.position / episodeToPlay.durationEstimate * 100;
                self.percentageDownloaded = episodeToPlay.bytesLoaded / episodeToPlay.bytesTotal * 100;
                self.time = self.getTime(episodeToPlay.position, true);
                self.duration = self.getTime(episodeToPlay.durationEstimate, true);
                self.durationMs = episodeToPlay.durationEstimate;
                setWaveFormData();
                if (self.percentagePosition > almostFinishedPercentage && !almostFinishedEventFired) {
                    onAlmostFinishEvent.fire();
                    almostFinishedEventFired = true;
                }
            }
        }

        function createEpisode() {
            sm.setup({
                url: swfFolder,
                html5PollingInterval: 50, // increased framerate for whileplaying() etc.
                debugMode: false, // disable or enable debug output
                consoleOnly: false,
                flashVersion: 9,
                useHighPerformance: true,
                preferFlash: true, //very important for waveformdata
                onready: readyToPlayEvent.fire
            });

            sm.flash9Options.useWaveformData = true;
            sm.flash9Options.useEQData = false;
            sm.flash9Options.usePeakData = false;
        }

        function createEpisodeAudio(url) {
            episodeToPlay = sm.createSound({
                id: 'episode',
                url: url,
                whileplaying: whilePlayingEvent.fire,
                onload: onDownloadedEvent.fire,
                onfinish: onFinishEvent.fire
            });
            self.setPosition = episodeToPlay.setPosition;
        }

        //initPlayer
        if (config.episodeUrl) {
            this.onReadyToPlay(function() {
                createEpisodeAudio(config.episodeUrl);
                readyToPlayEvent.setAutoFireOnNewAdds(true);
            });
        }
        createEpisode();

    }; //end player
    
});