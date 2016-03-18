import Box2DComponent from './components/Box2DComponent';
import Box2DSystem from './systems/Box2DSystem';

module.exports = {
	Box2DComponent,
	Box2DSystem
};

import ObjectUtils from '../../util/ObjectUtils';
if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}