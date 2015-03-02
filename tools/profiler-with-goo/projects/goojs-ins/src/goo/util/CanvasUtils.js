define(['goo/util/PromiseUtil'], function (PromiseUtil) {
    'use strict';
    __touch(21636);
    function CanvasUtils() {
    }
    __touch(21637);
    CanvasUtils.loadCanvasFromPath = function (canvasPath, callback) {
        var options = {};
        __touch(21643);
        if (arguments.length === 3) {
            options = arguments[1];
            __touch(21650);
            callback = arguments[2];
            __touch(21651);
        }
        var img = new Image();
        __touch(21644);
        img.onerror = function () {
            console.error('Failed to load svg!');
            __touch(21652);
            callback();
            __touch(21653);
        };
        __touch(21645);
        img.src = canvasPath;
        __touch(21646);
        var canvas = document.createElement('canvas');
        __touch(21647);
        var context = canvas.getContext('2d');
        __touch(21648);
        img.onload = function () {
            if (img.width === 0 && img.height === 0) {
                return callback();
                __touch(21668);
            }
            options.width = options.width ? options.width : img.width;
            __touch(21654);
            options.height = options.height ? options.height : img.height;
            __touch(21655);
            options.sourceX = options.sourceX ? options.sourceX : 0;
            __touch(21656);
            options.sourceY = options.sourceY ? options.sourceY : 0;
            __touch(21657);
            options.sourceWidth = options.sourceWidth ? options.sourceWidth : img.width;
            __touch(21658);
            options.sourceHeight = options.sourceHeight ? options.sourceHeight : img.height;
            __touch(21659);
            options.destX = options.destX ? options.destX : 0;
            __touch(21660);
            options.destY = options.destY ? options.destY : 0;
            __touch(21661);
            options.destWidth = options.destWidth ? options.destWidth : options.width;
            __touch(21662);
            options.destHeight = options.destHeight ? options.destHeight : options.height;
            __touch(21663);
            if (options.resizeToFit) {
                var ratio = options.sourceWidth / options.sourceHeight;
                __touch(21669);
                if (ratio > 1) {
                    options.destHeight = options.destWidth / ratio;
                    __touch(21670);
                    options.destY = (options.height - options.destHeight) * 0.5;
                    __touch(21671);
                } else if (ratio < 1) {
                    options.destWidth = options.destHeight * ratio;
                    __touch(21672);
                    options.destX = (options.width - options.destWidth) * 0.5;
                    __touch(21673);
                }
            }
            canvas.width = options.width;
            __touch(21664);
            canvas.height = options.height;
            __touch(21665);
            context.drawImage(img, options.sourceX, options.sourceY, options.sourceWidth, options.sourceHeight, options.destX, options.destY, options.destWidth, options.destHeight);
            __touch(21666);
            callback(canvas);
            __touch(21667);
        };
        __touch(21649);
    };
    __touch(21638);
    CanvasUtils.renderSvgToCanvas = function (svgSource, options, callback) {
        var DOMURL = window.URL || window.webkitURL || window;
        __touch(21674);
        var svg = new Blob([svgSource], { type: 'image/svg+xml;charset=utf-8' });
        __touch(21675);
        var url = DOMURL.createObjectURL(svg);
        __touch(21676);
        CanvasUtils.loadCanvasFromPath(url, options, callback);
        __touch(21677);
    };
    __touch(21639);
    CanvasUtils.getMatrixFromCanvas = function (canvas) {
        var context = canvas.getContext('2d');
        __touch(21678);
        var getAt = function (x, y) {
            if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
                return 0;
                __touch(21682);
            } else {
                return context.getImageData(x, y, 1, 1).data[0] / 255;
                __touch(21683);
            }
        };
        __touch(21679);
        var matrix = [];
        __touch(21680);
        for (var i = 0; i < canvas.width; i++) {
            matrix.push([]);
            __touch(21684);
            for (var j = 0; j < canvas.height; j++) {
                matrix[i].push(getAt(i, canvas.height - (j + 1)));
                __touch(21685);
            }
        }
        return matrix;
        __touch(21681);
    };
    __touch(21640);
    CanvasUtils.svgDataToImage = function (data) {
        var DOMURL = window.URL || window.webkitURL || window;
        __touch(21686);
        var svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        __touch(21687);
        var img = new Image();
        __touch(21688);
        img.src = DOMURL.createObjectURL(svg);
        __touch(21689);
        return PromiseUtil.createPromise(function (resolve, reject) {
            img.onload = function () {
                resolve(img);
                __touch(21693);
            };
            __touch(21691);
            img.onerror = function () {
                reject('Could not load SVG image.');
                __touch(21694);
            };
            __touch(21692);
        });
        __touch(21690);
    };
    __touch(21641);
    return CanvasUtils;
    __touch(21642);
});
__touch(21635);