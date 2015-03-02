define(['goo/logic/LogicInterface'], function (LogicInterface) {
    'use strict';
    __touch(9967);
    function LogicLayer(ownerEntity) {
        this._logicInterfaces = {};
        __touch(9986);
        this._connectionsBySource = {};
        __touch(9987);
        this._instanceID = 0;
        __touch(9988);
        this._updateRound = 0;
        __touch(9989);
        this._nextFrameNotifications = [];
        __touch(9990);
        this.ownerEntity = ownerEntity;
        __touch(9991);
        this.logicSystem = ownerEntity._world.getSystem('LogicSystem');
        __touch(9992);
    }
    __touch(9968);
    LogicLayer.prototype.clear = function () {
        this._logicInterfaces = {};
        __touch(9993);
        this._connectionsBySource = {};
        __touch(9994);
        this._instanceID = 0;
        __touch(9995);
        this._nextFrameNotifications = [];
        __touch(9996);
    };
    __touch(9969);
    LogicLayer.prototype.addInterfaceInstance = function (iface, instance, name, wantsProcessCall) {
        if (name === null) {
            name = '_auto-' + this._instanceID;
            __touch(10004);
        }
        var instDesc = {
            id: this._instanceID,
            name: name,
            obj: instance,
            iface: iface,
            layer: this,
            wantsProcess: wantsProcessCall
        };
        __touch(9997);
        this._instanceID++;
        __touch(9998);
        var _this = this;
        __touch(9999);
        instDesc.remove = function () {
            delete this.outConnections;
            __touch(10005);
            delete _this._logicInterfaces[name];
            __touch(10006);
            _this.unresolveAllConnections();
            __touch(10007);
        };
        __touch(10000);
        instDesc.getPorts = function () {
            return iface.getPorts();
            __touch(10008);
        };
        __touch(10001);
        if (instance.entityRef !== undefined) {
            instDesc.proxyRef = instance.entityRef;
            __touch(10009);
        }
        this._logicInterfaces[name] = instDesc;
        __touch(10002);
        return instDesc;
        __touch(10003);
    };
    __touch(9970);
    LogicLayer.prototype.unresolveAllConnections = function () {
        for (var n in this._logicInterfaces) {
            var ports = this._logicInterfaces[n].outConnections;
            __touch(10011);
            if (ports === undefined) {
                continue;
                __touch(10013);
            }
            for (var p in ports) {
                var cx = ports[p];
                __touch(10014);
                for (var i = 0; i < cx.length; i++) {
                    if (cx[i].length > 2) {
                        cx[i] = [
                            cx[i][0],
                            cx[i][1]
                        ];
                        __touch(10015);
                    }
                }
            }
            __touch(10012);
        }
        __touch(10010);
    };
    __touch(9971);
    LogicLayer.resolvePortID = function (instDesc, portName) {
        if (typeof portName === 'number') {
            return portName;
            __touch(10019);
        }
        if (LogicInterface.isDynamicPortName(portName)) {
            return portName;
            __touch(10020);
        }
        var ports = instDesc.getPorts();
        __touch(10016);
        for (var j = 0; j < ports.length; j++) {
            if (LogicInterface.makePortDataName(ports[j]) === portName) {
                return ports[j].id;
                __touch(10021);
            }
        }
        console.warn('Unable to resolve port [' + portName + ']!');
        __touch(10017);
        return null;
        __touch(10018);
    };
    __touch(9972);
    LogicLayer.prototype.resolveTargetAndPortID = function (targetRef, portName) {
        var tgt = this._logicInterfaces[targetRef];
        __touch(10022);
        if (tgt === undefined) {
            return;
            __touch(10026);
        }
        if (tgt.obj.entityRef !== undefined && LogicInterface.isDynamicPortName(portName)) {
            var logicLayer2 = this.logicSystem.getLayerByEntity(tgt.obj.entityRef);
            __touch(10027);
            for (var n in logicLayer2._logicInterfaces) {
                var l = logicLayer2._logicInterfaces[n];
                __touch(10029);
                if (l.obj.type === 'LogicNodeInput' && l.obj.dummyInport !== null && LogicInterface.makePortDataName(l.obj.dummyInport)) {
                    return {
                        target: l,
                        portID: portName
                    };
                    __touch(10030);
                }
            }
            __touch(10028);
        }
        var directAttempt = LogicLayer.resolvePortID(tgt, portName);
        __touch(10023);
        if (directAttempt !== null) {
            return {
                target: tgt,
                portID: directAttempt
            };
            __touch(10031);
        }
        console.warn('Failed resolving target&portid to ' + targetRef + ':' + portName);
        __touch(10024);
        return null;
        __touch(10025);
    };
    __touch(9973);
    LogicLayer.prototype.addConnectionByName = function (instDesc, sourcePort, targetName, targetPort) {
        if (instDesc.outConnections === undefined) {
            instDesc.outConnections = {};
            __touch(10034);
        }
        var sourcePortID = LogicLayer.resolvePortID(instDesc, sourcePort);
        __touch(10032);
        if (instDesc.outConnections[sourcePortID] === undefined) {
            instDesc.outConnections[sourcePortID] = [];
            __touch(10035);
        }
        instDesc.outConnections[sourcePortID].push([
            targetName,
            targetPort
        ]);
        __touch(10033);
    };
    __touch(9974);
    LogicLayer.doConnections = function (instDesc, portID, func) {
        if (instDesc.outConnections === undefined) {
            return;
            __touch(10037);
        }
        var cArr = instDesc.outConnections[portID];
        __touch(10036);
        if (cArr === undefined) {
            return;
            __touch(10038);
        }
        if (cArr.length === 0) {
            delete instDesc.outConnections;
            __touch(10039);
        }
        for (var i = 0; i < cArr.length; i++) {
            var tconn = cArr[i];
            __touch(10040);
            if (tconn.length === 2) {
                var out = instDesc.layer.resolveTargetAndPortID(tconn[0], tconn[1]);
                __touch(10042);
                if (out === null) {
                    console.log('Target unresolved ' + tconn[0] + ' and ' + tconn[1]);
                    __touch(10045);
                    continue;
                    __touch(10046);
                }
                tconn.push(out.target);
                __touch(10043);
                tconn.push(out.portID);
                __touch(10044);
            }
            func(tconn[2], tconn[3]);
            __touch(10041);
        }
    };
    __touch(9975);
    LogicLayer.writeValue = function (instDesc, outPortID, value) {
        LogicLayer.doConnections(instDesc, outPortID, function (targetDesc, portID) {
            if (targetDesc._portValues === undefined) {
                targetDesc._portValues = {};
                __touch(10050);
            }
            if (targetDesc._lastNotification === undefined) {
                targetDesc._lastNotification = {};
                __touch(10051);
            }
            var old = targetDesc._portValues[portID];
            __touch(10048);
            targetDesc._portValues[portID] = value;
            __touch(10049);
            if (old !== value) {
                var tlayer = targetDesc.layer;
                __touch(10052);
                if (targetDesc._lastNotification[portID] !== tlayer._updateRound) {
                    targetDesc._lastNotification[portID] = tlayer._updateRound;
                    __touch(10053);
                    targetDesc.obj.onInputChanged(targetDesc, portID, value);
                    __touch(10054);
                } else {
                    tlayer._nextFrameNotifications.push([
                        targetDesc,
                        portID,
                        value
                    ]);
                    __touch(10055);
                }
            }
        });
        __touch(10047);
    };
    __touch(9976);
    LogicLayer.writeValueToLayerOutput = function (outNodeDesc, outPortDesc, value) {
        var writeFn = outNodeDesc.layer.logicSystem.makeOutputWriteFn(outNodeDesc.layer.ownerEntity, outPortDesc);
        __touch(10056);
        writeFn(value);
        __touch(10057);
    };
    __touch(9977);
    LogicLayer.readPort = function (instDesc, portID) {
        var value = instDesc._portValues;
        __touch(10058);
        if (value !== undefined) {
            value = value[portID];
            __touch(10063);
        } else {
            instDesc._portValues = {};
            __touch(10064);
        }
        if (value !== undefined) {
            return value;
            __touch(10065);
        }
        var ports = instDesc.iface.getPorts();
        __touch(10059);
        for (var n in ports) {
            if (ports[n].id === portID) {
                return instDesc._portValues[portID] = ports[n].def;
                __touch(10066);
            }
        }
        __touch(10060);
        console.log('Could not find the port [' + portID + ']!');
        __touch(10061);
        return undefined;
        __touch(10062);
    };
    __touch(9978);
    LogicLayer.fireEvent = function (instDesc, outPortID) {
        LogicLayer.doConnections(instDesc, outPortID, function (targetDesc, portID) {
            targetDesc.obj.onEvent(targetDesc, portID);
            __touch(10068);
        });
        __touch(10067);
    };
    __touch(9979);
    LogicLayer.resolveEntityRef = function (instDesc, entityRef) {
        if (entityRef === '[self]') {
            return instDesc.layer.ownerEntity;
            __touch(10069);
        } else {
            return instDesc.layer.logicSystem.resolveEntityRef(entityRef);
            __touch(10070);
        }
    };
    __touch(9980);
    LogicLayer.prototype.process = function (tpf) {
        var not = this._nextFrameNotifications;
        __touch(10071);
        this._nextFrameNotifications = [];
        __touch(10072);
        for (var i = 0; i < not.length; i++) {
            var ne = not[i];
            __touch(10075);
            ne[0]._lastNotification[ne[1]] = this._updateRound;
            __touch(10076);
            ne[0].obj.onInputChanged(ne[0], ne[1], ne[2]);
            __touch(10077);
        }
        for (var i in this._logicInterfaces) {
            if (this._logicInterfaces[i].wantsProcess && this._logicInterfaces[i].obj.processLogic) {
                this._logicInterfaces[i].obj.processLogic(tpf);
                __touch(10078);
            }
        }
        __touch(10073);
        this._updateRound++;
        __touch(10074);
    };
    __touch(9981);
    LogicLayer.prototype.forEachLogicObject = function (f) {
        for (var i in this._logicInterfaces) {
            var o = this._logicInterfaces[i].obj;
            __touch(10080);
            if (o !== undefined) {
                f(o);
                __touch(10081);
            }
        }
        __touch(10079);
    };
    __touch(9982);
    LogicLayer.prototype.connectObjectsWithLogic = function (sourceObj, sourcePort, destObj, destPort) {
        this.connectEndpoints(sourceObj.logicInstance, sourcePort, destObj.logicInstance, destPort);
        __touch(10082);
    };
    __touch(9983);
    LogicLayer.prototype.connectEndpoints = function (sourceInst, sourcePort, destInst, destPort) {
        this.addConnectionByName(sourceInst, sourcePort, destInst.name, destPort);
        __touch(10083);
    };
    __touch(9984);
    return LogicLayer;
    __touch(9985);
});
__touch(9966);