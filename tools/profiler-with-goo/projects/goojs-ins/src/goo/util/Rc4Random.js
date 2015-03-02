define(function () {
    'use strict';
    __touch(22211);
    function Rc4Random(seed) {
        var keySchedule = [];
        __touch(22214);
        var keySchedule_i = 0;
        __touch(22215);
        var keySchedule_j = 0;
        __touch(22216);
        this.init = function (seed) {
            for (var i = 0; i < 256; i++) {
                keySchedule[i] = i;
                __touch(22222);
            }
            var j = 0;
            __touch(22221);
            for (var i = 0; i < 256; i++) {
                j = (j + keySchedule[i] + seed.charCodeAt(i % seed.length)) % 256;
                __touch(22223);
                var t = keySchedule[i];
                __touch(22224);
                keySchedule[i] = keySchedule[j];
                __touch(22225);
                keySchedule[j] = t;
                __touch(22226);
            }
        };
        __touch(22217);
        this.init(seed);
        __touch(22218);
        function getRandomByte() {
            keySchedule_i = (keySchedule_i + 1) % 256;
            __touch(22227);
            keySchedule_j = (keySchedule_j + keySchedule[keySchedule_i]) % 256;
            __touch(22228);
            var t = keySchedule[keySchedule_i];
            __touch(22229);
            keySchedule[keySchedule_i] = keySchedule[keySchedule_j];
            __touch(22230);
            keySchedule[keySchedule_j] = t;
            __touch(22231);
            return keySchedule[(keySchedule[keySchedule_i] + keySchedule[keySchedule_j]) % 256];
            __touch(22232);
        }
        __touch(22219);
        this.getRandomNumber = function () {
            var number = 0;
            __touch(22233);
            var multiplier = 1;
            __touch(22234);
            for (var i = 0; i < 8; i++) {
                number += getRandomByte() * multiplier;
                __touch(22236);
                multiplier *= 256;
                __touch(22237);
            }
            return number / 18446744073709552000;
            __touch(22235);
        };
        __touch(22220);
    }
    __touch(22212);
    return Rc4Random;
    __touch(22213);
});
__touch(22210);