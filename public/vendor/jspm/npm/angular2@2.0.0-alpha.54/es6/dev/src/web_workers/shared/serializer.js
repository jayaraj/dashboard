/* */ 
"format cjs";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isArray, isPresent, serializeEnum } from "angular2/src/facade/lang";
import { BaseException } from 'angular2/src/facade/exceptions';
import { Map, StringMapWrapper, MapWrapper } from "angular2/src/facade/collection";
import { RenderProtoViewRef, RenderViewRef, RenderFragmentRef, RenderComponentTemplate } from "angular2/src/core/render/api";
import { WebWorkerElementRef, WebWorkerTemplateCmd, WebWorkerTextCmd, WebWorkerNgContentCmd, WebWorkerBeginElementCmd, WebWorkerEndElementCmd, WebWorkerBeginComponentCmd, WebWorkerEndComponentCmd, WebWorkerEmbeddedTemplateCmd } from 'angular2/src/web_workers/shared/api';
import { Injectable } from "angular2/src/core/di";
import { RenderProtoViewRefStore } from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import { RenderViewWithFragmentsStore } from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import { ViewEncapsulation, VIEW_ENCAPSULATION_VALUES } from 'angular2/src/core/metadata/view';
// PRIMITIVE is any type that does not need to be serialized (string, number, boolean)
// We set it to String so that it is considered a Type.
export const PRIMITIVE = String;
export let Serializer = class {
    constructor(_protoViewStore, _renderViewStore) {
        this._protoViewStore = _protoViewStore;
        this._renderViewStore = _renderViewStore;
    }
    serialize(obj, type) {
        if (!isPresent(obj)) {
            return null;
        }
        if (isArray(obj)) {
            return obj.map(v => this.serialize(v, type));
        }
        if (type == PRIMITIVE) {
            return obj;
        }
        if (type == RenderProtoViewRef) {
            return this._protoViewStore.serialize(obj);
        }
        else if (type == RenderViewRef) {
            return this._renderViewStore.serializeRenderViewRef(obj);
        }
        else if (type == RenderFragmentRef) {
            return this._renderViewStore.serializeRenderFragmentRef(obj);
        }
        else if (type == WebWorkerElementRef) {
            return this._serializeWorkerElementRef(obj);
        }
        else if (type == WebWorkerTemplateCmd) {
            return serializeTemplateCmd(obj);
        }
        else if (type === RenderComponentTemplate) {
            return this._serializeRenderTemplate(obj);
        }
        else if (type === ViewEncapsulation) {
            return serializeEnum(obj);
        }
        else {
            throw new BaseException("No serializer for " + type.toString());
        }
    }
    deserialize(map, type, data) {
        if (!isPresent(map)) {
            return null;
        }
        if (isArray(map)) {
            var obj = [];
            map.forEach(val => obj.push(this.deserialize(val, type, data)));
            return obj;
        }
        if (type == PRIMITIVE) {
            return map;
        }
        if (type == RenderProtoViewRef) {
            return this._protoViewStore.deserialize(map);
        }
        else if (type == RenderViewRef) {
            return this._renderViewStore.deserializeRenderViewRef(map);
        }
        else if (type == RenderFragmentRef) {
            return this._renderViewStore.deserializeRenderFragmentRef(map);
        }
        else if (type == WebWorkerElementRef) {
            return this._deserializeWorkerElementRef(map);
        }
        else if (type == WebWorkerTemplateCmd) {
            return deserializeTemplateCmd(map);
        }
        else if (type === RenderComponentTemplate) {
            return this._deserializeRenderTemplate(map);
        }
        else if (type === ViewEncapsulation) {
            return VIEW_ENCAPSULATION_VALUES[map];
        }
        else {
            throw new BaseException("No deserializer for " + type.toString());
        }
    }
    mapToObject(map, type) {
        var object = {};
        var serialize = isPresent(type);
        map.forEach((value, key) => {
            if (serialize) {
                object[key] = this.serialize(value, type);
            }
            else {
                object[key] = value;
            }
        });
        return object;
    }
    /*
     * Transforms a Javascript object (StringMap) into a Map<string, V>
     * If the values need to be deserialized pass in their type
     * and they will be deserialized before being placed in the map
     */
    objectToMap(obj, type, data) {
        if (isPresent(type)) {
            var map = new Map();
            StringMapWrapper.forEach(obj, (val, key) => { map.set(key, this.deserialize(val, type, data)); });
            return map;
        }
        else {
            return MapWrapper.createFromStringMap(obj);
        }
    }
    allocateRenderViews(fragmentCount) { this._renderViewStore.allocate(fragmentCount); }
    _serializeWorkerElementRef(elementRef) {
        return {
            'renderView': this.serialize(elementRef.renderView, RenderViewRef),
            'boundElementIndex': elementRef.boundElementIndex
        };
    }
    _deserializeWorkerElementRef(map) {
        return new WebWorkerElementRef(this.deserialize(map['renderView'], RenderViewRef), map['boundElementIndex']);
    }
    _serializeRenderTemplate(obj) {
        return {
            'id': obj.id,
            'shortId': obj.shortId,
            'encapsulation': this.serialize(obj.encapsulation, ViewEncapsulation),
            'commands': this.serialize(obj.commands, WebWorkerTemplateCmd),
            'styles': this.serialize(obj.styles, PRIMITIVE)
        };
    }
    _deserializeRenderTemplate(map) {
        return new RenderComponentTemplate(map['id'], map['shortId'], this.deserialize(map['encapsulation'], ViewEncapsulation), this.deserialize(map['commands'], WebWorkerTemplateCmd), this.deserialize(map['styles'], PRIMITIVE));
    }
};
Serializer = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [RenderProtoViewRefStore, RenderViewWithFragmentsStore])
], Serializer);
function serializeTemplateCmd(cmd) {
    return cmd.visit(RENDER_TEMPLATE_CMD_SERIALIZER, null);
}
function deserializeTemplateCmd(data) {
    return RENDER_TEMPLATE_CMD_DESERIALIZERS[data['deserializerIndex']](data);
}
class RenderTemplateCmdSerializer {
    visitText(cmd, context) {
        return {
            'deserializerIndex': 0,
            'isBound': cmd.isBound,
            'ngContentIndex': cmd.ngContentIndex,
            'value': cmd.value
        };
    }
    visitNgContent(cmd, context) {
        return { 'deserializerIndex': 1, 'index': cmd.index, 'ngContentIndex': cmd.ngContentIndex };
    }
    visitBeginElement(cmd, context) {
        return {
            'deserializerIndex': 2,
            'isBound': cmd.isBound,
            'ngContentIndex': cmd.ngContentIndex,
            'name': cmd.name,
            'attrNameAndValues': cmd.attrNameAndValues,
            'eventTargetAndNames': cmd.eventTargetAndNames
        };
    }
    visitEndElement(context) { return { 'deserializerIndex': 3 }; }
    visitBeginComponent(cmd, context) {
        return {
            'deserializerIndex': 4,
            'isBound': cmd.isBound,
            'ngContentIndex': cmd.ngContentIndex,
            'name': cmd.name,
            'attrNameAndValues': cmd.attrNameAndValues,
            'eventTargetAndNames': cmd.eventTargetAndNames,
            'templateId': cmd.templateId
        };
    }
    visitEndComponent(context) { return { 'deserializerIndex': 5 }; }
    visitEmbeddedTemplate(cmd, context) {
        var children = cmd.children.map(child => child.visit(this, null));
        return {
            'deserializerIndex': 6,
            'isBound': cmd.isBound,
            'ngContentIndex': cmd.ngContentIndex,
            'name': cmd.name,
            'attrNameAndValues': cmd.attrNameAndValues,
            'eventTargetAndNames': cmd.eventTargetAndNames,
            'isMerged': cmd.isMerged,
            'children': children
        };
    }
}
var RENDER_TEMPLATE_CMD_SERIALIZER = new RenderTemplateCmdSerializer();
var RENDER_TEMPLATE_CMD_DESERIALIZERS = [
        (data) => new WebWorkerTextCmd(data['isBound'], data['ngContentIndex'], data['value']),
        (data) => new WebWorkerNgContentCmd(data['index'], data['ngContentIndex']),
        (data) => new WebWorkerBeginElementCmd(data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'], data['eventTargetAndNames']),
        (data) => new WebWorkerEndElementCmd(),
        (data) => new WebWorkerBeginComponentCmd(data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'], data['eventTargetAndNames'], data['templateId']),
        (data) => new WebWorkerEndComponentCmd(),
        (data) => new WebWorkerEmbeddedTemplateCmd(data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'], data['eventTargetAndNames'], data['isMerged'], data['children'].map(childData => deserializeTemplateCmd(childData))),
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplci50cyJdLCJuYW1lcyI6WyJTZXJpYWxpemVyIiwiU2VyaWFsaXplci5jb25zdHJ1Y3RvciIsIlNlcmlhbGl6ZXIuc2VyaWFsaXplIiwiU2VyaWFsaXplci5kZXNlcmlhbGl6ZSIsIlNlcmlhbGl6ZXIubWFwVG9PYmplY3QiLCJTZXJpYWxpemVyLm9iamVjdFRvTWFwIiwiU2VyaWFsaXplci5hbGxvY2F0ZVJlbmRlclZpZXdzIiwiU2VyaWFsaXplci5fc2VyaWFsaXplV29ya2VyRWxlbWVudFJlZiIsIlNlcmlhbGl6ZXIuX2Rlc2VyaWFsaXplV29ya2VyRWxlbWVudFJlZiIsIlNlcmlhbGl6ZXIuX3NlcmlhbGl6ZVJlbmRlclRlbXBsYXRlIiwiU2VyaWFsaXplci5fZGVzZXJpYWxpemVSZW5kZXJUZW1wbGF0ZSIsInNlcmlhbGl6ZVRlbXBsYXRlQ21kIiwiZGVzZXJpYWxpemVUZW1wbGF0ZUNtZCIsIlJlbmRlclRlbXBsYXRlQ21kU2VyaWFsaXplciIsIlJlbmRlclRlbXBsYXRlQ21kU2VyaWFsaXplci52aXNpdFRleHQiLCJSZW5kZXJUZW1wbGF0ZUNtZFNlcmlhbGl6ZXIudmlzaXROZ0NvbnRlbnQiLCJSZW5kZXJUZW1wbGF0ZUNtZFNlcmlhbGl6ZXIudmlzaXRCZWdpbkVsZW1lbnQiLCJSZW5kZXJUZW1wbGF0ZUNtZFNlcmlhbGl6ZXIudmlzaXRFbmRFbGVtZW50IiwiUmVuZGVyVGVtcGxhdGVDbWRTZXJpYWxpemVyLnZpc2l0QmVnaW5Db21wb25lbnQiLCJSZW5kZXJUZW1wbGF0ZUNtZFNlcmlhbGl6ZXIudmlzaXRFbmRDb21wb25lbnQiLCJSZW5kZXJUZW1wbGF0ZUNtZFNlcmlhbGl6ZXIudmlzaXRFbWJlZGRlZFRlbXBsYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFPLE9BQU8sRUFBRSxT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QyxJQUEwQixLQUFLLElBQUksd0JBQXdCLEVBQUU7SUFDOUQsS0FBQyxJQUEwQixLQUFLLElBQUksNEJBQTRCLENBQzVELElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQ2hGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFDckMsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztDQUNuRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtUeXBlLCBpc0FycmF5LCBpc1ByZXNlbnQsIHNlcmlhbGl6ZUVudW0sIGRlc2VyaWFsaXplRW51bX0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG5pbXBvcnQge01hcCwgU3RyaW5nTWFwV3JhcHBlciwgTWFwV3JhcHBlcn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvblwiO1xuaW1wb3J0IHtcbiAgUmVuZGVyUHJvdG9WaWV3UmVmLFxuICBSZW5kZXJWaWV3UmVmLFxuICBSZW5kZXJGcmFnbWVudFJlZixcbiAgUmVuZGVyRWxlbWVudFJlZixcbiAgUmVuZGVyVGVtcGxhdGVDbWQsXG4gIFJlbmRlckNvbW1hbmRWaXNpdG9yLFxuICBSZW5kZXJUZXh0Q21kLFxuICBSZW5kZXJOZ0NvbnRlbnRDbWQsXG4gIFJlbmRlckJlZ2luRWxlbWVudENtZCxcbiAgUmVuZGVyQmVnaW5Db21wb25lbnRDbWQsXG4gIFJlbmRlckVtYmVkZGVkVGVtcGxhdGVDbWQsXG4gIFJlbmRlckNvbXBvbmVudFRlbXBsYXRlXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpXCI7XG5pbXBvcnQge1xuICBXZWJXb3JrZXJFbGVtZW50UmVmLFxuICBXZWJXb3JrZXJUZW1wbGF0ZUNtZCxcbiAgV2ViV29ya2VyVGV4dENtZCxcbiAgV2ViV29ya2VyTmdDb250ZW50Q21kLFxuICBXZWJXb3JrZXJCZWdpbkVsZW1lbnRDbWQsXG4gIFdlYldvcmtlckVuZEVsZW1lbnRDbWQsXG4gIFdlYldvcmtlckJlZ2luQ29tcG9uZW50Q21kLFxuICBXZWJXb3JrZXJFbmRDb21wb25lbnRDbWQsXG4gIFdlYldvcmtlckVtYmVkZGVkVGVtcGxhdGVDbWRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9hcGknO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcbmltcG9ydCB7UmVuZGVyUHJvdG9WaWV3UmVmU3RvcmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvcmVuZGVyX3Byb3RvX3ZpZXdfcmVmX3N0b3JlJztcbmltcG9ydCB7XG4gIFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmVcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfdmlld193aXRoX2ZyYWdtZW50c19zdG9yZSc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9uLCBWSUVXX0VOQ0FQU1VMQVRJT05fVkFMVUVTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcblxuLy8gUFJJTUlUSVZFIGlzIGFueSB0eXBlIHRoYXQgZG9lcyBub3QgbmVlZCB0byBiZSBzZXJpYWxpemVkIChzdHJpbmcsIG51bWJlciwgYm9vbGVhbilcbi8vIFdlIHNldCBpdCB0byBTdHJpbmcgc28gdGhhdCBpdCBpcyBjb25zaWRlcmVkIGEgVHlwZS5cbmV4cG9ydCBjb25zdCBQUklNSVRJVkU6IFR5cGUgPSBTdHJpbmc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTZXJpYWxpemVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcHJvdG9WaWV3U3RvcmU6IFJlbmRlclByb3RvVmlld1JlZlN0b3JlLFxuICAgICAgICAgICAgICBwcml2YXRlIF9yZW5kZXJWaWV3U3RvcmU6IFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUpIHt9XG5cbiAgc2VyaWFsaXplKG9iajogYW55LCB0eXBlOiBhbnkpOiBPYmplY3Qge1xuICAgIGlmICghaXNQcmVzZW50KG9iaikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICByZXR1cm4gKDxhbnlbXT5vYmopLm1hcCh2ID0+IHRoaXMuc2VyaWFsaXplKHYsIHR5cGUpKTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT0gUFJJTUlUSVZFKSB7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PSBSZW5kZXJQcm90b1ZpZXdSZWYpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wcm90b1ZpZXdTdG9yZS5zZXJpYWxpemUob2JqKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gUmVuZGVyVmlld1JlZikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlbmRlclZpZXdTdG9yZS5zZXJpYWxpemVSZW5kZXJWaWV3UmVmKG9iaik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFJlbmRlckZyYWdtZW50UmVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVuZGVyVmlld1N0b3JlLnNlcmlhbGl6ZVJlbmRlckZyYWdtZW50UmVmKG9iaik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFdlYldvcmtlckVsZW1lbnRSZWYpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zZXJpYWxpemVXb3JrZXJFbGVtZW50UmVmKG9iaik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFdlYldvcmtlclRlbXBsYXRlQ21kKSB7XG4gICAgICByZXR1cm4gc2VyaWFsaXplVGVtcGxhdGVDbWQob2JqKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFJlbmRlckNvbXBvbmVudFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2VyaWFsaXplUmVuZGVyVGVtcGxhdGUob2JqKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFZpZXdFbmNhcHN1bGF0aW9uKSB7XG4gICAgICByZXR1cm4gc2VyaWFsaXplRW51bShvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcIk5vIHNlcmlhbGl6ZXIgZm9yIFwiICsgdHlwZS50b1N0cmluZygpKTtcbiAgICB9XG4gIH1cblxuICBkZXNlcmlhbGl6ZShtYXA6IGFueSwgdHlwZTogYW55LCBkYXRhPzogYW55KTogYW55IHtcbiAgICBpZiAoIWlzUHJlc2VudChtYXApKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXkobWFwKSkge1xuICAgICAgdmFyIG9iajogYW55W10gPSBbXTtcbiAgICAgICg8YW55W10+bWFwKS5mb3JFYWNoKHZhbCA9PiBvYmoucHVzaCh0aGlzLmRlc2VyaWFsaXplKHZhbCwgdHlwZSwgZGF0YSkpKTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmICh0eXBlID09IFBSSU1JVElWRSkge1xuICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PSBSZW5kZXJQcm90b1ZpZXdSZWYpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wcm90b1ZpZXdTdG9yZS5kZXNlcmlhbGl6ZShtYXApO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBSZW5kZXJWaWV3UmVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVuZGVyVmlld1N0b3JlLmRlc2VyaWFsaXplUmVuZGVyVmlld1JlZihtYXApO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBSZW5kZXJGcmFnbWVudFJlZikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlbmRlclZpZXdTdG9yZS5kZXNlcmlhbGl6ZVJlbmRlckZyYWdtZW50UmVmKG1hcCk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFdlYldvcmtlckVsZW1lbnRSZWYpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kZXNlcmlhbGl6ZVdvcmtlckVsZW1lbnRSZWYobWFwKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gV2ViV29ya2VyVGVtcGxhdGVDbWQpIHtcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZVRlbXBsYXRlQ21kKG1hcCk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBSZW5kZXJDb21wb25lbnRUZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2Rlc2VyaWFsaXplUmVuZGVyVGVtcGxhdGUobWFwKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFZpZXdFbmNhcHN1bGF0aW9uKSB7XG4gICAgICByZXR1cm4gVklFV19FTkNBUFNVTEFUSU9OX1ZBTFVFU1ttYXBdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcIk5vIGRlc2VyaWFsaXplciBmb3IgXCIgKyB0eXBlLnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgfVxuXG4gIG1hcFRvT2JqZWN0KG1hcDogTWFwPHN0cmluZywgYW55PiwgdHlwZT86IFR5cGUpOiBPYmplY3Qge1xuICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICB2YXIgc2VyaWFsaXplID0gaXNQcmVzZW50KHR5cGUpO1xuXG4gICAgbWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGlmIChzZXJpYWxpemUpIHtcbiAgICAgICAgb2JqZWN0W2tleV0gPSB0aGlzLnNlcmlhbGl6ZSh2YWx1ZSwgdHlwZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICAvKlxuICAgKiBUcmFuc2Zvcm1zIGEgSmF2YXNjcmlwdCBvYmplY3QgKFN0cmluZ01hcCkgaW50byBhIE1hcDxzdHJpbmcsIFY+XG4gICAqIElmIHRoZSB2YWx1ZXMgbmVlZCB0byBiZSBkZXNlcmlhbGl6ZWQgcGFzcyBpbiB0aGVpciB0eXBlXG4gICAqIGFuZCB0aGV5IHdpbGwgYmUgZGVzZXJpYWxpemVkIGJlZm9yZSBiZWluZyBwbGFjZWQgaW4gdGhlIG1hcFxuICAgKi9cbiAgb2JqZWN0VG9NYXAob2JqOiB7W2tleTogc3RyaW5nXTogYW55fSwgdHlwZT86IFR5cGUsIGRhdGE/OiBhbnkpOiBNYXA8c3RyaW5nLCBhbnk+IHtcbiAgICBpZiAoaXNQcmVzZW50KHR5cGUpKSB7XG4gICAgICB2YXIgbWFwID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChvYmosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHZhbCwga2V5KSA9PiB7IG1hcC5zZXQoa2V5LCB0aGlzLmRlc2VyaWFsaXplKHZhbCwgdHlwZSwgZGF0YSkpOyB9KTtcbiAgICAgIHJldHVybiBtYXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBNYXBXcmFwcGVyLmNyZWF0ZUZyb21TdHJpbmdNYXAob2JqKTtcbiAgICB9XG4gIH1cblxuICBhbGxvY2F0ZVJlbmRlclZpZXdzKGZyYWdtZW50Q291bnQ6IG51bWJlcikgeyB0aGlzLl9yZW5kZXJWaWV3U3RvcmUuYWxsb2NhdGUoZnJhZ21lbnRDb3VudCk7IH1cblxuICBwcml2YXRlIF9zZXJpYWxpemVXb3JrZXJFbGVtZW50UmVmKGVsZW1lbnRSZWY6IFJlbmRlckVsZW1lbnRSZWYpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdyZW5kZXJWaWV3JzogdGhpcy5zZXJpYWxpemUoZWxlbWVudFJlZi5yZW5kZXJWaWV3LCBSZW5kZXJWaWV3UmVmKSxcbiAgICAgICdib3VuZEVsZW1lbnRJbmRleCc6IGVsZW1lbnRSZWYuYm91bmRFbGVtZW50SW5kZXhcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVzZXJpYWxpemVXb3JrZXJFbGVtZW50UmVmKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0pOiBSZW5kZXJFbGVtZW50UmVmIHtcbiAgICByZXR1cm4gbmV3IFdlYldvcmtlckVsZW1lbnRSZWYodGhpcy5kZXNlcmlhbGl6ZShtYXBbJ3JlbmRlclZpZXcnXSwgUmVuZGVyVmlld1JlZiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcFsnYm91bmRFbGVtZW50SW5kZXgnXSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX3NlcmlhbGl6ZVJlbmRlclRlbXBsYXRlKG9iajogUmVuZGVyQ29tcG9uZW50VGVtcGxhdGUpOiBPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICAnaWQnOiBvYmouaWQsXG4gICAgICAnc2hvcnRJZCc6IG9iai5zaG9ydElkLFxuICAgICAgJ2VuY2Fwc3VsYXRpb24nOiB0aGlzLnNlcmlhbGl6ZShvYmouZW5jYXBzdWxhdGlvbiwgVmlld0VuY2Fwc3VsYXRpb24pLFxuICAgICAgJ2NvbW1hbmRzJzogdGhpcy5zZXJpYWxpemUob2JqLmNvbW1hbmRzLCBXZWJXb3JrZXJUZW1wbGF0ZUNtZCksXG4gICAgICAnc3R5bGVzJzogdGhpcy5zZXJpYWxpemUob2JqLnN0eWxlcywgUFJJTUlUSVZFKVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9kZXNlcmlhbGl6ZVJlbmRlclRlbXBsYXRlKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0pOiBSZW5kZXJDb21wb25lbnRUZW1wbGF0ZSB7XG4gICAgcmV0dXJuIG5ldyBSZW5kZXJDb21wb25lbnRUZW1wbGF0ZShtYXBbJ2lkJ10sIG1hcFsnc2hvcnRJZCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlcmlhbGl6ZShtYXBbJ2VuY2Fwc3VsYXRpb24nXSwgVmlld0VuY2Fwc3VsYXRpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlcmlhbGl6ZShtYXBbJ2NvbW1hbmRzJ10sIFdlYldvcmtlclRlbXBsYXRlQ21kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzZXJpYWxpemUobWFwWydzdHlsZXMnXSwgUFJJTUlUSVZFKSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzZXJpYWxpemVUZW1wbGF0ZUNtZChjbWQ6IFJlbmRlclRlbXBsYXRlQ21kKTogT2JqZWN0IHtcbiAgcmV0dXJuIGNtZC52aXNpdChSRU5ERVJfVEVNUExBVEVfQ01EX1NFUklBTElaRVIsIG51bGwpO1xufVxuXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZVRlbXBsYXRlQ21kKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogUmVuZGVyVGVtcGxhdGVDbWQge1xuICByZXR1cm4gUkVOREVSX1RFTVBMQVRFX0NNRF9ERVNFUklBTElaRVJTW2RhdGFbJ2Rlc2VyaWFsaXplckluZGV4J11dKGRhdGEpO1xufVxuXG5jbGFzcyBSZW5kZXJUZW1wbGF0ZUNtZFNlcmlhbGl6ZXIgaW1wbGVtZW50cyBSZW5kZXJDb21tYW5kVmlzaXRvciB7XG4gIHZpc2l0VGV4dChjbWQ6IFJlbmRlclRleHRDbWQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdkZXNlcmlhbGl6ZXJJbmRleCc6IDAsXG4gICAgICAnaXNCb3VuZCc6IGNtZC5pc0JvdW5kLFxuICAgICAgJ25nQ29udGVudEluZGV4JzogY21kLm5nQ29udGVudEluZGV4LFxuICAgICAgJ3ZhbHVlJzogY21kLnZhbHVlXG4gICAgfTtcbiAgfVxuICB2aXNpdE5nQ29udGVudChjbWQ6IFJlbmRlck5nQ29udGVudENtZCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4geydkZXNlcmlhbGl6ZXJJbmRleCc6IDEsICdpbmRleCc6IGNtZC5pbmRleCwgJ25nQ29udGVudEluZGV4JzogY21kLm5nQ29udGVudEluZGV4fTtcbiAgfVxuICB2aXNpdEJlZ2luRWxlbWVudChjbWQ6IFJlbmRlckJlZ2luRWxlbWVudENtZCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2Rlc2VyaWFsaXplckluZGV4JzogMixcbiAgICAgICdpc0JvdW5kJzogY21kLmlzQm91bmQsXG4gICAgICAnbmdDb250ZW50SW5kZXgnOiBjbWQubmdDb250ZW50SW5kZXgsXG4gICAgICAnbmFtZSc6IGNtZC5uYW1lLFxuICAgICAgJ2F0dHJOYW1lQW5kVmFsdWVzJzogY21kLmF0dHJOYW1lQW5kVmFsdWVzLFxuICAgICAgJ2V2ZW50VGFyZ2V0QW5kTmFtZXMnOiBjbWQuZXZlbnRUYXJnZXRBbmROYW1lc1xuICAgIH07XG4gIH1cbiAgdmlzaXRFbmRFbGVtZW50KGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB7J2Rlc2VyaWFsaXplckluZGV4JzogM307IH1cbiAgdmlzaXRCZWdpbkNvbXBvbmVudChjbWQ6IFJlbmRlckJlZ2luQ29tcG9uZW50Q21kLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICAnZGVzZXJpYWxpemVySW5kZXgnOiA0LFxuICAgICAgJ2lzQm91bmQnOiBjbWQuaXNCb3VuZCxcbiAgICAgICduZ0NvbnRlbnRJbmRleCc6IGNtZC5uZ0NvbnRlbnRJbmRleCxcbiAgICAgICduYW1lJzogY21kLm5hbWUsXG4gICAgICAnYXR0ck5hbWVBbmRWYWx1ZXMnOiBjbWQuYXR0ck5hbWVBbmRWYWx1ZXMsXG4gICAgICAnZXZlbnRUYXJnZXRBbmROYW1lcyc6IGNtZC5ldmVudFRhcmdldEFuZE5hbWVzLFxuICAgICAgJ3RlbXBsYXRlSWQnOiBjbWQudGVtcGxhdGVJZFxuICAgIH07XG4gIH1cbiAgdmlzaXRFbmRDb21wb25lbnQoY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIHsnZGVzZXJpYWxpemVySW5kZXgnOiA1fTsgfVxuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoY21kOiBSZW5kZXJFbWJlZGRlZFRlbXBsYXRlQ21kLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHZhciBjaGlsZHJlbiA9IGNtZC5jaGlsZHJlbi5tYXAoY2hpbGQgPT4gY2hpbGQudmlzaXQodGhpcywgbnVsbCkpO1xuICAgIHJldHVybiB7XG4gICAgICAnZGVzZXJpYWxpemVySW5kZXgnOiA2LFxuICAgICAgJ2lzQm91bmQnOiBjbWQuaXNCb3VuZCxcbiAgICAgICduZ0NvbnRlbnRJbmRleCc6IGNtZC5uZ0NvbnRlbnRJbmRleCxcbiAgICAgICduYW1lJzogY21kLm5hbWUsXG4gICAgICAnYXR0ck5hbWVBbmRWYWx1ZXMnOiBjbWQuYXR0ck5hbWVBbmRWYWx1ZXMsXG4gICAgICAnZXZlbnRUYXJnZXRBbmROYW1lcyc6IGNtZC5ldmVudFRhcmdldEFuZE5hbWVzLFxuICAgICAgJ2lzTWVyZ2VkJzogY21kLmlzTWVyZ2VkLFxuICAgICAgJ2NoaWxkcmVuJzogY2hpbGRyZW5cbiAgICB9O1xuICB9XG59XG5cbnZhciBSRU5ERVJfVEVNUExBVEVfQ01EX1NFUklBTElaRVIgPSBuZXcgUmVuZGVyVGVtcGxhdGVDbWRTZXJpYWxpemVyKCk7XG5cbnZhciBSRU5ERVJfVEVNUExBVEVfQ01EX0RFU0VSSUFMSVpFUlMgPSBbXG4gIChkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSkgPT5cbiAgICAgIG5ldyBXZWJXb3JrZXJUZXh0Q21kKGRhdGFbJ2lzQm91bmQnXSwgZGF0YVsnbmdDb250ZW50SW5kZXgnXSwgZGF0YVsndmFsdWUnXSksXG4gIChkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gbmV3IFdlYldvcmtlck5nQ29udGVudENtZChkYXRhWydpbmRleCddLCBkYXRhWyduZ0NvbnRlbnRJbmRleCddKSxcbiAgKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PlxuICAgICAgbmV3IFdlYldvcmtlckJlZ2luRWxlbWVudENtZChkYXRhWydpc0JvdW5kJ10sIGRhdGFbJ25nQ29udGVudEluZGV4J10sIGRhdGFbJ25hbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVsnYXR0ck5hbWVBbmRWYWx1ZXMnXSwgZGF0YVsnZXZlbnRUYXJnZXRBbmROYW1lcyddKSxcbiAgKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBuZXcgV2ViV29ya2VyRW5kRWxlbWVudENtZCgpLFxuICAoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pID0+IG5ldyBXZWJXb3JrZXJCZWdpbkNvbXBvbmVudENtZChcbiAgICAgIGRhdGFbJ2lzQm91bmQnXSwgZGF0YVsnbmdDb250ZW50SW5kZXgnXSwgZGF0YVsnbmFtZSddLCBkYXRhWydhdHRyTmFtZUFuZFZhbHVlcyddLFxuICAgICAgZGF0YVsnZXZlbnRUYXJnZXRBbmROYW1lcyddLCBkYXRhWyd0ZW1wbGF0ZUlkJ10pLFxuICAoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pID0+IG5ldyBXZWJXb3JrZXJFbmRDb21wb25lbnRDbWQoKSxcbiAgKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBuZXcgV2ViV29ya2VyRW1iZWRkZWRUZW1wbGF0ZUNtZChcbiAgICAgIGRhdGFbJ2lzQm91bmQnXSwgZGF0YVsnbmdDb250ZW50SW5kZXgnXSwgZGF0YVsnbmFtZSddLCBkYXRhWydhdHRyTmFtZUFuZFZhbHVlcyddLFxuICAgICAgZGF0YVsnZXZlbnRUYXJnZXRBbmROYW1lcyddLCBkYXRhWydpc01lcmdlZCddLFxuICAgICAgKDxhbnlbXT5kYXRhWydjaGlsZHJlbiddKS5tYXAoY2hpbGREYXRhID0+IGRlc2VyaWFsaXplVGVtcGxhdGVDbWQoY2hpbGREYXRhKSkpLFxuXTtcbiJdfQ==