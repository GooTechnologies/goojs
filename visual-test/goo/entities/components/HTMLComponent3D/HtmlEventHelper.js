(function() {
  var channel, currentEntity, disableHtmlFading, enableHtmlFading, gooCanvas, gooCanvasElement, gooRunner, init, instaUninstall, install, mouseDownElement, mouseOutElement, mouseOverElement, mouseState, mouseUpCanvas, oldEntity, onTransitionEnd, passThrough, setOpaque, setTranslucent, uninstall;

  gooRunner = null;

  gooCanvas = null;

  gooCanvasElement = null;

  oldEntity = null;

  currentEntity = null;

  mouseState = {
    down: false
  };

  channel = {};

  passThrough = function(event) {

    /*
    		Prevents the event from doing its thing, but send it to gooCanvas (the element).
    
    		{Event} event
     */
    var eventCopy;
    event.preventDefault();
    eventCopy = document.createEvent('MouseEvents');
    eventCopy.initMouseEvent(event.type, event.bubbles, event.cancelable, event.view, event.detail, event.pageX || event.layerX, event.pageY || event.layerY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, event.relatedTarget);
    return gooCanvasElement.dispatchEvent(eventCopy);
  };

  setTranslucent = function(element) {
    element.classList.add('html-component-hover-on');
    return element.classList.remove('html-component-hover-off');
  };

  setOpaque = function(element) {
    element.classList.add('html-component-hover-off');
    return element.classList.remove('html-component-hover-on');
  };

  mouseDownElement = function(event) {

    /*
    		Let mouse down pass; let it reach the gizmos.
    
    		{Event} event
     */
    mouseState.down = true;
    return passThrough(event);
  };

  mouseUpCanvas = function() {
    return mouseState.down = false;
  };

  mouseOverElement = function() {

    /*
    		Disallow mouse over/out as while you're dragging the element you may (at great velocities) step out with your cursor
     */
    if (mouseState.down) {
      return;
    }
    return setTranslucent(this);
  };

  mouseOutElement = function() {
    if (mouseState.down) {
      return;
    }
    return setOpaque(this);
  };

  onTransitionEnd = function() {
    this.classList.remove('html-component-hover-off');
    return this.removeEventListener('transitionend', onTransitionEnd);
  };

  install = function(element, domElement) {
    gooCanvasElement = domElement;

    /*
    		Install new event listeners
    
    		{HTMLElement} element
     */
    element.addEventListener('mousedown', mouseDownElement);
    element.addEventListener('mouseover', mouseOverElement);
    return element.addEventListener('mouseout', mouseOutElement);
  };

  uninstall = function(element) {

    /*
    		Uninstall event listeners and fading classes
    
    		{HTMLElement} element
     */
    element.removeEventListener('mousedown', mouseDownElement);
    element.removeEventListener('mouseover', mouseOverElement);
    element.removeEventListener('mouseout', mouseOutElement);
    setOpaque(element);
    return element.addEventListener('transitionend', onTransitionEnd);
  };

  instaUninstall = function(element) {

    /*
    		Instantly uninstall, called when pressing stop
    
    		{HTMLElement} element
     */
    element.removeEventListener('mousedown', mouseDownElement);
    element.removeEventListener('mouseover', mouseOverElement);
    element.removeEventListener('mouseout', mouseOutElement);
    element.classList.remove('html-component-hover-off');
    return element.classList.remove('html-component-hover-on');
  };

  enableHtmlFading = function() {

    /*
    		Called when transitioning stop -> play.
     */
    gooCanvasElement.addEventListener('mouseup', mouseUpCanvas);
    if (currentEntity != null ? currentEntity.htmlComponent : void 0) {
      return install(currentEntity.htmlComponent.domElement);
    }
  };

  disableHtmlFading = function() {

    /*
    		Called when transitioning play -> stop. Will cleanup everything on the current selected html entity.
     */
    gooCanvasElement.removeEventListener('mouseup', mouseUpCanvas);
    if (currentEntity != null ? currentEntity.htmlComponent : void 0) {
      return instaUninstall(currentEntity.htmlComponent.domElement);
    }
  };

  init = function(_gooRunner) {

    /*
    		Sets up everything - be sure to call this before enable/disable htmlFading
    
    		{GooRunner} _gooRunner
     */
    gooRunner = _gooRunner;
    gooCanvasElement = gooRunner.renderer.domElement;
    return channel.subscribe({
      topic: 'select',
      callback: function(_arg, envelope) {
        var domElement, entityManager, id;
        id = _arg.id;
        if (envelope.originId !== 'gooCanvas') {
          return;
        }
        entityManager = gooRunner.world.entityManager;
        currentEntity = entityManager.getEntityById(id);
        if (currentEntity === oldEntity) {
          return;
        }
        if (currentEntity != null ? currentEntity.htmlComponent : void 0) {
          domElement = currentEntity.htmlComponent.domElement;
          setTranslucent(domElement);
        }
        return gooRunner.callbacksNextFrame.push(function() {
          if (oldEntity != null ? oldEntity.htmlComponent : void 0) {
            uninstall(oldEntity.htmlComponent.domElement);
          }
          if (currentEntity != null ? currentEntity.htmlComponent : void 0) {
            install(currentEntity.htmlComponent.domElement);
          }
          return oldEntity = currentEntity;
        });
      }
    });
  };

  window.WindowHelper = {
    install: install
  };

})();
