define([
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils'
], function (
	Scripts,
	ScriptUtils
) {
	'use strict';

	var externals = {
		name: 'RotationScript',
		description: '',
		parameters: [{
			key: 'fraction',
			name: 'Speed',
			'default': 0.01,
			type: 'float',
			control: 'slider',
			min: 0.01,
			max: 1
		}]
	};

	function NewWaveRotationScript() {
		var mouseState, actualState, entity;

		function setup(parameters, env) {
			mouseState = {
				x: 0,
				y: 0
			};

			actualState = {
				x: 0,
				y: 0
			};

			entity = env.getEntity();

			document.addEventListener('mousemove', onMouseMove);
		}

		function update(parameters, env) {
			actualState.x += (mouseState.x - actualState.x) * parameters.fraction;
			actualState.y += (mouseState.y - actualState.y) * parameters.fraction;

			entity.setRotation(actualState.y / 200, actualState.x / 200, 0);
		}

		function onMouseMove(e) {
			mouseState.x = e.x;
			mouseState.y = e.y;
		}

		function cleanup(parameters, env) {
			document.removeEventListener('mousemove', onMouseMove);
		}
		var params = {}
		ScriptUtils.fillDefaultValues(params, external.parameters);
		return {
			setup: setup,
			update: update,
			cleanup: cleanup,
			externals: externals,
			parameters: params
		};
	};
	Scripts.register(externals, NewWaveRotationScript);
});