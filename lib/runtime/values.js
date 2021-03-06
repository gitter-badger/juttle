// Utilities for manipulating Juttle values.

var _ = require('underscore');
var Filter = require('./filter');
var JuttleMoment = require('../moment').JuttleMoment;
var errors = require('../errors');

var TYPE_DISPLAY_NAMES = {
    Null:     'null',
    Boolean:  'boolean',
    Number:   'number',
    String:   'string',
    RegExp:   'regular expression',
    Date:     'date',
    Duration: 'duration',
    Filter:   'filter expression',
    Array:    'array',
    Object:   'object'
};

var values = {

    // Returns a Juttle type represented by a JavaScript value. Throws an
    // exception if the JavaScript value doesn't represent any Juttle type.
    typeOf: function(value) {
        switch (typeof value) {
            case 'boolean':
                return 'Boolean';

            case 'number':
                return 'Number';

            case 'string':
                return 'String';

            case 'object':
                if (value === null) {
                    return 'Null';
                } else {
                    switch (Object.prototype.toString.call(value)) {
                        case '[object RegExp]':
                            return 'RegExp';

                        case '[object Array]':
                            return 'Array';

                        case '[object Object]':
                            switch (value.constructor) {
                                case JuttleMoment:
                                    if (value.moment) {
                                        return 'Date';
                                    }
                                    if (value.duration) {
                                        return 'Duration';
                                    }
                                    break;   // silence JSHint

                                case Filter:
                                    return 'Filter';

                                case Object:
                                    return 'Object';
                            }
                    }
                }
        }

        throw new Error('Invalid Juttle value: ' + value + '.');
    },

    valueOf: function(v) {
        return (values.isDate(v) || values.isDuration(v)) ? v.valueOf() : v;
    },

    // Returns a display name for a Juttle type name (for use in error messages,
    // etc.).
    typeDisplayName: function(name) {
        return TYPE_DISPLAY_NAMES[name];
    },

    // Shortcut functions for testing Juttle value types.
    //
    // Note these could have been implemented in terms of "typeOf", but they are
    // not in otder to make them as fast as possible (they'll be used often).

    isNull: function(value) {
        return value === null;
    },

    isBoolean: function(value) {
        return typeof value === 'boolean';
    },

    isNumber: function(value) {
        return typeof value === 'number';
    },

    isString: function(value) {
        return typeof value === 'string';
    },

    isRegExp: function(value) {
        return typeof value === 'object'
            && value !== null
            && Object.prototype.toString.call(value) === '[object RegExp]';
    },

    isDate: function(value) {
        return typeof value === 'object'
            && value !== null
            && Object.prototype.toString.call(value) === '[object Object]'
            && value.constructor === JuttleMoment
            && !!value.moment;
    },

    isDuration: function(value) {
        return typeof value === 'object'
            && value !== null
            && Object.prototype.toString.call(value) === '[object Object]'
            && value.constructor === JuttleMoment
            && !!value.duration;
    },

    isFilter: function(value) {
        return typeof value === 'object'
            && value !== null
            && Object.prototype.toString.call(value) === '[object Object]'
            && value.constructor === Filter;
    },

    isArray: function(value) {
        return typeof value === 'object'
            && value !== null
            && Object.prototype.toString.call(value) === '[object Array]';
    },

    isObject: function(value) {
        return typeof value === 'object'
            && value !== null
            && Object.prototype.toString.call(value) === '[object Object]'
            && value.constructor === Object;
    },

    ensureBoolean: function(value, message) {
        if (!this.isBoolean(value)) {
            message = message.replace(/<type>/g, this.typeDisplayName(this.typeOf(value)));
            throw errors.runtimeError('RT-TYPE-ERROR', { message: message });
        }

        return value;
    },

    ensureNumber: function(value, message) {
        if (!this.isNumber(value)) {
            message = message.replace(/<type>/g, this.typeDisplayName(this.typeOf(value)));
            throw errors.runtimeError('RT-TYPE-ERROR', { message: message });
        }

        return value;
    },

    ensureString: function(value, message) {
        if (!this.isString(value)) {
            message = message.replace(/<type>/g, this.typeDisplayName(this.typeOf(value)));
            throw errors.runtimeError('RT-TYPE-ERROR', { message: message });
        }

        return value;
    },

    buildObject: function(entries) {
        return _.object(entries);
    },

    // Determines whether two Juttle values are equal.
    equal: function(a, b) {
        var self = this;

        function equalArrays(a, b) {
            if (a.length !== b.length) {
                return false;
            }

            var length = a.length;
            var i;
            for (i = 0; i < length; i++) {
                if (!self.equal(a[i], b[i])) {
                    return false;
                }
            }

            return true;
        }

        function equalObjects(a, b) {
            var keysA = Object.keys(a);
            var keysB = Object.keys(b);

            keysA.sort();
            keysB.sort();

            if (keysA.length !== keysB.length) {
                return false;
            }

            var length = keysA.length;
            var i;
            var key;
            for (i = 0; i < length; i++) {
                if (keysA[i] !== keysB[i]) {
                    return false;
                }

                key = keysA[i];
                if (!self.equal(a[key], b[key])) {
                    return false;
                }
            }

            return true;
        }

        var typeA = this.typeOf(a);
        var typeB = this.typeOf(b);

        if (typeA !== typeB) {
            return false;
        }

        switch (typeA) {
            case 'Null':
            case 'Boolean':
            case 'Number':
            case 'String':
            case 'Filter':
                return a === b;

            case 'RegExp':
                return a.source === b.source
                    && a.global === b.global
                    && a.multiline === b.multiline
                    && a.ignoreCase === b.ignoreCase;

            case 'Date':
            case 'Duration':
                return JuttleMoment.eq(a, b);

            case 'Array':
                return equalArrays(a, b);

            case 'Object':
                return equalObjects(a, b);
        }
    },

    // Returns string representation of a Juttle value. This representation is
    // intended to be used in places where readability has precedence over
    // exactness (e.g. gadgets, charts).
    //
    // See also values.inspect.
    toString: function(value) {
        switch (values.typeOf(value)) {
            case 'Null':
                return '';

            case 'Boolean':
            case 'Number':
            case 'RegExp':
                return String(value);

            case 'String':
                return value;

            case 'Date':
            case 'Duration':
                return value.valueOf();

            case 'Filter':
                return value.text;

            case 'Array':
                return _.map(value, values.toString).join(', ');

            case 'Object':
                return _.map(value, function(v, k) { return k + ': ' + values.toString(v); }).join(', ');
        }
    },

    // Returns string representation of a Juttle value. This representation is
    // intended to be used in places where exactness has precedence over
    // readability (e.g. error messages, logs, dumps). In general, we aim to use
    // the same representation of values as in Juttle source code.
    //
    // See also values.toString.
    inspect: function(value) {
        switch (values.typeOf(value)) {
            case 'Null':
            case 'Boolean':
            case 'Number':
            case 'RegExp':
                return String(value);

            case 'String':
                return JSON.stringify(value);

            case 'Date':
            case 'Duration':
                return ':' + value.valueOf() + ':';

            case 'Filter':
                // Filters don't have source-level representation yet, so we
                // can't use it and we need to use a pseudo-syntax here. If
                // filters ever become representable in source, this code should
                // be changed to match that representation.
                return 'filter(' + value.text + ')';

            case 'Array':
                return '[' + _.map(value, values.inspect).join(', ') + ']';

            case 'Object':
                return '{ '
                    + _.map(value, function(v, k) { return k + ': ' + values.toString(v); }).join(', ')
                    + ' }';
        }
    }
};

module.exports = values;
