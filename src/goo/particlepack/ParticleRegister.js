define([
	'goo/scripts/Scripts',
	'goo/particlepack/ColorUtil',
	'goo/particlepack/DefaultConfig',
	'goo/particlepack/LineRenderer',
	'goo/particlepack/Particle',
	'goo/particlepack/ParticleBehaviors',
	'goo/particlepack/ParticleRenderer',
	'goo/particlepack/ParticleSimulator',
	'goo/particlepack/ParticleSystem',
	'goo/particlepack/RibbonMesh',
	'goo/particlepack/TrailRenderer',
	'goo/particlepack/TriangleRenderer'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/particlepack/ColorUtil',
		'goo/particlepack/DefaultConfig',
		'goo/particlepack/LineRenderer',
		'goo/particlepack/Particle',
		'goo/particlepack/ParticleBehaviors',
		'goo/particlepack/ParticleRenderer',
		'goo/particlepack/ParticleSimulator',
		'goo/particlepack/ParticleSystem',
		'goo/particlepack/RibbonMesh',
		'goo/particlepack/TrailRenderer',
		'goo/particlepack/TriangleRenderer'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});