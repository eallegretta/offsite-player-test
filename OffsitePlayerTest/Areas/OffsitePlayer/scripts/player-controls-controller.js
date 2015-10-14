'use strict';
mm.module('playerControls', function() {

    return function(episodePlayer) {

        var isDragging = false,
            changedPlayerStatus = false, //to prevent many clicks till the player change action status
            playButton = mm.byId('play'),
            playedTime = mm.byId('timeline-time'),
            episodeDuration = mm.byId('timeline-duration'),
            timeLine = mm.byId('timeline'),
            timeLineToolTip = mm.byId('timeline-tooltip'),
            progressBar = mm.byId('timeline-progress');

        //Player EVents
        episodePlayer.onReadyToPlay(bindControls);
        episodePlayer.onWhilePlaying(function() {
            progressBar.style.width = episodePlayer.percentagePosition + '%';
            mm.text(playedTime, episodePlayer.time);
            mm.text(episodeDuration, episodePlayer.duration);
        });


        //PRIVATE FUNCTIONS
        function bindControls() {
            //DOM Events
            mm.on(timeLine, 'mousedown', timelineDownHandler);
            mm.on(timeLine, 'touchstart', timelineDownHandler);
            mm.on(timeLine, 'mouseup', timelineUpHandler);
            mm.on(timeLine, 'touchend', timelineUpHandler);
            mm.on(timeLine, 'mousemove', timelineMoveHandler);
            mm.on(timeLine, 'touchmove', timelineMoveHandler);
            mm.on(timeLine, 'mouseout', timelineOutHandler);
            mm.on(timeLine, 'touchleave', timelineOutHandler);
            mm.on(playButton, 'click', onClickPlay);

            //EpisodePlayer Events
            episodePlayer.onPlay(onPlayerActionedChanger);
            episodePlayer.onPause(onPlayerActionedChanger);
            episodePlayer.onStop(onPlayerActionedChanger);
        }


        function onClickPlay(e){
            if (e) {
                e.preventDefault();
            }
            if (!changedPlayerStatus) {
                changedPlayerStatus = true;
                episodePlayer.togglePause();
            }
            return false;
        }

        ///if the player stops, starts playing or is paused
        function onPlayerActionedChanger() {
            mm.toggleClass(playButton, 'isPlaying');
            changedPlayerStatus = false;
        }

        function timelineDownHandler() {
            isDragging = true;
        }

        function timelineUpHandler(e) {
            if (e) {
                e.preventDefault();
                isDragging = false;
                var x = (e.clientX || e.pageX) - timeLine.offsetLeft,
                    w = timeLine.offsetWidth,
                    p = x / w,
                    t = p * episodePlayer.durationMs;
                episodePlayer.setPosition(t);
                if (!mm.hasClass(playButton, 'isPlaying')) {
                    mm.addClass(playButton, 'isPlaying');
                }
            }
            return false;
        }

        function timelineMoveHandler(e) {
            if (e) {
                e.preventDefault();
                var x = (e.clientX || e.pageX) - timeLine.offsetLeft,
                    w = timeLine.offsetWidth,
                    p = x / w,
                    t = p * episodePlayer.durationMs;

                timeLineToolTip.className = 'in';
                timeLineToolTip.style.left = x + 'px';

                // dont show the tooltip if the duration to show is greater
                // than the actual show duration
                if (t <= episodePlayer.durationMs) {
                    mm.text(timeLineToolTip, episodePlayer.getTime(t, true));
                } else {
                    timeLineToolTip.className = '';
                }

                if (isDragging) {
                    var progress = x / timeLine.offsetWidth * 100;
                    progressBar.style.width = progress + '%';
                }
            }
            return false;
        }

        function timelineOutHandler(e) {
            if (e) {
                e.preventDefault();
            }
            timeLineToolTip.className = '';
            return false;
        }
    };

});