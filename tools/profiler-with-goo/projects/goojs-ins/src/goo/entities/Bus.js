define(['goo/util/ArrayUtil'], function (ArrayUtil) {
    'use strict';
    __touch(3816);
    function Bus() {
        this.trie = {
            name: '',
            listeners: [],
            children: {}
        };
        __touch(3831);
    }
    __touch(3817);
    Bus.prototype.emit = function (channels, data, storeEmit) {
        storeEmit = !!storeEmit;
        __touch(3832);
        if (typeof channels === 'string') {
            channels = [channels];
            __touch(3834);
        }
        for (var i = 0; i < channels.length; i++) {
            this._emitToSingle(channels[i], data, storeEmit);
            __touch(3835);
        }
        return this;
        __touch(3833);
    };
    __touch(3818);
    Bus.prototype.getLastMessageOn = function (channelName) {
        var node = this._getNode(channelName);
        __touch(3836);
        if (node) {
            return node.latestData;
            __touch(3837);
        }
    };
    __touch(3819);
    Bus.prototype._getNode = function (channelName, storeEmit) {
        var node = this.trie;
        __touch(3838);
        var channelPath = channelName.split('.');
        __touch(3839);
        for (var i = 0; i < channelPath.length; i++) {
            var channelSub = channelPath[i];
            __touch(3841);
            if (node.children[channelSub]) {
                node = node.children[channelSub];
                __touch(3842);
            } else {
                if (storeEmit) {
                    var newNode = {
                        listeners: [],
                        children: []
                    };
                    __touch(3843);
                    node.children[channelSub] = newNode;
                    __touch(3844);
                    node = newNode;
                    __touch(3845);
                } else {
                    return;
                    __touch(3846);
                }
            }
        }
        return node;
        __touch(3840);
    };
    __touch(3820);
    Bus.prototype._emitToSingle = function (channelName, data, storeEmit) {
        var node = this._getNode(channelName, storeEmit);
        __touch(3847);
        if (node) {
            this._emitToAll(node, data);
            __touch(3848);
            if (storeEmit) {
                node.latestData = data;
                __touch(3849);
            }
        }
    };
    __touch(3821);
    Bus.prototype._emitToAll = function (node, data) {
        for (var i = 0; i < node.listeners.length; i++) {
            node.listeners[i](data);
            __touch(3851);
        }
        var childrenKeys = Object.keys(node.children);
        __touch(3850);
        for (var i = 0; i < childrenKeys.length; i++) {
            this._emitToAll(node.children[childrenKeys], data);
            __touch(3852);
        }
    };
    __touch(3822);
    Bus.prototype.addListener = function (channelName, callback, retrieveLatestEmit) {
        retrieveLatestEmit = !!retrieveLatestEmit;
        __touch(3853);
        var node = this.trie;
        __touch(3854);
        var channelPath = channelName.split('.');
        __touch(3855);
        for (var i = 0; i < channelPath.length; i++) {
            var channelSub = channelPath[i];
            __touch(3857);
            if (node.children[channelSub]) {
                node = node.children[channelSub];
                __touch(3858);
            } else {
                var newNode = {
                    listeners: [],
                    children: []
                };
                __touch(3859);
                node.children[channelSub] = newNode;
                __touch(3860);
                node = newNode;
                __touch(3861);
            }
        }
        if (node.listeners.indexOf(callback) === -1) {
            node.listeners.push(callback);
            __touch(3862);
            if (retrieveLatestEmit && node.latestData) {
                callback(node.latestData);
                __touch(3863);
            }
        }
        return this;
        __touch(3856);
    };
    __touch(3823);
    Bus.prototype.removeListener = function (channelName, callbackToRemove) {
        var node = this._getNode(channelName);
        __touch(3864);
        if (node) {
            ArrayUtil.remove(node.listeners, callbackToRemove);
            __touch(3866);
        }
        return this;
        __touch(3865);
    };
    __touch(3824);
    Bus.prototype.removeAllOnChannel = function (channelName) {
        var node = this._getNode(channelName);
        __touch(3867);
        if (node) {
            node.listeners = [];
            __touch(3869);
        }
        return this;
        __touch(3868);
    };
    __touch(3825);
    Bus.prototype.removeChannelAndChildren = function (channelName) {
        var channelParts = channelName.split('.');
        __touch(3870);
        if (channelParts.length > 1) {
            var leafChannelName = channelParts.pop();
            __touch(3872);
            var parentChannelName = channelParts.join('.');
            __touch(3873);
            var parentNode = this._getNode(parentChannelName);
            __touch(3874);
            delete parentNode.children[leafChannelName];
            __touch(3875);
        } else {
            delete this.trie.children[channelName];
            __touch(3876);
        }
        return this;
        __touch(3871);
    };
    __touch(3826);
    Bus.prototype._removeListener = function (node, callbackToRemove) {
        ArrayUtil.remove(node.listeners, callbackToRemove);
        __touch(3877);
        var childrenKeys = Object.keys(node.children);
        __touch(3878);
        for (var i = 0; i < childrenKeys.length; i++) {
            this._removeListener(node.children[childrenKeys[i]], callbackToRemove);
            __touch(3879);
        }
    };
    __touch(3827);
    Bus.prototype.removeListenerFromAllChannels = function (callbackToRemove) {
        this._removeListener(this.trie, callbackToRemove);
        __touch(3880);
        return this;
        __touch(3881);
    };
    __touch(3828);
    Bus.prototype.clear = function () {
        this.trie = {
            name: '',
            listeners: [],
            children: {}
        };
        __touch(3882);
    };
    __touch(3829);
    return Bus;
    __touch(3830);
});
__touch(3815);