import P2Component from './P2Component';
import P2System from './P2System';

module.exports = {
	P2Component,
	P2System
};

import ObjectUtils from '../../util/ObjectUtils';
if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}