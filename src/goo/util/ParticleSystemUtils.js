var ParticleComponent = require('goo/entities/components/ParticleComponent');
var MeshRendererComponent = require('goo/entities/components/MeshRendererComponent');
var MeshDataComponent = require('goo/entities/components/MeshDataComponent');
var Texture = require('goo/renderer/Texture');
var ParticleEmitter = require('goo/particles/ParticleEmitter');

	'use strict';

	/**
	 * Provides utility methods for particle systems
	 */
	function ParticleSystemUtils() {}

	/**
	 * Creates an Entity based on an object holding particle emitter parameters and a material
	 * @hidden
	 * @param world
	 * @param particleParameters
	 * @param material
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/misc/ParticleLib/ParticleLib-vtest.html Working example
	 * @returns {Entity}
	 */
	ParticleSystemUtils.createParticleSystemEntity = function (world, particleParameters, material) {
		// Create the particle cloud entity
		var particleSystemEntity = world.createEntity();

		// Set particle component
		var particleComponent = new ParticleComponent({
			particleCount: particleParameters.particleCount || 500
		});

		particleComponent.emitters.push(new ParticleEmitter(particleParameters));
		particleSystemEntity.setComponent(particleComponent);

		// Create meshData component using particle data
		var meshDataComponent = new MeshDataComponent(particleComponent.meshData);
		particleSystemEntity.setComponent(meshDataComponent);

		// Create meshRenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		meshRendererComponent.cullMode = 'Never';
		particleSystemEntity.setComponent(meshRendererComponent);

		return particleSystemEntity;
	};

	/**
	 * Generates a radial gradient with multiple color stops; useful for water simple fire, snowflakes, water ripples and shockwaves
	 * @param {number} [size=64]
	 * @param {Object} [options]
	 * @returns {Texture}
	 */
	ParticleSystemUtils.createFlareTexture = function (size, options) {
		size = size || 64;

		//! AT: this modifies the original options object which is intrusive and bad
		options = options || {};
		options.startRadius = typeof options.startRadius !== 'undefined' ? options.startRadius : 0;
		options.endRadius = typeof options.endRadius !== 'undefined' ? options.endRadius : size / 2;
		options.steps = options.steps || [{ fraction: 0, value: 1 }, { fraction: 1, value: 0 }];
		// options array of (fraction, alpha)

		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		var con2d = canvas.getContext('2d');

		var gradient = con2d.createRadialGradient(
			size / 2, size / 2, options.startRadius, size / 2, size / 2, options.endRadius);

		for (var i = 0; i < options.steps.length; i++) {
			var step = options.steps[i];
			gradient.addColorStop(step.fraction, 'rgba(255, 255, 255, ' + step.value + ')');
		}

		con2d.fillStyle = gradient;
		con2d.fillRect(0, 0, size, size);

		var imageData = con2d.getImageData(0, 0, size, size).data;
		imageData = new Uint8Array(imageData);

		var texture = new Texture(imageData, null, size, size);
		return texture;
	};

	/**
	 * Generates a texture of multiple trailing particles; useful for water splashes and sparks
	 * @param {number} [size=64]
	 * @param {Object} [options]
	 * @returns {Texture}
	 */
	ParticleSystemUtils.createSplashTexture = function (size, options) {
		size = size || 64;

		//! AT: this modifies the original options object which is intrusive and bad
		options = options || {};
		options.nTrails = typeof options.nTrails !== 'undefined' ? options.nTrails : 8;
		options.trailStartRadius = typeof options.trailStartRadius !== 'undefined' ? options.trailStartRadius : 1;
		options.trailEndRadius = typeof options.trailEndRadius !== 'undefined' ? options.trailEndRadius : 4;

		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		var con2d = canvas.getContext('2d');

		// ----
		function circle(x, y, r) {
			var grad = con2d.createRadialGradient(x, y, 0, x, y, r);
			grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
			grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
			con2d.fillStyle = grad;
			con2d.fillRect(x - r, y - r, 2 * r, 2 * r);
		}

		var nSteps = 30;
		function trail(sx, sy, ex, ey, sr, er) {
			var ax = (ex - sx) / nSteps;
			var ay = (ey - sy) / nSteps;
			var ar = (er - sr) / nSteps;
			for (var i = 0, x = sx, y = sy, r = sr; i < nSteps; i++, x += ax, y += ay, r += ar) {
				circle(x, y, r);
			}
		}

		function splash(x, y, minInnerRadius, maxOuterRadius, startTrailRadius, endTrailRadius, n) {
			for (var i = 0; i < n; i++) {
				var angle = Math.random() * Math.PI * 2;
				var innerRadius = Math.random() * 4 + minInnerRadius;
				var outerRadius = Math.random() * 4 - maxOuterRadius;
				trail(
					x + Math.cos(angle) * innerRadius,
					y + Math.sin(angle) * innerRadius,
					x + Math.cos(angle) * outerRadius,
					y + Math.sin(angle) * outerRadius,
					startTrailRadius,
					endTrailRadius
				);
			}
		}
		// ----

		splash(size / 2, size / 2, ((size / 2) / 10) * 1, ((size / 2) / 10) * 9, options.trailStartRadius, options.trailEndRadius, options.nTrails);

		var imageData = con2d.getImageData(0, 0, size, size).data;
		imageData = new Uint8Array(imageData);

		var texture = new Texture(imageData, null, size, size);
		return texture;
	};

	/**
	 * Generates a texture of random fuzzy dots; useful for dust and plankton
	 * @param {number} [size=64]
	 * @param {Object} [options]
	 * @returns {Texture}
	 */
	ParticleSystemUtils.createPlanktonTexture = function (size, options) {
		size = size || 64;

		//! AT: this modifies the original options object which is intrusive and bad
		options = options || {};
		options.nPoints = typeof options.nPoints !== 'undefined' ? options.nPoints : 10;
		options.minRadius = typeof options.minRadius !== 'undefined' ? options.minRadius : 2;
		options.maxRadius = typeof options.maxRadius !== 'undefined' ? options.maxRadius : 5;

		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		var con2d = canvas.getContext('2d');

		function circle(x, y, r) {
			var grad = con2d.createRadialGradient(x, y, 0, x, y, r);
			grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
			grad.addColorStop(0.3, 'rgba(255, 255, 255, 1)');
			grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
			con2d.fillStyle = grad;
			con2d.fillRect(x - r, y - r, 2 * r, 2 * r);
		}

		function soup(n) {
			for (var i = 0; i < n; i++) {
				var x = Math.random() * (size - options.maxRadius * 2) + options.maxRadius;
				var y = Math.random() * (size - options.maxRadius * 2) + options.maxRadius;
				circle(x, y, Math.random() * (options.maxRadius - options.minRadius) + options.minRadius);
			}
		}

		soup(options.nPoints);

		var imageData = con2d.getImageData(0, 0, size, size).data;
		imageData = new Uint8Array(imageData);

		var texture = new Texture(imageData, null, size, size);
		return texture;
	};

	/**
	 * Generates a texture of complex hexagonal snowflakes
	 * @param {number} [size=64]
	 * @param {Object} [options]
	 * @returns {Texture}
	 */
	ParticleSystemUtils.createSnowflakeTexture = function (size, options) {
		size = size || 64;

		//! AT: this modifies the original options object which is intrusive and bad
		// also, unused
		options = options || {};

		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		var con2d = canvas.getContext('2d');

		function replicateRotated(n, fun) {
			var ak = 2 * Math.PI / n;
			for (var i = 0; i < n; i++) {
				con2d.rotate(ak);
				fun();
			}
		}

		function subSnow1() {
			con2d.beginPath();
			con2d.moveTo(0, 0);
			con2d.lineTo(0, 90);

			for (var i = 0; i < 6; i++) {
				con2d.moveTo(0, 25 + i * 10); con2d.lineTo(16 - i * 1.5, 35 + i * 10);
				con2d.moveTo(0, 25 + i * 10); con2d.lineTo(-(16 - i * 1.5), 35 + i * 10);
			}

			con2d.stroke();
		}

		con2d.strokeStyle = '#FFF';
		con2d.lineWidth = 4;
		con2d.lineCap = 'round';

		con2d.translate(size / 2, size / 2);
		con2d.scale(size / 100 / 2, size / 100 / 2);
		replicateRotated(7, subSnow1);


		var imageData = con2d.getImageData(0, 0, size, size).data;
		imageData = new Uint8Array(imageData);

		var texture = new Texture(imageData, null, size, size);
		return texture;
	};

	module.exports = ParticleSystemUtils;