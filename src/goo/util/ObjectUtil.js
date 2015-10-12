define([
	'goo/util/ObjectUtils'
], function (
	ObjectUtils
) {
	'use strict';

	/**
	 * @hidden
	 * @deprecated 
	 */
	function ObjectUtil(){}

	function shim(f){
		return function(){
			console.warn('ObjectUtil has been renamed to ObjectUtils, please use ObjectUtils instead.');
			f.apply(this, arguments);
		};
	}

	ObjectUtil.defaults = shim(ObjectUtils.defaults);
	ObjectUtil.copyOptions = shim(ObjectUtils.copyOptions);
	ObjectUtil.extend = shim(ObjectUtils.extend);
	ObjectUtil.extend = shim(ObjectUtils.extend);
	ObjectUtil.isObject = shim(ObjectUtils.isObject);
	ObjectUtil.clone = shim(ObjectUtils.clone);
	ObjectUtil.isObject = shim(ObjectUtils.isObject);
	ObjectUtil.extend = shim(ObjectUtils.extend);
	ObjectUtil.each = shim(ObjectUtils.each);
	ObjectUtil.forEach = shim(ObjectUtils.forEach);
	ObjectUtil.deepClone = shim(ObjectUtils.deepClone);
	ObjectUtil.shallowSelectiveClone = shim(ObjectUtils.shallowSelectiveClone);
	ObjectUtil.cloneMap = shim(ObjectUtils.cloneMap);
	ObjectUtil.cloneSet = shim(ObjectUtils.cloneSet);
	ObjectUtil.warnOnce = shim(ObjectUtils.warnOnce);

	return ObjectUtil;
});