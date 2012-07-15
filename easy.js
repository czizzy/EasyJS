'use strict';
(function(window, undefined) {
    var Easy = (function(){
        var _$ = window.$,
            Easy = function(selector, context){
                if(_isFunction(selector)) return $(document).ready(selector);
                return new Easy.fn.init(selector, context);
            },

            origToString = Object.prototype.toString,
            origSlice = Array.prototype.slice,
            origFilter = Array.prototype.filter,
            origMatch = HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector,

            rid = /^#([\w-]+)$/,
            rclass = /^\.([\w-]+)$/,
            rtag = /^([\w-]+)$/,
            rspace = /\s+/,
            rfragment = /^\s*<(\w+)>/,
            rready = /interactive|complete/,
            propFix = {
                tabindex: "tabIndex",
                readonly: "readOnly",
                "for": "htmlFor",
                "class": "className",
                maxlength: "maxLength",
                cellspacing: "cellSpacing",
                cellpadding: "cellPadding",
                rowspan: "rowSpan",
                colspan: "colSpan",
                usemap: "useMap",
                frameborder: "frameBorder",
                contenteditable: "contentEditable"
            },

            // TODO: fix table element
            container = document.createElement('div'),

            // optimize options
            hasClassList = false,
            classCache = {},
            displayCache = {},

            _isObject = function(value) {
                return value === Object(value);
            },

            _isFunction = function(value) {
                return origToString.call(value) === '[object Function]';
            },

            _merge = function(first, second) {
                var i = first.length,
                    cachedLength = first.length,
                    j = 0;
                if(!second) return;
                if(second.nodeType){
                    first[i++] = second;
                } else if(typeof second.length === 'number') {
                    for(var l = second.length; j < l; j++){
                        first[i++] = second[j];
                    }
                }

                first.length = i;

                // make the result elements unique
                for(var m = cachedLength; m < i; m++){
                    for(var n = 0; n < cachedLength; n++){
                        if(first[m] === first[n]){
                            first.splice(m--, 1);  // first.length is modified by splice
                            i--;
                            break;
                        }
                    }
                }
                return first;
            },

            _matches = function(target, selector) {
                if(!selector || (typeof selector !== 'string')) return target.nodeType ? target : origFilter.call(target, function(item){
                    return item;
                });
                selector = selector.trim();
                return target.nodeType === 1 ? (origMatch.call(target, selector) ? target : null)
                : (typeof target.length === 'number' ? origFilter.call(target, function(item) {
                    return item && item.nodeType === 1 && origMatch.call(item, selector.trim());
                }) : null);
            },

            _fragment = function(s) {
                container.innerHTML = s;
                return origSlice.call(container.childNodes, 0).map(
                    function(node){
                        return container.removeChild(node);
                    }
                );
            },

            _getHTML = function(nodes) {
                var value, i, l, node;
                if(l = nodes.length){
                    for(i = 0, l = nodes.length; i < l; i++){
                        // Easy Obj, reserve the origin nodes
                        container.appendChild(nodes[i].cloneNode(true));
                    }
                } else if (nodes.nodeType) {
                    // reserve the origin nodes
                    container.appendChild(nodes.cloneNode(true));
                }
                value = container.innerHTML;
                container.innerHTML = '';
                return value;
            },

            _insert = function(target, method, context) {
                var elementsHTML;
                if(typeof target !== 'string'){
                    elementsHTML = _getHTML(target);
                } else {
                    elementsHTML = target;
                }
                return context.each(function(element, index){
                    var i, l, src, parent, insertMethod, insert = "insertBefore", append = "appendChild", reverse = false;
                    if(!index && typeof target !== 'string'){
                        switch (method) {
                        case 'afterend':
                            parent = element.parentNode;
                            src = element.nextSibling;
                            insertMethod = src ? insert : append;
                            break;
                        case 'beforebegin':
                            parent = element.parentNode;
                            src = element;
                            insertMethod = insert;
                            break;
                        case 'afterbegin':
                            parent = element;
                            src = element.firstChild;
                            insertMethod = insert;
                            reverse = true;
                            break;
                        case 'beforeend':
                            parent = element;
                            src = element;
                            insertMethod = append;
                            break;
                        }
                        if('length' in target) {
                            reverse && Array.prototype.reverse.apply(target);
                            for(i = 0, l = target.length; i < l; i++){
                                parent[insertMethod](target[i], src);
                            }
                        } else if(target.nodeType) {
                            parent[insertMethod](target, src);
                        }
                    } else {
                        element.insertAdjacentHTML(method, elementsHTML);
                    }
                });
            },

            _each = function(target, callback) {
                if('length' in target) {
                    for(var i = 0; i < target.length; i++){
                        if(callback.call(target[i], target[i], i, target) === false) return target;
                    }
                } else {
                    for(var k in target) {
                        if(callback.call(target[k], target[k], k, target) === false) return target;
                    }
                }
                return target;
            },

            _dasherize = function(name) {
                return name.replace(/([A-Z]+)/g, '-$1').toLowerCase();
            },

            _camelize = function(name) {
                return name.toLowerCase().replace(/-(\w)/g, function(match, letter){
                    return letter.toUpperCase();
                });
            },

            _getDefaultDisplay = function(nodeName) {
                var element, display;
                if(!displayCache[nodeName]){
                    element = document.createElement(nodeName);
                    document.body.appendChild(element);
                    display = window.getComputedStyle(element).getPropertyValue('display');
                    displayCache[nodeName] = (display === 'none') ? 'block' : display;
                    element.parentNode.removeChild(element);
                }
                return displayCache[nodeName];
            };

        Easy.prototype = Easy.fn = {
            constructor: Easy,

            length: 0,

            init: function(selector, context) {
                var dom, match;
                if(!selector) return this;

                if(selector.nodeType) {
                    this[0] = selector;
                    this.length = 1;
                    return this;
                }

                if(selector == 'body') {
                    this[0] = document.body;
                    this.length = 1;
                    return this;
                }

                if(typeof selector === "string") {
                    selector = selector.trim();
                    if(rfragment.test(selector)){
                        return this.constructor(_fragment(selector));
                    } else {
                        this.selector = selector;
                        if(match = selector.match(rid)){
                            _merge(this, document.getElementById(match[1]));
                            return this;
                        } else {
                            context = context?(Easy.isEasy(context)?context:this.constructor(context)):this.constructor(document);
                            return context.find(selector);
                        }
                    }
                }

                if('length' in selector) {
                    return _merge(this, selector);
                }

                return this;
            },

            // Traversing
            find: function(selector){
                var result = this.constructor(),
                    match;
                if(typeof selector === 'string'){
                    selector = selector.trim();
                    if(match = selector.match(rid)){
                        _merge(result, document.getElementById(match[1]));
                    } else {
                        var queryFunction = 'querySelectorAll';
                        if (match = selector.match(rclass)) {
                            queryFunction = 'getElementsByClassName';
                        } else if (match = selector.match(rtag)) {
                            queryFunction = 'getElementsByTagName';
                        }
                        this.each(function(element, index){
                            _merge(result, element[queryFunction](match?match[1]:selector));
                        });

                    }
                    return result;
                }
            },

            children: function(selector) {
                var result = this.constructor();;

                this.each(function(element, index){
                    _merge(result, _matches(element.children, selector));
                });

                return result;
            },

            parent: function(selector) {
                var result = this.constructor();;

                this.each(function(element, index){
                    _merge(result, _matches(element.parentNode, selector));
                });

                return result;
            },

            parents: function(selector) {
                var result = this.constructor(), ancestors = [];

                this.each(function(element, index){
                    var node = element;
                    while((node = node.parentNode) && node !== document) {
                        if(ancestors.indexOf(node) === -1) {
                            ancestors.push(node);
                        }
                    }
                });
                _merge(result, _matches(ancestors, selector));

                return result;
            },

            first: function(){
                var el = this[0];
                return _isObject(el) ? this.constructor(this[0]) : el;
            },

            last: function() {
                var el = this[this.length - 1];
                return _isObject(el) ? this.constructor(el) : el;
            },

            eq: function(index) {
                index = index < 0 ? (this.length + index) : index;
                var el  = this[index];
                return _isObject ? this.constructor(el) : el;
            },

            closest: function(selector, context) {
                var node = this[0];

                while(node && !_matches(node, selector)){
                    if(node !== document && node !== context) {
                        node = node.parentNode;
                    } else {
                        node = null;
                    }
                }
                return this.constructor(node);
            },

            prev: function(selector) {
                var result = this.constructor();
                _merge(result, _matches(this.pluck('previousElementSibling'),selector));
                return result;
            },

            next: function(selector) {
                var result = this.constructor();
                _merge(result, _matches(this.pluck('nextElementSibling'),selector));
                return result;
            },

            siblings: function(selector) {
                var result = this.constructor();
                this.each(function(element){
                    _merge(result, _matches(origSlice.call(element.parentNode.children).filter(function(item){ return item !== element; }), selector));
                });
                return result;
            },

            // Manipulation

            // native classList api is faster
            // https://developer.mozilla.org/media/uploads/demos/p/a/paulrouget/8bfba7f0b6c62d877a2b82dd5e10931e/hacksmozillaorg-achi_1334270447_demo_package/classList/
            addClass: function(name) {
                var classNames, setClass;
                if(this.length && name && typeof name === 'string') {
                    classNames = name.split(rspace);
                    if(hasClassList || (hasClassList = !!this[0].classList)){
                        this.each(function(element) {
                            for(var i = 0, l = classNames.length; i < l; i++) {
                                element.classList.add(classNames[i]);
                            }
                        });
                    } else {
                        this.each(function(element) {
                            if(element.nodeType === 1){
                                if(!element.className) {
                                    element.className = name;
                                } else {
                                    setClass = ' ' + element.className + ' ';
                                    for(var i = 0, l = classNames.length; i < l; i++) {
                                        if(!~setClass.indexOf(' ' + classNames[i] + ' ')){
                                            setClass += classNames[i] + ' ';
                                        }
                                    }
                                    element.className = setClass.trim();
                                }
                            }
                        });
                    }
                }
                return this;
            },

            removeClass: function(name) {
                var classNames, className;
                if((this.length && name && typeof name === 'string') || name === undefined) {
                    classNames = (name || '').trim().split(rspace);
                    if(hasClassList || (hasClassList = !!this[0].classList)){
                        this.each(function(element) {
                            if(name){
                                for(var i = 0, l = classNames.length; i < l; i++) {
                                    element.classList.remove(classNames[i]);
                                }
                            } else {
                                element.className = '';
                            }
                        });
                    } else {
                        this.each(function(element) {
                            if(element.nodeType === 1 && element.className) {
                                if(name) {
                                    className = (' ' + element.className + ' ').replace(/[\r\n\t]/g, ' ');
                                    for(var i = 0, l = classNames.length; i < l; i++) {
                                        className = className.replace(' ' + classNames[i] + ' ', ' ');
                                    }
                                    element.className = className.trim();
                                } else {
                                    element.className = '';
                                }
                            }
                        });
                    }
                }
                return this;
            },

            toggleClass: function(name) {
                var classNames;
                if(this.length && typeof name == 'string') {
                    classNames = name.trim().split(rspace);
                    if(hasClassList || (hasClassList = !!this[0].classList)) {
                        this.each(function(element) {
                            for(var i = 0, l = classNames.length; i < l; i++) {
                                element.classList.toggle(classNames[i]);
                            }
                        });
                    } else {
                        for(var i = 0, l = classNames.length; i < l; i++) {
                            this.hasClass(classNames[i])?this.removeClass(classNames[i]):this.addClass(classNames[i]);
                        }
                    }
                }
                return this;
            },

            hasClass: function(name) {
                if(typeof name == 'string' && this.length && this[0].nodeType === 1){
                    if(hasClassList || (hasClassList = !!this[0].classList)) {
                        return this[0].classList.contains(name);
                    } else {
                        return (classCache[name] || (classCache[name] = RegExp('(^|\\s)' + name + '($|\\s)'))).test(this[0].className);
                    }
                }
                return false;
            },

            // an interface to set and get values of an Easy object
            access: function(fn, key, value) {
                var chainable = true, result;
                // get
                if(value === undefined && typeof key === 'string'){
                    chainable = false;
                    this.length && this[0].nodeType === 1 && (result = fn.call(this[0], this[0], key));
                } else {  // set
                    if(_isObject(key)) {
                        for(var i in key) this.access(fn, i, key[i]);
                    } else {
                        this.each(function(element) {
                            fn.call(element, element, key, value);
                        });
                    }
                }
                return chainable ? this : result;
            },

            attr: function(name, value) {
                return this.access(function(element, k, v) {
                    if(v === undefined) {
                        return element.getAttribute(k);
                    } else {
                        element.setAttribute(k, v);
                        return element;
                    }
                }, name, value);
            },

            removeAttr: function(name) {
                this.each(function(element){
                    if(element.nodeType === 1) {
                        element.removeAttribute(name);
                    }
                });
                return this;
            },

            prop: function(name, value) {
                name = propFix[name] || name;

                return this.access(function(element, k, v){
                    if(v === undefined) {
                        return element[k];
                    } else {
                        element[k] = v;
                        return element;
                    }
                }, name, value);
            },

            // getAttribute is faster than dataset
            // http://jsperf.com/domdata-dataset-get
            data: function(name, value) {
                return this.attr('data-' + _dasherize(name), value);
            },

            empty: function() {
                return this.each(function(element){
                    element.innerHTML = '';
                });
            },

            remove: function() {
                return this.each(function(element) {
                    element.parentNode.removeChild(element);
                });
            },

            text: function(value) {
                return this.access(function(element, k, v){
                    if(v === undefined){
                        return element[k];
                    } else {
                        element[k] = v;
                        return element;
                    }
                }, 'textContent', value);
            },

            html: function(value) {
                return this.access(function(element, k, v){
                    if(v === undefined){
                        return element[k];
                    } else {
                        if(typeof v === 'string'){
                            element[k] = v;
                        } else if(v.nodeType){
                            element.innerHTML = '';
                            element.appendChild(v);
                        } else if(Easy.isEasy(v)){
                            element.innerHTML = '';
                            element.appendChild(v[0]);
                        }
                        return element;
                    }
                }, 'innerHTML', value);
            },

            after: function(target) {
                return _insert(target, 'afterend', this);
            },

            append: function(target) {
                return _insert(target, 'beforeend', this);
            },

            appendTo: function(target) {
                if(Easy.isEasy(target)){
                    target.append(this);
                } else {
                    this.constructor(target).append(this);
                }
                return this;
            },

            before: function(target) {
                return _insert(target, 'beforebegin', this);
            },

            prepend: function(target) {
                return _insert(target, 'afterbegin', this);
            },

            prependTo: function(target) {
                if(Easy.isEasy(target)){
                    target.prepend(this);
                } else {
                    this.constructor(target).prepend(this);
                }
                return this;
            },

            val: function(value) {
                return this.access(function(element, k, v){
                    if(v === undefined){
                        return element.multiple ? Easy(origFilter.call(element, function(e){ return e.selected; })).pluck(k) : element[k];
                    } else {
                        element[k] = v;
                        return element;
                    }
                }, 'value', value);
            },

            css: function(name, value) {
                return this.access(function(element, k, v){
                    if(v === undefined) {
                        return element.style[_camelize(k)] || window.getComputedStyle(element).getPropertyValue(_dasherize(k));
                    } else {
                        if(v === '') {
                            element.style.removeProperty(_dasherize(k));
                        } else {
                            element.style.cssText += (';' + _dasherize(k) + ':' + v + ';');
                        }
                        return element;
                    }
                }, name, value);
            },

            show: function() {
                return this.each(function(element){
                    element.style.display = _getDefaultDisplay(this.nodeName);
                });
            },

            hide: function() {
                return this.css('display', 'none');
            },

            // Miscellaneous
            ready: function(fn){
                if(rready.test(document.readyState)) fn();
                else document.addEventListener('DOMContentLoaded', fn, false);
                return this;
            },

            add: function(selector, context) {
                return _merge(this, this.constructor(selector, context));
            },

            get: function(index) {
                return index === undefined?origSlice.call(this):this[index];
            },

            pluck: function(property){
                return this.map(function(item){
                    return item[property];
                });
            },

            each: function(callback){
                _each.call(this, this, callback);
                return this;
            },

            splice: [].splice,
            map: [].map
        };

        Easy.fn.init.prototype = Easy.fn;

        var extend = Easy.extend = Easy.fn.extend = function(target, source) {
            if(source === undefined) {
                source = target;
                target = this;
            }
            for(var key in source){
                target[key] = source[key];
            }
            return target;
        };

        Easy.extend({  // TODO: nonConflict
            version: '0.1',
            isEasy: function(obj){
                return obj instanceof Easy;
            },

            isObject: _isObject,
            isFunction: _isFunction,
            isArray: Array.isArray || function(value) {
                return origToString.call(value) === '[object Array]';
            },

            inherit: function() {
                function F(){}

                return function(o){
                    F.prototype = o;
                    return new F();
                };
            }(),

            default: function(target, src) {
                for(var key in src){
                    if(!(key in target)) target[key] = src[key];
                }
                return target;
            },

            merge: _merge,
            each: _each,

            escape: function(string) {
                return (''+string)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g,'&#x2F;');
            },

            template: function(template) {  // TODO: configurable
                var content = /<%=([\s\S]+?)%>/g, escaper = /<%-([\s\S]+?)%>/g, coder = /<%([\s\S]+?)%>/g, spaceRex = /(\r|\n|\t)/g;
                var source = "var __p='';__p+='" + template.replace(spaceRex, '')
                        .replace(content, "'+$1+'")
                        .replace(escaper, function(match, str) {
                            return "'+$.escape(" + str + ")+'";
                        })
                        .replace(coder, function(match, code) {
                            return "';"+code+"__p+='";
                        }) + "';";
                source = 'with(obj||{}){'+source+'} return __p;';
                return new Function('obj', source);
            }

        });

        return Easy;
    })();

    window.$ = window.Easy = Easy;

    // AMD support
    if(typeof define === 'function'){
        define('easy', [], function(require, exports){
            return Easy;
        });
    }
})(window);
(function($) {
    var handlers = {}, _eid = 1, specialEvents = {},
        eventMethods = ['preventDefault', 'stopImmediatePropagation', 'stopPropagation'];
    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';

    function eid(element) {
        return element._eid || (element._eid = _eid++);
    }

    function getHandlers(element, event, fn, selector){
        var element_eid = eid(element);
        return (handlers[element_eid] || []).filter(function(handler){
            return handler && (handler.event == event) && (!selector || selector === handler.selector) && (!fn || fn === handler || fn === handler.originalHandler);
        });
    }

    function add(element, event, fn, selector) {
        var element_eid = eid(element);
        fn.event = event;
        fn.selector = selector;
        (handlers[element_eid] || (handlers[element_eid] = [])).push(fn);
        element.addEventListener(event, fn);
    }

    function remove(element, event, fn, selector) {
        var elementHandlers = handlers[eid(element)];
        getHandlers(element, event, fn, selector).forEach(function(handler) {
            elementHandlers.splice(elementHandlers.indexOf(handler), 1);
            element.removeEventListener(handler.event, handler);
        });
    }

    function createProxy(event){
        var proxy = $.extend({originalEvent: event}, event);
        eventMethods.forEach(function(method){
            proxy[method] = function(){
                return event[method].apply(event, arguments);
            };
        });
        return proxy;
    }

    $.Event = function(type, options) {
        var event = document.createEvent(specialEvents[type] || 'Events'),
            bubbles = options?(!!options.bubbles) : true;
        event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null);
        return event;
    };

    $.fn.extend({
        bind: function(event, fn){
            return this.each(function(element){
                add(element, event, fn);
            });
        },
        
        unbind: function(event, fn) {
            return this.each(function(element) {
                remove(element, event, fn);
            });
        },

        trigger: function(type) {    // TODO: plain object
            var event = $.Event(type);
            return this.each(function(element) {
                element.dispatchEvent(event);
            });
        },

        delegate: function(event, selector, fn) {
            return this.each(function(element){
                var wrapper = function(e) {
                    var event, match;
                    if(match = $(e.target).closest(selector, element)[0]){
		                // use custom Event rather than the (read-only) native event
                        event = createProxy(e);
                        event.currentTarget = match;
                        return fn.call(match, event);
                    }
                };
                wrapper.originalHandler = fn;
                add(element, event, wrapper, selector);
            });
        },

        undelegate: function(event, selector, fn) {
            return this.each(function(element) {
                remove(element, event, fn, selector);
            });
        }

        // TODO: on and off
    });

    ['focusin', 'focusout', 'load', 'resize', 'scroll', 'unload', 'click', 'dblclick', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'change', 'select', 'keydown', 'keypress', 'keyup', 'error'].forEach(function(event) {
        $.fn[event] = function(callback){ return this.bind(event, callback); };
    });
})(Easy);
(function($){
    function buildTransitionText(properties, duration, easing, complete){
        var postfix, textArr = [];
        duration = duration/1000 + 's';
        postfix = ' ' + duration + ' ' + easing;
        for(var key in properties) {
            textArr.push(key + postfix);
        }
        return textArr.join(',') + ';';
    }
    var speed = {
        fast: 200,
        slow: 600
    },
        vendors = {Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS'},
        testEl = document.createElement('div'),
        prefix,
        event;

    $.each(vendors, function(eventPrefix, vendor) {
        if(testEl.style[vendor + 'Transition'] !== undefined) {
            prefix = '-' + vendor.toLowerCase() + '-';
            event = eventPrefix? (eventPrefix + 'TransitionEnd') : 'transitionend';
            return false;
        }
    });
    $.fn.extend({
        animate: function(properties, duration, easing, complete){
            var self = this,
                transitionText,
                wrapper,
                defferFunc;
            duration = speed[duration] || duration;
            if(typeof duration !== 'number') {
                complete = easing;
                easing = duration;
                duration = 400;
            }
            if($.isFunction(easing) || easing == undefined){
                complete = easing;
                easing = 'ease';
            }
            transitionText = buildTransitionText(properties, duration, easing);
            properties[prefix + 'transition'] = transitionText;

            defferFunc = function(deffered){
                if(typeof complete === 'function') {
                    deffered.done(function(e){
                        complete.call(this, e);  
                    });
                }
                wrapper = function(e) {
                    deffered.resolveWith(self, e);
                    self.unbind(event, wrapper);
                };
                self.bind(event, wrapper);
                setTimeout(function(){  // if modified css consecutive, the last one work
                    self.css(properties);
                }, 0);
            }
            if(!this.queue) this.queue = $.Queue();
            this.queue.add(defferFunc);
            return this;
        },

        fadeIn: function(duration, callback){
            return this.css({opacity: 0}).show().animate({opacity: 1}, duration, 'linear', callback);
        },

        fadeOut: function(duration, callback){
            var self = this;
            return this.animate({opacity: 0}, duration, 'linear', function(e){
                self.hide();
                callback.call(this, e);
            });
        }

    });
})(Easy);
(function($){
    var origSlice = Array.prototype.slice;
    $.extend({
        Deffered: function(initFunc){
            var resolved = false,
                rejected = false,
                value,
                error,
                callbacks,
                errCallbacks,
                promise = {
                    then: function(successCallback, errorCallback){
                        if(resolved){
                            successCallback && successCallback.apply(this, value);
                        } else if(rejected){
                            errorCallback && errorCallback.apply(this, error);
                        } else {
                            successCallback && (callbacks || (callbacks = [])).push(successCallback);
                            errorCallback && (errCallbacks || (errCallbacks = [])).push(errorCallback);
                        }
                        return this;
                    },
                    always: function(callback){
                        return this.then(callback, callback);
                    },
                    done: function(callback){
                        return this.then(callback);
                    },
                    fail: function(callback){
                        return this.then(null, callback);
                    },
                    isResolved: function(){
                        return resolved;
                    },
                    isRejected: function(){
                        return rejected;
                    },
                    promise: function(){
                        return this;
                    }
                },
                deffered = $.inherit(promise);
            deffered.resolveWith = function(context){
                var args = origSlice.call(arguments, 1);
                if(!resolved && !rejected){
                    resolved = true;
                    value = args;
                    if(callbacks){
                        callbacks.forEach(function(callback){
                            callback.apply(context, value);
                        });
                    }
                }
            };
            deffered.resolve = function(){
                var args = origSlice.call(arguments, 0);
                args.unshift(this);
                return deffered.resolveWith.apply(this, args);
            };
            deffered.rejectWith = function(context){
                var args = origSlice.call(arguments, 1);
                if(!rejected && !resolved){
                    rejected = true;
                    error = args;
                    if(errCallbacks){
                        errCallbacks.forEach(function(callback){
                            callback.apply(context, error);
                        });
                    }
                }
            };
            deffered.reject = function(){
                var args = origSlice.call(arguments, 0);
                args.unshift(this);
                return deffered.rejectWith.apply(this, args);
            };
            deffered.promise = function(target){
                if($.isObject(target)){
                    return $.extend(target, promise);                    
                }
                return promise;
            };

            initFunc && initFunc.call(deffered, deffered);
            return deffered;
        },
        when: function(first){
            var deffer, list, resolveFunc, rejectFunc, count = arguments.length, results = Array(count);
            if(count === 1 && $.isFunction(first.promise)){
                return first.promise;
            } else {
                resolveFunc = function(i){
                    return function(result){
                        results.splice(i, 1, result);
                        count--;
                        if(!count) {
                            deffer.resolve.apply(deffer, results);
                        }
                    };
                };
                rejectFunc = function(){
                    deffer.reject.apply(deffer, arguments);
                };
                list = origSlice.call(arguments, 0);
                list = list.map(function(item, index){
                    var isNormal = !item.promise, defferedItem = isNormal?$.Deffered():item;
                    defferedItem.done(resolveFunc(index)).fail(rejectFunc);
                    if(isNormal) {
                        defferedItem.resolve(item);
                    }
                    return defferedItem;
                });
                deffer = $.Deffered();
                return deffer.promise();
            }
        },

        Queue: function(){  // TODO: need dequeue and remove
            var queue = [], isRunning = false;
            function resolveFunc(){
                var deffered;
                if(!queue.length) {
                    isRunning = false;
                } else {
                    deffered = $.Deffered(queue.shift());
                    deffered.always(resolveFunc);
                }
                
            }
            return {
                add: function(func){
                    var deffered;
                    queue.push(func);
                    if(!isRunning){
                        isRunning = true;
                        deffered = $.Deffered(queue.shift());
                        deffered.always(resolveFunc);
                    }
                }
            };
        }
    });

})(Easy);
(function($){
    var rhtml = /^text\/html/,
        rjson = /^application\/json/,
        rxml = /^(application|text)\/xml/,
        rscript = /^(application|text)\/script/,

        jsonpCallback = 0;
    
    function empty(){}

    $.ajaxSettings = {
        type: "GET",
        async: true,
        before: empty,
        success: empty,
        error: empty,
        timeout: 0
    };

    function getDataType(mime) {
        return mime && (rhtml.test(mime) ? 'html' :
            rjson.test(mime) ? 'json' :
            rxml.test(mime) ? 'xml' :
            rscript.test(mime) ? 'script' : 'text');
    }

    function serialize(data) {
        return $.isObject(data)?$.param(data):data;
    }

    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }

    $.extend({
        ajax: function(url, options) {
            var headers = {},
                xhr = new XMLHttpRequest(),
                deffered = new $.Deffered(),
                timeout;
            xhr = deffered.promise(xhr);

            options = $.default(options || {}, $.ajaxSettings);
            if(options.dataType === 'jsonp')
                return this.jsonp(url, options);
            if(options.data) options.data = serialize(options.data);
            if(options.data && options.type.toUpperCase() === 'GET') {
                url = appendQuery(url, options.data);
                delete options.data;
            }

            xhr.onreadystatechange = function() {
                var dataType, error, result;
                if(xhr.readyState === 4){
                    clearTimeout(timeout);
                    if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        dataType = options.dataType || getDataType(xhr.getResponseHeader('content-type'));
                        result = xhr.responseText;
                        try {
                            switch(dataType) {
                            case 'json': 
                                result = /^\s*$/.test(xhr.responseText)? null : JSON.parse(xhr.responseText);
                                break;
                            case 'xml':
                                result = xhr.responseXML;
                                break;
                            case 'script':
                                (1, eval)(result);
                                break;
                            }
                        } catch(e) {
                            error = e;
                        }
                        if(error){
                            options.error && options.error(xhr, 'parser error', error);
                            deffered.reject(xhr, 'parser error', error);
                        } else {
                            options.success && options.success(result, xhr, options);
                            deffered.resolve(result, error, options);
                        }
                    } else {
                        options.error && options.error(xhr, xhr.statusText);
                        deffered.reject(xhr, xhr.statusText);
                    }
                }
            };
            if(options.contentType || (options.data && options.type.toUpperCase() !== 'GET')) {
                headers['Content-Type'] = options.contentType || 'application/x-www-form-urlencoded';
            }
            headers = $.extend(headers, options.headers || {});

            xhr.open(options.type.toUpperCase(), url, options.async);

            // must after open and before send 
            // https://developer.mozilla.org/en/xmlhttprequest
            for(var key in headers) xhr.setRequestHeader(key, headers[key]);
 
            if(options.before(xhr, options) === false){
                xhr.abort();
                return false;
            }

            if(options.timeout > 0){
                timeout = setTimeout(function(){
                    xhr.onreadystatechange = empty;
                    xhr.abort();
                    options.error && options.error(xhr, 'timeout');
                    deffered.reject(xhr, 'timeout');
                }, options.timeout);
            }
            xhr.send(options.data||null);
            return xhr;
        },

        get: function(url, data, success) {
            if(success === undefined){
                success = data;
                data = null;
            }
            return this.ajax(url, {
                success: success,
                data: data
            });
        },

        post: function(url, data, success) {
            if(success === undefined){
                success = data;
                data = null;
            }
            return this.ajax(url, {
                type: "POST",
                success: success,
                data: data
            });
        },

        jsonp: function(url, options) {
            var deffered = $.Deffered(),
                xhr = deffered.promise(),
                callback = 'callback' + (jsonpCallback++),
                script = document.createElement('script'),
                timeout;

            xhr.abort = function(){
                script.parentNode.removeChild(script);
                (callback in window) && (window[callback] = empty);
            };
            window[callback] = function(response){
                options.success && options.success(response);
                deffered.resolve(response);
                delete window[callback];
            };

            script.src = url.replace(/=\?/,'='+callback);
            if(options.timeout > 0) {
                timeout = setTimeout(function(){
                    xhr.abort();
                    options.error && options.error(xhr, 'timeout');
                    deffered.reject(xhr, 'timeout');
                },options.timeout);
            }
            if(options.error) {
                script.onerror = function() {
                    xhr.abort();
                    options.error(xhr, 'error');
                    deffered.reject(xhr, 'error');
                };
            }
            document.head.appendChild(script);
            return xhr;
        },

        param: function(obj) { //TODO non-traditional
            var params = [];
            for(var key in obj) {
                if($.isArray(obj[key])){
                    for(var i = 0; i < obj[key].length; i++) {
                        params.push(encodeURIComponent(key)+'='+encodeURIComponent(obj[key][i]));
                    }
                } else {
                    params.push(encodeURIComponent(key)+'='+encodeURIComponent(obj[key]));
                }
            }
            return params.join('&').replace('%20', '+');
        }
    });
})(Easy);