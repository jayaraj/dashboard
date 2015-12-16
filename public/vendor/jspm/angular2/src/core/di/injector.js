'use strict';var collection_1 = require('angular2/src/facade/collection');
var provider_1 = require('./provider');
var exceptions_1 = require('./exceptions');
var lang_1 = require('angular2/src/facade/lang');
var key_1 = require('./key');
var metadata_1 = require('./metadata');
// Threshold for the dynamic version
var _MAX_CONSTRUCTION_COUNTER = 10;
exports.UNDEFINED = lang_1.CONST_EXPR(new Object());
/**
 * Visibility of a {@link Provider}.
 */
(function (Visibility) {
    /**
     * A `Public` {@link Provider} is only visible to regular (as opposed to host) child injectors.
     */
    Visibility[Visibility["Public"] = 0] = "Public";
    /**
     * A `Private` {@link Provider} is only visible to host (as opposed to regular) child injectors.
     */
    Visibility[Visibility["Private"] = 1] = "Private";
    /**
     * A `PublicAndPrivate` {@link Provider} is visible to both host and regular child injectors.
     */
    Visibility[Visibility["PublicAndPrivate"] = 2] = "PublicAndPrivate";
})(exports.Visibility || (exports.Visibility = {}));
var Visibility = exports.Visibility;
function canSee(src, dst) {
    return (src === dst) ||
        (dst === Visibility.PublicAndPrivate || src === Visibility.PublicAndPrivate);
}
var ProtoInjectorInlineStrategy = (function () {
    function ProtoInjectorInlineStrategy(protoEI, bwv) {
        this.provider0 = null;
        this.provider1 = null;
        this.provider2 = null;
        this.provider3 = null;
        this.provider4 = null;
        this.provider5 = null;
        this.provider6 = null;
        this.provider7 = null;
        this.provider8 = null;
        this.provider9 = null;
        this.keyId0 = null;
        this.keyId1 = null;
        this.keyId2 = null;
        this.keyId3 = null;
        this.keyId4 = null;
        this.keyId5 = null;
        this.keyId6 = null;
        this.keyId7 = null;
        this.keyId8 = null;
        this.keyId9 = null;
        this.visibility0 = null;
        this.visibility1 = null;
        this.visibility2 = null;
        this.visibility3 = null;
        this.visibility4 = null;
        this.visibility5 = null;
        this.visibility6 = null;
        this.visibility7 = null;
        this.visibility8 = null;
        this.visibility9 = null;
        var length = bwv.length;
        if (length > 0) {
            this.provider0 = bwv[0].provider;
            this.keyId0 = bwv[0].getKeyId();
            this.visibility0 = bwv[0].visibility;
        }
        if (length > 1) {
            this.provider1 = bwv[1].provider;
            this.keyId1 = bwv[1].getKeyId();
            this.visibility1 = bwv[1].visibility;
        }
        if (length > 2) {
            this.provider2 = bwv[2].provider;
            this.keyId2 = bwv[2].getKeyId();
            this.visibility2 = bwv[2].visibility;
        }
        if (length > 3) {
            this.provider3 = bwv[3].provider;
            this.keyId3 = bwv[3].getKeyId();
            this.visibility3 = bwv[3].visibility;
        }
        if (length > 4) {
            this.provider4 = bwv[4].provider;
            this.keyId4 = bwv[4].getKeyId();
            this.visibility4 = bwv[4].visibility;
        }
        if (length > 5) {
            this.provider5 = bwv[5].provider;
            this.keyId5 = bwv[5].getKeyId();
            this.visibility5 = bwv[5].visibility;
        }
        if (length > 6) {
            this.provider6 = bwv[6].provider;
            this.keyId6 = bwv[6].getKeyId();
            this.visibility6 = bwv[6].visibility;
        }
        if (length > 7) {
            this.provider7 = bwv[7].provider;
            this.keyId7 = bwv[7].getKeyId();
            this.visibility7 = bwv[7].visibility;
        }
        if (length > 8) {
            this.provider8 = bwv[8].provider;
            this.keyId8 = bwv[8].getKeyId();
            this.visibility8 = bwv[8].visibility;
        }
        if (length > 9) {
            this.provider9 = bwv[9].provider;
            this.keyId9 = bwv[9].getKeyId();
            this.visibility9 = bwv[9].visibility;
        }
    }
    ProtoInjectorInlineStrategy.prototype.getProviderAtIndex = function (index) {
        if (index == 0)
            return this.provider0;
        if (index == 1)
            return this.provider1;
        if (index == 2)
            return this.provider2;
        if (index == 3)
            return this.provider3;
        if (index == 4)
            return this.provider4;
        if (index == 5)
            return this.provider5;
        if (index == 6)
            return this.provider6;
        if (index == 7)
            return this.provider7;
        if (index == 8)
            return this.provider8;
        if (index == 9)
            return this.provider9;
        throw new exceptions_1.OutOfBoundsError(index);
    };
    ProtoInjectorInlineStrategy.prototype.createInjectorStrategy = function (injector) {
        return new InjectorInlineStrategy(injector, this);
    };
    return ProtoInjectorInlineStrategy;
})();
exports.ProtoInjectorInlineStrategy = ProtoInjectorInlineStrategy;
var ProtoInjectorDynamicStrategy = (function () {
    function ProtoInjectorDynamicStrategy(protoInj, bwv) {
        var len = bwv.length;
        this.providers = collection_1.ListWrapper.createFixedSize(len);
        this.keyIds = collection_1.ListWrapper.createFixedSize(len);
        this.visibilities = collection_1.ListWrapper.createFixedSize(len);
        for (var i = 0; i < len; i++) {
            this.providers[i] = bwv[i].provider;
            this.keyIds[i] = bwv[i].getKeyId();
            this.visibilities[i] = bwv[i].visibility;
        }
    }
    ProtoInjectorDynamicStrategy.prototype.getProviderAtIndex = function (index) {
        if (index < 0 || index >= this.providers.length) {
            throw new exceptions_1.OutOfBoundsError(index);
        }
        return this.providers[index];
    };
    ProtoInjectorDynamicStrategy.prototype.createInjectorStrategy = function (ei) {
        return new InjectorDynamicStrategy(this, ei);
    };
    return ProtoInjectorDynamicStrategy;
})();
exports.ProtoInjectorDynamicStrategy = ProtoInjectorDynamicStrategy;
var ProtoInjector = (function () {
    function ProtoInjector(bwv) {
        this.numberOfProviders = bwv.length;
        this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ?
            new ProtoInjectorDynamicStrategy(this, bwv) :
            new ProtoInjectorInlineStrategy(this, bwv);
    }
    ProtoInjector.prototype.getProviderAtIndex = function (index) { return this._strategy.getProviderAtIndex(index); };
    return ProtoInjector;
})();
exports.ProtoInjector = ProtoInjector;
var InjectorInlineStrategy = (function () {
    function InjectorInlineStrategy(injector, protoStrategy) {
        this.injector = injector;
        this.protoStrategy = protoStrategy;
        this.obj0 = exports.UNDEFINED;
        this.obj1 = exports.UNDEFINED;
        this.obj2 = exports.UNDEFINED;
        this.obj3 = exports.UNDEFINED;
        this.obj4 = exports.UNDEFINED;
        this.obj5 = exports.UNDEFINED;
        this.obj6 = exports.UNDEFINED;
        this.obj7 = exports.UNDEFINED;
        this.obj8 = exports.UNDEFINED;
        this.obj9 = exports.UNDEFINED;
    }
    InjectorInlineStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
    InjectorInlineStrategy.prototype.instantiateProvider = function (provider, visibility) {
        return this.injector._new(provider, visibility);
    };
    InjectorInlineStrategy.prototype.attach = function (parent, isHost) {
        var inj = this.injector;
        inj._parent = parent;
        inj._isHost = isHost;
    };
    InjectorInlineStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this.protoStrategy;
        var inj = this.injector;
        if (p.keyId0 === keyId && canSee(p.visibility0, visibility)) {
            if (this.obj0 === exports.UNDEFINED) {
                this.obj0 = inj._new(p.provider0, p.visibility0);
            }
            return this.obj0;
        }
        if (p.keyId1 === keyId && canSee(p.visibility1, visibility)) {
            if (this.obj1 === exports.UNDEFINED) {
                this.obj1 = inj._new(p.provider1, p.visibility1);
            }
            return this.obj1;
        }
        if (p.keyId2 === keyId && canSee(p.visibility2, visibility)) {
            if (this.obj2 === exports.UNDEFINED) {
                this.obj2 = inj._new(p.provider2, p.visibility2);
            }
            return this.obj2;
        }
        if (p.keyId3 === keyId && canSee(p.visibility3, visibility)) {
            if (this.obj3 === exports.UNDEFINED) {
                this.obj3 = inj._new(p.provider3, p.visibility3);
            }
            return this.obj3;
        }
        if (p.keyId4 === keyId && canSee(p.visibility4, visibility)) {
            if (this.obj4 === exports.UNDEFINED) {
                this.obj4 = inj._new(p.provider4, p.visibility4);
            }
            return this.obj4;
        }
        if (p.keyId5 === keyId && canSee(p.visibility5, visibility)) {
            if (this.obj5 === exports.UNDEFINED) {
                this.obj5 = inj._new(p.provider5, p.visibility5);
            }
            return this.obj5;
        }
        if (p.keyId6 === keyId && canSee(p.visibility6, visibility)) {
            if (this.obj6 === exports.UNDEFINED) {
                this.obj6 = inj._new(p.provider6, p.visibility6);
            }
            return this.obj6;
        }
        if (p.keyId7 === keyId && canSee(p.visibility7, visibility)) {
            if (this.obj7 === exports.UNDEFINED) {
                this.obj7 = inj._new(p.provider7, p.visibility7);
            }
            return this.obj7;
        }
        if (p.keyId8 === keyId && canSee(p.visibility8, visibility)) {
            if (this.obj8 === exports.UNDEFINED) {
                this.obj8 = inj._new(p.provider8, p.visibility8);
            }
            return this.obj8;
        }
        if (p.keyId9 === keyId && canSee(p.visibility9, visibility)) {
            if (this.obj9 === exports.UNDEFINED) {
                this.obj9 = inj._new(p.provider9, p.visibility9);
            }
            return this.obj9;
        }
        return exports.UNDEFINED;
    };
    InjectorInlineStrategy.prototype.getObjAtIndex = function (index) {
        if (index == 0)
            return this.obj0;
        if (index == 1)
            return this.obj1;
        if (index == 2)
            return this.obj2;
        if (index == 3)
            return this.obj3;
        if (index == 4)
            return this.obj4;
        if (index == 5)
            return this.obj5;
        if (index == 6)
            return this.obj6;
        if (index == 7)
            return this.obj7;
        if (index == 8)
            return this.obj8;
        if (index == 9)
            return this.obj9;
        throw new exceptions_1.OutOfBoundsError(index);
    };
    InjectorInlineStrategy.prototype.getMaxNumberOfObjects = function () { return _MAX_CONSTRUCTION_COUNTER; };
    return InjectorInlineStrategy;
})();
exports.InjectorInlineStrategy = InjectorInlineStrategy;
var InjectorDynamicStrategy = (function () {
    function InjectorDynamicStrategy(protoStrategy, injector) {
        this.protoStrategy = protoStrategy;
        this.injector = injector;
        this.objs = collection_1.ListWrapper.createFixedSize(protoStrategy.providers.length);
        collection_1.ListWrapper.fill(this.objs, exports.UNDEFINED);
    }
    InjectorDynamicStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
    InjectorDynamicStrategy.prototype.instantiateProvider = function (provider, visibility) {
        return this.injector._new(provider, visibility);
    };
    InjectorDynamicStrategy.prototype.attach = function (parent, isHost) {
        var inj = this.injector;
        inj._parent = parent;
        inj._isHost = isHost;
    };
    InjectorDynamicStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this.protoStrategy;
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.keyIds[i] === keyId && canSee(p.visibilities[i], visibility)) {
                if (this.objs[i] === exports.UNDEFINED) {
                    this.objs[i] = this.injector._new(p.providers[i], p.visibilities[i]);
                }
                return this.objs[i];
            }
        }
        return exports.UNDEFINED;
    };
    InjectorDynamicStrategy.prototype.getObjAtIndex = function (index) {
        if (index < 0 || index >= this.objs.length) {
            throw new exceptions_1.OutOfBoundsError(index);
        }
        return this.objs[index];
    };
    InjectorDynamicStrategy.prototype.getMaxNumberOfObjects = function () { return this.objs.length; };
    return InjectorDynamicStrategy;
})();
exports.InjectorDynamicStrategy = InjectorDynamicStrategy;
var ProviderWithVisibility = (function () {
    function ProviderWithVisibility(provider, visibility) {
        this.provider = provider;
        this.visibility = visibility;
    }
    ;
    ProviderWithVisibility.prototype.getKeyId = function () { return this.provider.key.id; };
    return ProviderWithVisibility;
})();
exports.ProviderWithVisibility = ProviderWithVisibility;
/**
 * A dependency injection container used for instantiating objects and resolving dependencies.
 *
 * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
 * constructor dependencies.
 *
 * In typical use, application code asks for the dependencies in the constructor and they are
 * resolved by the `Injector`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jzjec0?p=preview))
 *
 * The following example creates an `Injector` configured to create `Engine` and `Car`.
 *
 * ```typescript
 * @Injectable()
 * class Engine {
 * }
 *
 * @Injectable()
 * class Car {
 *   constructor(public engine:Engine) {}
 * }
 *
 * var injector = Injector.resolveAndCreate([Car, Engine]);
 * var car = injector.get(Car);
 * expect(car instanceof Car).toBe(true);
 * expect(car.engine instanceof Engine).toBe(true);
 * ```
 *
 * Notice, we don't use the `new` operator because we explicitly want to have the `Injector`
 * resolve all of the object's dependencies automatically.
 */
var Injector = (function () {
    /**
     * Private
     */
    function Injector(_proto /* ProtoInjector */, _parent, _depProvider, _debugContext) {
        if (_parent === void 0) { _parent = null; }
        if (_depProvider === void 0) { _depProvider = null; }
        if (_debugContext === void 0) { _debugContext = null; }
        this._depProvider = _depProvider;
        this._debugContext = _debugContext;
        /** @internal */
        this._isHost = false;
        /** @internal */
        this._constructionCounter = 0;
        this._proto = _proto;
        this._parent = _parent;
        this._strategy = _proto._strategy.createInjectorStrategy(this);
    }
    /**
     * Turns an array of provider definitions into an array of resolved providers.
     *
     * A resolution is a process of flattening multiple nested arrays and converting individual
     * providers into an array of {@link ResolvedProvider}s.
     *
     * ### Example ([live demo](http://plnkr.co/edit/AiXTHi?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var providers = Injector.resolve([Car, [[Engine]]]);
     *
     * expect(providers.length).toEqual(2);
     *
     * expect(providers[0] instanceof ResolvedProvider).toBe(true);
     * expect(providers[0].key.displayName).toBe("Car");
     * expect(providers[0].dependencies.length).toEqual(1);
     * expect(providers[0].factory).toBeDefined();
     *
     * expect(providers[1].key.displayName).toBe("Engine");
     * });
     * ```
     *
     * See {@link Injector#fromResolvedProviders} for more info.
     */
    Injector.resolve = function (providers) {
        return provider_1.resolveProviders(providers);
    };
    /**
     * Resolves an array of providers and creates an injector from those providers.
     *
     * The passed-in providers can be an array of `Type`, {@link Provider},
     * or a recursive array of more providers.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ePOccA?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Car, Engine]);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     *
     * This function is slower than the corresponding `fromResolvedProviders`
     * because it needs to resolve the passed-in providers first.
     * See {@link Injector#resolve} and {@link Injector#fromResolvedProviders}.
     */
    Injector.resolveAndCreate = function (providers) {
        var resolvedProviders = Injector.resolve(providers);
        return Injector.fromResolvedProviders(resolvedProviders);
    };
    /**
     * Creates an injector from previously resolved providers.
     *
     * This API is the recommended way to construct injectors in performance-sensitive parts.
     *
     * ### Example ([live demo](http://plnkr.co/edit/KrSMci?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var providers = Injector.resolve([Car, Engine]);
     * var injector = Injector.fromResolvedProviders(providers);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     */
    Injector.fromResolvedProviders = function (providers) {
        var bd = providers.map(function (b) { return new ProviderWithVisibility(b, Visibility.Public); });
        var proto = new ProtoInjector(bd);
        return new Injector(proto, null, null);
    };
    /**
     * @deprecated
     */
    Injector.fromResolvedBindings = function (providers) {
        return Injector.fromResolvedProviders(providers);
    };
    /**
     * @internal
     */
    Injector.prototype.debugContext = function () { return this._debugContext(); };
    /**
     * Retrieves an instance from the injector based on the provided token.
     * Throws {@link NoProviderError} if not found.
     *
     * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.get("validToken")).toEqual("Value");
     * expect(() => injector.get("invalidToken")).toThrowError();
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([]);
     * expect(injector.get(Injector)).toBe(injector);
     * ```
     */
    Injector.prototype.get = function (token) {
        return this._getByKey(key_1.Key.get(token), null, null, false, Visibility.PublicAndPrivate);
    };
    /**
     * Retrieves an instance from the injector based on the provided token.
     * Returns null if not found.
     *
     * ### Example ([live demo](http://plnkr.co/edit/tpEbEy?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.getOptional("validToken")).toEqual("Value");
     * expect(injector.getOptional("invalidToken")).toBe(null);
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([]);
     * expect(injector.getOptional(Injector)).toBe(injector);
     * ```
     */
    Injector.prototype.getOptional = function (token) {
        return this._getByKey(key_1.Key.get(token), null, null, true, Visibility.PublicAndPrivate);
    };
    /**
     * @internal
     */
    Injector.prototype.getAt = function (index) { return this._strategy.getObjAtIndex(index); };
    Object.defineProperty(Injector.prototype, "parent", {
        /**
         * Parent of this injector.
         *
         * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
         * -->
         *
         * ### Example ([live demo](http://plnkr.co/edit/eosMGo?p=preview))
         *
         * ```typescript
         * var parent = Injector.resolveAndCreate([]);
         * var child = parent.resolveAndCreateChild([]);
         * expect(child.parent).toBe(parent);
         * ```
         */
        get: function () { return this._parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Injector.prototype, "internalStrategy", {
        /**
         * @internal
         * Internal. Do not use.
         * We return `any` not to export the InjectorStrategy type.
         */
        get: function () { return this._strategy; },
        enumerable: true,
        configurable: true
    });
    /**
     * Resolves an array of providers and creates a child injector from those providers.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * The passed-in providers can be an array of `Type`, {@link Provider},
     * or a recursive array of more providers.
     *
     * ### Example ([live demo](http://plnkr.co/edit/opB3T4?p=preview))
     *
     * ```typescript
     * class ParentProvider {}
     * class ChildProvider {}
     *
     * var parent = Injector.resolveAndCreate([ParentProvider]);
     * var child = parent.resolveAndCreateChild([ChildProvider]);
     *
     * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
     * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
     * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
     * ```
     *
     * This function is slower than the corresponding `createChildFromResolved`
     * because it needs to resolve the passed-in providers first.
     * See {@link Injector#resolve} and {@link Injector#createChildFromResolved}.
     */
    Injector.prototype.resolveAndCreateChild = function (providers) {
        var resolvedProviders = Injector.resolve(providers);
        return this.createChildFromResolved(resolvedProviders);
    };
    /**
     * Creates a child injector from previously resolved providers.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * This API is the recommended way to construct injectors in performance-sensitive parts.
     *
     * ### Example ([live demo](http://plnkr.co/edit/VhyfjN?p=preview))
     *
     * ```typescript
     * class ParentProvider {}
     * class ChildProvider {}
     *
     * var parentProviders = Injector.resolve([ParentProvider]);
     * var childProviders = Injector.resolve([ChildProvider]);
     *
     * var parent = Injector.fromResolvedProviders(parentProviders);
     * var child = parent.createChildFromResolved(childProviders);
     *
     * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
     * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
     * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
     * ```
     */
    Injector.prototype.createChildFromResolved = function (providers) {
        var bd = providers.map(function (b) { return new ProviderWithVisibility(b, Visibility.Public); });
        var proto = new ProtoInjector(bd);
        var inj = new Injector(proto, null, null);
        inj._parent = this;
        return inj;
    };
    /**
     * Resolves a provider and instantiates an object in the context of the injector.
     *
     * The created object does not get cached by the injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/yvVXoB?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Engine]);
     *
     * var car = injector.resolveAndInstantiate(Car);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.resolveAndInstantiate(Car));
     * ```
     */
    Injector.prototype.resolveAndInstantiate = function (provider) {
        return this.instantiateResolved(Injector.resolve([provider])[0]);
    };
    /**
     * Instantiates an object using a resolved provider in the context of the injector.
     *
     * The created object does not get cached by the injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ptCImQ?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Engine]);
     * var carProvider = Injector.resolve([Car])[0];
     * var car = injector.instantiateResolved(carProvider);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.instantiateResolved(carProvider));
     * ```
     */
    Injector.prototype.instantiateResolved = function (provider) {
        return this._instantiateProvider(provider, Visibility.PublicAndPrivate);
    };
    /** @internal */
    Injector.prototype._new = function (provider, visibility) {
        if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
            throw new exceptions_1.CyclicDependencyError(this, provider.key);
        }
        return this._instantiateProvider(provider, visibility);
    };
    Injector.prototype._instantiateProvider = function (provider, visibility) {
        if (provider.multiProvider) {
            var res = collection_1.ListWrapper.createFixedSize(provider.resolvedFactories.length);
            for (var i = 0; i < provider.resolvedFactories.length; ++i) {
                res[i] = this._instantiate(provider, provider.resolvedFactories[i], visibility);
            }
            return res;
        }
        else {
            return this._instantiate(provider, provider.resolvedFactories[0], visibility);
        }
    };
    Injector.prototype._instantiate = function (provider, resolvedFactory, visibility) {
        var factory = resolvedFactory.factory;
        var deps = resolvedFactory.dependencies;
        var length = deps.length;
        var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19;
        try {
            d0 = length > 0 ? this._getByDependency(provider, deps[0], visibility) : null;
            d1 = length > 1 ? this._getByDependency(provider, deps[1], visibility) : null;
            d2 = length > 2 ? this._getByDependency(provider, deps[2], visibility) : null;
            d3 = length > 3 ? this._getByDependency(provider, deps[3], visibility) : null;
            d4 = length > 4 ? this._getByDependency(provider, deps[4], visibility) : null;
            d5 = length > 5 ? this._getByDependency(provider, deps[5], visibility) : null;
            d6 = length > 6 ? this._getByDependency(provider, deps[6], visibility) : null;
            d7 = length > 7 ? this._getByDependency(provider, deps[7], visibility) : null;
            d8 = length > 8 ? this._getByDependency(provider, deps[8], visibility) : null;
            d9 = length > 9 ? this._getByDependency(provider, deps[9], visibility) : null;
            d10 = length > 10 ? this._getByDependency(provider, deps[10], visibility) : null;
            d11 = length > 11 ? this._getByDependency(provider, deps[11], visibility) : null;
            d12 = length > 12 ? this._getByDependency(provider, deps[12], visibility) : null;
            d13 = length > 13 ? this._getByDependency(provider, deps[13], visibility) : null;
            d14 = length > 14 ? this._getByDependency(provider, deps[14], visibility) : null;
            d15 = length > 15 ? this._getByDependency(provider, deps[15], visibility) : null;
            d16 = length > 16 ? this._getByDependency(provider, deps[16], visibility) : null;
            d17 = length > 17 ? this._getByDependency(provider, deps[17], visibility) : null;
            d18 = length > 18 ? this._getByDependency(provider, deps[18], visibility) : null;
            d19 = length > 19 ? this._getByDependency(provider, deps[19], visibility) : null;
        }
        catch (e) {
            if (e instanceof exceptions_1.AbstractProviderError || e instanceof exceptions_1.InstantiationError) {
                e.addKey(this, provider.key);
            }
            throw e;
        }
        var obj;
        try {
            switch (length) {
                case 0:
                    obj = factory();
                    break;
                case 1:
                    obj = factory(d0);
                    break;
                case 2:
                    obj = factory(d0, d1);
                    break;
                case 3:
                    obj = factory(d0, d1, d2);
                    break;
                case 4:
                    obj = factory(d0, d1, d2, d3);
                    break;
                case 5:
                    obj = factory(d0, d1, d2, d3, d4);
                    break;
                case 6:
                    obj = factory(d0, d1, d2, d3, d4, d5);
                    break;
                case 7:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6);
                    break;
                case 8:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                    break;
                case 9:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                    break;
                case 10:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                    break;
                case 11:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
                    break;
                case 12:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
                    break;
                case 13:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
                    break;
                case 14:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
                    break;
                case 15:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
                    break;
                case 16:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
                    break;
                case 17:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
                    break;
                case 18:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
                    break;
                case 19:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
                    break;
                case 20:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
                    break;
            }
        }
        catch (e) {
            throw new exceptions_1.InstantiationError(this, e, e.stack, provider.key);
        }
        return obj;
    };
    Injector.prototype._getByDependency = function (provider, dep, providerVisibility) {
        var special = lang_1.isPresent(this._depProvider) ?
            this._depProvider.getDependency(this, provider, dep) :
            exports.UNDEFINED;
        if (special !== exports.UNDEFINED) {
            return special;
        }
        else {
            return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional, providerVisibility);
        }
    };
    Injector.prototype._getByKey = function (key, lowerBoundVisibility, upperBoundVisibility, optional, providerVisibility) {
        if (key === INJECTOR_KEY) {
            return this;
        }
        if (upperBoundVisibility instanceof metadata_1.SelfMetadata) {
            return this._getByKeySelf(key, optional, providerVisibility);
        }
        else if (upperBoundVisibility instanceof metadata_1.HostMetadata) {
            return this._getByKeyHost(key, optional, providerVisibility, lowerBoundVisibility);
        }
        else {
            return this._getByKeyDefault(key, optional, providerVisibility, lowerBoundVisibility);
        }
    };
    /** @internal */
    Injector.prototype._throwOrNull = function (key, optional) {
        if (optional) {
            return null;
        }
        else {
            throw new exceptions_1.NoProviderError(this, key);
        }
    };
    /** @internal */
    Injector.prototype._getByKeySelf = function (key, optional, providerVisibility) {
        var obj = this._strategy.getObjByKeyId(key.id, providerVisibility);
        return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    /** @internal */
    Injector.prototype._getByKeyHost = function (key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
            if (inj._isHost) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== exports.UNDEFINED)
                return obj;
            if (lang_1.isPresent(inj._parent) && inj._isHost) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        return this._throwOrNull(key, optional);
    };
    /** @internal */
    Injector.prototype._getPrivateDependency = function (key, optional, inj) {
        var obj = inj._parent._strategy.getObjByKeyId(key.id, Visibility.Private);
        return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    /** @internal */
    Injector.prototype._getByKeyDefault = function (key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
            providerVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== exports.UNDEFINED)
                return obj;
            providerVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        return this._throwOrNull(key, optional);
    };
    Object.defineProperty(Injector.prototype, "displayName", {
        get: function () {
            return "Injector(providers: [" + _mapProviders(this, function (b) { return (" \"" + b.key.displayName + "\" "); }).join(", ") + "])";
        },
        enumerable: true,
        configurable: true
    });
    Injector.prototype.toString = function () { return this.displayName; };
    return Injector;
})();
exports.Injector = Injector;
var INJECTOR_KEY = key_1.Key.get(Injector);
function _mapProviders(injector, fn) {
    var res = [];
    for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
        res.push(fn(injector._proto.getProviderAtIndex(i)));
    }
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6WyJWaXNpYmlsaXR5IiwiY2FuU2VlIiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5IiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5LmdldFByb3ZpZGVyQXRJbmRleCIsIlByb3RvSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5jcmVhdGVJbmplY3RvclN0cmF0ZWd5IiwiUHJvdG9JbmplY3RvckR5bmFtaWNTdHJhdGVneSIsIlByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJQcm90b0luamVjdG9yRHluYW1pY1N0cmF0ZWd5LmdldFByb3ZpZGVyQXRJbmRleCIsIlByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY3JlYXRlSW5qZWN0b3JTdHJhdGVneSIsIlByb3RvSW5qZWN0b3IiLCJQcm90b0luamVjdG9yLmNvbnN0cnVjdG9yIiwiUHJvdG9JbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5IiwiSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5jb25zdHJ1Y3RvciIsIkluamVjdG9ySW5saW5lU3RyYXRlZ3kucmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyIiwiSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5hdHRhY2giLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE9iakJ5S2V5SWQiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE9iakF0SW5kZXgiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE1heE51bWJlck9mT2JqZWN0cyIsIkluamVjdG9yRHluYW1pY1N0cmF0ZWd5IiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5yZXNldENvbnN0cnVjdGlvbkNvdW50ZXIiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuYXR0YWNoIiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuZ2V0T2JqQnlLZXlJZCIsIkluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmdldE9iakF0SW5kZXgiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5nZXRNYXhOdW1iZXJPZk9iamVjdHMiLCJQcm92aWRlcldpdGhWaXNpYmlsaXR5IiwiUHJvdmlkZXJXaXRoVmlzaWJpbGl0eS5jb25zdHJ1Y3RvciIsIlByb3ZpZGVyV2l0aFZpc2liaWxpdHkuZ2V0S2V5SWQiLCJJbmplY3RvciIsIkluamVjdG9yLmNvbnN0cnVjdG9yIiwiSW5qZWN0b3IucmVzb2x2ZSIsIkluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUiLCJJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMiLCJJbmplY3Rvci5mcm9tUmVzb2x2ZWRCaW5kaW5ncyIsIkluamVjdG9yLmRlYnVnQ29udGV4dCIsIkluamVjdG9yLmdldCIsIkluamVjdG9yLmdldE9wdGlvbmFsIiwiSW5qZWN0b3IuZ2V0QXQiLCJJbmplY3Rvci5wYXJlbnQiLCJJbmplY3Rvci5pbnRlcm5hbFN0cmF0ZWd5IiwiSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZUNoaWxkIiwiSW5qZWN0b3IuY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQiLCJJbmplY3Rvci5yZXNvbHZlQW5kSW5zdGFudGlhdGUiLCJJbmplY3Rvci5pbnN0YW50aWF0ZVJlc29sdmVkIiwiSW5qZWN0b3IuX25ldyIsIkluamVjdG9yLl9pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3IuX2luc3RhbnRpYXRlIiwiSW5qZWN0b3IuX2dldEJ5RGVwZW5kZW5jeSIsIkluamVjdG9yLl9nZXRCeUtleSIsIkluamVjdG9yLl90aHJvd09yTnVsbCIsIkluamVjdG9yLl9nZXRCeUtleVNlbGYiLCJJbmplY3Rvci5fZ2V0QnlLZXlIb3N0IiwiSW5qZWN0b3IuX2dldFByaXZhdGVEZXBlbmRlbmN5IiwiSW5qZWN0b3IuX2dldEJ5S2V5RGVmYXVsdCIsIkluamVjdG9yLmRpc3BsYXlOYW1lIiwiSW5qZWN0b3IudG9TdHJpbmciLCJfbWFwUHJvdmlkZXJzIl0sIm1hcHBpbmdzIjoiQUFBQSwyQkFBMkMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM1RSx5QkFRTyxZQUFZLENBQUMsQ0FBQTtBQUNwQiwyQkFPTyxjQUFjLENBQUMsQ0FBQTtBQUN0QixxQkFBb0UsMEJBQTBCLENBQUMsQ0FBQTtBQUMvRixvQkFBa0IsT0FBTyxDQUFDLENBQUE7QUFDMUIseUJBQTJELFlBQVksQ0FBQyxDQUFBO0FBRXhFLG9DQUFvQztBQUNwQyxJQUFNLHlCQUF5QixHQUFHLEVBQUUsQ0FBQztBQUV4QixpQkFBUyxHQUFXLGlCQUFVLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBRTFEOztHQUVHO0FBQ0gsV0FBWSxVQUFVO0lBQ3BCQTs7T0FFR0E7SUFDSEEsK0NBQU1BLENBQUFBO0lBQ05BOztPQUVHQTtJQUNIQSxpREFBT0EsQ0FBQUE7SUFDUEE7O09BRUdBO0lBQ0hBLG1FQUFnQkEsQ0FBQUE7QUFDbEJBLENBQUNBLEVBYlcsa0JBQVUsS0FBVixrQkFBVSxRQWFyQjtBQWJELElBQVksVUFBVSxHQUFWLGtCQWFYLENBQUE7QUFFRCxnQkFBZ0IsR0FBZSxFQUFFLEdBQWU7SUFDOUNDLE1BQU1BLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLEdBQUdBLENBQUNBO1FBQ2JBLENBQUNBLEdBQUdBLEtBQUtBLFVBQVVBLENBQUNBLGdCQUFnQkEsSUFBSUEsR0FBR0EsS0FBS0EsVUFBVUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQTtBQUN0RkEsQ0FBQ0E7QUFRRDtJQWtDRUMscUNBQVlBLE9BQXNCQSxFQUFFQSxHQUE2QkE7UUFqQ2pFQyxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFFbkNBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBRXRCQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFHN0JBLElBQUlBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBO1FBRXhCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERCx3REFBa0JBLEdBQWxCQSxVQUFtQkEsS0FBYUE7UUFDOUJFLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0Es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Q0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsaUJBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsaUJBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsaUJBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsaUJBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsaUJBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsaUJBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsaUJBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsaUJBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsaUJBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxpQkFBU0EsQ0FBQ0E7SUFDbkJBLENBQUNBO0lBRURMLDhDQUFhQSxHQUFiQSxVQUFjQSxLQUFhQTtRQUN6Qk0sRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLE1BQU1BLElBQUlBLDZC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QUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQTtRQUM3RkEsSUFBSUEsQ0FBQ0E7WUFDSEEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNuRkEsQ0FBRUE7UUFBQUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDWEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsa0NBQXFCQSxJQUFJQSxDQUFDQSxZQUFZQSwrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLENBQUNBO1FBQ1ZBLENBQUNBO1FBRURBLElBQUlBLEdBQUdBLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBO1lBQ0hBLE1BQU1BLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO2dCQUNmQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsRUFBRUEsQ0FBQ0E7b0JBQ2hCQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO29CQUNsQkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDdEJBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzFCQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUM5QkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDbENBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ3RDQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUMxQ0EsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDOUNBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2xEQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUN0REEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDM0RBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2hFQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUNyRUEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDMUVBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQy9FQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUNwRkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDekZBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFDekVBLEdBQUdBLENBQUNBLENBQUNBO29CQUNuQkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUN6RUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3hCQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVB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LE1BQU1BLENBQUNBLDBCQUF3QkEsYUFBYUEsQ0FBQ0EsSUFBSUEsRUFBRUEsVUFBQUEsQ0FBQ0EsSUFBSUEsT0FBQUEsU0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsU0FBSUEsRUFBMUJBLENBQTBCQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFJQSxDQUFDQTtRQUNyR0EsQ0FBQ0E7OztPQUFBMUI7SUFFREEsMkJBQVFBLEdBQVJBLGNBQXFCMkIsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDakQzQixlQUFDQTtBQUFEQSxDQUFDQSxBQXBqQkQsSUFvakJDO0FBcGpCWSxnQkFBUSxXQW9qQnBCLENBQUE7QUFFRCxJQUFJLFlBQVksR0FBRyxTQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBR3JDLHVCQUF1QixRQUFrQixFQUFFLEVBQVk7SUFDckQ0QixJQUFJQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUNiQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxpQkFBaUJBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO1FBQzNEQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3REQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtBQUNiQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWFwLCBNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIFJlc29sdmVkUHJvdmlkZXIsXG4gIFByb3ZpZGVyLFxuICBEZXBlbmRlbmN5LFxuICBQcm92aWRlckJ1aWxkZXIsXG4gIFJlc29sdmVkRmFjdG9yeSxcbiAgcHJvdmlkZSxcbiAgcmVzb2x2ZVByb3ZpZGVyc1xufSBmcm9tICcuL3Byb3ZpZGVyJztcbmltcG9ydCB7XG4gIEFic3RyYWN0UHJvdmlkZXJFcnJvcixcbiAgTm9Qcm92aWRlckVycm9yLFxuICBDeWNsaWNEZXBlbmRlbmN5RXJyb3IsXG4gIEluc3RhbnRpYXRpb25FcnJvcixcbiAgSW52YWxpZFByb3ZpZGVyRXJyb3IsXG4gIE91dE9mQm91bmRzRXJyb3Jcbn0gZnJvbSAnLi9leGNlcHRpb25zJztcbmltcG9ydCB7RnVuY3Rpb25XcmFwcGVyLCBUeXBlLCBpc1ByZXNlbnQsIGlzQmxhbmssIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0tleX0gZnJvbSAnLi9rZXknO1xuaW1wb3J0IHtTZWxmTWV0YWRhdGEsIEhvc3RNZXRhZGF0YSwgU2tpcFNlbGZNZXRhZGF0YX0gZnJvbSAnLi9tZXRhZGF0YSc7XG5cbi8vIFRocmVzaG9sZCBmb3IgdGhlIGR5bmFtaWMgdmVyc2lvblxuY29uc3QgX01BWF9DT05TVFJVQ1RJT05fQ09VTlRFUiA9IDEwO1xuXG5leHBvcnQgY29uc3QgVU5ERUZJTkVEOiBPYmplY3QgPSBDT05TVF9FWFBSKG5ldyBPYmplY3QoKSk7XG5cbi8qKlxuICogVmlzaWJpbGl0eSBvZiBhIHtAbGluayBQcm92aWRlcn0uXG4gKi9cbmV4cG9ydCBlbnVtIFZpc2liaWxpdHkge1xuICAvKipcbiAgICogQSBgUHVibGljYCB7QGxpbmsgUHJvdmlkZXJ9IGlzIG9ubHkgdmlzaWJsZSB0byByZWd1bGFyIChhcyBvcHBvc2VkIHRvIGhvc3QpIGNoaWxkIGluamVjdG9ycy5cbiAgICovXG4gIFB1YmxpYyxcbiAgLyoqXG4gICAqIEEgYFByaXZhdGVgIHtAbGluayBQcm92aWRlcn0gaXMgb25seSB2aXNpYmxlIHRvIGhvc3QgKGFzIG9wcG9zZWQgdG8gcmVndWxhcikgY2hpbGQgaW5qZWN0b3JzLlxuICAgKi9cbiAgUHJpdmF0ZSxcbiAgLyoqXG4gICAqIEEgYFB1YmxpY0FuZFByaXZhdGVgIHtAbGluayBQcm92aWRlcn0gaXMgdmlzaWJsZSB0byBib3RoIGhvc3QgYW5kIHJlZ3VsYXIgY2hpbGQgaW5qZWN0b3JzLlxuICAgKi9cbiAgUHVibGljQW5kUHJpdmF0ZVxufVxuXG5mdW5jdGlvbiBjYW5TZWUoc3JjOiBWaXNpYmlsaXR5LCBkc3Q6IFZpc2liaWxpdHkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChzcmMgPT09IGRzdCkgfHxcbiAgICAgICAgIChkc3QgPT09IFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSB8fCBzcmMgPT09IFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSk7XG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBQcm90b0luamVjdG9yU3RyYXRlZ3kge1xuICBnZXRQcm92aWRlckF0SW5kZXgoaW5kZXg6IG51bWJlcik6IFJlc29sdmVkUHJvdmlkZXI7XG4gIGNyZWF0ZUluamVjdG9yU3RyYXRlZ3koaW5qOiBJbmplY3Rvcik6IEluamVjdG9yU3RyYXRlZ3k7XG59XG5cbmV4cG9ydCBjbGFzcyBQcm90b0luamVjdG9ySW5saW5lU3RyYXRlZ3kgaW1wbGVtZW50cyBQcm90b0luamVjdG9yU3RyYXRlZ3kge1xuICBwcm92aWRlcjA6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuICBwcm92aWRlcjE6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuICBwcm92aWRlcjI6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuICBwcm92aWRlcjM6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuICBwcm92aWRlcjQ6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuICBwcm92aWRlcjU6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuICBwcm92aWRlcjY6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuICBwcm92aWRlcjc6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuICBwcm92aWRlcjg6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuICBwcm92aWRlcjk6IFJlc29sdmVkUHJvdmlkZXIgPSBudWxsO1xuXG4gIGtleUlkMDogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQxOiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDI6IG51bWJlciA9IG51bGw7XG4gIGtleUlkMzogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQ0OiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDU6IG51bWJlciA9IG51bGw7XG4gIGtleUlkNjogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQ3OiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDg6IG51bWJlciA9IG51bGw7XG4gIGtleUlkOTogbnVtYmVyID0gbnVsbDtcblxuICB2aXNpYmlsaXR5MDogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHkxOiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTI6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5MzogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHk0OiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTU6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5NjogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHk3OiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTg6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5OTogVmlzaWJpbGl0eSA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJvdG9FSTogUHJvdG9JbmplY3RvciwgYnd2OiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10pIHtcbiAgICB2YXIgbGVuZ3RoID0gYnd2Lmxlbmd0aDtcblxuICAgIGlmIChsZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnByb3ZpZGVyMCA9IGJ3dlswXS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQwID0gYnd2WzBdLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHkwID0gYnd2WzBdLnZpc2liaWxpdHk7XG4gICAgfVxuICAgIGlmIChsZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLnByb3ZpZGVyMSA9IGJ3dlsxXS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQxID0gYnd2WzFdLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHkxID0gYnd2WzFdLnZpc2liaWxpdHk7XG4gICAgfVxuICAgIGlmIChsZW5ndGggPiAyKSB7XG4gICAgICB0aGlzLnByb3ZpZGVyMiA9IGJ3dlsyXS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQyID0gYnd2WzJdLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHkyID0gYnd2WzJdLnZpc2liaWxpdHk7XG4gICAgfVxuICAgIGlmIChsZW5ndGggPiAzKSB7XG4gICAgICB0aGlzLnByb3ZpZGVyMyA9IGJ3dlszXS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQzID0gYnd2WzNdLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHkzID0gYnd2WzNdLnZpc2liaWxpdHk7XG4gICAgfVxuICAgIGlmIChsZW5ndGggPiA0KSB7XG4gICAgICB0aGlzLnByb3ZpZGVyNCA9IGJ3dls0XS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQ0ID0gYnd2WzRdLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHk0ID0gYnd2WzRdLnZpc2liaWxpdHk7XG4gICAgfVxuICAgIGlmIChsZW5ndGggPiA1KSB7XG4gICAgICB0aGlzLnByb3ZpZGVyNSA9IGJ3dls1XS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQ1ID0gYnd2WzVdLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHk1ID0gYnd2WzVdLnZpc2liaWxpdHk7XG4gICAgfVxuICAgIGlmIChsZW5ndGggPiA2KSB7XG4gICAgICB0aGlzLnByb3ZpZGVyNiA9IGJ3dls2XS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQ2ID0gYnd2WzZdLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHk2ID0gYnd2WzZdLnZpc2liaWxpdHk7XG4gICAgfVxuICAgIGlmIChsZW5ndGggPiA3KSB7XG4gICAgICB0aGlzLnByb3ZpZGVyNyA9IGJ3dls3XS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQ3ID0gYnd2WzddLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHk3ID0gYnd2WzddLnZpc2liaWxpdHk7XG4gICAgfVxuICAgIGlmIChsZW5ndGggPiA4KSB7XG4gICAgICB0aGlzLnByb3ZpZGVyOCA9IGJ3dls4XS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQ4ID0gYnd2WzhdLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHk4ID0gYnd2WzhdLnZpc2liaWxpdHk7XG4gICAgfVxuICAgIGlmIChsZW5ndGggPiA5KSB7XG4gICAgICB0aGlzLnByb3ZpZGVyOSA9IGJ3dls5XS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWQ5ID0gYnd2WzldLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHk5ID0gYnd2WzldLnZpc2liaWxpdHk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkge1xuICAgIGlmIChpbmRleCA9PSAwKSByZXR1cm4gdGhpcy5wcm92aWRlcjA7XG4gICAgaWYgKGluZGV4ID09IDEpIHJldHVybiB0aGlzLnByb3ZpZGVyMTtcbiAgICBpZiAoaW5kZXggPT0gMikgcmV0dXJuIHRoaXMucHJvdmlkZXIyO1xuICAgIGlmIChpbmRleCA9PSAzKSByZXR1cm4gdGhpcy5wcm92aWRlcjM7XG4gICAgaWYgKGluZGV4ID09IDQpIHJldHVybiB0aGlzLnByb3ZpZGVyNDtcbiAgICBpZiAoaW5kZXggPT0gNSkgcmV0dXJuIHRoaXMucHJvdmlkZXI1O1xuICAgIGlmIChpbmRleCA9PSA2KSByZXR1cm4gdGhpcy5wcm92aWRlcjY7XG4gICAgaWYgKGluZGV4ID09IDcpIHJldHVybiB0aGlzLnByb3ZpZGVyNztcbiAgICBpZiAoaW5kZXggPT0gOCkgcmV0dXJuIHRoaXMucHJvdmlkZXI4O1xuICAgIGlmIChpbmRleCA9PSA5KSByZXR1cm4gdGhpcy5wcm92aWRlcjk7XG4gICAgdGhyb3cgbmV3IE91dE9mQm91bmRzRXJyb3IoaW5kZXgpO1xuICB9XG5cbiAgY3JlYXRlSW5qZWN0b3JTdHJhdGVneShpbmplY3RvcjogSW5qZWN0b3IpOiBJbmplY3RvclN0cmF0ZWd5IHtcbiAgICByZXR1cm4gbmV3IEluamVjdG9ySW5saW5lU3RyYXRlZ3koaW5qZWN0b3IsIHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm90b0luamVjdG9yRHluYW1pY1N0cmF0ZWd5IGltcGxlbWVudHMgUHJvdG9JbmplY3RvclN0cmF0ZWd5IHtcbiAgcHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW107XG4gIGtleUlkczogbnVtYmVyW107XG4gIHZpc2liaWxpdGllczogVmlzaWJpbGl0eVtdO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RvSW5qOiBQcm90b0luamVjdG9yLCBid3Y6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSkge1xuICAgIHZhciBsZW4gPSBid3YubGVuZ3RoO1xuXG4gICAgdGhpcy5wcm92aWRlcnMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGVuKTtcbiAgICB0aGlzLmtleUlkcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW4pO1xuICAgIHRoaXMudmlzaWJpbGl0aWVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0aGlzLnByb3ZpZGVyc1tpXSA9IGJ3dltpXS5wcm92aWRlcjtcbiAgICAgIHRoaXMua2V5SWRzW2ldID0gYnd2W2ldLmdldEtleUlkKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdGllc1tpXSA9IGJ3dltpXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgfVxuXG4gIGdldFByb3ZpZGVyQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMucHJvdmlkZXJzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IE91dE9mQm91bmRzRXJyb3IoaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm92aWRlcnNbaW5kZXhdO1xuICB9XG5cbiAgY3JlYXRlSW5qZWN0b3JTdHJhdGVneShlaTogSW5qZWN0b3IpOiBJbmplY3RvclN0cmF0ZWd5IHtcbiAgICByZXR1cm4gbmV3IEluamVjdG9yRHluYW1pY1N0cmF0ZWd5KHRoaXMsIGVpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9JbmplY3RvciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmF0ZWd5OiBQcm90b0luamVjdG9yU3RyYXRlZ3k7XG4gIG51bWJlck9mUHJvdmlkZXJzOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoYnd2OiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10pIHtcbiAgICB0aGlzLm51bWJlck9mUHJvdmlkZXJzID0gYnd2Lmxlbmd0aDtcbiAgICB0aGlzLl9zdHJhdGVneSA9IGJ3di5sZW5ndGggPiBfTUFYX0NPTlNUUlVDVElPTl9DT1VOVEVSID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUHJvdG9JbmplY3RvckR5bmFtaWNTdHJhdGVneSh0aGlzLCBid3YpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5KHRoaXMsIGJ3dik7XG4gIH1cblxuICBnZXRQcm92aWRlckF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueSB7IHJldHVybiB0aGlzLl9zdHJhdGVneS5nZXRQcm92aWRlckF0SW5kZXgoaW5kZXgpOyB9XG59XG5cblxuXG5leHBvcnQgaW50ZXJmYWNlIEluamVjdG9yU3RyYXRlZ3kge1xuICBnZXRPYmpCeUtleUlkKGtleUlkOiBudW1iZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnk7XG4gIGdldE9iakF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueTtcbiAgZ2V0TWF4TnVtYmVyT2ZPYmplY3RzKCk6IG51bWJlcjtcblxuICBhdHRhY2gocGFyZW50OiBJbmplY3RvciwgaXNIb3N0OiBib29sZWFuKTogdm9pZDtcbiAgcmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk6IHZvaWQ7XG4gIGluc3RhbnRpYXRlUHJvdmlkZXIocHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBJbmplY3RvcklubGluZVN0cmF0ZWd5IGltcGxlbWVudHMgSW5qZWN0b3JTdHJhdGVneSB7XG4gIG9iajA6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqMTogYW55ID0gVU5ERUZJTkVEO1xuICBvYmoyOiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajM6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqNDogYW55ID0gVU5ERUZJTkVEO1xuICBvYmo1OiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajY6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqNzogYW55ID0gVU5ERUZJTkVEO1xuICBvYmo4OiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajk6IGFueSA9IFVOREVGSU5FRDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yLCBwdWJsaWMgcHJvdG9TdHJhdGVneTogUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5KSB7fVxuXG4gIHJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpOiB2b2lkIHsgdGhpcy5pbmplY3Rvci5fY29uc3RydWN0aW9uQ291bnRlciA9IDA7IH1cblxuICBpbnN0YW50aWF0ZVByb3ZpZGVyKHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5pbmplY3Rvci5fbmV3KHByb3ZpZGVyLCB2aXNpYmlsaXR5KTtcbiAgfVxuXG4gIGF0dGFjaChwYXJlbnQ6IEluamVjdG9yLCBpc0hvc3Q6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgaW5qID0gdGhpcy5pbmplY3RvcjtcbiAgICBpbmouX3BhcmVudCA9IHBhcmVudDtcbiAgICBpbmouX2lzSG9zdCA9IGlzSG9zdDtcbiAgfVxuXG4gIGdldE9iakJ5S2V5SWQoa2V5SWQ6IG51bWJlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgdmFyIHAgPSB0aGlzLnByb3RvU3RyYXRlZ3k7XG4gICAgdmFyIGluaiA9IHRoaXMuaW5qZWN0b3I7XG5cbiAgICBpZiAocC5rZXlJZDAgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHkwLCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqMCA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqMCA9IGluai5fbmV3KHAucHJvdmlkZXIwLCBwLnZpc2liaWxpdHkwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajA7XG4gICAgfVxuICAgIGlmIChwLmtleUlkMSA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTEsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmoxID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmoxID0gaW5qLl9uZXcocC5wcm92aWRlcjEsIHAudmlzaWJpbGl0eTEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqMTtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQyID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5MiwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajIgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajIgPSBpbmouX25ldyhwLnByb3ZpZGVyMiwgcC52aXNpYmlsaXR5Mik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmoyO1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDMgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHkzLCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqMyA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqMyA9IGluai5fbmV3KHAucHJvdmlkZXIzLCBwLnZpc2liaWxpdHkzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajM7XG4gICAgfVxuICAgIGlmIChwLmtleUlkNCA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTQsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmo0ID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmo0ID0gaW5qLl9uZXcocC5wcm92aWRlcjQsIHAudmlzaWJpbGl0eTQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqNDtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQ1ID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5NSwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajUgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajUgPSBpbmouX25ldyhwLnByb3ZpZGVyNSwgcC52aXNpYmlsaXR5NSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmo1O1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDYgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHk2LCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqNiA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqNiA9IGluai5fbmV3KHAucHJvdmlkZXI2LCBwLnZpc2liaWxpdHk2KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajY7XG4gICAgfVxuICAgIGlmIChwLmtleUlkNyA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTcsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmo3ID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmo3ID0gaW5qLl9uZXcocC5wcm92aWRlcjcsIHAudmlzaWJpbGl0eTcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqNztcbiAgICB9XG4gICAgaWYgKHAua2V5SWQ4ID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5OCwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajggPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajggPSBpbmouX25ldyhwLnByb3ZpZGVyOCwgcC52aXNpYmlsaXR5OCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmo4O1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDkgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHk5LCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqOSA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqOSA9IGluai5fbmV3KHAucHJvdmlkZXI5LCBwLnZpc2liaWxpdHk5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFVOREVGSU5FRDtcbiAgfVxuXG4gIGdldE9iakF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGluZGV4ID09IDApIHJldHVybiB0aGlzLm9iajA7XG4gICAgaWYgKGluZGV4ID09IDEpIHJldHVybiB0aGlzLm9iajE7XG4gICAgaWYgKGluZGV4ID09IDIpIHJldHVybiB0aGlzLm9iajI7XG4gICAgaWYgKGluZGV4ID09IDMpIHJldHVybiB0aGlzLm9iajM7XG4gICAgaWYgKGluZGV4ID09IDQpIHJldHVybiB0aGlzLm9iajQ7XG4gICAgaWYgKGluZGV4ID09IDUpIHJldHVybiB0aGlzLm9iajU7XG4gICAgaWYgKGluZGV4ID09IDYpIHJldHVybiB0aGlzLm9iajY7XG4gICAgaWYgKGluZGV4ID09IDcpIHJldHVybiB0aGlzLm9iajc7XG4gICAgaWYgKGluZGV4ID09IDgpIHJldHVybiB0aGlzLm9iajg7XG4gICAgaWYgKGluZGV4ID09IDkpIHJldHVybiB0aGlzLm9iajk7XG4gICAgdGhyb3cgbmV3IE91dE9mQm91bmRzRXJyb3IoaW5kZXgpO1xuICB9XG5cbiAgZ2V0TWF4TnVtYmVyT2ZPYmplY3RzKCk6IG51bWJlciB7IHJldHVybiBfTUFYX0NPTlNUUlVDVElPTl9DT1VOVEVSOyB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEluamVjdG9yRHluYW1pY1N0cmF0ZWd5IGltcGxlbWVudHMgSW5qZWN0b3JTdHJhdGVneSB7XG4gIG9ianM6IGFueVtdO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm90b1N0cmF0ZWd5OiBQcm90b0luamVjdG9yRHluYW1pY1N0cmF0ZWd5LCBwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5vYmpzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKHByb3RvU3RyYXRlZ3kucHJvdmlkZXJzLmxlbmd0aCk7XG4gICAgTGlzdFdyYXBwZXIuZmlsbCh0aGlzLm9ianMsIFVOREVGSU5FRCk7XG4gIH1cblxuICByZXNldENvbnN0cnVjdGlvbkNvdW50ZXIoKTogdm9pZCB7IHRoaXMuaW5qZWN0b3IuX2NvbnN0cnVjdGlvbkNvdW50ZXIgPSAwOyB9XG5cbiAgaW5zdGFudGlhdGVQcm92aWRlcihwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuaW5qZWN0b3IuX25ldyhwcm92aWRlciwgdmlzaWJpbGl0eSk7XG4gIH1cblxuICBhdHRhY2gocGFyZW50OiBJbmplY3RvciwgaXNIb3N0OiBib29sZWFuKTogdm9pZCB7XG4gICAgdmFyIGluaiA9IHRoaXMuaW5qZWN0b3I7XG4gICAgaW5qLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgaW5qLl9pc0hvc3QgPSBpc0hvc3Q7XG4gIH1cblxuICBnZXRPYmpCeUtleUlkKGtleUlkOiBudW1iZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHZhciBwID0gdGhpcy5wcm90b1N0cmF0ZWd5O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmtleUlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAua2V5SWRzW2ldID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXRpZXNbaV0sIHZpc2liaWxpdHkpKSB7XG4gICAgICAgIGlmICh0aGlzLm9ianNbaV0gPT09IFVOREVGSU5FRCkge1xuICAgICAgICAgIHRoaXMub2Jqc1tpXSA9IHRoaXMuaW5qZWN0b3IuX25ldyhwLnByb3ZpZGVyc1tpXSwgcC52aXNpYmlsaXRpZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMub2Jqc1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gVU5ERUZJTkVEO1xuICB9XG5cbiAgZ2V0T2JqQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMub2Jqcy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBPdXRPZkJvdW5kc0Vycm9yKGluZGV4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5vYmpzW2luZGV4XTtcbiAgfVxuXG4gIGdldE1heE51bWJlck9mT2JqZWN0cygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5vYmpzLmxlbmd0aDsgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgcHVibGljIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpe307XG5cbiAgZ2V0S2V5SWQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMucHJvdmlkZXIua2V5LmlkOyB9XG59XG5cbi8qKlxuICogVXNlZCB0byBwcm92aWRlIGRlcGVuZGVuY2llcyB0aGF0IGNhbm5vdCBiZSBlYXNpbHkgZXhwcmVzc2VkIGFzIHByb3ZpZGVycy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZXBlbmRlbmN5UHJvdmlkZXIge1xuICBnZXREZXBlbmRlbmN5KGluamVjdG9yOiBJbmplY3RvciwgcHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpOiBhbnk7XG59XG5cbi8qKlxuICogQSBkZXBlbmRlbmN5IGluamVjdGlvbiBjb250YWluZXIgdXNlZCBmb3IgaW5zdGFudGlhdGluZyBvYmplY3RzIGFuZCByZXNvbHZpbmcgZGVwZW5kZW5jaWVzLlxuICpcbiAqIEFuIGBJbmplY3RvcmAgaXMgYSByZXBsYWNlbWVudCBmb3IgYSBgbmV3YCBvcGVyYXRvciwgd2hpY2ggY2FuIGF1dG9tYXRpY2FsbHkgcmVzb2x2ZSB0aGVcbiAqIGNvbnN0cnVjdG9yIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBJbiB0eXBpY2FsIHVzZSwgYXBwbGljYXRpb24gY29kZSBhc2tzIGZvciB0aGUgZGVwZW5kZW5jaWVzIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgdGhleSBhcmVcbiAqIHJlc29sdmVkIGJ5IHRoZSBgSW5qZWN0b3JgLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9qemplYzA/cD1wcmV2aWV3KSlcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhbiBgSW5qZWN0b3JgIGNvbmZpZ3VyZWQgdG8gY3JlYXRlIGBFbmdpbmVgIGFuZCBgQ2FyYC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBFbmdpbmUge1xuICogfVxuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIENhciB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbmdpbmU6RW5naW5lKSB7fVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0NhciwgRW5naW5lXSk7XG4gKiB2YXIgY2FyID0gaW5qZWN0b3IuZ2V0KENhcik7XG4gKiBleHBlY3QoY2FyIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICogZXhwZWN0KGNhci5lbmdpbmUgaW5zdGFuY2VvZiBFbmdpbmUpLnRvQmUodHJ1ZSk7XG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UsIHdlIGRvbid0IHVzZSB0aGUgYG5ld2Agb3BlcmF0b3IgYmVjYXVzZSB3ZSBleHBsaWNpdGx5IHdhbnQgdG8gaGF2ZSB0aGUgYEluamVjdG9yYFxuICogcmVzb2x2ZSBhbGwgb2YgdGhlIG9iamVjdCdzIGRlcGVuZGVuY2llcyBhdXRvbWF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgSW5qZWN0b3Ige1xuICAvKipcbiAgICogVHVybnMgYW4gYXJyYXkgb2YgcHJvdmlkZXIgZGVmaW5pdGlvbnMgaW50byBhbiBhcnJheSBvZiByZXNvbHZlZCBwcm92aWRlcnMuXG4gICAqXG4gICAqIEEgcmVzb2x1dGlvbiBpcyBhIHByb2Nlc3Mgb2YgZmxhdHRlbmluZyBtdWx0aXBsZSBuZXN0ZWQgYXJyYXlzIGFuZCBjb252ZXJ0aW5nIGluZGl2aWR1YWxcbiAgICogcHJvdmlkZXJzIGludG8gYW4gYXJyYXkgb2Yge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9cy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0FpWFRIaT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRW5naW5lIHtcbiAgICogfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIENhciB7XG4gICAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTpFbmdpbmUpIHt9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIHByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW0NhciwgW1tFbmdpbmVdXV0pO1xuICAgKlxuICAgKiBleHBlY3QocHJvdmlkZXJzLmxlbmd0aCkudG9FcXVhbCgyKTtcbiAgICpcbiAgICogZXhwZWN0KHByb3ZpZGVyc1swXSBpbnN0YW5jZW9mIFJlc29sdmVkUHJvdmlkZXIpLnRvQmUodHJ1ZSk7XG4gICAqIGV4cGVjdChwcm92aWRlcnNbMF0ua2V5LmRpc3BsYXlOYW1lKS50b0JlKFwiQ2FyXCIpO1xuICAgKiBleHBlY3QocHJvdmlkZXJzWzBdLmRlcGVuZGVuY2llcy5sZW5ndGgpLnRvRXF1YWwoMSk7XG4gICAqIGV4cGVjdChwcm92aWRlcnNbMF0uZmFjdG9yeSkudG9CZURlZmluZWQoKTtcbiAgICpcbiAgICogZXhwZWN0KHByb3ZpZGVyc1sxXS5rZXkuZGlzcGxheU5hbWUpLnRvQmUoXCJFbmdpbmVcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogU2VlIHtAbGluayBJbmplY3RvciNmcm9tUmVzb2x2ZWRQcm92aWRlcnN9IGZvciBtb3JlIGluZm8uXG4gICAqL1xuICBzdGF0aWMgcmVzb2x2ZShwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFJlc29sdmVkUHJvdmlkZXJbXSB7XG4gICAgcmV0dXJuIHJlc29sdmVQcm92aWRlcnMocHJvdmlkZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyBhbiBhcnJheSBvZiBwcm92aWRlcnMgYW5kIGNyZWF0ZXMgYW4gaW5qZWN0b3IgZnJvbSB0aG9zZSBwcm92aWRlcnMuXG4gICAqXG4gICAqIFRoZSBwYXNzZWQtaW4gcHJvdmlkZXJzIGNhbiBiZSBhbiBhcnJheSBvZiBgVHlwZWAsIHtAbGluayBQcm92aWRlcn0sXG4gICAqIG9yIGEgcmVjdXJzaXZlIGFycmF5IG9mIG1vcmUgcHJvdmlkZXJzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZVBPY2NBP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBFbmdpbmUge1xuICAgKiB9XG4gICAqXG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgQ2FyIHtcbiAgICogICBjb25zdHJ1Y3RvcihwdWJsaWMgZW5naW5lOkVuZ2luZSkge31cbiAgICogfVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtDYXIsIEVuZ2luZV0pO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KENhcikgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHNsb3dlciB0aGFuIHRoZSBjb3JyZXNwb25kaW5nIGBmcm9tUmVzb2x2ZWRQcm92aWRlcnNgXG4gICAqIGJlY2F1c2UgaXQgbmVlZHMgdG8gcmVzb2x2ZSB0aGUgcGFzc2VkLWluIHByb3ZpZGVycyBmaXJzdC5cbiAgICogU2VlIHtAbGluayBJbmplY3RvciNyZXNvbHZlfSBhbmQge0BsaW5rIEluamVjdG9yI2Zyb21SZXNvbHZlZFByb3ZpZGVyc30uXG4gICAqL1xuICBzdGF0aWMgcmVzb2x2ZUFuZENyZWF0ZShwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IEluamVjdG9yIHtcbiAgICB2YXIgcmVzb2x2ZWRQcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhyZXNvbHZlZFByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbmplY3RvciBmcm9tIHByZXZpb3VzbHkgcmVzb2x2ZWQgcHJvdmlkZXJzLlxuICAgKlxuICAgKiBUaGlzIEFQSSBpcyB0aGUgcmVjb21tZW5kZWQgd2F5IHRvIGNvbnN0cnVjdCBpbmplY3RvcnMgaW4gcGVyZm9ybWFuY2Utc2Vuc2l0aXZlIHBhcnRzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvS3JTTWNpP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBFbmdpbmUge1xuICAgKiB9XG4gICAqXG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgQ2FyIHtcbiAgICogICBjb25zdHJ1Y3RvcihwdWJsaWMgZW5naW5lOkVuZ2luZSkge31cbiAgICogfVxuICAgKlxuICAgKiB2YXIgcHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShbQ2FyLCBFbmdpbmVdKTtcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHByb3ZpZGVycyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoQ2FyKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgZnJvbVJlc29sdmVkUHJvdmlkZXJzKHByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdKTogSW5qZWN0b3Ige1xuICAgIHZhciBiZCA9IHByb3ZpZGVycy5tYXAoYiA9PiBuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShiLCBWaXNpYmlsaXR5LlB1YmxpYykpO1xuICAgIHZhciBwcm90byA9IG5ldyBQcm90b0luamVjdG9yKGJkKTtcbiAgICByZXR1cm4gbmV3IEluamVjdG9yKHByb3RvLCBudWxsLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgc3RhdGljIGZyb21SZXNvbHZlZEJpbmRpbmdzKHByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdKTogSW5qZWN0b3Ige1xuICAgIHJldHVybiBJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMocHJvdmlkZXJzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmF0ZWd5OiBJbmplY3RvclN0cmF0ZWd5O1xuICAvKiogQGludGVybmFsICovXG4gIF9pc0hvc3Q6IGJvb2xlYW4gPSBmYWxzZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29uc3RydWN0aW9uQ291bnRlcjogbnVtYmVyID0gMDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3Byb3RvOiBhbnkgLyogUHJvdG9JbmplY3RvciAqLztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3BhcmVudDogSW5qZWN0b3I7XG4gIC8qKlxuICAgKiBQcml2YXRlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihfcHJvdG86IGFueSAvKiBQcm90b0luamVjdG9yICovLCBfcGFyZW50OiBJbmplY3RvciA9IG51bGwsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2RlcFByb3ZpZGVyOiBhbnkgLyogRGVwZW5kZW5jeVByb3ZpZGVyICovID0gbnVsbCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZGVidWdDb250ZXh0OiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICB0aGlzLl9wcm90byA9IF9wcm90bztcbiAgICB0aGlzLl9wYXJlbnQgPSBfcGFyZW50O1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gX3Byb3RvLl9zdHJhdGVneS5jcmVhdGVJbmplY3RvclN0cmF0ZWd5KHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZGVidWdDb250ZXh0KCk6IGFueSB7IHJldHVybiB0aGlzLl9kZWJ1Z0NvbnRleHQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYW4gaW5zdGFuY2UgZnJvbSB0aGUgaW5qZWN0b3IgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHRva2VuLlxuICAgKiBUaHJvd3Mge0BsaW5rIE5vUHJvdmlkZXJFcnJvcn0gaWYgbm90IGZvdW5kLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvSGVYU0hnP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZShcInZhbGlkVG9rZW5cIiwge3VzZVZhbHVlOiBcIlZhbHVlXCJ9KVxuICAgKiBdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcInZhbGlkVG9rZW5cIikpLnRvRXF1YWwoXCJWYWx1ZVwiKTtcbiAgICogZXhwZWN0KCgpID0+IGluamVjdG9yLmdldChcImludmFsaWRUb2tlblwiKSkudG9UaHJvd0Vycm9yKCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBgSW5qZWN0b3JgIHJldHVybnMgaXRzZWxmIHdoZW4gZ2l2ZW4gYEluamVjdG9yYCBhcyBhIHRva2VuLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW10pO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KEluamVjdG9yKSkudG9CZShpbmplY3Rvcik7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0KHRva2VuOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9nZXRCeUtleShLZXkuZ2V0KHRva2VuKSwgbnVsbCwgbnVsbCwgZmFsc2UsIFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFuIGluc3RhbmNlIGZyb20gdGhlIGluamVjdG9yIGJhc2VkIG9uIHRoZSBwcm92aWRlZCB0b2tlbi5cbiAgICogUmV0dXJucyBudWxsIGlmIG5vdCBmb3VuZC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3RwRWJFeT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoXCJ2YWxpZFRva2VuXCIsIHt1c2VWYWx1ZTogXCJWYWx1ZVwifSlcbiAgICogXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXRPcHRpb25hbChcInZhbGlkVG9rZW5cIikpLnRvRXF1YWwoXCJWYWx1ZVwiKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldE9wdGlvbmFsKFwiaW52YWxpZFRva2VuXCIpKS50b0JlKG51bGwpO1xuICAgKiBgYGBcbiAgICpcbiAgICogYEluamVjdG9yYCByZXR1cm5zIGl0c2VsZiB3aGVuIGdpdmVuIGBJbmplY3RvcmAgYXMgYSB0b2tlbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldE9wdGlvbmFsKEluamVjdG9yKSkudG9CZShpbmplY3Rvcik7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0T3B0aW9uYWwodG9rZW46IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5KEtleS5nZXQodG9rZW4pLCBudWxsLCBudWxsLCB0cnVlLCBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZ2V0QXQoaW5kZXg6IG51bWJlcik6IGFueSB7IHJldHVybiB0aGlzLl9zdHJhdGVneS5nZXRPYmpBdEluZGV4KGluZGV4KTsgfVxuXG4gIC8qKlxuICAgKiBQYXJlbnQgb2YgdGhpcyBpbmplY3Rvci5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIHRoZSBzZWN0aW9uIG9mIHRoZSB1c2VyIGd1aWRlIHRhbGtpbmcgYWJvdXQgaGllcmFyY2hpY2FsIGluamVjdGlvbi5cbiAgICogLS0+XG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9lb3NNR28/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgcGFyZW50ID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXSk7XG4gICAqIHZhciBjaGlsZCA9IHBhcmVudC5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoW10pO1xuICAgKiBleHBlY3QoY2hpbGQucGFyZW50KS50b0JlKHBhcmVudCk7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IHBhcmVudCgpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9wYXJlbnQ7IH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqIEludGVybmFsLiBEbyBub3QgdXNlLlxuICAgKiBXZSByZXR1cm4gYGFueWAgbm90IHRvIGV4cG9ydCB0aGUgSW5qZWN0b3JTdHJhdGVneSB0eXBlLlxuICAgKi9cbiAgZ2V0IGludGVybmFsU3RyYXRlZ3koKTogYW55IHsgcmV0dXJuIHRoaXMuX3N0cmF0ZWd5OyB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGFuIGFycmF5IG9mIHByb3ZpZGVycyBhbmQgY3JlYXRlcyBhIGNoaWxkIGluamVjdG9yIGZyb20gdGhvc2UgcHJvdmlkZXJzLlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gdGhlIHNlY3Rpb24gb2YgdGhlIHVzZXIgZ3VpZGUgdGFsa2luZyBhYm91dCBoaWVyYXJjaGljYWwgaW5qZWN0aW9uLlxuICAgKiAtLT5cbiAgICpcbiAgICogVGhlIHBhc3NlZC1pbiBwcm92aWRlcnMgY2FuIGJlIGFuIGFycmF5IG9mIGBUeXBlYCwge0BsaW5rIFByb3ZpZGVyfSxcbiAgICogb3IgYSByZWN1cnNpdmUgYXJyYXkgb2YgbW9yZSBwcm92aWRlcnMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9vcEIzVDQ/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBQYXJlbnRQcm92aWRlciB7fVxuICAgKiBjbGFzcyBDaGlsZFByb3ZpZGVyIHt9XG4gICAqXG4gICAqIHZhciBwYXJlbnQgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtQYXJlbnRQcm92aWRlcl0pO1xuICAgKiB2YXIgY2hpbGQgPSBwYXJlbnQucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKFtDaGlsZFByb3ZpZGVyXSk7XG4gICAqXG4gICAqIGV4cGVjdChjaGlsZC5nZXQoUGFyZW50UHJvdmlkZXIpIGluc3RhbmNlb2YgUGFyZW50UHJvdmlkZXIpLnRvQmUodHJ1ZSk7XG4gICAqIGV4cGVjdChjaGlsZC5nZXQoQ2hpbGRQcm92aWRlcikgaW5zdGFuY2VvZiBDaGlsZFByb3ZpZGVyKS50b0JlKHRydWUpO1xuICAgKiBleHBlY3QoY2hpbGQuZ2V0KFBhcmVudFByb3ZpZGVyKSkudG9CZShwYXJlbnQuZ2V0KFBhcmVudFByb3ZpZGVyKSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHNsb3dlciB0aGFuIHRoZSBjb3JyZXNwb25kaW5nIGBjcmVhdGVDaGlsZEZyb21SZXNvbHZlZGBcbiAgICogYmVjYXVzZSBpdCBuZWVkcyB0byByZXNvbHZlIHRoZSBwYXNzZWQtaW4gcHJvdmlkZXJzIGZpcnN0LlxuICAgKiBTZWUge0BsaW5rIEluamVjdG9yI3Jlc29sdmV9IGFuZCB7QGxpbmsgSW5qZWN0b3IjY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWR9LlxuICAgKi9cbiAgcmVzb2x2ZUFuZENyZWF0ZUNoaWxkKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogSW5qZWN0b3Ige1xuICAgIHZhciByZXNvbHZlZFByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUocHJvdmlkZXJzKTtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVDaGlsZEZyb21SZXNvbHZlZChyZXNvbHZlZFByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNoaWxkIGluamVjdG9yIGZyb20gcHJldmlvdXNseSByZXNvbHZlZCBwcm92aWRlcnMuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGluayB0byB0aGUgc2VjdGlvbiBvZiB0aGUgdXNlciBndWlkZSB0YWxraW5nIGFib3V0IGhpZXJhcmNoaWNhbCBpbmplY3Rpb24uXG4gICAqIC0tPlxuICAgKlxuICAgKiBUaGlzIEFQSSBpcyB0aGUgcmVjb21tZW5kZWQgd2F5IHRvIGNvbnN0cnVjdCBpbmplY3RvcnMgaW4gcGVyZm9ybWFuY2Utc2Vuc2l0aXZlIHBhcnRzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvVmh5ZmpOP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgUGFyZW50UHJvdmlkZXIge31cbiAgICogY2xhc3MgQ2hpbGRQcm92aWRlciB7fVxuICAgKlxuICAgKiB2YXIgcGFyZW50UHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShbUGFyZW50UHJvdmlkZXJdKTtcbiAgICogdmFyIGNoaWxkUHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShbQ2hpbGRQcm92aWRlcl0pO1xuICAgKlxuICAgKiB2YXIgcGFyZW50ID0gSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHBhcmVudFByb3ZpZGVycyk7XG4gICAqIHZhciBjaGlsZCA9IHBhcmVudC5jcmVhdGVDaGlsZEZyb21SZXNvbHZlZChjaGlsZFByb3ZpZGVycyk7XG4gICAqXG4gICAqIGV4cGVjdChjaGlsZC5nZXQoUGFyZW50UHJvdmlkZXIpIGluc3RhbmNlb2YgUGFyZW50UHJvdmlkZXIpLnRvQmUodHJ1ZSk7XG4gICAqIGV4cGVjdChjaGlsZC5nZXQoQ2hpbGRQcm92aWRlcikgaW5zdGFuY2VvZiBDaGlsZFByb3ZpZGVyKS50b0JlKHRydWUpO1xuICAgKiBleHBlY3QoY2hpbGQuZ2V0KFBhcmVudFByb3ZpZGVyKSkudG9CZShwYXJlbnQuZ2V0KFBhcmVudFByb3ZpZGVyKSk7XG4gICAqIGBgYFxuICAgKi9cbiAgY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQocHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10pOiBJbmplY3RvciB7XG4gICAgdmFyIGJkID0gcHJvdmlkZXJzLm1hcChiID0+IG5ldyBQcm92aWRlcldpdGhWaXNpYmlsaXR5KGIsIFZpc2liaWxpdHkuUHVibGljKSk7XG4gICAgdmFyIHByb3RvID0gbmV3IFByb3RvSW5qZWN0b3IoYmQpO1xuICAgIHZhciBpbmogPSBuZXcgSW5qZWN0b3IocHJvdG8sIG51bGwsIG51bGwpO1xuICAgIGluai5fcGFyZW50ID0gdGhpcztcbiAgICByZXR1cm4gaW5qO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGEgcHJvdmlkZXIgYW5kIGluc3RhbnRpYXRlcyBhbiBvYmplY3QgaW4gdGhlIGNvbnRleHQgb2YgdGhlIGluamVjdG9yLlxuICAgKlxuICAgKiBUaGUgY3JlYXRlZCBvYmplY3QgZG9lcyBub3QgZ2V0IGNhY2hlZCBieSB0aGUgaW5qZWN0b3IuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC95dlZYb0I/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEVuZ2luZSB7XG4gICAqIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBDYXIge1xuICAgKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbmdpbmU6RW5naW5lKSB7fVxuICAgKiB9XG4gICAqXG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0VuZ2luZV0pO1xuICAgKlxuICAgKiB2YXIgY2FyID0gaW5qZWN0b3IucmVzb2x2ZUFuZEluc3RhbnRpYXRlKENhcik7XG4gICAqIGV4cGVjdChjYXIuZW5naW5lKS50b0JlKGluamVjdG9yLmdldChFbmdpbmUpKTtcbiAgICogZXhwZWN0KGNhcikubm90LnRvQmUoaW5qZWN0b3IucmVzb2x2ZUFuZEluc3RhbnRpYXRlKENhcikpO1xuICAgKiBgYGBcbiAgICovXG4gIHJlc29sdmVBbmRJbnN0YW50aWF0ZShwcm92aWRlcjogVHlwZSB8IFByb3ZpZGVyKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW50aWF0ZVJlc29sdmVkKEluamVjdG9yLnJlc29sdmUoW3Byb3ZpZGVyXSlbMF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlcyBhbiBvYmplY3QgdXNpbmcgYSByZXNvbHZlZCBwcm92aWRlciBpbiB0aGUgY29udGV4dCBvZiB0aGUgaW5qZWN0b3IuXG4gICAqXG4gICAqIFRoZSBjcmVhdGVkIG9iamVjdCBkb2VzIG5vdCBnZXQgY2FjaGVkIGJ5IHRoZSBpbmplY3Rvci5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3B0Q0ltUT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRW5naW5lIHtcbiAgICogfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIENhciB7XG4gICAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTpFbmdpbmUpIHt9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRW5naW5lXSk7XG4gICAqIHZhciBjYXJQcm92aWRlciA9IEluamVjdG9yLnJlc29sdmUoW0Nhcl0pWzBdO1xuICAgKiB2YXIgY2FyID0gaW5qZWN0b3IuaW5zdGFudGlhdGVSZXNvbHZlZChjYXJQcm92aWRlcik7XG4gICAqIGV4cGVjdChjYXIuZW5naW5lKS50b0JlKGluamVjdG9yLmdldChFbmdpbmUpKTtcbiAgICogZXhwZWN0KGNhcikubm90LnRvQmUoaW5qZWN0b3IuaW5zdGFudGlhdGVSZXNvbHZlZChjYXJQcm92aWRlcikpO1xuICAgKiBgYGBcbiAgICovXG4gIGluc3RhbnRpYXRlUmVzb2x2ZWQocHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9pbnN0YW50aWF0ZVByb3ZpZGVyKHByb3ZpZGVyLCBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV3KHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICBpZiAodGhpcy5fY29uc3RydWN0aW9uQ291bnRlcisrID4gdGhpcy5fc3RyYXRlZ3kuZ2V0TWF4TnVtYmVyT2ZPYmplY3RzKCkpIHtcbiAgICAgIHRocm93IG5ldyBDeWNsaWNEZXBlbmRlbmN5RXJyb3IodGhpcywgcHJvdmlkZXIua2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2luc3RhbnRpYXRlUHJvdmlkZXIocHJvdmlkZXIsIHZpc2liaWxpdHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zdGFudGlhdGVQcm92aWRlcihwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgaWYgKHByb3ZpZGVyLm11bHRpUHJvdmlkZXIpIHtcbiAgICAgIHZhciByZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUocHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXMubGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcmVzW2ldID0gdGhpcy5faW5zdGFudGlhdGUocHJvdmlkZXIsIHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzW2ldLCB2aXNpYmlsaXR5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnN0YW50aWF0ZShwcm92aWRlciwgcHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXNbMF0sIHZpc2liaWxpdHkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2luc3RhbnRpYXRlKHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCByZXNvbHZlZEZhY3Rvcnk6IFJlc29sdmVkRmFjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgdmFyIGZhY3RvcnkgPSByZXNvbHZlZEZhY3RvcnkuZmFjdG9yeTtcbiAgICB2YXIgZGVwcyA9IHJlc29sdmVkRmFjdG9yeS5kZXBlbmRlbmNpZXM7XG4gICAgdmFyIGxlbmd0aCA9IGRlcHMubGVuZ3RoO1xuXG4gICAgdmFyIGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyLCBkMTMsIGQxNCwgZDE1LCBkMTYsIGQxNywgZDE4LCBkMTk7XG4gICAgdHJ5IHtcbiAgICAgIGQwID0gbGVuZ3RoID4gMCA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1swXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDEgPSBsZW5ndGggPiAxID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzFdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMiA9IGxlbmd0aCA+IDIgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMl0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQzID0gbGVuZ3RoID4gMyA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1szXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDQgPSBsZW5ndGggPiA0ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzRdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkNSA9IGxlbmd0aCA+IDUgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbNV0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQ2ID0gbGVuZ3RoID4gNiA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1s2XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDcgPSBsZW5ndGggPiA3ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzddLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkOCA9IGxlbmd0aCA+IDggPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbOF0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQ5ID0gbGVuZ3RoID4gOSA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1s5XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDEwID0gbGVuZ3RoID4gMTAgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTBdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTEgPSBsZW5ndGggPiAxMSA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxMV0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxMiA9IGxlbmd0aCA+IDEyID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzEyXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDEzID0gbGVuZ3RoID4gMTMgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTNdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTQgPSBsZW5ndGggPiAxNCA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxNF0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxNSA9IGxlbmd0aCA+IDE1ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzE1XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDE2ID0gbGVuZ3RoID4gMTYgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTZdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTcgPSBsZW5ndGggPiAxNyA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxN10sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxOCA9IGxlbmd0aCA+IDE4ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzE4XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDE5ID0gbGVuZ3RoID4gMTkgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTldLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBBYnN0cmFjdFByb3ZpZGVyRXJyb3IgfHwgZSBpbnN0YW5jZW9mIEluc3RhbnRpYXRpb25FcnJvcikge1xuICAgICAgICBlLmFkZEtleSh0aGlzLCBwcm92aWRlci5rZXkpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgb2JqO1xuICAgIHRyeSB7XG4gICAgICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIsIGQxMyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIsIGQxMywgZDE0LCBkMTUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIsIGQxMywgZDE0LCBkMTUsIGQxNik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSwgZDE2LFxuICAgICAgICAgICAgICAgICAgICAgICAgZDE3KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyLCBkMTMsIGQxNCwgZDE1LCBkMTYsXG4gICAgICAgICAgICAgICAgICAgICAgICBkMTcsIGQxOCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSwgZDE2LFxuICAgICAgICAgICAgICAgICAgICAgICAgZDE3LCBkMTgsIGQxOSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEluc3RhbnRpYXRpb25FcnJvcih0aGlzLCBlLCBlLnN0YWNrLCBwcm92aWRlci5rZXkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCBkZXA6IERlcGVuZGVuY3ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlclZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHZhciBzcGVjaWFsID0gaXNQcmVzZW50KHRoaXMuX2RlcFByb3ZpZGVyKSA/XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVwUHJvdmlkZXIuZ2V0RGVwZW5kZW5jeSh0aGlzLCBwcm92aWRlciwgZGVwKSA6XG4gICAgICAgICAgICAgICAgICAgICAgVU5ERUZJTkVEO1xuICAgIGlmIChzcGVjaWFsICE9PSBVTkRFRklORUQpIHtcbiAgICAgIHJldHVybiBzcGVjaWFsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0QnlLZXkoZGVwLmtleSwgZGVwLmxvd2VyQm91bmRWaXNpYmlsaXR5LCBkZXAudXBwZXJCb3VuZFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwLm9wdGlvbmFsLCBwcm92aWRlclZpc2liaWxpdHkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldEJ5S2V5KGtleTogS2V5LCBsb3dlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0LCB1cHBlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25hbDogYm9vbGVhbiwgcHJvdmlkZXJWaXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICBpZiAoa2V5ID09PSBJTkpFQ1RPUl9LRVkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh1cHBlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIFNlbGZNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5U2VsZihrZXksIG9wdGlvbmFsLCBwcm92aWRlclZpc2liaWxpdHkpO1xuXG4gICAgfSBlbHNlIGlmICh1cHBlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIEhvc3RNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5SG9zdChrZXksIG9wdGlvbmFsLCBwcm92aWRlclZpc2liaWxpdHksIGxvd2VyQm91bmRWaXNpYmlsaXR5KTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0QnlLZXlEZWZhdWx0KGtleSwgb3B0aW9uYWwsIHByb3ZpZGVyVmlzaWJpbGl0eSwgbG93ZXJCb3VuZFZpc2liaWxpdHkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Rocm93T3JOdWxsKGtleTogS2V5LCBvcHRpb25hbDogYm9vbGVhbik6IGFueSB7XG4gICAgaWYgKG9wdGlvbmFsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IE5vUHJvdmlkZXJFcnJvcih0aGlzLCBrZXkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dldEJ5S2V5U2VsZihrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIHByb3ZpZGVyVmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgdmFyIG9iaiA9IHRoaXMuX3N0cmF0ZWd5LmdldE9iakJ5S2V5SWQoa2V5LmlkLCBwcm92aWRlclZpc2liaWxpdHkpO1xuICAgIHJldHVybiAob2JqICE9PSBVTkRFRklORUQpID8gb2JqIDogdGhpcy5fdGhyb3dPck51bGwoa2V5LCBvcHRpb25hbCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRCeUtleUhvc3Qoa2V5OiBLZXksIG9wdGlvbmFsOiBib29sZWFuLCBwcm92aWRlclZpc2liaWxpdHk6IFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZFZpc2liaWxpdHk6IE9iamVjdCk6IGFueSB7XG4gICAgdmFyIGluajogSW5qZWN0b3IgPSB0aGlzO1xuXG4gICAgaWYgKGxvd2VyQm91bmRWaXNpYmlsaXR5IGluc3RhbmNlb2YgU2tpcFNlbGZNZXRhZGF0YSkge1xuICAgICAgaWYgKGluai5faXNIb3N0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRQcml2YXRlRGVwZW5kZW5jeShrZXksIG9wdGlvbmFsLCBpbmopO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5qID0gaW5qLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2hpbGUgKGluaiAhPSBudWxsKSB7XG4gICAgICB2YXIgb2JqID0gaW5qLl9zdHJhdGVneS5nZXRPYmpCeUtleUlkKGtleS5pZCwgcHJvdmlkZXJWaXNpYmlsaXR5KTtcbiAgICAgIGlmIChvYmogIT09IFVOREVGSU5FRCkgcmV0dXJuIG9iajtcblxuICAgICAgaWYgKGlzUHJlc2VudChpbmouX3BhcmVudCkgJiYgaW5qLl9pc0hvc3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByaXZhdGVEZXBlbmRlbmN5KGtleSwgb3B0aW9uYWwsIGluaik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmogPSBpbmouX3BhcmVudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fdGhyb3dPck51bGwoa2V5LCBvcHRpb25hbCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRQcml2YXRlRGVwZW5kZW5jeShrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIGluajogSW5qZWN0b3IpOiBhbnkge1xuICAgIHZhciBvYmogPSBpbmouX3BhcmVudC5fc3RyYXRlZ3kuZ2V0T2JqQnlLZXlJZChrZXkuaWQsIFZpc2liaWxpdHkuUHJpdmF0ZSk7XG4gICAgcmV0dXJuIChvYmogIT09IFVOREVGSU5FRCkgPyBvYmogOiB0aGlzLl90aHJvd09yTnVsbChrZXksIG9wdGlvbmFsKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dldEJ5S2V5RGVmYXVsdChrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIHByb3ZpZGVyVmlzaWJpbGl0eTogVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICAgICBsb3dlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0KTogYW55IHtcbiAgICB2YXIgaW5qOiBJbmplY3RvciA9IHRoaXM7XG5cbiAgICBpZiAobG93ZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBTa2lwU2VsZk1ldGFkYXRhKSB7XG4gICAgICBwcm92aWRlclZpc2liaWxpdHkgPSBpbmouX2lzSG9zdCA/IFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSA6IFZpc2liaWxpdHkuUHVibGljO1xuICAgICAgaW5qID0gaW5qLl9wYXJlbnQ7XG4gICAgfVxuXG4gICAgd2hpbGUgKGluaiAhPSBudWxsKSB7XG4gICAgICB2YXIgb2JqID0gaW5qLl9zdHJhdGVneS5nZXRPYmpCeUtleUlkKGtleS5pZCwgcHJvdmlkZXJWaXNpYmlsaXR5KTtcbiAgICAgIGlmIChvYmogIT09IFVOREVGSU5FRCkgcmV0dXJuIG9iajtcblxuICAgICAgcHJvdmlkZXJWaXNpYmlsaXR5ID0gaW5qLl9pc0hvc3QgPyBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUgOiBWaXNpYmlsaXR5LlB1YmxpYztcbiAgICAgIGluaiA9IGluai5fcGFyZW50O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl90aHJvd09yTnVsbChrZXksIG9wdGlvbmFsKTtcbiAgfVxuXG4gIGdldCBkaXNwbGF5TmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgSW5qZWN0b3IocHJvdmlkZXJzOiBbJHtfbWFwUHJvdmlkZXJzKHRoaXMsIGIgPT4gYCBcIiR7Yi5rZXkuZGlzcGxheU5hbWV9XCIgYCkuam9pbihcIiwgXCIpfV0pYDtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmRpc3BsYXlOYW1lOyB9XG59XG5cbnZhciBJTkpFQ1RPUl9LRVkgPSBLZXkuZ2V0KEluamVjdG9yKTtcblxuXG5mdW5jdGlvbiBfbWFwUHJvdmlkZXJzKGluamVjdG9yOiBJbmplY3RvciwgZm46IEZ1bmN0aW9uKTogYW55W10ge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW5qZWN0b3IuX3Byb3RvLm51bWJlck9mUHJvdmlkZXJzOyArK2kpIHtcbiAgICByZXMucHVzaChmbihpbmplY3Rvci5fcHJvdG8uZ2V0UHJvdmlkZXJBdEluZGV4KGkpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cbiJdfQ==