///Min is a mini jQuery replacement based on code from http://youmightnotneedjquery.com/
//Also I copied some code from lodash and jQuery
///Min is a shortcut of the word Minimum
///Min supports IE8+
/*global ActiveXObject*/
'use strict';
(function () {

    var mm = new Minimum(); //a Minimum to use on self;
    window.mm = mm;

    function Minimum() {

        var diContainer = null,
            onDocumentReadyEvent = null;

        /** Used for native method references. */
        var objectProto = Object.prototype;

        /* Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
         * of values.
         */
        var objToString = objectProto.toString,
            funcTag = '[object Function]';

        this.hide = function (el) {
            el.style.display = 'none';
        };

        this.show = function (el) {
            el.style.display = '';
        };

        this.noop = function () { };

        this.byId = function (id) {
            return document.getElementById(id);
        };

        this.create = function (htmlElem) {
            return document.createElement(htmlElem);
        };

        this.remove = function (el) {
            if (this.isElement(el)) {
                throw 'you cannot remove a none Dom element or the element is already null';
            }
            el.parentNode.removeChild(el);
        };

        this.append = function (el, parent) {
            parent.appendChild(el);
        };

        this.on = function (el, eventName, handler) {
            if (el.addEventListener) {
                el.addEventListener(eventName, handler);
            } else {
                el.attachEvent('on' + eventName, function () {
                    handler.call(el);
                });
            }
        };

        this.off = function (el, eventName, handler) {
            if (el.removeEventListener) {
                el.removeEventListener(eventName, handler);
            } else {
                el.detachEvent('on' + eventName, handler);
            }
        };

        this.onReady = function (fn) {
            if (!onDocumentReadyEvent) {
                onDocumentReadyEvent = this.Callbacks('onDocumentReady');
                onDocumentReadyEvent.add(fn);
                setOnDocumentReady();
            } else {
                onDocumentReadyEvent.add(fn);
            }

        };

        this.get = function (url, onSuccessFn, onErrorFn, alwaysFn, returnJSON) {
            var request = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
            if (!this.isFunction(onSuccessFn)) {
                throw 'onSuccessFn is not a function';
            }
            request.open('GET', url, true);
            if (returnJSON) {
                request.setRequestHeader('Accept', 'application/json');
            }
            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    var data = (returnJSON) ? JSON.parse(this.responseText) : this.responseText;
                    if (this.status >= 200 && this.status < 400) {
                        onSuccessFn(data);
                    } else {
                        if (mm.isFunction(onErrorFn)) {
                            onErrorFn(data);
                        }
                    }
                    if (mm.isFunction(alwaysFn)) {
                        alwaysFn(data);
                    }
                }
            };
            request.send();
            request = null;
        };

        this.getJSON = function (url, onSuccessFn, onErrorFn, alwaysFn) {
            this.get(url, onSuccessFn, onErrorFn, alwaysFn, true);
        };

        this.loadArray = function (url, onLoadFn) {
            if (!this.isFunction(onLoadFn)) {
                throw 'onLoadFn parameter must be a function';
            }

            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';

            request.onload = function () {
                onLoadFn(request.response);
            };

            request.send();
        };

        this.post = function (url, data) {
            var request = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
            request.open('POST', url, true);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.send(data);
        };

        this.getScript = function (url, callback) {
            // adding the script tag to the head as suggested before
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;

            if (!callback) {
                callback = this.noop;
            }

            // bind the event to the callback function 
            if (script.addEventListener) {
                script.addEventListener('load', callback, false); // IE9+, Chrome, Firefox
            } else if (script.readyState) { // IE8
                script.onreadystatechange = function () {
                    if (script.readyState === 'loaded' || script.readyState === 'complete') {
                        callback();
                    }
                };
            }

            // fire the loading
            head.appendChild(script);
        };

        this.extend = function (out) {
            out = out || {};
            for (var i = 1; i < arguments.length; i++) {
                if (!arguments[i]) {
                    continue;
                }

                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key)) {
                        out[key] = arguments[i][key];
                    }
                }
            }
            return out;
        };

        // min.select(el, selector) looks insde the element
        // or min.select(selector) looks in all DOM
        this.select = function (el, selector) {
            if (!this.isElement(el) && !selector) { //find the parent element
                selector = el;
                el = null;
            }
            if (!el) {
                el = document;
            }
            return el.querySelectorAll(selector);
        };

        this.addClass = function (el, className) {
            if (el.classList) {
                el.classList.add(className);
            } else {
                el.className += ' ' + className;
            }
        };

        this.removeClass = function (el, className) {
            if (el.classList) {
                el.classList.remove(className);
            } else {
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        };

        this.hasClass = function (el, className) {
            if (el.classList) {
                el.classList.contains(className);
            } else {
                new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
            }
        };

        this.toggleClass = function (el, className) {
            if (el.classList) {
                el.classList.toggle(className);
            } else {
                var classes = el.className.split(' ');
                var existingIndex = -1;
                for (var i = classes.length; i--;) {
                    if (classes[i] === className) {
                        existingIndex = i;
                    }
                }
                if (existingIndex >= 0) {
                    classes.splice(existingIndex, 1);
                } else {
                    classes.push(className);
                }

                el.className = classes.join(' ');
            }
        };

        this.inArray = function (array, item) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }
            return -1;
        };

        this.forEach = function (array, fn, scope) {
            for (var i = 0; i < array.length; i++) {
                fn.call(scope, array[i], i);
            }
        };

        //if text is set it will set the text
        //if text is empty you will get the actual text
        this.text = function (el, text) {
            if (text) {
                if (typeof el.textContent !== 'undefined') {
                    el.textContent = text;
                } else {
                    el.innerText = text;
                }
            }

            return el.textContent || el.innerText;
        };

        this.html = function (el, html) {
            if (html) {
                el.innerHTML = html;
            }
            return el.innerHTML;
        };

        this.attr = function (el, attr, value) {
            if (value) {
                el.setAttribute(attr, value);
            }
            return el.getAttribute(attr);
        };


        ///If url is empty gets the url form window.location
        this.getQueryStringValues = function (url, getHashValues) {
            if (!url) {
                url = (getHashValues) ? window.location.hash : window.location.search;
            }
            var j = {},
                q = ((getHashValues) ? url.replace(/\#/, '').replace(/\?/, '') : url.replace(/\?/, '')).split('&');
            this.forEach(q, function (i) {
                var arr = i.split('=');
                j[arr[0]] = arr[1];
            });
            return j;
        };

        this.pushArray = function (array1, array2) {
            array1.push.apply(array1, array2);
        };

        this.isArray = function isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };

        this.getHashValues = function (url) {
            return this.getQueryStringValues(url, true);
        };

        /**
         * Checks if `value` is classified as a `Function` object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isFunction(_);
         * // => true
         *
         * _.isFunction(/abc/);
         * // => false
         */
        this.isFunction = function (value) {
            // The use of `Object#toString` avoids issues with the `typeof` operator
            // in Safari 8 which returns 'object' for typed array constructors, and
            // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
            return this.isObject(value) && objToString.call(value) === funcTag;
        };

        /**
         * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
         * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an object, else `false`.
         * @example
         *
         * _.isObject({});
         * // => true
         *
         * _.isObject([1, 2, 3]);
         * // => true
         *
         * _.isObject(1);
         * // => false
         */
        this.isObject = function (value) {
            // Avoid a V8 JIT bug in Chrome 19-20.
            // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
            var type = typeof value;
            return !!value && (type === 'object' || type === 'function');
        };

        this.isElement = function (o) {
            return isElement(o) || isNode(o);
        };

        this.map = function (arr, fn) {
            var results = [];
            for (var i = 0; i < arr.length; i++) {
                results.push(fn(arr[i], i));
            }
            return results;
        };

        //similar to $.Callbacks
        //methods that supports: add, fire, remove and empty
        this.Callbacks = function (nameOfTheCallbacks) {
            return new Callbacks(nameOfTheCallbacks);
        };

        this.resolve = function (deps, func, scope) {
            diContainer = diContainer || new Injector();
            diContainer.resolve(deps, func, scope);
        };

        this.app = function (deps, func, scope) {
            diContainer = diContainer || new Injector();
            diContainer.app(deps, func, scope);
        };

        this.module = function (name, deps, func, scope) {
            diContainer = diContainer || new Injector();
            diContainer.module(name, deps, func, scope);
        };


        ///Private methods
        //Returns true if it is a DOM node //copied from: http://stackoverflow.com/a/384380/187673
        function isNode(o) {
            return (
                typeof Node === 'object' ? o instanceof Node :
                o && typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string'
            );
        }

        //Returns true if it is a DOM element //copied from: http://stackoverflow.com/a/384380/187673   
        function isElement(o) {
            return (
                typeof HTMLElement === 'object' ? o instanceof HTMLElement : //DOM2
                o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
            );
        }

        function setOnDocumentReady() {
            if (document.readyState !== 'loading' && document.readyState !== 'interactive') {
                onDocumentReadyEvent.fire();
            } else if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', function () {
                    onDocumentReadyEvent.fire();
                });
            } else {
                document.attachEvent('onreadystatechange', function () {
                    if (document.readyState !== 'loading') {
                        onDocumentReadyEvent.fire();
                    }
                });
            }
            onDocumentReadyEvent.setAutoFireOnNewAdds(true);
        }
    } //end Minimum

    //OTHER PRIVATE OBJECTS
    //Callbacks
    function Callbacks(name) {

        var callbackName = name,
            autoFire = false,
            listOfCallbacks = [];

        this.add = function () {
            for (var i = 0; i < arguments.length; i++) {
                var fn = arguments[i];
                if (fn && mm.isFunction(fn)) {
                    listOfCallbacks.push(fn);
                    if (autoFire) {
                        fireToFn(fn);
                    }
                }
            }
        };

        this.empty = function () {
            listOfCallbacks = [];
            return true;
        };

        this.fire = function () {
            var args = arguments;
            for (var i = 0; i < listOfCallbacks.length; i++) {
                fireToFn(listOfCallbacks[i], args);
            }
        };

        this.remove = function (fn) {
            var index = mm.inArray(listOfCallbacks, fn);
            if (mm.isFunction(fn) && index >= 0) {
                listOfCallbacks.splice(index, 1);
                return true;
            }
            return false;
        };

        //this is when this event is executed only one time. And perhaps some handlers where attached after the event was release
        this.setAutoFireOnNewAdds = function (enable) {
            autoFire = enable;
        };

        function fireToFn(callback, args) {
            try {
                args = (args) ? args : []; //ie8 bug
                callback.apply(null, args);

                callbackName = callbackName;
            } catch (err) {
                console.log('a function thrown an error on Callbacks named: ' + callbackName + ' the error was: ' + err);
            }
        }

    } //end Callbacks

    ///Injector
    function Injector() {
        var app, self = this,
            modules = {};

        this.resolve = function (deps, func, scope) {
            if (!deps || deps.length <= 0) {
                return function () {
                    return func.apply(scope || {});
                };
            }

            for (var i = 0; i < deps.length; i++) {
                var dep = deps[i];
                var module = modules[dep];
                if (!module.result && !module.hasResult) {
                    var resolvedFunc = this.resolve(module.deps, module.func, module.scope);
                    module.result = resolvedFunc();
                    module.hasResult = true; //in case the function does not return nothing
                }
            }

            return function () {
                var args = [];
                for (var i = 0; i < deps.length; i++) {
                    args.push(modules[deps[i]].result);
                }
                return func.apply(scope || {}, args);
            };
        };

        this.module = function (name, deps, func, scope) {
            if (mm.isFunction(deps)) {
                func = deps;
                deps = null;
            }
            if (deps && !mm.isArray(deps)) {
                throw 'In module ' + name + ' the depedencies are not an array format.';
            }
            modules[name] = {
                deps: deps,
                func: func,
                scope: scope,
                result: null,
                name: name
            }; //name prop is for easy debug 
        };

        this.app = function (deps, func, scope) {
            if (!deps && !mm.isArray(deps)) {
                throw 'the dependiencies of an app cannot be null and must be an array';
            }
            if (!func && !mm.isFunction(func)) {
                throw 'the second parameter of an app cannot be null and must be an function';
            }
            app = {};
            app.deps = deps;
            app.func = func;
            app.scope = scope;
        };

        mm.onReady(function () {
            if (app) {
                var mmApp = self.resolve(app.deps, app.func, app.scope);
                mmApp();
            }
        });

    } //end injector

})();