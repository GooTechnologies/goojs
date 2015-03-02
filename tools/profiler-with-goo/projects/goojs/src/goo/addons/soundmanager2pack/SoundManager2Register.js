define([
	'goo/scripts/Scripts',
	'goo/addons/soundmanager2pack/systems/SoundManager2System',
	'goo/addons/soundmanager2pack/components/SoundManager2Component'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/soundmanager2pack/systems/SoundManager2System',
		'goo/addons/soundmanager2pack/components/SoundManager2Component'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});