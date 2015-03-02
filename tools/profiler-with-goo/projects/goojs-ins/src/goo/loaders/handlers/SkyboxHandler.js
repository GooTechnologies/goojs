define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/renderer/Texture',
    'goo/renderer/shaders/ShaderBuilder',
    'goo/util/Skybox',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/entities/SystemBus'
], function (ConfigHandler, Texture, ShaderBuilder, Skybox, RSVP, PromiseUtil, SystemBus) {
    'use strict';
    __touch(9387);
    function SkyboxHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(9402);
        this._activeSkyboxRef = null;
        __touch(9403);
        var skybox = new Skybox('box', [], null, 0);
        __touch(9404);
        this._skybox = this.world.createEntity(skybox.meshData, skybox.materials[0], skybox.transform);
        __touch(9405);
        this._skybox.transformComponent.updateWorldTransform();
        __touch(9406);
        this._skybox.isSkybox = true;
        __touch(9407);
        this._skybox.name = 'Skybox_box';
        __touch(9408);
        this._skyboxTexture = new Texture(null, { flipY: false });
        __touch(9409);
        this._skyboxTexture.variant = 'CUBE';
        __touch(9410);
        this._skybox.meshRendererComponent.materials[0].setTexture('DIFFUSE_MAP', this._skyboxTexture);
        __touch(9411);
        var skysphere = new Skybox('sphere', [], null, 0);
        __touch(9412);
        this._skysphere = this.world.createEntity(skysphere.meshData, skysphere.materials[0], skysphere.transform);
        __touch(9413);
        this._skysphere.transformComponent.updateWorldTransform();
        __touch(9414);
        this._skysphere.isSkybox = true;
        __touch(9415);
        this._skysphere.name = 'Skybox_sphere';
        __touch(9416);
        this._skysphereTexture = new Texture(null, {
            flipY: false,
            wrapS: 'EdgeClamp',
            wrapT: 'EdgeClamp'
        });
        __touch(9417);
        this._skysphere.meshRendererComponent.materials[0].setTexture('DIFFUSE_MAP', this._skysphereTexture);
        __touch(9418);
        this._activeSkyshape = null;
        __touch(9419);
    }
    __touch(9388);
    SkyboxHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(9389);
    SkyboxHandler.prototype.constructor = SkyboxHandler;
    __touch(9390);
    ConfigHandler._registerClass('skybox', SkyboxHandler);
    __touch(9391);
    SkyboxHandler.prototype._remove = function (ref) {
        delete this._objects[ref];
        __touch(9420);
        if (this._activeSkyboxRef === ref) {
            this._hide(this._skybox);
            __touch(9421);
            this._hide(this._skysphere);
            __touch(9422);
            this._skyboxTexture.setImage(null);
            __touch(9423);
            this._activeSkyshape = null;
            __touch(9424);
            ShaderBuilder.SKYBOX = null;
            __touch(9425);
            ShaderBuilder.SKYSPHERE = null;
            __touch(9426);
            this._activeSkyboxRef = null;
            __touch(9427);
        }
    };
    __touch(9392);
    SkyboxHandler.prototype._create = function () {
        return {
            textures: [],
            enabled: false
        };
        __touch(9428);
    };
    __touch(9393);
    SkyboxHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(9429);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (skybox) {
            if (!skybox) {
                return PromiseUtil.resolve([]);
                __touch(9433);
            }
            var promises = [];
            __touch(9431);
            if (config.box) {
                promises.push(that._updateBox(config.box, options, skybox));
                __touch(9434);
            }
            if (config.sphere) {
                promises.push(that._updateSphere(config.sphere, options, skybox));
                __touch(9435);
            }
            return RSVP.all(promises).then(function (skyboxes) {
                if (config.box || config.sphere) {
                    that._activeSkyboxRef = ref;
                    __touch(9437);
                }
                return skyboxes;
                __touch(9436);
            });
            __touch(9432);
        });
        __touch(9430);
    };
    __touch(9394);
    SkyboxHandler.prototype._updateSphere = function (config, options, skybox) {
        var that = this;
        __touch(9438);
        if (config.sphereRef) {
            return this._load(config.sphereRef, options).then(function (texture) {
                if (!texture || !texture.image) {
                    SystemBus.emit('goo.error.skybox', {
                        type: 'Sphere',
                        message: 'The skysphere needs an image to display.'
                    });
                    __touch(9445);
                    that._hide(that._skysphere);
                    __touch(9446);
                    return;
                    __touch(9447);
                }
                var skyTex = that._skysphereTexture;
                __touch(9441);
                skybox.textures = [texture];
                __touch(9442);
                skyTex.setImage(texture.image);
                __touch(9443);
                if (config.enabled) {
                    that._show(that._skysphere);
                    __touch(9448);
                } else {
                    that._hide(that._skysphere);
                    __touch(9449);
                }
                return that._skysphere;
                __touch(9444);
            });
            __touch(9440);
        } else {
            that._skysphereTexture.setImage(null);
            __touch(9450);
            that._hide(that._skysphere);
            __touch(9451);
        }
        return PromiseUtil.resolve(that._skysphere);
        __touch(9439);
    };
    __touch(9395);
    var sides = [
        'rightRef',
        'leftRef',
        'topRef',
        'bottomRef',
        'frontRef',
        'backRef'
    ];
    __touch(9396);
    function isEqual(a, b) {
        var len = a.length;
        __touch(9452);
        if (len !== b.length) {
            return false;
            __touch(9455);
        }
        while (len--) {
            if (a[len] !== b[len]) {
                return false;
                __touch(9456);
            }
        }
        __touch(9453);
        return true;
        __touch(9454);
    }
    __touch(9397);
    SkyboxHandler.prototype._updateBox = function (config, options, skybox) {
        var that = this;
        __touch(9457);
        var promises = sides.map(function (side) {
            return config[side] ? that._load(config[side], options) : PromiseUtil.resolve();
            __touch(9460);
        });
        __touch(9458);
        return RSVP.all(promises).then(function (textures) {
            if (isEqual(textures, skybox.textures) && that._activeSkyShape === that._skybox) {
                return that._skybox;
                __touch(9472);
            }
            var images = textures.map(function (texture) {
                return texture ? texture.image : null;
                __touch(9473);
            });
            __touch(9461);
            if (images.filter(Boolean).length === 0) {
                that._skyboxTexture.setImage(null);
                __touch(9474);
                that._hide(that._skybox);
                __touch(9475);
                return that._skybox;
                __touch(9476);
            }
            var w = 1;
            __touch(9462);
            var h = 1;
            __touch(9463);
            for (var i = 0; i < images.length; i++) {
                if (images[i]) {
                    w = Math.max(w, images[i].width);
                    __touch(9477);
                    h = Math.max(h, images[i].width);
                    __touch(9478);
                }
            }
            skybox.textures = textures;
            __touch(9464);
            var skyTex = that._skyboxTexture;
            __touch(9465);
            skyTex.setImage(images);
            __touch(9466);
            skyTex.image.width = w;
            __touch(9467);
            skyTex.image.height = h;
            __touch(9468);
            skyTex.image.dataReady = true;
            __touch(9469);
            skyTex.setNeedsUpdate();
            __touch(9470);
            if (config.enabled) {
                that._show(that._skybox);
                __touch(9479);
            } else {
                that._hide(that._skybox);
                __touch(9480);
            }
            return that._skybox;
            __touch(9471);
        });
        __touch(9459);
    };
    __touch(9398);
    SkyboxHandler.prototype._hide = function (skyshape) {
        var renderSystem = this.world.getSystem('RenderSystem');
        __touch(9481);
        renderSystem.removed(skyshape);
        __touch(9482);
        if (skyshape === this._skybox) {
            ShaderBuilder.SKYBOX = null;
            __touch(9483);
        } else if (skyshape === this._skysphere) {
            ShaderBuilder.SKYSPHERE = null;
            __touch(9484);
        }
    };
    __touch(9399);
    SkyboxHandler.prototype._show = function (skyshape) {
        var renderSystem = this.world.getSystem('RenderSystem');
        __touch(9485);
        renderSystem.added(skyshape);
        __touch(9486);
        this._activeSkyshape = skyshape;
        __touch(9487);
        ShaderBuilder.SKYBOX = skyshape === this._skybox ? this._skyboxTexture : null;
        __touch(9488);
        ShaderBuilder.SKYSPHERE = skyshape === this._skysphere ? this._skysphereTexture : null;
        __touch(9489);
    };
    __touch(9400);
    return SkyboxHandler;
    __touch(9401);
});
__touch(9386);