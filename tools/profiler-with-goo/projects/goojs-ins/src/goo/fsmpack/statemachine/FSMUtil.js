define(function () {
    'use strict';
    __touch(5990);
    function FSMUtil() {
    }
    __touch(5991);
    FSMUtil.setParameters = function (settings, externalParameters) {
        for (var i = 0; i < externalParameters.length; i++) {
            var externalParameter = externalParameters[i];
            __touch(6005);
            var key = externalParameter.key;
            __touch(6006);
            if (typeof settings[key] !== 'undefined') {
                this[key] = settings[key];
                __touch(6007);
            } else {
                this[key] = externalParameter['default'];
                __touch(6008);
            }
        }
    };
    __touch(5992);
    FSMUtil.setTransitions = function (settings, externalTransitions) {
        for (var i = 0; i < externalTransitions.length; i++) {
            var externalTransition = externalTransitions[i];
            __touch(6009);
            var key = externalTransition.key;
            __touch(6010);
            this.transitions = this.transitions || {};
            __touch(6011);
            this.transitions[key] = settings.transitions[key];
            __touch(6012);
        }
    };
    __touch(5993);
    FSMUtil.getKey = function (str) {
        if (FSMUtil.keys[str]) {
            return FSMUtil.keys[str];
            __touch(6013);
        } else {
            return str.charCodeAt(0);
            __touch(6014);
        }
    };
    __touch(5994);
    FSMUtil.keys = {
        'Backspace': 8,
        'Tab': 9,
        'Enter': 13,
        'Shift': 16,
        'Ctrl': 17,
        'Alt': 18,
        'Pause': 19,
        'Capslock': 20,
        'Esc': 27,
        'Space': 32,
        'Pageup': 33,
        'Pagedown': 34,
        'End': 35,
        'Home': 36,
        'Leftarrow': 37,
        'Uparrow': 38,
        'Rightarrow': 39,
        'Downarrow': 40,
        'Insert': 45,
        'Delete': 46,
        '0': 48,
        '1': 49,
        '2': 50,
        '3': 51,
        '4': 52,
        '5': 53,
        '6': 54,
        '7': 55,
        '8': 56,
        '9': 57,
        'a': 65,
        'b': 66,
        'c': 67,
        'd': 68,
        'e': 69,
        'f': 70,
        'g': 71,
        'h': 72,
        'i': 73,
        'j': 74,
        'k': 75,
        'l': 76,
        'm': 77,
        'n': 78,
        'o': 79,
        'p': 80,
        'q': 81,
        'r': 82,
        's': 83,
        't': 84,
        'u': 85,
        'v': 86,
        'w': 87,
        'x': 88,
        'y': 89,
        'z': 90,
        'A': 65,
        'B': 66,
        'C': 67,
        'D': 68,
        'E': 69,
        'F': 70,
        'G': 71,
        'H': 72,
        'I': 73,
        'J': 74,
        'K': 75,
        'L': 76,
        'M': 77,
        'N': 78,
        'O': 79,
        'P': 80,
        'Q': 81,
        'R': 82,
        'S': 83,
        'T': 84,
        'U': 85,
        'V': 86,
        'W': 87,
        'X': 88,
        'Y': 89,
        'Z': 90,
        '0numpad': 96,
        '1numpad': 97,
        '2numpad': 98,
        '3numpad': 99,
        '4numpad': 100,
        '5numpad': 101,
        '6numpad': 102,
        '7numpad': 103,
        '8numpad': 104,
        '9numpad': 105,
        'Multiply': 106,
        'Plus': 107,
        'Minus': 109,
        'Dot': 110,
        'Slash1': 111,
        'F1': 112,
        'F2': 113,
        'F3': 114,
        'F4': 115,
        'F5': 116,
        'F6': 117,
        'F7': 118,
        'F8': 119,
        'F9': 120,
        'F10': 121,
        'F11': 122,
        'F12': 123,
        'Equals': 187,
        'Comma': 188,
        'Slash': 191,
        'Backslash': 220
    };
    __touch(5995);
    FSMUtil.keyInverse = [];
    __touch(5996);
    function buildKeyInverse(assoc) {
        var inverseAssoc = [];
        __touch(6015);
        var keys = Object.keys(assoc);
        __touch(6016);
        for (var i = 0; i < keys.length; i++) {
            inverseAssoc[assoc[keys[i]]] = keys[i];
            __touch(6018);
        }
        return inverseAssoc;
        __touch(6017);
    }
    __touch(5997);
    FSMUtil.keyInverse = buildKeyInverse(FSMUtil.keys);
    __touch(5998);
    FSMUtil.keyForCode = function (code) {
        if (FSMUtil.keyInverse[code]) {
            return FSMUtil.keyInverse[code];
            __touch(6020);
        }
        return 'FSMUtil.keyForCode: key not found for code ' + code;
        __touch(6019);
    };
    __touch(5999);
    var s4 = function () {
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
        __touch(6021);
    };
    __touch(6000);
    FSMUtil.guid = function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        __touch(6022);
    };
    __touch(6001);
    FSMUtil.getValue = function (par, fsm) {
        if (typeof par === 'number') {
            return par;
            __touch(6023);
        } else {
            return fsm.getVariable(par);
            __touch(6024);
        }
    };
    __touch(6002);
    FSMUtil.createComposableTween = function (object, propertyName, from, to, time, callback) {
        var tween = new window.TWEEN.Tween();
        __touch(6025);
        var old = from;
        __touch(6026);
        return tween.from({ v: from }).to({ v: to }).onUpdate(function () {
            object[propertyName] += this.v - old;
            __touch(6028);
            old = this.v;
            __touch(6029);
            if (callback) {
                callback();
                __touch(6030);
            }
        });
        __touch(6027);
    };
    __touch(6003);
    return FSMUtil;
    __touch(6004);
});
__touch(5989);