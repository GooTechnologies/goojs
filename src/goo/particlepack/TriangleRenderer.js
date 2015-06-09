define([
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Material',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator'
],
/** @lends */
function (
	MeshData,
	Shader,
	Material,
	MeshRendererComponent,
	Vector3,
	TextureCreator
) {
	"use strict";

	function TriangleRenderer() {
		this.settings = null;
		this.entity = null;
		this.meshData = null;

		this.pairs = [];
	}

	TriangleRenderer.calcVec1 = new Vector3();
	TriangleRenderer.calcVec2 = new Vector3();

	TriangleRenderer.prototype.init = function (goo, settings) {
		this.settings = settings;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR]);
		// attributeMap.DATA = MeshData.createAttribute(4, 'Float');
		attributeMap.OFFSET = MeshData.createAttribute(2, 'Float');
		var meshData = new MeshData(attributeMap, this.settings.poolCount * 3, this.settings.poolCount * 3);
		meshData.vertexData.setDataUsage('DynamicDraw');
		this.meshData = meshData;

		var material = new Material(particleShader);
		material.uniforms.alphakill = settings.alphakill.value;
		material.blendState.blending = settings.blending.value;
		material.cullState.enabled = false;

		material.depthState.write = false;
		material.renderQueue = 3010;
		var entity = this.entity = goo.world.createEntity(meshData);
		entity.set(new MeshRendererComponent(material));
		entity.name = 'TriangleRenderer';
		entity.meshRendererComponent.cullMode = 'Never';
		entity.addToWorld();

		entity.skip = true;
		var textureCreator = new TextureCreator();
		textureCreator.loadTexture2D(this.settings.textureUrl.value, {
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp'
		}).then(function (texture) {
			entity.skip = false;
			material.setTexture('PARTICLE_MAP', texture);
		}, function () {
			console.error('Error loading image.');
		});

		var offset = this.meshData.getAttributeBuffer('OFFSET');
		var indices = this.meshData.getIndexBuffer();
		// var col = this.meshData.getAttributeBuffer(MeshData.COLOR);

		// var color = this.settings.color.value;
		for (var i = 0; i < this.settings.poolCount; i++) {
			offset[6 * i + 0] = 0;
			offset[6 * i + 1] = 0;

			offset[6 * i + 2] = 0;
			offset[6 * i + 3] = 1;

			offset[6 * i + 4] = 1;
			offset[6 * i + 5] = 0;

			// col[3 * 4 * i + 0] = color[0];
			// col[3 * 4 * i + 1] = color[1];
			// col[3 * 4 * i + 2] = color[2];
			// col[3 * 4 * i + 3] = color[3];

			// col[3 * 4 * i + 4] = color[0];
			// col[3 * 4 * i + 5] = color[1];
			// col[3 * 4 * i + 6] = color[2];
			// col[3 * 4 * i + 7] = color[3];

			// col[3 * 4 * i + 8] = color[0];
			// col[3 * 4 * i + 9] = color[1];
			// col[3 * 4 * i + 10] = color[2];
			// col[3 * 4 * i + 11] = color[3];

			indices[3 * i + 0] = 3 * i + 0;
			indices[3 * i + 1] = 3 * i + 1;
			indices[3 * i + 2] = 3 * i + 2;
		}
	};

	TriangleRenderer.prototype.rebuild = function () {
		if (this.settings.textureUrl.valueLoaded) {
			this.entity.meshRendererComponent.materials[0].setTexture('PARTICLE_MAP', this.settings.textureUrl.valueLoaded);
		}
	};

	TriangleRenderer.prototype.remove = function () {
		this.entity.removeFromWorld();
	};

	TriangleRenderer.prototype.setVisible = function (visible) {
		this.entity.meshRendererComponent.hidden = !visible;
		this.entity.hidden = !visible;
	};

	TriangleRenderer.prototype.died = function (i, particle) {
		// var data = this.meshData.getAttributeBuffer('DATA');

		// for (var j = 0; j < 4; j++) {
		// 	data[(4 * 2 * i + 0) + 2 * j] = 0;
		// }
	};

	var vec = new Vector3();
	var pairingFunction = function (pairs, particles, dist) {
		var j, i, l;

		// var hash = {};
		// for (i = 0, l = particles.length; i < l; i++) {
		// 	var particle1 = particles[i];
			
		// 	var x = Math.floor(particle1.position.data[0] / dist);
		// 	var y = Math.floor(particle1.position.data[1] / dist);
		// 	var z = Math.floor(particle1.position.data[2] / dist);

		// 	var hashStr = x + '_' + y + '_' + z;

		// 	var list = hash[hashStr];
		// 	if (!list) {
		// 		list = [];
		// 		hash[hashStr] = list;
		// 	}
		// 	list.push(particle1);
		// }

		// for (i = 0, l = particles.length; i < l; i++) {
		// 	var particle1 = particles[i];
		// 	particle1.nr = 0;
		// 	particle1.connections = particle1.connections || [];
		// 	particle1.connections.length = 0;
		// }

		// var limit = 2;
		// for (i = 0, l = particles.length; i < l; i++) {
		// 	var particle1 = particles[i];

		// 	if (particle1.dead) {
		// 		continue;
		// 	}

		// 	if (particle1.nr >= limit) {
		// 		continue;
		// 	}

		// 	for (j = i+1, l = particles.length; j < l; j++) {
		// 		var particle2 = particles[j];

		// 		if (particle2.dead) {
		// 			continue;
		// 		}

		// 		if (particle1.nr >= limit || particle2.nr >= limit) {
		// 			continue;
		// 		}

		// 		var length = vec.setv(particle1.position).subv(particle2.position).lengthSquared();

		// 		if (length < dist) {
		// 			pairs.push(particle1);
		// 			pairs.push(particle2);

		// 			particle1.nr++;
		// 			particle2.nr++;

		// 			particle1.connections.push(particle2);
		// 			particle2.connections.push(particle1);
		// 		}
		// 	}
		// }

		// var tris = [];
		// for (i = 0, l = pairs.length-1; i < l; i+=2) {
		// 	var particle1 = pairs[i];
		// 	if (particle1.nr === 2) {
		// 		tris.push(particle1);
		// 		tris.push(particle1.connections[0]);
		// 		tris.push(particle1.connections[1]);
		// 	}
		// }

		var tris = [];
		for (i = 0, l = particles.length-1; i < l; i++) {
			var particle1 = particles[i];
			if (particle1.nr === 2) {
				tris.push(particle1);
				tris.push(particle1.connections[0]);
				tris.push(particle1.connections[1]);
			}
			if (particle1.nr === 3) {
				tris.push(particle1);
				tris.push(particle1.connections[1]);
				tris.push(particle1.connections[2]);
			}
			if (particle1.nr === 4) {
				tris.push(particle1);
				tris.push(particle1.connections[2]);
				tris.push(particle1.connections[3]);
			}
		}

		return tris;
	};

	TriangleRenderer.prototype.update = function (tpf, particles) {
		if (this.entity.hidden) {
			return;
		}

		var material = this.entity.meshRendererComponent.materials[0];
		material.uniforms.alphakill = this.settings.alphakill.value;
		material.blendState.blending = this.settings.blending.value;

		this.pairs.length = null;
		var tris = pairingFunction(this.pairs, particles, this.settings.distance.value);
		// document.getElementById('tristats').innerHTML = 'Tris: ' + (tris.length/3);

		var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);
		var col = this.meshData.getAttributeBuffer(MeshData.COLOR);

		var lastAlive = 0;
		var j, i, l;

		// var alpha = this.settings.color.value[3];
		for (i = 0, l = tris.length/3; i < l; i++) {
			for (j = 0; j < 3; j++) {
				var particle = tris[i*3+j];
				var posdata = particle.position.data;

				pos[(3 * (i*3+j) + 0)] = posdata[0];
				pos[(3 * (i*3+j) + 1)] = posdata[1];
				pos[(3 * (i*3+j) + 2)] = posdata[2];

				col[(4 * (i*3+j) + 0)] = particle.color[0];
				col[(4 * (i*3+j) + 1)] = particle.color[1];
				col[(4 * (i*3+j) + 2)] = particle.color[2];
				col[(4 * (i*3+j) + 3)] = particle.alpha;
				// col[(4 * (i*3+j) + 3)] = 1;
			}

			lastAlive = i + 1;
		}

		this.meshData.indexLengths = [lastAlive * 3];
		this.meshData.indexCount = lastAlive * 3;

		this.meshData.setVertexDataUpdated();
	};

	var particleShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexColor: MeshData.COLOR,
			vertexOffset: 'OFFSET',
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			particleMap: 'PARTICLE_MAP',
			cameraPosition: Shader.CAMERA,
			time: Shader.TIME,
			alphakill: 0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec4 vertexColor;',
			'attribute vec2 vertexOffset;',
			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',
			'uniform float time;',

			'varying vec4 color;',
			'varying vec2 coords;',

			'void main(void) {',
				'color = vertexColor;',
				
				'coords = vertexOffset;',

				// 'vec3 dir = vertexData.xyz;',
				// 'vec3 offset = cross(dir, cameraPosition - vertexPosition.xyz);',
				// 'offset = normalize(offset);',
				// 'vec3 pos = vertexPosition.xyz - offset * vertexOffset.y * vertexData.w * 0.1;',

				// 'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(pos, 1.0);',
				'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition.xyz, 1.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D particleMap;',
			'uniform float alphakill;',

			'varying vec4 color;',
			'varying vec2 coords;',

			'void main(void)',
			'{',
				// 'vec4 col = color * texture2D(particleMap, coords);',
				'vec4 col = color;',
				'if (col.a <= alphakill) discard;',
				'gl_FragColor = col;',
			'}'
		].join('\n')
	};

	return TriangleRenderer;
});