//Has the responsability to play and send the waveformdata with HTLM5 AudioContext and Audio
'use strict';
//Polyfill
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
mm.module('AudioContextPlayer', function(){
    return function (options) {

        var config = {
            episodeUrl: null,
            autoPlay : false
        };

        mm.extend(config, options);

        var self = this,
            audioContext = null,
            analyser = null,
            episodeToPlay = null,
            whilePlayingInterval = null,
            fftSize = 512, //the Fast FourierTransformation
            uint8 = null, // to use for polyfill. See function buildGetFrecuency
            sourceNode = null,
            lastErrorTime = 0,
            lastPlayedTime = 0,
            almostFinishedPercentage = 95,
            almostFinishedEventFired = false,
            readyToPlayEvent = mm.Callbacks('readyToPlayCallbacks-AudioContext'),
            onDownloadedEvent = mm.Callbacks('onFinishDonwloadEpisode-AudioContext'),
            onPlayEvent = mm.Callbacks('onPlay-AudioContext'),
            onPauseEvent = mm.Callbacks('onPause-AudioContext'),
            onFinishEvent = mm.Callbacks('onFinished-AudioContext'),
            onStopEvent = mm.Callbacks('onStop-AudioContext'),
            onErrorEvent = mm.Callbacks('onError-AudioContext'),
            onAlmostFinishedEvent = mm.Callbacks('onAlmostFinished-AudioContext'),
            whilePlayingEvent = mm.Callbacks('whilePlayingCallbacks-AudioContext');

        //PROPERTIES
        //wave data is updated in each whilePlaying
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
        this.onError = onErrorEvent.add;
        this.onAlmostFinished = onAlmostFinishedEvent.add;

        //Player Actions
        //set position in MiliSeconds
        this.setPosition = function (time) {
            var seconds = (time) ? time / 1000 : 0;
            episodeToPlay.currentTime = Math.round(seconds);
            this.play();
        };

        this.play = function () {
            if (!this.isPlaying) {
                episodeToPlay.play();
                this.isPlaying = true;
                onPlayEvent.fire();
            }
        };

        this.stop = function () {
            if (this.isPlaying) {
                stopWhilePlayingInterval();
                episodeToPlay.pause();
                episodeToPlay.currentTime = 0;
                this.isPlaying = false;
                onStopEvent.fire();
            }
        };

        this.pause = function () {
            if (this.isPlaying) {
                stopWhilePlayingInterval();
                episodeToPlay.pause();
                this.isPlaying = false;
                onPauseEvent.fire();
            }
        };

        this.togglePause = function (url) {
            if (this.isPlaying) {
                this.pause();
            }
            else {
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

        //tries to setup an audio element and if it was a succesful creation it returns true
        this.tryInit = function(url) {
            var debug = true;// is just to debug code in the console
            if (url) {
                config.episodeUrl = url;
            }
            if (!window.AudioContext || !Audio || !browserSupportsMp3()|| !debug) { //checks if the browser support audioContext and audioElement
                return false;
            }
            return trySetupAudioAndNodes(config.episodeUrl);
        };

        this.retry = function(timeToStart) {
            //TODO create on Loading event and finish loading 
            trySetupAudioAndNodes(config.episodeUrl);
            episodeToPlay.oncanplay = function() {
                episodeToPlay.currentTime = timeToStart;
                self.play();
                //TODO put finish loading here
                episodeToPlay.oncanplay = null;
            };
        };

        //private Methods
        function createWhilePlayingInterval() {
            whilePlayingInterval = window.setInterval(whilePlayingEvent.fire, 50);  
        }

        function stopWhilePlayingInterval() {
            window.clearInterval(whilePlayingInterval);
        }

        //tries to creates the audio, audioContext and sets the analyser
        function trySetupAudioAndNodes(url) {
            try {
                sourceNode = null; episodeToPlay = null; analyser = null; //we make sure to delete the old audio
                episodeToPlay = new Audio();
                episodeToPlay.src = url;
                episodeToPlay.crossOrigin = 'anonymous';//set cors
                //episodeToPlay.preload = 'auto'; //to download all the audio
                audioContext = new window.AudioContext();
                sourceNode = audioContext.createMediaElementSource(episodeToPlay);
                analyser = audioContext.createAnalyser();
                sourceNode.connect(analyser);
                analyser.connect(audioContext.destination);
                analyser.fftSize = fftSize;
                buildGetFrecuency();
                ////set events
                episodeToPlay.onloadeddata = onDownloadedEvent.fire;
                episodeToPlay.onended = onFinishEvent.fire;
                episodeToPlay.onerror = onAudioError;
                episodeToPlay.onplaying = onAudioElemetReallyPlays;
                setTimeout(function () {
                    //episodeToPlay.onloadstart = readyToPlayEvent.fire;
                    readyToPlayEvent.fire(); //this has to be like this because iOS des not load nothing. More info: http://stackoverflow.com/a/11700424/187673
                    //here is a gist too detect autoplay: https://gist.github.com/mrcoles/5537536 . Perhaps we can improve it in a future
                }, 100);
                return true;
            }
            catch (err) {
                return false;
            }
        }

        this.onReadyToPlay(function() {
            if (config.autoPlay) {
                self.play();
            }
        });

        this.onWhilePlaying(function () {
            self.percentagePosition = episodeToPlay.currentTime / episodeToPlay.duration * 100;
            var alreadyDownloadedSeconds = episodeToPlay.buffered.end(episodeToPlay.buffered.length - 1);
            self.percentageDownloaded = alreadyDownloadedSeconds / episodeToPlay.duration * 100;
            self.time = self.getTime(episodeToPlay.currentTime * 1000, true); //To miliSeconds
            self.duration = self.getTime(episodeToPlay.duration * 1000, true);
            self.durationMs = episodeToPlay.duration * 1000;
            lastPlayedTime = (episodeToPlay.currentTime > 0) ? episodeToPlay.currentTime :
                Math.max(lastPlayedTime, episodeToPlay.currentTime); //we save the last time played before a posible error. Check onAudioError function

            analyser.getFrecuency(self.waveformData);
            if (self.percentagePosition > almostFinishedPercentage && !almostFinishedEventFired) {
                onAlmostFinishedEvent.fire();
                almostFinishedEventFired = true;
            }
        });

        //Some safari versions do not have the method "getFloatTimeDomainData", so this functions creates a polyfill 
        //original source: https://github.com/mohayonao/get-float-time-domain-data/blob/master/lib/get-float-time-domain-data.js
        function buildGetFrecuency() {
            self.waveformData = new Float32Array(analyser.fftSize);
            if (window.AnalyserNode && !window.AnalyserNode.prototype.getFloatTimeDomainData) {
                uint8 = new Uint8Array(analyser.fftSize);
                window.AnalyserNode.prototype.getFrecuency = function(array) {
                    analyser.getByteTimeDomainData(uint8);
                    for (var i = 0, imax = array.length; i < imax; i++) {
                        array[i] = (uint8[i] - 128) * 0.0078125;
                    }
                };
            } else if (window.AnalyserNode) {
                window.AnalyserNode.prototype.getFrecuency = window.AnalyserNode.prototype.getFloatTimeDomainData;
            }
        }

        function onAudioElemetReallyPlays() {
            createWhilePlayingInterval(); //starts inteval when really audio is playing
        }

        function browserSupportsMp3(){
            var a = document.createElement('audio');
            return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
        }

        function onAudioError(err) {
            err.message = 'An unknown error occurred.';
            switch (err.target.error.code) {
                case err.target.error.MEDIA_ERR_ABORTED:
                    err.message = 'User aborted the episode playback.';
                    break;
                case err.target.error.MEDIA_ERR_NETWORK:
                    err.message = ('A network error caused the media download to fail.');
                    break;
                case err.target.error.MEDIA_ERR_DECODE:
                    err.message = ('The audio playback was aborted due to a corruption problem or because the audio used features your browser did not support.');
                    break;
                case err.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    err.message = ('The audio not be loaded, either because the server or network failed or because the format is not supported.');
                    break;
            }

            console.log(err);
            err.lastCurrentTime = lastPlayedTime;
            self.pause();
            if (lastErrorTime !== lastPlayedTime) { //only retry on casual errors
                self.retry(err.lastCurrentTime);
            } else {
                onErrorEvent.fire(err);
            }
            lastErrorTime = err.lastCurrentTime;

        }
    };//end player

});