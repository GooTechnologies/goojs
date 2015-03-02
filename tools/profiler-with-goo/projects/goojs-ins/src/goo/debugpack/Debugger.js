define([
    'goo/debugpack/components/MarkerComponent',
    'goo/debugpack/systems/MarkerSystem'
], function (MarkerComponent, MarkerSystem) {
    'use strict';
    __touch(3305);
    function Debugger(exportPicked) {
        this.goo = null;
        __touch(3317);
        this.exportPicked = exportPicked || false;
        __touch(3318);
        this.picked = null;
        __touch(3319);
        this.oldPicked = null;
        __touch(3320);
    }
    __touch(3306);
    Debugger.prototype._setUpREPL = function () {
        var lastCommStr = '';
        __touch(3321);
        document.getElementById('replintex').addEventListener('keyup', function (event) {
            event.stopPropagation();
            __touch(3323);
            var replinElemHandle = document.getElementById('replintex');
            __touch(3324);
            var reploutElemHandle = document.getElementById('replouttex');
            __touch(3325);
            if (event.keyCode === 13 && !event.shiftKey) {
                var commStr = replinElemHandle.value.substr(0, replinElemHandle.value.length - 1);
                __touch(3326);
                lastCommStr = commStr;
                __touch(3327);
                var entity = this.picked;
                __touch(3328);
                var goo = this.goo;
                __touch(3329);
                void entity;
                __touch(3330);
                void goo;
                __touch(3331);
                var resultStr = '';
                __touch(3332);
                try {
                    resultStr += eval(commStr);
                    __touch(3337);
                } catch (err) {
                    resultStr += err;
                    __touch(3338);
                }
                __touch(3333);
                replinElemHandle.value = 'entity.';
                __touch(3334);
                reploutElemHandle.value += '\n-------\n' + resultStr;
                __touch(3335);
                displayInfo(this.picked);
                __touch(3336);
            } else if (event.keyCode === 38) {
                replinElemHandle.value = lastCommStr;
                __touch(3339);
            }
        }.bind(this), false);
        __touch(3322);
    };
    __touch(3307);
    Debugger.prototype._setUpPicking = function () {
        document.addEventListener('mouseup', function (event) {
            event.stopPropagation();
            __touch(3341);
            var mouseDownX = event.pageX;
            __touch(3342);
            var mouseDownY = event.pageY;
            __touch(3343);
            this.goo.pick(mouseDownX, mouseDownY, function (id) {
                var entity = this.goo.world.entityManager.getEntityByIndex(id);
                __touch(3345);
                if (entity) {
                    this.oldPicked = this.picked;
                    __touch(3346);
                    this.picked = entity;
                    __touch(3347);
                    if (this.picked === this.oldPicked) {
                        this.picked = null;
                        __touch(3350);
                    }
                    if (this.exportPicked) {
                        window.picked = this.picked;
                        __touch(3351);
                    }
                    displayInfo(this.picked);
                    __touch(3348);
                    updateMarker(this.picked, this.oldPicked);
                    __touch(3349);
                }
            }.bind(this));
            __touch(3344);
        }.bind(this), false);
        __touch(3340);
    };
    __touch(3308);
    Debugger.prototype.inject = function (goo) {
        this.goo = goo;
        __touch(3352);
        createPanel();
        __touch(3353);
        if (!this.goo.world.getSystem('MarkerSystem')) {
            this.goo.world.setSystem(new MarkerSystem(this.goo));
            __touch(3358);
        }
        this._setUpPicking();
        __touch(3354);
        document.getElementById('debugparams').addEventListener('keyup', function () {
            displayInfo(this.picked);
            __touch(3359);
        }.bind(this));
        __touch(3355);
        this._setUpREPL();
        __touch(3356);
        return this;
        __touch(3357);
    };
    __touch(3309);
    function createPanel() {
        var div = document.createElement('div');
        __touch(3360);
        div.id = 'debugdiv';
        __touch(3361);
        var innerHTML = '<span style="font-size: x-small;font-family: sans-serif">Filter</span><br />' + '<textarea cols="30" id="debugparams">name, Compo, tran, data</textarea><br />' + '<span style="font-size: x-small;font-family: sans-serif">Result</span><br />' + '<textarea readonly rows="10" cols="30" id="debugtex">Click on an entity</textarea><br />';
        __touch(3362);
        innerHTML += '<hr />' + '<span style="font-size: x-small;font-family: sans-serif">REPL</span><br />' + '<textarea readonly rows="10" cols="30" id="replouttex">...</textarea><br />' + '<textarea cols="30" id="replintex">entity.</textarea>';
        __touch(3363);
        div.innerHTML = innerHTML;
        __touch(3364);
        div.style.position = 'absolute';
        __touch(3365);
        div.style.zIndex = '2001';
        __touch(3366);
        div.style.backgroundColor = '#DDDDDD';
        __touch(3367);
        div.style.left = '10px';
        __touch(3368);
        div.style.top = '100px';
        __touch(3369);
        div.style.webkitTouchCallout = 'none';
        __touch(3370);
        div.style.webkitUserSelect = 'none';
        __touch(3371);
        div.style.khtmlUserSelect = 'none';
        __touch(3372);
        div.style.mozUserSelect = 'none';
        __touch(3373);
        div.style.msUserSelect = 'none';
        __touch(3374);
        div.style.userSelect = 'none';
        __touch(3375);
        div.style.padding = '3px';
        __touch(3376);
        div.style.borderRadius = '6px';
        __touch(3377);
        document.body.appendChild(div);
        __touch(3378);
    }
    __touch(3310);
    function getFilterList(str) {
        return str.split(',').map(function (entry) {
            return entry.replace(/(^[\s]+|[\s]+$)/g, '');
            __touch(3380);
        }).filter(function (entry) {
            return entry.length > 0;
            __touch(3381);
        }).map(function (entry) {
            return new RegExp(entry);
            __touch(3382);
        });
        __touch(3379);
    }
    __touch(3311);
    function stringifyTypedArray(typedArray) {
        if (typedArray.length === 0) {
            return '[]';
            __touch(3386);
        }
        var ret = '[' + typedArray[0];
        __touch(3383);
        for (var i = 1; i < typedArray.length; i++) {
            ret += ' ' + typedArray[i];
            __touch(3387);
        }
        ret += ']';
        __touch(3384);
        return ret;
        __touch(3385);
    }
    __touch(3312);
    function filterProperties(obj, interests, ident, recursionDeph) {
        if (interests.length === 0) {
            return 'No interests specified;\n\n' + 'Some popular interests: is, tran, Compo\n\n' + 'Every entry separated by a comma is a regex';
            __touch(3389);
        }
        if (recursionDeph < 0) {
            return ident + 'REACHED MAXIMUM DEPH\n';
            __touch(3390);
        }
        if (obj === null) {
            return ident + 'null\n';
            __touch(3391);
        }
        var typeOfObj = typeof obj;
        __touch(3388);
        if (typeOfObj === 'undefined' || typeOfObj === 'number' || typeOfObj === 'boolean' || typeOfObj === 'string' || obj instanceof Array && (typeof obj[0] === 'string' || typeof obj[0] === 'number' || typeof obj[0] === 'boolean')) {
            return ident + JSON.stringify(obj) + '\n';
            __touch(3392);
        }
        if (Object.prototype.toString.call(obj).indexOf('Array]') !== -1) {
            return ident + stringifyTypedArray(obj) + '\n';
            __touch(3393);
        } else {
            var retArr = [];
            __touch(3394);
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (typeof obj[prop] === 'function') {
                        continue;
                        __touch(3398);
                    }
                    for (var i in interests) {
                        if (interests[i].test(prop)) {
                            var filterStr = filterProperties(obj[prop], interests, ident + ' ', recursionDeph - 1);
                            __touch(3399);
                            retArr.push(ident + prop + '\n' + filterStr);
                            __touch(3400);
                            break;
                            __touch(3401);
                        }
                    }
                    __touch(3397);
                }
            }
            __touch(3395);
            return retArr.join('');
            __touch(3396);
        }
    }
    __touch(3313);
    function updateMarker(picked, oldPicked) {
        if (picked !== oldPicked) {
            if (oldPicked !== null && oldPicked.hasComponent('MarkerComponent')) {
                oldPicked.clearComponent('MarkerComponent');
                __touch(3402);
            }
            if (picked !== null) {
                picked.setComponent(new MarkerComponent(picked));
                __touch(3403);
            }
        } else {
            if (picked.hasComponent('MarkerComponent')) {
                picked.clearComponent('MarkerComponent');
                __touch(3404);
            } else {
                picked.setComponent(new MarkerComponent(picked));
                __touch(3405);
            }
        }
    }
    __touch(3314);
    function displayInfo(entity) {
        var filterList = getFilterList(document.getElementById('debugparams').value);
        __touch(3406);
        if (entity) {
            console.log('==> ', entity);
            __touch(3410);
        }
        var entityStr = filterProperties(entity, filterList, '', 20);
        __touch(3407);
        var elem = document.getElementById('debugtex');
        __touch(3408);
        elem.value = entityStr;
        __touch(3409);
    }
    __touch(3315);
    return Debugger;
    __touch(3316);
});
__touch(3304);