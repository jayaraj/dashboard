/* */ 
'use strict';
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var di_1 = require('../di');
var view_1 = require('../metadata/view');
var directives_1 = require('../metadata/directives');
var lang_1 = require('../../facade/lang');
var exceptions_1 = require('../../facade/exceptions');
var collection_1 = require('../../facade/collection');
var reflection_1 = require('../reflection/reflection');
var ViewResolver = (function() {
  function ViewResolver() {
    this._cache = new collection_1.Map();
  }
  ViewResolver.prototype.resolve = function(component) {
    var view = this._cache.get(component);
    if (lang_1.isBlank(view)) {
      view = this._resolve(component);
      this._cache.set(component, view);
    }
    return view;
  };
  ViewResolver.prototype._resolve = function(component) {
    var compMeta;
    var viewMeta;
    reflection_1.reflector.annotations(component).forEach(function(m) {
      if (m instanceof view_1.ViewMetadata) {
        viewMeta = m;
      }
      if (m instanceof directives_1.ComponentMetadata) {
        compMeta = m;
      }
    });
    if (lang_1.isPresent(compMeta)) {
      if (lang_1.isBlank(compMeta.template) && lang_1.isBlank(compMeta.templateUrl) && lang_1.isBlank(viewMeta)) {
        throw new exceptions_1.BaseException("Component '" + lang_1.stringify(component) + "' must have either 'template', 'templateUrl', or '@View' set.");
      } else if (lang_1.isPresent(compMeta.template) && lang_1.isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("template", component);
      } else if (lang_1.isPresent(compMeta.templateUrl) && lang_1.isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("templateUrl", component);
      } else if (lang_1.isPresent(compMeta.directives) && lang_1.isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("directives", component);
      } else if (lang_1.isPresent(compMeta.pipes) && lang_1.isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("pipes", component);
      } else if (lang_1.isPresent(compMeta.encapsulation) && lang_1.isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("encapsulation", component);
      } else if (lang_1.isPresent(compMeta.styles) && lang_1.isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("styles", component);
      } else if (lang_1.isPresent(compMeta.styleUrls) && lang_1.isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("styleUrls", component);
      } else if (lang_1.isPresent(viewMeta)) {
        return viewMeta;
      } else {
        return new view_1.ViewMetadata({
          templateUrl: compMeta.templateUrl,
          template: compMeta.template,
          directives: compMeta.directives,
          pipes: compMeta.pipes,
          encapsulation: compMeta.encapsulation,
          styles: compMeta.styles,
          styleUrls: compMeta.styleUrls
        });
      }
    } else {
      if (lang_1.isBlank(viewMeta)) {
        throw new exceptions_1.BaseException("No View decorator found on component '" + lang_1.stringify(component) + "'");
      } else {
        return viewMeta;
      }
    }
    return null;
  };
  ViewResolver.prototype._throwMixingViewAndComponent = function(propertyName, component) {
    throw new exceptions_1.BaseException("Component '" + lang_1.stringify(component) + "' cannot have both '" + propertyName + "' and '@View' set at the same time\"");
  };
  ViewResolver = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], ViewResolver);
  return ViewResolver;
})();
exports.ViewResolver = ViewResolver;
