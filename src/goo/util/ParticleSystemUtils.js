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
		particleSystemEntity.setComponent(meshRendererComponent);

		return particleSystemEntity;
	};

	ParticleSystemUtils.createFlareTexture = function(size, options) {
		size = size || 64;

		options = options || {};
		options.startRadius = typeof options.startRadius !== 'undefined' ? options.startRadius : 0;
		options.endRadius = typeof options.endRadius !== 'undefined' ? options.endRadius : size / 2;

		var canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
		canvas.width = size;
		canvas.height = size;
		var con2d = canvas.getContext('2d');

		var gradient = con2d.createRadialGradient(size/2, size/2, options.startRadius, size/2, size/2, options.endRadius);
		gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
		gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

		con2d.fillStyle = gradient;
		con2d.fillRect(0, 0, size, size);;

		var imageData = con2d.getImageData(0, 0, size, size).data;
		imageData = new Uint8Array(imageData);

		var texture = new Texture(imageData, null, size, size);
		return texture;
	};

	return ParticleSystemUtils;
});