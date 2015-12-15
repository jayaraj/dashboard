/* */ 
"format cjs";
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { global, isFunction, Math } from 'angular2/src/facade/lang';
import { provide } from 'angular2/core';
import { createTestInjectorWithRuntimeCompiler, FunctionWithParamTokens } from './test_injector';
import { browserDetection } from './utils';
export { inject } from './test_injector';
export { expect } from './matchers';
export var proxy = (t) => t;
var _global = (typeof window === 'undefined' ? global : window);
export var afterEach = _global.afterEach;
/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
export class AsyncTestCompleter {
    constructor(_done) {
        this._done = _done;
    }
    done() { this._done(); }
}
var jsmBeforeEach = _global.beforeEach;
var jsmDescribe = _global.describe;
var jsmDDescribe = _global.fdescribe;
var jsmXDescribe = _global.xdescribe;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;
var runnerStack = [];
var inIt = false;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;
var globalTimeOut = browserDetection.isSlow ? 3000 : jasmine.DEFAULT_TIMEOUT_INTERVAL;
var testProviders;
/**
 * Mechanism to run `beforeEach()` functions of Angular tests.
 *
 * Note: Jasmine own `beforeEach` is used by this library to handle DI providers.
 */
class BeforeEachRunner {
    constructor(_parent) {
        this._parent = _parent;
        this._fns = [];
    }
    beforeEach(fn) { this._fns.push(fn); }
    run(injector) {
        if (this._parent)
            this._parent.run(injector);
        this._fns.forEach((fn) => {
            return isFunction(fn) ? fn() : fn.execute(injector);
        });
    }
}
// Reset the test providers before each test
jsmBeforeEach(() => { testProviders = []; });
function _describe(jsmFn, ...args) {
    var parentRunner = runnerStack.length === 0 ? null : runnerStack[runnerStack.length - 1];
    var runner = new BeforeEachRunner(parentRunner);
    runnerStack.push(runner);
    var suite = jsmFn(...args);
    runnerStack.pop();
    return suite;
}
export function describe(...args) {
    return _describe(jsmDescribe, ...args);
}
export function ddescribe(...args) {
    return _describe(jsmDDescribe, ...args);
}
export function xdescribe(...args) {
    return _describe(jsmXDescribe, ...args);
}
export function beforeEach(fn) {
    if (runnerStack.length > 0) {
        // Inside a describe block, beforeEach() uses a BeforeEachRunner
        runnerStack[runnerStack.length - 1].beforeEach(fn);
    }
    else {
        // Top level beforeEach() are delegated to jasmine
        jsmBeforeEach(fn);
    }
}
/**
 * Allows overriding default providers defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     provide(Compiler, {useClass: MockCompiler}),
 *     provide(SomeToken, {useValue: myValue}),
 *   ]);
 */
export function beforeEachProviders(fn) {
    jsmBeforeEach(() => {
        var providers = fn();
        if (!providers)
            return;
        testProviders = [...testProviders, ...providers];
    });
}
/**
 * @deprecated
 */
export function beforeEachBindings(fn) {
    beforeEachProviders(fn);
}
function _it(jsmFn, name, testFn, testTimeOut) {
    var runner = runnerStack[runnerStack.length - 1];
    var timeOut = Math.max(globalTimeOut, testTimeOut);
    if (testFn instanceof FunctionWithParamTokens) {
        // The test case uses inject(). ie `it('test', inject([AsyncTestCompleter], (async) => { ...
        // }));`
        if (testFn.hasToken(AsyncTestCompleter)) {
            jsmFn(name, (done) => {
                var completerProvider = provide(AsyncTestCompleter, {
                    useFactory: () => {
                        // Mark the test as async when an AsyncTestCompleter is injected in an it()
                        if (!inIt)
                            throw new Error('AsyncTestCompleter can only be injected in an "it()"');
                        return new AsyncTestCompleter(done);
                    }
                });
                var injector = createTestInjectorWithRuntimeCompiler([...testProviders, completerProvider]);
                runner.run(injector);
                inIt = true;
                testFn.execute(injector);
                inIt = false;
            }, timeOut);
        }
        else {
            jsmFn(name, () => {
                var injector = createTestInjectorWithRuntimeCompiler(testProviders);
                runner.run(injector);
                testFn.execute(injector);
            }, timeOut);
        }
    }
    else {
        // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`
        if (testFn.length === 0) {
            jsmFn(name, () => {
                var injector = createTestInjectorWithRuntimeCompiler(testProviders);
                runner.run(injector);
                testFn();
            }, timeOut);
        }
        else {
            jsmFn(name, (done) => {
                var injector = createTestInjectorWithRuntimeCompiler(testProviders);
                runner.run(injector);
                testFn(done);
            }, timeOut);
        }
    }
}
export function it(name, fn, timeOut = null) {
    return _it(jsmIt, name, fn, timeOut);
}
export function xit(name, fn, timeOut = null) {
    return _it(jsmXIt, name, fn, timeOut);
}
export function iit(name, fn, timeOut = null) {
    return _it(jsmIIt, name, fn, timeOut);
}
export class SpyObject {
    constructor(type = null) {
        if (type) {
            for (var prop in type.prototype) {
                var m = null;
                try {
                    m = type.prototype[prop];
                }
                catch (e) {
                }
                if (typeof m === 'function') {
                    this.spy(prop);
                }
            }
        }
    }
    // Noop so that SpyObject has the same interface as in Dart
    noSuchMethod(args) { }
    spy(name) {
        if (!this[name]) {
            this[name] = this._createGuinnessCompatibleSpy(name);
        }
        return this[name];
    }
    prop(name, value) { this[name] = value; }
    static stub(object = null, config = null, overrides = null) {
        if (!(object instanceof SpyObject)) {
            overrides = config;
            config = object;
            object = new SpyObject();
        }
        var m = StringMapWrapper.merge(config, overrides);
        StringMapWrapper.forEach(m, (value, key) => { object.spy(key).andReturn(value); });
        return object;
    }
    /** @internal */
    _createGuinnessCompatibleSpy(name) {
        var newSpy = jasmine.createSpy(name);
        newSpy.andCallFake = newSpy.and.callFake;
        newSpy.andReturn = newSpy.and.returnValue;
        newSpy.reset = newSpy.calls.reset;
        // revisit return null here (previously needed for rtts_assert).
        newSpy.and.returnValue(null);
        return newSpy;
    }
}
export function isInInnerZone() {
    return global.zone._innerZone === true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ19pbnRlcm5hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmdfaW50ZXJuYWwudHMiXSwibmFtZXMiOlsiQXN5bmNUZXN0Q29tcGxldGVyIiwiQXN5bmNUZXN0Q29tcGxldGVyLmNvbnN0cnVjdG9yIiwiQXN5bmNUZXN0Q29tcGxldGVyLmRvbmUiLCJCZWZvcmVFYWNoUnVubmVyIiwiQmVmb3JlRWFjaFJ1bm5lci5jb25zdHJ1Y3RvciIsIkJlZm9yZUVhY2hSdW5uZXIuYmVmb3JlRWFjaCIsIkJlZm9yZUVhY2hSdW5uZXIucnVuIiwiX2Rlc2NyaWJlIiwiZGVzY3JpYmUiLCJkZGVzY3JpYmUiLCJ4ZGVzY3JpYmUiLCJiZWZvcmVFYWNoIiwiYmVmb3JlRWFjaFByb3ZpZGVycyIsImJlZm9yZUVhY2hCaW5kaW5ncyIsIl9pdCIsIml0IiwieGl0IiwiaWl0IiwiU3B5T2JqZWN0IiwiU3B5T2JqZWN0LmNvbnN0cnVjdG9yIiwiU3B5T2JqZWN0Lm5vU3VjaE1ldGhvZCIsIlNweU9iamVjdC5zcHkiLCJTcHlPYmplY3QucHJvcCIsIlNweU9iamVjdC5zdHViIiwiU3B5T2JqZWN0Ll9jcmVhdGVHdWlubmVzc0NvbXBhdGlibGVTcHkiLCJpc0luSW5uZXJab25lIl0sIm1hcHBpbmdzIjoiT0FDTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsTUFBTSwwQkFBMEI7T0FHMUQsRUFBQyxPQUFPLEVBQUMsTUFBTSxlQUFlO09BRTlCLEVBQ0wscUNBQXFDLEVBQ3JDLHVCQUF1QixFQUV4QixNQUFNLGlCQUFpQjtPQUNqQixFQUFDLGdCQUFnQixFQUFDLE1BQU0sU0FBUztBQUV4QyxTQUFRLE1BQU0sUUFBTyxpQkFBaUIsQ0FBQztBQUV2QyxTQUFRLE1BQU0sUUFBbUIsWUFBWSxDQUFDO0FBRTlDLFdBQVcsS0FBSyxHQUFtQixD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QUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxHQUFHQSxnQkFBZ0JBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO1FBQ2xEQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLEVBQUVBLEdBQUdBLE9BQU9BLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ25GQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFREwsZ0JBQWdCQTtJQUNoQkEsNEJBQTRCQSxDQUFDQSxJQUFJQTtRQUMvQk0sSUFBSUEsTUFBTUEsR0FBOEJBLE9BQU9BLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2hFQSxNQUFNQSxDQUFDQSxXQUFXQSxHQUFRQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUM5Q0EsTUFBTUEsQ0FBQ0EsU0FBU0EsR0FBUUEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0E7UUFDL0NBLE1BQU1BLENBQUNBLEtBQUtBLEdBQVFBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBO1FBQ3ZDQSxnRUFBZ0VBO1FBQ2hFQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM3QkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0FBQ0hOLENBQUNBO0FBRUQ7SUFDRU8sTUFBTUEsQ0FBY0EsTUFBTUEsQ0FBQ0EsSUFBS0EsQ0FBQ0EsVUFBVUEsS0FBS0EsSUFBSUEsQ0FBQ0E7QUFDdkRBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtnbG9iYWwsIGlzRnVuY3Rpb24sIE1hdGh9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge05nWm9uZVpvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5cbmltcG9ydCB7cHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7XG4gIGNyZWF0ZVRlc3RJbmplY3RvcldpdGhSdW50aW1lQ29tcGlsZXIsXG4gIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLFxuICBpbmplY3Rcbn0gZnJvbSAnLi90ZXN0X2luamVjdG9yJztcbmltcG9ydCB7YnJvd3NlckRldGVjdGlvbn0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCB7aW5qZWN0fSBmcm9tICcuL3Rlc3RfaW5qZWN0b3InO1xuXG5leHBvcnQge2V4cGVjdCwgTmdNYXRjaGVyc30gZnJvbSAnLi9tYXRjaGVycyc7XG5cbmV4cG9ydCB2YXIgcHJveHk6IENsYXNzRGVjb3JhdG9yID0gKHQpID0+IHQ7XG5cbnZhciBfZ2xvYmFsOiBqYXNtaW5lLkdsb2JhbFBvbGx1dGVyID0gPGFueT4odHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3cpO1xuXG5leHBvcnQgdmFyIGFmdGVyRWFjaDogRnVuY3Rpb24gPSBfZ2xvYmFsLmFmdGVyRWFjaDtcblxuZXhwb3J0IHR5cGUgU3luY1Rlc3RGbiA9ICgpID0+IHZvaWQ7XG50eXBlIEFzeW5jVGVzdEZuID0gKGRvbmU6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG50eXBlIEFueVRlc3RGbiA9IFN5bmNUZXN0Rm4gfCBBc3luY1Rlc3RGbjtcblxuLyoqXG4gKiBJbmplY3RhYmxlIGNvbXBsZXRlciB0aGF0IGFsbG93cyBzaWduYWxpbmcgY29tcGxldGlvbiBvZiBhbiBhc3luY2hyb25vdXMgdGVzdC4gVXNlZCBpbnRlcm5hbGx5LlxuICovXG5leHBvcnQgY2xhc3MgQXN5bmNUZXN0Q29tcGxldGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZG9uZTogRnVuY3Rpb24pIHt9XG5cbiAgZG9uZSgpOiB2b2lkIHsgdGhpcy5fZG9uZSgpOyB9XG59XG5cbnZhciBqc21CZWZvcmVFYWNoID0gX2dsb2JhbC5iZWZvcmVFYWNoO1xudmFyIGpzbURlc2NyaWJlID0gX2dsb2JhbC5kZXNjcmliZTtcbnZhciBqc21ERGVzY3JpYmUgPSBfZ2xvYmFsLmZkZXNjcmliZTtcbnZhciBqc21YRGVzY3JpYmUgPSBfZ2xvYmFsLnhkZXNjcmliZTtcbnZhciBqc21JdCA9IF9nbG9iYWwuaXQ7XG52YXIganNtSUl0ID0gX2dsb2JhbC5maXQ7XG52YXIganNtWEl0ID0gX2dsb2JhbC54aXQ7XG5cbnZhciBydW5uZXJTdGFjayA9IFtdO1xudmFyIGluSXQgPSBmYWxzZTtcbmphc21pbmUuREVGQVVMVF9USU1FT1VUX0lOVEVSVkFMID0gNTAwO1xudmFyIGdsb2JhbFRpbWVPdXQgPSBicm93c2VyRGV0ZWN0aW9uLmlzU2xvdyA/IDMwMDAgOiBqYXNtaW5lLkRFRkFVTFRfVElNRU9VVF9JTlRFUlZBTDtcblxudmFyIHRlc3RQcm92aWRlcnM7XG5cbi8qKlxuICogTWVjaGFuaXNtIHRvIHJ1biBgYmVmb3JlRWFjaCgpYCBmdW5jdGlvbnMgb2YgQW5ndWxhciB0ZXN0cy5cbiAqXG4gKiBOb3RlOiBKYXNtaW5lIG93biBgYmVmb3JlRWFjaGAgaXMgdXNlZCBieSB0aGlzIGxpYnJhcnkgdG8gaGFuZGxlIERJIHByb3ZpZGVycy5cbiAqL1xuY2xhc3MgQmVmb3JlRWFjaFJ1bm5lciB7XG4gIHByaXZhdGUgX2ZuczogQXJyYXk8RnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBTeW5jVGVzdEZuPiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BhcmVudDogQmVmb3JlRWFjaFJ1bm5lcikge31cblxuICBiZWZvcmVFYWNoKGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IFN5bmNUZXN0Rm4pOiB2b2lkIHsgdGhpcy5fZm5zLnB1c2goZm4pOyB9XG5cbiAgcnVuKGluamVjdG9yKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhcmVudCkgdGhpcy5fcGFyZW50LnJ1bihpbmplY3Rvcik7XG4gICAgdGhpcy5fZm5zLmZvckVhY2goKGZuKSA9PiB7XG4gICAgICByZXR1cm4gaXNGdW5jdGlvbihmbikgPyAoPFN5bmNUZXN0Rm4+Zm4pKCkgOiAoPEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zPmZuKS5leGVjdXRlKGluamVjdG9yKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBSZXNldCB0aGUgdGVzdCBwcm92aWRlcnMgYmVmb3JlIGVhY2ggdGVzdFxuanNtQmVmb3JlRWFjaCgoKSA9PiB7IHRlc3RQcm92aWRlcnMgPSBbXTsgfSk7XG5cbmZ1bmN0aW9uIF9kZXNjcmliZShqc21GbiwgLi4uYXJncykge1xuICB2YXIgcGFyZW50UnVubmVyID0gcnVubmVyU3RhY2subGVuZ3RoID09PSAwID8gbnVsbCA6IHJ1bm5lclN0YWNrW3J1bm5lclN0YWNrLmxlbmd0aCAtIDFdO1xuICB2YXIgcnVubmVyID0gbmV3IEJlZm9yZUVhY2hSdW5uZXIocGFyZW50UnVubmVyKTtcbiAgcnVubmVyU3RhY2sucHVzaChydW5uZXIpO1xuICB2YXIgc3VpdGUgPSBqc21GbiguLi5hcmdzKTtcbiAgcnVubmVyU3RhY2sucG9wKCk7XG4gIHJldHVybiBzdWl0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlKC4uLmFyZ3MpOiB2b2lkIHtcbiAgcmV0dXJuIF9kZXNjcmliZShqc21EZXNjcmliZSwgLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZGVzY3JpYmUoLi4uYXJncyk6IHZvaWQge1xuICByZXR1cm4gX2Rlc2NyaWJlKGpzbUREZXNjcmliZSwgLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB4ZGVzY3JpYmUoLi4uYXJncyk6IHZvaWQge1xuICByZXR1cm4gX2Rlc2NyaWJlKGpzbVhEZXNjcmliZSwgLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoKGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IFN5bmNUZXN0Rm4pOiB2b2lkIHtcbiAgaWYgKHJ1bm5lclN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAvLyBJbnNpZGUgYSBkZXNjcmliZSBibG9jaywgYmVmb3JlRWFjaCgpIHVzZXMgYSBCZWZvcmVFYWNoUnVubmVyXG4gICAgcnVubmVyU3RhY2tbcnVubmVyU3RhY2subGVuZ3RoIC0gMV0uYmVmb3JlRWFjaChmbik7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG9wIGxldmVsIGJlZm9yZUVhY2goKSBhcmUgZGVsZWdhdGVkIHRvIGphc21pbmVcbiAgICBqc21CZWZvcmVFYWNoKDxTeW5jVGVzdEZuPmZuKTtcbiAgfVxufVxuXG4vKipcbiAqIEFsbG93cyBvdmVycmlkaW5nIGRlZmF1bHQgcHJvdmlkZXJzIGRlZmluZWQgaW4gdGVzdF9pbmplY3Rvci5qcy5cbiAqXG4gKiBUaGUgZ2l2ZW4gZnVuY3Rpb24gbXVzdCByZXR1cm4gYSBsaXN0IG9mIERJIHByb3ZpZGVycy5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgYmVmb3JlRWFjaFByb3ZpZGVycygoKSA9PiBbXG4gKiAgICAgcHJvdmlkZShDb21waWxlciwge3VzZUNsYXNzOiBNb2NrQ29tcGlsZXJ9KSxcbiAqICAgICBwcm92aWRlKFNvbWVUb2tlbiwge3VzZVZhbHVlOiBteVZhbHVlfSksXG4gKiAgIF0pO1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaFByb3ZpZGVycyhmbik6IHZvaWQge1xuICBqc21CZWZvcmVFYWNoKCgpID0+IHtcbiAgICB2YXIgcHJvdmlkZXJzID0gZm4oKTtcbiAgICBpZiAoIXByb3ZpZGVycykgcmV0dXJuO1xuICAgIHRlc3RQcm92aWRlcnMgPSBbLi4udGVzdFByb3ZpZGVycywgLi4ucHJvdmlkZXJzXTtcbiAgfSk7XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2hCaW5kaW5ncyhmbik6IHZvaWQge1xuICBiZWZvcmVFYWNoUHJvdmlkZXJzKGZuKTtcbn1cblxuZnVuY3Rpb24gX2l0KGpzbUZuOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nLCB0ZXN0Rm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgIHRlc3RUaW1lT3V0OiBudW1iZXIpOiB2b2lkIHtcbiAgdmFyIHJ1bm5lciA9IHJ1bm5lclN0YWNrW3J1bm5lclN0YWNrLmxlbmd0aCAtIDFdO1xuICB2YXIgdGltZU91dCA9IE1hdGgubWF4KGdsb2JhbFRpbWVPdXQsIHRlc3RUaW1lT3V0KTtcblxuICBpZiAodGVzdEZuIGluc3RhbmNlb2YgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIHVzZXMgaW5qZWN0KCkuIGllIGBpdCgndGVzdCcsIGluamVjdChbQXN5bmNUZXN0Q29tcGxldGVyXSwgKGFzeW5jKSA9PiB7IC4uLlxuICAgIC8vIH0pKTtgXG5cbiAgICBpZiAodGVzdEZuLmhhc1Rva2VuKEFzeW5jVGVzdENvbXBsZXRlcikpIHtcbiAgICAgIGpzbUZuKG5hbWUsIChkb25lKSA9PiB7XG4gICAgICAgIHZhciBjb21wbGV0ZXJQcm92aWRlciA9IHByb3ZpZGUoQXN5bmNUZXN0Q29tcGxldGVyLCB7XG4gICAgICAgICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgICAgICAgLy8gTWFyayB0aGUgdGVzdCBhcyBhc3luYyB3aGVuIGFuIEFzeW5jVGVzdENvbXBsZXRlciBpcyBpbmplY3RlZCBpbiBhbiBpdCgpXG4gICAgICAgICAgICBpZiAoIWluSXQpIHRocm93IG5ldyBFcnJvcignQXN5bmNUZXN0Q29tcGxldGVyIGNhbiBvbmx5IGJlIGluamVjdGVkIGluIGFuIFwiaXQoKVwiJyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFzeW5jVGVzdENvbXBsZXRlcihkb25lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBpbmplY3RvciA9IGNyZWF0ZVRlc3RJbmplY3RvcldpdGhSdW50aW1lQ29tcGlsZXIoWy4uLnRlc3RQcm92aWRlcnMsIGNvbXBsZXRlclByb3ZpZGVyXSk7XG4gICAgICAgIHJ1bm5lci5ydW4oaW5qZWN0b3IpO1xuXG4gICAgICAgIGluSXQgPSB0cnVlO1xuICAgICAgICB0ZXN0Rm4uZXhlY3V0ZShpbmplY3Rvcik7XG4gICAgICAgIGluSXQgPSBmYWxzZTtcbiAgICAgIH0sIHRpbWVPdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBqc21GbihuYW1lLCAoKSA9PiB7XG4gICAgICAgIHZhciBpbmplY3RvciA9IGNyZWF0ZVRlc3RJbmplY3RvcldpdGhSdW50aW1lQ29tcGlsZXIodGVzdFByb3ZpZGVycyk7XG4gICAgICAgIHJ1bm5lci5ydW4oaW5qZWN0b3IpO1xuICAgICAgICB0ZXN0Rm4uZXhlY3V0ZShpbmplY3Rvcik7XG4gICAgICB9LCB0aW1lT3V0KTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIGRvZXNuJ3QgdXNlIGluamVjdCgpLiBpZSBgaXQoJ3Rlc3QnLCAoZG9uZSkgPT4geyAuLi4gfSkpO2BcblxuICAgIGlmICgoPGFueT50ZXN0Rm4pLmxlbmd0aCA9PT0gMCkge1xuICAgICAganNtRm4obmFtZSwgKCkgPT4ge1xuICAgICAgICB2YXIgaW5qZWN0b3IgPSBjcmVhdGVUZXN0SW5qZWN0b3JXaXRoUnVudGltZUNvbXBpbGVyKHRlc3RQcm92aWRlcnMpO1xuICAgICAgICBydW5uZXIucnVuKGluamVjdG9yKTtcbiAgICAgICAgKDxTeW5jVGVzdEZuPnRlc3RGbikoKTtcbiAgICAgIH0sIHRpbWVPdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBqc21GbihuYW1lLCAoZG9uZSkgPT4ge1xuICAgICAgICB2YXIgaW5qZWN0b3IgPSBjcmVhdGVUZXN0SW5qZWN0b3JXaXRoUnVudGltZUNvbXBpbGVyKHRlc3RQcm92aWRlcnMpO1xuICAgICAgICBydW5uZXIucnVuKGluamVjdG9yKTtcbiAgICAgICAgKDxBc3luY1Rlc3RGbj50ZXN0Rm4pKGRvbmUpO1xuICAgICAgfSwgdGltZU91dCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpdChuYW1lLCBmbiwgdGltZU91dCA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21JdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24geGl0KG5hbWUsIGZuLCB0aW1lT3V0ID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbVhJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaWl0KG5hbWUsIGZuLCB0aW1lT3V0ID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUlJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgR3VpbmVzc0NvbXBhdGlibGVTcHkgZXh0ZW5kcyBqYXNtaW5lLlNweSB7XG4gIC8qKiBCeSBjaGFpbmluZyB0aGUgc3B5IHdpdGggYW5kLnJldHVyblZhbHVlLCBhbGwgY2FsbHMgdG8gdGhlIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIGEgc3BlY2lmaWNcbiAgICogdmFsdWUuICovXG4gIGFuZFJldHVybih2YWw6IGFueSk6IHZvaWQ7XG4gIC8qKiBCeSBjaGFpbmluZyB0aGUgc3B5IHdpdGggYW5kLmNhbGxGYWtlLCBhbGwgY2FsbHMgdG8gdGhlIHNweSB3aWxsIGRlbGVnYXRlIHRvIHRoZSBzdXBwbGllZFxuICAgKiBmdW5jdGlvbi4gKi9cbiAgYW5kQ2FsbEZha2UoZm46IEZ1bmN0aW9uKTogR3VpbmVzc0NvbXBhdGlibGVTcHk7XG4gIC8qKiByZW1vdmVzIGFsbCByZWNvcmRlZCBjYWxscyAqL1xuICByZXNldCgpO1xufVxuXG5leHBvcnQgY2xhc3MgU3B5T2JqZWN0IHtcbiAgY29uc3RydWN0b3IodHlwZSA9IG51bGwpIHtcbiAgICBpZiAodHlwZSkge1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiB0eXBlLnByb3RvdHlwZSkge1xuICAgICAgICB2YXIgbSA9IG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbSA9IHR5cGUucHJvdG90eXBlW3Byb3BdO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gQXMgd2UgYXJlIGNyZWF0aW5nIHNweXMgZm9yIGFic3RyYWN0IGNsYXNzZXMsXG4gICAgICAgICAgLy8gdGhlc2UgY2xhc3NlcyBtaWdodCBoYXZlIGdldHRlcnMgdGhhdCB0aHJvdyB3aGVuIHRoZXkgYXJlIGFjY2Vzc2VkLlxuICAgICAgICAgIC8vIEFzIHdlIGFyZSBvbmx5IGF1dG8gY3JlYXRpbmcgc3B5cyBmb3IgbWV0aG9kcywgdGhpc1xuICAgICAgICAgIC8vIHNob3VsZCBub3QgbWF0dGVyLlxuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgbSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuc3B5KHByb3ApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIE5vb3Agc28gdGhhdCBTcHlPYmplY3QgaGFzIHRoZSBzYW1lIGludGVyZmFjZSBhcyBpbiBEYXJ0XG4gIG5vU3VjaE1ldGhvZChhcmdzKSB7fVxuXG4gIHNweShuYW1lKSB7XG4gICAgaWYgKCF0aGlzW25hbWVdKSB7XG4gICAgICB0aGlzW25hbWVdID0gdGhpcy5fY3JlYXRlR3Vpbm5lc3NDb21wYXRpYmxlU3B5KG5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpc1tuYW1lXTtcbiAgfVxuXG4gIHByb3AobmFtZSwgdmFsdWUpIHsgdGhpc1tuYW1lXSA9IHZhbHVlOyB9XG5cbiAgc3RhdGljIHN0dWIob2JqZWN0ID0gbnVsbCwgY29uZmlnID0gbnVsbCwgb3ZlcnJpZGVzID0gbnVsbCkge1xuICAgIGlmICghKG9iamVjdCBpbnN0YW5jZW9mIFNweU9iamVjdCkpIHtcbiAgICAgIG92ZXJyaWRlcyA9IGNvbmZpZztcbiAgICAgIGNvbmZpZyA9IG9iamVjdDtcbiAgICAgIG9iamVjdCA9IG5ldyBTcHlPYmplY3QoKTtcbiAgICB9XG5cbiAgICB2YXIgbSA9IFN0cmluZ01hcFdyYXBwZXIubWVyZ2UoY29uZmlnLCBvdmVycmlkZXMpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChtLCAodmFsdWUsIGtleSkgPT4geyBvYmplY3Quc3B5KGtleSkuYW5kUmV0dXJuKHZhbHVlKTsgfSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NyZWF0ZUd1aW5uZXNzQ29tcGF0aWJsZVNweShuYW1lKTogR3VpbmVzc0NvbXBhdGlibGVTcHkge1xuICAgIHZhciBuZXdTcHk6IEd1aW5lc3NDb21wYXRpYmxlU3B5ID0gPGFueT5qYXNtaW5lLmNyZWF0ZVNweShuYW1lKTtcbiAgICBuZXdTcHkuYW5kQ2FsbEZha2UgPSA8YW55Pm5ld1NweS5hbmQuY2FsbEZha2U7XG4gICAgbmV3U3B5LmFuZFJldHVybiA9IDxhbnk+bmV3U3B5LmFuZC5yZXR1cm5WYWx1ZTtcbiAgICBuZXdTcHkucmVzZXQgPSA8YW55Pm5ld1NweS5jYWxscy5yZXNldDtcbiAgICAvLyByZXZpc2l0IHJldHVybiBudWxsIGhlcmUgKHByZXZpb3VzbHkgbmVlZGVkIGZvciBydHRzX2Fzc2VydCkuXG4gICAgbmV3U3B5LmFuZC5yZXR1cm5WYWx1ZShudWxsKTtcbiAgICByZXR1cm4gbmV3U3B5O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0luSW5uZXJab25lKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gKDxOZ1pvbmVab25lPmdsb2JhbC56b25lKS5faW5uZXJab25lID09PSB0cnVlO1xufVxuIl19