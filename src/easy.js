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

            rid = /^#([\w-]+)$/,
            rclass = /^\.([\w-]+)$/,
            rtag = /^([\w-]+)$/,
            rspace = /\s+/,
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
                if(typeof second.length === 'number'){
                    for(var l = second.length; j < l; j++){
                        first[i++] = second[j];
                    }
                } else if(second.nodeType){
                    first[i++] = second;
                }
                first.length = i;

                // make the results unique
                for(var m = cachedLength; m < i; m++){
                    for(var n = 0; n < cachedLength; n++){
                        if(first[m] === first[n]){
                            first.splice(m--, 1);
                            break;
                        }
                    }
                }
                return first;
            },

            _matches = function(target, selector) {
                if(!selector || (typeof selector !== 'string')) return target;
                selector = selector.trim();
                return target.nodeType === 1 ? target.webkitMatchesSelector(selector) ? target : null
                : origFilter.call(target, function(item) {
                    return item.nodeType === 1 && item.webkitMatchesSelector(selector.trim());
                });
            },

            _each = function(target, callback) {
                if(!target.length) return;
                for(var i = 0; i < target.length; i++){
                    if(callback.call(target[i], target[i], i, target) === false) return target;
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
                    this.selector = selector;
                    if(match = selector.match(rid)){
                        _merge(this, document.getElementById(match[1]));
                        return this;
                    } else {
                        context = context?(Easy.isEasy(context)?context:this.constructor(context)):this.constructor(document);
                        return context.find(selector);
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
                return chainable?this:result;
            },

            attr: function(name, value) {
                return this.access(function(element, k, v) {
                    if(v === undefined) {
                        return element.getAttribute(k);
                    } else {
                        element.setAttribute(k, v);
                        return element;
                    }
                },name, value);
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

            data: function(name, value) {            // TODO: optimize dataset
                return this.attr('data-' + _dasherize(name), value);
            },

            text: function(value) {
                return this.access(function(element, k, v){
                    if(value === undefined){
                        return element[k];
                    } else {
                        element[k] = v;
                        return element;
                    }
                }, 'textContent', value);
            },

            html: function(value) {
                return this.access(function(element, k, v){
                    if(value === undefined){
                        return element[k];
                    } else {
                        element[k] = v;
                        return element;
                    }
                }, 'innerHTML', value);
            },

            css: function(name, value) {  // TODO: name as object
                var css = '';
                if(value === undefined && typeof name === 'string'){
                    return this.length === 0 ? undefined: (this[0].style[_camelize(name)] || window.getComputedStyle(this[0]).getPropertyValue(name));
                } else {
                    return this.each(function(element){
                        if(value === '') {
                            element.style.removeProperty(_dasherize(name));
                        } else {
                            element.style.cssText += (';' + _dasherize(name) + ':' + value + ';');
                        }
                    });
                }
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
            ready: function(fn){      // TODO
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
                if(source.hasOwnProperty(key)){
                    target[key] = source[key];
                }
            }
            return target;
        };

        Easy.extend({
            isEasy: function(obj){
                return obj instanceof Easy;
            },

            isObject: _isObject,
            isFunction: _isFunction,
            isArray: Array.isArray || function(value) {
                return origToString.call(value) === '[object Array]';
            },

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

            template: function(template) {
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
})(window);