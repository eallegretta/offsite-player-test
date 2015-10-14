// WaveformDraw:
//    This class is is charge of the logic to draw the waveform using
//    the underlying renderer, its main responsabilities are:
//    
//    * Calculating how many waveform lines to draw
//    * Drawing them using the underlying renderer
//    * Setting up the next frame for drawing


'use strict';
mm.module('WaveformDraw', ['WaveformRenderer'], function (WaveformRenderer) {

    var YELLOW = '#EDDF7B';
    var PINK = '#CF2A70';
    var BLUE = '#0099CC';

    // requestAnimationFrame Polyfill
    var requestAnimationFrame = window.requestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.msRequestAnimationFrame ||
                                window.oRequestAnimationFrame;

    if (!requestAnimationFrame) { // https://gist.github.com/paulirish/1579671
        var requestAnimationFrameLastTime = 0;
        requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - requestAnimationFrameLastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
            requestAnimationFrameLastTime = currTime + timeToCall;
            return id;
        };
    }

    return function (episodePlayer) {

        var bufferLength = 512,
		    frequencyData = null,
		    pixelWidth = 0.8,
		    pixelGap = 4,
		    pixels = 512,
		    sample = 1,
		    maxVol = 0,//256 is the amplitude range the web audio API analyser module
			isDrawing = false,
			renderer = null;

        this.start = function () {
            isDrawing = true; //because will strart drawing again
            initDrawing();
            draw();
        };

        this.stopDrawing = function () {
            isDrawing = false;
        };

        function initDrawing() {
            renderer = new WaveformRenderer(pixelWidth, [[0, YELLOW], [0.5, PINK], [1, BLUE]]);
            pixels = (renderer.width() / 2 / (pixelWidth + pixelGap));
            sample = bufferLength / pixels;
        }

        function draw() {
            if (!isDrawing) {
                return;
            }

            var amplitude = 0;
            frequencyData = episodePlayer.waveformData;

            if (!frequencyData && isDrawing) {
                requestAnimationFrame(draw);
                return;
            }

            renderer.beginDraw(pixels);

            for (var i = 0; i < pixels; i++) {
                var dataKey = Math.round(i * sample),
				    increment = i * (pixelWidth + pixelGap);

                if (dataKey >= frequencyData.length) {
                    break;
                }

                // we normalizes the scale of the animation to its max volume so all visuals will be full height regardless of its production.
                //var f2 = Math.max(0.0, Math.min(1.0, );
                //console.log(frequencyData);
                var frec = parseFloat(frequencyData[dataKey]); //(f2 === 1.0 ? 255 : f2 * 255.0 /2 );
                //frec = frec / 128.0;
                maxVol = Math.max(maxVol, frec);

                amplitude = frec / maxVol * renderer.height();

                if (isNaN(amplitude) || !isFinite(amplitude)) {
                    continue;
                }

                renderer.draw(amplitude, increment);
            }

            requestAnimationFrame(draw);
            
        }
    };
});