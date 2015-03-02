define([], function () {
    'use strict';
    __touch(5249);
    function Manager() {
    }
    __touch(5250);
    Manager.prototype.applyAPI = function (worldBy) {
        if (!this.installedAPI) {
            this.installedAPI = {};
            __touch(5255);
        }
        var api = this.api;
        __touch(5253);
        for (var key in api) {
            if (typeof worldBy[key] === 'undefined') {
                worldBy[key] = api[key];
                __touch(5256);
                this.installedAPI[key] = true;
                __touch(5257);
            } else {
                console.warn('Could not install method ' + key + ' of ' + this.type + ' as it is already taken');
                __touch(5258);
            }
        }
        __touch(5254);
    };
    __touch(5251);
    return Manager;
    __touch(5252);
});
__touch(5248);