define([
	'goo/math/Vector3',
	'goo/math/Vector4'
],

function (
	Vector3,
	Vector4
) {
	"use strict";

	var calcVec = new Vector3();

	function Particle(idx) {
		this.index = idx;
		this.position 	= new Vector3();
		this.direction  = new Vector3();
		this.velocity 	= new Vector3();
		this.color 		= new Vector4();
		this.color0 	= new Vector3();
		this.color1 	= new Vector3();

		this.id = Particle.ID++;
		this.reset();
	}

	Particle.ID = 0;

	Particle.prototype.reset = function () {
		this.position.set(0, 0, 0);
		this.velocity.set(0, 0, 0);
		this.color.set(1, 1, 1, 1);
		this.color0.set(1, 1, 1);
		this.color1.set(1, 1, 1);
		this.colorBlend = 0;
		this.colorCurve = [[0, 1], [1, 0]];

		this.opacity = 1;
		this.alpha = [[0, 0], [1, 1]];

		this.size = 1;
		this.growthFactor = 1;
		this.growth = [[0, 1], [1, 0]];

		this.acceleration = 1;
		this.gravity = 0;
		this.rotation = 0;
		this.spinspeed = 0;
		this.spin = [[0, 1], [1, 0]];

		this.lifeSpan = 0;
		this.lifeSpanTotal = 0;
		this.progress = 0;
		this.frameOffset = 0;
		this.frameCount = 0;

		this.tileIndex = 0;
		this.offsetX = 0;
		this.offsetY = 0;

		this.dead = true;
		this.requestKill = false;
	};

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}


	Particle.prototype.joinSimulation = function (simParams, ratio) {
		var simD = simParams.data;

		this.direction.x = (Math.random() -0.5) * (2*simD.spread) + (1-simD.spread)*simParams.normal.x;
		this.direction.y = (Math.random() -0.5) * (2*simD.spread) + (1-simD.spread)*simParams.normal.y;
		this.direction.z = (Math.random() -0.5) * (2*simD.spread) + (1-simD.spread)*simParams.normal.z;

		this.direction.normalize();

		this.velocity.x = simD.strength*this.direction.x;
		this.velocity.y = simD.strength*this.direction.y;
		this.velocity.z = simD.strength*this.direction.z;

		this.position.x = simParams.position.x + this.velocity.x * simD.stretch * ratio ;
		this.position.y = simParams.position.y + this.velocity.y * simD.stretch * ratio ;
		this.position.z = simParams.position.z + this.velocity.z * simD.stretch * ratio ;

		this.sprite = simD.sprite;
		this.trailSprite = simD.trailsprite;
		this.trailWidth = simD.trailwidth;
		this.loopcount = simD.loopcount;

		this.color1.seta(simD.color1);

		this.color0.data[0] = simD.color0[0] *(1-simD.colorRandom)+simD.colorRandom*Math.random();
		this.color0.data[1] = simD.color0[1] *(1-simD.colorRandom)+simD.colorRandom*Math.random();
		this.color0.data[2] = simD.color0[2] *(1-simD.colorRandom)+simD.colorRandom*Math.random();

		this.color.data[0] = this.color0[0];
		this.color.data[1] = this.color0[1];
		this.color.data[2] = this.color0[2];

		this.colorCurve = simD.colorCurve;
		this.opacity = randomBetween(simD.opacity[0], simD.opacity[1]);
		this.alpha = simD.alpha;

		this.size = randomBetween(simD.size[0], simD.size[1]);
		this.growthFactor = randomBetween(simD.growthFactor[0], simD.growthFactor[1]);
		this.growth = simD.growth;

		this.spin = simD.spin;
		this.spinspeed = randomBetween(simD.spinspeed[0], simD.spinspeed[1]);
		this.rotation = randomBetween(simD.rotation[0], simD.rotation[1]);

		this.acceleration = simD.acceleration;
		this.gravity = simD.gravity;

		this.progress = 0;
		this.lifeSpan = randomBetween(simD.lifespan[0], simD.lifespan[1]);
		this.lifeSpanTotal = this.lifeSpan;

		this.frameOffset = ratio;

		this.dead = false;
	};

	Particle.prototype.setTileInfo = function (tileInfo, scaleX, scaleY) {
		this.tileInfo = tileInfo;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
	};

	Particle.prototype.setTrailInfo = function (trailInfo, trailScaleX, trailScaleY) {
		this.trailInfo = trailInfo;
		this.trailScaleX = trailScaleX;
		this.trailScaleY = trailScaleY;
		this.trailOffsetX = this.trailScaleX * this.trailInfo.tiles[0][0];
		this.trailOffsetY = 1 - this.trailScaleY * (this.trailInfo.tiles[0][1]+1);
	};



	Particle.prototype.selectAnimationFrame = function() {
		this.tileIndex = Math.floor(this.tileInfo.tiles.length * this.progress * this.loopcount) % this.tileInfo.tiles.length;
	};

	Particle.prototype.updateAtlasOffsets = function() {
		if (this.tileInfo.tiles.length > 1) {
			this.selectAnimationFrame();
		}
		this.offsetX = this.scaleX * this.tileInfo.tiles[this.tileIndex][0];
		this.offsetY = 1 - this.scaleY * (this.tileInfo.tiles[this.tileIndex][1]+1);
	};

	Particle.prototype.setDataUsage = function () {
	};


	Particle.prototype.getInterpolatedInCurveAboveIndex = function(value, curve, index) {
		return curve[index][1] + (value - curve[index][0]) / (curve[index+1][0] - curve[index][0])*(curve[index+1][1]-curve[index][1]);
	};

	Particle.prototype.valueFromCurve = function(value, curve) {
		for (var i = 0; i < curve.length; i++) {
			if (!curve[i+1]) return 0;
			if (curve[i+1][0] > value) return this.getInterpolatedInCurveAboveIndex(value, curve, i)
		}
		return 0;
	};

	Particle.prototype.applyParticleCurves = function(deduct) {
		this.size += this.growthFactor * this.valueFromCurve(this.progress, this.growth) * deduct;
		this.rotation += this.spinspeed * this.valueFromCurve(this.progress, this.spin) * deduct;
		this.color.data[3] = this.opacity * this.valueFromCurve(this.progress, this.alpha);

		this.colorBlend = this.valueFromCurve(this.progress, this.colorCurve);
		this.color.data[0] = this.color0.data[0]*this.colorBlend + this.color1.data[0]*(1-this.colorBlend);
		this.color.data[1] = this.color0.data[1]*this.colorBlend + this.color1.data[1]*(1-this.colorBlend);
		this.color.data[2] = this.color0.data[2]*this.colorBlend + this.color1.data[2]*(1-this.colorBlend);
	};

	Particle.prototype.defaultParticleUpdate = function(deduct) {
		this.progress = 1-((this.lifeSpan - this.frameOffset*0.016)  / this.lifeSpanTotal);

		this.applyParticleCurves(deduct);

		this.velocity.muld(this.acceleration, this.acceleration, this.acceleration);
		this.velocity.add_d(0, this.gravity*deduct, 0);

		calcVec.set(this.velocity);
		calcVec.muld(deduct, deduct, deduct);
		this.position.addv(calcVec);
	};


	Particle.prototype.killParticle = function () {
		this.requestKill = true;
	};


	return Particle;
});