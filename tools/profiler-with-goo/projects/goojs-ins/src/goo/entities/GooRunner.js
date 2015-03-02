define([
    'goo/entities/World',
    'goo/renderer/Renderer',
    'goo/entities/systems/TransformSystem',
    'goo/entities/systems/RenderSystem',
    'goo/entities/systems/BoundingUpdateSystem',
    'goo/entities/systems/ScriptSystem',
    'goo/entities/systems/LightingSystem',
    'goo/entities/systems/CameraSystem',
    'goo/entities/systems/ParticlesSystem',
    'goo/util/Stats',
    'goo/sound/AudioContext',
    'goo/entities/systems/SoundSystem',
    'goo/entities/components/TransformComponent',
    'goo/entities/components/MeshDataComponent',
    'goo/entities/components/MeshRendererComponent',
    'goo/entities/components/CameraComponent',
    'goo/entities/components/LightComponent',
    'goo/entities/components/ScriptComponent',
    'goo/entities/components/SoundComponent',
    'goo/util/GameUtils',
    'goo/util/Logo',
    'goo/entities/SystemBus',
    'goo/renderer/Material'
], function (World, Renderer, TransformSystem, RenderSystem, BoundingUpdateSystem, ScriptSystem, LightingSystem, CameraSystem, ParticlesSystem, Stats, AudioContext, SoundSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, CameraComponent, LightComponent, ScriptComponent, SoundComponent, GameUtils, Logo, SystemBus, Material) {
    'use strict';
    __touch(4143);
    function GooRunner(parameters) {
        parameters = parameters || {};
        __touch(4170);
        GameUtils.initAllShims();
        __touch(4171);
        this.world = new World(this);
        __touch(4172);
        this.renderer = new Renderer(parameters);
        __touch(4173);
        this.useTryCatch = parameters.useTryCatch !== undefined ? parameters.useTryCatch : true;
        __touch(4174);
        this._setBaseSystems();
        __touch(4175);
        this._registerBaseComponents();
        __touch(4176);
        this.doProcess = true;
        __touch(4177);
        this.doRender = true;
        __touch(4178);
        this.tpfSmoothingCount = parameters.tpfSmoothingCount !== undefined ? parameters.tpfSmoothingCount : 10;
        __touch(4179);
        if (parameters.showStats) {
            this.stats = new Stats();
            __touch(4193);
            this.stats.domElement.style.position = 'absolute';
            __touch(4194);
            this.stats.domElement.style.left = '10px';
            __touch(4195);
            this.stats.domElement.style.top = '10px';
            __touch(4196);
            document.body.appendChild(this.stats.domElement);
            __touch(4197);
        }
        if (parameters.logo === undefined || parameters.logo) {
            var logoDiv = this._buildLogo(parameters.logo);
            __touch(4198);
            if (logoDiv) {
                document.body.appendChild(logoDiv);
                __touch(4199);
            }
        }
        this.callbacksPreProcess = [];
        __touch(4180);
        this.callbacksPreRender = [];
        __touch(4181);
        this.callbacks = [];
        __touch(4182);
        this.callbacksNextFrame = [];
        __touch(4183);
        this._takeSnapshots = [];
        __touch(4184);
        this.start = -1;
        __touch(4185);
        this.animationId = 0;
        __touch(4186);
        if (!parameters.manuallyStartGameLoop) {
            this.startGameLoop();
            __touch(4200);
        }
        if (parameters.debugKeys) {
            this._addDebugKeys();
            __touch(4201);
        }
        this._events = {
            click: null,
            mousedown: null,
            mouseup: null,
            mousemove: null,
            touchstart: null,
            touchend: null,
            touchmove: null
        };
        __touch(4187);
        this._eventListeners = {
            click: [],
            mousedown: [],
            mouseup: [],
            mousemove: [],
            touchstart: [],
            touchend: [],
            touchmove: []
        };
        __touch(4188);
        this._eventTriggered = {
            click: null,
            mousedown: null,
            mouseup: null,
            mousemove: null,
            touchstart: null,
            touchend: null,
            touchmove: null
        };
        __touch(4189);
        GameUtils.addVisibilityChangeListener(function (paused) {
            if (paused) {
                this._stopGameLoop();
                __touch(4202);
            } else {
                if (!this.manuallyPaused) {
                    this._startGameLoop();
                    __touch(4203);
                }
            }
        }.bind(this));
        __touch(4190);
        this._picking = {
            x: 0,
            y: 0,
            skipUpdateBuffer: false,
            doPick: false,
            pickingCallback: null,
            pickingStore: {},
            clearColorStore: []
        };
        __touch(4191);
        this.manuallyPaused = !!parameters.manuallyStartGameLoop;
        __touch(4192);
    }
    __touch(4144);
    GooRunner.prototype._setBaseSystems = function () {
        this.world.setSystem(new ScriptSystem(this.world));
        __touch(4204);
        this.world.setSystem(new TransformSystem());
        __touch(4205);
        this.world.setSystem(new CameraSystem());
        __touch(4206);
        this.world.setSystem(new ParticlesSystem());
        __touch(4207);
        this.world.setSystem(new BoundingUpdateSystem());
        __touch(4208);
        this.world.setSystem(new LightingSystem());
        __touch(4209);
        if (AudioContext) {
            this.world.setSystem(new SoundSystem());
            __touch(4213);
        }
        this.renderSystem = new RenderSystem();
        __touch(4210);
        this.renderSystems = [this.renderSystem];
        __touch(4211);
        this.world.setSystem(this.renderSystem);
        __touch(4212);
    };
    __touch(4145);
    GooRunner.prototype._registerBaseComponents = function () {
        this.world.registerComponent(TransformComponent);
        __touch(4214);
        this.world.registerComponent(MeshDataComponent);
        __touch(4215);
        this.world.registerComponent(MeshRendererComponent);
        __touch(4216);
        this.world.registerComponent(CameraComponent);
        __touch(4217);
        this.world.registerComponent(LightComponent);
        __touch(4218);
        this.world.registerComponent(ScriptComponent);
        __touch(4219);
    };
    __touch(4146);
    GooRunner.prototype.run = function (time) {
        if (this.useTryCatch) {
            this._callSafe(this._updateFrame, time);
            __touch(4220);
        } else {
            this._updateFrame(time);
            __touch(4221);
        }
    };
    __touch(4147);
    GooRunner.prototype._callSafe = function (func) {
        try {
            func.apply(this, Array.prototype.slice.call(arguments, 1));
            __touch(4223);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.stack);
                __touch(4224);
            } else {
                console.log(error);
                __touch(4225);
            }
        }
        __touch(4222);
    };
    __touch(4148);
    GooRunner.prototype.setRenderSystem = function (system, idx) {
        this.world.setSystem(system);
        __touch(4226);
        if (idx !== undefined) {
            this.renderSystems.splice(idx, 0, system);
            __touch(4227);
        } else {
            this.renderSystems.push(system);
            __touch(4228);
        }
    };
    __touch(4149);
    var tpfSmoothingArray = [];
    __touch(4150);
    var tpfIndex = 0;
    __touch(4151);
    GooRunner.prototype._updateFrame = function (time) {
        if (this.start < 0) {
            this.start = time;
            __touch(4241);
        }
        var tpf = (time - this.start) / 1000;
        __touch(4229);
        if (tpf < 0 || tpf > 1) {
            this.start = time;
            __touch(4242);
            this.animationId = window.requestAnimationFrame(this.run.bind(this));
            __touch(4243);
            return;
            __touch(4244);
        }
        tpf = Math.max(Math.min(tpf, 0.5), 0.0001);
        __touch(4230);
        tpfSmoothingArray[tpfIndex] = tpf;
        __touch(4231);
        tpfIndex = (tpfIndex + 1) % this.tpfSmoothingCount;
        __touch(4232);
        var avg = 0;
        __touch(4233);
        for (var i = 0; i < tpfSmoothingArray.length; i++) {
            avg += tpfSmoothingArray[i];
            __touch(4245);
        }
        avg /= tpfSmoothingArray.length;
        __touch(4234);
        this.world.tpf = avg;
        __touch(4235);
        this.world.time += this.world.tpf;
        __touch(4236);
        World.time = this.world.time;
        __touch(4237);
        World.tpf = this.world.tpf;
        __touch(4238);
        this.start = time;
        __touch(4239);
        if (this.callbacksNextFrame.length > 0) {
            var callbacksNextFrame = this.callbacksNextFrame;
            __touch(4246);
            this.callbacksNextFrame = [];
            __touch(4247);
            if (this.useTryCatch) {
                for (var i = 0; i < callbacksNextFrame.length; i++) {
                    var callback = callbacksNextFrame[i];
                    __touch(4248);
                    this._callSafe(callback, this.world.tpf);
                    __touch(4249);
                }
            } else {
                for (var i = 0; i < callbacksNextFrame.length; i++) {
                    var callback = callbacksNextFrame[i];
                    __touch(4250);
                    callback(this.world.tpf);
                    __touch(4251);
                }
            }
        }
        if (this.useTryCatch) {
            for (var i = 0; i < this.callbacksPreProcess.length; i++) {
                var callback = this.callbacksPreProcess[i];
                __touch(4252);
                this._callSafe(callback, this.world.tpf);
                __touch(4253);
            }
        } else {
            for (var i = 0; i < this.callbacksPreProcess.length; i++) {
                var callback = this.callbacksPreProcess[i];
                __touch(4254);
                callback(this.world.tpf);
                __touch(4255);
            }
        }
        if (this.doProcess) {
            this.world.process();
            __touch(4256);
        }
        this.renderer.info.reset();
        __touch(4240);
        if (this.doRender) {
            this.renderer.checkResize(Renderer.mainCamera);
            __touch(4257);
            this.renderer.setRenderTarget();
            __touch(4258);
            for (var i = 0; i < this.callbacksPreRender.length; i++) {
                this.callbacksPreRender[i](this.world.tpf);
                __touch(4259);
            }
            for (var i = 0; i < this.renderSystems.length; i++) {
                if (!this.renderSystems[i].passive) {
                    this.renderSystems[i].render(this.renderer);
                    __touch(4260);
                }
            }
            if (this._picking.doPick && Renderer.mainCamera) {
                var cc = this.renderer.clearColor.data;
                __touch(4261);
                this._picking.clearColorStore[0] = cc[0];
                __touch(4262);
                this._picking.clearColorStore[1] = cc[1];
                __touch(4263);
                this._picking.clearColorStore[2] = cc[2];
                __touch(4264);
                this._picking.clearColorStore[3] = cc[3];
                __touch(4265);
                this.renderer.setClearColor(0, 0, 0, 1);
                __touch(4266);
                for (var i = 0; i < this.renderSystems.length; i++) {
                    if (this.renderSystems[i].renderToPick && !this.renderSystems[i].passive) {
                        this.renderSystems[i].renderToPick(this.renderer, this._picking.skipUpdateBuffer);
                        __touch(4270);
                    }
                }
                this.renderer.pick(this._picking.x, this._picking.y, this._picking.pickingStore, Renderer.mainCamera);
                __touch(4267);
                if (this.useTryCatch) {
                    this._callSafe(this._picking.pickingCallback, this._picking.pickingStore.id, this._picking.pickingStore.depth);
                    __touch(4271);
                } else {
                    this._picking.pickingCallback(this._picking.pickingStore.id, this._picking.pickingStore.depth);
                    __touch(4272);
                }
                this._picking.doPick = false;
                __touch(4268);
                this.renderer.setClearColor.apply(this.renderer, this._picking.clearColorStore);
                __touch(4269);
            }
        }
        if (this.useTryCatch) {
            for (var i = 0; i < this.callbacks.length; i++) {
                var callback = this.callbacks[i];
                __touch(4273);
                this._callSafe(callback, this.world.tpf);
                __touch(4274);
            }
        } else {
            for (var i = 0; i < this.callbacks.length; i++) {
                var callback = this.callbacks[i];
                __touch(4275);
                callback(this.world.tpf);
                __touch(4276);
            }
        }
        if (this.stats) {
            this.stats.update(this.renderer.info.toString() + '<br>' + 'Transform updates: ' + this.world.getSystem('TransformSystem').numUpdates + '<br>Cached shaders: ' + Object.keys(this.renderer.rendererRecord.shaderCache).length);
            __touch(4277);
        }
        if (this._takeSnapshots.length) {
            var image = this.renderer.domElement.toDataURL();
            __touch(4278);
            if (this.useTryCatch) {
                for (var i = this._takeSnapshots.length - 1; i >= 0; i--) {
                    var callback = this._takeSnapshots[i];
                    __touch(4280);
                    this._callSafe(callback, image);
                    __touch(4281);
                }
            } else {
                for (var i = this._takeSnapshots.length - 1; i >= 0; i--) {
                    var callback = this._takeSnapshots[i];
                    __touch(4282);
                    callback(image);
                    __touch(4283);
                }
            }
            this._takeSnapshots = [];
            __touch(4279);
        }
        if (this.animationId) {
            this.animationId = window.requestAnimationFrame(this.run.bind(this));
            __touch(4284);
        }
    };
    __touch(4152);
    GooRunner.prototype._buildLogo = function (settings) {
        var div = document.createElement('div');
        __touch(4285);
        var color = settings && settings.color ? settings.color : Logo.white;
        __touch(4286);
        var svg = Logo.getLogo({
            width: '70px',
            height: '50px',
            color: color
        });
        __touch(4287);
        if (svg === '') {
            return;
            __touch(4300);
        }
        div.innerHTML = '<a style="text-decoration: none;" href="http://www.goocreate.com" target="_blank">' + svg + '</a>';
        __touch(4288);
        div.style.position = 'absolute';
        __touch(4289);
        div.style.zIndex = '2000';
        __touch(4290);
        if (!settings) {
            div.style.top = '10px';
            __touch(4301);
            div.style.right = '10px';
            __touch(4302);
        } else if (settings === 'topright' || settings.position === 'topright') {
            div.style.top = '10px';
            __touch(4303);
            div.style.right = '10px';
            __touch(4304);
        } else if (settings === 'topleft' || settings.position === 'topleft') {
            div.style.top = '10px';
            __touch(4305);
            div.style.left = '10px';
            __touch(4306);
        } else if (settings === 'bottomright' || settings.position === 'bottomright') {
            div.style.bottom = '10px';
            __touch(4307);
            div.style.right = '10px';
            __touch(4308);
        } else {
            div.style.bottom = '10px';
            __touch(4309);
            div.style.left = '10px';
            __touch(4310);
        }
        div.id = 'goologo';
        __touch(4291);
        div.style.webkitTouchCallout = 'none';
        __touch(4292);
        div.style.webkitUserSelect = 'none';
        __touch(4293);
        div.style.khtmlUserSelect = 'none';
        __touch(4294);
        div.style.mozUserSelect = 'none';
        __touch(4295);
        div.style.msUserSelect = 'none';
        __touch(4296);
        div.style.userSelect = 'none';
        __touch(4297);
        div.ondragstart = function () {
            return false;
            __touch(4311);
        };
        __touch(4298);
        return div;
        __touch(4299);
    };
    __touch(4153);
    GooRunner.prototype._addDebugKeys = function () {
        var activeKey = 'shiftKey';
        __touch(4312);
        document.addEventListener('keydown', function (e) {
            if (e.which === 32 && e[activeKey]) {
                GameUtils.toggleFullScreen();
                __touch(4315);
            } else if (e.which === 13 && e[activeKey]) {
                GameUtils.togglePointerLock();
                __touch(4316);
            } else if (e.which === 49 && e[activeKey]) {
                this.renderSystem.setDebugMaterial();
                __touch(4317);
            } else if ((e.which === 50 || e.which === 222) && e[activeKey]) {
                this.renderSystem.setDebugMaterial('normals');
                __touch(4318);
            } else if (e.which === 51 && e[activeKey]) {
                this.renderSystem.setDebugMaterial('lit');
                __touch(4319);
            } else if (e.which === 52 && e[activeKey]) {
                this.renderSystem.setDebugMaterial('color');
                __touch(4320);
            } else if (e.which === 53 && e[activeKey]) {
                this.renderSystem.setDebugMaterial('wireframe');
                __touch(4321);
            } else if (e.which === 54 && e[activeKey]) {
                this.renderSystem.setDebugMaterial('flat');
                __touch(4322);
            } else if ((e.which === 55 || e.which === 191) && e[activeKey]) {
                this.renderSystem.setDebugMaterial('texture');
                __touch(4323);
            } else if (e.which === 56 && e[activeKey]) {
                this.renderSystem.setDebugMaterial('+wireframe');
                __touch(4324);
            }
        }.bind(this), false);
        __touch(4313);
        document.addEventListener('mousedown', function (e) {
            if (e[activeKey]) {
                var x = e.clientX;
                __touch(4325);
                var y = e.clientY;
                __touch(4326);
                this.pick(x, y, function (id, depth) {
                    var entity = this.world.entityManager.getEntityById(id);
                    __touch(4328);
                    console.log('Picked entity:', entity, 'At depth:', depth);
                    __touch(4329);
                }.bind(this));
                __touch(4327);
            }
        }.bind(this), false);
        __touch(4314);
    };
    __touch(4154);
    GooRunner.prototype.addEventListener = function (type, callback) {
        if (!this._eventListeners[type] || this._eventListeners[type].indexOf(callback) > -1) {
            return;
            __touch(4330);
        }
        if (typeof callback === 'function') {
            this._eventListeners[type].push(callback);
            __touch(4331);
            if (this._eventListeners[type].length === 1) {
                this._enableEvent(type);
                __touch(4332);
            }
        }
    };
    __touch(4155);
    GooRunner.prototype.removeEventListener = function (type, callback) {
        if (!this._eventListeners[type]) {
            return;
            __touch(4334);
        }
        var index = this._eventListeners[type].indexOf(callback);
        __touch(4333);
        if (index > -1) {
            this._eventListeners[type].splice(index, 1);
            __touch(4335);
        }
        if (this._eventListeners[type].length === 0) {
            this._disableEvent(type);
            __touch(4336);
        }
    };
    __touch(4156);
    GooRunner.prototype.triggerEvent = function (type, evt) {
        evt.type = type;
        __touch(4337);
        this._eventTriggered[type] = evt.domEvent;
        __touch(4338);
        this._dispatchEvent(evt);
        __touch(4339);
    };
    __touch(4157);
    GooRunner.prototype._dispatchEvent = function (evt) {
        var types = Object.keys(this._eventTriggered);
        __touch(4340);
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            __touch(4341);
            if (this._eventTriggered[type] && this._eventListeners[type]) {
                var e = {
                    entity: evt.entity,
                    depth: evt.depth,
                    x: evt.x,
                    y: evt.y,
                    type: type,
                    domEvent: this._eventTriggered[type],
                    id: evt.id,
                    intersection: evt.intersection
                };
                __touch(4342);
                try {
                    for (var j = 0; j < this._eventListeners[type].length; j++) {
                        if (this._eventListeners[type][j](e) === false) {
                            break;
                            __touch(4345);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    __touch(4346);
                }
                __touch(4343);
                this._eventTriggered[type] = null;
                __touch(4344);
            }
        }
    };
    __touch(4158);
    GooRunner.prototype._enableEvent = function (type) {
        if (this._events[type]) {
            return;
            __touch(4350);
        }
        var func = function (e) {
            var x, y;
            __touch(4351);
            if (e.type === 'touchstart' || e.type === 'touchend' || e.type === 'touchmove') {
                x = e.changedTouches[0].pageX - e.changedTouches[0].target.getBoundingClientRect().left;
                __touch(4354);
                y = e.changedTouches[0].pageY - e.changedTouches[0].target.getBoundingClientRect().top;
                __touch(4355);
            } else {
                x = e.offsetX !== undefined ? e.offsetX : e.layerX;
                __touch(4356);
                y = e.offsetY !== undefined ? e.offsetY : e.layerY;
                __touch(4357);
            }
            this._eventTriggered[type] = e;
            __touch(4352);
            this.pick(x, y, function (index, depth) {
                var dpx = this.renderer.devicePixelRatio;
                __touch(4358);
                var entity = this.world.entityManager.getEntityByIndex(index);
                __touch(4359);
                var intersection = Renderer.mainCamera.getWorldPosition(x * dpx, y * dpx, this.renderer.viewportWidth, this.renderer.viewportHeight, depth);
                __touch(4360);
                this._dispatchEvent({
                    entity: entity,
                    depth: depth,
                    x: x,
                    y: y,
                    id: index,
                    intersection: intersection
                });
                __touch(4361);
            }.bind(this));
            __touch(4353);
        }.bind(this);
        __touch(4347);
        this.renderer.domElement.addEventListener(type, func);
        __touch(4348);
        this._events[type] = func;
        __touch(4349);
    };
    __touch(4159);
    GooRunner.prototype._disableEvent = function (type) {
        if (this._events[type]) {
            this.renderer.domElement.removeEventListener(type, this._events[type]);
            __touch(4363);
        }
        this._events[type] = null;
        __touch(4362);
    };
    __touch(4160);
    GooRunner.prototype._startGameLoop = function () {
        if (!this.animationId) {
            this.start = -1;
            __touch(4364);
            this.animationId = window.requestAnimationFrame(this.run.bind(this));
            __touch(4365);
        }
    };
    __touch(4161);
    GooRunner.prototype.startGameLoop = function () {
        this.manuallyPaused = false;
        __touch(4366);
        this._startGameLoop();
        __touch(4367);
    };
    __touch(4162);
    GooRunner.prototype._stopGameLoop = function () {
        window.cancelAnimationFrame(this.animationId);
        __touch(4368);
        this.animationId = 0;
        __touch(4369);
    };
    __touch(4163);
    GooRunner.prototype.stopGameLoop = function () {
        this.manuallyPaused = true;
        __touch(4370);
        this._stopGameLoop();
        __touch(4371);
    };
    __touch(4164);
    GooRunner.prototype.takeSnapshot = function (callback) {
        this._takeSnapshots.push(callback);
        __touch(4372);
    };
    __touch(4165);
    GooRunner.prototype.pick = function (x, y, callback, skipUpdateBuffer) {
        this._picking.x = x;
        __touch(4373);
        this._picking.y = y;
        __touch(4374);
        this._picking.skipUpdateBuffer = skipUpdateBuffer === undefined ? false : skipUpdateBuffer;
        __touch(4375);
        if (callback) {
            this._picking.pickingCallback = callback;
            __touch(4377);
        }
        this._picking.doPick = true;
        __touch(4376);
    };
    __touch(4166);
    GooRunner.prototype.pickSync = function (x, y, skipUpdateBuffer) {
        var currentClearColor = this.renderer.clearColor.data;
        __touch(4378);
        this._picking.skipUpdateBuffer = skipUpdateBuffer === undefined ? false : skipUpdateBuffer;
        __touch(4379);
        var savedClearColor = [
            currentClearColor[0],
            currentClearColor[1],
            currentClearColor[2],
            currentClearColor[3]
        ];
        __touch(4380);
        this.renderer.setClearColor(0, 0, 0, 1);
        __touch(4381);
        this.renderSystem.renderToPick(this.renderer, false);
        __touch(4382);
        this.renderer.setClearColor.apply(this.renderer, savedClearColor);
        __touch(4383);
        var pickingStore = {};
        __touch(4384);
        this.renderer.pick(x, y, pickingStore, Renderer.mainCamera);
        __touch(4385);
        return pickingStore;
        __touch(4386);
    };
    __touch(4167);
    GooRunner.prototype.clear = function () {
        this.stopGameLoop();
        __touch(4387);
        this.world.clear();
        __touch(4388);
        var gooCanvas = this.renderer.domElement;
        __touch(4389);
        if (gooCanvas.parentNode) {
            gooCanvas.parentNode.removeChild(gooCanvas);
            __touch(4405);
        }
        SystemBus.clear();
        __touch(4390);
        Material.store = [];
        __touch(4391);
        Material.hash = [];
        __touch(4392);
        Renderer.mainCamera = null;
        __touch(4393);
        GameUtils.clearVisibilityChangeListeners();
        __touch(4394);
        this.world = null;
        __touch(4395);
        this.renderer = null;
        __touch(4396);
        this.renderSystem = null;
        __touch(4397);
        this.renderSystems = null;
        __touch(4398);
        this.callbacks = null;
        __touch(4399);
        this.callbacksPreProcess = null;
        __touch(4400);
        this.callbacksPreRender = null;
        __touch(4401);
        this.callbacksNextFrame = null;
        __touch(4402);
        this._takeSnapshots = null;
        __touch(4403);
        this._events = null;
        __touch(4404);
    };
    __touch(4168);
    return GooRunner;
    __touch(4169);
});
__touch(4142);