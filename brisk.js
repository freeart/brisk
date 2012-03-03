/**
 * Brisk
 *
 * @author Landgraf Paul, landgraf.paul@gmail.com
 */

(function ($) {
	/**
	 * Runs functions given in arguments in series, each functions passing their results to the next one.
	 * Return jQuery Deferred object.
	 *
	 * @author Dmitry (dio) Levashov, dio@std42.ru
	 * @return jQuery.Deferred
	 */
	var waterfall = $.waterfall = function () {
		var steps = [],
			dfrd = $.Deferred(),
			pointer = 0;

		$.each(arguments, function (i, a) {
			steps.push(function () {
				var args = [].slice.apply(arguments), d;

				if (typeof(a) == 'function') {
					if (!((d = a.apply(null, args)) && d.hasOwnProperty('promise'))) {
						d = $.Deferred()[d === false ? 'reject' : 'resolve'](d);
					}
				} else if (a && a.promise) {
					d = a;
				} else {
					d = $.Deferred()[a === false ? 'reject' : 'resolve'](a);
				}

				d.fail(function () {
					dfrd.reject.apply(dfrd, [].slice.apply(arguments));
				})
					.done(function (data) {
						pointer++;
						args.push(data);

						pointer == steps.length
							? dfrd.resolve.apply(dfrd, args)
							: steps[pointer].apply(null, args);
					});
			});
		});

		steps.length ? steps[0]() : dfrd.resolve();

		return dfrd;
	};

	var ns = function (src, path) {
		var o, d;
		if (path === undefined) return {};
		if (path.indexOf('.') != -1) {
			d = path.split(".");
			o = src[d[0]] = src[d[0]] || {};
			$.each(d.slice(1), function (index, elPath) {
				o = o[elPath] = o[elPath] || {};
			});
		} else {
			o = src[path] = src[path] || {};
		}
		return o;
	};

	$.fn.brisk = $.brisk = function brisk(rawConfig, actionConfig) {
		var $root = this === $ ? $(document) : this,
			defaults,
			normalized = {};

		defaults = $.extend({
			direct: false
		}, $.brisk.defaults);

		/*
		 * Example:
		 * { ..., config: 'common.init', ... }
		 */
		if (typeof rawConfig === "string") {
			rawConfig = [rawConfig];
		}

		/*
		 * If provided is an array we have just to invoke all the members one-by-one. This is used for initial stuff.
		 * Example:
		 * { ..., config: ['system.init', 'dropdown.init'], ... }
		 */
		if ($.isArray(rawConfig)) {
			var prevResult;
			for (var i = -1, len = rawConfig.length; ++i < len;) {
				var fn = ns(actionConfig, rawConfig[i]);
				if ($.isFunction(fn)) {
					try {
						prevResult = fn.call(actionConfig, null, null, prevResult);
					} catch (e) {

					}
				}
			}
		}
		/*
		 * … Otherwise it's an actual config (object) so process it
		 * Example:
		 * {
		 *   ...,
		 *   config: { ... },
		 *   ...
		 * }
		 */
		else if ($.isPlainObject(rawConfig)) {
			$.each(rawConfig, function (selector, handlers) {
				/*
				 * Example:
				 * {
				 *   ...,
				 *   selector1: 'postform.close',
				 *   selector2: ['postform.open', 'postform.selectType']
				 *   ...
				 * }
				 */
				if (typeof handlers === "string" || $.isArray(handlers)) {
					normalized[selector] = {
						click: $.extend({
							actions: $.isArray(handlers) ? handlers : [handlers],
							always: [],
							fails: []
						}, defaults)
					}
				}
				/*
				 * Example:
				 * {
				 *   ...,
				 *   selector: { ... },
				 *   ...
				 * }
				 */
				else if ($.isPlainObject(handlers)) {
					$.each(handlers, function (event, innerHandlers) {
						/*
						 * Example:
						 * {
						 *   event1: 'dropdown.show'
						 * }
						 */
						if (typeof innerHandlers === "string") {
							normalized[selector] = normalized[selector] || {};
							normalized[selector][event] = {
								actions: [innerHandlers],
								always: [],
								fails: []
							}
						}
						/*
						 * Example:
						 * {
						 *   event1: ['dropdown.hideAll', 'dropdown.show']
						 * }
						 */
						else if ($.isArray(innerHandlers)) {
							normalized[selector] = normalized[selector] || {};
							normalized[selector][event] = {
								actions: innerHandlers,
								always: [],
								fails: []
							};
						}
						/*
						 * Example:
						 * {
						 *   event1: {
						 *     action: ...,
						 *     always...,
						 *     fail: ...
						 *   }
						 * }
						 */
						else if ($.isPlainObject(innerHandlers)) {
							$.each(innerHandlers, function (action, handler) {
								/*if (action === 'direct' && handler === true) {
								 innerHandlers['direct'] = true;
								 }*/
								if (typeof handler === "string") {
									innerHandlers[action] = [handler];
								}
							});

							normalized[selector] || (normalized[selector] = {});

							normalized[selector][event] = {
								actions: (innerHandlers.prepare || []).concat(innerHandlers.action || [], innerHandlers.done || []),
								fails: innerHandlers.fail || [],
								always: innerHandlers.always || [],
								direct: innerHandlers.direct
							}
						}

						normalized[selector][event] = $.extend({}, defaults, normalized[selector][event]);
					});
				}
			});

			$.each(normalized, function (selector, handlers) {
				$.each(handlers, function (event, params) {
					var $target = selector === 'window' ? $(window) : params.direct ? $(selector) : $root;
					var isHack = false;
					if (($.browser.opera) && event == 'submit') {
						isHack = true;
						event = 'click';
						selector = selector + ' :submit';
					}
					$target.on(event, (params.direct || $.inArray(selector, ['window', 'body', 'document']) > -1 ? undefined : selector), function (e) {
						var element = !isHack ? this : $(this).closest('form').get(0);

						var actions = [];
						var steps = {};
						var lastArg;

						for (var i = -1, len = params.actions.length; ++i < len;) {
							var fn = ns(actionConfig, params.actions[i]);
							if ($.isFunction(fn)) {
								!function (fn, step) {
									actions.push(function () {
										if (step > 0) {
											steps[params.actions[step - 1]] = arguments[step - 1];
										}
										var args = [].slice.call(arguments);
										lastArg = undefined;
										while (args.length && lastArg === undefined) {
											lastArg = args.pop();
										}
										return fn.call(actionConfig, e, element, lastArg, steps);
									});
								}(fn, i);
							}
						}
						if (actions.length) {
							waterfall.apply(this, actions)
								.fail(function (data) {
									lastArg = data || lastArg;
									for (var i = -1, len = params.fails.length; ++i < len;) {
										var fn = ns(actionConfig, params.fails[i]);
										if ($.isFunction(fn)) {
											fn.call(actionConfig, e, element, lastArg, steps);
										}
									}
								})
								.always(function () {
									for (var i = -1, len = params.always.length; ++i < len;) {
										var fn = ns(actionConfig, params.always[i]);
										if ($.isFunction(fn)) {
											fn.call(actionConfig, e, element, lastArg, steps);
										}
									}
								})
						}
					});
				});
			});
		}
	}

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
})(jQuery);