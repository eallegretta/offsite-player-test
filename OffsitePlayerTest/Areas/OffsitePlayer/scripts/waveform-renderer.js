//  WaveformRenderer
//
//      This is a facade for selecting the appropiate waveform renderer
//      to be used by the WaveformDraw, for now only 2 renderers are supported
//          * CanvasRenderer: Used on "Modern" browsers (Chrome, Firefox, Safari, IE10+)
//          * DivRenderer: Used on non "Modern" browsers (<= IE9)
//  All the waveform renderers must expose the following methods
//
//      * constructor(lineWidth, gradientStops): The constructor function that is called to initialize the renderer
//          - lineWidth (float): The width of the line to be drawn
//          - gradientStops ([[,]]): The gradient stops is an array of gradient colors where each element of the array 
//                                   is another array with 2 positions
//                                      - 0 (float, between 0 and 1): The stop at where to make the color
//                                      - 1 (string): The color represented in any valid HTML color representation (name, hex, rgb, rgba, hsl, hsla, etc)
//
//      * beginDraw(maxLinesToDraw): Called before all the waveform lines are going to be drawn
//          - maxLinesToDraw (int): Indicates in advance how many lines will be drawn
//
//      * draw(amplitude, increment): Called for each waveform line
//          - amplitude (float): Indicates the height of the waveform line
//          - increment (float): Indicates the line x position
//
//      * width(): Called for obtaining the width of the container where the lines are going to live
//      * height(): Called for obtaining the height of the container where the lines are going to live


'use strict';
mm.module('WaveformRenderer', ['WaveformDivRenderer', 'WaveformCanvasRenderer'], function (DivRenderer, CanvasRenderer) {
    function checkCanvas() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    if (checkCanvas()) {
        return CanvasRenderer;
    } else {
        return DivRenderer;
    }
});