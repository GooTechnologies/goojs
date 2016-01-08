define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/particlepack/components/ParticleComponent',
	'goo/addons/particlepack/curves/LinearCurve',
	'goo/addons/particlepack/curves/ConstantCurve',
	'goo/addons/particlepack/curves/PolyCurve',
	'goo/addons/particlepack/curves/Vector3Curve',
	'goo/addons/particlepack/curves/Vector4Curve',
	'goo/util/rsvp',
	'goo/util/ObjectUtils',
	'goo/math/Vector3'
], function (
	ComponentHandler,
	ParticleComponent,
	LinearCurve,
	ConstantCurve,
	PolyCurve,
	Vector3Curve,
	Vector4Curve,
	RSVP,
	_,
	Vector3
) {
	'use strict';

	/**
	 * @extends ComponentHandler
	 * @hidden
	 */
	function ParticleComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'ParticleComponent';
	}

	ParticleComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ParticleComponentHandler.prototype.constructor = ParticleComponentHandler;
	ComponentHandler._registerClass('particle', ParticleComponentHandler);

	function constantCurve(value){
		return [{
			type: 'constant',
			offset: 0,
			options: {
				value: value
			}
		}];
	}

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {Object} config
	 * @returns {Object}
	 * @private
	 */
	ParticleComponentHandler.prototype._prepare = function (config) {
		return _.defaults(config, {
			seed: -1,
			shapeType: 'cone',
			sphereRadius: 1,
			sphereEmitFromShell: false,
			randomDirection: false,
			coneEmitFrom: 'base',
			boxExtents: [1, 1, 1],
			coneRadius: 1,
			coneAngle: 10,
			coneLength: 1,
			startColorR: constantCurve(1),
			startColorG: constantCurve(1),
			startColorB: constantCurve(1),
			startColorA: constantCurve(1),
			colorR: constantCurve(1),
			colorG: constantCurve(1),
			colorB: constantCurve(1),
			colorA: constantCurve(1),
			duration: 5,
			localSpace: true,
			startSpeed: constantCurve(5),
			localVelocityX: constantCurve(0),
			localVelocityY: constantCurve(0),
			localVelocityZ: constantCurve(0),
			worldVelocityX: constantCurve(0),
			worldVelocityY: constantCurve(0),
			worldVelocityZ: constantCurve(0),
			maxParticles: 100,
			emissionRate: constantCurve(10),
			startLifeTime: constantCurve(5),
			renderQueue: 3010,
			alphakill: 0,
			loop: false,
			blending: 'NoBlending',
			depthWrite: true,
			depthTest: true,
			textureTilesX: 1,
			textureTilesY: 1,
			textureAnimationSpeed: 1,
			startSize: constantCurve(1),
			sortMode: 'none',
			billboard: true,
			sizeCurve: constantCurve(1),
			startAngle: constantCurve(0),
			rotationSpeed: constantCurve(0),
			textureRef: null
		});
	};

	/**
	 * @returns {ParticleComponent} the created component object
	 * @private
	 */
	ParticleComponentHandler.prototype._create = function () {
		return new ParticleComponent();
	};

	/**
	 * @param {string} ref
	 */
	ParticleComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('ParticleComponent');
	};

	function createCurve(configs){
		var curve = new PolyCurve();

		for(var i=0; i<configs.length; i++){
			var config = configs[i];
			var options = config.options;
			switch(config.type){
			case 'linear':
				curve.addSegment(new LinearCurve({
					timeOffset: config.offset,
					k: options.k,
					m: options.m
				}));
				break;
			case 'constant':
				curve.addSegment(new ConstantCurve({
					timeOffset: config.offset,
					value: options.value
				}));
				break;
			}
		}

		return curve;
	}

	function createVec3Curve(configsX, configsY, configsZ){
		return new Vector3Curve({
			x: createCurve(configsX),
			y: createCurve(configsY),
			z: createCurve(configsZ)
		});
	}
	
	function createVec4Curve(configsX, configsY, configsZ, configsW){
		return new Vector4Curve({
			x: createCurve(configsX),
			y: createCurve(configsY),
			z: createCurve(configsZ),
			w: createCurve(configsW)
		});
	}

	/**
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	ParticleComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			component.seed = config.seed;
			component.shapeType = config.shapeType;
			component.sphereRadius = config.sphereRadius;
			component.sphereEmitFromShell = config.sphereEmitFromShell;
			component.randomDirection = config.randomDirection;
			component.coneEmitFrom = config.coneEmitFrom;
			component.setBoxExtents(new Vector3(config.boxExtents));
			component.coneRadius = config.coneRadius;
			component.coneAngle = config.coneAngle;
			component.coneLength = config.coneLength;
			component.startColor = createVec4Curve(config.startColorR, config.startColorG, config.startColorB, config.startColorA);
			component.color = createVec4Curve(config.colorR, config.colorG, config.colorB, config.colorA);
			component.duration = config.duration;
			component.localSpace = config.localSpace;
			component.startSpeed = createCurve(config.startSpeed);
			component.localVelocity = createVec3Curve(config.localVelocityX, config.localVelocityY, config.localVelocityZ);
			component.worldVelocity = createVec3Curve(config.worldVelocityX, config.worldVelocityY, config.worldVelocityZ);
			component.maxParticles = config.maxParticles;
			component.emissionRate = createCurve(config.emissionRate);
			component.startLifeTime = createCurve(config.startLifeTime);
			component.renderQueue = config.renderQueue;
			component.alphakill = config.alphakill;
			component.loop = config.loop;
			component.blending = config.blending;
			component.depthWrite = config.depthWrite;
			component.depthTest = config.depthTest;
			component.textureTilesX = config.textureTilesX;
			component.textureTilesY = config.textureTilesY;
			component.textureAnimationSpeed = config.textureAnimationSpeed;
			component.startSize = createCurve(config.startSize);
			component.sortMode = config.sortMode;
			component.billboard = config.billboard;
			component.sizeCurve = createCurve(config.sizeCurve);
			component.startAngle = createCurve(config.startAngle);
			component.rotationSpeed = createCurve(config.rotationSpeed);

			var promises = [];

			var textureRef = config.textureRef;
			if(textureRef){
				promises.push(that._load(textureRef, options).then(function (texture) {
					component.texture = texture;
					return component;
				}).then(null, function (err) {
					throw new Error('Error loading texture: ' + textureRef + ' - ' + err);
				}));
			} else {
				component.texture = null;
			}
			
			return RSVP.all(promises).then(function () {
				return component;
			});
		});
	};

	return ParticleComponentHandler;
});
