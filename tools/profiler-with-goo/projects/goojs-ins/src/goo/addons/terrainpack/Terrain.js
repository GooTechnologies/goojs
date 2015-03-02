define([
    'goo/entities/EntityUtils',
    'goo/entities/components/MeshDataComponent',
    'goo/entities/components/MeshRendererComponent',
    'goo/math/MathUtils',
    'goo/math/Transform',
    'goo/math/Vector3',
    'goo/renderer/MeshData',
    'goo/renderer/Material',
    'goo/renderer/Shader',
    'goo/renderer/shaders/ShaderBuilder',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/shaders/ShaderFragment',
    'goo/renderer/TextureCreator',
    'goo/renderer/pass/RenderTarget',
    'goo/renderer/Texture',
    'goo/renderer/Renderer',
    'goo/renderer/pass/FullscreenPass',
    'goo/renderer/pass/FullscreenUtil',
    'goo/renderer/light/DirectionalLight',
    'goo/shapes/Quad'
], function (EntityUtils, MeshDataComponent, MeshRendererComponent, MathUtils, Transform, Vector3, MeshData, Material, Shader, ShaderBuilder, ShaderLib, ShaderFragment, TextureCreator, RenderTarget, Texture, Renderer, FullscreenPass, FullscreenUtil, DirectionalLight, Quad) {
    'use strict';
    __touch(904);
    var Ammo = window.Ammo;
    __touch(905);
    function Terrain(goo, size, count) {
        this.world = goo.world;
        __touch(931);
        this.renderer = goo.renderer;
        __touch(932);
        this.size = size;
        __touch(933);
        this.count = count;
        __touch(934);
        this.splatMult = 2;
        __touch(935);
        this._gridCache = {};
        __touch(936);
        var brush = new Quad(2 / size, 2 / size);
        __touch(937);
        var mat = this.drawMaterial1 = new Material(brushShader);
        __touch(938);
        mat.blendState.blending = 'AdditiveBlending';
        __touch(939);
        mat.cullState.cullFace = 'Front';
        __touch(940);
        var mat2 = this.drawMaterial2 = new Material(brushShader2);
        __touch(941);
        mat2.cullState.cullFace = 'Front';
        __touch(942);
        var mat3 = this.drawMaterial3 = new Material(brushShader3);
        __touch(943);
        mat3.uniforms.size = 1 / size;
        __touch(944);
        mat3.cullState.cullFace = 'Front';
        __touch(945);
        var mat4 = this.drawMaterial4 = new Material(brushShader4);
        __touch(946);
        mat4.cullState.cullFace = 'Front';
        __touch(947);
        this.renderable = {
            meshData: brush,
            materials: [mat],
            transform: new Transform()
        };
        __touch(948);
        this.renderable.transform.setRotationXYZ(0, 0, Math.PI * 0.5);
        __touch(949);
        this.copyPass = new FullscreenPass(ShaderLib.screenCopy);
        __touch(950);
        this.copyPass.material.depthState.enabled = false;
        __touch(951);
        this.upsamplePass = new FullscreenPass(upsampleShader);
        __touch(952);
        this.upsamplePass.material.depthState.enabled = false;
        __touch(953);
        this.normalmapPass = new FullscreenPass(normalmapShader);
        __touch(954);
        this.normalmapPass.material.depthState.enabled = false;
        __touch(955);
        this.normalmapPass.material.uniforms.resolution = [
            size,
            size
        ];
        __touch(956);
        this.normalmapPass.material.uniforms.height = 10;
        __touch(957);
        this.extractFloatPass = new FullscreenPass(extractShader);
        __touch(958);
        this.normalMap = new RenderTarget(size, size);
        __touch(959);
        this.textures = [];
        __touch(960);
        this.texturesBounce = [];
        __touch(961);
        for (var i = 0; i < count; i++) {
            this.textures[i] = new RenderTarget(size, size, {
                magFilter: 'NearestNeighbor',
                minFilter: 'NearestNeighborNoMipMaps',
                wrapS: 'EdgeClamp',
                wrapT: 'EdgeClamp',
                generateMipmaps: false,
                type: 'Float'
            });
            __touch(970);
            this.texturesBounce[i] = new RenderTarget(size, size, {
                magFilter: 'NearestNeighbor',
                minFilter: 'NearestNeighborNoMipMaps',
                wrapS: 'EdgeClamp',
                wrapT: 'EdgeClamp',
                generateMipmaps: false,
                type: 'Float'
            });
            __touch(971);
            size *= 0.5;
            __touch(972);
        }
        mat3.setTexture('HEIGHT_MAP', this.texturesBounce[0]);
        __touch(962);
        mat4.setTexture('HEIGHT_MAP', this.texturesBounce[0]);
        __touch(963);
        this.n = 31;
        __touch(964);
        this.gridSize = (this.n + 1) * 4 - 1;
        __touch(965);
        console.log('grid size: ', this.gridSize);
        __touch(966);
        this.splat = new RenderTarget(this.size * this.splatMult, this.size * this.splatMult, {
            wrapS: 'EdgeClamp',
            wrapT: 'EdgeClamp',
            generateMipmaps: false
        });
        __touch(967);
        this.splatCopy = new RenderTarget(this.size * this.splatMult, this.size * this.splatMult, {
            wrapS: 'EdgeClamp',
            wrapT: 'EdgeClamp',
            generateMipmaps: false
        });
        __touch(968);
        mat2.setTexture('SPLAT_MAP', this.splatCopy);
        __touch(969);
    }
    __touch(906);
    Terrain.prototype.init = function (terrainTextures) {
        var world = this.world;
        __touch(973);
        var count = this.count;
        __touch(974);
        var entity = this.terrainRoot = world.createEntity('TerrainRoot');
        __touch(975);
        entity.addToWorld();
        __touch(976);
        this.clipmaps = [];
        __touch(977);
        for (var i = 0; i < count; i++) {
            var size = Math.pow(2, i);
            __touch(992);
            var material = new Material(terrainShaderDefFloat, 'clipmap' + i);
            __touch(993);
            material.uniforms.materialAmbient = [
                0,
                0,
                0,
                1
            ];
            __touch(994);
            material.uniforms.materialDiffuse = [
                1,
                1,
                1,
                1
            ];
            __touch(995);
            material.cullState.frontFace = 'CW';
            __touch(996);
            material.uniforms.resolution = [
                1,
                1 / size,
                this.size,
                this.size
            ];
            __touch(997);
            material.uniforms.resolutionNorm = [
                this.size,
                this.size
            ];
            __touch(998);
            var clipmapEntity = this.createClipmapLevel(world, material, i);
            __touch(999);
            clipmapEntity.setScale(size, 1, size);
            __touch(1000);
            entity.attachChild(clipmapEntity);
            __touch(1001);
            var terrainPickingMaterial = new Material(terrainPickingShader, 'terrainPickingMaterial' + i);
            __touch(1002);
            terrainPickingMaterial.cullState.frontFace = 'CW';
            __touch(1003);
            terrainPickingMaterial.uniforms.resolution = [
                1,
                1 / size,
                this.size,
                this.size
            ];
            __touch(1004);
            terrainPickingMaterial.blendState = {
                blending: 'NoBlending',
                blendEquation: 'AddEquation',
                blendSrc: 'SrcAlphaFactor',
                blendDst: 'OneMinusSrcAlphaFactor'
            };
            __touch(1005);
            this.clipmaps[i] = {
                clipmapEntity: clipmapEntity,
                level: i,
                size: size,
                currentX: 100000,
                currentY: 100000,
                currentZ: 100000,
                origMaterial: material,
                terrainPickingMaterial: terrainPickingMaterial
            };
            __touch(1006);
        }
        var parentClipmap = this.clipmaps[this.clipmaps.length - 1];
        __touch(978);
        for (var i = this.clipmaps.length - 2; i >= 0; i--) {
            var clipmap = this.clipmaps[i];
            __touch(1007);
            clipmap.parentClipmap = parentClipmap;
            __touch(1008);
            parentClipmap = clipmap;
            __touch(1009);
        }
        var light = new DirectionalLight();
        __touch(979);
        light.shadowSettings.size = 10;
        __touch(980);
        var lightEntity = this.lightEntity = world.createEntity(light);
        __touch(981);
        lightEntity.setTranslation(200, 200, 200);
        __touch(982);
        lightEntity.setRotation(-Math.PI * 0.5, 0, 0);
        __touch(983);
        lightEntity.addToWorld();
        __touch(984);
        this.lightEntity.lightComponent.hidden = true;
        __touch(985);
        this.floatTexture = terrainTextures.heightMap instanceof Texture ? terrainTextures.heightMap : new Texture(terrainTextures.heightMap, {
            magFilter: 'NearestNeighbor',
            minFilter: 'NearestNeighborNoMipMaps',
            wrapS: 'EdgeClamp',
            wrapT: 'EdgeClamp',
            generateMipmaps: false,
            format: 'Luminance'
        }, this.size, this.size);
        __touch(986);
        this.splatTexture = terrainTextures.splatMap instanceof Texture ? terrainTextures.splatMap : new Texture(terrainTextures.splatMap, {
            magFilter: 'NearestNeighbor',
            minFilter: 'NearestNeighborNoMipMaps',
            wrapS: 'EdgeClamp',
            wrapT: 'EdgeClamp',
            generateMipmaps: false,
            flipY: false
        }, this.size * this.splatMult, this.size * this.splatMult);
        __touch(987);
        for (var i = 0; i < this.count; i++) {
            var material = this.clipmaps[i].origMaterial;
            __touch(1010);
            var texture = this.textures[i];
            __touch(1011);
            material.setTexture('HEIGHT_MAP', texture);
            __touch(1012);
            material.setTexture('NORMAL_MAP', this.normalMap);
            __touch(1013);
            material.setTexture('DETAIL_MAP', this.detailMap);
            __touch(1014);
            material.setTexture('SPLAT_MAP', this.splat);
            __touch(1015);
            material.setTexture('GROUND_MAP1', terrainTextures.ground1);
            __touch(1016);
            material.setTexture('GROUND_MAP2', terrainTextures.ground2);
            __touch(1017);
            material.setTexture('GROUND_MAP3', terrainTextures.ground3);
            __touch(1018);
            material.setTexture('GROUND_MAP4', terrainTextures.ground4);
            __touch(1019);
            material.setTexture('GROUND_MAP5', terrainTextures.ground5);
            __touch(1020);
            material.setTexture('STONE_MAP', terrainTextures.stone);
            __touch(1021);
            var terrainPickingMaterial = this.clipmaps[i].terrainPickingMaterial;
            __touch(1022);
            terrainPickingMaterial.setTexture('HEIGHT_MAP', texture);
            __touch(1023);
        }
        this.copyPass.render(this.renderer, this.textures[0], this.floatTexture);
        __touch(988);
        this.copyPass.render(this.renderer, this.splatCopy, this.splatTexture);
        __touch(989);
        this.copyPass.render(this.renderer, this.splat, this.splatTexture);
        __touch(990);
        this.updateTextures();
        __touch(991);
    };
    __touch(907);
    Terrain.prototype.toggleMarker = function () {
        this.lightEntity.lightComponent.hidden = !this.lightEntity.lightComponent.hidden;
        __touch(1024);
    };
    __touch(908);
    Terrain.prototype.setMarker = function (type, size, x, y, power, brushTexture) {
        this.lightEntity.lightComponent.light.shadowSettings.size = size * 0.5;
        __touch(1025);
        brushTexture.wrapS = 'EdgeClamp';
        __touch(1026);
        brushTexture.wrapT = 'EdgeClamp';
        __touch(1027);
        this.lightEntity.lightComponent.light.lightCookie = brushTexture;
        __touch(1028);
        this.lightEntity.setTranslation(x, 200, y);
        __touch(1029);
    };
    __touch(909);
    Terrain.prototype.pick = function (camera, x, y, store) {
        var entities = [];
        __touch(1030);
        this.terrainRoot.traverse(function (entity) {
            if (entity.meshDataComponent && entity.meshRendererComponent.hidden === false) {
                entities.push(entity);
                __touch(1036);
            }
        });
        __touch(1031);
        for (var i = 0; i < this.clipmaps.length; i++) {
            var clipmap = this.clipmaps[i];
            __touch(1037);
            clipmap.clipmapEntity.traverse(function (entity) {
                if (entity.meshRendererComponent) {
                    entity.meshRendererComponent.isPickable = true;
                    __touch(1039);
                    entity.meshRendererComponent.materials[0] = clipmap.terrainPickingMaterial;
                    __touch(1040);
                }
            });
            __touch(1038);
        }
        this.renderer.renderToPick(entities, Renderer.mainCamera, true, false, false, x, y, null, true);
        __touch(1032);
        var pickStore = {};
        __touch(1033);
        this.renderer.pick(x, y, pickStore, Renderer.mainCamera);
        __touch(1034);
        camera.getWorldPosition(x, y, this.renderer.viewportWidth, this.renderer.viewportHeight, pickStore.depth, store);
        __touch(1035);
        for (var i = 0; i < this.clipmaps.length; i++) {
            var clipmap = this.clipmaps[i];
            __touch(1041);
            clipmap.clipmapEntity.traverse(function (entity) {
                if (entity.meshRendererComponent) {
                    entity.meshRendererComponent.isPickable = false;
                    __touch(1043);
                    entity.meshRendererComponent.materials[0] = clipmap.origMaterial;
                    __touch(1044);
                }
            });
            __touch(1042);
        }
    };
    __touch(910);
    Terrain.prototype.draw = function (mode, type, size, x, y, z, power, brushTexture, rgba) {
        power = MathUtils.clamp(power, 0, 1);
        __touch(1045);
        x = (x - this.size / 2) * 2;
        __touch(1046);
        z = (z - this.size / 2) * 2;
        __touch(1047);
        if (mode === 'paint') {
            this.renderable.materials[0] = this.drawMaterial2;
            __touch(1048);
            this.renderable.materials[0].uniforms.opacity = power;
            __touch(1049);
            if (type === 'add') {
                this.renderable.materials[0].blendState.blendEquationColor = 'AddEquation';
                __touch(1056);
                this.renderable.materials[0].blendState.blendEquationAlpha = 'AddEquation';
                __touch(1057);
            } else if (type === 'sub') {
                this.renderable.materials[0].blendState.blendEquationColor = 'ReverseSubtractEquation';
                __touch(1058);
                this.renderable.materials[0].blendState.blendEquationAlpha = 'ReverseSubtractEquation';
                __touch(1059);
            }
            if (brushTexture) {
                this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
                __touch(1060);
            } else {
                this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
                __touch(1061);
            }
            this.renderable.transform.translation.setd(x / this.size, z / this.size, 0);
            __touch(1050);
            this.renderable.transform.scale.setd(-size, size, size);
            __touch(1051);
            this.renderable.transform.update();
            __touch(1052);
            this.copyPass.render(this.renderer, this.splatCopy, this.splat);
            __touch(1053);
            this.renderable.materials[0].uniforms.rgba = rgba || [
                1,
                1,
                1,
                1
            ];
            __touch(1054);
            this.renderer.render(this.renderable, FullscreenUtil.camera, [], this.splat, false);
            __touch(1055);
        } else if (mode === 'smooth') {
            this.renderable.materials[0] = this.drawMaterial3;
            __touch(1062);
            this.renderable.materials[0].uniforms.opacity = power;
            __touch(1063);
            if (brushTexture) {
                this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
                __touch(1069);
            } else {
                this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
                __touch(1070);
            }
            this.renderable.transform.translation.setd(x / this.size, z / this.size, 0);
            __touch(1064);
            this.renderable.transform.scale.setd(-size, size, size);
            __touch(1065);
            this.renderable.transform.update();
            __touch(1066);
            this.copyPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);
            __touch(1067);
            this.renderer.render(this.renderable, FullscreenUtil.camera, [], this.textures[0], false);
            __touch(1068);
        } else if (mode === 'flatten') {
            this.renderable.materials[0] = this.drawMaterial4;
            __touch(1071);
            this.renderable.materials[0].uniforms.opacity = power;
            __touch(1072);
            this.renderable.materials[0].uniforms.height = y;
            __touch(1073);
            if (brushTexture) {
                this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
                __touch(1079);
            } else {
                this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
                __touch(1080);
            }
            this.renderable.transform.translation.setd(x / this.size, z / this.size, 0);
            __touch(1074);
            this.renderable.transform.scale.setd(-size, size, size);
            __touch(1075);
            this.renderable.transform.update();
            __touch(1076);
            this.copyPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);
            __touch(1077);
            this.renderer.render(this.renderable, FullscreenUtil.camera, [], this.textures[0], false);
            __touch(1078);
        } else {
            this.renderable.materials[0] = this.drawMaterial1;
            __touch(1081);
            this.renderable.materials[0].uniforms.opacity = power;
            __touch(1082);
            if (type === 'add') {
                this.renderable.materials[0].blendState.blending = 'AdditiveBlending';
                __touch(1087);
            } else if (type === 'sub') {
                this.renderable.materials[0].blendState.blending = 'SubtractiveBlending';
                __touch(1088);
            } else if (type === 'mul') {
                this.renderable.materials[0].blendState.blending = 'MultiplyBlending';
                __touch(1089);
            }
            if (brushTexture) {
                this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
                __touch(1090);
            } else {
                this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
                __touch(1091);
            }
            this.renderable.transform.translation.setd(x / this.size, z / this.size, 0);
            __touch(1083);
            this.renderable.transform.scale.setd(-size, size, size);
            __touch(1084);
            this.renderable.transform.update();
            __touch(1085);
            this.renderer.render(this.renderable, FullscreenUtil.camera, [], this.textures[0], false);
            __touch(1086);
        }
    };
    __touch(911);
    Terrain.prototype.getTerrainData = function () {
        var terrainBuffer = new Uint8Array(this.size * this.size * 4);
        __touch(1092);
        this.extractFloatPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);
        __touch(1093);
        this.renderer.readPixels(0, 0, this.size, this.size, terrainBuffer);
        __touch(1094);
        var terrainFloats = new Float32Array(terrainBuffer.buffer);
        __touch(1095);
        var normalBuffer = new Uint8Array(this.size * this.size * 4);
        __touch(1096);
        this.normalmapPass.render(this.renderer, this.normalMap, this.textures[0]);
        __touch(1097);
        this.renderer.readPixels(0, 0, this.size, this.size, normalBuffer);
        __touch(1098);
        var splatBuffer = new Uint8Array(this.size * this.size * 4 * 4);
        __touch(1099);
        this.copyPass.render(this.renderer, this.splatCopy, this.splat);
        __touch(1100);
        this.renderer.readPixels(0, 0, this.size * this.splatMult, this.size * this.splatMult, splatBuffer);
        __touch(1101);
        return {
            heights: terrainFloats,
            normals: normalBuffer,
            splat: splatBuffer
        };
        __touch(1102);
    };
    __touch(912);
    Terrain.prototype.updateAmmoBody = function () {
        var heights = this.getTerrainData().heights;
        __touch(1103);
        var heightBuffer = this.heightBuffer;
        __touch(1104);
        for (var z = 0; z < this.size; z++) {
            for (var x = 0; x < this.size; x++) {
                Ammo.setValue(heightBuffer + (z * this.size + x) * 4, heights[(this.size - z - 1) * this.size + x], 'float');
                __touch(1105);
            }
        }
    };
    __touch(913);
    Terrain.prototype.setLightmapTexture = function (lightMap) {
        for (var i = 0; i < this.clipmaps.length; i++) {
            var clipmap = this.clipmaps[i];
            __touch(1106);
            clipmap.clipmapEntity.traverse(function (entity) {
                if (entity.meshRendererComponent) {
                    var material = entity.meshRendererComponent.materials[0];
                    __touch(1108);
                    if (lightMap) {
                        material.setTexture('LIGHT_MAP', lightMap);
                        __touch(1109);
                        material.shader.defines.LIGHTMAP = true;
                        __touch(1110);
                    } else {
                        material.shader.defines.LIGHTMAP = false;
                        __touch(1111);
                    }
                }
            });
            __touch(1107);
        }
    };
    __touch(914);
    Terrain.prototype.initAmmoBody = function () {
        var heightBuffer = this.heightBuffer = Ammo.allocate(4 * this.size * this.size, 'float', Ammo.ALLOC_NORMAL);
        __touch(1112);
        this.updateAmmoBody();
        __touch(1113);
        var heightScale = 1;
        __touch(1114);
        var minHeight = -500;
        __touch(1115);
        var maxHeight = 500;
        __touch(1116);
        var upAxis = 1;
        __touch(1117);
        var heightDataType = 0;
        __touch(1118);
        var flipQuadEdges = false;
        __touch(1119);
        var shape = new Ammo.btHeightfieldTerrainShape(this.size, this.size, heightBuffer, heightScale, minHeight, maxHeight, upAxis, heightDataType, flipQuadEdges);
        __touch(1120);
        var ammoTransform = new Ammo.btTransform();
        __touch(1121);
        ammoTransform.setIdentity();
        __touch(1122);
        ammoTransform.setOrigin(new Ammo.btVector3(this.size / 2, 0, this.size / 2));
        __touch(1123);
        var motionState = new Ammo.btDefaultMotionState(ammoTransform);
        __touch(1124);
        var localInertia = new Ammo.btVector3(0, 0, 0);
        __touch(1125);
        var mass = 0;
        __touch(1126);
        var info = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        __touch(1127);
        var body = new Ammo.btRigidBody(info);
        __touch(1128);
        body.setFriction(1);
        __touch(1129);
        this.world.getSystem('AmmoSystem').ammoWorld.addRigidBody(body);
        __touch(1130);
        return body;
        __touch(1131);
    };
    __touch(915);
    Terrain.prototype.updateTextures = function () {
        for (var i = 0; i < this.count - 1; i++) {
            var mipmap = this.textures[i];
            __touch(1134);
            var child = this.textures[i + 1];
            __touch(1135);
            mipmap.magFilter = 'Bilinear';
            __touch(1136);
            mipmap.minFilter = 'BilinearNoMipMaps';
            __touch(1137);
            this.copyPass.render(this.renderer, child, mipmap);
            __touch(1138);
        }
        var size = this.size;
        __touch(1132);
        for (var i = 0; i < this.count; i++) {
            var mipmapTarget = this.texturesBounce[i];
            __touch(1139);
            var mipmap = this.textures[i];
            __touch(1140);
            var child = this.textures[i + 1];
            __touch(1141);
            this.upsamplePass.material.setTexture('MAIN_MAP', mipmap);
            __touch(1142);
            this.upsamplePass.material.uniforms.res = [
                size,
                size,
                2 / size,
                2 / size
            ];
            __touch(1143);
            if (child) {
                child.magFilter = 'NearestNeighbor';
                __touch(1145);
                child.minFilter = 'NearestNeighborNoMipMaps';
                __touch(1146);
                this.upsamplePass.render(this.renderer, mipmapTarget, child);
                __touch(1147);
            } else {
                mipmap.magFilter = 'NearestNeighbor';
                __touch(1148);
                mipmap.minFilter = 'NearestNeighborNoMipMaps';
                __touch(1149);
                this.upsamplePass.render(this.renderer, mipmapTarget, mipmap);
                __touch(1150);
            }
            size *= 0.5;
            __touch(1144);
        }
        for (var i = 0; i < this.count; i++) {
            this.copyPass.render(this.renderer, this.textures[i], this.texturesBounce[i]);
            __touch(1151);
        }
        this.normalmapPass.render(this.renderer, this.normalMap, this.textures[0]);
        __touch(1133);
    };
    __touch(916);
    Terrain.prototype.update = function (pos) {
        var x = pos.x;
        __touch(1152);
        var y = pos.y;
        __touch(1153);
        var z = pos.z;
        __touch(1154);
        for (var i = 0; i < this.clipmaps.length; i++) {
            var clipmap = this.clipmaps[i];
            __touch(1155);
            var xx = Math.floor(x * 0.5 / clipmap.size);
            __touch(1156);
            var yy = Math.floor(y * 0.5 / clipmap.size);
            __touch(1157);
            var zz = Math.floor(z * 0.5 / clipmap.size);
            __touch(1158);
            if (yy !== clipmap.currentY) {
                clipmap.currentY = yy;
                __touch(1163);
                var compSize = this.gridSize * clipmap.size * 2;
                __touch(1164);
                if (clipmap.clipmapEntity._hidden === false && y > compSize) {
                    clipmap.clipmapEntity.hide();
                    __touch(1165);
                    if (i < this.clipmaps.length - 1) {
                        var childClipmap = this.clipmaps[i + 1];
                        __touch(1167);
                        childClipmap.clipmapEntity.innermost.meshRendererComponent.hidden = false;
                        __touch(1168);
                        childClipmap.clipmapEntity.interior1.meshRendererComponent.hidden = true;
                        __touch(1169);
                        childClipmap.clipmapEntity.interior2.meshRendererComponent.hidden = true;
                        __touch(1170);
                    }
                    continue;
                    __touch(1166);
                } else if (clipmap.clipmapEntity._hidden === true && y <= compSize) {
                    clipmap.clipmapEntity.show();
                    __touch(1171);
                    if (i < this.clipmaps.length - 1) {
                        var childClipmap = this.clipmaps[i + 1];
                        __touch(1172);
                        childClipmap.clipmapEntity.innermost.meshRendererComponent.hidden = true;
                        __touch(1173);
                        childClipmap.clipmapEntity.interior1.meshRendererComponent.hidden = false;
                        __touch(1174);
                        childClipmap.clipmapEntity.interior2.meshRendererComponent.hidden = false;
                        __touch(1175);
                    }
                }
            }
            if (xx === clipmap.currentX && zz === clipmap.currentZ) {
                continue;
                __touch(1176);
            }
            var n = this.n;
            __touch(1159);
            if (clipmap.parentClipmap) {
                var interior1 = clipmap.parentClipmap.clipmapEntity.interior1;
                __touch(1177);
                var interior2 = clipmap.parentClipmap.clipmapEntity.interior2;
                __touch(1178);
                var xxx = MathUtils.moduloPositive(xx + 1, 2);
                __touch(1179);
                var zzz = MathUtils.moduloPositive(zz + 1, 2);
                __touch(1180);
                var xmove = xxx % 2 === 0 ? -n : n + 1;
                __touch(1181);
                var zmove = zzz % 2 === 0 ? -n : n + 1;
                __touch(1182);
                interior1.setTranslation(-n, 0, zmove);
                __touch(1183);
                zzz = MathUtils.moduloPositive(zz, 2);
                __touch(1184);
                zmove = zzz % 2 === 0 ? -n : -n + 1;
                __touch(1185);
                interior2.setTranslation(xmove, 0, zmove);
                __touch(1186);
            }
            clipmap.clipmapEntity.setTranslation(xx * clipmap.size * 2, 0, zz * clipmap.size * 2);
            __touch(1160);
            clipmap.currentX = xx;
            __touch(1161);
            clipmap.currentZ = zz;
            __touch(1162);
        }
    };
    __touch(917);
    Terrain.prototype.createClipmapLevel = function (world, material, level) {
        var entity = world.createEntity('clipmap' + level);
        __touch(1187);
        entity.addToWorld();
        __touch(1188);
        var n = this.n;
        __touch(1189);
        this.createQuadEntity(world, material, level, entity, -2 * n, -2 * n, n, n);
        __touch(1190);
        this.createQuadEntity(world, material, level, entity, -1 * n, -2 * n, n, n);
        __touch(1191);
        this.createQuadEntity(world, material, level, entity, 0 * n, -2 * n, 2, n);
        __touch(1192);
        this.createQuadEntity(world, material, level, entity, 2, -2 * n, n, n);
        __touch(1193);
        this.createQuadEntity(world, material, level, entity, 2 + 1 * n, -2 * n, n, n);
        __touch(1194);
        this.createQuadEntity(world, material, level, entity, -2 * n, -1 * n, n, n);
        __touch(1195);
        this.createQuadEntity(world, material, level, entity, 2 + 1 * n, -1 * n, n, n);
        __touch(1196);
        this.createQuadEntity(world, material, level, entity, -2 * n, 0, n, 2);
        __touch(1197);
        this.createQuadEntity(world, material, level, entity, 2 + 1 * n, 0, n, 2);
        __touch(1198);
        this.createQuadEntity(world, material, level, entity, -2 * n, 2, n, n);
        __touch(1199);
        this.createQuadEntity(world, material, level, entity, 2 + 1 * n, 2, n, n);
        __touch(1200);
        this.createQuadEntity(world, material, level, entity, -2 * n, 2 + 1 * n, n, n);
        __touch(1201);
        this.createQuadEntity(world, material, level, entity, -1 * n, 2 + 1 * n, n, n);
        __touch(1202);
        this.createQuadEntity(world, material, level, entity, 0, 2 + 1 * n, 2, n);
        __touch(1203);
        this.createQuadEntity(world, material, level, entity, 2, 2 + 1 * n, n, n);
        __touch(1204);
        this.createQuadEntity(world, material, level, entity, 2 + 1 * n, 2 + 1 * n, n, n);
        __touch(1205);
        entity.innermost = this.createQuadEntity(world, material, level, entity, -n, -n, n * 2 + 2, n * 2 + 2);
        __touch(1206);
        if (level !== 0) {
            entity.innermost.meshRendererComponent.hidden = true;
            __touch(1208);
            entity.interior1 = this.createQuadEntity(world, material, level, entity, -n, -n, n * 2 + 2, 1);
            __touch(1209);
            entity.interior2 = this.createQuadEntity(world, material, level, entity, -n, -n, 1, n * 2 + 1);
            __touch(1210);
        }
        return entity;
        __touch(1207);
    };
    __touch(918);
    Terrain.prototype.createQuadEntity = function (world, material, level, parentEntity, x, y, w, h) {
        var meshData = this.createGrid(w, h);
        __touch(1211);
        var entity = world.createEntity('mesh_' + w + '_' + h, meshData, material);
        __touch(1212);
        entity.meshDataComponent.modelBound.xExtent = w * 0.5;
        __touch(1213);
        entity.meshDataComponent.modelBound.yExtent = 255;
        __touch(1214);
        entity.meshDataComponent.modelBound.zExtent = h * 0.5;
        __touch(1215);
        entity.meshDataComponent.modelBound.center.setd(w * 0.5, 128, h * 0.5);
        __touch(1216);
        entity.meshDataComponent.autoCompute = false;
        __touch(1217);
        entity.meshRendererComponent.isPickable = false;
        __touch(1218);
        entity.setTranslation(x, 0, y);
        __touch(1219);
        parentEntity.attachChild(entity);
        __touch(1220);
        entity.addToWorld();
        __touch(1221);
        return entity;
        __touch(1222);
    };
    __touch(919);
    Terrain.prototype.createGrid = function (w, h) {
        var key = w + '_' + h;
        __touch(1223);
        if (this._gridCache[key]) {
            return this._gridCache[key];
            __touch(1234);
        }
        var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
        __touch(1224);
        var meshData = new MeshData(attributeMap, (w + 1) * (h + 1), (w * 2 + 4) * h);
        __touch(1225);
        this._gridCache[key] = meshData;
        __touch(1226);
        meshData.indexModes = ['TriangleStrip'];
        __touch(1227);
        var vertices = meshData.getAttributeBuffer(MeshData.POSITION);
        __touch(1228);
        var indices = meshData.getIndexBuffer();
        __touch(1229);
        for (var x = 0; x < w + 1; x++) {
            for (var y = 0; y < h + 1; y++) {
                var index = y * (w + 1) + x;
                __touch(1235);
                vertices[index * 3 + 0] = x;
                __touch(1236);
                vertices[index * 3 + 1] = 0;
                __touch(1237);
                vertices[index * 3 + 2] = y;
                __touch(1238);
            }
        }
        var indicesIndex = 0;
        __touch(1230);
        var index = 0;
        __touch(1231);
        for (var y = 0; y < h; y++) {
            indices[indicesIndex++] = y * (w + 1);
            __touch(1239);
            indices[indicesIndex++] = y * (w + 1);
            __touch(1240);
            for (var x = 0; x < w; x++) {
                index = y * (w + 1) + x;
                __touch(1243);
                indices[indicesIndex++] = index + w + 1;
                __touch(1244);
                indices[indicesIndex++] = index + 1;
                __touch(1245);
            }
            indices[indicesIndex++] = index + w + 1 + 1;
            __touch(1241);
            indices[indicesIndex++] = index + w + 1 + 1;
            __touch(1242);
        }
        console.log((w + 1) * (h + 1), (w * 2 + 4) * h, w * h * 6);
        __touch(1232);
        return meshData;
        __touch(1233);
    };
    __touch(920);
    var terrainShaderDefFloat = {
        defines: { SKIP_SPECULAR: true },
        processors: [
            ShaderBuilder.light.processor,
            function (shader) {
                if (ShaderBuilder.USE_FOG) {
                    shader.defines.FOG = true;
                    __touch(1246);
                    shader.uniforms.fogSettings = ShaderBuilder.FOG_SETTINGS;
                    __touch(1247);
                    shader.uniforms.fogColor = ShaderBuilder.FOG_COLOR;
                    __touch(1248);
                } else {
                    delete shader.defines.FOG;
                    __touch(1249);
                }
            }
        ],
        attributes: { vertexPosition: MeshData.POSITION },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            cameraPosition: Shader.CAMERA,
            heightMap: 'HEIGHT_MAP',
            normalMap: 'NORMAL_MAP',
            detailMap: 'DETAIL_MAP',
            splatMap: 'SPLAT_MAP',
            groundMap1: 'GROUND_MAP1',
            groundMap2: 'GROUND_MAP2',
            groundMap3: 'GROUND_MAP3',
            groundMap4: 'GROUND_MAP4',
            groundMap5: 'GROUND_MAP5',
            stoneMap: 'STONE_MAP',
            lightMap: 'LIGHT_MAP',
            fogSettings: function () {
                return ShaderBuilder.FOG_SETTINGS;
                __touch(1250);
            },
            fogColor: function () {
                return ShaderBuilder.FOG_COLOR;
                __touch(1251);
            },
            resolution: [
                255,
                1,
                1024,
                1024
            ],
            resolutionNorm: [
                1024,
                1024
            ],
            col: [
                0,
                0,
                0
            ]
        },
        builder: function (shader, shaderInfo) {
            ShaderBuilder.light.builder(shader, shaderInfo);
            __touch(1252);
        },
        vshader: function () {
            return [
                'attribute vec3 vertexPosition;',
                'uniform mat4 viewProjectionMatrix;',
                'uniform mat4 worldMatrix;',
                'uniform vec3 cameraPosition;',
                'uniform sampler2D heightMap;',
                'uniform vec4 resolution;',
                'varying vec3 vWorldPos;',
                'varying vec3 viewPosition;',
                'varying vec4 alphaval;',
                ShaderBuilder.light.prevertex,
                'const vec2 alphaOffset = vec2(45.0);',
                'const vec2 oneOverWidth = vec2(1.0 / 16.0);',
                'void main(void) {',
                'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
                'vec2 coord = (worldPos.xz + vec2(0.5, 0.5)) / resolution.zw;',
                'vec4 heightCol = texture2D(heightMap, coord);',
                'float zf = heightCol.r;',
                'float zd = heightCol.g;',
                'vec2 alpha = clamp((abs(worldPos.xz - cameraPosition.xz) * resolution.y - alphaOffset) * oneOverWidth, vec2(0.0), vec2(1.0));',
                'alpha.x = max(alpha.x, alpha.y);',
                'float z = mix(zf, zd, alpha.x);',
                'z = coord.x <= 0.0 || coord.x >= 1.0 || coord.y <= 0.0 || coord.y >= 1.0 ? -2000.0 : z;',
                'alphaval = vec4(zf, zd, alpha.x, z);',
                'worldPos.y = z * resolution.x;',
                'gl_Position = viewProjectionMatrix * worldPos;',
                'vWorldPos = worldPos.xyz;',
                'viewPosition = cameraPosition - vWorldPos;',
                ShaderBuilder.light.vertex,
                '}'
            ].join('\n');
            __touch(1253);
        },
        fshader: function () {
            return [
                'uniform vec3 col;',
                'uniform sampler2D normalMap;',
                'uniform sampler2D splatMap;',
                'uniform sampler2D detailMap;',
                'uniform sampler2D groundMap1;',
                'uniform sampler2D groundMap2;',
                'uniform sampler2D groundMap3;',
                'uniform sampler2D groundMap4;',
                'uniform sampler2D groundMap5;',
                'uniform sampler2D stoneMap;',
                'uniform sampler2D lightMap;',
                'uniform vec2 fogSettings;',
                'uniform vec3 fogColor;',
                'uniform vec2 resolutionNorm;',
                'varying vec3 vWorldPos;',
                'varying vec3 viewPosition;',
                'varying vec4 alphaval;',
                ShaderBuilder.light.prefragment,
                'void main(void) {',
                'if (alphaval.w < -1000.0) discard;',
                'vec2 mapcoord = vWorldPos.xz / resolutionNorm;',
                'vec2 coord = mapcoord * 96.0;',
                'vec4 final_color = vec4(1.0);',
                'vec3 N = (texture2D(normalMap, mapcoord).xyz * vec3(2.0) - vec3(1.0)).xzy;',
                'N.y = 0.1;',
                'N = normalize(N);',
                'vec4 splat = texture2D(splatMap, mapcoord);',
                'vec4 g1 = texture2D(groundMap1, coord);',
                'vec4 g2 = texture2D(groundMap2, coord);',
                'vec4 g3 = texture2D(groundMap3, coord);',
                'vec4 g4 = texture2D(groundMap4, coord);',
                'vec4 g5 = texture2D(groundMap5, coord);',
                'vec4 stone = texture2D(stoneMap, coord);',
                'final_color = mix(g1, g2, splat.r);',
                'final_color = mix(final_color, g3, splat.g);',
                'final_color = mix(final_color, g4, splat.b);',
                'final_color = mix(final_color, g5, splat.a);',
                'float slope = clamp(1.0 - dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
                'slope = smoothstep(0.15, 0.25, slope);',
                'final_color = mix(final_color, stone, slope);',
                '#ifdef LIGHTMAP',
                'final_color = final_color * texture2D(lightMap, mapcoord);',
                '#else',
                ShaderBuilder.light.fragment,
                '#endif',
                '#ifdef FOG',
                'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
                'final_color.rgb = mix(final_color.rgb, fogColor, d);',
                '#endif',
                'gl_FragColor = final_color;',
                '}'
            ].join('\n');
            __touch(1254);
        }
    };
    __touch(921);
    var upsampleShader = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            diffuseMap: 'MAIN_MAP',
            childMap: Shader.DIFFUSE_MAP,
            res: [
                1,
                1,
                1,
                1
            ]
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'varying vec2 texCoord0;',
            'void main(void) {',
            '\ttexCoord0 = vertexUV0;',
            '\tgl_Position = vec4(vertexPosition, 1.0);',
            '}'
        ].join('\n'),
        fshader: [
            'uniform sampler2D diffuseMap;',
            'uniform sampler2D childMap;',
            'uniform vec4 res;',
            'varying vec2 texCoord0;',
            'void main(void)',
            '{',
            '\tgl_FragColor = texture2D(diffuseMap, texCoord0);',
            '\tvec2 coordMod = mod(floor(texCoord0 * res.xy), 2.0);',
            '\tbvec2 test = equal(coordMod, vec2(0.0));',
            '\tif (all(test)) {',
            '\t\tgl_FragColor.g = texture2D(childMap, texCoord0).r;',
            '\t} else if (test.x) {',
            '\t\tgl_FragColor.g = (texture2D(childMap, texCoord0).r + texture2D(childMap, texCoord0 + vec2(0.0, res.w)).r) * 0.5;',
            '\t} else if (test.y) {',
            '\t\tgl_FragColor.g = (texture2D(childMap, texCoord0).r + texture2D(childMap, texCoord0 + vec2(res.z, 0.0)).r) * 0.5;',
            '\t} else {',
            '\t\tgl_FragColor.g = (texture2D(childMap, texCoord0).r + texture2D(childMap, texCoord0 + vec2(res.z, res.w)).r) * 0.5;',
            '\t}',
            '\tgl_FragColor.ba = vec2(0.0);',
            '}'
        ].join('\n')
    };
    __touch(922);
    var brushShader = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            opacity: 1,
            diffuseMap: Shader.DIFFUSE_MAP
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewProjectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec2 texCoord0;',
            'void main(void) {',
            '\ttexCoord0 = vertexUV0;',
            '\tgl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
            '}'
        ].join('\n'),
        fshader: [
            'uniform sampler2D diffuseMap;',
            'uniform float opacity;',
            'varying vec2 texCoord0;',
            'void main(void)',
            '{',
            '\tgl_FragColor = texture2D(diffuseMap, texCoord0);',
            '\tgl_FragColor.a *= opacity;',
            '}'
        ].join('\n')
    };
    __touch(923);
    var brushShader2 = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            opacity: 1,
            rgba: [
                1,
                1,
                1,
                1
            ],
            diffuseMap: Shader.DIFFUSE_MAP,
            splatMap: 'SPLAT_MAP'
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewProjectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec2 texCoord0;',
            'varying vec2 texCoord1;',
            'void main(void) {',
            '\tvec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
            '\tgl_Position = viewProjectionMatrix * worldPos;',
            '\ttexCoord0 = vertexUV0;',
            '\ttexCoord1 = worldPos.xy * 0.5 + 0.5;',
            '}'
        ].join('\n'),
        fshader: [
            'uniform sampler2D diffuseMap;',
            'uniform sampler2D splatMap;',
            'uniform vec4 rgba;',
            'uniform float opacity;',
            'varying vec2 texCoord0;',
            'varying vec2 texCoord1;',
            'void main(void)',
            '{',
            '\tvec4 splat = texture2D(splatMap, texCoord1);',
            '\tvec4 brush = texture2D(diffuseMap, texCoord0);',
            '\tvec4 final = mix(splat, rgba, opacity * length(brush.rgb) * brush.a);',
            '\tgl_FragColor = final;',
            '}'
        ].join('\n')
    };
    __touch(924);
    var brushShader3 = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            opacity: 1,
            size: 1 / 512,
            diffuseMap: Shader.DIFFUSE_MAP,
            heightMap: 'HEIGHT_MAP'
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewProjectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec2 texCoord0;',
            'varying vec2 texCoord1;',
            'void main(void) {',
            '\tvec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
            '\tgl_Position = viewProjectionMatrix * worldPos;',
            '\ttexCoord0 = vertexUV0;',
            '\ttexCoord1 = worldPos.xy * 0.5 + 0.5;',
            '}'
        ].join('\n'),
        fshader: [
            'uniform sampler2D diffuseMap;',
            'uniform sampler2D heightMap;',
            'uniform float opacity;',
            'uniform float size;',
            'varying vec2 texCoord0;',
            'varying vec2 texCoord1;',
            'void main(void)',
            '{',
            '\tfloat col1 = texture2D(heightMap, texCoord1 + vec2(-size, -size)).r;',
            '\tfloat col2 = texture2D(heightMap, texCoord1 + vec2(-size, size)).r;',
            '\tfloat col3 = texture2D(heightMap, texCoord1 + vec2(size, size)).r;',
            '\tfloat col4 = texture2D(heightMap, texCoord1 + vec2(size, -size)).r;',
            '\tfloat avg = (col1 + col2 + col3 + col4) * 0.25;',
            '\tgl_FragColor = texture2D(heightMap, texCoord1);',
            '\tvec4 brush = texture2D(diffuseMap, texCoord0);',
            '\tgl_FragColor.r = mix(gl_FragColor.r, avg, brush.r * brush.a * opacity);',
            '}'
        ].join('\n')
    };
    __touch(925);
    var brushShader4 = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            opacity: 1,
            height: 0,
            diffuseMap: Shader.DIFFUSE_MAP,
            heightMap: 'HEIGHT_MAP'
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewProjectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec2 texCoord0;',
            'varying vec2 texCoord1;',
            'void main(void) {',
            '\tvec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
            '\tgl_Position = viewProjectionMatrix * worldPos;',
            '\ttexCoord0 = vertexUV0;',
            '\ttexCoord1 = worldPos.xy * 0.5 + 0.5;',
            '}'
        ].join('\n'),
        fshader: [
            'uniform sampler2D diffuseMap;',
            'uniform sampler2D heightMap;',
            'uniform float opacity;',
            'uniform float height;',
            'varying vec2 texCoord0;',
            'varying vec2 texCoord1;',
            'void main(void)',
            '{',
            '\tgl_FragColor = texture2D(heightMap, texCoord1);',
            '\tvec4 brush = texture2D(diffuseMap, texCoord0);',
            '\tgl_FragColor.r = mix(gl_FragColor.r, height, brush.r * brush.a * opacity);',
            '}'
        ].join('\n')
    };
    __touch(926);
    var extractShader = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            diffuseMap: Shader.DIFFUSE_MAP
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewProjectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec2 texCoord0;',
            'void main(void) {',
            '\ttexCoord0 = vertexUV0;',
            '\tgl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
            '}'
        ].join('\n'),
        fshader: [
            'uniform sampler2D diffuseMap;',
            'varying vec2 texCoord0;',
            'float shift_right (float v, float amt) {',
            'v = floor(v) + 0.5;',
            'return floor(v / exp2(amt));',
            '}',
            'float shift_left (float v, float amt) {',
            'return floor(v * exp2(amt) + 0.5);',
            '}',
            'float mask_last (float v, float bits) {',
            'return mod(v, shift_left(1.0, bits));',
            '}',
            'float extract_bits (float num, float from, float to) {',
            'from = floor(from + 0.5); to = floor(to + 0.5);',
            'return mask_last(shift_right(num, from), to - from);',
            '}',
            'vec4 encode_float (float val) {',
            'if (val == 0.0) return vec4(0, 0, 0, 0);',
            'float sign = val > 0.0 ? 0.0 : 1.0;',
            'val = abs(val);',
            'float exponent = floor(log2(val));',
            'float biased_exponent = exponent + 127.0;',
            'float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;',
            'float t = biased_exponent / 2.0;',
            'float last_bit_of_biased_exponent = fract(t) * 2.0;',
            'float remaining_bits_of_biased_exponent = floor(t);',
            'float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;',
            'float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;',
            'float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;',
            'float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;',
            'return vec4(byte4, byte3, byte2, byte1);',
            '}',
            'void main(void)',
            '{',
            '\tgl_FragColor = encode_float(texture2D(diffuseMap, vec2(texCoord0.x, 1.0 - texCoord0.y)).r);',
            '}'
        ].join('\n')
    };
    __touch(927);
    var terrainPickingShader = {
        attributes: { vertexPosition: MeshData.POSITION },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            cameraFar: Shader.FAR_PLANE,
            cameraPosition: Shader.CAMERA,
            heightMap: 'HEIGHT_MAP',
            resolution: [
                255,
                1,
                1,
                1
            ],
            id: function (shaderInfo) {
                return shaderInfo.renderable.id + 1;
                __touch(1255);
            }
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'uniform sampler2D heightMap;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'uniform float cameraFar;',
            'uniform vec4 resolution;',
            'uniform vec3 cameraPosition;',
            'varying float depth;',
            'const vec2 alphaOffset = vec2(45.0);',
            'const vec2 oneOverWidth = vec2(1.0 / 16.0);',
            'void main(void) {',
            'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
            'vec2 coord = (worldPos.xz + vec2(0.5, 0.5)) / resolution.zw;',
            'vec4 heightCol = texture2D(heightMap, coord);',
            'float zf = heightCol.r;',
            'float zd = heightCol.g;',
            'vec2 alpha = clamp((abs(worldPos.xz - cameraPosition.xz) * resolution.y - alphaOffset) * oneOverWidth, vec2(0.0), vec2(1.0));',
            'alpha.x = max(alpha.x, alpha.y);',
            'float z = mix(zf, zd, alpha.x);',
            'worldPos.y = z * resolution.x;',
            'vec4 mvPosition = viewMatrix * worldPos;',
            'depth = -mvPosition.z / cameraFar;',
            'gl_Position = projectionMatrix * mvPosition;',
            '}'
        ].join('\n'),
        fshader: [
            'uniform float id;',
            'varying float depth;',
            ShaderFragment.methods.packDepth16,
            'void main() {',
            'vec2 packedId = vec2(floor(id/255.0), mod(id, 255.0)) * vec2(1.0/255.0);',
            'vec2 packedDepth = packDepth16(depth);',
            'gl_FragColor = vec4(packedId, packedDepth);',
            '}'
        ].join('\n')
    };
    __touch(928);
    var normalmapShader = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            heightMap: Shader.DIFFUSE_MAP,
            resolution: [
                512,
                512
            ],
            height: 0.05
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec2 vUv;',
            'void main() {',
            'vUv = vertexUV0;',
            'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );',
            '}'
        ].join('\n'),
        fshader: [
            'uniform float height;',
            'uniform vec2 resolution;',
            'uniform sampler2D heightMap;',
            'varying vec2 vUv;',
            'void main() {',
            'float val = texture2D(heightMap, vUv).x;',
            'float valU = texture2D(heightMap, vUv + vec2(1.0 / resolution.x, 0.0)).x;',
            'float valV = texture2D(heightMap, vUv + vec2(0.0, 1.0 / resolution.y)).x;',
            'vec3 normal = vec3(val - valU, val - valV, height);',
            'gl_FragColor = vec4((0.5 * normalize(normal) + 0.5), 1.0);',
            '}'
        ].join('\n')
    };
    __touch(929);
    return Terrain;
    __touch(930);
});
__touch(903);