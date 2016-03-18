import LineRenderer from './LineRenderer';
import LineRenderSystem from './LineRenderSystem';

module.exports = {
	LineRenderer,
	LineRenderSystem
};

import ObjectUtils from '../../util/ObjectUtils';
if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}