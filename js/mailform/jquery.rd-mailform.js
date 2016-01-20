/**
 * RD Mail Form
 * @version 1.1.0
 * @author Evgeniy Gusarov (Stmechanus | Diversant)
 * @license The MIT License (MIT)
 * @todo Time Picker
 * @todo Date Picker
 * @todo Checboxes
 * @todo Radio Buttons
 * @todo TextArea
 * @todo InputMasks
 * @todo Input File
 */
;
(function ($, window, documen, undefined) {

    var msg, e;

    /**
     * Template for some information status messages.
     * @private
     */
    msg = {
        'MF000': 'Sent',
        'MF001': 'Recipients are not set!',
        'MF002': 'Form will not work locally!',
        'MF003': 'Please, define email field in your form!',
        'MF004': 'Please, define type of your form!',
        'MF254': 'Something went wrong with PHPMailer!',
        'MF255': 'Aw, snap! Something went wrong.'
    };

    /**
     * Creates a form.
     * @class The RD Mail Form.
     * @public
     * @param {HTMLElement|jQuery} element - The element to create the form for.
     * @param {Object} [options] - The options
     */
    function RDMailForm(element, options) {

        /**
         * Current options set by the caller including defaults.
         * @public
         */
        this.options = $.extend({}, RDMailForm.Defaults, options);

        /**
         * Plugin element.
         * @public
         */
        this.$element = $(element);

        /**
         * References to the running plugins of this Mail Form.
         * @protected
         */
        this._plugins = {};

        /**
         * All event handlers of Mail Form
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'mf.success mf.fail': $.proxy(this.update, this),
            'mf.process': $.proxy(this.process, this),
            'reset': $.proxy(this.reset, this)
        };

        /**
         * Creates the instances of all attached plugins
         * @protected
         */
        $.each(RDMailForm.Plugins, $.proxy(function (key, plugin) {
            this._plugins[key[0].toLowerCase() + key.slice(1)]
                = new plugin(this);
        }, this));

        this.initialize();
    };

    /**
     * Default options for the Form.
     * @public
     */
    RDMailForm.Defaults = {
        baseClass: 'rd-mailform'
    };

    /**
     * Contains all registered plugins.
     * @public
     */
    RDMailForm.Plugins = {};

    /**
     * Initializes the Mail Form.
     * @protected
     */
    RDMailForm.prototype.initialize = function () {
        this.$element.trigger('mf.initialize');

        this.$element
            .addClass(this.options.baseClass)
            .trigger('reset');

        this.create();
        this.watch();

        this.$element.trigger('mf.initialized');
    };

    /**
     * Creates additional DOM of Mail Form
     * @protected
     */
    RDMailForm.prototype.create = function () {
        var _self = this;

        if (_self.$element.attr("data-type")) {
            _self.$element
                .prepend($("<input/>", {
                    "type": "hidden",
                    "name": "form-type",
                    "value": _self.$element.attr("data-type")
                }));
        }
    };

    /**
     * Creates the events watchers of Mail Form
     * @protected
     */
    RDMailForm.prototype.watch = function () {
        var _self = this;
        _self.$element
            .ajaxForm({
                beforeSubmit: function (e) {
                    _self.$element.trigger('mf.process');
                },
                error: function (result) {
                    _self.$element.trigger('mf.fail', {code: result, message: msg[result]});
                },
                success: function (result) {
                    console.log(result);

                    if (result == 'MF000') {
                        _self.$element.trigger('mf.success', {code: result, message: msg[result]});
                    } else {
                        result = result.length == 5 ? result : 'MF255';
                        _self.$element.trigger('mf.fail', {code: result, message: msg[result]});
                    }
                }
            })
            .on(this._handlers);

    };

    /**
     * Changes form status to process
     * @protected
     */
    RDMailForm.prototype.process = function () {
        this.$element.addClass('process');
    };

    /**
     * Updates form status on sent
     * @protected
     */
    RDMailForm.prototype.update = function (e, data) {
        this.$element.removeClass('process');

        if (data.code === 'MF000') {
            this.$element.addClass('success');
        } else {
            this.$element.addClass('fail');
        }

        setTimeout($.proxy(function () {
            this.$element.trigger('reset');
        }, this), 3000);
    };

    /**
     * Resets form status
     * @protected
     */
    RDMailForm.prototype.reset = function () {
        this.$element.removeClass('success');
        this.$element.removeClass('fail');
        this.$element.trigger('mf.reset');
    };

    /**
     * The jQuery Plugin for the RD Mail Form
     * @public
     */
    $.fn.rdMailForm = function (options) {
        return this.each(function () {
            if (!$(this).data('rdMailForm')) {
                $(this).data('rdMailForm', new RDMailForm(this, options));
            }
        });
    };

    /**
     * The constructor for the jQuery Plugin
     * @public
     */
    $.fn.rdMailForm.Constructor = RDMailForm;
})(window.jQuery, window, document);

/**
 * Validator Plugin
 * @version 1.0.0
 * @author Evgeniy Gusarov (Stmechanus | Diversant)
 * @license The MIT License (MIT)
 */
;
(function ($, window, document, undefined) {

    /**
     * Creates the validator plugin.
     * @class The Validator Plugin
     * @param {RDMailForm} form - The Mail Form
     */
    var Validator = $.fn.rdMailForm.Constructor.Plugins.Validator = function (form) {
        /**
         * Reference to the core.
         * @protected
         * @type {RDMailForm}
         */
        this._core = form;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'mfValidator.validate': this.validate,
            'mfValidator.error': this.error,
            'mfValidator.valid': this.valid,
            'mfValidator.reset': this.reset,
            'mfValidator.click': $.noop()
        };

        // set default options
        this._core.options = $.extend({}, Validator.Defaults, this._core.options);

        this.initialize();
    };

    /**
     * Default options.
     * @public
     */
    Validator.Defaults = {
        validator: {
            'applyTo': '[data-constraints]',
            'class': 'mfValidation',
            'constraints': {
                '@LettersOnly': {
                    rule: '^([a-zA-Zа-яА-ЯіїёІЇЁєЄҐґ\\s]{0,})$',
                    message: 'Please use letters only!'
                },
                '@NumbersOnly': {
                    rule: '^-?\\d*\\.?\\d*$',
                    message: 'Please use numbers only!'
                },
                '@NotEmpty': {
                    rule: '([^\\s])',
                    message: 'Field should not be empty!'
                },
                '@Email': {
                    rule: '^(([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([a-z]{2,6}(?:\\.[a-z]{2})?)){0,}$',
                    message: 'Enter valid e-mail address!'
                },
                '@Phone': {
                    rule: '^(\\+?\\d{0,3}\\s*\\(?\\d{1,3}\\)?\\s*\\d{3}\\s*\\d{4}){0,}$',
                    message: 'Enter valid phone number!'
                },
                '@Date': {
                    rule: function (o) {
                        if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                            return new RegExp('^($)|(((0[13578]|10|12)(-|\\/)((0[1-9])|([12])([0-9])|(3[01]?))(-|\\/)((19)([2-9])(\\d{1})|(20)([01])(\\d{1})|([8901])(\\d{1}))|(0?[2469]|11)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[0]?))(-|\/)((19)([2-9])(\\d{1})|(20)([01])(\\d{1})|([8901])(\\d{1}))))$').test(o.val())
                        } else {
                            return true;
                        }
                    },
                    message: 'Use MM/DD/YYYY format!'
                },
                '@SelectRequired': {
                    rule: function (o) {
                        return o.find("option:selected").index() !== 0;
                    },
                    message: 'Please choose an option!'
                }
            }
        }
    };

    /**
     * Initializes validator for attached elements.
     * @protected
     */
    Validator.prototype.initialize = function () {
        this._core.$element.trigger('mfValidator.initialize');

        this.create();
        this.watch();

        this._core.$element.trigger('mfValidator.initialized');
    };

    /**
     * Creates a necessary additional DOM for validating.
     * @protected
     */
    Validator.prototype.create = function () {
        var self = this;

        this._core.$element
            .find(this._core.options.validator.applyTo)
            .each(function () {
                $(this)
                    .parent()
                    .append($('<span/>', {
                        'class': self._core.options.validator.class
                    }))
            })
    };

    /**
     * Creates all attached event handlers of validator.
     * @protected
     */
    Validator.prototype.watch = function () {
        var self = this;
        this._core.$element
            .find(this._core.options.validator.applyTo)
            .on('keyup', function (e) {
                if ($(this).is('input') || $(this).is('textarea')) {
                    $(this).parent().trigger('mfValidator.validate', {
                        options: self._core.options.validator
                    });
                }
            })
            .on('change', function (e) {
                $(this).parent().trigger('mfValidator.validate', {
                    options: self._core.options.validator
                });
            })
            .parent()
            .on(this._handlers)
            .find('.' + this._core.options.validator.class)
            .on('click', function (e) {
                $(this)
                    .removeClass("error").removeClass("show").addClass("hide")
                    .parent()
                    .trigger('mfValidator.click')
                    .find(self._core.options.validator.applyTo)
                    .focus();
            });

        this._core.$element
            .on('submit', $.proxy(function (e) {
                this._core.$element.find(this._core.options.validator.applyTo).each(function () {
                    $(this).parent().trigger('mfValidator.validate', {
                        options: self._core.options.validator
                    });
                });
                if (this._core.$element.find('.error').length) {
                    e.preventDefault();
                    return false;
                }
            }, this))
            .on('mf.reset', $.proxy(function (e) {
                this._core.$element.find(this._core.options.validator.applyTo).each(function () {
                    $(this).parent().trigger('mfValidator.reset', {options: self._core.options.validator});
                });
            }, this));
    };

    /**
     * Validates all attached elements.
     * @protected
     */
    Validator.prototype.validate = function (e, data) {
        var errors = [],
            $this = $(this),
            target = $this.find(data.options.applyTo),
            ruleset = target.data('constraints').match(/\@\w+/g),
            value = target.val();

        for (var i in ruleset) {
            if (data.options.constraints[ruleset[i]]) {
                switch (typeof(data.options.constraints[ruleset[i]].rule)) {
                    case "function":
                        if (!data.options.constraints[ruleset[i]].rule(target)) {
                            errors.push(data.options.constraints[ruleset[i]].message);
                        }
                        break;
                    default :
                        if (!new RegExp(data.options.constraints[ruleset[i]].rule).test(value)) {
                            errors.push(data.options.constraints[ruleset[i]].message);
                        }
                }
            }
        }

        if (errors.length) {
            $(this).trigger('mfValidator.error', {options: data.options, errors: errors});
        } else {
            $(this).trigger('mfValidator.valid', {options: data.options});
        }
    };

    /**
     * Notifies when element is not valid.
     * @protected
     */
    Validator.prototype.error = function (e, data) {
        $(this).find('.' + data.options.class).removeClass('valid').removeClass('hide').addClass('show').addClass('error').text(data.errors);
    };

    /**
     * Notifies when element is valid.
     * @protected
     */
    Validator.prototype.valid = function (e, data) {
        var o = $(this).find('.' + data.options.class);
        if (o.hasClass('error')) {
            o.removeClass("error").addClass("hide");
        }
        o.find('.' + data.options.class).removeClass('show').addClass('valid').text(data.errors);
    };

    /**
     * Resets the validation status
     * @protected
     */
    Validator.prototype.reset = function (e, data) {
        var o = $(this).find('.' + data.options.class);
        if (o.hasClass('error')) {
            o.removeClass("error").addClass("hide");
        }
        $(this).find('.' + data.options.class).removeClass('show');
    };


})(window.jQuery, window, document);

/**
 * Input Plugin
 * @version 1.0.0
 * @author Evgeniy Gusarov (Stmechanus | Diversant)
 * @license The MIT License (MIT)
 */
;
(function ($, window, document, undefined) {


    /**
     * Creates the input plugin.
     * @class The Input Plugin
     * @param {RDMailForm} form - The Mail Form
     */
    var Input = $.fn.rdMailForm.Constructor.Plugins.Input = function (form) {
        /**
         * Reference to the core.
         * @protected
         * @type {RDMailForm}
         */
        this._core = form;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'mfInput.focus': this.focus,
            'mfInput.blur': this.blur,
            'mfInput.type': this.type,
            'mfInput.delete': this.delete,
            'mfInput.fill': this.fill,
            'mfInput.empty': this.empty,
            'mfInput.idle': this.idle,
            'mfInput.reset': this.reset,
            'click': function (e) {
                e.preventDefault();
                return false;
            }
        };

        // set default options
        this._core.options = $.extend({}, Input.Defaults, this._core.options);

        this.initialize();
    };

    /**
     * Default options.
     * @public
     */
    Input.Defaults = {
        input: {
            'applyto': 'input[type="text"], input[type="date"], textarea',
            'class': 'mfInput'
        }
    };

    /**
     * Initializes all inputs in the Mail Form.
     * @protected
     */
    Input.prototype.initialize = function () {
        this._core.$element.trigger('mfInput.initialize');

        this.create();
        this.watch();

        this._core.$element.trigger('mfInput.initialized');
    };

    /**
     * Creates a necessary additional DOM of input.
     * @protected
     */
    Input.prototype.create = function () {
        this._core.$element
            .find(this._core.options.input.applyto)
            .parent()
            .addClass(this._core.options.input.class);
    };

    /**
     * Creates all attached event handlers of input.
     * @protected
     */
    Input.prototype.watch = function () {
        this._core.$element
            .find(this._core.options.input.applyto)
            .on('focus', function () {
                $(this).parent().trigger('mfInput.focus');
            })
            .on('blur', function () {
                $(this).parent().trigger('mfInput.blur');
                if ($(this).val() === '') {
                    $(this).parent().trigger('mfInput.void');
                }
            })
            .on('keydown', this, function (e) {
                if (e.data.ignore(e)) {
                    return;
                }
                if (e.keyCode === 8 || e.keyCode === 46) {
                    $(this).parent().trigger('mfInput.delete');
                }
                if (e.keyCode === 32 || e.keyCode > 46) {
                    $(this).parent().trigger('mfInput.type');
                }
            })
            .on('keyup', this, function (e) {
                var _this = $(this);
                if (e.data.ignore(e)) {
                    return;
                }
                if (_this.val() === '') {
                    _this.parent().trigger('mfInput.empty');
                }
                if (e.keyCode === 8 || e.keyCode === 46) {
                    if (self.timer) {
                        clearTimeout(self.timer);
                    }
                    self.timer = setTimeout(function () {
                        _this.parent().trigger('mfInput.idle');
                    }, 1000);
                }
                else {
                    _this.parent().trigger('mfInput.fill');
                    _this.parent().trigger('mfInput.type');
                    if (self.timer) {
                        clearTimeout(self.timer);
                    }
                    self.timer = setTimeout(function () {
                        _this.parent().trigger('mfInput.idle');
                    }, 1000);
                }
            })
            .on('keypress', this, function (e) {
                if (e.data.ignore(e.keyCode)) {
                    return;
                }
                var _this = $(this);
                if (self.timer) {
                    clearTimeout(self.timer);
                }
                self.timer = setTimeout(function () {
                    _this.parent().trigger('mfInput.idle');
                }, 1000);
            })
            .parent()
            .on(this._handlers);

        this._core.$element.on('mf.reset', this, function (e) {
            $(this).find('.' + e.data._core.options.input.class).each(function () {
                $(this).trigger('mfInput.reset');
            });
        })
    };

    /**
     * Notify when input is in focus.
     * @protected
     */
    Input.prototype.focus = function () {
        $(this).addClass('focused');
    };

    /**
     * Notify when input was blured.
     * @protected
     */
    Input.prototype.blur = function () {
        $(this).removeClass('focused');
    };

    /**
     * Notify when writing in input.
     * @protected
     */
    Input.prototype.type = function () {
        $(this).removeClass('deleting');
        $(this).addClass('typing');
    };

    /**
     * Notify when deleting in input.
     * @protected
     */
    Input.prototype.delete = function () {
        $(this).removeClass('typing');
        $(this).addClass('deleting');
    };

    /**
     * Notify when input is not empty.
     * @protected
     */
    Input.prototype.fill = function () {
        $(this).addClass('filled');
    };

    /**
     * Notify when input is empty.
     * @protected
     */
    Input.prototype.empty = function () {
        $(this).removeClass('filled');
    };

    /**
     * Notify when input is idling.
     * @protected
     */
    Input.prototype.idle = function () {
        $(this).removeClass('typing');
        $(this).removeClass('deleting');
    };

    /**
     * Resets the input status.
     * @protected
     */
    Input.prototype.reset = function () {
        $(this).removeClass('focused');
        $(this).removeClass('deleting');
        $(this).removeClass('filled');
        $(this).removeClass('typing');
        $(this).removeClass('error');
    };

    /**
     * Checks the keycode for deprecated value.
     * @protected
     */
    Input.prototype.ignore = function (e) {
        if (e.keyCode === 144 || e.keyCode === 20 || e.keyCode === 17 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39
            || e.keyCode === 40 || e.keyCode === 112 || e.keyCode === 113 || e.keyCode === 114 || e.keyCode === 115 || e.keyCode === 116
            || e.keyCode === 117 || e.keyCode === 118 || e.keyCode === 119 || e.keyCode === 120 || e.keyCode === 121 || e.keyCode === 122
            || e.keyCode === 123 || e.keyCode === 9 || e.ctrlKey) {
            return true;
        }
        return false;
    }

})(window.jQuery, window, document);

/**
 * Select Plugin
 * @version 1.0.0
 * @author Evgeniy Gusarov (Stmechanus | Diversant)
 * @license The MIT License (MIT)
 */
;
(function ($, window, document, undefined) {


    /**
     * Creates the select plugin.
     * @class The Select Plugin
     * @param {RDMailForm} form - The Mail Form
     */
    var Select = $.fn.rdMailForm.Constructor.Plugins.Select = function (form) {
        /**
         * Reference to the core.
         * @protected
         * @type {RDMailForm}
         */
        this._core = form;

        /**
         * Element event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            "mfSelect.close": this.close,
            "mfSelect.open": this.open,
            "mfSelect.select": this.select,
            "click": function (e) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // set default options
        this._core.options = $.extend({}, Select.Defaults, this._core.options);

        this.initialize();
    };

    /**
     * Default options.
     * @public
     */
    Select.Defaults = {
        select: {
            'applyTo': 'select',
            'class': 'mfSelect'
        }
    };

    /**
     * Initializes all selects in the Mail Form.
     * @protected
     */
    Select.prototype.initialize = function () {
        this._core.$element.trigger('mfSelect.initialize');

        this.create();
        this.watch();

        this._core.$element.trigger('mfSelect.initialized');
    };

    /**
     * Creates a necessary pseudo DOM of select.
     * @protected
     */
    Select.prototype.create = function () {
        this._core.$element
            .find(this._core.options.select.applyTo)
            .each(function () {
                var $this = $(this);

                $this
                    .css({
                        "position": "absolute",
                        "left": "50%",
                        "width": "0",
                        "height": "0",
                        "overflow": "hidden",
                        "opacity": "0"
                    })
                    .parent()
                    .append($('<div/>', {
                        'class': 'value',
                        'text': $this.find('option:selected').text()
                    }))
                    .append($('<ul/>', {'class': 'dropdown'}))
                    .end()
                    .find('option').each(function (i) {
                        if (i == 0) {
                            return;
                        }

                        var o = $(this);
                        o.parent().parent().find('.dropdown')
                            .append($('<li/>', {
                                'class': 'option',
                                'text': o.text()
                            }).addClass(o.is(':selected') ? 'selected' : ''));
                    })

            })
            .parent()
            .addClass(this._core.options.select.class);
    };

    /**
     * Creates all attached event handlers of select.
     * @protected
     */
    Select.prototype.watch = function () {
        var self = this;
        this._core.$element
            .find(self._core.options.select.applyTo)
            .on('focus', this.focus)
            .on('blur', function (e) {
                $(this).parent()
                    .trigger('mfSelect.close')
                    .removeClass('focus')
            })
            .on('keydown', function (e) {
                if (e.keyCode == 38) {
                    $(this)
                        .val($(this).find('option').eq($(this).find('option:selected').index() > 0 ? $(this).find('option:selected').index() - 1 : 0).text())
                        .trigger('change');
                }

                if (e.keyCode == 40) {
                    $(this)
                        .val($(this).find('option').eq($(this).find('option:selected').index() < $(this).find('option').length - 1 ? $(this).find('option:selected').index() + 1 : $(this).find('option').length - 1).text())
                        .trigger('change');
                }

                if (e.keyCode == 13) {
                    if ($(this).parent().hasClass('show')) {
                        $(this).parent().trigger('mfSelect.close');
                    } else {
                        $(this).parent().trigger('mfSelect.open');
                    }
                }

                if (e.keyCode == 32 || e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 13) {
                    e.preventDefault();
                }
            })
            .on('change', function (e) {
                $(this).parent()
                    .trigger('mfSelect.open')
                    .find('.value').text($(this).val());

                var i = $(this).find('option:selected').index(),
                    $option = $(this).parent().find('.option').removeClass('selected');

                if (i > 0) {
                    $option.eq(i - 1).addClass('selected');
                }
            })
            .parent()
            .on(this._handlers)
            .find('.value')
            .on('click', function (e) {
                var $value = $(this),
                    $select = $value.parent().find('select'),
                    option = $select.find('option').eq(0).text();

                $value.text(option);

                $select
                    .trigger('focus')
                    .off('focus', self.focus);

                if (!$(this).parent().hasClass('show')) {
                    $select.on('focus', self.focus);
                    var value = $(this).parent().find('.option.selected');
                    if (value.length) {
                        $value.text(value.text());
                    }
                }
            })
            .parent()
            .find('.option')
            .on('click', function () {
                $(this).parent().find('.option').removeClass('selected');
                $(this).addClass('selected');
                $(this).parent().parent()
                    .find('select')
                    .focus()
                    .on('focus', self.focus);
                $(this).parent().parent()
                    .trigger('mfSelect.select', {
                        options: self._core.options.select,
                        value: $(this).text()
                    })

            })
            .parents('body')
            .on('click', function (e) {
                var o = self._core.$element.find('.' + self._core.options.select.class);

                if (o.length) {
                    if (!o.is(e.target) && o.has(e.target).length === 0) {
                        o.find('select')
                            .each(function () {
                                var value = $(this).parent().find('.option.selected');
                                if (value.length) {
                                    $(this).parent().find('.value').text(value.text());
                                }
                            })
                            .on('focus', self.focus);
                    }
                }
            });

        this._core.$element
            .on('mf.reset', function () {
                $(this)
                    .find(self._core.options.select.applyTo).each(function () {
                        $(this).parent()
                            .find('.value').text($(this).prop('selectedIndex', 0).val());
                        $(this).parent().find('.option').removeClass('selected');
                    });
            });
    };

    Select.prototype.focus = function () {
        $(this).parent().trigger('mfSelect.open').addClass('focus');
    };

    Select.prototype.close = function () {
        if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
            if ($(this).hasClass("show")) {
                $(this).removeClass("show");
            }
        }
    };

    Select.prototype.open = function () {
        if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
            if (!$(this).hasClass("show")) {
                $(this).addClass("show");
            }
        }
    };

    Select.prototype.select = function (e, data) {
        $(this)
            .find(data.options.applyTo).val(data.value)
            .trigger('change');

        $(this)
            .trigger('mfSelect.close');

    };


})(window.jQuery, window, document);

/**
 * DatePicker Plugin
 * @version 1.0.0
 * @author Evgeniy Gusarov (Stmechanus | Diversant)
 * @license The MIT License (MIT)
 */
;
(function ($, window, document, undefined) {

    /**
     * Creates Icon plugin.
     * @class The Icon Plugin
     * @param {RDMailForm} form - The Mail Form
     */
    var DatePicker = $.fn.rdMailForm.Constructor.Plugins.DatePicker = function (form) {
        /**
         * Reference to the core.
         * @protected
         * @type {RDMailForm}
         */
        this._core = form;

        this._handlers = {
            'mfDatePicker.close': this.close,
            'mfDatePicker.open': this.open,
            'mfDatePicker.next': this.next,
            'mfDatePicker.prev': this.prev,
            'mfDatePicker.update': this.update,
            'mfDatePicker.refresh': this.refresh,
            'mfDatePicker.pick': this.pick
        };

        // set default options
        this._core.options = $.extend({}, DatePicker.Defaults, this._core.options);

        this.initialize();
    };

    /**
     * Default options.
     * @public
     */
    DatePicker.Defaults = {
        "datepicker": {
            "applyTo": 'input[type="date"]',
            "class": 'mfDatePicker',
            "days": ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            "months": ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            "format": 'MM-DD-YYYY',
            "prevMonth": '',
            "nextMonth": ''
        }
    };

    /**
     * Initializes the Datepicker plugin.
     * @protected
     */
    DatePicker.prototype.initialize = function () {
        this._core.$element.trigger('mfDatePicker.initialize');

        this.create();
        this.watch();

        this._core.$element.trigger('mfDatePicker.initialized');
    };

    /**
     * Creates a necessary DOM for datepicker plugin.
     * @protected
     */
    DatePicker.prototype.create = function () {
        var self = this;
        self._core.$element
            .find(self._core.options.datepicker.applyTo)
            .each(function () {
                $(this)
                    .attr({
                        'type': !navigator.userAgent.match(/(iPod|iPhone|iPad)/) ? 'text' : 'date',
                        'data-type': 'date'
                    })
                    .after($('<div/>', {
                        'class': self._core.options.datepicker.class
                    })
                        .data('date', new Date())
                );
            })
            .parent()
            .find('.' + self._core.options.datepicker.class)
            .each(function () {
                $.proxy(self.update, this, {}, self._core.options.datepicker).call();
                $.proxy(self.refresh, this, {}, self._core.options.datepicker).call();
            });
    };

    /**
     * Creates all attached event handlers of datepicker plugin.
     * @protected
     */
    DatePicker.prototype.watch = function () {
        var self = this;

        self._core.$element
            .find('.' + self._core.options.datepicker.class)
            .on('click', '.' + self._core.options.datepicker.class + '_next', function () {
                var $this = $(this).parents('.' + self._core.options.datepicker.class);

                $this.trigger('mfDatePicker.next');
                $this.trigger('mfDatePicker.update', self._core.options.datepicker);
                $this.trigger('mfDatePicker.refresh', self._core.options.datepicker);
            })
            .on('click', '.' + self._core.options.datepicker.class + '_prev', function () {
                var $this = $(this).parents('.' + self._core.options.datepicker.class);

                $this.trigger('mfDatePicker.prev');
                $this.trigger('mfDatePicker.update', self._core.options.datepicker);
                $this.trigger('mfDatePicker.refresh', self._core.options.datepicker);
            })
            .on('click', '.dp-day', function () {
                var $this = $(this).parents('.' + self._core.options.datepicker.class);

                $this.trigger('mfDatePicker.pick', {opt: self._core.options.datepicker, day: $(this)});
                $this.parent()
                    .find('input')
                    .on('blur', self.blur)
                    .trigger('blur')
                    .trigger('keyup');

            })
            .on('click', function () {

            })
            .on(this._handlers)
            .parent()
            .on('click', function (e) {
                e.preventDefault();
                return false;
            })
            .find('input')
            .on('focus', function () {
                $(this).parent().find('.' + self._core.options.datepicker.class)
                    .trigger('mfDatePicker.open');
            })
            .on('blur', this.blur)
            .on('keydown', function (e) {
                if (e.keyCode == 9 || (e.shiftKey && e.keyCode == 9)) {
                    $(this)
                        .on('blur', self.blur);
                }
            })
            .parents('body')
            .on('mousedown', function (e) {
                var o = self._core.$element.find('.' + self._core.options.datepicker.class).parent();

                if (o.length) {
                    if (!o.is(e.target) && o.has(e.target).length === 0) {
                        o.find('input')
                            .on('blur', self.blur)
                            .trigger('blur');
                    } else {
                        o.find('input')
                            .off('blur', self.blur)
                    }
                }
            });

        self._core.$element
            .on('mf.reset', function () {
                $(this)
                    .find('.' + self._core.options.datepicker.class).each(function () {
                        $(this).trigger("mfDatePicker.close")
                    });
            });


    };

    /**
     * Blur the datepickers input
     * @protected
     */
    DatePicker.prototype.blur = function () {
        $(this).parent().find('.mfDatePicker')
            .trigger('mfDatePicker.close');
    };


    /**
     * Closes the datepicker
     * @protected
     */
    DatePicker.prototype.close = function () {
        if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
            if ($(this).hasClass("open")) {
                $(this).removeClass("open");
            }
        }
    };

    /**
     * Opens the datepicker
     * @protected
     */
    DatePicker.prototype.open = function () {
        if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
            if (!$(this).hasClass("open")) {
                $(this).addClass("open");
            }
        }
    };

    /**
     * Goto next month of picker
     * @protected
     */
    DatePicker.prototype.next = function (e) {
        var $this = $(this),
            date = $this.data('date');

        if (date.getMonth() == 11) {
            date = new Date(date.getFullYear() + 1, 0, 1);
        } else {
            date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        }

        $this.data('date', date);
    };

    /**
     * Goto previous month of picker
     * @protected
     */
    DatePicker.prototype.prev = function (e) {
        var $this = $(this),
            date = $this.data('date');

        if (date.getMonth() == 0) {
            date = new Date(date.getFullYear() - 1, 11, 1);
        } else {
            date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        }

        $this.data('date', date);
    };

    /**
     * Goto target date
     * @protected
     */
    DatePicker.prototype.pick = function (e, o) {
        var $this = $(this);

        $this.data('pickedDate', o.day.addClass("dp-selected").data('date'));
        $this
            .find('.dp-day')
            .not(o.day)
            .removeClass('dp-selected');
        $this
            .parent()
            .find('input')
            .val(
            ($this.data('pickedDate').getMonth() + 1 < 10 ? "0" + ($this.data('pickedDate').getMonth() + 1) : $this.data('pickedDate').getMonth() + 1 ) + '/' +
            ($this.data('pickedDate').getDate() < 10 ? "0" + ($this.data('pickedDate').getDate()) : $this.data('pickedDate').getDate()) + '/' +
            $this.data('pickedDate').getFullYear()
        )

    };

    /**
     * Refreshes the DOM of picker according to current picked date.
     * @protected
     */
    DatePicker.prototype.update = function (e, opt) {
        var $this = $(this),
            $panel = $('<div/>', {"class": opt.class + '_panel'});

        $panel.append($('<a/>', {
            'class': opt.class + '_prev',
            'text': opt.prevMonth
        }));
        $panel.append($('<a/>', {
            'class': opt.class + '_next',
            'text': opt.nextMonth
        }));
        $panel.append($('<div/>', {
            'class': opt.class + '_title',
            'text': opt.months[$this.data("date").getMonth()] + " " + $this.data("date").getFullYear()
        }));


        var $target = $this.find('.' + opt.class + '_panel');
        if ($target.length) {
            $target.replaceWith($panel);
        } else {
            $panel.appendTo($this);
        }
    };

    /**
     * Refreshes the DOM of picker according to current picked date.
     * @protected
     */
    DatePicker.prototype.refresh = function (e, opt) {
        var $this = $(this),
            $calendar = $('<table/>');

        var $week = $('<tr/>');
        for (var i = 0; i < opt.days.length; i++) {
            $week.append($('<th/>', {
                'class': 'dp-weekday',
                'text': opt.days[i]
            }));
        }
        $calendar.append($week);

        var date = $this.data("date"),
            pickedDate = $this.data("pickedDate"),
            monthLength = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
            prevMonthLength = new Date(date.getFullYear(), date.getMonth(), 0).getDate(),
            firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
            counter = 1;

        for (var i = 0; i < 7; i++) {
            $week = $('<tr/>');
            for (var j = 0; j < 7; j++) {
                var day = 7 * i + j + 1,
                    currentDate,
                    currentDay = $('<td/>', {'class': 'dp-day'}),
                    today = new Date();

                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                today.setMilliseconds(0);

                // If Month had ended and new week started
                if (j == 0 && day > monthLength + firstDay) {
                    break;
                }

                // If the day belongs to previous month
                if (day - firstDay < 1) {
                    currentDay.text(prevMonthLength + (day - firstDay)).addClass("dp-offset");
                    currentDate = new Date(date.getFullYear(), date.getMonth() - 1, prevMonthLength + (day - firstDay));
                }
                // If the day belongs to current month
                else if (day <= monthLength + firstDay) {
                    currentDay.text(day - firstDay);
                    currentDate = new Date(date.getFullYear(), date.getMonth(), day - firstDay);
                }
                // If the day belongs to next month
                else {
                    currentDay.text(counter).addClass("dp-offset");
                    currentDate = new Date(date.getFullYear(), date.getMonth() + 1, counter++);
                }

                // If current day is today
                if (currentDate.valueOf() == today.valueOf()) {
                    currentDay.addClass('dp-today');
                }

                // If current day was selected
                if (pickedDate) {
                    if (currentDate.valueOf() == pickedDate.valueOf()) {
                        currentDay.addClass('dp-selected');
                    }
                }

                $week.append(currentDay.data('date', currentDate));
            }

            if ($week.html() != '') {
                $calendar.append($week);
            }
        }

        var $target = $this.find('table');
        if ($target.length) {
            $target.replaceWith($calendar);
        } else {
            $calendar.appendTo($this);
        }
    };


})(window.jQuery, window, document);

/**
 * Icon Plugin
 * @version 1.0.0
 * @author Evgeniy Gusarov (Stmechanus | Diversant)
 * @license The MIT License (MIT)
 */
;
(function ($, window, document, undefined) {

    /**
     * Creates Icon plugin.
     * @class The Icon Plugin
     * @param {RDMailForm} form - The Mail Form
     */
    var Icon = $.fn.rdMailForm.Constructor.Plugins.Icon = function (form) {
        /**
         * Reference to the core.
         * @protected
         * @type {RDMailForm}
         */
        this._core = form;

        // set default options
        this._core.options = $.extend({}, Icon.Defaults, this._core.options);

        this.initialize();
    };

    /**
     * Element event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
        "mfIcon.change": this.change
    };

    /**
     * Default options.
     * @public
     */
    Icon.Defaults = {
        "icon": {
            "applyTo": "[data-add-icon]",
            "class": "mfIcon",
            "states": {
                '.mfInput': {
                    'mfIcon.default': ['mfInput.blur', 'mfInput.idle', 'mfInput.reset'],
                    'mfIcon.state-1': ['mfInput.type'],
                    'mfIcon.state-2': ['mfInput.delete']
                }
            }
        }
    };

    /**
     * Initializes the Icon plugin.
     * @protected
     */
    Icon.prototype.initialize = function () {
        this._core.$element.trigger('mfIcon.initialize');

        this.create();
        this.watch();

        this._core.$element.trigger('mfIcon.initialized');
    };

    /**
     * Creates a necessary DOM for Icon plugin.
     * @protected
     */
    Icon.prototype.create = function () {
        var self = this;
        self._core.$element
            .find(self._core.options.icon.applyTo)
            .each(function () {
                var o = $(this);
                o.append(
                    $('<span/>', {
                        'class': self._core.options.icon.class
                    }).append($("<span/>"))
                );
            });
    };

    /**
     * Creates all attached event handlers of Icon plugin.
     * @protected
     */
    Icon.prototype.watch = function () {
        var self = this;

        self._core.$element
            .find('.' + self._core.options.icon.class)
            .on(self._handlers);

        for (var component in self._core.options.icon.states) {
            var $target = self._core.$element.find(component);

            for (var state in self._core.options.icon.states[component]) {
                for (var event in self._core.options.icon.states[component][state]) {
                    $target.on(self._core.options.icon.states[component][state][event], {state: state}, function (e) {
                        $(this).find('.' + self._core.options.icon.class)
                            .attr('class', e.data.state.replace('.', ' '));
                    })
                }
            }
        }
    };
})(window.jQuery, window, document);

/**
 * PlaceHolder Plugin
 * @version 1.0.0
 * @author Evgeniy Gusarov (Stmechanus | Diversant)
 * @license The MIT License (MIT)
 */
;
(function ($, window, document, undefined) {

    /**
     * Creates Placeholder plugin.
     * @class The Placeholder Plugin
     * @param {RDMailForm} form - The Mail Form
     */
    var Placeholder = $.fn.rdMailForm.Constructor.Plugins.Placeholder = function (form) {
        /**
         * Reference to the core.
         * @protected
         * @type {RDMailForm}
         */
        this._core = form;

        // set default options
        this._core.options = $.extend({}, Placeholder.Defaults, this._core.options);

        this.initialize();
    };

    /**
     * Element event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
        "mfIcon.change": this.change,
    };

    /**
     * Default options.
     * @public
     */
    Placeholder.Defaults = {
        "placeholder": {
            "applyTo": "[data-add-placeholder]",
            "class": "mfPlaceHolder",
            "states": {
                '.mfInput': {
                    'mfPlaceHolder.default': ['mfInput.void', 'mfInput.reset'],
                    'mfPlaceHolder.state-1': ['mfInput.fill', 'mfInput.focus']
                }
            }
        }
    };

    /**
     * Initializes the Placeholder plugin.
     * @protected
     */
    Placeholder.prototype.initialize = function () {
        this._core.$element.trigger('mfPlaceHolder.initialize');

        this.create();
        this.watch();

        this._core.$element.trigger('mfPlaceHolder.initialized');
    };

    /**
     * Creates a necessary DOM for Placeholder plugin.
     * @protected
     */
    Placeholder.prototype.create = function () {
        var self = this;
        self._core.$element
            .find(self._core.options.placeholder.applyTo)
            .each(function () {
                var o = $(this), inp, lab;

                if (o.find('[placeholder]').length) {
                    o.append(
                        $('<span/>', {
                            'class': self._core.options.placeholder.class,
                            'text': o.find('[placeholder]').attr('placeholder') ? o.find('[placeholder]').attr('placeholder') : o.find('[data-placeholder]').attr('data-placeholder')
                        }))
                        .find('[placeholder]').removeAttr('placeholder').removeAttr('data-placeholder');
                }
                else if ((inp = o.find('input, textarea')).length) {
                    if (inp.attr("id")){
                        if ((lab = o.find('label[for="' + inp.attr("id") + '"]')).length){
                            lab.addClass(self._core.options.placeholder.class)
                        }
                    }
                }
            });
    };

    /**
     * Creates all attached event handlers of Placeholder plugin.
     * @protected
     */
    Placeholder.prototype.watch = function () {
        var self = this;

        self._core.$element
            .find('.' + self._core.options.placeholder.class)
            .on('click', function (e) {
                $(this).parent().find('input, textarea').trigger('focus');
            })
            .on(self._handlers);

        for (var component in self._core.options.icon.states) {
            var $target = self._core.$element.find(component);

            for (var state in self._core.options.placeholder.states[component]) {
                for (var event in self._core.options.placeholder.states[component][state]) {
                    $target.on(self._core.options.placeholder.states[component][state][event], {state: state}, function (e) {
                        $(this).find('.' + self._core.options.placeholder.class)
                            .attr('class', e.data.state.replace('.', ' '));
                    })
                }
            }
        }
    };
})(window.jQuery, window, document);

/**
 * Progress Plugin
 * @version 1.0.0
 * @author Evgeniy Gusarov (Stmechanus | Diversant)
 * @license The MIT License (MIT)
 */
;
(function ($, window, document, undefined) {

    /**
     * Creates Progress plugin.
     * @class The Progress Plugin
     * @param {RDMailForm} form - The Mail Form
     */
    var Progress = $.fn.rdMailForm.Constructor.Plugins.Progress = function (form) {
        /**
         * Reference to the core.
         * @protected
         * @type {RDMailForm}
         */
        this._core = form;

        // set default options
        this._core.options = $.extend({}, Progress.Defaults, this._core.options);

        this.initialize();
    };

    /**
     * Default options.
     * @public
     */
    Progress.Defaults = {
        "progress": {
            "applyTo": ".mfInfo",
            "class": "mfProgress"
        }
    };

    /**
     * Initializes the Progress plugin.
     * @protected
     */
    Progress.prototype.initialize = function () {
        this._core.$element.trigger('mfProgress.initialize');

        this.create();
        this.watch();

        this._core.$element.trigger('mfProgress.initialized');
    };

    /**
     * Creates a necessary DOM for Progress plugin.
     * @protected
     */
    Progress.prototype.create = function () {
        var self = this;
        self._core.$element
            .append($("<div/>", {
                "class": self._core.options.progress.applyTo.replace(/^\./i, "")
            })
                .each(function () {
                    var button = $(this);
                    button
                        .addClass(self._core.options.progress.class)
                        .wrapInner($('<span/>', {'class': 'cnt'}))
                        .append($('<span/>', {'class': 'loader'}))
                        .append($('<span/>', {'class': 'msg'}))
                }));
    };

    /**
     * Creates all attached event handlers of Progress plugin.
     * @protected
     */
    Progress.prototype.watch = function () {
        var self = this;

        self._core.$element
            .on('mf.process', function () {
                $(this).find('.' + self._core.options.progress.class).removeClass('hide').addClass('sending').find('.msg').text('Loading...');
            })
            .on('mf.fail', function (e, data) {
                $(this).find('.' + self._core.options.progress.class)
                    .removeClass('sending')
                    .addClass('fail')
                    .find('.msg')
                    .text(data.message);
                setTimeout($.proxy(function () {
                    $(this).find('.' + self._core.options.progress.class).removeClass('fail').addClass('hide').find('.msg');
                }, this), 3000);
            })
            .on('mf.success', function (e, data) {
                $(this).find('.' + self._core.options.progress.class)
                    .removeClass('sending')
                    .addClass('success')
                    .find('.msg')
                    .text(data.message);

                setTimeout($.proxy(function () {
                    $(this).find('.' + self._core.options.progress.class).removeClass('success').addClass('hide').find('.msg');
                }, this), 1500);
            })
            .on('mf.reset', function (e, data) {
                $(this).find('.' + self._core.options.progress.class).removeClass('sending').removeClass('fail').removeClass('success').find('.msg');
            });
    };
})(window.jQuery, window, document);


/**
 * Auto Initializer
 * @version 1.0.0
 * @author Evgeniy Gusarov (StMechanus | Diversant)
 * @license The MIT License (MIT)
 */
;
(function ($, window, document) {
    $(document).ready(function () {
        var o = $('.mailform');

        if (o.length) {
            o.rdMailForm();
        }
    });
})(window.jQuery, window, document);



