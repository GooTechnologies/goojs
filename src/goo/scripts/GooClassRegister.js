(function() {
	'use strict';
	var classes = [
		'goo/math/Vector3'
	];

	define(['goo/scripts/Scripts'].concat(classes), function(Scripts) {
		for (var i = 0; i < classes.length; i++) {
			var name = classes[i].slice(classes[i].lastIndexOf('/') + 1);
			Scripts.addClass(name, arguments[i + 1]);
		}
	});
}());
