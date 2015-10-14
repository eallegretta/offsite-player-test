//  WaveformDivRenderer:
//
//      This class renders the waveform using DIV tags, 
//      this is renderer could potentially be slow, but at least will
//      work on any browser

'use strict';
mm.module('WaveformDivRenderer', ['GradientFill'], function (GradientFill) {

    // We use this line cache to avoid removing all the nodes and re adding
    // them to the DOM tree, so what we do is we add all the lines only once
    // and then we reposition them and resize them. This has a direct 
    // performance improvement on the waveform rendering
    var linesCache = {};

    var DivRenderer = function (lineWidth, gradientStops) {
        this.container = mm.byId('waveform-div');
        mm.addClass(this.container, 'show');
        this.container.width = this.container.offsetWidth - 40;
        this.container.height = this.container.offsetHeight;

        this.lineWidth = lineWidth < 1 ? 1 : lineWidth;

        this.gradientStops = gradientStops;

        this.gradient = null;
    };

    DivRenderer.prototype.width = function () {
        return this.container.width;
    };

    DivRenderer.prototype.height = function () {
        return this.container.height;
    };

    DivRenderer.prototype.beginDraw = function (maxLines) {
        this.startX = this.width() / 2;
        this.startY = this.height();
        this.currentLine = 0;

        if (!this.container.firstChild) {
            this.linesContainer = mm.create('div');
            this.container.appendChild(this.linesContainer);
            this.linesContainer.style.position = 'relative';

            maxLines = Math.ceil(maxLines * 2);

            this.gradient = new GradientFill(maxLines, this.gradientStops);

            var currentEvenLine = Math.ceil(maxLines / 2);
            var currentOddLine = currentEvenLine;

            for (var index = 0; index < maxLines; index++) {
                var color;
                if (index % 2 === 0) {
                    color = this.gradient.at(currentEvenLine++);
                } else {
                    color = this.gradient.at(currentOddLine--);
                }

                var line = this.addLine(0, index, 0, color);
                line.id = 'waveform-line-' + index;
                linesCache['waveform-line-' + index] = line;
            }
        }
    };

    DivRenderer.prototype.addLine = function (top, left, height, color) {
        var line = mm.create('div');
        line.style.width = this.lineWidth + 'px';
        line.style.position = 'absolute';
        line.style.top = top + 'px';
        line.style.left = left + 'px';
        line.style.height = height + 'px';
        line.style.backgroundColor = color;
        this.linesContainer.appendChild(line);

        return line;
    };

    DivRenderer.prototype.draw = function (amplitude, increment) {
        amplitude = Math.abs(amplitude);

        increment = Math.floor(increment);

        var x = Math.round(this.startX + increment); //add .5 to ensure lines are pixel snapped
        var y = Math.round((this.startY - amplitude) / 2);

        var line1 = linesCache['waveform-line-' + this.currentLine++];
        line1.style.top = y + 'px';
        line1.style.left = x + 'px';
        line1.style.height = amplitude + 'px';

        x = Math.round(this.startX - increment);
        var line2 = linesCache['waveform-line-' + this.currentLine++];
        line2.style.top = y + 'px';
        line2.style.left = x + 'px';
        line2.style.height = amplitude + 'px';
    };

    return DivRenderer;
});