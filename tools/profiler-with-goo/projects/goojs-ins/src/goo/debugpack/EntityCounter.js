define([], function () {
    'use strict';
    __touch(3412);
    function EntityCounter(skipFrames) {
        this.goo = null;
        __touch(3417);
        this.skipFrames = skipFrames || 20;
        __touch(3418);
        this.texHandle = null;
        __touch(3419);
    }
    __touch(3413);
    EntityCounter.prototype.inject = function (goo) {
        this.goo = goo;
        __touch(3420);
        this.texHandle = createPanel();
        __touch(3421);
        var that = this;
        __touch(3422);
        var skippedFrame = 0;
        __touch(3423);
        this.goo.callbacks.push(function () {
            skippedFrame--;
            __touch(3426);
            if (skippedFrame <= 0) {
                skippedFrame = that.skipFrames;
                __touch(3427);
                var outStr = '';
                __touch(3428);
                for (var i in that.goo.world._systems) {
                    var system = that.goo.world._systems[i];
                    __touch(3431);
                    outStr += system.type + ': ' + system._activeEntities.length + '\n';
                    __touch(3432);
                }
                __touch(3429);
                that.texHandle.value = outStr;
                __touch(3430);
            }
        });
        __touch(3424);
        return this;
        __touch(3425);
    };
    __touch(3414);
    function createPanel() {
        var div = document.createElement('div');
        __touch(3433);
        div.id = '_entitycounterdiv';
        __touch(3434);
        var innerHTML = '<span style="font-size: x-small;font-family: sans-serif">Counter</span><br />' + '<textarea cols="30" rows="6" id="_entitycountertex">...</textarea>';
        __touch(3435);
        div.innerHTML = innerHTML;
        __touch(3436);
        div.style.position = 'absolute';
        __touch(3437);
        div.style.zIndex = '2001';
        __touch(3438);
        div.style.backgroundColor = '#BBBBBB';
        __touch(3439);
        div.style.left = '10px';
        __touch(3440);
        div.style.bottom = '10px';
        __touch(3441);
        div.style.webkitTouchCallout = 'none';
        __touch(3442);
        div.style.webkitUserSelect = 'none';
        __touch(3443);
        div.style.khtmlUserSelect = 'none';
        __touch(3444);
        div.style.mozUserSelect = 'none';
        __touch(3445);
        div.style.msUserSelect = 'none';
        __touch(3446);
        div.style.userSelect = 'none';
        __touch(3447);
        div.style.padding = '3px';
        __touch(3448);
        div.style.borderRadius = '6px';
        __touch(3449);
        document.body.appendChild(div);
        __touch(3450);
        return document.getElementById('_entitycountertex');
        __touch(3451);
    }
    __touch(3415);
    return EntityCounter;
    __touch(3416);
});
__touch(3411);