define([
    'goo/addons/terrainpack/Terrain',
    'goo/addons/terrainpack/Vegetation',
    'goo/addons/terrainpack/Forrest',
    'goo/math/Vector3',
    'goo/util/Ajax',
    'goo/math/Transform',
    'goo/math/MathUtils',
    'goo/renderer/Texture',
    'goo/renderer/TextureCreator',
    'goo/util/rsvp'
], function (Terrain, Vegetation, Forrest, Vector3, Ajax, Transform, MathUtils, Texture, TextureCreator, RSVP) {
    'use strict';
    __touch(1257);
    function TerrainHandler(goo, terrainSize, clipmapLevels, resourceFolder) {
        this.goo = goo;
        __touch(1276);
        this.terrainSize = terrainSize;
        __touch(1277);
        this.resourceFolder = resourceFolder;
        __touch(1278);
        this.terrain = new Terrain(goo, this.terrainSize, clipmapLevels);
        __touch(1279);
        this.vegetation = new Vegetation();
        __touch(1280);
        this.forrest = new Forrest();
        __touch(1281);
        this.hidden = false;
        __touch(1282);
        this.store = new Vector3();
        __touch(1283);
        this.settings = null;
        __touch(1284);
        this.pick = true;
        __touch(1285);
        this.draw = false;
        __touch(1286);
        this.eventX = 0;
        __touch(1287);
        this.eventY = 0;
        __touch(1288);
        this.vegetationSettings = { gridSize: 7 };
        __touch(1289);
    }
    __touch(1258);
    TerrainHandler.prototype.isEditing = function () {
        return !this.hidden;
        __touch(1290);
    };
    __touch(1259);
    TerrainHandler.prototype.getHeightAt = function (pos) {
        return this.terrainQuery ? this.terrainQuery.getHeightAt(pos) : 0;
        __touch(1291);
    };
    __touch(1260);
    var LMB = false;
    __touch(1261);
    var altKey = false;
    __touch(1262);
    var mousedown = function (e) {
        if (e.button === 0) {
            this.eventX = e.clientX;
            __touch(1292);
            this.eventY = e.clientY;
            __touch(1293);
            LMB = true;
            __touch(1294);
            altKey = e.altKey;
            __touch(1295);
            this.pick = true;
            __touch(1296);
            this.draw = true;
            __touch(1297);
            console.log('mousedown');
            __touch(1298);
        }
    };
    __touch(1263);
    var mouseup = function (e) {
        if (e.button === 0) {
            LMB = false;
            __touch(1299);
            this.draw = false;
            __touch(1300);
            console.log('mouseup');
            __touch(1301);
        }
    };
    __touch(1264);
    var mousemove = function (e) {
        this.eventX = e.clientX;
        __touch(1302);
        this.eventY = e.clientY;
        __touch(1303);
        this.pick = true;
        __touch(1304);
        if (LMB) {
            altKey = e.altKey;
            __touch(1305);
            this.draw = true;
            __touch(1306);
        }
    };
    __touch(1265);
    TerrainHandler.prototype.toggleEditMode = function () {
        this.terrain.toggleMarker();
        __touch(1307);
        this.hidden = !this.hidden;
        __touch(1308);
        if (this.hidden) {
            this.goo.renderer.domElement.addEventListener('mousedown', mousedown.bind(this), false);
            __touch(1311);
            this.goo.renderer.domElement.addEventListener('mouseup', mouseup.bind(this), false);
            __touch(1312);
            this.goo.renderer.domElement.addEventListener('mouseout', mouseup.bind(this), false);
            __touch(1313);
            this.goo.renderer.domElement.addEventListener('mousemove', mousemove.bind(this), false);
            __touch(1314);
        } else {
            this.goo.renderer.domElement.removeEventListener('mousedown', mousedown);
            __touch(1315);
            this.goo.renderer.domElement.removeEventListener('mouseup', mouseup);
            __touch(1316);
            this.goo.renderer.domElement.removeEventListener('mouseout', mouseup);
            __touch(1317);
            this.goo.renderer.domElement.removeEventListener('mousemove', mousemove);
            __touch(1318);
            this.terrainInfo = this.terrain.getTerrainData();
            __touch(1319);
            this.draw = false;
            __touch(1320);
            LMB = false;
            __touch(1321);
        }
        this.forrest.toggle();
        __touch(1309);
        this.vegetation.toggle();
        __touch(1310);
    };
    __touch(1266);
    TerrainHandler.prototype.initLevel = function (terrainData, settings, forrestLODEntityMap) {
        this.settings = settings;
        __touch(1322);
        var terrainSize = this.terrainSize;
        __touch(1323);
        var terrainPromise = this._loadData(terrainData.heightMap);
        __touch(1324);
        var splatPromise = this._loadData(terrainData.splatMap);
        __touch(1325);
        return RSVP.all([
            terrainPromise,
            splatPromise
        ]).then(function (datas) {
            var terrainBuffer = datas[0];
            __touch(1327);
            var splatBuffer = datas[1];
            __touch(1328);
            var terrainArray;
            __touch(1329);
            if (terrainBuffer) {
                terrainArray = new Float32Array(terrainBuffer);
                __touch(1332);
            } else {
                terrainArray = new Float32Array(terrainSize * terrainSize);
                __touch(1333);
            }
            var splatArray;
            __touch(1330);
            if (splatBuffer) {
                splatArray = new Uint8Array(splatBuffer);
                __touch(1334);
            } else {
                splatArray = new Uint8Array(terrainSize * terrainSize * 4 * 4);
                __touch(1335);
            }
            return this._load(terrainData, terrainArray, splatArray, forrestLODEntityMap);
            __touch(1331);
        }.bind(this));
        __touch(1326);
    };
    __touch(1267);
    TerrainHandler.prototype._loadData = function (url) {
        var promise = new RSVP.Promise();
        __touch(1336);
        var ajax = new Ajax();
        __touch(1337);
        ajax.get({
            url: this.resourceFolder + url,
            responseType: 'arraybuffer'
        }).then(function (request) {
            promise.resolve(request.response);
            __touch(1340);
        }.bind(this), function () {
            promise.resolve(null);
            __touch(1341);
        }.bind(this));
        __touch(1338);
        return promise;
        __touch(1339);
    };
    __touch(1268);
    TerrainHandler.prototype._textureLoad = function (url) {
        var promise = new RSVP.Promise();
        __touch(1342);
        new TextureCreator().loadTexture2D(url, { anisotropy: 4 }, function (texture) {
            promise.resolve(texture);
            __touch(1345);
        });
        __touch(1343);
        return promise;
        __touch(1344);
    };
    __touch(1269);
    TerrainHandler.prototype._load = function (terrainData, parentMipmap, splatMap, forrestLODEntityMap) {
        var promises = [];
        __touch(1346);
        promises.push(this._textureLoad(this.resourceFolder + terrainData.ground1.texture));
        __touch(1347);
        promises.push(this._textureLoad(this.resourceFolder + terrainData.ground2.texture));
        __touch(1348);
        promises.push(this._textureLoad(this.resourceFolder + terrainData.ground3.texture));
        __touch(1349);
        promises.push(this._textureLoad(this.resourceFolder + terrainData.ground4.texture));
        __touch(1350);
        promises.push(this._textureLoad(this.resourceFolder + terrainData.ground5.texture));
        __touch(1351);
        promises.push(this._textureLoad(this.resourceFolder + terrainData.stone.texture));
        __touch(1352);
        return RSVP.all(promises).then(function (textures) {
            this.terrain.init({
                heightMap: parentMipmap,
                splatMap: splatMap,
                ground1: textures[0],
                ground2: textures[1],
                ground3: textures[2],
                ground4: textures[3],
                ground5: textures[4],
                stone: textures[5]
            });
            __touch(1354);
            this.terrainInfo = this.terrain.getTerrainData();
            __touch(1355);
            var terrainSize = this.terrainSize;
            __touch(1356);
            var calcVec = new Vector3();
            __touch(1357);
            var terrainQuery = this.terrainQuery = {
                getHeightAt: function (pos) {
                    if (pos[0] < 0 || pos[0] > terrainSize - 1 || pos[2] < 0 || pos[2] > terrainSize - 1) {
                        return -1000;
                        __touch(1388);
                    }
                    var x = pos[0];
                    __touch(1372);
                    var z = terrainSize - pos[2];
                    __touch(1373);
                    var col = Math.floor(x);
                    __touch(1374);
                    var row = Math.floor(z);
                    __touch(1375);
                    var intOnX = x - col, intOnZ = z - row;
                    __touch(1376);
                    var col1 = col + 1;
                    __touch(1377);
                    var row1 = row + 1;
                    __touch(1378);
                    col = MathUtils.moduloPositive(col, terrainSize);
                    __touch(1379);
                    row = MathUtils.moduloPositive(row, terrainSize);
                    __touch(1380);
                    col1 = MathUtils.moduloPositive(col1, terrainSize);
                    __touch(1381);
                    row1 = MathUtils.moduloPositive(row1, terrainSize);
                    __touch(1382);
                    var topLeft = this.terrainInfo.heights[row * terrainSize + col];
                    __touch(1383);
                    var topRight = this.terrainInfo.heights[row * terrainSize + col1];
                    __touch(1384);
                    var bottomLeft = this.terrainInfo.heights[row1 * terrainSize + col];
                    __touch(1385);
                    var bottomRight = this.terrainInfo.heights[row1 * terrainSize + col1];
                    __touch(1386);
                    return MathUtils.lerp(intOnZ, MathUtils.lerp(intOnX, topLeft, topRight), MathUtils.lerp(intOnX, bottomLeft, bottomRight));
                    __touch(1387);
                }.bind(this),
                getNormalAt: function (pos) {
                    var x = pos[0];
                    __touch(1389);
                    var z = terrainSize - pos[2];
                    __touch(1390);
                    var col = Math.floor(x);
                    __touch(1391);
                    var row = Math.floor(z);
                    __touch(1392);
                    var col1 = col + 1;
                    __touch(1393);
                    var row1 = row + 1;
                    __touch(1394);
                    col = MathUtils.moduloPositive(col, terrainSize);
                    __touch(1395);
                    row = MathUtils.moduloPositive(row, terrainSize);
                    __touch(1396);
                    col1 = MathUtils.moduloPositive(col1, terrainSize);
                    __touch(1397);
                    row1 = MathUtils.moduloPositive(row1, terrainSize);
                    __touch(1398);
                    var topLeft = this.terrainInfo.heights[row * terrainSize + col];
                    __touch(1399);
                    var topRight = this.terrainInfo.heights[row * terrainSize + col1];
                    __touch(1400);
                    var bottomLeft = this.terrainInfo.heights[row1 * terrainSize + col];
                    __touch(1401);
                    return calcVec.setd(topLeft - topRight, 1, bottomLeft - topLeft).normalize();
                    __touch(1402);
                }.bind(this),
                getVegetationType: function (xx, zz, slope) {
                    var rand = Math.random();
                    __touch(1403);
                    if (MathUtils.smoothstep(0.82, 0.91, slope) < rand) {
                        return null;
                        __touch(1405);
                    }
                    if (this.terrainInfo) {
                        xx = Math.floor(xx);
                        __touch(1406);
                        zz = Math.floor(zz);
                        __touch(1407);
                        if (xx < 0 || xx > terrainSize - 1 || zz < 0 || zz > terrainSize - 1) {
                            return null;
                            __touch(1419);
                        }
                        xx *= this.terrain.splatMult;
                        __touch(1408);
                        zz *= this.terrain.splatMult;
                        __touch(1409);
                        var index = (zz * terrainSize * this.terrain.splatMult + xx) * 4;
                        __touch(1410);
                        var splat1 = this.terrainInfo.splat[index + 0] / 255;
                        __touch(1411);
                        var splat2 = this.terrainInfo.splat[index + 1] / 255;
                        __touch(1412);
                        var splat3 = this.terrainInfo.splat[index + 2] / 255;
                        __touch(1413);
                        var splat4 = this.terrainInfo.splat[index + 3] / 255;
                        __touch(1414);
                        var type = splat1 > rand ? terrainData.ground2 : splat2 > rand ? terrainData.ground3 : splat3 > rand ? terrainData.ground4 : splat4 > rand ? terrainData.ground5 : terrainData.ground1;
                        __touch(1415);
                        var test = 0;
                        __touch(1416);
                        for (var veg in type.vegetation) {
                            test += type.vegetation[veg];
                            __touch(1420);
                            if (rand < test) {
                                return veg;
                                __touch(1421);
                            }
                        }
                        __touch(1417);
                        return null;
                        __touch(1418);
                    }
                    return null;
                    __touch(1404);
                }.bind(this),
                getForrestType: function (xx, zz, slope, rand) {
                    if (MathUtils.smoothstep(0.8, 0.88, slope) < rand) {
                        return null;
                        __touch(1423);
                    }
                    if (this.terrainInfo) {
                        xx = Math.floor(xx);
                        __touch(1424);
                        zz = Math.floor(zz);
                        __touch(1425);
                        if (xx < 0 || xx > terrainSize - 1 || zz < 0 || zz > terrainSize - 1) {
                            return null;
                            __touch(1437);
                        }
                        xx *= this.terrain.splatMult;
                        __touch(1426);
                        zz *= this.terrain.splatMult;
                        __touch(1427);
                        var index = (zz * terrainSize * this.terrain.splatMult + xx) * 4;
                        __touch(1428);
                        var splat1 = this.terrainInfo.splat[index + 0] / 255;
                        __touch(1429);
                        var splat2 = this.terrainInfo.splat[index + 1] / 255;
                        __touch(1430);
                        var splat3 = this.terrainInfo.splat[index + 2] / 255;
                        __touch(1431);
                        var splat4 = this.terrainInfo.splat[index + 3] / 255;
                        __touch(1432);
                        var type = splat1 > rand ? terrainData.ground2 : splat2 > rand ? terrainData.ground3 : splat3 > rand ? terrainData.ground4 : splat4 > rand ? terrainData.ground5 : terrainData.ground1;
                        __touch(1433);
                        var test = 0;
                        __touch(1434);
                        for (var veg in type.forrest) {
                            test += type.forrest[veg];
                            __touch(1438);
                            if (rand < test) {
                                return veg;
                                __touch(1439);
                            }
                        }
                        __touch(1435);
                        return null;
                        __touch(1436);
                    }
                    return null;
                    __touch(1422);
                }.bind(this),
                getLightAt: function (pos) {
                    if (pos[0] < 0 || pos[0] > terrainSize - 1 || pos[2] < 0 || pos[2] > terrainSize - 1) {
                        return -1000;
                        __touch(1457);
                    }
                    if (!this.lightMapData || !this.lightMapSize) {
                        return 1;
                        __touch(1458);
                    }
                    var x = pos[0] * this.lightMapSize / terrainSize;
                    __touch(1440);
                    var z = (terrainSize - pos[2]) * this.lightMapSize / terrainSize;
                    __touch(1441);
                    var col = Math.floor(x);
                    __touch(1442);
                    var row = Math.floor(z);
                    __touch(1443);
                    var intOnX = x - col;
                    __touch(1444);
                    var intOnZ = z - row;
                    __touch(1445);
                    var col1 = col + 1;
                    __touch(1446);
                    var row1 = row + 1;
                    __touch(1447);
                    col = MathUtils.moduloPositive(col, this.lightMapSize);
                    __touch(1448);
                    row = MathUtils.moduloPositive(row, this.lightMapSize);
                    __touch(1449);
                    col1 = MathUtils.moduloPositive(col1, this.lightMapSize);
                    __touch(1450);
                    row1 = MathUtils.moduloPositive(row1, this.lightMapSize);
                    __touch(1451);
                    var topLeft = this.lightMapData[row * this.lightMapSize + col];
                    __touch(1452);
                    var topRight = this.lightMapData[row * this.lightMapSize + col1];
                    __touch(1453);
                    var bottomLeft = this.lightMapData[row1 * this.lightMapSize + col];
                    __touch(1454);
                    var bottomRight = this.lightMapData[row1 * this.lightMapSize + col1];
                    __touch(1455);
                    return MathUtils.lerp(intOnZ, MathUtils.lerp(intOnX, topLeft, topRight), MathUtils.lerp(intOnX, bottomLeft, bottomRight)) / 255;
                    __touch(1456);
                }.bind(this),
                getType: function (xx, zz, slope, rand) {
                    if (MathUtils.smoothstep(0.8, 0.88, slope) < rand) {
                        return terrainData.stone;
                        __touch(1460);
                    }
                    if (this.terrainInfo) {
                        xx = Math.floor(xx);
                        __touch(1461);
                        zz = Math.floor(zz);
                        __touch(1462);
                        if (xx < 0 || xx > terrainSize - 1 || zz < 0 || zz > terrainSize - 1) {
                            return terrainData.stone;
                            __touch(1472);
                        }
                        xx *= this.terrain.splatMult;
                        __touch(1463);
                        zz *= this.terrain.splatMult;
                        __touch(1464);
                        var index = (zz * terrainSize * this.terrain.splatMult + xx) * 4;
                        __touch(1465);
                        var splat1 = this.terrainInfo.splat[index + 0] / 255;
                        __touch(1466);
                        var splat2 = this.terrainInfo.splat[index + 1] / 255;
                        __touch(1467);
                        var splat3 = this.terrainInfo.splat[index + 2] / 255;
                        __touch(1468);
                        var splat4 = this.terrainInfo.splat[index + 3] / 255;
                        __touch(1469);
                        var type = splat1 > rand ? terrainData.ground2 : splat2 > rand ? terrainData.ground3 : splat3 > rand ? terrainData.ground4 : splat4 > rand ? terrainData.ground5 : terrainData.ground1;
                        __touch(1470);
                        return type;
                        __touch(1471);
                    }
                    return terrainData.stone;
                    __touch(1459);
                }.bind(this)
            };
            __touch(1358);
            var texturesPromise = new RSVP.Promise();
            __touch(1359);
            var loadCount = 3;
            __touch(1360);
            var onLoaded = function () {
                if (!--loadCount) {
                    texturesPromise.resolve();
                    __touch(1473);
                }
            };
            __touch(1361);
            var vegetationAtlasTexture = new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.vegetationAtlas, {}, onLoaded);
            __touch(1362);
            vegetationAtlasTexture.anisotropy = 4;
            __touch(1363);
            var vegetationTypes = terrainData.vegetationTypes;
            __touch(1364);
            var forrestAtlasTexture = new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.forrestAtlas, {}, onLoaded);
            __touch(1365);
            forrestAtlasTexture.anisotropy = 4;
            __touch(1366);
            var forrestAtlasNormals = new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.forrestAtlasNormals, {}, onLoaded);
            __touch(1367);
            var forrestTypes = terrainData.forrestTypes;
            __touch(1368);
            this.vegetation.init(this.goo.world, terrainQuery, vegetationAtlasTexture, vegetationTypes, this.vegetationSettings);
            __touch(1369);
            this.forrest.init(this.goo.world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, forrestTypes, forrestLODEntityMap);
            __touch(1370);
            return texturesPromise;
            __touch(1371);
        }.bind(this));
        __touch(1353);
    };
    __touch(1270);
    TerrainHandler.prototype.updatePhysics = function () {
        this.terrain.updateAmmoBody();
        __touch(1474);
    };
    __touch(1271);
    TerrainHandler.prototype.initPhysics = function () {
        this.ammoBody = this.terrain.initAmmoBody();
        __touch(1475);
    };
    __touch(1272);
    TerrainHandler.prototype.useLightmap = function (data, size) {
        if (data) {
            var lightMap = new Texture(data, {
                magFilter: 'Bilinear',
                minFilter: 'NearestNeighborNoMipMaps',
                wrapS: 'EdgeClamp',
                wrapT: 'EdgeClamp',
                generateMipmaps: false,
                format: 'Luminance',
                type: 'UnsignedByte'
            }, size, size);
            __touch(1476);
            this.lightMapData = data;
            __touch(1477);
            this.lightMapSize = size;
            __touch(1478);
            this.terrain.setLightmapTexture(lightMap);
            __touch(1479);
        } else {
            delete this.lightMapData;
            __touch(1480);
            delete this.lightMapSize;
            __touch(1481);
            this.terrain.setLightmapTexture();
            __touch(1482);
        }
    };
    __touch(1273);
    TerrainHandler.prototype.update = function (cameraEntity) {
        var pos = cameraEntity.cameraComponent.camera.translation;
        __touch(1483);
        if (this.terrain) {
            var settings = this.settings;
            __touch(1484);
            if (this.hidden && this.pick) {
                this.terrain.pick(cameraEntity.cameraComponent.camera, this.eventX, this.eventY, this.store);
                __touch(1486);
                this.terrain.setMarker('add', settings.size, this.store.x, this.store.z, settings.power, settings.brushTexture);
                __touch(1487);
                this.pick = false;
                __touch(1488);
            }
            if (this.hidden && this.draw) {
                var type = 'add';
                __touch(1489);
                if (altKey) {
                    type = 'sub';
                    __touch(1493);
                }
                var rgba = [
                    0,
                    0,
                    0,
                    0
                ];
                __touch(1490);
                if (settings.rgba === 'ground2') {
                    rgba = [
                        1,
                        0,
                        0,
                        0
                    ];
                    __touch(1494);
                } else if (settings.rgba === 'ground3') {
                    rgba = [
                        0,
                        1,
                        0,
                        0
                    ];
                    __touch(1495);
                } else if (settings.rgba === 'ground4') {
                    rgba = [
                        0,
                        0,
                        1,
                        0
                    ];
                    __touch(1496);
                } else if (settings.rgba === 'ground5') {
                    rgba = [
                        0,
                        0,
                        0,
                        1
                    ];
                    __touch(1497);
                }
                this.terrain.draw(settings.mode, type, settings.size, this.store.x, this.store.y, this.store.z, settings.power * this.goo.world.tpf * 60 / 100, settings.brushTexture, rgba);
                __touch(1491);
                this.terrain.updateTextures();
                __touch(1492);
            }
            this.terrain.update(pos);
            __touch(1485);
        }
        if (this.vegetation) {
            this.vegetation.update(pos.x, pos.z);
            __touch(1498);
        }
        if (this.forrest) {
            this.forrest.update(pos.x, pos.z);
            __touch(1499);
        }
    };
    __touch(1274);
    return TerrainHandler;
    __touch(1275);
});
__touch(1256);