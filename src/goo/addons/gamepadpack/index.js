import GamepadComponent from './GamepadComponent';
import GamepadData from './GamepadData';
import GamepadSystem from './GamepadSystem';

module.exports = {
	GamepadComponent,
	GamepadData,
	GamepadSystem
};

import ObjectUtils from '../../util/ObjectUtils';
if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}