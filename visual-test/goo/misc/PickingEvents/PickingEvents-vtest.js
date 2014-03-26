require([
	'lib/V'
], function (
	V
	) {
	'use strict';

	function swapChannels(colors) {
		var tmp;
		tmp = colors[0]; colors[0] = colors[1];	colors[1] = colors[2]; colors[2] = tmp;
	}

	function pickingEventsDemo() {
		var goo = V.initGoo();
		V.addColoredSpheres();
		V.addLights();
		V.addOrbitCamera();

		// pick events
		/*goo.setEventHandlers({
			onClick: function(clickedEntity, depth) {
				console.log('mouseclick', clickedEntity ? clickedEntity.toString() + ' at depth ' + depth : 'nothing');
				if(clickedEntity) {
					var color = clickedEntity.meshRendererComponent.materials[0].uniforms.color;
					swapChannels(color);
				}
			},
			onChange: function(lastEntity, currentEntity, depth) {
				console.log('mouseleft', lastEntity ? lastEntity.toString() + ' at depth ' + depth : 'nothing');
				console.log('mouseover', currentEntity ? currentEntity.toString() + ' at depth ' + depth : 'nothing');

				if(currentEntity) {
					var color = currentEntity.meshRendererComponent.materials[0].uniforms.color;
					swapChannels(color);
				}
			}
		});*/
		var lastEntity;
		var lastDepth;

		goo.addEventListener('mousemove', function(evt) {
			if(evt.entity && lastEntity !== evt.entity) {
				console.log('Entity is ' + evt.entity + ' at ' + evt.depth);
				var color = evt.entity.meshRendererComponent.materials[0].uniforms.color;
				swapChannels(color);
				if(lastEntity && lastDepth) {
					console.log('Last entity was ' + lastEntity + ' at ' + lastDepth);
				}
			}
			lastEntity = evt.entity;
			lastDepth = evt.depth;
		});

		goo.addEventListener('click', function(evt) {
			console.log('Entity is ' + evt.entity + ' at ' + evt.depth);
			if(evt.entity) {
				var color = evt.entity.meshRendererComponent.materials[0].uniforms.color;
				swapChannels(color);
			}
		});
	}

	pickingEventsDemo();
});
