define([
    'goo/entities/components/Component',
    'goo/util/StringUtil'
], function (Component, StringUtil) {
    'use strict';
    __touch(3884);
    function Entity(world, name, id) {
        this._world = world;
        __touch(3904);
        this._components = [];
        __touch(3905);
        this.id = id !== undefined ? id : StringUtil.createUniqueId('entity');
        __touch(3906);
        this._index = Entity.entityCount;
        __touch(3907);
        this._tags = {};
        __touch(3908);
        this._attributes = {};
        __touch(3909);
        this.name = name !== undefined ? name : 'Entity_' + this._index;
        __touch(3910);
        this.skip = false;
        __touch(3911);
        this.hidden = false;
        __touch(3912);
        this._hidden = false;
        __touch(3913);
        this.static = false;
        __touch(3914);
        Entity.entityCount++;
        __touch(3915);
    }
    __touch(3885);
    Entity.prototype.set = function () {
        for (var i = 0; i < arguments.length; i++) {
            var argument = arguments[i];
            __touch(3917);
            if (argument instanceof Component) {
                this.setComponent(argument);
                __touch(3918);
            } else {
                if (!this._world) {
                    return this;
                    __touch(3920);
                }
                var components = this._world._components;
                __touch(3919);
                for (var j = 0; j < components.length; j++) {
                    var component = components[j];
                    __touch(3921);
                    var applied = component.applyOnEntity(argument, this);
                    __touch(3922);
                    if (applied) {
                        break;
                        __touch(3923);
                    }
                }
            }
        }
        return this;
        __touch(3916);
    };
    __touch(3886);
    Entity.prototype.addToWorld = function (recursive) {
        this._world.addEntity(this, recursive);
        __touch(3924);
        return this;
        __touch(3925);
    };
    __touch(3887);
    Entity.prototype.removeFromWorld = function (recursive) {
        this._world.removeEntity(this, recursive);
        __touch(3926);
        return this;
        __touch(3927);
    };
    __touch(3888);
    function getTypeAttributeName(type) {
        return type.charAt(0).toLowerCase() + type.substr(1);
        __touch(3928);
    }
    __touch(3889);
    Entity.prototype.setComponent = function (component) {
        if (this.hasComponent(component.type)) {
            return this;
            __touch(3932);
        } else {
            this._components.push(component);
            __touch(3933);
        }
        this[getTypeAttributeName(component.type)] = component;
        __touch(3929);
        if (component.attached) {
            component.attached(this);
            __touch(3934);
        }
        component.applyAPI(this);
        __touch(3930);
        if (this._world && this._world.entityManager.containsEntity(this)) {
            this._world.changedEntity(this, component, 'addedComponent');
            __touch(3935);
        }
        return this;
        __touch(3931);
    };
    __touch(3890);
    Entity.prototype.hasComponent = function (type) {
        var typeAttributeName = getTypeAttributeName(type);
        __touch(3936);
        var component = this[typeAttributeName];
        __touch(3937);
        return !!component && this._components.indexOf(component) > -1;
        __touch(3938);
    };
    __touch(3891);
    Entity.prototype.getComponent = function (type) {
        var typeAttributeName = getTypeAttributeName(type);
        __touch(3939);
        if (this.hasComponent(type)) {
            return this[typeAttributeName];
            __touch(3940);
        }
    };
    __touch(3892);
    Entity.prototype.clearComponent = function (type) {
        var typeAttributeName = getTypeAttributeName(type);
        __touch(3941);
        var component = this[typeAttributeName];
        __touch(3942);
        if (!!component && this._components.indexOf(component) > -1) {
            if (component.detached) {
                component.detached(this);
                __touch(3948);
            }
            component.removeAPI(this);
            __touch(3944);
            var index = this._components.indexOf(component);
            __touch(3945);
            this._components.splice(index, 1);
            __touch(3946);
            delete this[typeAttributeName];
            __touch(3947);
            if (this._world && this._world.entityManager.containsEntity(this)) {
                this._world.changedEntity(this, component, 'removedComponent');
                __touch(3949);
            }
        }
        return this;
        __touch(3943);
    };
    __touch(3893);
    Entity.prototype.setTag = function (tag) {
        this._tags[tag] = true;
        __touch(3950);
        return this;
        __touch(3951);
    };
    __touch(3894);
    Entity.prototype.hasTag = function (tag) {
        return !!this._tags[tag];
        __touch(3952);
    };
    __touch(3895);
    Entity.prototype.clearTag = function (tag) {
        delete this._tags[tag];
        __touch(3953);
        return this;
        __touch(3954);
    };
    __touch(3896);
    Entity.prototype.setAttribute = function (attribute, value) {
        this._attributes[attribute] = value;
        __touch(3955);
        return this;
        __touch(3956);
    };
    __touch(3897);
    Entity.prototype.hasAttribute = function (attribute) {
        return typeof this._attributes[attribute] !== 'undefined';
        __touch(3957);
    };
    __touch(3898);
    Entity.prototype.getAttribute = function (attribute) {
        return this._attributes[attribute];
        __touch(3958);
    };
    __touch(3899);
    Entity.prototype.clearAttribute = function (attribute) {
        delete this._attributes[attribute];
        __touch(3959);
        return this;
        __touch(3960);
    };
    __touch(3900);
    Entity.prototype.toString = function () {
        return this.name;
        __touch(3961);
    };
    __touch(3901);
    Entity.entityCount = 0;
    __touch(3902);
    return Entity;
    __touch(3903);
});
__touch(3883);