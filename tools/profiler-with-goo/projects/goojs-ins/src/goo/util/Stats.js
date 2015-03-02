define(function () {
    'use strict';
    __touch(22404);
    function Stats() {
        var startTime = Date.now(), prevTime = startTime, prevTimeMs = startTime;
        __touch(22407);
        var ms = 0, msMin = Infinity, msMax = 0;
        __touch(22408);
        var fps = 0, fpsMin = Infinity, fpsMax = 0;
        __touch(22409);
        var frames = 0, mode = 0;
        __touch(22410);
        var container = document.createElement('div');
        __touch(22411);
        container.id = 'stats';
        __touch(22412);
        container.addEventListener('mousedown', function (event) {
            event.preventDefault();
            __touch(22459);
            setModeP(++mode % 2);
            __touch(22460);
        }, false);
        __touch(22413);
        container.style.cssText = 'width:80px;cursor:pointer;z-index:1000;' + '-webkit-touch-callout: none;' + '-webkit-user-select: none;' + '-khtml-user-select: none;' + '-moz-user-select: none;' + '-ms-user-select: none;' + 'user-select: none;';
        __touch(22414);
        var fpsDiv = document.createElement('div');
        __touch(22415);
        fpsDiv.id = 'fps';
        __touch(22416);
        fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
        __touch(22417);
        container.appendChild(fpsDiv);
        __touch(22418);
        var fpsText = document.createElement('div');
        __touch(22419);
        fpsText.id = 'fpsText';
        __touch(22420);
        fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:13px';
        __touch(22421);
        fpsText.innerHTML = 'FPS';
        __touch(22422);
        fpsDiv.appendChild(fpsText);
        __touch(22423);
        var fpsGraph = document.createElement('div');
        __touch(22424);
        fpsGraph.id = 'fpsGraph';
        __touch(22425);
        fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
        __touch(22426);
        fpsDiv.appendChild(fpsGraph);
        __touch(22427);
        while (fpsGraph.children.length < 74) {
            var bar = document.createElement('span');
            __touch(22461);
            bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
            __touch(22462);
            fpsGraph.appendChild(bar);
            __touch(22463);
        }
        __touch(22428);
        var msDiv = document.createElement('div');
        __touch(22429);
        msDiv.id = 'ms';
        __touch(22430);
        msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
        __touch(22431);
        container.appendChild(msDiv);
        __touch(22432);
        var msText = document.createElement('div');
        __touch(22433);
        msText.id = 'msText';
        __touch(22434);
        msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:13px';
        __touch(22435);
        msText.innerHTML = 'MS';
        __touch(22436);
        msDiv.appendChild(msText);
        __touch(22437);
        var msGraph = document.createElement('div');
        __touch(22438);
        msGraph.id = 'msGraph';
        __touch(22439);
        msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
        __touch(22440);
        msDiv.appendChild(msGraph);
        __touch(22441);
        while (msGraph.children.length < 74) {
            var bar = document.createElement('span');
            __touch(22464);
            bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
            __touch(22465);
            msGraph.appendChild(bar);
            __touch(22466);
        }
        __touch(22442);
        var infoDiv = document.createElement('div');
        __touch(22443);
        infoDiv.id = 'info';
        __touch(22444);
        infoDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#200';
        __touch(22445);
        container.appendChild(infoDiv);
        __touch(22446);
        var infoText = document.createElement('div');
        __touch(22447);
        infoText.id = 'infoText';
        __touch(22448);
        infoText.style.cssText = 'color:#f66;font-family:Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:13px';
        __touch(22449);
        infoText.innerHTML = 'INFO';
        __touch(22450);
        infoDiv.appendChild(infoText);
        __touch(22451);
        var setModeP = function (value) {
            mode = value;
            __touch(22467);
            switch (mode) {
            case 0:
                fpsDiv.style.display = 'block';
                msDiv.style.display = 'none';
                break;
            case 1:
                fpsDiv.style.display = 'none';
                msDiv.style.display = 'block';
                break;
            }
            __touch(22468);
        };
        __touch(22452);
        var updateGraph = function (dom, value) {
            var child = dom.appendChild(dom.firstChild);
            __touch(22469);
            child.style.height = value + 'px';
            __touch(22470);
        };
        __touch(22453);
        this.domElement = container;
        __touch(22454);
        this.setMode = setModeP;
        __touch(22455);
        this.begin = function () {
            startTime = Date.now();
            __touch(22471);
        };
        __touch(22456);
        this.end = function (info) {
            var time = Date.now();
            __touch(22472);
            if (time > prevTimeMs + 100) {
                ms = time - startTime;
                __touch(22475);
                msMin = Math.min(msMin, ms);
                __touch(22476);
                msMax = Math.max(msMax, ms);
                __touch(22477);
                msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
                __touch(22478);
                updateGraph(msGraph, Math.min(30, 30 - ms / 200 * 30));
                __touch(22479);
                prevTimeMs = time;
                __touch(22480);
                if (info) {
                    infoText.innerHTML = info;
                    __touch(22481);
                }
            }
            frames++;
            __touch(22473);
            if (time > prevTime + 1000) {
                fps = Math.round(frames * 1000 / (time - prevTime));
                __touch(22482);
                fpsMin = Math.min(fpsMin, fps);
                __touch(22483);
                fpsMax = Math.max(fpsMax, fps);
                __touch(22484);
                fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
                __touch(22485);
                updateGraph(fpsGraph, Math.min(30, 30 - fps / (Math.min(500, fpsMax) + 10) * 30));
                __touch(22486);
                prevTime = time;
                __touch(22487);
                frames = 0;
                __touch(22488);
            }
            return time;
            __touch(22474);
        };
        __touch(22457);
        this.update = function (info) {
            startTime = this.end(info);
            __touch(22489);
        };
        __touch(22458);
    }
    __touch(22405);
    return Stats;
    __touch(22406);
});
__touch(22403);