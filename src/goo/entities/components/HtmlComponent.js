import Component from '../../entities/components/Component';



	/**
	 * Adds a 2D DOM element to the entity, that can move with its transform.
	 * @extends Component
	 * @param {DOMElement} domElement
	 * @param {object} [options]
	 * @param {boolean} [options.hidden=false]
	 * @param {boolean} [options.useTransformComponent=true]
	 * @param {boolean} [options.pixelPerfect=true]
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/HTMLComponent/HTMLComponent-vtest.html Working example
	 */
	function HtmlComponent(domElement, options) {
		options = options || {};
		Component.apply(this, arguments);

		this.type = 'HtmlComponent';

		/**
		 * DOM element.
		 */
		this.domElement = domElement;

		/**
		 * @type {boolean}
		 */
		this.hidden = options.hidden !== undefined ? options.hidden : false;

		/**
		 * Move with the screen position of the entity.
		 * @type {boolean}
		 */
		this.useTransformComponent = options.useTransformComponent !== undefined ? options.useTransformComponent : true;

		/**
		 * Snap to integer pixel positions.
		 * @type {boolean}
		 */
		this.pixelPerfect = options.pixelPerfect !== undefined ? options.pixelPerfect : true;

		// @ifdef DEBUG
		Object.seal(this);
		// @endif
	}

	HtmlComponent.type = 'HtmlComponent';

	HtmlComponent.prototype = Object.create(Component.prototype);
	HtmlComponent.prototype.constructor = HtmlComponent;

	export default HtmlComponent;
