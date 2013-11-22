define([
	'goo/entities/components/ParticleComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/renderer/Texture',
	'goo/particles/ParticleEmitter'
	],
	/** @lends */
	function (
		ParticleComponent,
		MeshRendererComponent,
		MeshDataComponent,
		Texture,
		ParticleEmitter
	) {
	'use strict';

	function ParticleSystemUtils() {
	}

	ParticleSystemUtils.createParticleSystemEntity = function(goo, particleParameters, material) {
		// Create the particle cloud entity
		var particleSystemEntity = goo.world.createEntity();

		// Set particle component
		var particleComponent = new ParticleComponent({
			particleCount : 500
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

	ParticleSystemUtils.createFlareTexture = function(size, options) {
		size = size || 64;

		options = options || {};
		options.startRadius = typeof options.startRadius !== 'undefined' ? options.startRadius : 0;
		options.endRadius = typeof options.endRadius !== 'undefined' ? options.endRadius : size / 2;
		options.steps = options.steps || [{ fraction: 0, value: 1 }, { fraction: 1, value: 0 }];
		// options array of (fraction, alpha)

		var canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
		canvas.width = size;
		canvas.height = size;
		var con2d = canvas.getContext('2d');

		var gradient = con2d.createRadialGradient(size/2, size/2, options.startRadius, size/2, size/2, options.endRadius);

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

	ParticleSystemUtils.createSplashTexture = function(size, options) {
		size = size || 64;

		options = options || {};
		options.nTrails = typeof options.nTrails !== 'undefined' ? options.nTrails : 8;
		options.trailStartRadius = typeof options.trailStartRadius !== 'undefined' ? options.trailStartRadius : 1;
		options.trailEndRadius = typeof options.trailEndRadius !== 'undefined' ? options.trailEndRadius : 4;

		var canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
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
			for (var i = 0, x = sx, y = sy, r = sr; i < nSteps; i++, x+=ax, y+=ay, r+=ar) {
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

		splash(size/2, size/2, ((size/2)/10)*1, ((size/2)/10)*9, options.trailStartRadius, options.trailEndRadius, options.nTrails);

		var imageData = con2d.getImageData(0, 0, size, size).data;
		imageData = new Uint8Array(imageData);

		var texture = new Texture(imageData, null, size, size);
		return texture;
	};

	ParticleSystemUtils.createPlanktonTexture = function(size, options) {
		size = size || 64;
		console.log(size);
		options = options || {};
		options.nPoints = typeof options.nPoints !== 'undefined' ? options.nPoints : 10;
		options.minRadius = typeof options.minRadius !== 'undefined' ? options.minRadius : 2;
		options.maxRadius = typeof options.maxRadius !== 'undefined' ? options.maxRadius : 5;

		var canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
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

	return ParticleSystemUtils;
});