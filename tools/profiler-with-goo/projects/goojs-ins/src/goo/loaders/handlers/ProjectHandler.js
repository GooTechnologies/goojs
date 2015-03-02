define(['goo/loaders/handlers/ConfigHandler'], function (ConfigHandler) {
    'use strict';
    __touch(9284);
    function ProjectHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(9293);
    }
    __touch(9285);
    ProjectHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(9286);
    ProjectHandler.prototype.constructor = ProjectHandler;
    __touch(9287);
    ConfigHandler._registerClass('project', ProjectHandler);
    __touch(9288);
    ProjectHandler.prototype._remove = function (ref, options) {
        var project = this._objects[ref];
        __touch(9294);
        if (project) {
            this.updateObject(project.mainScene.id, null, options);
            __touch(9295);
        }
    };
    __touch(9289);
    ProjectHandler.prototype._create = function () {
        return { mainScene: null };
        __touch(9296);
    };
    __touch(9290);
    ProjectHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(9297);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (project) {
            if (!project) {
                return;
                __touch(9300);
            }
            function loadPromise() {
                return that._load(config.mainSceneRef, options).then(function (scene) {
                    project.mainScene = scene;
                    __touch(9302);
                    return project;
                    __touch(9303);
                });
                __touch(9301);
            }
            __touch(9299);
            if (project.mainScene && config.mainSceneRef !== project.mainScene.id) {
                return that.updateObject(project.mainScene.id, null, options).then(loadPromise);
                __touch(9304);
            } else {
                return loadPromise();
                __touch(9305);
            }
        });
        __touch(9298);
    };
    __touch(9291);
    return ProjectHandler;
    __touch(9292);
});
__touch(9283);