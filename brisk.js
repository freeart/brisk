(function ($) {

	/**
	 * Runs functions given in arguments in series, each functions passing their results to the next one.
	 * Return jQuery Deferred object.
	 *
	 * @author Dmitry (dio) Levashov, dio@std42.ru
	 * @return jQuery.Deferred
	 */
	var waterfall = function () {
		var steps = [],
				dfrd = $.Deferred(),
				pointer = 0;

		$.each(arguments, function (i, a) {
			steps.push(function () {
				var args = [].slice.apply(arguments), d;

				if (typeof(a) == 'function') {
					if (!((d = a.apply(null, args)) && d.promise)) {
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
	}

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
	}

	$.fn.brisk = $.brisk = function brisk(rawConfig, actionConfig) {
		var $root = this === $ ? $(document) : this;

		$.brisk.options = {
			dontPrevent:['paste', 'keydown', 'keyup', 'keypress']
		};
		var normalized = {};
		$.each(rawConfig, function (selector, handlers) {
			if (typeof handlers === "string") {
				normalized[selector] = {
					click:{
						actions:[handlers],
						always:[],
						fails:[]
					}
				}
			} else if ($.isArray(handlers)) {
				normalized[selector] = {
					click:{
						actions:handlers,
						always:[],
						fails:[]
					}
				}
			} else if ($.isPlainObject(handlers)) {
				$.each(handlers, function (event, innerHandlers) {
					if (typeof innerHandlers === "string") {
						normalized[selector] = normalized[selector] || {};
						normalized[selector][event] = {
							actions:[innerHandlers],
							always:[],
							fails:[]
						}
					} else if ($.isArray(innerHandlers)) {
						normalized[selector] = normalized[selector] || {};
						normalized[selector][event] = {
							actions:innerHandlers,
							always:[],
							fails:[]
						};
					} else if ($.isPlainObject(innerHandlers)) {
						$.each(innerHandlers, function (action, handler) {
							if (typeof handler === "string") {
								innerHandlers[action] = [handler];
							}
						});
						normalized[selector] = normalized[selector] || {};
						normalized[selector][event] = {
							actions:(innerHandlers.prepare || []).concat(innerHandlers.action || [], innerHandlers.done || []),
							fails:innerHandlers.fail || [],
							always:innerHandlers.always || []
						}
					}
				});
			}
		});

		$.each(normalized, function (selector, handlers) {
			$.each(handlers, function (event, params) {

				$root.on(event, ($.inArray(selector, ['window', 'body', 'document']) > -1 ? undefined : selector), function (e) {
					if (brisk.options.dontPrevent === false || $.inArray(e.type, brisk.options.dontPrevent) == -1) {
						e.preventDefault();
						e.stopPropagation();
					}
					var element = this;

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
									return fn(e, element, lastArg, steps);
								});
							}(fn, i);
						}
					}
					if (actions.length) {
						waterfall.apply(this, actions)
								.fail(function (data) {
									for (var i = -1, len = params.fails.length; ++i < len;) {
										var fn = ns(actionConfig, params.fails[i]);
										if ($.isFunction(fn)) {
											fn(e, element, data, steps);
										}
									}
								})
								.always(function () {
									for (var i = -1, len = params.always.length; ++i < len;) {
										var fn = ns(actionConfig, params.always[i]);
										if ($.isFunction(fn)) {
											fn(e, element, lastArg, steps);
										}
									}
								})
					}
				});
			});
		});
	}

})(jQuery);