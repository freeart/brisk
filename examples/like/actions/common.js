App = {
	actions: {}
}

App.actions.common = {
    verify: function (e, el, prevArgs) {
        if (!prevArgs) return false;
        if (prevArgs.error) {
            if (prevArgs.message) alert(prevArgs.message);
            return false;
        }
    },

    confirm: function (e, el, prevArgs) {
        if (confirm('Really?') == true) {
            return true;
        } else {
            return false;
        }
    },

    addLoader: function (e, el) {
        if (!$(el).hasClass('brisk_working')) {
            $(el).addClass('brisk_working');
        } else {
            return false;
        }
    },

    removeLoader: function (e, el, data) {
        var dfd = $(el).data('brisk_working');
        if (!dfd || (dfd && $.isFunction(dfd.state) && (dfd.state() != 'pending'))) {
            $(el).removeClass('brisk_working');
        }
    },

    lockBlock: function (e, el) {
        var $block = $(el).closest('[role=block]');
        if (!$block.hasClass('brisk_lock')) {
            $block.addClass('brisk_lock');
        } else {
            return false;
        }
    },

    unlockBlock: function (e, el) {
        var $block = $(el).closest('[role=block]');
        var dfd = $block.data('brisk_lock');
        if (!dfd || (dfd && $.isFunction(dfd.state) && (dfd.state() != 'pending'))) {
            $block.removeClass('brisk_lock');
        }
    },

    dataGrabber: function (e, el, prevArgs) {
        var $el = $(el),
            $block = $el.closest('[role=block]'),
            blockData = $block.data(),
            elData = $.extend(true, {}, blockData, $el.data());
        if (elData.mods) {
            elData['mods[]'] = elData.mods.split(',');
            delete elData.mods;
        }

        return elData;
    },

    formGrabber: function (e, el, prevArgs) {
        var dfd = new $.Deferred,
            $form = $(el).closest('form');

        if ($form.length) {
            dfd.resolve($(el).closest('form').serializeObject());
        }
        else {
            dfd.resolve({});
        }

        return dfd.promise();
    },

    blockGrabber: function (e, el, prevArgs) {
        var dfd = new $.Deferred,
            $form = $(el).closest('[role="block"]');

        if ($form.length) {
            dfd.resolve($(el).closest('[role="block"]').serializeBlock2Object());
        }
        else {
            dfd.resolve({});
        }

        return dfd.promise();
    },

    render: function (e, el, prevArgs) {
        var dfd = new $.Deferred(),
            error = false;

        $.each(prevArgs, function (selector, config) {
            var $target = $(selector);

            if (!config.html || $.trim(config.html).length === 0) {
                config.html = '';
            }

            switch (config.mode) {
                case 'replace':
                    $target.html(config.html);
                    break;

                case 'replaceWith':
                    $target.replaceWith(config.html);
                    break;

                case 'append':
                    $target.append(config.html);
                    break;

                case 'prepend':
                    $target.prepend(config.html);
                    break;

                case 'delete':
                    $target.promise().done(function () {
                        $(this).remove()
                    });
                    break;

                case 'after':
                    $target.after(config.html);
                    break;

                case 'before':
                    $target.before(config.html);
                    break;

                case 'redirect':
                    window.location.href = config.url;
                    break;

                case 'refresh':
                    window.location.reload();
                    break;

                default:
                    error = true;
            }
        });

        if (error) {
            dfd.reject(prevArgs);
        }
        else {
            dfd.resolve(prevArgs);
        }

        return dfd.promise();
    },

    stopPropagation: function (e) {
        e.stopPropagation();
    },

    stopImmediatePropagation: function (e) {
        e.stopImmediatePropagation();
    },

    preventDefault: function (e) {
        e.preventDefault();
    },

    stopEvent: function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    },

    lockForm: function (e, el) {
        $('<div class="brisk_locker" />').css({
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            background: '#fff',
            opacity: .5
        }).appendTo(el);
    },

    unlockForm: function (e, el) {
        $(el).find('.brisk_locker').remove();
    },

    reload: function (e, el) {
        window.location.reload();
    },

    log: function (e, el, prevArgs) {
        console.log(prevArgs);
    }
}

function isMobile() {
    if (/Android|iPhone|iPod/i.test(navigator.userAgent))
        return true;
    else
        return false;
}

function unixdate(str) {
    var t = str.split('/');
    return new Date(t[2], t[1] - 1, t[0])
}

function hash(array, fn) {
    if (typeof fn === 'string') {
        var key = fn;
        fn = function () {
            return [this[key], this]
        }
    }
    var results = {},
        i = 0,
        len = array.length,
        pair = [];

    for (; i < len; i++) {
        pair = fn.call(array[i], array[i], i, array);
        results[ pair[0] ] = pair[1];
    }

    return results;
}

(function ($) {
    $.fn.serializeObject = function (allowEmptyValues) {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (allowEmptyValues || (this.value !== undefined && this.value !== '')) {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value);
                } else {
                    o[this.name] = this.value;
                }
            }
        });
        return o;
    };


    $.fn.serializeBlock = function () {
        var rselectTextarea = /^(?:select|textarea)/i,
            rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
            rCRLF = /\r?\n/g;

        return this.map(function () {
            var elements = $(this).find('*');

            return $.makeArray(elements);
        })
            .filter(function () {
                return this.name && !this.disabled &&
                    ( this.checked || rselectTextarea.test(this.nodeName) ||
                        rinput.test(this.type) );
            })
            .map(
            function (i, elem) {
                var val = jQuery(this).val();

                return val == null ?
                    null :
                    jQuery.isArray(val) ?
                        jQuery.map(val, function (val, i) {
                            return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
                        }) :
                    { name: elem.name, value: val.replace(rCRLF, "\r\n") };
            }).get();
    }

    $.fn.serializeBlock2Object = function () {
        var o = {};
        var a = this.serializeBlock();
        for (var i = 0; i < a.length; i++) {
            if (o[a[i].name] !== undefined) {
                if (!o[a[i].name].push) {
                    o[a[i].name] = [o[a[i].name]];
                }
                o[a[i].name].push(a[i].value || '');
            } else {
                o[a[i].name] = a[i].value || '';
            }
        }
        return o;
    };

    if ($.browser.opera) {
        $.fn.serializeArray = function () {
            var rselectTextarea = /^(?:select|textarea)/i,
                rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
                rCRLF = /\r?\n/g;

            return this.map(function () {
                var elements = $(this).find('*');

                return $.makeArray(elements);
            })
                .filter(function () {
                    return this.name && !this.disabled &&
                        ( this.checked || rselectTextarea.test(this.nodeName) ||
                            rinput.test(this.type) );
                })
                .map(
                function (i, elem) {
                    var val = jQuery(this).val();

                    return val == null ?
                        null :
                        jQuery.isArray(val) ?
                            jQuery.map(val, function (val, i) {
                                return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
                            }) :
                        { name: elem.name, value: val.replace(rCRLF, "\r\n") };
                }).get();
        }
    }

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        for (var i = 0; i < a.length; i++) {
            if (o[a[i].name] !== undefined) {
                if (!o[a[i].name].push) {
                    o[a[i].name] = [o[a[i].name]];
                }
                o[a[i].name].push(a[i].value || '');
            } else {
                o[a[i].name] = a[i].value || '';
            }
        }
        return o;
    };

    $.extend({
        parseQuerystring: function (location) {
            var nvpair = {};
            var qs = location.replace(/^\?/, '');
            var pairs = qs.split('&');
            $.each(pairs, function (i, v) {
                var pair = v.split('=');
                if (pair[0]) {
                    nvpair[pair[0]] = pair[1];
                }
            });
            return nvpair;
        }
    });

})(jQuery);