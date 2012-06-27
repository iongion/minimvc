!function(context) {
	var 
	exportType = 'MiniMVC',
	router = {},
	extend = function(baseclass, subclass) {
		var aux = function() { }
		aux.prototype = baseclass.prototype
		subclass.prototype = new aux()
		subclass.prototype.constructor = subclass
		return subclass
	},
	define = function(scope, type, base) {
		if (type == undefined) return
		var clazz = null, cType = type, bType = base
		if (scope.cache.classes[cType] == null) {
			clazz = makeProto()
			clazz.base = bType ? bType : exportType
			clazz.type = cType
			scope.cache.classes[cType] = clazz
		} else {
			clazz = scope.cache.classes[cType]
		}
		return clazz
	},
	makeProto = function() {
		var p = function() { }
		p.prototype = {
			cache: { classes: {}, instances: {}, root: null },
			dict: {},
			container: null,
			notifications: [],
			base: null,
			type: exportType,
			get: function(type, subtype, isTransient) {
				var self = this,
						inst = null,
						clazz = define(this, type),
						subclazz = define(this, subtype, type)
				inst = (function(className, instClazz, container) { 
					var i = null, makeInst = function() {
						var i = new instClazz()
						i.container = container
						i.base = instClazz.base
						i.type = className
						return i
					}
					if (isTransient) {
						i = makeInst()
					} else {
						if (self.cache.instances[className] == null) {
							i = makeInst()
							self.cache.instances[className] = i
						} else {
							i = self.cache.instances[className]
						}
					}
					return i
				})( subtype ? subtype : type, subclazz ? subclazz : clazz, this)
				return inst
			},
			data: function(dsk, val) {
				if (arguments.length == 0) {
					return this.dict
				} else {
					if (typeof(dsk) == 'object') {
						this.dict = dsk
					} else {
						if (val == undefined) {
							return this.dict[dsk]
						} else {
							this.dict[dsk] = val
						}
					}
				}
			},
			root: function() {
				var root = null
				if (this.cache.root == null) {
					var root = this
					while (root = root.container) {
						if (root.container.type == exportType) { 
							this.cache.root = root
							break
						}
					}
				} else {
					root = this.cache.root
				}
				return root
			},
			handle: function(handled) {
				var self = this, root = this.root()
				if (root.cache[handled.type] == null) {
					root.cache[handled.type] = []
				}
				return {
					through: function(handler) {
						root.cache[handled.type].push(handler)
					}
				}
			},
			route: function(context) {
				var root = this.root()
				if (root.cache[this.type] != null && root.cache[this.type].length > 0) {
					for (var i=0;i<root.cache[this.type].length;i++) {
						var nho = root.cache[this.type][i]
						if (typeof(nho) == 'object') {
							nho.execute.apply(nho, [context])
						} else if (typeof(nho) == 'function') {
							console.log(nho, typeof(nho), nho.type, context)
							nho.apply(nho, [context])
						}
					}
				}
			}
		}
		return p
	}
	
	context[exportType] = makeProto()
}(window);