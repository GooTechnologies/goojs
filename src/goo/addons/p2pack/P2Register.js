define([
	'goo/scripts/Scripts',
	'goo/addons/p2pack/P2Component',
	'goo/addons/p2pack/P2System'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/p2pack/P2Component',
		'goo/addons/p2pack/P2System'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});