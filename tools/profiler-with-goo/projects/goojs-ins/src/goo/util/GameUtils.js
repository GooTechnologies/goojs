define(function () {
    'use strict';
    __touch(21696);
    function GameUtils() {
    }
    __touch(21697);
    GameUtils.supported = {
        fullscreen: true,
        pointerLock: true
    };
    __touch(21698);
    GameUtils.toggleFullScreen = function () {
        if (!document.fullscreenElement) {
            if (document.documentElement.requestFullScreen) {
                document.documentElement.requestFullScreen();
                __touch(21711);
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
                __touch(21712);
            }
        }
    };
    __touch(21699);
    GameUtils.requestPointerLock = function () {
        if (document.documentElement.requestPointerLock) {
            document.documentElement.requestPointerLock();
            __touch(21713);
        }
    };
    __touch(21700);
    GameUtils.exitPointerLock = function () {
        if (document.exitPointerLock) {
            document.exitPointerLock();
            __touch(21714);
        }
    };
    __touch(21701);
    GameUtils.togglePointerLock = function () {
        if (!document.pointerLockElement) {
            if (document.documentElement.requestPointerLock) {
                document.documentElement.requestPointerLock();
                __touch(21715);
            }
        } else {
            if (document.exitPointerLock) {
                document.exitPointerLock();
                __touch(21716);
            }
        }
    };
    __touch(21702);
    var visibilityChangeListeners = [];
    __touch(21703);
    GameUtils.addVisibilityChangeListener = function (callback) {
        if (typeof callback !== 'function') {
            return;
            __touch(21719);
        }
        var vendors = [
            '',
            'ms',
            'moz',
            'webkit'
        ];
        __touch(21717);
        var hidden, visibilityChange;
        __touch(21718);
        for (var x = 0; x < vendors.length; ++x) {
            var hiddenAttribute = vendors[x] + (vendors[x].length === 0 ? 'hidden' : 'Hidden');
            __touch(21720);
            var visibilityAttribute = vendors[x] + 'visibilitychange';
            __touch(21721);
            if (typeof document[hiddenAttribute] !== 'undefined') {
                hidden = hiddenAttribute;
                __touch(21722);
                visibilityChange = visibilityAttribute;
                __touch(21723);
                break;
                __touch(21724);
            }
        }
        if (typeof document.addEventListener !== 'undefined' && typeof hidden !== 'undefined') {
            var eventListener = function () {
                if (document[hidden]) {
                    callback(true);
                    __touch(21728);
                } else {
                    callback(false);
                    __touch(21729);
                }
            };
            __touch(21725);
            visibilityChangeListeners.push({
                eventName: visibilityChange,
                eventListener: eventListener
            });
            __touch(21726);
            document.addEventListener(visibilityChange, eventListener);
            __touch(21727);
        }
    };
    __touch(21704);
    GameUtils.clearVisibilityChangeListeners = function () {
        visibilityChangeListeners.forEach(function (listener) {
            document.removeEventListener(listener.eventName, listener.eventListener);
            __touch(21732);
        });
        __touch(21730);
        visibilityChangeListeners = [];
        __touch(21731);
    };
    __touch(21705);
    GameUtils.initAllShims = function (global) {
        GameUtils.initWebGLShims();
        __touch(21733);
        GameUtils.initFullscreenShims(global);
        __touch(21734);
        GameUtils.initPointerLockShims(global);
        __touch(21735);
    };
    __touch(21706);
    GameUtils.initWebGLShims = function () {
        window.Uint8ClampedArray = window.Uint8ClampedArray || window.Uint8Array;
        __touch(21736);
    };
    __touch(21707);
    GameUtils.initFullscreenShims = function (global) {
        global = global || window;
        __touch(21737);
        var elementPrototype = (global.HTMLElement || global.Element).prototype;
        __touch(21738);
        if (!document.hasOwnProperty('fullscreenEnabled')) {
            var getter = function () {
                if ('webkitIsFullScreen' in document) {
                    return function () {
                        return document.webkitFullscreenEnabled;
                        __touch(21750);
                    };
                    __touch(21749);
                }
                if ('mozFullScreenEnabled' in document) {
                    return function () {
                        return document.mozFullScreenEnabled;
                        __touch(21752);
                    };
                    __touch(21751);
                }
                GameUtils.supported.fullscreen = false;
                __touch(21747);
                return function () {
                    return false;
                    __touch(21753);
                };
                __touch(21748);
            }();
            __touch(21745);
            Object.defineProperty(document, 'fullscreenEnabled', {
                enumerable: true,
                configurable: false,
                writeable: false,
                get: getter
            });
            __touch(21746);
        }
        if (!document.hasOwnProperty('fullscreenElement')) {
            var getter = function () {
                var name = [
                    'webkitCurrentFullScreenElement',
                    'webkitFullscreenElement',
                    'mozFullScreenElement'
                ];
                __touch(21756);
                var getNameInDocument = function (i) {
                    return function () {
                        return document[name[i]];
                        __touch(21760);
                    };
                    __touch(21759);
                };
                __touch(21757);
                for (var i = 0; i < name.length; i++) {
                    if (name[i] in document) {
                        return getNameInDocument(i);
                        __touch(21761);
                    }
                }
                return function () {
                    return null;
                    __touch(21762);
                };
                __touch(21758);
            }();
            __touch(21754);
            Object.defineProperty(document, 'fullscreenElement', {
                enumerable: true,
                configurable: false,
                writeable: false,
                get: getter
            });
            __touch(21755);
        }
        function fullscreenchange() {
            var newEvent = document.createEvent('CustomEvent');
            __touch(21763);
            newEvent.initCustomEvent('fullscreenchange', true, false, null);
            __touch(21764);
            document.dispatchEvent(newEvent);
            __touch(21765);
        }
        __touch(21739);
        document.addEventListener('webkitfullscreenchange', fullscreenchange, false);
        __touch(21740);
        document.addEventListener('mozfullscreenchange', fullscreenchange, false);
        __touch(21741);
        function fullscreenerror() {
            var newEvent = document.createEvent('CustomEvent');
            __touch(21766);
            newEvent.initCustomEvent('fullscreenerror', true, false, null);
            __touch(21767);
            document.dispatchEvent(newEvent);
            __touch(21768);
        }
        __touch(21742);
        document.addEventListener('webkitfullscreenerror', fullscreenerror, false);
        __touch(21743);
        document.addEventListener('mozfullscreenerror', fullscreenerror, false);
        __touch(21744);
        if (!elementPrototype.requestFullScreen) {
            elementPrototype.requestFullScreen = function () {
                if (elementPrototype.webkitRequestFullScreen) {
                    return function () {
                        this.webkitRequestFullScreen(global.Element.ALLOW_KEYBOARD_INPUT);
                        __touch(21772);
                    };
                    __touch(21771);
                }
                if (elementPrototype.mozRequestFullScreen) {
                    return function () {
                        this.mozRequestFullScreen();
                        __touch(21774);
                    };
                    __touch(21773);
                }
                return function () {
                };
                __touch(21770);
            }();
            __touch(21769);
        }
        if (!document.cancelFullScreen) {
            document.cancelFullScreen = function () {
                return document.webkitCancelFullScreen || document.mozCancelFullScreen || function () {
                };
                __touch(21776);
            }();
            __touch(21775);
        }
    };
    __touch(21708);
    GameUtils.initPointerLockShims = function (global) {
        global = global || window;
        __touch(21777);
        var elementPrototype = (global.HTMLElement || global.Element).prototype;
        __touch(21778);
        if (!global.MouseEvent) {
            return;
            __touch(21788);
        }
        var mouseEventPrototype = global.MouseEvent.prototype;
        __touch(21779);
        if (!('movementX' in mouseEventPrototype)) {
            Object.defineProperty(mouseEventPrototype, 'movementX', {
                enumerable: true,
                configurable: false,
                writeable: false,
                get: function () {
                    return this.webkitMovementX || this.mozMovementX || 0;
                    __touch(21790);
                }
            });
            __touch(21789);
        }
        if (!('movementY' in mouseEventPrototype)) {
            Object.defineProperty(mouseEventPrototype, 'movementY', {
                enumerable: true,
                configurable: false,
                writeable: false,
                get: function () {
                    return this.webkitMovementY || this.mozMovementY || 0;
                    __touch(21792);
                }
            });
            __touch(21791);
        }
        if (!navigator.pointer) {
            navigator.pointer = navigator.webkitPointer || navigator.mozPointer;
            __touch(21793);
        }
        function pointerlockchange() {
            var newEvent = document.createEvent('CustomEvent');
            __touch(21794);
            newEvent.initCustomEvent('pointerlockchange', true, false, null);
            __touch(21795);
            document.dispatchEvent(newEvent);
            __touch(21796);
        }
        __touch(21780);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
        __touch(21781);
        document.addEventListener('webkitpointerlocklost', pointerlockchange, false);
        __touch(21782);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        __touch(21783);
        document.addEventListener('mozpointerlocklost', pointerlockchange, false);
        __touch(21784);
        function pointerlockerror() {
            var newEvent = document.createEvent('CustomEvent');
            __touch(21797);
            newEvent.initCustomEvent('pointerlockerror', true, false, null);
            __touch(21798);
            document.dispatchEvent(newEvent);
            __touch(21799);
        }
        __touch(21785);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
        __touch(21786);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        __touch(21787);
        if (!document.hasOwnProperty('pointerLockElement')) {
            var getter = function () {
                if ('webkitPointerLockElement' in document) {
                    return function () {
                        return document.webkitPointerLockElement;
                        __touch(21804);
                    };
                    __touch(21803);
                }
                if ('mozPointerLockElement' in document) {
                    return function () {
                        return document.mozPointerLockElement;
                        __touch(21806);
                    };
                    __touch(21805);
                }
                return function () {
                    return null;
                    __touch(21807);
                };
                __touch(21802);
            }();
            __touch(21800);
            Object.defineProperty(document, 'pointerLockElement', {
                enumerable: true,
                configurable: false,
                writeable: false,
                get: getter
            });
            __touch(21801);
        }
        if (!elementPrototype.requestPointerLock) {
            elementPrototype.requestPointerLock = function () {
                if (elementPrototype.webkitRequestPointerLock) {
                    return function () {
                        this.webkitRequestPointerLock();
                        __touch(21812);
                    };
                    __touch(21811);
                }
                if (elementPrototype.mozRequestPointerLock) {
                    return function () {
                        this.mozRequestPointerLock();
                        __touch(21814);
                    };
                    __touch(21813);
                }
                if (navigator.pointer) {
                    return function () {
                        var elem = this;
                        __touch(21816);
                        navigator.pointer.lock(elem, pointerlockchange, pointerlockerror);
                        __touch(21817);
                    };
                    __touch(21815);
                }
                GameUtils.supported.pointerLock = false;
                __touch(21809);
                return function () {
                };
                __touch(21810);
            }();
            __touch(21808);
        }
        if (!document.exitPointerLock) {
            document.exitPointerLock = function () {
                return document.webkitExitPointerLock || document.mozExitPointerLock || function () {
                    if (navigator.pointer) {
                        navigator.pointer.unlock();
                        __touch(21820);
                    }
                };
                __touch(21819);
            }();
            __touch(21818);
        }
    };
    __touch(21709);
    return GameUtils;
    __touch(21710);
});
__touch(21695);