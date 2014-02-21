define([
	'goo/util/ObjectUtil'
], function(
	_
) {
	'use strict';

	return {
		entity: function(components) {
			components = components || ['transform'];
			var entity = this.gooObject('entity', 'Dummy');
			entity.components = {};
			for (var i = 0; i < components.length; i++) {
				entity.components[components[i]] = this.component[components[i]]();
			}
			this.addToBundle(entity);
			return entity;
		},
		component: {
			transform: function(translation, rotation, scale) {
				translation = (translation) ? translation.slice() : [0,0,0];
				rotation = (rotation) ? rotation.slice() : [0,0,0];
				scale = (scale) ? scale.slice() : [1,1,1];

				return {
					translation: translation,
					rotation: rotation,
					scale: scale
				};
			},
			camera: function(aspect, lockedRatio, far, fov, near) {
				return {
					aspect: aspect || 1,
					lockedRatio: !!lockedRatio,
					far: far || 1000,
					fov: fov || 45,
					near: near || 1
				};
			},
			light: function(type, options) {
				var config = _.defaults({}, options, {
					type: type || 'PointLight',
					color: [1,1,1],
					intensity: 1,
					shadowCaster: false,
					specularIntensity: 1
				});
				if (type !== 'DirectionalLight') {
					config.range = config.range || 1000;
				}
				if (type === 'SpotLight') {
					config.angle = config.angle || 55;
				}
				if (config.shadowCaster) {
					config.shadowSettings = config.shadowSettings || {};
					_.defaults(config.shadowSettings, {
						type: 'Blur',
						projection: (config.type === 'DirectionalLight') ? 'Parallel' : 'Perspective',
						near: 1,
						far: 1000,
						resolution: [512, 512],
						upVector: [0,1,0],
						darkness: 0.5
					});
				}
				return config;
			},
			animation: function() {
				var config = {
					layersRef: this.animation().id,
					poseRef: this.skeleton().id
				};
				return config;
			},
			meshRenderer: function() {
				var config = {
					cullMode: 'Dynamic',
					castShadows: true,
					receiveShadow: true,
					reflectable: true,
					materials: {}
				};
				for (var i = 2; i >= 0; i--) {
					config.materials[this.randomRef()] = {
						sortValue: Math.random(),
						materialRef: this.material().id
					};
				}
				return config;
			},
			meshData: function(shape, options) {
				if (shape) {
					return {
						shape: shape,
						shadeOptions: options
					};
				}
				return {
					meshRef: this.mesh().id,
					poseRef: this.skeleton().id
				};
			}
		},
		attachChild: function(parent, child) {
			if (!parent.components.transform.childRefs) {
				parent.components.transform.childRefs = {};
			}
			var key = this.randomRef();
			parent.components.transform.childRefs[key] = child.id;
		}
	};
});