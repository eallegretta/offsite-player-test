/*jshint bitwise: false*/

'use strict';

//  GradientFill:
//
//      This class generates a gradient for lines using the specified stops of colors 

mm.module('GradientFill', function() {

    function hexToRgb(hex) {
        if (hex[0] === '#') {
            hex = hex.substring(1);
        }

        var bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }


    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    var GradientFill = function (lines, stops) {
        this.gradient = [];

        if (lines <= 0) {
            throw 'lines must be greater than 0';
        }

        if (!stops) {
            throw 'stops is required';
        }

        if (stops.length < 2) {
            throw 'stops length must be greater or equal than 2';
        }

        var from = stops.shift(); // 0-100 scale
        from[1] = hexToRgb(from[1]);
        var to = stops.shift(); // 0-100 scale
        to[1] = hexToRgb(to[1]);

        while (stops.length >= 0) {
            var fromStop = Math.ceil(from[0] * lines); // 0-TOTAL_LINES scale
            var toStop = Math.ceil(to[0] * lines); // 0-TOTAL_LINES scale

            for (var index = fromStop; index < toStop; index++) { // index = 0-TOTAL_LINES scale
                var localIndex = index - fromStop; // 0-TO_STOP scale
                var localWidth = toStop - fromStop; // Width of the gradient stop
                var perc = (localIndex * 100 / localWidth) / 100;

                var r = Math.round(perc * to[1].r + (1 - perc) * from[1].r);
                var g = Math.round(perc * to[1].g + (1 - perc) * from[1].g);
                var b = Math.round(perc * to[1].b + (1 - perc) * from[1].b);
                var color = rgbToHex(r, g, b);
                this.gradient[index] = color;
            }

            from = to;

            if (stops.length === 0) {
                break;
            }

            to = stops.shift();
            to[1] = hexToRgb(to[1]);
        }

        GradientFill.prototype.at = function(line) {
            if (line >= 0 && line < this.gradient.length) {
                return this.gradient[line];
            }

            return null;
        };
    };

    return GradientFill;
});