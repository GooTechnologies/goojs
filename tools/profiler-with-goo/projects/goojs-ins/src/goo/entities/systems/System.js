define(function () {
    'use strict';
    __touch(5783);
    function System(type, interests) {
        this.type = type;
        __touch(5794);
        this.interests = interests;
        __touch(5795);
        this._activeEntities = [];
        __touch(5796);
        this.passive = false;
        __touch(5797);
        this.priority = 0;
        __touch(5798);
    }
    __touch(5784);
    System.prototype.added = function (entity) {
        this._check(entity);
        __touch(5799);
    };
    __touch(5785);
    System.prototype.changed = function (entity) {
        this._check(entity);
        __touch(5800);
    };
    __touch(5786);
    System.prototype.removed = function (entity) {
        var index = this._activeEntities.indexOf(entity);
        __touch(5801);
        if (index !== -1) {
            this._activeEntities.splice(index, 1);
            __touch(5802);
            if (this.deleted) {
                this.deleted(entity);
                __touch(5803);
            }
        }
    };
    __touch(5787);
    System.prototype.cleanup = function () {
        if (this.deleted) {
            for (var i = 0; i < this._activeEntities.length; i++) {
                var entity = this._activeEntities[i];
                __touch(5804);
                this.deleted(entity);
                __touch(5805);
            }
        }
    };
    __touch(5788);
    function getTypeAttributeName(type) {
        return type.charAt(0).toLowerCase() + type.substr(1);
        __touch(5806);
    }
    __touch(5789);
    System.prototype._check = function (entity) {
        if (this.interests && this.interests.length === 0) {
            return;
            __touch(5809);
        }
        var isInterested = this.interests === null;
        __touch(5807);
        if (!isInterested && this.interests.length <= entity._components.length) {
            isInterested = true;
            __touch(5810);
            for (var i = 0; i < this.interests.length; i++) {
                var interest = getTypeAttributeName(this.interests[i]);
                __touch(5811);
                if (!entity[interest]) {
                    isInterested = false;
                    __touch(5812);
                    break;
                    __touch(5813);
                }
            }
        }
        var index = this._activeEntities.indexOf(entity);
        __touch(5808);
        if (isInterested && index === -1) {
            this._activeEntities.push(entity);
            __touch(5814);
            if (this.inserted) {
                this.inserted(entity);
                __touch(5815);
            }
        } else if (!isInterested && index !== -1) {
            this._activeEntities.splice(index, 1);
            __touch(5816);
            if (this.deleted) {
                this.deleted(entity);
                __touch(5817);
            }
        }
    };
    __touch(5790);
    System.prototype._process = function (tpf) {
        if (this.process) {
            this.process(this._activeEntities, tpf);
            __touch(5818);
        }
    };
    __touch(5791);
    System.prototype.clear = function () {
        this._activeEntities = [];
        __touch(5819);
    };
    __touch(5792);
    return System;
    __touch(5793);
});
__touch(5782);