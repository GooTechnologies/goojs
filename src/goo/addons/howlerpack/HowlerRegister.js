define([
	'goo/scripts/Scripts',
	'goo/addons/howlerpack/components/HowlerComponent',
	'goo/addons/howlerpack/systems/HowlerSystem'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/howlerpack/components/HowlerComponent',
		'goo/addons/howlerpack/systems/HowlerSystem'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});