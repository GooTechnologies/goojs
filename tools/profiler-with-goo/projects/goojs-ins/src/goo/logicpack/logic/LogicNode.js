define(function () {
    'use strict';
    __touch(10085);
    function LogicNode() {
        Object.defineProperty(this, 'id', {
            value: LogicNode._instanceCount++,
            writable: false
        });
        __touch(10095);
        this.config = { ref: 'unconf-' + this.id };
        __touch(10096);
        this.name = name !== undefined ? name : 'Logic_' + this.id;
        __touch(10097);
        this.logicInstance = null;
        __touch(10098);
        this.wantsProcessCall = false;
        __touch(10099);
    }
    __touch(10086);
    LogicNode.prototype.addToLogicLayer = function (logicLayer, withId) {
        if (this.logicInstance !== null) {
            this.logicInstance.remove();
            __touch(10101);
        }
        this.logicInstance = logicLayer.addInterfaceInstance(this.logicInterface, this, withId, this.wantsProcessCall);
        __touch(10100);
        if (this.connections !== undefined) {
            for (var i = 0; i < this.connections.length; i++) {
                var conn = this.connections[i];
                __touch(10103);
                logicLayer.addConnectionByName(this.logicInstance, conn.sourcePort, conn.targetRef, conn.targetPort);
                __touch(10104);
            }
            delete this.connections;
            __touch(10102);
        }
    };
    __touch(10087);
    LogicNode.prototype.configure = function (nodeData) {
        var c = nodeData.config !== undefined ? nodeData.config : {};
        __touch(10105);
        this.onConfigure(c);
        __touch(10106);
        this.config = c;
        __touch(10107);
        this.connections = nodeData.connections;
        __touch(10108);
    };
    __touch(10088);
    LogicNode.prototype.onConfigure = function () {
    };
    __touch(10089);
    LogicNode.prototype.onSystemStarted = function () {
    };
    __touch(10090);
    LogicNode.prototype.onSystemStopped = function () {
    };
    __touch(10091);
    LogicNode.prototype.onInputChanged = function () {
    };
    __touch(10092);
    LogicNode._instanceCount = 0;
    __touch(10093);
    return LogicNode;
    __touch(10094);
});
__touch(10084);