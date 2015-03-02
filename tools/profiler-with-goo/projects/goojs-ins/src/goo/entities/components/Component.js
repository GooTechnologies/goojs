define(function () {
    'use strict';
    __touch(4714);
    function Component() {
        this.enabled = true;
        __touch(4719);
        this.installedAPI = {};
        __touch(4720);
    }
    __touch(4715);
    Component.prototype.applyAPI = function (entity) {
        if (!this.installedAPI) {
            this.installedAPI = {};
            __touch(4723);
        }
        var api = this.api;
        __touch(4721);
        if (!api) {
            return;
            __touch(4724);
        }
        var keys = Object.keys(api);
        __touch(4722);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            __touch(4725);
            if (typeof entity[key] === 'undefined') {
                entity[key] = api[key];
                __touch(4726);
                this.installedAPI[key] = true;
                __touch(4727);
            } else {
                console.warn('Could not install method ' + key + ' of ' + this.type + ' as it is already taken');
                __touch(4728);
            }
        }
    };
    __touch(4716);
    Component.prototype.removeAPI = function (entity) {
        var installedAPI = this.installedAPI;
        __touch(4729);
        var keys = Object.keys(installedAPI);
        __touch(4730);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            __touch(4731);
            delete entity[key];
            __touch(4732);
        }
    };
    __touch(4717);
    return Component;
    __touch(4718);
});
__touch(4713);