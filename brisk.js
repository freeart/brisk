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
						actions:[handlers]
					}
				}
			} else if ($.isArray(handlers)) {
				normalized[selector] = {
					click:{
						actions:handlers,
						fails:[]
					}
				}
			} else if ($.isPlainObject(handlers)) {
				$.each(handlers, function (event, innerHandlers) {
					if (typeof innerHandlers === "string") {
						normalized[selector] = normalized[selector] || {};
						normalized[selector][event] = {
							actions:[innerHandlers],
							fails:[]
						}
					} else if ($.isArray(innerHandlers)) {
						normalized[selector] = normalized[selector] || {};
						normalized[selector][event] = {
							actions:innerHandlers,
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
							fails:innerHandlers.fail || []
						}
					}
				});
			}
		});

		$.each(normalized, function (selector, handlers) {
			$.each(handlers, function (event, params) {

				$root.on(event, selector, function (e) {
					if (brisk.options.dontPrevent === false || $.inArray(e.type, brisk.options.dontPrevent) == -1) {
						e.preventDefault();
						e.stopPropagation();
					}
					var element = this;

					var actions = [];
					for (var i = -1, len = params.actions.length; ++i < len;) {
						if ($.isFunction(actionConfig[params.actions[i]])) {
							!function (i) {
								actions.push(function () {
									return actionConfig[params.actions[i]](e, element, {}, arguments[arguments.length - 1])
								});
							}(i);
						}
					}
					if (actions.length) {
						waterfall.apply(this, actions)
								.fail(function (data) {
									for (var i = -1, len = params.fails.length; ++i < len;) {
										if ($.isFunction(actionConfig[params.fails[i]])) {
											actionConfig[params.fails[i]](e, element, {}, data);
										}
									}
								});
					}
				});
			});
		});
	}

})(jQuery);