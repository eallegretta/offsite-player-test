//  WaveformCanvasRenderer:
//
//      This class renders the waveform using HTML5 canvas functionality, 
//      this is the fastest renderer that can be used.
//      Always use this renderer when possible

'use strict';
mm.module('WaveformCanvasRenderer', function () {
    var CanvasRenderer = function(lineWidth, gradientStops) {
        this.canvas = mm.byId('waveform-canvas');
        mm.addClass(this.canvas, 'show');
        this.canvasContext = this.canvas.getContext('2d');

        this.canvas.width = this.canvas.offsetWidth - 40;
        this.canvas.height = this.canvas.offsetHeight;

        this.canvasContext.lineWidth = lineWidth;

        var gradient = this.canvasContext.createLinearGradient(0, this.canvas.height, this.canvas.width, 0);

        for (var index = 0; index < gradientStops.length; index++) {
            gradient.addColorStop(gradientStops[index][0], gradientStops[index][1]);
        }

        this.canvasContext.strokeStyle = gradient;
    };

    CanvasRenderer.prototype.width = function() {
        return this.canvas.width;
    };

    CanvasRenderer.prototype.height = function() {
        return this.canvas.height;
    };

    CanvasRenderer.prototype.beginDraw = function() {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.startX = this.canvas.width / 2;
        this.startY = this.canvas.height;
    };

    CanvasRenderer.prototype.draw = function(amplitude, increment) {
        var x = Math.round(this.startX + increment) + 0.5; //add .5 to ensure lines are pixel snapped
        var y = Math.round((this.startY - amplitude) / 2);
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(x, y);
        this.canvasContext.lineTo(x, y + amplitude);
        this.canvasContext.stroke();

        x = Math.round(this.startX - increment) + 0.5;
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(x, y);
        this.canvasContext.lineTo(x, y + amplitude);
        this.canvasContext.stroke();
    };

    return CanvasRenderer;
});