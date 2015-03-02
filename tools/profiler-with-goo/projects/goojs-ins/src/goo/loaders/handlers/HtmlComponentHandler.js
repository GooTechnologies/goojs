define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/entities/components/HtmlComponent',
    'goo/util/rsvp',
    'goo/util/PromiseUtil'
], function (ComponentHandler, HtmlComponent, RSVP, PromiseUtil) {
    'use strict';
    __touch(8952);
    function HtmlComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(8962);
        this._type = 'HtmlComponent';
        __touch(8963);
        this._configs = {};
        __touch(8964);
    }
    __touch(8953);
    HtmlComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(8954);
    ComponentHandler._registerClass('html', HtmlComponentHandler);
    __touch(8955);
    HtmlComponentHandler.prototype.constructor = HtmlComponentHandler;
    __touch(8956);
    HtmlComponentHandler.prototype._prepare = function () {
    };
    __touch(8957);
    HtmlComponentHandler.prototype._create = function () {
        return new HtmlComponent();
        __touch(8965);
    };
    __touch(8958);
    HtmlComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(8966);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(8981);
            }
            var safeEntityId = '__' + entity.id.replace('.', '-');
            __touch(8968);
            var domElement = component.domElement;
            __touch(8969);
            if (!domElement) {
                domElement = document.createElement('div');
                __touch(8982);
                domElement.id = safeEntityId;
                __touch(8983);
                domElement.className = 'goo-entity';
                __touch(8984);
                domElement.addEventListener('mousedown', function (domEvent) {
                    var gooRunner = entity._world.gooRunner;
                    __touch(8996);
                    var evt = {
                        entity: entity,
                        depth: 0,
                        x: domEvent.pageX,
                        y: domEvent.pageY,
                        domEvent: domEvent,
                        id: entity.id,
                        type: 'mousedown'
                    };
                    __touch(8997);
                    gooRunner.triggerEvent('mousedown', evt);
                    __touch(8998);
                });
                __touch(8985);
                domElement.addEventListener('mouseup', function (domEvent) {
                    var gooRunner = entity._world.gooRunner;
                    __touch(8999);
                    var evt = {
                        entity: entity,
                        depth: 0,
                        x: domEvent.pageX,
                        y: domEvent.pageY,
                        domEvent: domEvent,
                        id: entity.id,
                        type: 'mouseup'
                    };
                    __touch(9000);
                    gooRunner.triggerEvent('mouseup', evt);
                    __touch(9001);
                });
                __touch(8986);
                domElement.addEventListener('click', function (domEvent) {
                    var gooRunner = entity._world.gooRunner;
                    __touch(9002);
                    var evt = {
                        entity: entity,
                        depth: 0,
                        x: domEvent.pageX,
                        y: domEvent.pageY,
                        domEvent: domEvent,
                        id: entity.id,
                        type: 'click'
                    };
                    __touch(9003);
                    gooRunner.triggerEvent('click', evt);
                    __touch(9004);
                });
                __touch(8987);
                component.domElement = domElement;
                __touch(8988);
                domElement.style.position = 'absolute';
                __touch(8989);
                domElement.style.top = 0;
                __touch(8990);
                domElement.style.left = 0;
                __touch(8991);
                domElement.style.zIndex = 1;
                __touch(8992);
                domElement.style.display = 'none';
                __touch(8993);
                var parentEl = entity._world.gooRunner.renderer.domElement.parentElement || document.body;
                __touch(8994);
                parentEl.appendChild(domElement);
                __touch(8995);
            }
            var innerHtmlChanged = config.innerHtml !== domElement.prevInnerHtml;
            __touch(8970);
            var styleChanged = config.style !== domElement.prevStyle;
            __touch(8971);
            domElement.prevInnerHtml = config.innerHtml;
            __touch(8972);
            domElement.prevStyle = config.style;
            __touch(8973);
            component.useTransformComponent = config.useTransformComponent == null ? true : config.useTransformComponent;
            __touch(8974);
            if (!innerHtmlChanged && !styleChanged) {
                return PromiseUtil.resolve();
                __touch(9005);
            }
            var wrappedStyle = '';
            __touch(8975);
            if (config.style) {
                var processedStyle = config.style.replace('__entity', '#' + safeEntityId);
                __touch(9006);
                wrappedStyle = '<style>\n' + processedStyle + '\n</style>';
                __touch(9007);
            }
            domElement.innerHTML = wrappedStyle + config.innerHtml;
            __touch(8976);
            function loadImage(htmlImage, imageRef) {
                return that.loadObject(imageRef, options).then(function (image) {
                    htmlImage.src = image.src;
                    __touch(9009);
                    return htmlImage;
                    __touch(9010);
                }, function (e) {
                    console.error(e);
                    __touch(9011);
                    delete htmlImage.src;
                    __touch(9012);
                    return htmlImage;
                    __touch(9013);
                });
                __touch(9008);
            }
            __touch(8977);
            var images = domElement.getElementsByTagName('IMG');
            __touch(8978);
            var imagePromises = [];
            __touch(8979);
            for (var i = 0; i < images.length; i++) {
                var htmlImage = images[i];
                __touch(9014);
                var imageRef = htmlImage.getAttribute('data-id');
                __touch(9015);
                if (imageRef) {
                    var promise = loadImage(htmlImage, imageRef);
                    __touch(9016);
                    imagePromises.push(promise);
                    __touch(9017);
                }
            }
            return RSVP.all(imagePromises);
            __touch(8980);
        });
        __touch(8967);
    };
    __touch(8959);
    HtmlComponentHandler.prototype._remove = function (entity) {
        var component = entity.htmlComponent;
        __touch(9018);
        ComponentHandler.prototype._remove.call(this, entity);
        __touch(9019);
        if (component.domElement) {
            component.domElement.parentNode.removeChild(component.domElement);
            __touch(9020);
        }
    };
    __touch(8960);
    return HtmlComponentHandler;
    __touch(8961);
});
__touch(8951);