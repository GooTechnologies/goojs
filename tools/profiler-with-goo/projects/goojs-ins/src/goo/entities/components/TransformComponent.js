define([
    'goo/math/Transform',
    'goo/math/Vector3',
    'goo/entities/components/Component',
    'goo/entities/EntitySelection',
    'goo/math/Matrix4x4'
], function (Transform, Vector3, Component, EntitySelection, Matrix4x4) {
    'use strict';
    __touch(5024);
    function TransformComponent() {
        this.type = 'TransformComponent';
        __touch(5050);
        this.entity = null;
        __touch(5051);
        this.parent = null;
        __touch(5052);
        this.children = [];
        __touch(5053);
        this.transform = new Transform();
        __touch(5054);
        this.worldTransform = new Transform();
        __touch(5055);
        this._dirty = true;
        __touch(5056);
        this._updated = false;
        __touch(5057);
    }
    __touch(5025);
    TransformComponent.type = 'TransformComponent';
    __touch(5026);
    TransformComponent.prototype = Object.create(Component.prototype);
    __touch(5027);
    TransformComponent.prototype.constructor = TransformComponent;
    __touch(5028);
    TransformComponent.prototype.api = {
        setTranslation: function () {
            TransformComponent.prototype.setTranslation.apply(this.transformComponent, arguments);
            __touch(5058);
            return this;
            __touch(5059);
        },
        setRotation: function () {
            TransformComponent.prototype.setRotation.apply(this.transformComponent, arguments);
            __touch(5060);
            return this;
            __touch(5061);
        },
        setScale: function () {
            TransformComponent.prototype.setScale.apply(this.transformComponent, arguments);
            __touch(5062);
            return this;
            __touch(5063);
        },
        lookAt: function () {
            TransformComponent.prototype.lookAt.apply(this.transformComponent, arguments);
            __touch(5064);
            return this;
            __touch(5065);
        },
        move: function () {
            TransformComponent.prototype.move.apply(this.transformComponent, arguments);
            __touch(5066);
            return this;
            __touch(5067);
        },
        getTranslation: function () {
            return TransformComponent.prototype.getTranslation.apply(this.transformComponent, arguments);
            __touch(5068);
        },
        getRotation: function () {
            return TransformComponent.prototype.getRotation.apply(this.transformComponent, arguments);
            __touch(5069);
        },
        getScale: function () {
            return TransformComponent.prototype.getScale.apply(this.transformComponent, arguments);
            __touch(5070);
        },
        addTranslation: function () {
            TransformComponent.prototype.addTranslation.apply(this.transformComponent, arguments);
            __touch(5071);
            return this;
            __touch(5072);
        },
        addRotation: function () {
            TransformComponent.prototype.addRotation.apply(this.transformComponent, arguments);
            __touch(5073);
            return this;
            __touch(5074);
        },
        attachChild: function (entity) {
            this.transformComponent.attachChild(entity.transformComponent);
            __touch(5075);
            return this;
            __touch(5076);
        },
        detachChild: function (entity) {
            this.transformComponent.detachChild(entity.transformComponent);
            __touch(5077);
            return this;
            __touch(5078);
        },
        children: function () {
            return new EntitySelection(this).children();
            __touch(5079);
        },
        parent: function () {
            return new EntitySelection(this).parent();
            __touch(5080);
        },
        traverse: function (callback, level) {
            level = level !== undefined ? level : 0;
            __touch(5081);
            if (callback(this, level) !== false) {
                for (var i = 0; i < this.transformComponent.children.length; i++) {
                    var childEntity = this.transformComponent.children[i].entity;
                    __touch(5083);
                    childEntity.traverse(callback, level + 1);
                    __touch(5084);
                }
            }
            return this;
            __touch(5082);
        },
        traverseUp: function (callback) {
            var transformComponent = this.transformComponent;
            __touch(5085);
            while (callback(transformComponent.entity) !== false && transformComponent.parent) {
                transformComponent = transformComponent.parent;
                __touch(5088);
            }
            __touch(5086);
            return this;
            __touch(5087);
        },
        hide: function () {
            this._hidden = true;
            __touch(5089);
            this.traverse(function (entity) {
                for (var i = 0; i < entity._components.length; i++) {
                    var component = entity._components[i];
                    __touch(5092);
                    if (typeof component.hidden === 'boolean') {
                        component.hidden = true;
                        __touch(5093);
                    }
                }
            });
            __touch(5090);
            return this;
            __touch(5091);
        },
        show: function () {
            this._hidden = false;
            __touch(5094);
            var pointer = this;
            __touch(5095);
            while (pointer.transformComponent.parent) {
                pointer = pointer.transformComponent.parent.entity;
                __touch(5099);
                if (pointer._hidden) {
                    for (var i = 0; i < this._components.length; i++) {
                        var component = this._components[i];
                        __touch(5101);
                        if (typeof component.hidden === 'boolean') {
                            component.hidden = true;
                            __touch(5102);
                        }
                    }
                    return this;
                    __touch(5100);
                }
            }
            __touch(5096);
            this.traverse(function (entity) {
                if (entity._hidden) {
                    return false;
                    __touch(5103);
                }
                for (var i = 0; i < entity._components.length; i++) {
                    var component = entity._components[i];
                    __touch(5104);
                    if (typeof component.hidden === 'boolean') {
                        component.hidden = entity._hidden;
                        __touch(5105);
                    }
                }
            });
            __touch(5097);
            return this;
            __touch(5098);
        },
        isVisiblyHidden: function () {
            var pointer = this;
            __touch(5106);
            if (pointer._hidden) {
                return true;
                __touch(5109);
            }
            while (pointer.transformComponent.parent) {
                pointer = pointer.transformComponent.parent.entity;
                __touch(5110);
                if (pointer._hidden) {
                    return true;
                    __touch(5111);
                }
            }
            __touch(5107);
            return false;
            __touch(5108);
        },
        isHidden: function () {
            return this._hidden;
            __touch(5112);
        }
    };
    __touch(5029);
    var tmpVec = new Vector3();
    __touch(5030);
    TransformComponent.prototype.getTranslation = function () {
        return this.transform.translation;
        __touch(5113);
    };
    __touch(5031);
    TransformComponent.prototype.setTranslation = function () {
        this.transform.translation.set(arguments);
        __touch(5114);
        this._dirty = true;
        __touch(5115);
        return this;
        __touch(5116);
    };
    __touch(5032);
    TransformComponent.prototype.getScale = function () {
        return this.transform.scale;
        __touch(5117);
    };
    __touch(5033);
    TransformComponent.prototype.setScale = function () {
        this.transform.scale.set(arguments);
        __touch(5118);
        this._dirty = true;
        __touch(5119);
        return this;
        __touch(5120);
    };
    __touch(5034);
    TransformComponent.prototype.addTranslation = function () {
        if (arguments.length === 3) {
            this.transform.translation.add(arguments);
            __touch(5123);
        } else {
            this.transform.translation.add(arguments[0]);
            __touch(5124);
        }
        this._dirty = true;
        __touch(5121);
        return this;
        __touch(5122);
    };
    __touch(5035);
    TransformComponent.prototype.getRotation = function (target) {
        target = target || new Vector3();
        __touch(5125);
        return this.transform.rotation.toAngles(target);
        __touch(5126);
    };
    __touch(5036);
    TransformComponent.prototype.addRotation = function () {
        this.getRotation(tmpVec);
        __touch(5127);
        if (arguments.length === 1 && typeof arguments[0] === 'object') {
            var arg0 = arguments[0];
            __touch(5130);
            if (arg0 instanceof Vector3) {
                this.transform.rotation.fromAngles(tmpVec.x + arg0.x, tmpVec.y + arg0.y, tmpVec.z + arg0.z);
                __touch(5131);
            } else if (arg0.length === 3) {
                this.transform.rotation.fromAngles(tmpVec.x + arg0[0], tmpVec.y + arg0[1], tmpVec.z + arg0[2]);
                __touch(5132);
            }
        } else {
            this.transform.rotation.fromAngles(tmpVec.x + arguments[0], tmpVec.y + arguments[1], tmpVec.z + arguments[2]);
            __touch(5133);
        }
        this._dirty = true;
        __touch(5128);
        return this;
        __touch(5129);
    };
    __touch(5037);
    TransformComponent.prototype.setRotation = function () {
        if (arguments.length === 1 && typeof arguments[0] === 'object') {
            var arg0 = arguments[0];
            __touch(5136);
            if (arg0 instanceof Vector3) {
                this.transform.rotation.fromAngles(arg0.x, arg0.y, arg0.z);
                __touch(5137);
            } else if (arg0.length === 3) {
                this.transform.rotation.fromAngles(arg0[0], arg0[1], arg0[2]);
                __touch(5138);
            }
        } else {
            this.transform.rotation.fromAngles(arguments[0], arguments[1], arguments[2]);
            __touch(5139);
        }
        this._dirty = true;
        __touch(5134);
        return this;
        __touch(5135);
    };
    __touch(5038);
    TransformComponent.prototype.lookAt = function (position, up) {
        if (arguments.length === 3) {
            this.transform.lookAt(new Vector3(arguments[0], arguments[1], arguments[2]));
            __touch(5142);
        } else {
            if (Array.isArray(position)) {
                position = new Vector3(position);
                __touch(5144);
            }
            if (Array.isArray(up)) {
                up = new Vector3(up);
                __touch(5145);
            }
            this.transform.lookAt(position, up);
            __touch(5143);
        }
        this._dirty = true;
        __touch(5140);
        return this;
        __touch(5141);
    };
    __touch(5039);
    TransformComponent.prototype.move = function () {
        var moveLocalDirection = new Vector3();
        __touch(5146);
        var moveWorldDirection = new Vector3();
        __touch(5147);
        return function () {
            moveLocalDirection.set.apply(moveLocalDirection, arguments);
            __touch(5149);
            this.transform.applyForwardVector(moveLocalDirection, moveWorldDirection);
            __touch(5150);
            this.addTranslation(moveWorldDirection);
            __touch(5151);
            return this;
            __touch(5152);
        };
        __touch(5148);
    }();
    __touch(5040);
    TransformComponent.prototype.setUpdated = function () {
        this._dirty = true;
        __touch(5153);
    };
    __touch(5041);
    TransformComponent.prototype.attached = function (entity) {
        this.entity = entity;
        __touch(5154);
    };
    __touch(5042);
    TransformComponent.prototype.detached = function () {
        this.entity = undefined;
        __touch(5155);
    };
    __touch(5043);
    TransformComponent.prototype.attachChild = function (childComponent, keepTransform) {
        var component = this;
        __touch(5156);
        while (component) {
            if (component === childComponent) {
                console.warn('attachChild: An object can\'t be added as a descendant of itself.');
                __touch(5161);
                return;
                __touch(5162);
            }
            component = component.parent;
            __touch(5160);
        }
        __touch(5157);
        if (childComponent.parent) {
            childComponent.parent.detachChild(childComponent);
            __touch(5163);
        }
        if (keepTransform) {
            childComponent.updateTransform();
            __touch(5164);
            this.updateTransform();
            __touch(5165);
            this.updateWorldTransform();
            __touch(5166);
            childComponent.transform.multiply(this.worldTransform.invert(), childComponent.transform);
            __touch(5167);
        }
        childComponent.parent = this;
        __touch(5158);
        this.children.push(childComponent);
        __touch(5159);
    };
    __touch(5044);
    TransformComponent.prototype.detachChild = function (childComponent, keepTransform) {
        if (childComponent === this) {
            console.warn('attachChild: An object can\'t be removed from itself.');
            __touch(5169);
            return;
            __touch(5170);
        }
        if (keepTransform) {
            childComponent.transform.copy(childComponent.worldTransform);
            __touch(5171);
        }
        var index = this.children.indexOf(childComponent);
        __touch(5168);
        if (index !== -1) {
            childComponent.parent = null;
            __touch(5172);
            this.children.splice(index, 1);
            __touch(5173);
        }
    };
    __touch(5045);
    TransformComponent.prototype.updateTransform = function () {
        this.transform.update();
        __touch(5174);
    };
    __touch(5046);
    TransformComponent.prototype.updateWorldTransform = function () {
        if (this.parent) {
            this.worldTransform.multiply(this.parent.worldTransform, this.transform);
            __touch(5178);
        } else {
            this.worldTransform.copy(this.transform);
            __touch(5179);
        }
        var scale = this.worldTransform.scale;
        __touch(5175);
        if (scale.x !== scale.y || scale.x !== scale.z) {
            Matrix4x4.invert(this.worldTransform.matrix, this.worldTransform.normalMatrix);
            __touch(5180);
            Matrix4x4.transpose(this.worldTransform.normalMatrix, this.worldTransform.normalMatrix);
            __touch(5181);
        } else {
            this.worldTransform.normalMatrix.copy(this.worldTransform.matrix);
            __touch(5182);
        }
        this._dirty = false;
        __touch(5176);
        this._updated = true;
        __touch(5177);
    };
    __touch(5047);
    TransformComponent.applyOnEntity = function (obj, entity) {
        var transformComponent = entity.transformComponent;
        __touch(5183);
        if (!transformComponent) {
            transformComponent = new TransformComponent();
            __touch(5185);
        }
        var matched = false;
        __touch(5184);
        if (Array.isArray(obj) && obj.length === 3) {
            transformComponent.transform.translation.setd(obj[0], obj[1], obj[2]);
            __touch(5186);
            matched = true;
            __touch(5187);
        } else if (obj instanceof Vector3) {
            transformComponent.transform.translation.setd(obj.data[0], obj.data[1], obj.data[2]);
            __touch(5188);
            matched = true;
            __touch(5189);
        } else if (typeof obj === 'object' && typeof obj.x !== 'undefined' && typeof obj.y !== 'undefined' && typeof obj.z !== 'undefined') {
            transformComponent.transform.translation.setd(obj.x, obj.y, obj.z);
            __touch(5190);
            matched = true;
            __touch(5191);
        } else if (obj instanceof Transform) {
            transformComponent.transform = obj;
            __touch(5192);
            matched = true;
            __touch(5193);
        }
        if (matched) {
            transformComponent.setUpdated();
            __touch(5194);
            entity.setComponent(transformComponent);
            __touch(5195);
            return true;
            __touch(5196);
        }
    };
    __touch(5048);
    return TransformComponent;
    __touch(5049);
});
__touch(5023);