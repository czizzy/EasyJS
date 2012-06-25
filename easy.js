'use strict';
(function(window, undefined) {
    var Easy = (function(){
        var _$ = window.$,
            Easy = function(selector, context){
                return new Easy.fn.init(selector, context);
            },

            origSlice = Array.prototype.slice,
            origFilter = Array.prototype.filter,

            rid = /^#([\w-]+)$/,
            rclass = /^\.([\w-]+)$/,
            rtag = /^([\w-]+)$/,
            rspace = /\s+/,
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

            _isObject = function(value) {
                return value === Object(value);
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

            attr: function(name, value) {
                if(typeof name == 'string' && value === undefined) {
                    return (this.length && this[0].nodeType === 1)?this[0].getAttribute(name):undefined;
                } else {
                    this.each(function(element){
                        if(this.nodeType === 1) {
                            if(_isObject(name)){
                                for(var key in name) element.setAttribute(key, name[key]);
                            } else {
                                element.setAttribute(name, value);
                            }
                        }
                    });
                    return this;
                }
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
                
                if(value === undefined){
                    return (this.length && this[0].nodeType === 1) ? this[0][name] : undefined;
                } else {
                    this.each(function(element) {
                        element[name] = value;
                    });
                    return this;
                }
            },

            data: function(name, value) {            // TODO
                return this.attr('data-' + _dasherize(name), value);
            },

            text: function(value) {
                return value === undefined ?
                    this.length > 0 ? this[0].textContent : null
                : this.each(function(ele){ ele.textContent = value; });
            },

            html: function(value) {
                return value === undefined ?
                    this.length > 0 ? this[0].innerHTML : null
                : this.each(function(ele){ ele.innerHTML = value; });
            },

            // Miscellaneous
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
            for(var key in source){
                if(source.hasOwnProperty(key)){
                    target[key] = source[key];
                }
            }
            return target;
        };

        extend(Easy, {
            isEasy: function(obj){
                return obj instanceof Easy;
            },

            isObject: _isObject,

            merge: _merge,

            each: _each
        });

        return Easy;
    })();

    window.$ = Easy;
})(window);