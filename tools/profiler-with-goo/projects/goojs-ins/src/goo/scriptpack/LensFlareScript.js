define([
    'goo/math/Vector3',
    'goo/util/ParticleSystemUtils',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/shapes/Quad'
], function (Vector3, ParticleSystemUtils, Material, ShaderLib, Quad) {
    'use strict';
    __touch(19397);
    function LensFlareScript() {
        var lightEntity;
        __touch(19405);
        var flares = [];
        __touch(19406);
        var world;
        __touch(19407);
        var isActive;
        __touch(19408);
        var quadData;
        __touch(19409);
        var lightColor;
        __touch(19410);
        var globalIntensity;
        __touch(19411);
        var spriteTxSize = 64;
        __touch(19412);
        var flareGeometry;
        __touch(19413);
        var textures = {};
        __touch(19414);
        var textureShapes = {
            splash: {
                trailStartRadius: 25,
                trailEndRadius: 0
            },
            ring: [
                {
                    fraction: 0,
                    value: 0
                },
                {
                    fraction: 0.7,
                    value: 0
                },
                {
                    fraction: 0.92,
                    value: 1
                },
                {
                    fraction: 0.98,
                    value: 0
                }
            ],
            dot: [
                {
                    fraction: 0,
                    value: 1
                },
                {
                    fraction: 0.3,
                    value: 0.75
                },
                {
                    fraction: 0.5,
                    value: 0.45
                },
                {
                    fraction: 0.65,
                    value: 0.21
                },
                {
                    fraction: 0.75,
                    value: 0.1
                },
                {
                    fraction: 0.98,
                    value: 0
                }
            ],
            bell: [
                {
                    fraction: 0,
                    value: 1
                },
                {
                    fraction: 0.15,
                    value: 0.75
                },
                {
                    fraction: 0.3,
                    value: 0.5
                },
                {
                    fraction: 0.4,
                    value: 0.25
                },
                {
                    fraction: 0.75,
                    value: 0.05
                },
                {
                    fraction: 0.98,
                    value: 0
                }
            ],
            none: [
                {
                    fraction: 0,
                    value: 1
                },
                {
                    fraction: 1,
                    value: 0
                }
            ]
        };
        __touch(19415);
        function generateTextures(txSize) {
            textures.size = txSize;
            __touch(19423);
            textures.splash = ParticleSystemUtils.createSplashTexture(512, {
                trailStartRadius: 25,
                trailEndRadius: 0
            });
            __touch(19424);
            textures.ring = ParticleSystemUtils.createFlareTexture(txSize, {
                steps: textureShapes.ring,
                startRadius: txSize / 4,
                endRadius: txSize / 2
            });
            __touch(19425);
            textures.dot = ParticleSystemUtils.createFlareTexture(txSize, {
                steps: textureShapes.dot,
                startRadius: 0,
                endRadius: txSize / 2
            });
            __touch(19426);
            textures.bell = ParticleSystemUtils.createFlareTexture(txSize, {
                steps: textureShapes.bell,
                startRadius: 0,
                endRadius: txSize / 2
            });
            __touch(19427);
            textures['default'] = ParticleSystemUtils.createFlareTexture(txSize, {
                steps: textureShapes.none,
                startRadius: 0,
                endRadius: txSize / 2
            });
            __touch(19428);
        }
        __touch(19416);
        function createFlareQuads(quads, lightColor, systemScale, edgeDampen, edgeScaling) {
            for (var i = 0; i < quads.length; i++) {
                var quad = quads[i];
                __touch(19430);
                flares.push(new FlareQuad(lightColor, quad.tx, quad.displace, quad.size, quad.intensity * globalIntensity, systemScale, edgeDampen, edgeScaling, textures, world));
                __touch(19431);
            }
            return flares;
            __touch(19429);
        }
        __touch(19417);
        function removeFlareQuads(quads) {
            for (var i = 0; i < quads.length; i++) {
                quads[i].quad.removeFromWorld();
                __touch(19432);
            }
        }
        __touch(19418);
        function setup(args, ctx) {
            globalIntensity = args.intensity;
            __touch(19433);
            flareGeometry = new FlareGeometry(args.edgeRelevance * 100);
            __touch(19434);
            var baseSize = spriteTxSize;
            __touch(19435);
            if (args.highRes) {
                baseSize *= 4;
                __touch(19442);
            }
            if (textures.size !== baseSize) {
                generateTextures(baseSize);
                __touch(19443);
            }
            flares = [];
            __touch(19436);
            lightEntity = ctx.entity;
            __touch(19437);
            world = ctx.world;
            __touch(19438);
            isActive = false;
            __touch(19439);
            lightColor = [
                args.color[0],
                args.color[1],
                args.color[2],
                1
            ];
            __touch(19440);
            quadData = [
                {
                    size: 2.53,
                    tx: 'bell',
                    intensity: 0.7,
                    displace: 1
                },
                {
                    size: 0.53,
                    tx: 'dot',
                    intensity: 0.7,
                    displace: 1
                },
                {
                    size: 0.83,
                    tx: 'bell',
                    intensity: 0.2,
                    displace: 0.8
                },
                {
                    size: 0.4,
                    tx: 'ring',
                    intensity: 0.1,
                    displace: 0.6
                },
                {
                    size: 0.3,
                    tx: 'bell',
                    intensity: 0.1,
                    displace: 0.4
                },
                {
                    size: 0.6,
                    tx: 'bell',
                    intensity: 0.1,
                    displace: 0.3
                },
                {
                    size: 0.3,
                    tx: 'dot',
                    intensity: 0.1,
                    displace: 0.15
                },
                {
                    size: 0.22,
                    tx: 'ring',
                    intensity: 0.03,
                    displace: -0.25
                },
                {
                    size: 0.36,
                    tx: 'dot',
                    intensity: 0.05,
                    displace: -0.5
                },
                {
                    size: 0.8,
                    tx: 'ring',
                    intensity: 0.1,
                    displace: -0.8
                },
                {
                    size: 0.86,
                    tx: 'bell',
                    intensity: 0.2,
                    displace: -1.1
                },
                {
                    size: 1.3,
                    tx: 'ring',
                    intensity: 0.05,
                    displace: -1.5
                }
            ];
            __touch(19441);
        }
        __touch(19419);
        function cleanup() {
            removeFlareQuads(flares);
            __touch(19444);
            flares = [];
            __touch(19445);
        }
        __touch(19420);
        function update(args, ctx) {
            if (ctx.entity.isVisible !== false) {
                flareGeometry.updateFrameGeometry(lightEntity, ctx.activeCameraEntity);
                __touch(19446);
                if (!isActive) {
                    flares = createFlareQuads(quadData, lightColor, args.scale, args.edgeDampen, args.edgeScaling);
                    __touch(19447);
                    isActive = true;
                    __touch(19448);
                }
                for (var i = 0; i < flares.length; i++) {
                    flares[i].updatePosition(flareGeometry);
                    __touch(19449);
                }
            } else {
                if (isActive) {
                    removeFlareQuads(flares);
                    __touch(19450);
                    isActive = false;
                    __touch(19451);
                }
            }
        }
        __touch(19421);
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(19422);
    }
    __touch(19398);
    LensFlareScript.externals = {
        key: 'LensFlareScript',
        name: 'Lens Flare Script',
        description: 'Makes an entity shine with some lensflare effect.',
        parameters: [
            {
                key: 'scale',
                name: 'Scale',
                type: 'float',
                description: 'Scale of flare quads',
                control: 'slider',
                'default': 1,
                min: 0.01,
                max: 2
            },
            {
                key: 'intensity',
                name: 'Intensity',
                type: 'float',
                description: 'Intensity of Effect',
                control: 'slider',
                'default': 1,
                min: 0.01,
                max: 2
            },
            {
                key: 'edgeRelevance',
                name: 'Edge Relevance',
                type: 'float',
                description: 'How much the effect cares about being centered or not',
                control: 'slider',
                'default': 0,
                min: 0,
                max: 2
            },
            {
                key: 'edgeDampen',
                name: 'Edge Dampening',
                type: 'float',
                description: 'Intensity adjustment by distance from center',
                control: 'slider',
                'default': 0.2,
                min: 0,
                max: 1
            },
            {
                key: 'edgeScaling',
                name: 'Edge Scaling',
                type: 'float',
                description: 'Scale adjustment by distance from center',
                control: 'slider',
                'default': 0,
                min: -2,
                max: 2
            },
            {
                key: 'color',
                name: 'Color',
                type: 'vec3',
                description: 'Effect Color',
                control: 'color',
                'default': [
                    0.8,
                    0.75,
                    0.7
                ]
            },
            {
                key: 'highRes',
                name: 'High Resolution',
                type: 'boolean',
                description: 'Intensity of Effect',
                control: 'checkbox',
                'default': false
            }
        ]
    };
    __touch(19399);
    function FlareGeometry(edgeRelevance) {
        this.camRot = null;
        __touch(19452);
        this.distance = 0;
        __touch(19453);
        this.offset = 0;
        __touch(19454);
        this.centerRatio = 0;
        __touch(19455);
        this.positionVector = new Vector3();
        __touch(19456);
        this.distanceVector = new Vector3();
        __touch(19457);
        this.centerVector = new Vector3();
        __touch(19458);
        this.displacementVector = new Vector3();
        __touch(19459);
        this.edgeRelevance = edgeRelevance;
        __touch(19460);
    }
    __touch(19400);
    FlareGeometry.prototype.updateFrameGeometry = function (lightEntity, cameraEntity) {
        this.camRot = cameraEntity.transformComponent.transform.rotation;
        __touch(19461);
        this.centerVector.set(cameraEntity.cameraComponent.camera.translation);
        __touch(19462);
        this.displacementVector.set(lightEntity.transformComponent.worldTransform.translation);
        __touch(19463);
        this.displacementVector.sub(this.centerVector);
        __touch(19464);
        this.distance = this.displacementVector.length();
        __touch(19465);
        this.distanceVector.set(0, 0, -this.distance);
        __touch(19466);
        this.camRot.applyPost(this.distanceVector);
        __touch(19467);
        this.centerVector.add(this.distanceVector);
        __touch(19468);
        this.positionVector.set(this.centerVector);
        __touch(19469);
        this.displacementVector.set(lightEntity.transformComponent.worldTransform.translation);
        __touch(19470);
        this.displacementVector.sub(this.positionVector);
        __touch(19471);
        this.offset = this.displacementVector.length();
        __touch(19472);
        var positionVectorLength = this.positionVector.length();
        __touch(19473);
        if (positionVectorLength) {
            this.centerRatio = 1 - this.offset * this.edgeRelevance / this.positionVector.length();
            __touch(19475);
        } else {
            this.centerRatio = 1 - this.offset * this.edgeRelevance;
            __touch(19476);
        }
        this.centerRatio = Math.max(0, this.centerRatio);
        __touch(19474);
    };
    __touch(19401);
    function FlareQuad(lightColor, tx, displace, size, intensity, systemScale, edgeDampen, edgeScaling, textures, world) {
        this.sizeVector = new Vector3(size, size, size);
        __touch(19477);
        this.sizeVector.mul(systemScale);
        __touch(19478);
        this.positionVector = new Vector3();
        __touch(19479);
        this.flareVector = new Vector3();
        __touch(19480);
        this.intensity = intensity;
        __touch(19481);
        this.displace = displace;
        __touch(19482);
        this.color = [
            lightColor[0] * intensity,
            lightColor[1] * intensity,
            lightColor[2] * intensity,
            1
        ];
        __touch(19483);
        this.edgeDampen = edgeDampen;
        __touch(19484);
        this.edgeScaling = edgeScaling;
        __touch(19485);
        var material = new Material(ShaderLib.uber, 'flareShader');
        __touch(19486);
        material.uniforms.materialEmissive = this.color;
        __touch(19487);
        material.uniforms.materialDiffuse = [
            0,
            0,
            0,
            1
        ];
        __touch(19488);
        material.uniforms.materialAmbient = [
            0,
            0,
            0,
            1
        ];
        __touch(19489);
        material.uniforms.materialSpecular = [
            0,
            0,
            0,
            1
        ];
        __touch(19490);
        var texture = textures[tx];
        __touch(19491);
        material.setTexture('DIFFUSE_MAP', texture);
        __touch(19492);
        material.setTexture('EMISSIVE_MAP', texture);
        __touch(19493);
        material.blendState.blending = 'AdditiveBlending';
        __touch(19494);
        material.blendState.blendEquation = 'AddEquation';
        __touch(19495);
        material.blendState.blendSrc = 'OneFactor';
        __touch(19496);
        material.blendState.blendDst = 'OneFactor';
        __touch(19497);
        material.depthState.enabled = false;
        __touch(19498);
        material.depthState.write = false;
        __touch(19499);
        material.cullState.enabled = false;
        __touch(19500);
        var meshData = new Quad(1, 1);
        __touch(19501);
        var entity = world.createEntity(meshData, material);
        __touch(19502);
        entity.meshRendererComponent.cullMode = 'Never';
        __touch(19503);
        entity.addToWorld();
        __touch(19504);
        this.material = material;
        __touch(19505);
        this.quad = entity;
        __touch(19506);
    }
    __touch(19402);
    FlareQuad.prototype.updatePosition = function (flareGeometry) {
        this.flareVector.set(flareGeometry.displacementVector);
        __touch(19507);
        this.positionVector.set(flareGeometry.positionVector);
        __touch(19508);
        this.flareVector.mul(this.displace);
        __touch(19509);
        this.positionVector.add(this.flareVector);
        __touch(19510);
        this.material.uniforms.materialEmissive = [
            this.color[0] * flareGeometry.centerRatio * this.edgeDampen,
            this.color[1] * flareGeometry.centerRatio * this.edgeDampen,
            this.color[2] * flareGeometry.centerRatio * this.edgeDampen,
            1
        ];
        __touch(19511);
        var scaleFactor = flareGeometry.distance + flareGeometry.distance * flareGeometry.centerRatio * this.edgeScaling;
        __touch(19512);
        var quadTransform = this.quad.transformComponent.transform;
        __touch(19513);
        quadTransform.scale.set(this.sizeVector);
        __touch(19514);
        quadTransform.scale.mul(scaleFactor);
        __touch(19515);
        quadTransform.rotation.set(flareGeometry.camRot);
        __touch(19516);
        quadTransform.translation.set(this.positionVector);
        __touch(19517);
        this.quad.transformComponent.updateTransform();
        __touch(19518);
        this.quad.transformComponent.updateWorldTransform();
        __touch(19519);
    };
    __touch(19403);
    return LensFlareScript;
    __touch(19404);
});
__touch(19396);