define([
    'goo/entities/components/ParticleComponent',
    'goo/entities/components/MeshRendererComponent',
    'goo/entities/components/MeshDataComponent',
    'goo/renderer/Texture',
    'goo/particles/ParticleEmitter'
], function (ParticleComponent, MeshRendererComponent, MeshDataComponent, Texture, ParticleEmitter) {
    'use strict';
    __touch(22037);
    function ParticleSystemUtils() {
    }
    __touch(22038);
    ParticleSystemUtils.createParticleSystemEntity = function (world, particleParameters, material) {
        var particleSystemEntity = world.createEntity();
        __touch(22045);
        var particleComponent = new ParticleComponent({ particleCount: particleParameters.particleCount || 500 });
        __touch(22046);
        particleComponent.emitters.push(new ParticleEmitter(particleParameters));
        __touch(22047);
        particleSystemEntity.setComponent(particleComponent);
        __touch(22048);
        var meshDataComponent = new MeshDataComponent(particleComponent.meshData);
        __touch(22049);
        particleSystemEntity.setComponent(meshDataComponent);
        __touch(22050);
        var meshRendererComponent = new MeshRendererComponent();
        __touch(22051);
        meshRendererComponent.materials.push(material);
        __touch(22052);
        meshRendererComponent.cullMode = 'Never';
        __touch(22053);
        particleSystemEntity.setComponent(meshRendererComponent);
        __touch(22054);
        return particleSystemEntity;
        __touch(22055);
    };
    __touch(22039);
    ParticleSystemUtils.createFlareTexture = function (size, options) {
        size = size || 64;
        __touch(22056);
        options = options || {};
        __touch(22057);
        options.startRadius = typeof options.startRadius !== 'undefined' ? options.startRadius : 0;
        __touch(22058);
        options.endRadius = typeof options.endRadius !== 'undefined' ? options.endRadius : size / 2;
        __touch(22059);
        options.steps = options.steps || [
            {
                fraction: 0,
                value: 1
            },
            {
                fraction: 1,
                value: 0
            }
        ];
        __touch(22060);
        var canvas = document.createElement('canvas');
        __touch(22061);
        canvas.width = size;
        __touch(22062);
        canvas.height = size;
        __touch(22063);
        var con2d = canvas.getContext('2d');
        __touch(22064);
        var gradient = con2d.createRadialGradient(size / 2, size / 2, options.startRadius, size / 2, size / 2, options.endRadius);
        __touch(22065);
        for (var i = 0; i < options.steps.length; i++) {
            var step = options.steps[i];
            __touch(22072);
            gradient.addColorStop(step.fraction, 'rgba(255, 255, 255, ' + step.value + ')');
            __touch(22073);
        }
        con2d.fillStyle = gradient;
        __touch(22066);
        con2d.fillRect(0, 0, size, size);
        __touch(22067);
        var imageData = con2d.getImageData(0, 0, size, size).data;
        __touch(22068);
        imageData = new Uint8Array(imageData);
        __touch(22069);
        var texture = new Texture(imageData, null, size, size);
        __touch(22070);
        return texture;
        __touch(22071);
    };
    __touch(22040);
    ParticleSystemUtils.createSplashTexture = function (size, options) {
        size = size || 64;
        __touch(22074);
        options = options || {};
        __touch(22075);
        options.nTrails = typeof options.nTrails !== 'undefined' ? options.nTrails : 8;
        __touch(22076);
        options.trailStartRadius = typeof options.trailStartRadius !== 'undefined' ? options.trailStartRadius : 1;
        __touch(22077);
        options.trailEndRadius = typeof options.trailEndRadius !== 'undefined' ? options.trailEndRadius : 4;
        __touch(22078);
        var canvas = document.createElement('canvas');
        __touch(22079);
        canvas.width = size;
        __touch(22080);
        canvas.height = size;
        __touch(22081);
        var con2d = canvas.getContext('2d');
        __touch(22082);
        function circle(x, y, r) {
            var grad = con2d.createRadialGradient(x, y, 0, x, y, r);
            __touch(22092);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            __touch(22093);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            __touch(22094);
            con2d.fillStyle = grad;
            __touch(22095);
            con2d.fillRect(x - r, y - r, 2 * r, 2 * r);
            __touch(22096);
        }
        __touch(22083);
        var nSteps = 30;
        __touch(22084);
        function trail(sx, sy, ex, ey, sr, er) {
            var ax = (ex - sx) / nSteps;
            __touch(22097);
            var ay = (ey - sy) / nSteps;
            __touch(22098);
            var ar = (er - sr) / nSteps;
            __touch(22099);
            for (var i = 0, x = sx, y = sy, r = sr; i < nSteps; i++, x += ax, y += ay, r += ar) {
                circle(x, y, r);
                __touch(22100);
            }
        }
        __touch(22085);
        function splash(x, y, minInnerRadius, maxOuterRadius, startTrailRadius, endTrailRadius, n) {
            for (var i = 0; i < n; i++) {
                var angle = Math.random() * Math.PI * 2;
                __touch(22101);
                var innerRadius = Math.random() * 4 + minInnerRadius;
                __touch(22102);
                var outerRadius = Math.random() * 4 - maxOuterRadius;
                __touch(22103);
                trail(x + Math.cos(angle) * innerRadius, y + Math.sin(angle) * innerRadius, x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius, startTrailRadius, endTrailRadius);
                __touch(22104);
            }
        }
        __touch(22086);
        splash(size / 2, size / 2, size / 2 / 10 * 1, size / 2 / 10 * 9, options.trailStartRadius, options.trailEndRadius, options.nTrails);
        __touch(22087);
        var imageData = con2d.getImageData(0, 0, size, size).data;
        __touch(22088);
        imageData = new Uint8Array(imageData);
        __touch(22089);
        var texture = new Texture(imageData, null, size, size);
        __touch(22090);
        return texture;
        __touch(22091);
    };
    __touch(22041);
    ParticleSystemUtils.createPlanktonTexture = function (size, options) {
        size = size || 64;
        __touch(22105);
        options = options || {};
        __touch(22106);
        options.nPoints = typeof options.nPoints !== 'undefined' ? options.nPoints : 10;
        __touch(22107);
        options.minRadius = typeof options.minRadius !== 'undefined' ? options.minRadius : 2;
        __touch(22108);
        options.maxRadius = typeof options.maxRadius !== 'undefined' ? options.maxRadius : 5;
        __touch(22109);
        var canvas = document.createElement('canvas');
        __touch(22110);
        canvas.width = size;
        __touch(22111);
        canvas.height = size;
        __touch(22112);
        var con2d = canvas.getContext('2d');
        __touch(22113);
        function circle(x, y, r) {
            var grad = con2d.createRadialGradient(x, y, 0, x, y, r);
            __touch(22121);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            __touch(22122);
            grad.addColorStop(0.3, 'rgba(255, 255, 255, 1)');
            __touch(22123);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            __touch(22124);
            con2d.fillStyle = grad;
            __touch(22125);
            con2d.fillRect(x - r, y - r, 2 * r, 2 * r);
            __touch(22126);
        }
        __touch(22114);
        function soup(n) {
            for (var i = 0; i < n; i++) {
                var x = Math.random() * (size - options.maxRadius * 2) + options.maxRadius;
                __touch(22127);
                var y = Math.random() * (size - options.maxRadius * 2) + options.maxRadius;
                __touch(22128);
                circle(x, y, Math.random() * (options.maxRadius - options.minRadius) + options.minRadius);
                __touch(22129);
            }
        }
        __touch(22115);
        soup(options.nPoints);
        __touch(22116);
        var imageData = con2d.getImageData(0, 0, size, size).data;
        __touch(22117);
        imageData = new Uint8Array(imageData);
        __touch(22118);
        var texture = new Texture(imageData, null, size, size);
        __touch(22119);
        return texture;
        __touch(22120);
    };
    __touch(22042);
    ParticleSystemUtils.createSnowflakeTexture = function (size, options) {
        size = size || 64;
        __touch(22130);
        options = options || {};
        __touch(22131);
        var canvas = document.createElement('canvas');
        __touch(22132);
        canvas.width = size;
        __touch(22133);
        canvas.height = size;
        __touch(22134);
        var con2d = canvas.getContext('2d');
        __touch(22135);
        function replicateRotated(n, fun) {
            var ak = 2 * Math.PI / n;
            __touch(22148);
            for (var i = 0; i < n; i++) {
                con2d.rotate(ak);
                __touch(22149);
                fun();
                __touch(22150);
            }
        }
        __touch(22136);
        function subSnow1() {
            con2d.beginPath();
            __touch(22151);
            con2d.moveTo(0, 0);
            __touch(22152);
            con2d.lineTo(0, 90);
            __touch(22153);
            for (var i = 0; i < 6; i++) {
                con2d.moveTo(0, 25 + i * 10);
                __touch(22155);
                con2d.lineTo(16 - i * 1.5, 35 + i * 10);
                __touch(22156);
                con2d.moveTo(0, 25 + i * 10);
                __touch(22157);
                con2d.lineTo(-(16 - i * 1.5), 35 + i * 10);
                __touch(22158);
            }
            con2d.stroke();
            __touch(22154);
        }
        __touch(22137);
        con2d.strokeStyle = '#FFF';
        __touch(22138);
        con2d.lineWidth = 4;
        __touch(22139);
        con2d.lineCap = 'round';
        __touch(22140);
        con2d.translate(size / 2, size / 2);
        __touch(22141);
        con2d.scale(size / 100 / 2, size / 100 / 2);
        __touch(22142);
        replicateRotated(7, subSnow1);
        __touch(22143);
        var imageData = con2d.getImageData(0, 0, size, size).data;
        __touch(22144);
        imageData = new Uint8Array(imageData);
        __touch(22145);
        var texture = new Texture(imageData, null, size, size);
        __touch(22146);
        return texture;
        __touch(22147);
    };
    __touch(22043);
    return ParticleSystemUtils;
    __touch(22044);
});
__touch(22036);