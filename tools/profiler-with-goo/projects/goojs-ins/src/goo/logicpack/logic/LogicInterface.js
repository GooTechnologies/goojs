define(function () {
    'use strict';
    __touch(9923);
    function LogicInterface(name) {
        this.ports = [];
        __touch(9940);
        this.configOpts = [];
        __touch(9941);
        if (name === undefined) {
            this.dn_pfx = '';
            __touch(9942);
        } else {
            this.dn_pfx = name + '-';
            __touch(9943);
        }
    }
    __touch(9924);
    LogicInterface.prototype.addInputProperty = function (name_, valueType, defaultValue) {
        this.ports.push({
            id: ++LogicInterface._portID,
            input: true,
            property: true,
            event: false,
            name: this.dn_pfx + name_,
            type: valueType,
            def: defaultValue
        });
        __touch(9944);
        return LogicInterface._portID;
        __touch(9945);
    };
    __touch(9925);
    LogicInterface.prototype.addOutputProperty = function (name_, valueType) {
        this.ports.push({
            id: ++LogicInterface._portID,
            input: false,
            property: true,
            event: false,
            name: this.dn_pfx + name_,
            type: valueType
        });
        __touch(9946);
        return LogicInterface._portID;
        __touch(9947);
    };
    __touch(9926);
    LogicInterface.prototype.addInputEvent = function (name_) {
        this.ports.push({
            id: ++LogicInterface._portID,
            input: true,
            property: false,
            event: true,
            name: this.dn_pfx + name_
        });
        __touch(9948);
        return LogicInterface._portID;
        __touch(9949);
    };
    __touch(9927);
    LogicInterface.prototype.addOutputEvent = function (name_) {
        this.ports.push({
            id: ++LogicInterface._portID,
            input: false,
            property: false,
            event: true,
            name: this.dn_pfx + name_
        });
        __touch(9950);
        return LogicInterface._portID;
        __touch(9951);
    };
    __touch(9928);
    LogicInterface.createDynamicInput = function (name_) {
        return {
            id: LogicInterface.makeDynamicId(),
            input: true,
            property: true,
            event: true,
            dynamic: true,
            name: name_
        };
        __touch(9952);
    };
    __touch(9929);
    LogicInterface.createDynamicOutput = function (name_) {
        return {
            id: LogicInterface.makeDynamicId(),
            input: false,
            property: true,
            event: true,
            dynamic: true,
            name: name_
        };
        __touch(9953);
    };
    __touch(9930);
    LogicInterface.prototype.addConfigEntry = function (conf) {
        this.configOpts.push(conf);
        __touch(9954);
    };
    __touch(9931);
    LogicInterface.prototype.getConfigEntries = function () {
        return this.configOpts;
        __touch(9955);
    };
    __touch(9932);
    LogicInterface.prototype.getPorts = function () {
        return this.ports;
        __touch(9956);
    };
    __touch(9933);
    LogicInterface.isDynamicPortName = function (name) {
        return name[0] === '$';
        __touch(9957);
    };
    __touch(9934);
    LogicInterface.makeDynamicId = function () {
        return ++LogicInterface._portID;
        __touch(9958);
    };
    __touch(9935);
    LogicInterface.makePortDataName = function (port) {
        if (port.dataname !== undefined) {
            return port.dataname;
            __touch(9959);
        } else {
            var prefix = port.input ? 'in-' : 'out-';
            __touch(9960);
            if (port.property) {
                prefix += 'prop-';
                __touch(9963);
            }
            if (port.event) {
                prefix += 'event-';
                __touch(9964);
            }
            var dyn = port.dynamic === true ? '$' : '';
            __touch(9961);
            return dyn + prefix + port.name;
            __touch(9962);
        }
    };
    __touch(9936);
    LogicInterface.assignPortDataName = function (port, dataname) {
        port.dataname = dataname;
        __touch(9965);
    };
    __touch(9937);
    LogicInterface._portID = 0;
    __touch(9938);
    return LogicInterface;
    __touch(9939);
});
__touch(9922);