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
      cache: { classes: {}, instances: {}, facade: null, handlers: {} },
      dict: {},
      container: null,
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
      facade: function() {
        var facade = null
        if (this.cache.facade == null) {
          var facade = this
          if (facade.container) {
            while (facade = facade.container) {
              if (facade.container == null || facade.container.type == exportType) { 
                this.cache.facade = facade
                break
              }
            }
          }
        } else {
          facade = this.cache.facade
        }
        return facade
      },
      handle: function(handled) {
        var self = this, facade = this.container.type == exportType ? this : this.facade(), type = typeof(handled) == 'object' ? handled.type : handled
        if (facade.cache.handlers[type] == null) { facade.cache.handlers[type] = [] }
        return {
          through: function(handler) {
            facade.cache.handlers[type].push(handler)
          }
        }
      },
      route: function(destination) {
        var facades = [], type = this.type
        if (typeof(destination) == 'string') {
          var root = this.facade().facade()
          if (arguments.length == 1) {
            if (destination == '*') {
              facades = root.cache.instances
            } else {
              if (root.cache.instances[destination]) {
                facades.push(root.cache.instances[destination])
              }
            }
          } else {
            for (var d=0;d<arguments.length;d++) {
              var destination = arguments[d]
              if (root.cache.instances[destination]) {
                facades.push(root.cache.instances[destination])
              }
            }
          }
        } else {
          facades.push(this.facade())
        }
        for (var r in facades) {
          var facade = facades[r]
          if (facade.cache.handlers[type]) {
            for (var hk in facade.cache.handlers[type]) {
              var hh = facade.cache.handlers[type][hk]
              if (typeof(hh) == 'object') {
                hh.execute.apply(hh, [this])
              } else if (typeof(hh) == 'function') {
                hh.apply(hh, [this])
              }
            }
          }
        }
      }
    }
    return p
  }
  
  context[exportType] = makeProto()
}(window ? window : this);