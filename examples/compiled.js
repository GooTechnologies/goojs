'use strict';function n(G) {
  throw G;
}
var q = void 0, r = null;
function H() {
  return function() {
  }
}
(function() {
  var G, l;
  (function(e) {
    function c(a, d) {
      var b, f, c, g, e, o, i, u, h, k = d && d.split("/"), m = p.map, j = m && m["*"] || {};
      if(a && a.charAt(0) === ".") {
        if(d) {
          k = k.slice(0, k.length - 1);
          a = k.concat(a.split("/"));
          for(u = 0;u < a.length;u += 1) {
            if(b = a[u], b === ".") {
              a.splice(u, 1), u -= 1
            }else {
              if(b === "..") {
                if(u === 1 && (a[2] === ".." || a[0] === "..")) {
                  break
                }else {
                  u > 0 && (a.splice(u - 1, 2), u -= 2)
                }
              }
            }
          }
          a = a.join("/")
        }else {
          a.indexOf("./") === 0 && (a = a.substring(2))
        }
      }
      if((k || j) && m) {
        b = a.split("/");
        for(u = b.length;u > 0;u -= 1) {
          f = b.slice(0, u).join("/");
          if(k) {
            for(h = k.length;h > 0;h -= 1) {
              if(c = m[k.slice(0, h).join("/")]) {
                if(c = c[f]) {
                  g = c;
                  e = u;
                  break
                }
              }
            }
          }
          if(g) {
            break
          }
          !o && j && j[f] && (o = j[f], i = u)
        }
        !g && o && (g = o, e = i);
        g && (b.splice(0, e, g), a = b.join("/"))
      }
      return a
    }
    function b(a, d) {
      return function() {
        return k.apply(e, w.call(arguments, 0).concat([a, d]))
      }
    }
    function a(a) {
      return function(d) {
        return c(d, a)
      }
    }
    function d(a) {
      return function(d) {
        y[a] = d
      }
    }
    function f(a) {
      if(u.call(s, a)) {
        var d = s[a];
        delete s[a];
        o[a] = !0;
        h.apply(e, d)
      }
      !u.call(y, a) && !u.call(o, a) && n(Error("No " + a));
      return y[a]
    }
    function g(a) {
      var d, b = a ? a.indexOf("!") : -1;
      b > -1 && (d = a.substring(0, b), a = a.substring(b + 1, a.length));
      return[d, a]
    }
    function i(a) {
      return function() {
        return p && p.he && p.he[a] || {}
      }
    }
    var h, k, m, j, y = {}, s = {}, p = {}, o = {}, u = Object.prototype.hasOwnProperty, w = [].slice;
    m = function(d, b) {
      var e, o = g(d), i = o[0], d = o[1];
      i && (i = c(i, b), e = f(i));
      i ? d = e && e.normalize ? e.normalize(d, a(b)) : c(d, b) : (d = c(d, b), o = g(d), i = o[0], d = o[1], i && (e = f(i)));
      return{qh:i ? i + "!" + d : d, ul:d, Mp:i, Zh:e}
    };
    j = {Ml:function(a) {
      return b(a)
    }, pd:function(a) {
      var d = y[a];
      return typeof d !== "undefined" ? d : y[a] = {}
    }, tl:function(a) {
      return{id:a, uri:"", pd:y[a], he:i(a)}
    }};
    h = function(a, c, g, i) {
      var h, k, w, C, p = [], l, i = i || a;
      if(typeof g === "function") {
        c = !c.length && g.length ? ["require", "exports", "module"] : c;
        for(C = 0;C < c.length;C += 1) {
          w = m(c[C], i), k = w.qh, k === "require" ? p[C] = j.Ml(a) : k === "exports" ? (p[C] = j.pd(a), l = !0) : k === "module" ? h = p[C] = j.tl(a) : u.call(y, k) || u.call(s, k) || u.call(o, k) ? p[C] = f(k) : w.Zh ? (w.Zh.load(w.ul, b(i, !0), d(k), {}), p[C] = y[k]) : n(Error(a + " missing " + k))
        }
        c = g.apply(y[a], p);
        if(a) {
          if(h && h.pd !== e && h.pd !== y[a]) {
            y[a] = h.pd
          }else {
            if(c !== e || !l) {
              y[a] = c
            }
          }
        }
      }else {
        a && (y[a] = g)
      }
    };
    G = k = function(a, d, b, c, g) {
      if(typeof a === "string") {
        return j[a] ? j[a](d) : f(m(a, d).qh)
      }else {
        a.splice || (p = a, d.splice ? (a = d, d = b, b = r) : a = e)
      }
      d = d || H();
      typeof b === "function" && (b = c, c = g);
      c ? h(e, a, d, b) : setTimeout(function() {
        h(e, a, d, b)
      }, 15);
      return k
    };
    k.he = function(a) {
      p = a;
      return k
    };
    l = function(a, d, b) {
      d.splice || (b = d, d = []);
      !u.call(y, a) && !u.call(s, a) && (s[a] = [a, d, b])
    };
    l.Do = {np:!0}
  })();
  l("almond", H());
  l("goo/entities/Entity", [], function() {
    function e(c, b) {
      this.gb = c;
      this.Bb = [];
      Object.defineProperty(this, "id", {value:e.Jk++, writable:!1});
      this.name = b !== q ? b : "Entity_" + this.id
    }
    e.prototype.qc = function() {
      this.gb.Sj(this)
    };
    e.prototype.Z = function(c) {
      var b = this.Bb.indexOf(c);
      b === -1 ? this.Bb.push(c) : this.Bb[b] = c;
      this[c.type.charAt(0).toLowerCase() + c.type.substr(1)] = c;
      if(c.type === "TransformComponent") {
        c.wc = this
      }
      this.gb.ac.pk(this) && this.gb.ih(this, c, "addedComponent")
    };
    e.prototype.toString = function() {
      return this.name
    };
    e.Jk = 0;
    return e
  });
  l("goo/entities/managers/EntityManager", [], function() {
    function e() {
      this.type = "EntityManager";
      this.Ub = {}
    }
    e.prototype.rc = function(c) {
      this.Ub[c.id] = c
    };
    e.prototype.Gc = function(c) {
      delete this.Ub[c.id]
    };
    e.prototype.pk = function(c) {
      return this.Ub[c.id] !== q
    };
    e.prototype.Df = function() {
      var c = [], b;
      for(b in this.Ub) {
        c.push(this.Ub[b])
      }
      return c
    };
    e.prototype.Gf = function() {
      var c = [], b;
      for(b in this.Ub) {
        var a = this.Ub[b];
        a.H ? a.H.parent || c.push(a) : c.push(a)
      }
      return c
    };
    return e
  });
  l("goo/math/MathUtils", [], function() {
    function e() {
    }
    e.ug = Math.PI / 180;
    e.ij = 180 / Math.PI;
    e.Sc = 0.5 * Math.PI;
    e.Pe = 2 * Math.PI;
    e.Qc = 1.0E-7;
    e.Op = function(c) {
      return c * e.ug
    };
    e.bp = function(c) {
      return c * e.ij
    };
    e.Dc = function(c, b, a) {
      return b === a ? b : b + (a - b) * c
    };
    e.jk = function(c, b) {
      return 0 < b ? c < 0 ? 0 : c > b ? b : c : c < b ? b : c > 0 ? 0 : c
    };
    e.Nl = function(c) {
      return(-2 * c + 3) * c * c
    };
    e.Ol = function(c) {
      return((6 * c - 15) * c + 10) * c * c * c
    };
    e.cq = function(c, b, a, d) {
      var f = c * Math.cos(a);
      d.x = f * Math.cos(b);
      d.y = c * Math.sin(a);
      d.j = f * Math.sin(b)
    };
    return e
  });
  l("goo/math/Matrix", ["goo/math/MathUtils"], function(e) {
    function c(b, a) {
      this.rows = b || 0;
      this.cols = a || 0;
      this.data = new Float32Array(this.rows * this.cols)
    }
    c.prototype.fc = function(b) {
      for(var a = this, d = 0;d < b.length;d++) {
        (function(f) {
          for(var c = 0;c < b[f].length;c++) {
            Object.defineProperty(a, b[f][c], {get:function() {
              return this.data[f]
            }, set:function(a) {
              this.data[f] = a
            }})
          }
          Object.defineProperty(a, d, {get:function() {
            return this.data[f]
          }, set:function(a) {
            this.data[f] = a
          }})
        })(d)
      }
    };
    c.add = function(b, a, d) {
      var f = b.rows, g = b.cols;
      d || (d = new c(f, g));
      if(a instanceof c) {
        (a.rows !== f || a.cols !== g || d.rows !== f || d.cols !== g) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
        for(f = 0;f < b.data.length;f++) {
          d.data[f] = b.data[f] + a.data[f]
        }
      }else {
        (d.rows !== f || d.cols !== g) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
        for(f = 0;f < b.data.length;f++) {
          d.data[f] = b.data[f] + a
        }
      }
      return d
    };
    c.prototype.add = function(b) {
      return c.add(this, b, this)
    };
    c.sub = function(b, a, d) {
      var f = b.rows, g = b.cols;
      d || (d = new c(f, g));
      if(a instanceof c) {
        (a.rows !== f || a.cols !== g || d.rows !== f || d.cols !== g) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
        for(f = 0;f < b.data.length;f++) {
          d.data[f] = b.data[f] - a.data[f]
        }
      }else {
        (d.rows !== f || d.cols !== g) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
        for(f = 0;f < b.data.length;f++) {
          d.data[f] = b.data[f] - a
        }
      }
      return d
    };
    c.prototype.sub = function(b) {
      return c.sub(this, b, this)
    };
    c.D = function(b, a, d) {
      var f = b.rows, g = b.cols;
      d || (d = new c(f, g));
      if(a instanceof c) {
        (a.rows !== f || a.cols !== g || d.rows !== f || d.cols !== g) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
        for(f = 0;f < b.data.length;f++) {
          d.data[f] = b.data[f] * a.data[f]
        }
      }else {
        (d.rows !== f || d.cols !== g) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
        for(f = 0;f < b.data.length;f++) {
          d.data[f] = b.data[f] * a
        }
      }
      return d
    };
    c.prototype.D = function(b) {
      return c.D(this, b, this)
    };
    c.G = function(b, a, d) {
      var f = b.rows, g = b.cols;
      d || (d = new c(f, g));
      if(a instanceof c) {
        (a.rows !== f || a.cols !== g || d.rows !== f || d.cols !== g) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
        for(f = 0;f < b.data.length;f++) {
          d.data[f] = b.data[f] / a.data[f]
        }
      }else {
        (d.rows !== f || d.cols !== g) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
        a = 1 / a;
        for(f = 0;f < b.data.length;f++) {
          d.data[f] = b.data[f] * a
        }
      }
      return d
    };
    c.prototype.G = function(b) {
      return c.G(this, b, this)
    };
    c.ka = function(b, a, d) {
      var f = b.rows, g = a.cols, e = b.cols = a.rows;
      d || (d = new c(f, g));
      (b.cols !== e || a.rows !== e || d.rows !== f || d.cols !== g) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      if(d === b || d === a) {
        return c.copy(c.ka(b, a), d)
      }
      for(var h = 0;h < g;h++) {
        for(var k = h * f, m = 0;m < f;m++) {
          for(var j = 0, y = 0;y < e;y++) {
            j += b.data[y * b.rows + m] * a.data[h * a.rows + y]
          }
          d.data[k + m] = j
        }
      }
      return d
    };
    c.prototype.ka = function(b) {
      return c.ka(this, b, this)
    };
    c.Ia = function(b, a) {
      var d = b.cols, f = b.rows;
      a || (a = new c(d, f));
      (a.rows !== d || a.cols !== f) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      if(a === b) {
        return c.copy(c.Ia(b), a)
      }
      for(var g = 0;g < f;g++) {
        for(var e = g * d, h = 0;h < d;h++) {
          a.data[e + h] = b.data[h * f + g]
        }
      }
      return a
    };
    c.prototype.Ia = function() {
      return c.Ia(this, this)
    };
    c.copy = function(b, a) {
      var d = b.rows, f = b.cols;
      a || (a = new c(d, f));
      (a.rows !== d || a.cols !== f) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      a.data.set(b.data);
      return a
    };
    c.prototype.copy = function(b) {
      return c.copy(b, this)
    };
    c.ta = function(b, a) {
      if(b.rows !== a.rows || b.cols !== a.cols) {
        return!1
      }
      for(var d = 0;d < b.data.length;d++) {
        if(Math.abs(b.data[d] - a.data[d]) > e.Qc) {
          return!1
        }
      }
      return!0
    };
    c.prototype.ta = function(b) {
      return c.ta(this, b)
    };
    c.prototype.Fa = function() {
      return c.copy(this)
    };
    c.prototype.set = function() {
      if(arguments.length === 1 && typeof arguments[0] === "object") {
        if(arguments[0] instanceof c) {
          this.copy(arguments[0])
        }else {
          for(var b = 0;b < arguments[0].length;b++) {
            this.data[b] = arguments[0][b]
          }
        }
      }else {
        for(b = 0;b < arguments.length;b++) {
          this.data[b] = arguments[b]
        }
      }
      return this
    };
    c.prototype.toString = function() {
      for(var b = "", a = 0;a < this.cols;a++) {
        var d = a * this.rows;
        b += "[";
        for(var f = 0;f < this.rows;f++) {
          b += this.data[d + f], b += f !== this.rows - 1 ? ", " : ""
        }
        b += a !== this.cols - 1 ? "], " : "]"
      }
      return b
    };
    return c
  });
  l("goo/math/Vector", ["goo/math/MathUtils", "goo/math/Matrix"], function(e) {
    function c(b) {
      this.data = new Float32Array(b || 0)
    }
    c.prototype.fc = function(b) {
      for(var a = this, d = 0;d < b.length;d++) {
        (function(f) {
          for(var c = 0;c < b[f].length;c++) {
            Object.defineProperty(a, b[f][c], {get:function() {
              return this.data[f]
            }, set:function(a) {
              this.data[f] = a
            }})
          }
          Object.defineProperty(a, d, {get:function() {
            return this.data[f]
          }, set:function(a) {
            this.data[f] = a
          }})
        })(d)
      }
    };
    c.add = function(b, a, d) {
      var b = b.data || b, a = a.data || a, f = b.length;
      d || (d = new c(f));
      (a.length !== f || d.data.length !== f) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      for(var g = 0;g < f;g++) {
        d.data[g] = b[g] + a[g]
      }
      return d
    };
    c.prototype.add = function(b) {
      return c.add(this, b, this)
    };
    c.sub = function(b, a, d) {
      var b = b.data || b, a = a.data || a, f = b.length;
      d || (d = new c(f));
      (a.length !== f || d.data.length !== f) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      for(var g = 0;g < f;g++) {
        d.data[g] = b[g] - a[g]
      }
      return d
    };
    c.prototype.sub = function(b) {
      return c.sub(this, b, this)
    };
    c.D = function(b, a, d) {
      var b = b.data || b, a = a.data || a, f = b.length;
      d || (d = new c(f));
      (a.length !== f || d.data.length !== f) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      for(var g = 0;g < f;g++) {
        d.data[g] = b[g] * a[g]
      }
      return d
    };
    c.prototype.D = function(b) {
      return c.D(this, b, this)
    };
    c.G = function(b, a, d) {
      var b = b.data || b, a = a.data || a, f = b.length;
      d || (d = new c(f));
      (a.length !== f || d.data.length !== f) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      for(var g = 0;g < f;g++) {
        d.data[g] = b[g] / a[g]
      }
      return d
    };
    c.prototype.G = function(b) {
      return c.G(this, b, this)
    };
    c.copy = function(b, a) {
      var d = b.data.length;
      a || (a = new c(d));
      a.data.length !== d && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      a.data.set(b.data);
      return a
    };
    c.prototype.copy = function(b) {
      return c.copy(b, this)
    };
    c.J = function(b, a) {
      var d = b.data || b, f = a.data || a, c = d.length;
      f.length !== c && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      for(var e = 0, h = 0;h < c;h++) {
        e += d[h] * f[h]
      }
      return e
    };
    c.prototype.J = function(b) {
      return c.J(this, b)
    };
    c.apply = function(b, a, d) {
      var f = b.rows, g = b.cols, e = a.data.length;
      d || (d = new c(f));
      (d.data.length !== f || g !== e) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      if(d === a) {
        return c.copy(c.apply(b, a), d)
      }
      for(var h = 0;h < g;h++) {
        for(var k = h * f, m = 0;m < f;m++) {
          for(var j = 0, y = 0;y < e;y++) {
            j += b.data[y * b.rows + m] * a.data[y]
          }
          d.data[k + m] = j
        }
      }
      return d
    };
    c.prototype.apply = function(b) {
      return c.apply(b, this, this)
    };
    c.ta = function(b, a) {
      if(b.data.length !== a.data.length) {
        return!1
      }
      for(var d = 0;d < b.data.length;d++) {
        if(Math.abs(b.data[d] - a.data[d]) > e.Qc) {
          return!1
        }
      }
      return!0
    };
    c.prototype.ta = function(b) {
      return c.ta(this, b)
    };
    c.Bk = function(b, a) {
      return c.sub(b, a).Cc()
    };
    c.prototype.Bk = function(b) {
      return c.sub(this, b).Cc()
    };
    c.Ak = function(b, a) {
      return c.sub(b, a).length()
    };
    c.prototype.Ak = function(b) {
      return c.sub(this, b).length()
    };
    c.prototype.Cc = function() {
      return c.J(this, this)
    };
    c.prototype.length = function() {
      return Math.sqrt(c.J(this, this))
    };
    c.prototype.ma = function() {
      for(var b = 0;b < this.data.length;b++) {
        this.data[b] = 0 - this.data[b]
      }
      return this
    };
    c.prototype.normalize = function() {
      var b = this.length();
      b < e.Qc && n({name:"Normalization Error", message:"The magnitude of the vector is incredibly small."});
      for(var b = 1 / b, a = 0;a < this.data.length;a++) {
        this.data[a] *= b
      }
      return this
    };
    c.prototype.Fa = function() {
      return c.copy(this)
    };
    c.prototype.set = function() {
      if(arguments.length === 1 && typeof arguments[0] === "object") {
        if(arguments[0] instanceof c) {
          this.copy(arguments[0])
        }else {
          if(arguments[0].length > 1) {
            for(var b = 0;b < arguments[0].length;b++) {
              this.data[b] = arguments[0][b]
            }
          }else {
            this.set(arguments[0][0])
          }
        }
      }else {
        for(b in arguments) {
          this.data[b] = arguments[b]
        }
      }
      return this
    };
    c.prototype.toString = function() {
      var b = "";
      b += "[";
      for(var a = 0;a < this.data.length;a++) {
        b += this.data[a], b += a !== this.data.length - 1 ? ", " : ""
      }
      b += "]";
      return b
    };
    return c
  });
  l("goo/math/Vector3", ["goo/math/Vector"], function(e) {
    function c() {
      e.call(this, 3);
      this.set(arguments.length !== 0 ? arguments : [0, 0, 0])
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.fc([["x", "u", "r"], ["y", "v", "g"], ["z", "w", "b"]]);
    c.ZERO = new c(0, 0, 0);
    c.ONE = new c(1, 1, 1);
    c.Jg = new c(1, 0, 0);
    c.Md = new c(0, 1, 0);
    c.rj = new c(0, 0, 1);
    c.add = function(b, a, d) {
      typeof b === "number" && (b = [b, b, b]);
      typeof a === "number" && (a = [a, a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 3 || a.length !== 3) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] + a[0];
      d.data[1] = b[1] + a[1];
      d.data[2] = b[2] + a[2];
      return d
    };
    c.prototype.add = function(b) {
      return c.add(this, b, this)
    };
    c.sub = function(b, a, d) {
      typeof b === "number" && (b = [b, b, b]);
      typeof a === "number" && (a = [a, a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 3 || a.length !== 3) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] - a[0];
      d.data[1] = b[1] - a[1];
      d.data[2] = b[2] - a[2];
      return d
    };
    c.prototype.sub = function(b) {
      return c.sub(this, b, this)
    };
    c.D = function(b, a, d) {
      typeof b === "number" && (b = [b, b, b]);
      typeof a === "number" && (a = [a, a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 3 || a.length !== 3) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] * a[0];
      d.data[1] = b[1] * a[1];
      d.data[2] = b[2] * a[2];
      return d
    };
    c.prototype.D = function(b) {
      return c.D(this, b, this)
    };
    c.G = function(b, a, d) {
      typeof b === "number" && (b = [b, b, b]);
      typeof a === "number" && (a = [a, a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 3 || a.length !== 3) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] / a[0];
      d.data[1] = b[1] / a[1];
      d.data[2] = b[2] / a[2];
      return d
    };
    c.prototype.G = function(b) {
      return c.G(this, b, this)
    };
    c.J = function(b, a) {
      typeof b === "number" && (b = [b, b, b]);
      typeof a === "number" && (a = [a, a, a]);
      var d = b.data || b, f = a.data || a;
      (d.length !== 3 || f.length !== 3) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      var c = 0;
      c += d[0] * f[0];
      c += d[1] * f[1];
      c += d[2] * f[2];
      return c
    };
    c.prototype.J = function(b) {
      return c.J(this, b)
    };
    c.Yb = function(b, a, d) {
      d || (d = new c);
      if(d === b || d === a) {
        return e.copy(c.Yb(b, a), d)
      }
      var f = a.data || a;
      ((b.data || b).length !== 3 || f.length !== 3) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = a.data[2] * b.data[1] - a.data[1] * b.data[2];
      d.data[1] = a.data[0] * b.data[2] - a.data[2] * b.data[0];
      d.data[2] = a.data[1] * b.data[0] - a.data[0] * b.data[1];
      return d
    };
    c.prototype.Yb = function(b) {
      return c.Yb(this, b, this)
    };
    c.prototype.Dc = function(b, a) {
      this.x = (1 - a) * this.x + a * b.x;
      this.y = (1 - a) * this.y + a * b.y;
      this.j = (1 - a) * this.j + a * b.j;
      return this
    };
    return c
  });
  l("goo/math/Matrix3x3", ["goo/math/MathUtils", "goo/math/Matrix", "goo/math/Vector3"], function(e, c, b) {
    function a() {
      c.call(this, 3, 3);
      arguments.length === 0 ? this.pb() : this.set(arguments)
    }
    a.prototype = Object.create(c.prototype);
    a.prototype.fc([["e00"], ["e10"], ["e20"], ["e01"], ["e11"], ["e21"], ["e02"], ["e12"], ["e22"]]);
    a.ic = new a(1, 0, 0, 0, 1, 0, 0, 0, 1);
    a.add = function(d, b, c) {
      c || (c = new a);
      b instanceof a ? (c.g = d.g + b.g, c.f = d.f + b.f, c.b = d.b + b.b, c.i = d.i + b.i, c.d = d.d + b.d, c.c = d.c + b.c, c.h = d.h + b.h, c.e = d.e + b.e, c.a = d.a + b.a) : (c.g = d.g + b, c.f = d.f + b, c.b = d.b + b, c.i = d.i + b, c.d = d.d + b, c.c = d.c + b, c.h = d.h + b, c.e = d.e + b, c.a = d.a + b);
      return c
    };
    a.prototype.add = function(d) {
      return a.add(this, d, this)
    };
    a.sub = function(d, b, c) {
      c || (c = new a);
      b instanceof a ? (c.g = d.g - b.g, c.f = d.f - b.f, c.b = d.b - b.b, c.i = d.i - b.i, c.d = d.d - b.d, c.c = d.c - b.c, c.h = d.h - b.h, c.e = d.e - b.e, c.a = d.a - b.a) : (c.g = d.g - b, c.f = d.f - b, c.b = d.b - b, c.i = d.i - b, c.d = d.d - b, c.c = d.c - b, c.h = d.h - b, c.e = d.e - b, c.a = d.a - b);
      return c
    };
    a.prototype.sub = function(d) {
      return a.sub(this, d, this)
    };
    a.D = function(d, b, c) {
      c || (c = new a);
      b instanceof a ? (c.g = d.g * b.g, c.f = d.f * b.f, c.b = d.b * b.b, c.i = d.i * b.i, c.d = d.d * b.d, c.c = d.c * b.c, c.h = d.h * b.h, c.e = d.e * b.e, c.a = d.a * b.a) : (c.g = d.g * b, c.f = d.f * b, c.b = d.b * b, c.i = d.i * b, c.d = d.d * b, c.c = d.c * b, c.h = d.h * b, c.e = d.e * b, c.a = d.a * b);
      return c
    };
    a.prototype.D = function(d) {
      return a.D(this, d, this)
    };
    a.G = function(d, b, c) {
      c || (c = new a);
      b instanceof a ? (c.g = d.g / b.g, c.f = d.f / b.f, c.b = d.b / b.b, c.i = d.i / b.i, c.d = d.d / b.d, c.c = d.c / b.c, c.h = d.h / b.h, c.e = d.e / b.e, c.a = d.a / b.a) : (b = 1 / b, c.g = d.g * b, c.f = d.f * b, c.b = d.b * b, c.i = d.i * b, c.d = d.d * b, c.c = d.c * b, c.h = d.h * b, c.e = d.e * b, c.a = d.a * b);
      return c
    };
    a.prototype.G = function(d) {
      return a.G(this, d, this)
    };
    a.ka = function(d, b, g) {
      g || (g = new a);
      if(g === d || g === b) {
        return c.copy(a.ka(d, b), g)
      }
      g.g = d.g * b.g + d.i * b.f + d.h * b.b;
      g.f = d.f * b.g + d.d * b.f + d.e * b.b;
      g.b = d.b * b.g + d.c * b.f + d.a * b.b;
      g.i = d.g * b.i + d.i * b.d + d.h * b.c;
      g.d = d.f * b.i + d.d * b.d + d.e * b.c;
      g.c = d.b * b.i + d.c * b.d + d.a * b.c;
      g.h = d.g * b.h + d.i * b.e + d.h * b.a;
      g.e = d.f * b.h + d.d * b.e + d.e * b.a;
      g.a = d.b * b.h + d.c * b.e + d.a * b.a;
      return g
    };
    a.prototype.ka = function(b) {
      return a.ka(this, b, this)
    };
    a.Ia = function(b, f) {
      f || (f = new a);
      if(f === b) {
        return c.copy(a.Ia(b), f)
      }
      f.g = b.g;
      f.f = b.i;
      f.b = b.h;
      f.i = b.f;
      f.d = b.d;
      f.c = b.e;
      f.h = b.b;
      f.e = b.c;
      f.a = b.a;
      return f
    };
    a.prototype.Ia = function() {
      return a.Ia(this, this)
    };
    a.ma = function(b, f) {
      f || (f = new a);
      if(f === b) {
        return c.copy(a.ma(b), f)
      }
      var g = b.sf();
      Math.abs(g) < e.Qc && n({name:"Singular Matrix", message:"The matrix is singular and cannot be inverted."});
      g = 1 / g;
      f.g = (b.d * b.a - b.e * b.c) * g;
      f.f = (b.e * b.b - b.f * b.a) * g;
      f.b = (b.f * b.c - b.d * b.b) * g;
      f.i = (b.h * b.c - b.i * b.a) * g;
      f.d = (b.g * b.a - b.h * b.b) * g;
      f.c = (b.i * b.b - b.g * b.c) * g;
      f.h = (b.i * b.e - b.h * b.d) * g;
      f.e = (b.h * b.f - b.g * b.e) * g;
      f.a = (b.g * b.d - b.i * b.f) * g;
      return f
    };
    a.prototype.ma = function() {
      return a.ma(this, this)
    };
    a.prototype.sf = function() {
      return this.g * (this.d * this.a - this.e * this.c) - this.i * (this.f * this.a - this.e * this.b) + this.h * (this.f * this.c - this.d * this.b)
    };
    a.prototype.pb = function() {
      this.set(a.ic)
    };
    a.prototype.ef = function(a) {
      var b = a.x, c = a.y, e = a.j;
      a.x = this.g * b + this.i * c + this.h * e;
      a.y = this.f * b + this.d * c + this.e * e;
      a.j = this.b * b + this.c * c + this.a * e;
      return a
    };
    a.prototype.Pf = function(a, b) {
      var c = a.x, e = a.y, h = a.j;
      b.g = c * this.g;
      b.i = e * this.i;
      b.h = h * this.h;
      b.f = c * this.f;
      b.d = e * this.d;
      b.e = h * this.e;
      b.b = c * this.b;
      b.c = e * this.c;
      b.a = h * this.a;
      return b
    };
    a.prototype.Ok = function(a, b, c) {
      var e = Math.cos(a), a = Math.sin(a), h = Math.cos(b), b = Math.sin(b), k = Math.cos(c), c = Math.sin(c);
      this.g = h * k;
      this.i = b * a - h * c * e;
      this.h = h * c * a + b * e;
      this.f = c;
      this.d = k * e;
      this.e = -k * a;
      this.b = -b * k;
      this.c = b * c * e + h * a;
      this.a = -b * c * a + h * e
    };
    a.prototype.re = function(a, c) {
      var g = new b, e = new b, h = new b;
      h.copy(a).normalize();
      g.copy(c).normalize().Yb(h);
      e.copy(h).Yb(g);
      this.g = g.x;
      this.f = g.y;
      this.b = g.j;
      this.i = e.x;
      this.d = e.y;
      this.c = e.j;
      this.h = h.x;
      this.e = h.y;
      this.a = h.j;
      return this
    };
    return a
  });
  l("goo/math/Matrix4x4", ["goo/math/MathUtils", "goo/math/Matrix"], function(e, c) {
    function b() {
      c.call(this, 4, 4);
      arguments.length === 0 ? this.pb() : this.set(arguments)
    }
    b.prototype = Object.create(c.prototype);
    b.prototype.fc([["e00"], ["e10"], ["e20"], ["e30"], ["e01"], ["e11"], ["e21"], ["e31"], ["e02"], ["e12"], ["e22"], ["e32"], ["e03"], ["e13"], ["e23"], ["e33"]]);
    b.ic = new b(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    b.add = function(a, d, c) {
      c || (c = new b);
      d instanceof b ? (c.g = a.g + d.g, c.f = a.f + d.f, c.b = a.b + d.b, c.p = a.p + d.p, c.i = a.i + d.i, c.d = a.d + d.d, c.c = a.c + d.c, c.q = a.q + d.q, c.h = a.h + d.h, c.e = a.e + d.e, c.a = a.a + d.a, c.n = a.n + d.n, c.s = a.s + d.s, c.m = a.m + d.m, c.l = a.l + d.l, c.o = a.o + d.o) : (c.g = a.g + d, c.f = a.f + d, c.b = a.b + d, c.p = a.p + d, c.i = a.i + d, c.d = a.d + d, c.c = a.c + d, c.q = a.q + d, c.h = a.h + d, c.e = a.e + d, c.a = a.a + d, c.n = a.n + d, c.s = a.s + d, c.m = a.m + 
      d, c.l = a.l + d, c.o = a.o + d);
      return c
    };
    b.prototype.add = function(a) {
      return b.add(this, a, this)
    };
    b.sub = function(a, d, c) {
      c || (c = new b);
      d instanceof b ? (c.g = a.g - d.g, c.f = a.f - d.f, c.b = a.b - d.b, c.p = a.p - d.p, c.i = a.i - d.i, c.d = a.d - d.d, c.c = a.c - d.c, c.q = a.q - d.q, c.h = a.h - d.h, c.e = a.e - d.e, c.a = a.a - d.a, c.n = a.n - d.n, c.s = a.s - d.s, c.m = a.m - d.m, c.l = a.l - d.l, c.o = a.o - d.o) : (c.g = a.g - d, c.f = a.f - d, c.b = a.b - d, c.p = a.p - d, c.i = a.i - d, c.d = a.d - d, c.c = a.c - d, c.q = a.q - d, c.h = a.h - d, c.e = a.e - d, c.a = a.a - d, c.n = a.n - d, c.s = a.s - d, c.m = a.m - 
      d, c.l = a.l - d, c.o = a.o - d);
      return c
    };
    b.prototype.sub = function(a) {
      return b.sub(this, a, this)
    };
    b.D = function(a, d, c) {
      c || (c = new b);
      d instanceof b ? (c.g = a.g * d.g, c.f = a.f * d.f, c.b = a.b * d.b, c.p = a.p * d.p, c.i = a.i * d.i, c.d = a.d * d.d, c.c = a.c * d.c, c.q = a.q * d.q, c.h = a.h * d.h, c.e = a.e * d.e, c.a = a.a * d.a, c.n = a.n * d.n, c.s = a.s * d.s, c.m = a.m * d.m, c.l = a.l * d.l, c.o = a.o * d.o) : (c.g = a.g * d, c.f = a.f * d, c.b = a.b * d, c.p = a.p * d, c.i = a.i * d, c.d = a.d * d, c.c = a.c * d, c.q = a.q * d, c.h = a.h * d, c.e = a.e * d, c.a = a.a * d, c.n = a.n * d, c.s = a.s * d, c.m = a.m * 
      d, c.l = a.l * d, c.o = a.o * d);
      return c
    };
    b.prototype.D = function(a) {
      return b.D(this, a, this)
    };
    b.G = function(a, d, c) {
      c || (c = new b);
      d instanceof b ? (c.g = a.g / d.g, c.f = a.f / d.f, c.b = a.b / d.b, c.p = a.p / d.p, c.i = a.i / d.i, c.d = a.d / d.d, c.c = a.c / d.c, c.q = a.q / d.q, c.h = a.h / d.h, c.e = a.e / d.e, c.a = a.a / d.a, c.n = a.n / d.n, c.s = a.s / d.s, c.m = a.m / d.m, c.l = a.l / d.l, c.o = a.o / d.o) : (d = 1 / d, c.g = a.g * d, c.f = a.f * d, c.b = a.b * d, c.p = a.p * d, c.i = a.i * d, c.d = a.d * d, c.c = a.c * d, c.q = a.q * d, c.h = a.h * d, c.e = a.e * d, c.a = a.a * d, c.n = a.n * d, c.s = a.s * 
      d, c.m = a.m * d, c.l = a.l * d, c.o = a.o * d);
      return c
    };
    b.prototype.G = function(a) {
      return b.G(this, a, this)
    };
    b.ka = function(a, d, f) {
      f || (f = new b);
      if(f === a || f === d) {
        return c.copy(b.ka(a, d), f)
      }
      f.g = a.g * d.g + a.i * d.f + a.h * d.b + a.s * d.p;
      f.f = a.f * d.g + a.d * d.f + a.e * d.b + a.m * d.p;
      f.b = a.b * d.g + a.c * d.f + a.a * d.b + a.l * d.p;
      f.p = a.p * d.g + a.q * d.f + a.n * d.b + a.o * d.p;
      f.i = a.g * d.i + a.i * d.d + a.h * d.c + a.s * d.q;
      f.d = a.f * d.i + a.d * d.d + a.e * d.c + a.m * d.q;
      f.c = a.b * d.i + a.c * d.d + a.a * d.c + a.l * d.q;
      f.q = a.p * d.i + a.q * d.d + a.n * d.c + a.o * d.q;
      f.h = a.g * d.h + a.i * d.e + a.h * d.a + a.s * d.n;
      f.e = a.f * d.h + a.d * d.e + a.e * d.a + a.m * d.n;
      f.a = a.b * d.h + a.c * d.e + a.a * d.a + a.l * d.n;
      f.n = a.p * d.h + a.q * d.e + a.n * d.a + a.o * d.n;
      f.s = a.g * d.s + a.i * d.m + a.h * d.l + a.s * d.o;
      f.m = a.f * d.s + a.d * d.m + a.e * d.l + a.m * d.o;
      f.l = a.b * d.s + a.c * d.m + a.a * d.l + a.l * d.o;
      f.o = a.p * d.s + a.q * d.m + a.n * d.l + a.o * d.o;
      return f
    };
    b.prototype.ka = function(a) {
      return b.ka(this, a, this)
    };
    b.Ia = function(a, d) {
      d || (d = new b);
      if(d === a) {
        return c.copy(b.Ia(a), d)
      }
      d.g = a.g;
      d.f = a.i;
      d.b = a.h;
      d.p = a.s;
      d.i = a.f;
      d.d = a.d;
      d.c = a.e;
      d.q = a.m;
      d.h = a.b;
      d.e = a.c;
      d.a = a.a;
      d.n = a.l;
      d.s = a.p;
      d.m = a.q;
      d.l = a.n;
      d.o = a.o;
      return d
    };
    b.prototype.Ia = function() {
      return b.Ia(this, this)
    };
    b.ma = function(a, d) {
      d || (d = new b);
      if(d === a) {
        return c.copy(b.ma(a), d)
      }
      var f = a.sf();
      Math.abs(f) < e.Qc && n({name:"Singular Matrix", message:"The matrix is singular and cannot be inverted."});
      f = 1 / f;
      d.g = (a.d * (a.a * a.o - a.l * a.n) - a.e * (a.c * a.o - a.l * a.q) + a.m * (a.c * a.n - a.a * a.q)) * f;
      d.f = (a.f * (a.l * a.n - a.a * a.o) - a.e * (a.l * a.p - a.b * a.o) + a.m * (a.a * a.p - a.b * a.n)) * f;
      d.b = (a.f * (a.c * a.o - a.l * a.q) - a.d * (a.b * a.o - a.l * a.p) + a.m * (a.b * a.q - a.c * a.p)) * f;
      d.p = (a.f * (a.a * a.q - a.c * a.n) - a.d * (a.a * a.p - a.b * a.n) + a.e * (a.c * a.p - a.b * a.q)) * f;
      d.i = (a.i * (a.l * a.n - a.a * a.o) - a.h * (a.l * a.q - a.c * a.o) + a.s * (a.a * a.q - a.c * a.n)) * f;
      d.d = (a.g * (a.a * a.o - a.l * a.n) - a.h * (a.b * a.o - a.l * a.p) + a.s * (a.b * a.n - a.a * a.p)) * f;
      d.c = (a.g * (a.l * a.q - a.c * a.o) - a.i * (a.l * a.p - a.b * a.o) + a.s * (a.c * a.p - a.b * a.q)) * f;
      d.q = (a.g * (a.c * a.n - a.a * a.q) - a.i * (a.b * a.n - a.a * a.p) + a.h * (a.b * a.q - a.c * a.p)) * f;
      d.h = (a.i * (a.e * a.o - a.m * a.n) - a.h * (a.d * a.o - a.m * a.q) + a.s * (a.d * a.n - a.e * a.q)) * f;
      d.e = (a.g * (a.m * a.n - a.e * a.o) - a.h * (a.m * a.p - a.f * a.o) + a.s * (a.e * a.p - a.f * a.n)) * f;
      d.a = (a.g * (a.d * a.o - a.m * a.q) - a.i * (a.f * a.o - a.m * a.p) + a.s * (a.f * a.q - a.d * a.p)) * f;
      d.n = (a.g * (a.e * a.q - a.d * a.n) - a.i * (a.e * a.p - a.f * a.n) + a.h * (a.d * a.p - a.f * a.q)) * f;
      d.s = (a.i * (a.m * a.a - a.e * a.l) - a.h * (a.m * a.c - a.d * a.l) + a.s * (a.e * a.c - a.d * a.a)) * f;
      d.m = (a.g * (a.e * a.l - a.m * a.a) - a.h * (a.f * a.l - a.m * a.b) + a.s * (a.f * a.a - a.e * a.b)) * f;
      d.l = (a.g * (a.m * a.c - a.d * a.l) - a.i * (a.m * a.b - a.f * a.l) + a.s * (a.d * a.b - a.f * a.c)) * f;
      d.o = (a.g * (a.d * a.a - a.e * a.c) - a.i * (a.f * a.a - a.e * a.b) + a.h * (a.f * a.c - a.d * a.b)) * f;
      return d
    };
    b.prototype.ma = function() {
      return b.ma(this, this)
    };
    b.prototype.sf = function() {
      return this.g * (this.d * this.a * this.o + this.e * this.l * this.q + this.m * this.c * this.n - this.m * this.a * this.q - this.e * this.c * this.o - this.d * this.l * this.n) - this.i * (this.f * this.a * this.o + this.e * this.l * this.p + this.m * this.b * this.n - this.m * this.a * this.p - this.e * this.b * this.o - this.f * this.l * this.n) + this.h * (this.f * this.c * this.o + this.d * this.l * this.p + this.m * this.b * this.q - this.m * this.c * this.p - this.d * this.b * this.o - 
      this.f * this.l * this.q) - this.s * (this.f * this.c * this.n + this.d * this.a * this.p + this.e * this.b * this.q - this.e * this.c * this.p - this.d * this.b * this.n - this.f * this.a * this.q)
    };
    b.prototype.pb = function() {
      return this.set(b.ic)
    };
    b.prototype.Vl = function(a) {
      this.s = a.x;
      this.m = a.y;
      this.l = a.j
    };
    b.prototype.bl = function(a) {
      a.x = this.s;
      a.y = this.m;
      a.j = this.l
    };
    b.prototype.Tl = function(a) {
      this.g *= a.x;
      this.f *= a.y;
      this.b *= a.j;
      this.i *= a.x;
      this.d *= a.y;
      this.c *= a.j;
      this.h *= a.x;
      this.e *= a.y;
      this.a *= a.j
    };
    b.prototype.ef = function(a) {
      var b = a.x, c = a.y, g = a.j, e = a.qa;
      a.x = this.g * b + this.i * c + this.h * g + this.s * e;
      a.y = this.f * b + this.d * c + this.e * g + this.m * e;
      a.j = this.b * b + this.c * c + this.a * g + this.l * e;
      a.qa = this.p * b + this.q * c + this.n * g + this.o * e;
      return a
    };
    b.prototype.Wj = function(a) {
      var b = a.x, c = a.y, g = a.j;
      a.x = this.g * b + this.i * c + this.h * g + this.s;
      a.y = this.f * b + this.d * c + this.e * g + this.m;
      a.j = this.b * b + this.c * c + this.a * g + this.l
    };
    b.prototype.ff = function(a) {
      var b = a.x, c = a.y, g = a.j;
      a.x = this.g * b + this.i * c + this.h * g;
      a.y = this.f * b + this.d * c + this.e * g;
      a.j = this.b * b + this.c * c + this.a * g
    };
    return b
  });
  l("goo/util/Handy", [], function() {
    function e() {
    }
    e.ap = function(c) {
      var b, a;
      Object.freeze(c);
      for(a in c) {
        b = c[a], c.hasOwnProperty(a) && !(typeof b !== "object" || Object.isFrozen(b)) && deepFreeze(b)
      }
    };
    e.defineProperty = function(c, b, a, d) {
      var f = a;
      Object.defineProperty(c, b, {get:function() {
        return f
      }, set:function(a) {
        f = a;
        d(f)
      }, configurable:!0, enumerable:!0})
    };
    e.Ua = function(c, b, a, d) {
      var f = c[b];
      Object.defineProperty(c, b, {get:function() {
        a && a();
        return f
      }, set:function(a) {
        f = a;
        d && d(f)
      }, configurable:!0, enumerable:!0})
    };
    return e
  });
  l("goo/math/Transform", ["goo/math/Vector3", "goo/math/Matrix3x3", "goo/math/Matrix4x4", "goo/util/Handy"], function(e, c, b, a) {
    function d() {
      this.M = new b;
      this.t = new e;
      this.rotation = new c;
      this.scale = new e(1, 1, 1);
      this.Jb = !1;
      var d = this;
      a.Ua(this, "rotation", q, function() {
        d.rotation.x = 0;
        d.rotation.y = 0;
        d.rotation.j = 0;
        a.Ua(d.rotation, "x", q, function() {
          d.Jb = !0
        });
        a.Ua(d.rotation, "y", q, function() {
          d.Jb = !0
        });
        a.Ua(d.rotation, "z", q, function() {
          d.Jb = !0
        })
      });
      this.rotation.x = 0;
      this.rotation.y = 0;
      this.rotation.j = 0;
      a.Ua(this.rotation, "x", q, function() {
        d.Jb = !0
      });
      a.Ua(this.rotation, "y", q, function() {
        d.Jb = !0
      });
      a.Ua(this.rotation, "z", q, function() {
        d.Jb = !0
      });
      this.ti = new e;
      this.Be = new c;
      this.cg = new c
    }
    d.prototype.multiply = function(a, d) {
      b.ka(a.M, d.M, this.M);
      this.Be.copy(a.rotation).Pf(a.scale, this.Be);
      this.cg.copy(d.rotation).Pf(d.scale, this.cg);
      c.ka(this.Be, this.cg, this.rotation);
      this.t.copy(d.t);
      this.Be.ef(this.t).add(a.t);
      this.scale.copy(a.scale).D(d.scale)
    };
    d.prototype.pb = function() {
      this.M.pb();
      this.t.copy(e.ZERO);
      this.rotation.pb();
      this.scale.copy(e.ONE)
    };
    d.prototype.Vj = function(a, b) {
      b.copy(a);
      this.M.Wj(b)
    };
    d.prototype.update = function() {
      if(this.Jb) {
        this.rotation.Ok(this.rotation.x, this.rotation.y, this.rotation.j), this.Jb = !1
      }
      var a = this.M, b = this.rotation;
      a.g = this.scale.x * b.g;
      a.i = this.scale.y * b.i;
      a.h = this.scale.j * b.h;
      a.f = this.scale.x * b.f;
      a.d = this.scale.y * b.d;
      a.e = this.scale.j * b.e;
      a.b = this.scale.x * b.b;
      a.c = this.scale.y * b.c;
      a.a = this.scale.j * b.a;
      a.p = 0;
      a.q = 0;
      a.n = 0;
      a.s = this.t.x;
      a.m = this.t.y;
      a.l = this.t.j;
      a.o = 1
    };
    d.prototype.copy = function(a) {
      this.M.copy(a.M);
      this.t.copy(a.t);
      this.rotation.copy(a.rotation);
      this.scale.copy(a.scale)
    };
    d.prototype.re = function(a, b) {
      this.ti.copy(this.t).sub(a).normalize();
      this.rotation.re(this.ti, b)
    };
    d.prototype.ma = function(a) {
      a || (a = new d);
      a.M.copy(this.M);
      a.M.ma();
      var b = a.rotation.copy(this.rotation);
      b.Pf(this.scale, b).ma();
      a.t.copy(this.t);
      a.rotation.ef(a.t).ma();
      return a
    };
    d.prototype.toString = function() {
      return"" + this.M
    };
    return d
  });
  l("goo/entities/components/Component", [], function() {
    return function() {
      this.enabled = !0
    }
  });
  l("goo/entities/components/TransformComponent", ["goo/math/Transform", "goo/entities/components/Component"], function(e, c) {
    function b() {
      this.type = "TransformComponent";
      this.parent = r;
      this.children = [];
      this.transform = new e;
      this.Oc = new e;
      this.Od = !0;
      this.fd = !1
    }
    b.prototype = Object.create(c.prototype);
    b.prototype.yd = function() {
      this.Od = !0
    };
    b.prototype.Zj = function(a) {
      a === this ? console.warn("attachChild: An object can't be added as a child of itself.") : (a.parent && a.parent.zk(a), a.parent = this, this.children.push(a))
    };
    b.prototype.zk = function(a) {
      if(a === this) {
        console.warn("attachChild: An object can't be removed from itself.")
      }else {
        var b = this.children.indexOf(a);
        if(b !== -1) {
          a.parent = r, this.children.splice(b, 1)
        }
      }
    };
    b.prototype.tm = function() {
      this.transform.update()
    };
    b.prototype.De = function() {
      this.parent ? this.Oc.multiply(this.parent.Oc, this.transform) : this.Oc.copy(this.transform);
      this.Od = !1;
      this.fd = !0
    };
    return b
  });
  l("goo/entities/World", ["goo/entities/Entity", "goo/entities/managers/EntityManager", "goo/entities/components/TransformComponent"], function(e, c, b) {
    function a() {
      this.bd = [];
      this.ed = [];
      this.Lg = [];
      this.Mg = [];
      this.Ij = [];
      this.ac = new c;
      this.Xf(this.ac);
      this.ya = 0;
      this.Mc = 1
    }
    a.ya = 0;
    a.prototype.Xf = function(a) {
      this.bd.push(a)
    };
    a.prototype.Xk = function() {
      for(var a in this.bd) {
        var b = this.bd[a];
        if(b.type === q) {
          return b
        }
      }
    };
    a.prototype.ec = function(a) {
      this.ed.push(a)
    };
    a.prototype.ie = function(a) {
      a = new e(this, a);
      a.Z(new b);
      return a
    };
    a.prototype.Df = function() {
      return this.ac.Df()
    };
    a.prototype.Sj = function(a) {
      this.Lg.push(a)
    };
    a.prototype.ih = function(a, b, c) {
      a = {wc:a};
      if(b !== q) {
        a.kk = b
      }
      if(c !== q) {
        a.Bf = c
      }
      this.Mg.push(a)
    };
    a.prototype.Pa = function() {
      this.mc(this.Lg, function(a, b) {
        a.rc && a.rc(b);
        if(a.bh) {
          for(var d in b.Bb) {
            a.bh(0, b.Bb[d])
          }
        }
      });
      this.mc(this.Mg, function(a, b) {
        a.nf && a.nf(b.wc);
        if(b.Bf !== q && a[b.Bf]) {
          a[b.Bf](b.wc, b.kk)
        }
      });
      this.mc(this.Ij, function(a, b) {
        a.Gc && a.Gc(b);
        if(a.di) {
          for(var d in b.Bb) {
            a.di(0, b.Bb[d])
          }
        }
      });
      for(var a in this.ed) {
        var b = this.ed[a];
        b.Jp || b.Gj(this.Mc)
      }
    };
    a.prototype.mc = function(a, b) {
      for(var c in a) {
        var e = a[c], h;
        for(h in this.bd) {
          b(this.bd[h], e)
        }
        for(var k in this.ed) {
          b(this.ed[k], e)
        }
      }
      a.length = 0
    };
    return a
  });
  l("goo/entities/systems/System", [], function() {
    function e(c, b) {
      this.type = c;
      this.rd = b;
      this.zb = []
    }
    e.prototype.rc = function(c) {
      this.mc(c)
    };
    e.prototype.nf = function(c) {
      this.mc(c)
    };
    e.prototype.Gc = function(c) {
      var b = this.zb.indexOf(c);
      b !== -1 && (this.zb.splice(b, 1), this.nd && this.nd(c))
    };
    e.prototype.mc = function(c) {
      var b = this.rd === r;
      if(!b && this.rd.length <= c.Bb.length) {
        var b = !0, a;
        for(a in this.rd) {
          if(!c[this.rd[a].charAt(0).toLowerCase() + this.rd[a].substr(1)]) {
            b = !1;
            break
          }
        }
      }
      a = this.zb.indexOf(c);
      b && a === -1 ? (this.zb.push(c), this.Jf && this.Jf(c)) : !b && a !== -1 && (this.zb.splice(a, 1), this.nd && this.nd(c))
    };
    e.prototype.Gj = function(c) {
      this.Pa && this.Pa(this.zb, c)
    };
    return e
  });
  l("goo/entities/systems/TransformSystem", ["goo/entities/systems/System"], function(e) {
    function c() {
      e.call(this, "TransformSystem", ["TransformComponent"])
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Pa = function(b) {
      var a, d;
      for(a in b) {
        d = b[a].H, d.fd = !1, d.Od && d.tm()
      }
      for(a in b) {
        d = b[a].H, d.Od && this.De(d)
      }
    };
    c.prototype.De = function(b) {
      b.De();
      for(var a in b.children) {
        this.De(b.children[a])
      }
    };
    return c
  });
  l("goo/renderer/Loader", [], function() {
    function e() {
      this.crossOrigin = "anonymous"
    }
    e.prototype.nl = function(c) {
      var b, a = new Image;
      b = b !== q ? b : {};
      a.addEventListener("load", function() {
        console.log("Loaded image: " + c);
        a.kd = !0;
        b.mb && b.mb(a)
      }, !1);
      a.addEventListener("error", function() {
        b.Nb && b.Nb("Couldn't load URL [" + c + "]")
      }, !1);
      if(this.crossOrigin) {
        a.crossOrigin = this.crossOrigin
      }
      a.src = c;
      return a
    };
    return e
  });
  l("goo/math/Vector2", ["goo/math/Vector"], function(e) {
    function c() {
      e.call(this, 2);
      this.set(arguments.length !== 0 ? arguments : [0, 0])
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.fc([["x", "u", "s"], ["y", "v", "t"]]);
    c.ZERO = new c(0, 0);
    c.ONE = new c(1, 1);
    c.Jg = new c(1, 0);
    c.Md = new c(0, 1);
    c.add = function(b, a, d) {
      typeof b === "number" && (b = [b, b]);
      typeof a === "number" && (a = [a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 2 || a.length !== 2) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] + a[0];
      d.data[1] = b[1] + a[1];
      return d
    };
    c.prototype.add = function(b) {
      return c.add(this, b, this)
    };
    c.sub = function(b, a, d) {
      typeof b === "number" && (b = [b, b]);
      typeof a === "number" && (a = [a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 2 || a.length !== 2) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] - a[0];
      d.data[1] = b[1] - a[1];
      return d
    };
    c.prototype.sub = function(b) {
      return c.sub(this, b, this)
    };
    c.D = function(b, a, d) {
      typeof b === "number" && (b = [b, b]);
      typeof a === "number" && (a = [a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 2 || a.length !== 2) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] * a[0];
      d.data[1] = b[1] * a[1];
      return d
    };
    c.prototype.D = function(b) {
      return c.D(this, b, this)
    };
    c.G = function(b, a, d) {
      typeof b === "number" && (b = [b, b]);
      typeof a === "number" && (a = [a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 2 || a.length !== 2) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] / a[0];
      d.data[1] = b[1] / a[1];
      return d
    };
    c.prototype.G = function(b) {
      return c.G(this, b, this)
    };
    c.J = function(b, a) {
      typeof b === "number" && (b = [b, b]);
      typeof a === "number" && (a = [a, a]);
      var d = b.data || b, c = a.data || a;
      (d.length !== 2 || c.length !== 2) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      var g = 0;
      g += d[0] * c[0];
      g += d[1] * c[1];
      return g
    };
    c.prototype.J = function(b) {
      return c.J(this, b)
    };
    return c
  });
  l("goo/renderer/Texture", ["goo/renderer/Loader", "goo/math/Vector3", "goo/math/Vector2"], function(e, c, b) {
    function a(a, c, g, e) {
      this.Va = r;
      c = c || {};
      a && this.Rl(a, c, g, e);
      this.tb = c.tb || "Repeat";
      this.ub = c.ub || "Repeat";
      this.Na = c.Na || "Bilinear";
      this.Xa = c.Xa || "Trilinear";
      this.sc = c.sc || 1;
      this.u = c.u || "RGBA";
      this.type = c.type || "UnsignedByte";
      this.Za = "2D";
      this.Fc = new b(0, 0);
      this.repeat = new b(1, 1);
      this.Kb = c.Kb || !0;
      this.Fl = c.Fl || !1;
      this.yh = c.yh || !0;
      this.Rf = this.Nh = !1
    }
    a.prototype.Rl = function(a, b, c, e) {
      this.r = a;
      var h = a instanceof Array ? a[0] : a;
      if(h instanceof Uint8Array || h instanceof Uint16Array) {
        if(c = c || a.width, e = e || a.height, c !== q && e !== q) {
          if(this.r = {data:a}, this.r.width = c, this.r.height = e, this.r.Oh = !0, this.r.kd = !0, h instanceof Uint8Array) {
            b.type = "UnsignedByte"
          }else {
            if(h instanceof Uint16Array) {
              b.type = "UnsignedShort4444"
            }
          }
        }else {
          n("Data textures need width and height")
        }
      }else {
        if(a instanceof Array) {
          this.r = {data:a}
        }
      }
    };
    a.qg = "PositiveX,NegativeX,PositiveY,NegativeY,PositiveZ,NegativeZ".split(",");
    return a
  });
  l("goo/loaders/dds/DdsUtils", [], function() {
    function e() {
    }
    e.Dh = function(c) {
      for(var b = ["", "WEBKIT_", "MOZ_"], a = 0;a < b.length;a++) {
        var d = c.getExtension(b[a] + "WEBGL_compressed_texture_s3tc");
        if(d != r) {
          return d
        }
      }
      return r
    };
    e.isSupported = function(c) {
      return e.Dh(c) !== r
    };
    e.ye = function(c) {
      if(c === 0) {
        return 0
      }
      for(var b = 0;(c & 1) === 0;) {
        c >>= 1, b++, b > 32 && n("invalid mask!")
      }
      return b
    };
    e.na = function(c, b) {
      return(c & b) === b
    };
    e.Lb = function(c) {
      for(var b = [], a = 0;a < c.length;a++) {
        b[a] = c.charCodeAt(a)
      }
      return e.Kh(b)
    };
    e.Kh = function(c) {
      var b = 0;
      b |= (c[0] & 255) << 0;
      c.length > 1 && (b |= (c[1] & 255) << 8);
      c.length > 2 && (b |= (c[2] & 255) << 16);
      c.length > 3 && (b |= (c[3] & 255) << 24);
      return b
    };
    e.Ch = function(c) {
      switch(c) {
        case "Alpha":
          return 1;
        case "RGB":
          return 3;
        case "RGBA":
          return 4;
        case "Luminance":
          return 1;
        case "LuminanceAlpha":
          return 2;
        case "PrecompressedDXT1":
          return 1;
        case "PrecompressedDXT1A":
          return 1;
        case "PrecompressedDXT3":
          return 2;
        case "PrecompressedDXT5":
          return 2
      }
      return 0
    };
    e.Mk = function(c, b, a, d) {
      for(var f = new Uint8Array(c.length), b = b + 3 >> 2, a = a + 3 >> 2, g = e.Ch(d) * 8, i = 0;i < a;i++) {
        for(var h = a - i - 1, k = 0;k < b;k++) {
          var m = (h * b + k) * g, j = (i * b + k) * g;
          switch(d) {
            case "PrecompressedDXT1":
            ;
            case "PrecompressedDXT1A":
              f[m + 0] = c[j + 0];
              f[m + 1] = c[j + 1];
              f[m + 2] = c[j + 2];
              f[m + 3] = c[j + 3];
              f[m + 4] = c[j + 7];
              f[m + 5] = c[j + 6];
              f[m + 6] = c[j + 5];
              f[m + 7] = c[j + 4];
              break;
            case "PrecompressedDXT3":
              f[m + 0] = c[j + 6];
              f[m + 1] = c[j + 7];
              f[m + 2] = c[j + 4];
              f[m + 3] = c[j + 5];
              f[m + 4] = c[j + 2];
              f[m + 5] = c[j + 3];
              f[m + 6] = c[j + 0];
              f[m + 7] = c[j + 1];
              f[m + 8] = c[j + 8];
              f[m + 9] = c[j + 9];
              f[m + 10] = c[j + 10];
              f[m + 11] = c[j + 11];
              f[m + 12] = c[j + 15];
              f[m + 13] = c[j + 14];
              f[m + 14] = c[j + 13];
              f[m + 15] = c[j + 12];
              break;
            case "PrecompressedDXT5":
              f[m + 0] = c[j + 0], f[m + 1] = c[j + 1], e.Bh(f, m + 5, e.wh(e.Mh(c, j + 2))), e.Bh(f, m + 2, e.wh(e.Mh(c, j + 5))), f[m + 8] = c[j + 8], f[m + 9] = c[j + 9], f[m + 10] = c[j + 10], f[m + 11] = c[j + 11], f[m + 12] = c[j + 15], f[m + 13] = c[j + 14], f[m + 14] = c[j + 13], f[m + 15] = c[j + 12]
          }
        }
      }
      return f
    };
    e.Mh = function(c, b) {
      var a = 0;
      a |= (c[b + 0] & 255) << 0;
      a |= (c[b + 1] & 255) << 8;
      a |= (c[b + 2] & 255) << 16;
      return a
    };
    e.Bh = function(c, b, a) {
      c[b + 0] = a & 255;
      c[b + 1] = (a & 65280) >> 8;
      c[b + 2] = (a & 16711680) >> 16
    };
    e.yb = 7;
    e.wh = function(c) {
      for(var b = [], a = 0;a < 2;a++) {
        b.push([0, 0, 0, 0])
      }
      b[0][0] = c & e.yb;
      c >>= 3;
      b[0][1] = c & e.yb;
      c >>= 3;
      b[0][2] = c & e.yb;
      c >>= 3;
      b[0][3] = c & e.yb;
      c >>= 3;
      b[1][0] = c & e.yb;
      c >>= 3;
      b[1][1] = c & e.yb;
      c >>= 3;
      b[1][2] = c & e.yb;
      c >>= 3;
      b[1][3] = c & e.yb;
      c = 0;
      c |= b[1][0] << 0;
      c |= b[1][1] << 3;
      c |= b[1][2] << 6;
      c |= b[1][3] << 9;
      c |= b[0][0] << 12;
      c |= b[0][1] << 15;
      c |= b[0][2] << 18;
      c |= b[0][3] << 21;
      return c
    };
    return e
  });
  l("goo/loaders/dds/DdsLoader", ["goo/loaders/dds/DdsUtils"], function(e) {
    function c() {
      this.uf = this.vf = this.yf = this.zf = this.Af = this.xf = this.od = this.$b = 0
    }
    function b() {
      this.Dk = this.Ib = this.wf = this.Gk = this.vc = this.uc = this.od = this.$b = 0;
      this.ph = [];
      this.la = r;
      this.Hk = this.Fk = this.Ek = this.Hb = this.oh = 0
    }
    function a() {
      this.xh = !1;
      this.kb = 0;
      this.If = this.v = r;
      this.sd = []
    }
    function d() {
    }
    c.vb = 19;
    c.Gi = 1;
    c.Fi = 2;
    c.Hi = 4;
    c.Ji = 64;
    c.Nm = 512;
    c.Ii = 131072;
    c.ve = function(a) {
      var b = new c;
      b.$b = a[c.vb + 0];
      b.$b !== 32 && n("invalid pixel format size: " + b.$b);
      b.od = a[c.vb + 1];
      b.xf = a[c.vb + 2];
      b.Af = a[c.vb + 3];
      b.zf = a[c.vb + 4];
      b.yf = a[c.vb + 5];
      b.vf = a[c.vb + 6];
      b.uf = a[c.vb + 7];
      return b
    };
    b.Rm = 1;
    b.Tm = 2;
    b.Xm = 4;
    b.Vm = 8;
    b.Wm = 4096;
    b.Si = 131072;
    b.Um = 524288;
    b.Sm = 8388608;
    b.Pm = 8;
    b.Ri = 4194304;
    b.Qm = 4096;
    b.Ki = 512;
    b.Oi = 1024;
    b.Li = 2048;
    b.Pi = 4096;
    b.Mi = 8192;
    b.Qi = 16384;
    b.Ni = 32768;
    b.Om = 2097152;
    b.ve = function(a) {
      var d = new b;
      d.$b = a[1];
      d.$b !== 124 && n("invalid dds header size: " + d.$b);
      d.od = a[2];
      d.uc = a[3];
      d.vc = a[4];
      d.Gk = a[5];
      d.wf = a[6];
      d.Ib = a[7];
      d.Dk = a[8];
      for(var i = 0;i < d.ph.length;i++) {
        d.ph[i] = a[9 + i]
      }
      d.la = c.ve(a);
      d.oh = a[27];
      d.Hb = a[28];
      d.Ek = a[29];
      d.Fk = a[30];
      d.Hk = a[31];
      a = 1 + Math.ceil(Math.log(Math.max(d.uc, d.vc)) / Math.log(2));
      e.na(d.oh, b.Ri) ? e.na(d.od, b.Si) ? d.Ib !== a && console.warn("Got " + d.Ib + " mipmaps, expected " + a) : d.Ib = a : d.Ib = 1;
      return d
    };
    a.prototype.ek = function(a) {
      for(var b = this.v.vc, d = this.v.uc, c = 0, e = 0;e < this.v.Ib;e++) {
        c = a ? ~~((b + 3) / 4) * ~~((d + 3) / 4) * this.kb * 2 : ~~(b * d * this.kb / 8), this.sd.push(~~((c + 3) / 4) * 4), b = ~~(b / 2) > 1 ? ~~(b / 2) : 1, d = ~~(d / 2) > 1 ? ~~(d / 2) : 1
      }
    };
    d.lm = function(a, d) {
      if(e.na(d.v.Hb, b.Ki)) {
        var c = 0;
        e.na(d.v.Hb, b.Oi) && c++;
        e.na(d.v.Hb, b.Li) && c++;
        e.na(d.v.Hb, b.Pi) && c++;
        e.na(d.v.Hb, b.Mi) && c++;
        e.na(d.v.Hb, b.Qi) && c++;
        e.na(d.v.Hb, b.Ni) && c++;
        c !== 6 && n(Error("Cubemaps without all faces defined are not currently supported."));
        a.depth = c
      }else {
        a.depth = d.v.wf > 0 ? d.v.wf : 1
      }
    };
    d.Gl = function(a, b, d, c) {
      c.r.pe = !0;
      if(!d.xh) {
        return new Uint8Array(a.buffer, a.byteOffset + 0, b)
      }
      for(var k = d.v.vc, m = d.v.uc, b = new Uint8Array(b), j = 0, y = 0;y < d.v.Ib;y++) {
        for(var s = [], p = 0, o = d.sd[y];p < o;p++) {
          s.push(a[p + j])
        }
        s = e.Mk(s, k, m, c.u);
        b.set(s, j);
        j += s.length;
        k = ~~(k / 2) > 1 ? ~~(k / 2) : 1;
        m = ~~(m / 2) > 1 ? ~~(m / 2) : 1
      }
      return b
    };
    d.Hl = function(a, b, d, c, k, m, j, y) {
      for(var s = e.ye(j.v.la.zf), p = e.ye(j.v.la.yf), o = e.ye(j.v.la.vf), u = e.ye(j.v.la.uf), w = ~~(j.v.la.Af / 8), y = e.Ch(y.u) * 1, b = new Uint8Array(b), A = j.v.vc, v = j.v.uc, z = 0, t = 0, x = 0, D = [], x = 0;x < w;x++) {
        D.push(0)
      }
      for(var B = 0;B < j.v.Ib;B++) {
        for(var C = 0;C < v;C++) {
          for(var l = 0;l < A;l++) {
            for(x = 0;x < w;x++) {
              D[x] = a[t++]
            }
            var x = e.Kh(D), J = (x & j.v.la.zf) >> s, I = (x & j.v.la.yf) >> p, E = (x & j.v.la.vf) >> o, x = (x & j.v.la.uf) >> u;
            k ? b[z++] = x : c ? (b[z++] = J, m && (b[z++] = x)) : d && (b[z++] = J, b[z++] = I, b[z++] = E, m && (b[z++] = x))
          }
        }
        z += A * v * y;
        A = ~~(A / 2) > 1 ? ~~(A / 2) : 1;
        v = ~~(v / 2) > 1 ? ~~(v / 2) : 1
      }
      return b
    };
    d.El = function(a, b, i) {
      var h = b.v.la.od, k = e.na(h, c.Hi), m = e.na(h, c.Ji), j = e.na(h, c.Gi), y = e.na(h, c.Ii), h = e.na(h, c.Fi);
      a.type = "UnsignedByte";
      if(k) {
        var s = b.v.la.xf;
        s === e.Lb("DXT1") ? (b.kb = 4, console.info("DDS format: DXT1A"), a.u = "PrecompressedDXT1A") : s === e.Lb("DXT3") ? (console.info("DDS format: DXT3"), b.kb = 8, a.u = "PrecompressedDXT3") : s === e.Lb("DXT5") ? (console.info("DDS format: DXT5"), b.kb = 8, a.u = "PrecompressedDXT5") : s === e.Lb("DX10") ? n(Error("dxt10 LATC formats not supported currently: " + b.If.cp)) : s === e.Lb("DXT2") ? n("DXT2 is not supported.") : s === e.Lb("DXT4") ? n("DXT4 is not supported.") : n("unsupported compressed dds format found (" + 
        s + ")")
      }else {
        if(b.kb = b.v.la.Af, m) {
          j ? (console.info("DDS format: uncompressed rgba"), a.u = "RGBA") : (console.info("DDS format: uncompressed rgb "), a.u = "RGB")
        }else {
          if(y || j) {
            if(y && j) {
              console.info("DDS format: uncompressed LumAlpha"), a.u = "LuminanceAlpha"
            }else {
              if(y) {
                console.info("DDS format: uncompressed Lum"), a.u = "Luminance"
              }else {
                if(h) {
                  console.info("DDS format: uncompressed Alpha"), a.u = "Alpha"
                }
              }
            }
          }else {
            n(Error("unsupported uncompressed dds format found."))
          }
        }
      }
      b.ek(k);
      a.r.sl = b.sd;
      for(var p = s = 0;p < b.sd.length;p++) {
        s += b.sd[p]
      }
      for(var o = [], p = 0;p < a.r.depth;p++) {
        k ? o.push(d.Gl(i, s, b, a)) : (m || y || h) && o.push(d.Hl(i, s, m, y, h, j, b, a))
      }
      a.r.data = a.r.depth === 1 ? o[0] : o;
      a.r.jq = !0
    };
    d.prototype.load = function(c, g, i, h, k) {
      var m = new Int32Array(c, h + 0, 32);
      m[0] !== e.Lb("DDS ") && n("Not a dds file.");
      console.info("Reading DDS file.");
      var j = new a;
      j.xh = i;
      j.v = b.ve(m);
      j.If = j.v.la.xf === e.Lb("DX10") ? DdsHeaderDX10.ve(Int32Array.create(c, h + 128, 5)) : r;
      i = g.r;
      if(i == r) {
        i = {}, g.r = i
      }
      i.width = j.v.vc;
      i.height = j.v.uc;
      d.lm(i, j);
      m = 128 + (j.If ? 20 : 0);
      d.El(g, j, new Uint8Array(c, h + m, k - m));
      i.kb = j.kb;
      i.kd = !0;
      g.Rf = !0
    };
    d.Fg = !1;
    d.prototype.isSupported = function() {
      return d.Fg
    };
    d.prototype.toString = function() {
      return"DdsLoader"
    };
    return d
  });
  l("goo/util/SimpleResourceUtil", [], function() {
    function e() {
    }
    e.qk = function(c, b, a) {
      c[0]--;
      c[0] === 0 && b.mb(a)
    };
    e.ol = function(c, b, a, d, f, g) {
      var i = new XMLHttpRequest;
      i.open("GET", a[b], !0);
      i.onreadystatechange = function() {
        if(i.readyState === 4) {
          i.status >= 200 && i.status <= 299 ? (f[d[b]] = i.responseText, e.qk(c, g, f)) : g.Nb(i.statusText)
        }
      };
      i.send()
    };
    e.pp = function(c, b, a) {
      for(var d = [c.length], f = {}, g = 0, i = c.length;g < i;g++) {
        e.ol(d, g, c, b, f, a)
      }
    };
    e.ml = function(c, b) {
      var a = new XMLHttpRequest;
      a.open("GET", c);
      a.responseType = "arraybuffer";
      a.onload = function() {
        if(a.status !== 404) {
          b.mb(a.response)
        }else {
          a.onerror(r)
        }
      };
      a.onerror = function() {
        b.Nb(r)
      };
      a.send()
    };
    return e
  });
  l("goo/renderer/Util", [], function() {
    function e() {
    }
    e.Ah = function(c) {
      switch(c) {
        case "Byte":
          return 1;
        case "UnsignedByte":
          return 1;
        case "Short":
          return 2;
        case "UnsignedShort":
          return 2;
        case "Int":
          return 4;
        case "HalfFloat":
          return 2;
        case "Float":
          return 4;
        case "Double":
          return 8
      }
    };
    e.No = function(c) {
      for(var b = c.getError(), a = !1;b !== c.NO_ERROR;) {
        a = !0, b === c.INVALID_ENUM ? console.error("An unacceptable value is specified for an enumerated argument. The offending command is ignored and has no other side effect than to set the error flag.") : b === c.INVALID_VALUE ? console.error("A numeric argument is out of range. The offending command is ignored and has no other side effect than to set the error flag.") : b === c.INVALID_OPERATION ? console.error("The specified operation is not allowed in the current state. The offending command is ignored and has no other side effect than to set the error flag.") : 
        b === c.FRAMEBUFFER_COMPLETE ? console.error("The command is trying to render to or read from the framebuffer while the currently bound framebuffer is not framebuffer complete (i.e. the return value from glCheckFramebufferStatus is not GL_FRAMEBUFFER_COMPLETE). The offending command is ignored and has no other side effect than to set the error flag.") : b === c.OUT_OF_MEMORY && n("There is not enough memory left to execute the command. The state of the GL is undefined, except for the state of the error flags, after this error is recorded."), 
        b = c.getError()
      }
      a && n("Stopping due to error")
    };
    e.qe = function(c) {
      return(c & c - 1) === 0
    };
    e.Wh = function(c) {
      return Math.pow(2, Math.ceil(Math.log(c) / Math.log(2)))
    };
    e.Fa = function(c) {
      if(r === c || "object" != typeof c) {
        return c
      }
      if(c instanceof Uint8Array) {
        return c
      }
      if(c instanceof Date) {
        var b = new Date;
        b.setTime(c.getTime());
        return b
      }
      if(c instanceof Array) {
        for(var b = [], a = 0, d = c.length;a < d;++a) {
          b[a] = e.Fa(c[a])
        }
        return b
      }
      if(c instanceof Object) {
        b = {};
        for(a in c) {
          c.hasOwnProperty(a) && (b[a] = e.Fa(c[a]))
        }
        return b
      }
      n(Error("Unable to copy obj! Its type isn't supported."))
    };
    return e
  });
  l("goo/renderer/TextureCreator", ["goo/renderer/Loader", "goo/renderer/Texture", "goo/loaders/dds/DdsLoader", "goo/util/SimpleResourceUtil", "goo/renderer/Util"], function(e, c, b, a, d) {
    function f(a) {
      a = a || {};
      this.jg = a.jg !== q ? a.jg : !0;
      this.qi = {".dds":new b}
    }
    f.hd = {};
    f.sj = ".png";
    f.prototype.Mf = function(b) {
      var g = this, k;
      for(k in this.qi) {
        if(b.toLowerCase().indexOf(k, b.toLowerCase().length - k.length) !== -1) {
          var m = this.qi[k];
          console.log(k + " - " + m);
          if(!m || !m.isSupported()) {
            b = b.substring(0, b.length - k.length);
            b += f.sj;
            break
          }
          if(f.hd[b] !== q) {
            return f.hd[b]
          }
          var j = new c(d.Fa(f.sg.r));
          j.r.kd = !1;
          j.hb = b;
          a.ml(b, {mb:function(a) {
            m.load(a, j, g.jg, 0, a.byteLength);
            console.info("Loaded image: " + b)
          }, Nb:function(a) {
            console.warn("Error loading texture: " + b + " | " + a)
          }});
          return j
        }
      }
      if(f.hd[b] !== q) {
        return f.hd[b]
      }
      k = (new e).nl(b);
      k = new c(k);
      return f.hd[b] = k
    };
    var g = new Uint8Array([255, 255, 255, 255]);
    f.sg = new c(g, r, 1, 1);
    f.tg = new c([g, g, g, g, g, g], r, 1, 1);
    f.tg.Za = "CUBE";
    return f
  });
  l("goo/entities/EventHandler", [], function() {
    function e() {
    }
    e.Ec = [];
    e.tf = function() {
      arguments.length === 0 && n(Error("Event needs to specify a callback as first argument"));
      var c = arguments[0], b = Array.prototype.slice.call(arguments, 1), a;
      for(a in e.Ec) {
        var d = e.Ec[a];
        d[c] && d[c].apply(r, b)
      }
    };
    e.Ua = function(c) {
      e.Ec.indexOf(c) === -1 && e.Ec.push(c)
    };
    e.Qp = function(c) {
      c = e.Ec.indexOf(c);
      c !== -1 && e.Ec.splice(c, 1)
    };
    return e
  });
  l("goo/entities/systems/RenderSystem", ["goo/entities/systems/System", "goo/renderer/TextureCreator", "goo/renderer/Util", "goo/entities/EventHandler"], function(e, c, b, a) {
    function d(b) {
      e.call(this, "RenderSystem", r);
      this.vd = b;
      this.Ck = !0;
      this.B = r;
      this.Ma = [];
      var d = this;
      a.Ua({Ql:function(a) {
        d.B = a
      }, Vp:function(a) {
        d.Ma = a
      }})
    }
    d.prototype = Object.create(e.prototype);
    d.prototype.Vf = function(a) {
      a.ik(this.B);
      this.Ck && this.B && a.Vf(this.vd, this.B, this.Ma)
    };
    return d
  });
  l("goo/math/Vector4", ["goo/math/Vector"], function(e) {
    function c() {
      e.call(this, 4);
      this.set(arguments.length !== 0 ? arguments : [0, 0, 0, 0])
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.fc([["x", "r"], ["y", "g"], ["z", "b"], ["w", "a"]]);
    c.ZERO = new c(0, 0, 0, 0);
    c.ONE = new c(1, 1, 1, 1);
    c.Jg = new c(1, 0, 0, 0);
    c.Md = new c(0, 1, 0, 0);
    c.rj = new c(0, 0, 1, 0);
    c.Sn = new c(0, 0, 0, 1);
    c.add = function(b, a, d) {
      typeof b === "number" && (b = [b, b, b, b]);
      typeof a === "number" && (a = [a, a, a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 4 || a.length !== 4) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] + a[0];
      d.data[1] = b[1] + a[1];
      d.data[2] = b[2] + a[2];
      d.data[3] = b[3] + a[3];
      return d
    };
    c.prototype.add = function(b) {
      return c.add(this, b, this)
    };
    c.sub = function(b, a, d) {
      typeof b === "number" && (b = [b, b, b, b]);
      typeof a === "number" && (a = [a, a, a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 4 || a.length !== 4) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] - a[0];
      d.data[1] = b[1] - a[1];
      d.data[2] = b[2] - a[2];
      d.data[3] = b[3] - a[3];
      return d
    };
    c.prototype.sub = function(b) {
      return c.sub(this, b, this)
    };
    c.D = function(b, a, d) {
      typeof b === "number" && (b = [b, b, b, b]);
      typeof a === "number" && (a = [a, a, a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 4 || a.length !== 4) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] * a[0];
      d.data[1] = b[1] * a[1];
      d.data[2] = b[2] * a[2];
      d.data[3] = b[3] * a[3];
      return d
    };
    c.prototype.D = function(b) {
      return c.D(this, b, this)
    };
    c.G = function(b, a, d) {
      typeof b === "number" && (b = [b, b, b, b]);
      typeof a === "number" && (a = [a, a, a, a]);
      d || (d = new c);
      b = b.data || b;
      a = a.data || a;
      (b.length !== 4 || a.length !== 4) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      d.data[0] = b[0] / a[0];
      d.data[1] = b[1] / a[1];
      d.data[2] = b[2] / a[2];
      d.data[3] = b[3] / a[3];
      return d
    };
    c.prototype.G = function(b) {
      return c.G(this, b, this)
    };
    c.J = function(b, a) {
      typeof b === "number" && (b = [b, b, b, b]);
      typeof a === "number" && (a = [a, a, a, a]);
      var d = b.data || b, c = a.data || a;
      (d.length !== 4 || c.length !== 4) && n({name:"Illegal Arguments", message:"The arguments are of incompatible sizes."});
      var e = 0;
      e += d[0] * c[0];
      e += d[1] * c[1];
      e += d[2] * c[2];
      e += d[3] * c[3];
      return e
    };
    c.prototype.J = function(b) {
      return c.J(this, b)
    };
    c.prototype.Dc = function(b, a) {
      this.x = (1 - a) * this.x + a * b.x;
      this.y = (1 - a) * this.y + a * b.y;
      this.j = (1 - a) * this.j + a * b.j;
      this.qa = (1 - a) * this.qa + a * b.qa;
      return this
    };
    return c
  });
  l("goo/renderer/Plane", ["goo/math/Vector3"], function(e) {
    function c(b, a) {
      this.Oa = b || new e(0, 1, 0);
      this.da = a || 0
    }
    c.prototype.yi = function(b) {
      b = pseudoDistance(b);
      return b < 0 ? Side.Tc : b > 0 ? Side.Id : Side.fj
    };
    return c
  });
  l("goo/renderer/Camera", "goo/util/Handy,goo/math/Vector3,goo/math/Vector4,goo/math/Matrix4x4,goo/renderer/Plane,goo/math/MathUtils".split(","), function(e, c, b, a, d, f) {
    function g(b, f, k, m) {
      this.t = new c(0, 0, 0);
      this.O = new c(-1, 0, 0);
      this.P = new c(0, 1, 0);
      this.w = new c(0, 0, -1);
      e.defineProperty(this, "this._depthRangeNear", 0, function() {
        this.Nd = !0
      });
      e.defineProperty(this, "this._depthRangeFar", 1, function() {
        this.Nd = !0
      });
      this.Nd = !0;
      this.N = 1;
      this.Ra = 2;
      this.ga = -0.5;
      this.ia = this.ha = 0.5;
      this.fa = -0.5;
      this.Da = [];
      this.Ja = [];
      this.Ca = [];
      this.Ka = [];
      this.zo = 0;
      this.Bo = this.Ao = 1;
      this.xo = 0;
      this.so = 6;
      this.A = [];
      for(var j = 0;j < g.vg;j++) {
        this.A[j] = new d
      }
      this.af = new c;
      this.ud = g.Oe;
      this.Yg = this.Zg = this.df = this.cf = !0;
      this.oa = new a;
      this.U = new a;
      this.tp = new a;
      this.up = new a;
      this.yo = this.Nd = !0;
      this.to = 0;
      this.ji(b, f, k, m);
      this.Tf()
    }
    g.jc = 0;
    g.kc = 1;
    g.hc = 2;
    g.lc = 3;
    g.Rc = 4;
    g.Uc = 5;
    g.vg = 6;
    g.Oe = 0;
    g.Ne = 1;
    g.Mm = 2;
    g.Id = 0;
    g.Tc = 1;
    g.xg = 2;
    g.prototype.normalize = function() {
      this.O.normalize();
      this.P.normalize();
      this.w.normalize();
      onFrameChange()
    };
    g.prototype.ji = function(a, b, d, c) {
      if(a !== q && a !== r) {
        this.Nk = a
      }
      if(b !== q && b !== r) {
        this.ce = b
      }
      if(d !== q && d !== r) {
        this.Qf = d
      }
      if(c !== q && c !== r) {
        this.rh = c
      }
      a = Math.tan(this.Nk * f.ug * 0.5) * this.Qf;
      b = a * this.ce;
      this.ga = -b;
      this.ha = b;
      this.fa = -a;
      this.ia = a;
      this.N = this.Qf;
      this.Ra = this.rh;
      this.Xh()
    };
    g.prototype.re = function(a, b) {
      this.af.copy(a).sub(this.t).normalize();
      this.af.ta(this.w) || (this.w.copy(this.af), this.P.copy(b).normalize(), this.P.ta(c.ZERO) && this.P.copy(c.Md), this.O.copy(this.P).Yb(this.w).normalize(), this.O.ta(c.ZERO) && (this.w.x !== 0 ? this.O.set(this.w.y, -this.w.x, 0) : this.O.set(0, this.w.j, -this.w.y)), this.P.copy(this.w).Yb(this.O).normalize(), this.Tf())
    };
    g.prototype.update = function() {
      this.Nd = !0;
      this.Xh();
      this.Tf()
    };
    g.prototype.contains = function(a) {
      if(!a) {
        return g.Tc
      }
      for(var b = g.Tc, d = g.vg - 1;d >= 0;d--) {
        switch(a.yi(this.A[d])) {
          case g.Tc:
            return g.Id;
          case g.fj:
            b = g.xg
        }
      }
      return b
    };
    g.prototype.Xh = function() {
      if(this.ud === g.Oe) {
        var a = this.N * this.N, b = this.ha * this.ha, d = this.fa * this.fa, c = this.ia * this.ia, f = 1 / Math.sqrt(a + this.ga * this.ga);
        this.Da[0] = this.N * f;
        this.Da[1] = -this.ga * f;
        f = 1 / Math.sqrt(a + b);
        this.Ja[0] = -this.N * f;
        this.Ja[1] = this.ha * f;
        f = 1 / Math.sqrt(a + d);
        this.Ca[0] = this.N * f;
        this.Ca[1] = -this.fa * f;
        f = 1 / Math.sqrt(a + c);
        this.Ka[0] = -this.N * f;
        this.Ka[1] = this.ia * f
      }else {
        this.ud === g.Ne && (this.ha > this.ga ? (this.Da[0] = -1, this.Da[1] = 0, this.Ja[0] = 1) : (this.Da[0] = 1, this.Da[1] = 0, this.Ja[0] = -1), this.Ja[1] = 0, this.ia > this.fa ? (this.Ca[0] = -1, this.Ca[1] = 0, this.Ka[0] = 1) : (this.Ca[0] = 1, this.Ca[1] = 0, this.Ka[0] = -1), this.Ka[1] = 0)
      }
      this.Yg = this.Zg = this.df = !0
    };
    g.prototype.Tf = function() {
      var a = this.w.J(this.t), b = new c;
      b.x = this.O.x * this.Da[0];
      b.y = this.O.y * this.Da[0];
      b.j = this.O.j * this.Da[0];
      b.add([this.w.x * this.Da[1], this.w.y * this.Da[1], this.w.j * this.Da[1]]);
      this.A[g.jc].Oa.copy(b);
      this.A[g.jc].da = this.t.J(b);
      b.x = this.O.x * this.Ja[0];
      b.y = this.O.y * this.Ja[0];
      b.j = this.O.j * this.Ja[0];
      b.add([this.w.x * this.Ja[1], this.w.y * this.Ja[1], this.w.j * this.Ja[1]]);
      this.A[g.kc].Oa.copy(b);
      this.A[g.kc].da = this.t.J(b);
      b.x = this.P.x * this.Ca[0];
      b.y = this.P.y * this.Ca[0];
      b.j = this.P.j * this.Ca[0];
      b.add([this.w.x * this.Ca[1], this.w.y * this.Ca[1], this.w.j * this.Ca[1]]);
      this.A[g.hc].Oa.copy(b);
      this.A[g.hc].da = this.t.J(b);
      b.x = this.P.x * this.Ka[0];
      b.y = this.P.y * this.Ka[0];
      b.j = this.P.j * this.Ka[0];
      b.add([this.w.x * this.Ka[1], this.w.y * this.Ka[1], this.w.j * this.Ka[1]]);
      this.A[g.lc].Oa.copy(b);
      this.A[g.lc].da = this.t.J(b);
      if(this.ud === g.Ne) {
        this.ha > this.ga ? (this.A[g.jc].da = this.A[g.jc].Xb + this.ga, this.A[g.kc].da = this.A[g.kc].Xb - this.ha) : (this.A[g.jc].da = this.A[g.jc].Xb - this.ga, this.A[g.kc].da = this.A[g.kc].Xb + this.ha), this.fa > this.ia ? (this.A[g.lc].da = this.A[g.lc].Xb + this.ia, this.A[g.hc].da = this.A[g.hc].Xb - this.fa) : (this.A[g.lc].da = this.A[g.lc].Xb - this.ia, this.A[g.hc].da = this.A[g.hc].Xb + this.fa)
      }
      b.copy(this.w).ma();
      this.A[g.Rc].Oa.copy(b);
      this.A[g.Rc].da = -(a + this.Ra);
      this.A[g.Uc].Oa.copy(this.w);
      this.A[g.Uc].da = a + this.N;
      this.Yg = this.Zg = this.cf = !0
    };
    g.prototype.qm = function() {
      if(this.ud === g.Ne) {
        this.U.pb(), this.U.g = 2 / (this.ha - this.ga), this.U.d = 2 / (this.ia - this.fa), this.U.a = -2 / (this.Ra - this.N), this.U.s = -(this.ha + this.ga) / (this.ha - this.ga), this.U.m = -(this.ia + this.fa) / (this.ia - this.fa), this.U.l = -(this.Ra + this.N) / (this.Ra - this.N)
      }else {
        if(this.ud === g.Oe) {
          this.U.pb(), this.U.g = 2 * this.N / (this.ha - this.ga), this.U.d = 2 * this.N / (this.ia - this.fa), this.U.h = (this.ha + this.ga) / (this.ha - this.ga), this.U.e = (this.ia + this.fa) / (this.ia - this.fa), this.U.a = -(this.Ra + this.N) / (this.Ra - this.N), this.U.n = -1, this.U.l = -(2 * this.Ra * this.N) / (this.Ra - this.N), this.U.o = 0
        }
      }
    };
    g.prototype.om = function() {
      this.oa.pb();
      this.oa.g = -this.O.x;
      this.oa.i = -this.O.y;
      this.oa.h = -this.O.j;
      this.oa.f = this.P.x;
      this.oa.d = this.P.y;
      this.oa.e = this.P.j;
      this.oa.b = -this.w.x;
      this.oa.c = -this.w.y;
      this.oa.a = -this.w.j;
      this.oa.s = this.O.J(this.t);
      this.oa.m = -this.P.J(this.t);
      this.oa.l = this.w.J(this.t)
    };
    g.prototype.gk = function() {
      if(this.cf) {
        this.om(), this.cf = !1
      }
    };
    g.prototype.hk = function() {
      if(this.df) {
        this.qm(), this.df = !1
      }
    };
    g.prototype.cl = function() {
      this.gk();
      return this.oa
    };
    g.prototype.Zk = function() {
      this.hk();
      return this.U
    };
    g.prototype.toString = function() {
      return"com.ardor3d.renderer.Camera: loc - " + Arrays.toString(getLocation().dg(r)) + " dir - " + Arrays.toString(getDirection().dg(r)) + " up - " + Arrays.toString(getUp().dg(r)) + " left - " + Arrays.toString(getLeft().dg(r))
    };
    return g
  });
  l("goo/renderer/BoundingSphere", ["goo/math/Transform", "goo/math/Vector3", "goo/renderer/Camera"], function(e, c, b) {
    function a() {
      this.La = new c;
      this.Ha = 1;
      this.mo = 0
    }
    a.prototype.ok = function(a) {
      for(var b = new c, e = new c(Infinity, Infinity, Infinity), i = new c(-Infinity, -Infinity, -Infinity), h, k, m, j = 0;j < a.length;j += 3) {
        h = a[j + 0], k = a[j + 1], m = a[j + 2], e.x = h < e.x ? h : e.x, e.y = k < e.y ? k : e.y, e.j = m < e.j ? m : e.j, i.x = h > i.x ? h : i.x, i.y = k > i.y ? k : i.y, i.j = m > i.j ? m : i.j
      }
      e = i.add(e).G(2);
      for(j = i = 0;j < a.length;j += 3) {
        b.set(a[j], a[j + 1], a[j + 2]), h = b.sub(e).length(), h > i && (i = h)
      }
      this.Ha = i / 1;
      this.La.copy(e)
    };
    a.prototype.transform = function(b, c) {
      c === r && (c = new a);
      b.Vj(this.La, c.La);
      c.Ha = Math.abs(this.Bj(b.scale) * this.Ha);
      return c
    };
    a.prototype.yi = function(a) {
      a = this.Hj(a, this.La);
      return a < -this.Ha ? b.Tc : a > this.Ha ? b.Id : b.xg
    };
    a.prototype.Hj = function(a, b) {
      return a.Oa.x * b.x + a.Oa.y * b.y + a.Oa.j * b.j - a.da
    };
    a.prototype.Bj = function(a) {
      return Math.max(Math.abs(a.x), Math.max(Math.abs(a.y), Math.abs(a.j)))
    };
    a.prototype.toString = function() {
      return"[" + Math.round(this.La.x * 10) / 10 + "," + Math.round(this.La.y * 10) / 10 + "," + Math.round(this.La.j * 10) / 10 + "] - " + Math.round(this.Ha * 10) / 10
    };
    return a
  });
  l("goo/entities/components/MeshDataComponent", ["goo/renderer/BoundingSphere", "goo/entities/components/Component"], function(e, c) {
    function b(a) {
      this.type = "MeshDataComponent";
      this.Mb = a;
      this.Of = new e;
      this.gf = !0
    }
    b.prototype = Object.create(c.prototype);
    b.prototype.nk = function() {
      if(this.gf && this.Of !== r) {
        var a = this.Mb.K("POSITION");
        if(a !== q) {
          this.Of.ok(a), this.gf = !1
        }
      }
    };
    return b
  });
  l("goo/entities/components/MeshRendererComponent", ["goo/entities/components/Component"], function(e) {
    function c() {
      this.type = "MeshRendererComponent";
      this.W = [];
      this.sb = r;
      this.Pp = this.Mo = !1
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.im = function(b, a) {
      this.sb = b.transform(a, this.sb)
    };
    return c
  });
  l("goo/entities/systems/PartitioningSystem", ["goo/entities/systems/System", "goo/entities/EventHandler"], function(e, c) {
    function b() {
      e.call(this, "PartitioningSystem", ["MeshRendererComponent"]);
      this.dc = r;
      this.vd = [];
      this.B = r;
      var a = this;
      c.Ua({Ql:function(b) {
        a.B = b
      }})
    }
    b.prototype = Object.create(e.prototype);
    b.prototype.Jf = function(a) {
      this.dc && this.dc.rc(a)
    };
    b.prototype.nd = function(a) {
      this.dc && this.dc.Gc(a)
    };
    b.prototype.Pa = function(a) {
      this.vd.length = 0;
      this.dc && this.B && this.dc.Pa(this.B, a, this.vd)
    };
    return b
  });
  l("goo/renderer/BufferData", [], function() {
    return function(e, c) {
      this.data = e;
      this.target = c;
      this.Hf = r;
      this.xj = "StaticDraw";
      this.Ng = !1
    }
  });
  l("goo/renderer/BufferUtils", [], function() {
    function e() {
    }
    e.pf = function(c, b) {
      var a;
      b < 256 ? a = new Uint8Array(c) : b < 65536 ? a = new Uint16Array(c) : n(Error("Maximum number of vertices is 65535. Got: " + b));
      return a
    };
    return e
  });
  l("goo/renderer/MeshData", ["goo/renderer/BufferData", "goo/renderer/Util", "goo/renderer/BufferUtils"], function(e, c, b) {
    function a(b, c, d) {
      this.ib = b;
      this.za = c !== q ? c : 0;
      this.bc = d !== q ? d : 0;
      this.qd = this.Bc = this.gc = r;
      this.cc = ["Triangles"];
      this.type = a.Cg;
      this.Il(this.za, this.bc)
    }
    function d(a) {
      for(var b = {}, d = 0;d < a.length;d++) {
        var f = a[d];
        i[f] !== q ? b[f] = c.Fa(i[f]) : n("No default attribute named: " + f)
      }
      return b
    }
    var f = window.Wn;
    a.Cg = 0;
    a.jj = 1;
    a.prototype.Il = function(a, b) {
      this.Kl(a);
      this.Jl(b)
    };
    a.prototype.Kl = function(a) {
      if(a !== q) {
        this.wo = this.za = a
      }
      var a = 0, b;
      for(b in this.ib) {
        var d = this.ib[b];
        a += c.Ah(d.type) * d.count
      }
      this.gc = new e(new ArrayBuffer(a * this.za), "ArrayBuffer");
      this.Pk()
    };
    a.prototype.Jl = function(a) {
      if(a !== q) {
        this.bc = a
      }
      if(this.bc > 0) {
        a = b.pf(this.bc, this.za), this.Bc = new e(a, "ElementArrayBuffer")
      }
    };
    var g = {Cm:Int8Array, Zn:Uint8Array, $n:f, Bn:Int16Array, bo:Uint16Array, gn:Int32Array, ao:Uint32Array, bn:Float32Array, $m:Float64Array};
    a.prototype.Pk = function() {
      var a = this.gc.data, b, d = 0, f;
      for(f in this.ib) {
        var e = this.ib[f];
        e.Fc = d;
        var i = this.za * e.count;
        d += i * c.Ah(e.type);
        var p = g[e.type];
        p ? b = new p(a, e.Fc, i) : n("Unsupported DataType: " + e.type);
        this.ib[f].Xj = b
      }
    };
    a.prototype.K = function(a) {
      return this.ib[a].Xj
    };
    a.prototype.va = function() {
      return this.Bc !== r ? this.Bc.data : r
    };
    a.F = "POSITION";
    a.Q = "NORMAL";
    a.Sb = "COLOR";
    a.Vc = "TANGENT";
    a.I = "TEXCOORD0";
    a.Gg = "TEXCOORD1";
    a.Hg = "TEXCOORD2";
    a.Gn = "TEXCOORD3";
    a.Ue = "WEIGHTS";
    a.yg = "JOINTIDS";
    a.createAttribute = function(a, b) {
      return{count:a, type:b}
    };
    var i = {POSITION:a.createAttribute(3, "Float"), NORMAL:a.createAttribute(3, "Float"), COLOR:a.createAttribute(4, "Float"), TANGENT:a.createAttribute(4, "Float"), TEXCOORD0:a.createAttribute(2, "Float"), TEXCOORD1:a.createAttribute(2, "Float"), TEXCOORD2:a.createAttribute(2, "Float"), TEXCOORD3:a.createAttribute(2, "Float"), WEIGHTS:a.createAttribute(4, "Float"), JOINTIDS:a.createAttribute(4, "Short")};
    a.ld = function(a) {
      return a === q ? d(Object.keys(i)) : d(a)
    };
    return a
  });
  l("goo/renderer/RendererRecord", [], function() {
    function e() {
      this.jd = {ArrayBuffer:{buffer:r, Ee:!1}, ElementArrayBuffer:{buffer:r, Ee:!1}};
      this.lh = r;
      this.Oo = this.Po = !1;
      this.Qo = [];
      this.dp = 0;
      this.gq = !1;
      this.$o = 0;
      this.Ae = [];
      this.xi = r;
      this.eh = [];
      this.xk = {};
      this.uk = {};
      this.bk = {};
      this.wl = {}
    }
    e.prototype.kl = function(c) {
      this.jd[c].buffer = r;
      this.jd[c].Ee = !1
    };
    return e
  });
  l("goo/renderer/pass/RenderTarget", ["goo/math/Vector2"], function(e) {
    function c(b, a, c) {
      this.Rd = this.Qg = this.Va = r;
      this.width = b;
      this.height = a;
      c = c || {};
      this.tb = c.tb !== q ? c.tb : "EdgeClamp";
      this.ub = c.ub !== q ? c.ub : "EdgeClamp";
      this.Na = c.Na !== q ? c.Na : "Bilinear";
      this.Xa = c.Xa !== q ? c.Xa : "Trilinear";
      this.sc = c.sc !== q ? c.sc : 1;
      this.Fc = new e(0, 0);
      this.repeat = new e(1, 1);
      this.u = c.u !== q ? c.u : "RGBA";
      this.type = c.type !== q ? c.type : "UnsignedByte";
      this.Za = "2D";
      this.Fb = c.Fb !== q ? c.Fb : !0;
      this.Pb = c.Pb !== q ? c.Pb : !0;
      this.Kb = !1
    }
    c.prototype.Fa = function() {
      var b = new c(this.width, this.height);
      b.tb = this.tb;
      b.ub = this.ub;
      b.Na = this.Na;
      b.sc = this.sc;
      b.Xa = this.Xa;
      b.Fc.copy(this.Fc);
      b.repeat.copy(this.repeat);
      b.u = this.u;
      b.type = this.type;
      b.Za = this.Za;
      b.Fb = this.Fb;
      b.Pb = this.Pb;
      b.Kb = this.Kb;
      return b
    };
    return c
  });
  l("goo/renderer/ShaderCall", [], function() {
    function e(a, b, c) {
      this.k = a;
      this.location = b;
      if(c) {
        switch(c) {
          case "float":
            this.Ya = this.uniform1f;
            break;
          case "bool":
          ;
          case "int":
          ;
          case "integer":
          ;
          case "sampler2D":
          ;
          case "sampler3D":
          ;
          case "samplerCube":
            this.Ya = this.uniform1i;
            break;
          case "floatarray":
            this.Ya = this.uniform1fv;
            break;
          case "intarray":
            this.Ya = this.uniform1iv;
            break;
          case "vec2":
            this.Ya = this.uniform2fv;
            break;
          case "vec3":
            this.Ya = this.uniform3fv;
            break;
          case "vec4":
            this.Ya = this.uniform4fv;
            break;
          case "mat2":
            this.Ya = this.uniformMatrix2fv;
            break;
          case "mat3":
            this.Ya = this.uniformMatrix3fv;
            break;
          case "mat4":
            this.Ya = this.uniformMatrix4fv;
            break;
          default:
            n("Uniform type not handled: " + c)
        }
      }
    }
    function c(a, b, c) {
      for(var e = !0, i = 0;i < c;i++) {
        if(Math.abs(a[i] - b[i]) > 1.0E-8) {
          e = !1;
          break
        }
      }
      return e
    }
    function b(a, b) {
      var c = a.length;
      if(c !== b.length) {
        return!1
      }
      for(var e = 0;e < c;e++) {
        if(a[e] !== b[e]) {
          return!1
        }
      }
      return!0
    }
    e.prototype.call = function(a) {
      this.Ya(a)
    };
    e.prototype.uniform1f = function(a) {
      if(this.location.value !== a) {
        this.k.uniform1f(this.location, a), this.location.value = a
      }
    };
    e.prototype.uniform1fv = function(a) {
      var c = this.location.value;
      if(!(c !== q && b(a, c))) {
        this.k.uniform1fv(this.location, a), this.location.value = a
      }
    };
    e.prototype.uniform1i = function(a) {
      if(this.location.value !== a) {
        this.k.uniform1i(this.location, a), this.location.value = a
      }
    };
    e.prototype.uniform1iv = function(a) {
      var c = this.location.value;
      if(!(c !== q && b(a, c))) {
        this.k.uniform1iv(this.location, a), this.location.value = a
      }
    };
    e.prototype.uniform2fv = function(a) {
      var c = this.location.value;
      if(!(c !== q && b(a, c))) {
        this.k.uniform2fv(this.location, a), this.location.value = a
      }
    };
    e.prototype.uniform3f = function(a, b, c) {
      var e = this.location.value;
      if(!(e !== q && e.length === 3 && e[0] === a && e[1] === b && e[2] === c)) {
        this.k.uniform3f(this.location, a, b, c), this.location.value = [a, b, c]
      }
    };
    e.prototype.uniform3fv = function(a) {
      var c = this.location.value;
      if(!(c !== q && b(a, c))) {
        this.k.uniform3fv(this.location, a), this.location.value = a
      }
    };
    e.prototype.uniform4f = function(a, b, c, e) {
      var i = this.location.value;
      if(!(i !== q && i.length === 4 && i[0] === a && i[1] === b && i[2] === c && i[3] === e)) {
        this.k.uniform4f(this.location, a, b, c, e), this.location.value = [a, b, c, e]
      }
    };
    e.prototype.uniform4fv = function(a) {
      var c = this.location.value;
      if(!(c !== q && b(a, c))) {
        this.k.uniform4fv(this.location, a), this.location.value = a
      }
    };
    e.prototype.uniformMatrix2fv = function(a, b) {
      b = b === !0;
      if(a.data) {
        var e = this.location.value;
        if(e !== q) {
          if(c(e.data, a.data, 4)) {
            return
          }else {
            e.copy(a)
          }
        }else {
          this.location.value = a.Fa()
        }
        this.k.uniformMatrix2fv(this.location, b, a.data)
      }else {
        this.k.uniformMatrix2fv(this.location, b, a)
      }
    };
    e.prototype.uniformMatrix3fv = function(a, b) {
      b = b === !0;
      if(a.data) {
        var e = this.location.value;
        if(e !== q) {
          if(c(e.data, a.data, 9)) {
            return
          }else {
            e.copy(a)
          }
        }else {
          this.location.value = a.Fa()
        }
        this.k.uniformMatrix3fv(this.location, b, a.data)
      }else {
        this.k.uniformMatrix3fv(this.location, b, a)
      }
    };
    e.prototype.uniformMatrix4fv = function(a, b) {
      b = b === !0;
      if(a.data) {
        var e = this.location.value;
        if(e !== q) {
          if(c(e.data, a.data, 16)) {
            return
          }else {
            e.copy(a)
          }
        }else {
          this.location.value = a.Fa()
        }
        this.k.uniformMatrix4fv(this.location, b, a.data)
      }else {
        this.k.uniformMatrix4fv(this.location, b, a)
      }
    };
    return e
  });
  l("goo/renderer/RenderQueue", ["goo/math/Vector3"], function(e) {
    function c() {
      var b = this, a = new e;
      this.xl = function(c, e) {
        var g = c.X.sb, i = e.X.sb, g = a.copy(b.B.t).sub(g.La).Cc(), i = a.copy(b.B.t).sub(i.La).Cc();
        return g - i
      };
      this.gm = function(c, e) {
        var g = c.X.sb, i = e.X.sb, g = a.copy(b.B.t).sub(g.La).Cc();
        return a.copy(b.B.t).sub(i.La).Cc() - g
      }
    }
    c.prototype.sort = function(b, a) {
      var d = 0;
      this.B = a;
      for(var e = {}, g = 0;g < b.length;g++) {
        var i = b[g];
        if(i.X) {
          var h = i.X.W[0].$k(), k = e[h];
          k || (k = [], e[h] = k);
          k.push(i)
        }else {
          b[d] = i, d++
        }
      }
      for(var m in e) {
        k = e[m];
        m <= c.Eg ? k.sort(this.xl) : k.sort(this.gm);
        for(g = 0;g < k.length;g++) {
          b[d] = k[g], d++
        }
      }
    };
    c.Am = 500;
    c.Eg = 1E3;
    c.Hn = 1500;
    c.pn = 2E3;
    return c
  });
  l("goo/renderer/Shader", "goo/renderer/ShaderCall,goo/renderer/Util,goo/math/Matrix4x4,goo/math/Vector3,goo/entities/World,goo/renderer/RenderQueue".split(","), function(e, c, b, a, d, f) {
    function g(a, b) {
      (!b.$ || !b.S) && n(Error("Missing shader sources for shader: " + a));
      this.name = a;
      this.Bd = b.$;
      this.ke = b.S;
      this.pa = r;
      this.de = {};
      this.gd = {};
      this.Ce = {};
      this.Ad = {};
      this.zd = [];
      this.rf = {};
      i(this.rf);
      this.qf = {};
      this.md = b.md;
      this.attributes = b.attributes;
      this.z = b.z;
      this.Hc = f.Eg;
      this.oc = g.id++
    }
    function i(c) {
      var e = new b;
      c[g.aa] = function(a, b) {
        var c = b.B.Zk();
        a.uniformMatrix4fv(c)
      };
      c[g.ba] = function(a, b) {
        var c = b.B.cl();
        a.uniformMatrix4fv(c)
      };
      c[g.ca] = function(a, b) {
        a.uniformMatrix4fv(b.transform !== q ? b.transform.M : e)
      };
      for(var f = 0;f < 16;f++) {
        c[g["TEXTURE" + f]] = function(a) {
          return function(b) {
            b.uniform1i(a)
          }
        }(f)
      }
      for(var i = new a(-20, 20, 20), f = 0;f < 4;f++) {
        c[g["LIGHT" + f]] = function(a) {
          return function(b, c) {
            var d = c.Ma[a];
            d !== q ? b.uniform3f(d.t.x, d.t.y, d.t.j) : b.uniform3f(i.x, i.y, i.j)
          }
        }(f)
      }
      c[g.Fd] = function(a, b) {
        var c = b.B.t;
        a.uniform3f(c.x, c.y, c.j)
      };
      c[g.Uc] = function(a, b) {
        a.uniform1f(b.B.N)
      };
      c[g.Rc] = function(a, b) {
        a.uniform1f(b.B.Ra)
      };
      var h = {nb:0.1, lb:0.1, jb:0.1, hb:1}, p = {nb:0, lb:0, jb:0, hb:0}, o = {nb:1, lb:1, jb:1, hb:1}, u = {nb:0.8, lb:0.8, jb:0.8, hb:1};
      c[g.Ed] = function(a, b) {
        var c = b.Wa.T !== q ? b.Wa.T.Tj : h;
        a.uniform4f(c.nb, c.lb, c.jb, c.hb)
      };
      c[g.Ti] = function(a, b) {
        var c = b.Wa.T !== q ? b.Wa.T.Ik : p;
        a.uniform4f(c.nb, c.lb, c.jb, c.hb)
      };
      c[g.Hd] = function(a, b) {
        var c = b.Wa.T !== q ? b.Wa.T.Gb : o;
        a.uniform4f(c.nb, c.lb, c.jb, c.hb)
      };
      c[g.Kd] = function(a, b) {
        var c = b.Wa.T !== q ? b.Wa.T.oi : u;
        a.uniform4f(c.nb, c.lb, c.jb, c.hb)
      };
      c[g.Ld] = function(a, b) {
        a.uniform1f(b.Wa.T !== q ? b.Wa.T.Zl : 8)
      };
      c[g.nj] = function(a) {
        a.uniform1f(d.ya)
      }
    }
    g.id = 0;
    var h = /\b(attribute|uniform)\s+(float|int|bool|vec2|vec3|vec4|mat3|mat4|sampler2D|sampler3D|samplerCube)\s+(\w+)(\s*\[\s*\w+\s*\])*;/g;
    g.prototype.apply = function(a, b) {
      var c = b.k, d = b.xa;
      this.pa === r && (this.zj(), this.Oj(this.md), this.compile(b));
      if(d.xi !== this.pa) {
        c.useProgram(this.pa), d.xi = this.pa
      }
      if(this.attributes) {
        var c = a.Mb.ib, e;
        for(e in this.attributes) {
          var f = c[this.attributes[e]];
          if(f) {
            var g = this.gd[e];
            g !== q && b.$j(g, f.count, f.type, f.xp, f.Fc, d)
          }
        }
      }
      if(this.z) {
        for(var u in this.z) {
          if(d = this.Ad[u]) {
            e = this.z[u];
            try {
              if(typeof e === "string") {
                var i = this.qf[u];
                i && i(d, a)
              }else {
                var h = typeof e === "function" ? e(a) : e;
                d.call(h)
              }
            }catch(v) {
            }
          }
        }
      }
    };
    g.prototype.Ob = function() {
      this.pa = r;
      this.de = {};
      this.gd = {};
      this.Ce = {};
      this.Ad = {};
      this.qf = {}
    };
    g.prototype.zj = function() {
      this.zd = [];
      this.Rg(this.Bd);
      this.Rg(this.ke)
    };
    g.prototype.Rg = function(a) {
      h.lastIndex = 0;
      for(var b = h.exec(a);b !== r;) {
        b = {type:b[1], u:b[2], hg:b[3], Yj:b[4]};
        if(b.Yj) {
          if(b.u === "float") {
            b.u = "floatarray"
          }else {
            if(b.u === "int") {
              b.u = "intarray"
            }
          }
        }
        "attribute" === b.type ? this.de[b.hg] = b : (b.u.indexOf("sampler") === 0 && this.zd.push({u:b.u, name:b.hg}), this.Ce[b.hg] = b);
        b = h.exec(a)
      }
    };
    g.prototype.compile = function(a) {
      var a = a.k, b = this.Pg(a, WebGLRenderingContext.VERTEX_SHADER, this.Bd), c = this.Pg(a, WebGLRenderingContext.FRAGMENT_SHADER, this.ke);
      (b === r || c === r) && console.error("Shader error - no shaders");
      this.pa = a.createProgram();
      var d = a.getError();
      (this.pa === r || d !== WebGLRenderingContext.NO_ERROR) && console.error("Shader error: " + d + " [shader: " + this.name + "]");
      a.attachShader(this.pa, b);
      a.attachShader(this.pa, c);
      a.linkProgram(this.pa);
      a.getProgramParameter(this.pa, WebGLRenderingContext.LINK_STATUS) || console.error("Could not initialise shaders: " + a.getProgramInfoLog(this.pa));
      for(var f in this.de) {
        b = a.getAttribLocation(this.pa, f), b === -1 ? console.warn("Attribute [" + this.de[f] + "/" + f + "] variable not found in shader. Probably unused and optimized away.") : this.gd[f] = b
      }
      for(f in this.Ce) {
        b = a.getUniformLocation(this.pa, f), b === r ? console.warn("Uniform [" + f + "] variable not found in shader. Probably unused and optimized away. " + f) : this.Ad[f] = new e(a, b, this.Ce[f].u)
      }
      if(this.attributes) {
        for(var g in this.attributes) {
          a = this.gd[g], a === q && console.warn("No attribute found for binding: " + g + " [" + this.name + "][" + this.oc + "]")
        }
        for(g in this.gd) {
          a = this.attributes[g], a === q && console.warn("No binding found for attribute: " + g + " [" + this.name + "][" + this.oc + "]")
        }
      }
      if(this.z) {
        if(this.z.Cd) {
          a = this.z.Cd instanceof Array ? this.z.Cd : [this.z.Cd];
          for(b = 0;b < a.length;b++) {
            for(f in c = a[b], c) {
              this.z[f] = c[f]
            }
          }
          delete this.z.Cd
        }
        for(g in this.z) {
          a = this.Ad[g], a === q && console.warn("No uniform found for binding: " + g + " [" + this.name + "][" + this.oc + "]"), f = this.z[g], this.rf[f] && (this.qf[g] = this.rf[f])
        }
        for(g in this.Ad) {
          a = this.z[g], a === q && console.warn("No binding found for uniform: " + g + " [" + this.name + "][" + this.oc + "]")
        }
      }
      console.log("Shader [" + this.name + "][" + this.oc + "] compiled")
    };
    g.prototype.Pg = function(a, b, c) {
      b = a.createShader(b);
      a.shaderSource(b, c);
      a.compileShader(b);
      return!a.getShaderParameter(b, WebGLRenderingContext.COMPILE_STATUS) ? (console.error("Shader [" + this.name + "][" + this.oc + "] " + a.getShaderInfoLog(b)), r) : b
    };
    g.prototype.Oj = function(a) {
      if(a) {
        a = this.Qk(a), this.Bd = a + "\n" + this.Bd, this.ke = a + "\n" + this.ke
      }
    };
    g.prototype.Qk = function(a) {
      var b = [], c;
      for(c in a) {
        var d = a[c];
        d !== !1 && b.push("#define " + c + " " + d)
      }
      return b.join("\n")
    };
    g.prototype.toString = function() {
      return this.name
    };
    g.aa = "PROJECTION_MATRIX";
    g.ba = "VIEW_MATRIX";
    g.ca = "WORLD_MATRIX";
    for(c = 0;c < 16;c++) {
      g["TEXTURE" + c] = "TEXTURE" + c
    }
    for(c = 0;c < 4;c++) {
      g["LIGHT" + c] = "LIGHT" + c
    }
    g.Fd = "CAMERA";
    g.Ed = "AMBIENT";
    g.Ti = "EMISSIVE";
    g.Hd = "DIFFUSE";
    g.Kd = "SPECULAR";
    g.Ld = "SPECULAR_POWER";
    g.Uc = "NEAR_PLANE";
    g.Rc = "FAR_PLANE";
    g.nj = "TIME";
    return g
  });
  l("goo/renderer/shaders/ShaderFragments", [], function() {
    function e() {
    }
    e.sh = {zh:{attributes:{}}};
    e.sp = {zp:"vec4 packDepth( const in float depth ) {\n\tconst vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );\n\tconst vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );\n\tvec4 res = fract( depth * bit_shift );\n\tres -= res.xxyz * bit_mask;\n\treturn res;\n}", iq:"float unpackDepth( const in vec4 rgba_depth ) {\n\tconst vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n\tfloat depth = dot( rgba_depth, bit_shift );\n\treturn depth;\n}"};
    return e
  });
  l("goo/renderer/Material", ["goo/renderer/Shader", "goo/renderer/TextureCreator", "goo/renderer/MeshData", "goo/renderer/shaders/ShaderFragments"], function(e, c, b, a) {
    function d(a) {
      this.name = a;
      this.ea = r;
      this.Lc = [];
      this.T = q;
      this.je = {enabled:!0, cullFace:"Back", frontFace:"CCW"};
      this.fe = {lf:"NoBlending"};
      this.yk = {enabled:!0, write:!0};
      this.Sf = {enabled:!1, Cf:1, eg:1};
      this.zi = !1;
      this.Hc = r
    }
    d.prototype.$k = function() {
      return this.Hc ? this.Hc : this.ea.Hc
    };
    d.Jc = {copy:{hl:[a.sh.zh], attributes:{Qa:b.F, Nc:b.I}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, opacity:1, tc:e.TEXTURE0}, $:"attribute vec3 vertexPosition;\nattribute vec2 vertexUV0;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nvarying vec2 texCoord0;\nvoid main(void) {\n\ttexCoord0 = vertexUV0;\n\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);\n}", S:"precision mediump float;\nuniform sampler2D diffuseMap;\nuniform float opacity;\nvarying vec2 texCoord0;\nvoid main(void)\n{\n\tgl_FragColor = vec4(texture2D(diffuseMap, texCoord0).rgb, opacity);\n}"}, 
    Uo:{hl:[a.sh.zh], attributes:{Qa:b.F, Nc:b.I}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, opacity:1, tc:e.TEXTURE0}, $:"attribute vec3 vertexPosition;\nattribute vec2 vertexUV0;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nvarying vec2 texCoord0;\nvoid main(void) {\n\ttexCoord0 = vertexUV0;\n\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);\n}", S:"precision mediump float;\nuniform sampler2D diffuseMap;\nuniform float opacity;\nvarying vec2 texCoord0;\nvoid main(void)\n{\n\tvec4 col = texture2D(diffuseMap, texCoord0);\n\tgl_FragColor = vec4(col.rgb, col.a * opacity);\n}"}, 
    am:{attributes:{Qa:b.F}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca}, $:"attribute vec3 vertexPosition;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nvoid main(void) {\n\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);\n}", S:"precision mediump float;\nvoid main(void)\n{\n\tgl_FragColor = vec4(1.0);\n}"}, bm:{attributes:{Qa:b.F}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, color:[1, 1, 1]}, $:"attribute vec3 vertexPosition;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nvoid main(void) {\n\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);\n}", 
    S:"precision mediump float;\nuniform vec3 color;\nvoid main(void)\n{\n\tgl_FragColor = vec4(color, 1.0);\n}"}, aq:{attributes:{Qa:b.F, ig:b.Q}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, gh:e.Fd, Ph:e.zg, Rh:e.Ed, Sh:e.Hd, Th:e.Kd, Uh:e.Ld}, $:"attribute vec3 vertexPosition;\nattribute vec3 vertexNormal;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nuniform vec3 cameraPosition;\nuniform vec3 lightPosition;\nvarying vec3 normal;\nvarying vec3 lightDir;\nvarying vec3 eyeVec;\nvoid main(void) {\n\tvec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);\n\tgl_Position = projectionMatrix * viewMatrix * worldPos;\n\tnormal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;\n\tlightDir = lightPosition - worldPos.xyz;\n\teyeVec = cameraPosition - worldPos.xyz;\n}", 
    S:"precision mediump float;\nuniform vec4 materialAmbient;\nuniform vec4 materialDiffuse;\nuniform vec4 materialSpecular;\nuniform float materialSpecularPower;\nvarying vec3 normal;\nvarying vec3 lightDir;\nvarying vec3 eyeVec;\nvoid main(void)\n{\n\tvec4 final_color = materialAmbient;\n\tvec3 N = normalize(normal);\n\tvec3 L = normalize(lightDir);\n\tfloat lambertTerm = dot(N,L)*0.75+0.25;\n\tif(lambertTerm > 0.0)\n\t{\n\t\tfinal_color += materialDiffuse * // gl_LightSource[0].diffuse * \n\t\t\tlambertTerm;\n\t\tvec3 E = normalize(eyeVec);\n\t\tvec3 R = reflect(-L, N);\n\t\tfloat specular = pow( max(dot(R, E), 0.0), materialSpecularPower);\n\t\tfinal_color += materialSpecular * // gl_LightSource[0].specular * \n\t\t\tspecular;\n\t\tfinal_color = clamp(final_color, vec4(0.0), vec4(1.0));\n\t}\n\tgl_FragColor = vec4(final_color.rgb, 1.0);\n}"}, 
    em:{attributes:{Qa:b.F, Nc:b.I}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, tc:e.TEXTURE0}, $:"attribute vec3 vertexPosition;\nattribute vec2 vertexUV0;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nvarying vec2 texCoord0;\nvoid main(void) {\ntexCoord0 = vertexUV0;\n\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);\n}", S:"precision mediump float;\nuniform sampler2D diffuseMap;\nvarying vec2 texCoord0;\nvoid main(void)\n{\n\tvec4 texCol = texture2D(diffuseMap, texCoord0);\n\tgl_FragColor = texCol;\n}"}, 
    si:{attributes:{Qa:b.F, ig:b.Q, Nc:b.I}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, gh:e.Fd, Ph:e.zg, tc:e.TEXTURE0, Rh:e.Ed, Sh:e.Hd, Th:e.Kd, Uh:e.Ld}, $:"attribute vec3 vertexPosition;\nattribute vec3 vertexNormal;\nattribute vec2 vertexUV0;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nuniform vec3 cameraPosition;\nuniform vec3 lightPosition;\nvarying vec3 normal;\nvarying vec3 lightDir;\nvarying vec3 eyeVec;\nvarying vec2 texCoord0;\nvoid main(void) {\n\tvec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);\n\tgl_Position = projectionMatrix * viewMatrix * worldPos;\n\tnormal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;\n\ttexCoord0 = vertexUV0;\n\tlightDir = lightPosition - worldPos.xyz;\n\teyeVec = cameraPosition - worldPos.xyz;\n}", 
    S:"precision mediump float;\nuniform sampler2D diffuseMap;\nuniform vec4 materialAmbient;\nuniform vec4 materialDiffuse;\nuniform vec4 materialSpecular;\nuniform float materialSpecularPower;\nvarying vec3 normal;\nvarying vec3 lightDir;\nvarying vec3 eyeVec;\nvarying vec2 texCoord0;\nvoid main(void)\n{\n\tvec4 texCol = texture2D(diffuseMap, texCoord0);\n\tvec4 final_color = materialAmbient;\n\tvec3 N = normalize(normal);\n\tvec3 L = normalize(lightDir);\n\tfloat lambertTerm = dot(N,L)*0.75+0.25;\n\tif(lambertTerm > 0.0)\n\t{\n\t\tfinal_color += materialDiffuse * // gl_LightSource[0].diffuse * \n\t\t\tlambertTerm;\n\t\tvec3 E = normalize(eyeVec);\n\t\tvec3 R = reflect(-L, N);\n\t\tfloat specular = pow( max(dot(R, E), 0.0), materialSpecularPower);\n\t\tfinal_color += materialSpecular * // gl_LightSource[0].specular * \n\t\t\tspecular;\n\t\tfinal_color = clamp(final_color, vec4(0.0), vec4(1.0));\n\t}\n\tgl_FragColor = vec4(texCol.rgb * final_color.rgb, texCol.a);\n}"}, 
    fm:{attributes:{Qa:b.F, ig:b.Q, mq:b.Vc, Nc:b.I, nq:b.Gg, oq:b.Hg}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, gh:e.Fd, Ph:e.zg, tc:e.TEXTURE0, wp:e.TEXTURE1, Eo:e.TEXTURE2, Rh:e.Ed, Sh:e.Hd, Th:e.Kd, Uh:e.Ld}, $:"attribute vec3 vertexPosition;\nattribute vec3 vertexNormal;\nattribute vec4 vertexTangent;\nattribute vec2 vertexUV0;\nattribute vec2 vertexUV1;\nattribute vec2 vertexUV2;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nuniform vec3 cameraPosition;\nuniform vec3 lightPosition;\nvarying vec3 normal;\nvarying vec3 binormal;\nvarying vec3 tangent;\nvarying vec3 lightDir;\nvarying vec3 eyeVec;\nvarying vec2 texCoord0;\nvarying vec2 texCoord1;\nvarying vec2 texCoord2;\nvoid main(void) {\n\tvec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);\n\tgl_Position = projectionMatrix * viewMatrix * worldPos;\n\tnormal = normalize((worldMatrix * vec4(vertexNormal, 0.0)).xyz);\n\ttangent = normalize((worldMatrix * vec4(vertexTangent.xyz, 0.0)).xyz);\n\tbinormal = cross(normal, tangent)*vec3(vertexTangent.w);\n\ttexCoord0 = vertexUV0;\n\ttexCoord1 = vertexUV1;\n\ttexCoord2 = vertexUV2;\n\tlightDir = lightPosition - worldPos.xyz;\n\teyeVec = cameraPosition - worldPos.xyz;\n}", 
    S:"precision mediump float;\nuniform sampler2D diffuseMap;\nuniform sampler2D normalMap;\nuniform sampler2D aoMap;\nuniform vec4 materialAmbient;\nuniform vec4 materialDiffuse;\nuniform vec4 materialSpecular;\nuniform float materialSpecularPower;\nvarying vec3 normal;\nvarying vec3 binormal;\nvarying vec3 tangent;\nvarying vec3 lightDir;\nvarying vec3 eyeVec;\nvarying vec2 texCoord0;\nvarying vec2 texCoord1;\nvarying vec2 texCoord2;\nvoid main(void)\n{\n\tmat3 tangentToWorld = mat3(tangent,\n\t\t\t\t\t\t\t\tbinormal,\n\t\t\t\t\t\t\t\tnormal);\n\tvec4 texCol = texture2D(diffuseMap, texCoord1);\n\tvec4 final_color = materialAmbient;\n\tvec3 tangentNormal = texture2D(normalMap, texCoord0).xyz - vec3(0.5, 0.5, 0.5);\n\tvec3 worldNormal = (tangentToWorld * tangentNormal);\n\tvec3 N = normalize(worldNormal);\n\tvec4 aoCol = texture2D(aoMap, texCoord2);\n\tvec3 L = normalize(lightDir);\n\tfloat lambertTerm = dot(N,L)*0.75+0.25;\n\tif(lambertTerm > 0.0)\n\t{\n\t\tfinal_color += materialDiffuse * // gl_LightSource[0].diffuse * \n\t\t\tlambertTerm;\n\t\tvec3 E = normalize(eyeVec);\n\t\tvec3 R = reflect(-L, N);\n\t\tfloat specular = pow( max(dot(R, E), 0.0),\n\t\t\t\t\t\tmaterialSpecularPower);\n\t\tfinal_color += materialSpecular * // gl_LightSource[0].specular * \n\t\t\tspecular;\n\t}\n gl_FragColor = vec4(texCol.rgb * aoCol.rgb * final_color.rgb, texCol.a);\n}"}, 
    To:{md:{jn:"25.0", kn:"25"}, attributes:{position:b.F, wm:b.I}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, fq:0, hq:[0.001953125, 0], Ko:[]}, $:"attribute vec3 position;\nattribute vec2 uv;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nuniform vec2 uImageIncrement;\nvarying vec2 vUv;\nvoid main() {\n\tvUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;\n\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );\n}", S:"precision mediump float;\nuniform float cKernel[ KERNEL_SIZE_INT ];\nuniform sampler2D tDiffuse;\nuniform vec2 uImageIncrement;\nvarying vec2 vUv;\nvoid main() {\n\tvec2 imageCoord = vUv;\n\tvec4 sum = vec4( 0.0 );\n\tfor( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {\n\t\tsum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];\n\t\timageCoord += uImageIncrement;\n\t}\n\tgl_FragColor = sum;\n}", 
    Jo:function(a) {
      var b, c, d, e, m = 2 * Math.ceil(a * 3) + 1;
      m > 25 && (m = 25);
      e = (m - 1) * 0.5;
      c = Array(m);
      for(b = d = 0;b < m;++b) {
        c[b] = Math.exp(-((b - e) * (b - e)) / (2 * a * a)), d += c[b]
      }
      for(b = 0;b < m;++b) {
        c[b] /= d
      }
      return c
    }}, Zp:{attributes:{Qa:b.F}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, Qf:e.Uc, rh:e.Rc}, $:"attribute vec3 vertexPosition;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nvoid main(void) {\n\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);\n}", S:"precision mediump float;\nuniform float near;\nuniform float far;\nvoid main(void)\n{\n\tfloat depth = gl_FragCoord.z / gl_FragCoord.w;\n\tfloat d = 1.0 - smoothstep( near, far, depth );\n\tgl_FragColor = vec4(d);\n}"}, 
    $p:{attributes:{Qa:b.F, ig:b.Q}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, opacity:1}, $:"attribute vec3 vertexPosition;\nattribute vec3 vertexNormal;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nvarying vec3 vNormal;\nvoid main() {\nvec4 mvPosition = viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );\nvNormal = vec3(viewMatrix * worldMatrix * vec4(vertexNormal, 0.0)); //normalMatrix * vertexNormal;\ngl_Position = projectionMatrix * mvPosition;\n}", S:"precision mediump float;\nuniform float opacity;\nvarying vec3 vNormal;\nvoid main() {\ngl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );\n}"}, 
    Io:{attributes:{position:b.F, wm:b.I}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, dq:0, eq:1, focus:1, ce:1, Fo:0.025, rp:1}, $:"attribute vec3 position;\nattribute vec2 uv;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nvarying vec2 vUv;\nvoid main() {\n\tvUv = uv;\n\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );\n}", S:"precision mediump float;\nvarying vec2 vUv;\nuniform sampler2D tColor;\nuniform sampler2D tDepth;\nuniform float maxblur;\nuniform float aperture;\nuniform float focus;\nuniform float aspect;\nvoid main() {\nvec2 aspectcorrect = vec2( 1.0, aspect );\nvec4 depth1 = texture2D( tDepth, vUv );\nfloat factor = depth1.x - focus;\nvec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );\nvec2 dofblur9 = dofblur * 0.9;\nvec2 dofblur7 = dofblur * 0.7;\nvec2 dofblur4 = dofblur * 0.4;\nvec4 col = vec4( 0.0 );\ncol += texture2D( tColor, vUv.xy );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );\ncol += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );\ncol += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );\ngl_FragColor = col / 41.0;\ngl_FragColor.a = 1.0;\n}"}, 
    Ip:{attributes:{Qa:b.F, kq:b.Sb, Nc:b.I}, z:{Aa:e.ba, wa:e.aa, Ba:e.ca, tc:e.TEXTURE0}, $:"attribute vec3 vertexPosition;\nattribute vec4 vertexColor;\nattribute vec2 vertexUV0;\nuniform mat4 viewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 worldMatrix;\nvarying vec2 texCoord0;\nvarying vec4 color;\nvoid main(void) {\n    texCoord0 = vertexUV0;\n    color = vertexColor;\n\t gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);\n}", S:"precision mediump float;\nuniform sampler2D diffuseMap;\nvarying vec2 texCoord0;\nvarying vec4 color;\nvoid main(void)\n{\n\tvec4 texCol = texture2D(diffuseMap, texCoord0);\n   if (color.a == 0.0 || texCol.a == 0.0) discard;\n\telse gl_FragColor = texCol * color;\n}"}};
    d.createShader = function(a, b) {
      return new e(b || "DefaultShader", a)
    };
    d.sk = function(a) {
      var b = new d("Wireframe");
      b.ea = d.createShader(a);
      return b
    };
    return d
  });
  l("goo/renderer/Renderer", "goo/renderer/RendererRecord,goo/renderer/Camera,goo/renderer/Util,goo/renderer/TextureCreator,goo/renderer/pass/RenderTarget,goo/math/Vector4,goo/entities/Entity,goo/renderer/Texture,goo/loaders/dds/DdsLoader,goo/loaders/dds/DdsUtils,goo/renderer/MeshData,goo/renderer/Material,goo/math/Transform,goo/renderer/RenderQueue".split(","), function(e, c, b, a, d, f, g, i, h, k, m, j, l, s) {
    function p(a) {
      var a = a || {}, b = a.canvas;
      if(b === q) {
        b = document.createElement("canvas"), b.width = 500, b.height = 500
      }
      this.L = b;
      this.xa = new e;
      this.tj = a.alpha !== q ? a.alpha : !1;
      this.Ej = a.premultipliedAlpha !== q ? a.premultipliedAlpha : !0;
      this.uj = a.antialias !== q ? a.antialias : !1;
      this.Jj = a.stencil !== q ? a.stencil : !1;
      this.Fj = a.preserveDrawingBuffer !== q ? a.preserveDrawingBuffer : !1;
      try {
        if(!(this.k = b.getContext("experimental-webgl", {alpha:this.tj, premultipliedAlpha:this.Ej, antialias:this.uj, stencil:this.Jj, preserveDrawingBuffer:this.Fj}))) {
          console.error("Error creating WebGL context."), n("Error creating WebGL context.")
        }
        this.dl = h.Fg = k.isSupported(this.k);
        this.gl = this.k.getExtension("OES_texture_float");
        this.el = this.k.getExtension("OES_standard_derivatives");
        this.fl = this.k.getExtension("EXT_texture_filter_anisotropic") || this.k.getExtension("MOZ_EXT_texture_filter_anisotropic") || this.k.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        this.gl || console.log("Float textures not supported.");
        this.el || console.log("Standard derivatives not supported.");
        this.fl || console.log("Anisotropic texture filtering not supported.");
        this.dl || console.log("S3TC compressed textures not supported.")
      }catch(c) {
        console.error(c)
      }
      this.clearColor = new f;
      this.Pl();
      this.k.clearDepth(1);
      this.k.clearStencil(0);
      this.k.stencilMask(0);
      this.k.enable(WebGLRenderingContext.DEPTH_TEST);
      this.k.depthFunc(WebGLRenderingContext.LEQUAL);
      this.vk = this.wk = this.kg = this.lg = this.ng = this.mg = 0;
      this.Yh = r;
      this.Hc = new s;
      this.info = {ge:0, Fe:0, oe:0, reset:function() {
        this.oe = this.Fe = this.ge = 0
      }, toString:function() {
        return"Calls: " + this.ge + " Vertices: " + this.Fe + " Indices: " + this.oe
      }}
    }
    p.prototype.ik = function(a) {
      (this.L.offsetWidth !== this.L.width || this.L.offsetHeight !== this.L.height) && this.Ul(this.L.offsetWidth, this.L.offsetHeight);
      var b = this.L.width / this.L.height;
      if(a && a.ce !== b) {
        a.ce = b, a.ji()
      }
    };
    p.prototype.Ul = function(a, b) {
      this.L.width = a;
      this.L.height = b;
      this.Wl(a, b)
    };
    p.prototype.Wl = function(a, b) {
      this.ng = this.mg = 0;
      this.lg = a !== q ? a : this.L.width;
      this.kg = b !== q ? b : this.L.height;
      this.k.viewport(this.mg, this.ng, this.lg, this.kg)
    };
    p.prototype.Pl = function() {
      this.clearColor.set(0.3, 0.3, 0.3, 1);
      this.k.clearColor(0.3, 0.3, 0.3, 1)
    };
    p.prototype.ee = function(a) {
      var b = r;
      if(a !== r) {
        if(b = a.Hf, b !== r) {
          if(a.Ng) {
            this.we(a.Hf, a.target), this.k.bufferSubData(this.Ff(a.target), 0, a.data), a.Ng = !1
          }
        }else {
          b = this.k.createBuffer(), a.Hf = b, this.xa.kl(a.target), this.we(b, a.target), this.k.bufferData(this.Ff(a.target), a.data, this.Tk(a.xj))
        }
      }
      b !== r ? this.we(b, a.target) : this.we(r, a.target)
    };
    p.prototype.Vf = function(a, b, c, d, e) {
      if(b) {
        if(this.Sl(d), e === q || e === r || e === !0 ? this.clear() : typeof e === "object" && this.clear(e.color, e.depth, e.stencil), c = {B:b, Ma:c}, Array.isArray(a)) {
          this.Hc.sort(a, b);
          for(b = 0;b < a.length;b++) {
            this.th(a[b], c), this.ei(c)
          }
        }else {
          this.th(a, c), this.ei(c)
        }
      }
    };
    p.prototype.th = function(a, b) {
      a instanceof g ? (b.Mb = a.Vh.Mb, b.W = a.X.W, b.transform = a.Hp ? l.ic : a.H.Oc) : (b.Mb = a.Mb, b.W = a.W, b.transform = a.transform)
    };
    p.prototype.ei = function(a) {
      var b = a.Mb;
      if(!(b.gc !== r && b.gc.data.byteLength === 0 || b.Bc !== r && b.Bc.data.byteLength === 0)) {
        this.ee(b.gc);
        var c = a.W;
        this.Yh !== r && (c = [this.Yh]);
        for(var d = !1, e = b, f = 0;f < c.length;f++) {
          var g = c[f];
          if(g.ea) {
            if(g.zi && !d) {
              if(!b.Ai) {
                b.Ai = this.ck(b)
              }
              b = b.Ai;
              this.ee(b.gc);
              if(!g.Bi) {
                g.Bi = this.dk(g)
              }
              g = g.Bi;
              d = !0
            }else {
              !g.zi && d && (b = e, this.ee(b.gc), iswireframe = !1)
            }
            a.Wa = g;
            g.ea.apply(a, this);
            this.mm(g);
            this.km(g);
            this.hm(g);
            this.pm(g);
            this.sm(g);
            b.va() !== r ? (this.ee(b.Bc), b.qd !== r ? this.nh(b.va(), b.cc, b.qd) : this.nh(b.va(), b.cc, [b.va().length])) : b.qd !== r ? this.mh(b.cc, b.qd) : this.mh(b.cc, [b.za]);
            this.info.ge++;
            this.info.Fe += b.za;
            this.info.oe += b.bc
          }
        }
      }
    };
    p.prototype.nh = function(a, b, c) {
      for(var d = 0, e = 0, f = 0;f < c.length;f++) {
        var g = c[f];
        this.k.drawElements(this.Fh(b[e]), g, this.Sk(a), d * this.Uk(a));
        d += g;
        e < b.length - 1 && e++
      }
    };
    p.prototype.mh = function(a, b) {
      for(var c = 0, d = 0, e = 0;e < b.length;e++) {
        var f = b[e];
        this.k.drawArrays(this.Fh(a[d]), c, f);
        c += f;
        d < a.length - 1 && d++
      }
    };
    p.prototype.ck = function(a) {
      var c = b.Fa(a.ib), d = new m(c, a.za, a.bc * 2), e;
      for(e in c) {
        d.K(e).set(a.K(e))
      }
      c = a.va();
      e = d.va();
      for(var f = 0;f < a.bc;f++) {
        var g = c[f * 3 + 0], i = c[f * 3 + 1], x = c[f * 3 + 2];
        e[f * 6 + 0] = g;
        e[f * 6 + 1] = i;
        e[f * 6 + 2] = i;
        e[f * 6 + 3] = x;
        e[f * 6 + 4] = x;
        e[f * 6 + 5] = g
      }
      d.cc[0] = "Lines";
      return d
    };
    p.prototype.dk = function(a) {
      var c = {};
      c.md = a.ea.md;
      c.attributes = a.ea.attributes;
      c.z = a.ea.z;
      c.z.color = a.pq || [1, 1, 1];
      c.$ = a.ea.Bd;
      c.S = b.Fa(j.Jc.bm.S);
      c = j.sk(c);
      c.Lc = a.Lc;
      return c
    };
    p.prototype.mm = function(a) {
      var b = this.xa.xk, a = a.yk;
      if(b.enabled !== a.enabled) {
        a.enabled ? this.k.enable(WebGLRenderingContext.DEPTH_TEST) : this.k.disable(WebGLRenderingContext.DEPTH_TEST), b.enabled = a.enabled
      }
      if(b.write !== a.write) {
        a.write ? this.k.depthMask(!0) : this.k.depthMask(!1), b.write = a.write
      }
    };
    p.prototype.km = function(a) {
      var b = this.xa.uk, c = a.je.cullFace, d = a.je.frontFace, a = a.je.enabled;
      if(b.enabled !== a) {
        a ? this.k.enable(WebGLRenderingContext.CULL_FACE) : this.k.disable(WebGLRenderingContext.CULL_FACE), b.enabled = a
      }
      if(b.cullFace !== c) {
        this.k.cullFace(c === "Front" ? WebGLRenderingContext.FRONT : c === "Back" ? WebGLRenderingContext.BACK : WebGLRenderingContext.FRONT_AND_BACK), b.cullFace = c
      }
      if(b.frontFace !== d) {
        switch(d) {
          case "CCW":
            this.k.frontFace(WebGLRenderingContext.CCW);
            break;
          case "CW":
            this.k.frontFace(WebGLRenderingContext.CW)
        }
        b.frontFace = d
      }
    };
    p.prototype.sm = function(c) {
      for(var e = this.k, f = 0;f < c.ea.zd.length;f++) {
        var g = c.Lc[f];
        if(g === q || !(g instanceof d) && g.r === q || g.r && g.r.kd === q) {
          if(c.ea.zd[f].u === "sampler2D") {
            g = a.sg
          }else {
            if(c.ea.zd[f].u === "samplerCube") {
              g = a.tg
            }
          }
        }
        var i = this.xa.Ae[f];
        i === q && (i = this.xa.Ae[f] = {});
        g.Va === r ? (g.Va = e.createTexture(), this.ui(e, g, f, i)) : g.Rf ? (this.ui(e, g, f, i), g.Rf = !1) : this.bindTexture(e, g, f, i);
        i = g.r !== q ? g.r : g;
        this.vi(g, b.qe(i.width) && b.qe(i.height))
      }
    };
    p.prototype.vi = function(a, b) {
      var c = this.k, d = a.Ae;
      if(d === q) {
        d = {}, a.Ae = d
      }
      var e = this.Gh(a.Za);
      if(d.Na !== a.Na) {
        c.texParameteri(e, WebGLRenderingContext.TEXTURE_MAG_FILTER, this.Vk(a.Na)), d.Na = a.Na
      }
      var f = b ? a.Xa : this.Rk(a.Xa);
      if(d.Xa !== f) {
        c.texParameteri(e, WebGLRenderingContext.TEXTURE_MIN_FILTER, this.Wk(f)), d.Xa = f
      }
      f = b ? a.tb : "EdgeClamp";
      if(d.tb !== f) {
        var g = this.Hh(f);
        c.texParameteri(e, WebGLRenderingContext.TEXTURE_WRAP_S, g);
        d.tb = f
      }
      f = b ? a.ub : "EdgeClamp";
      if(d.ub !== f) {
        g = this.Hh(f), c.texParameteri(e, WebGLRenderingContext.TEXTURE_WRAP_T, g), d.ub = f
      }
    };
    p.prototype.bindTexture = function(a, b, c, d) {
      a.activeTexture(WebGLRenderingContext.TEXTURE0 + c);
      if(d.fh === q || b.Va !== q && d.fh !== b.Va) {
        a.bindTexture(this.Gh(b.Za), b.Va), d.fh = b.Va
      }
    };
    p.prototype.Gh = function(a) {
      switch(a) {
        case "2D":
          return WebGLRenderingContext.TEXTURE_2D;
        case "CUBE":
          return WebGLRenderingContext.TEXTURE_CUBE_MAP
      }
      n("invalid texture type: " + a)
    };
    p.prototype.Qh = function(a, b, c, d) {
      var e = c.r.sl, f = 0, g = 0, x = c.r.width, i = c.r.height, h = k.Dh(a), j = h.Ei;
      c.u === "PrecompressedDXT1" ? j = h.Fm : c.u === "PrecompressedDXT1A" ? j = h.Dm : c.u === "PrecompressedDXT3" ? j = h.Em : c.u === "PrecompressedDXT5" ? j = h.Ei : n(Error("Unhandled compression format: " + img.ip().name()));
      if(e == r) {
        d instanceof Uint8Array ? a.of(b, 0, j, x, i, 0, d) : a.of(b, 0, j, x, i, 0, new Uint8Array(d.buffer, d.byteOffset, d.byteLength))
      }else {
        c.Kb = !1;
        for(h = 0;h < e.length;h++) {
          g = e[h], a.of(b, h, j, x, i, 0, new Uint8Array(d.buffer, d.byteOffset + f, g)), x = ~~(x / 2) > 1 ? ~~(x / 2) : 1, i = ~~(i / 2) > 1 ? ~~(i / 2) : 1, f += g
        }
        d = 1 + Math.ceil(Math.log(Math.max(c.r.height, c.r.width)) / Math.log(2));
        f = e[e.length - 1];
        if(e.length < d) {
          for(h = e.length;h < d;h++) {
            f = ~~((x + 3) / 4) * ~~((i + 3) / 4) * c.r.kb * 2, a.of(b, h, j, x, i, 0, new Uint8Array(f)), x = ~~(x / 2) > 1 ? ~~(x / 2) : 1, i = ~~(i / 2) > 1 ? ~~(i / 2) : 1
          }
        }
      }
    };
    p.prototype.ui = function(a, b, c, d) {
      this.bindTexture(a, b, c, d);
      a.pixelStorei(WebGLRenderingContext.UNPACK_ALIGNMENT, 1);
      a.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, b.yh);
      if(b.Kb) {
        if(c = b.r, b.Za === "2D") {
          this.jh(b, c, c.width, c.height)
        }else {
          if(b.Za === "CUBE") {
            for(d = 0;d < 6;d++) {
              this.jh(b, c.data[d], c.width, c.height)
            }
          }
        }
      }
      if(b.Za === "2D") {
        b.r ? b.r.Oh === !0 ? b.r.pe ? this.Qh(a, WebGLRenderingContext.TEXTURE_2D, b, b.r.data) : a.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.ua(b.u), b.r.width, b.r.height, b.Nh ? 1 : 0, this.ua(b.u), this.zc(b.type), b.r.data) : a.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.ua(b.u), this.ua(b.u), this.zc(b.type), b.r) : a.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.ua(b.u), b.width, b.height, 0, this.ua(b.u), this.zc(b.type), r), b.Kb && b.r && !b.r.pe && a.generateMipmap(WebGLRenderingContext.TEXTURE_2D)
      }else {
        if(b.Za === "CUBE") {
          for(c = 0;c < i.qg.length;c++) {
            d = i.qg[c], b.r ? b.r.Oh === !0 ? b.r.pe ? this.Qh(a, this.ne(d), b, b.r.data[c]) : a.texImage2D(this.ne(d), 0, this.ua(b.u), b.r.width, b.r.height, b.Nh ? 1 : 0, this.ua(b.u), this.zc(b.type), b.r.data[c]) : a.texImage2D(this.ne(d), 0, this.ua(b.u), this.ua(b.u), this.zc(b.type), b.r.data[c]) : a.texImage2D(this.ne(d), 0, this.ua(b.u), b.width, b.height, 0, this.ua(b.u), this.zc(b.type), r)
          }
          b.Kb && b.r && !b.r.pe && a.generateMipmap(WebGLRenderingContext.TEXTURE_CUBE_MAP)
        }
      }
    };
    p.prototype.jh = function(a, c, d, e) {
      var f = b.Wh(d), g = b.Wh(e);
      if(d !== f || e !== g) {
        var i = document.createElement("canvas");
        i.width = f;
        i.height = g;
        i.getContext("2d").drawImage(c, 0, 0, d, e, 0, 0, f, g);
        document.body.appendChild(i);
        i.kd = !0;
        a.r = i;
        i.parentNode.removeChild(i)
      }
    };
    p.prototype.Hh = function(a) {
      switch(a) {
        case "Repeat":
          return WebGLRenderingContext.REPEAT;
        case "MirroredRepeat":
          return WebGLRenderingContext.MIRRORED_REPEAT;
        case "EdgeClamp":
          return WebGLRenderingContext.CLAMP_TO_EDGE
      }
      n("invalid WrapMode type: " + a)
    };
    p.prototype.ua = function(a) {
      switch(a) {
        case "RGBA":
          return WebGLRenderingContext.RGBA;
        case "RGB":
          return WebGLRenderingContext.RGB;
        case "Alpha":
          return WebGLRenderingContext.ALPHA;
        case "Luminance":
          return WebGLRenderingContext.LUMINANCE;
        case "LuminanceAlpha":
          return WebGLRenderingContext.LUMINANCE_ALPHA;
        default:
          n("Unsupported format: " + a)
      }
    };
    p.prototype.zc = function(a) {
      switch(a) {
        case "UnsignedByte":
          return WebGLRenderingContext.UNSIGNED_BYTE;
        case "UnsignedShort565":
          return WebGLRenderingContext.UNSIGNED_SHORT_5_6_5;
        case "UnsignedShort4444":
          return WebGLRenderingContext.UNSIGNED_SHORT_4_4_4_4;
        case "UnsignedShort5551":
          return WebGLRenderingContext.UNSIGNED_SHORT_5_5_5_1;
        case "Float":
          return WebGLRenderingContext.FLOAT;
        default:
          n("Unsupported type: " + a)
      }
    };
    p.prototype.Rk = function(a) {
      switch(a) {
        case "NearestNeighborNoMipMaps":
        ;
        case "NearestNeighborNearestMipMap":
        ;
        case "NearestNeighborLinearMipMap":
          return"NearestNeighborNoMipMaps";
        case "BilinearNoMipMaps":
        ;
        case "Trilinear":
        ;
        case "BilinearNearestMipMap":
          return"BilinearNoMipMaps";
        default:
          return"NearestNeighborNoMipMaps"
      }
    };
    p.prototype.Vk = function(a) {
      switch(a) {
        case "Bilinear":
          return WebGLRenderingContext.LINEAR;
        case "NearestNeighbor":
          return WebGLRenderingContext.NEAREST;
        default:
          return WebGLRenderingContext.NEAREST
      }
    };
    p.prototype.Wk = function(a) {
      switch(a) {
        case "BilinearNoMipMaps":
          return WebGLRenderingContext.LINEAR;
        case "Trilinear":
          return WebGLRenderingContext.LINEAR_MIPMAP_LINEAR;
        case "BilinearNearestMipMap":
          return WebGLRenderingContext.LINEAR_MIPMAP_NEAREST;
        case "NearestNeighborNoMipMaps":
          return WebGLRenderingContext.NEAREST;
        case "NearestNeighborNearestMipMap":
          return WebGLRenderingContext.NEAREST_MIPMAP_NEAREST;
        case "NearestNeighborLinearMipMap":
          return WebGLRenderingContext.NEAREST_MIPMAP_LINEAR
      }
      n("invalid MinificationFilter type: " + a)
    };
    p.prototype.Ff = function(a) {
      return a === "ElementArrayBuffer" ? WebGLRenderingContext.ELEMENT_ARRAY_BUFFER : WebGLRenderingContext.ARRAY_BUFFER
    };
    p.prototype.Sk = function(a) {
      if(a instanceof Uint8Array) {
        return WebGLRenderingContext.UNSIGNED_BYTE
      }else {
        if(a instanceof Uint16Array) {
          return WebGLRenderingContext.UNSIGNED_SHORT
        }else {
          if(a instanceof Uint32Array) {
            return WebGLRenderingContext.UNSIGNED_INT
          }else {
            if(a instanceof Int8Array) {
              return WebGLRenderingContext.UNSIGNED_BYTE
            }else {
              if(a instanceof Int16Array) {
                return WebGLRenderingContext.UNSIGNED_SHORT
              }else {
                if(a instanceof Int32Array) {
                  return WebGLRenderingContext.UNSIGNED_INT
                }
              }
            }
          }
        }
      }
      return r
    };
    p.prototype.Uk = function(a) {
      if(!(a instanceof Uint8Array)) {
        if(a instanceof Uint16Array) {
          return 2
        }else {
          if(a instanceof Uint32Array) {
            return 4
          }else {
            if(!(a instanceof Int8Array)) {
              if(a instanceof Int16Array) {
                return 2
              }else {
                if(a instanceof Int32Array) {
                  return 4
                }
              }
            }
          }
        }
      }
      return 1
    };
    p.prototype.ne = function(a) {
      switch(a) {
        case "PositiveX":
          return WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X;
        case "NegativeX":
          return WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X;
        case "PositiveY":
          return WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y;
        case "NegativeY":
          return WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y;
        case "PositiveZ":
          return WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z;
        case "NegativeZ":
          return WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z
      }
      n("Invalid cubemap face: " + a)
    };
    p.prototype.Tk = function(a) {
      var b = WebGLRenderingContext.STATIC_DRAW;
      switch(a) {
        case "StaticDraw":
          b = WebGLRenderingContext.STATIC_DRAW;
          break;
        case "DynamicDraw":
          b = WebGLRenderingContext.DYNAMIC_DRAW;
          break;
        case "StreamDraw":
          b = WebGLRenderingContext.STREAM_DRAW
      }
      return b
    };
    p.prototype.Fh = function(a) {
      var b = WebGLRenderingContext.TRIANGLES;
      switch(a) {
        case "Triangles":
          b = WebGLRenderingContext.TRIANGLES;
          break;
        case "TriangleStrip":
          b = WebGLRenderingContext.TRIANGLE_STRIP;
          break;
        case "TriangleFan":
          b = WebGLRenderingContext.TRIANGLE_FAN;
          break;
        case "Lines":
          b = WebGLRenderingContext.LINES;
          break;
        case "LineStrip":
          b = WebGLRenderingContext.LINE_STRIP;
          break;
        case "LineLoop":
          b = WebGLRenderingContext.LINE_LOOP;
          break;
        case "Points":
          b = WebGLRenderingContext.POINTS
      }
      return b
    };
    p.prototype.hm = function(a) {
      var b = this.xa.bk, c = this.k, d = a.fe.lf;
      if(d !== b.lf) {
        d === "NoBlending" ? c.disable(WebGLRenderingContext.BLEND) : d === "AdditiveBlending" ? (c.enable(WebGLRenderingContext.BLEND), c.blendEquation(WebGLRenderingContext.FUNC_ADD), c.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE)) : d === "SubtractiveBlending" ? (c.enable(WebGLRenderingContext.BLEND), c.blendEquation(WebGLRenderingContext.FUNC_ADD), c.blendFunc(WebGLRenderingContext.ZERO, WebGLRenderingContext.ONE_MINUS_SRC_COLOR)) : d === "MultiplyBlending" ? (c.enable(WebGLRenderingContext.BLEND), 
        c.blendEquation(WebGLRenderingContext.FUNC_ADD), c.blendFunc(WebGLRenderingContext.ZERO, WebGLRenderingContext.SRC_COLOR)) : d === "AlphaBlending" ? (c.enable(WebGLRenderingContext.BLEND), c.blendEquation(WebGLRenderingContext.FUNC_ADD), c.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA)) : d === "CustomBlending" ? c.enable(WebGLRenderingContext.BLEND) : (c.enable(WebGLRenderingContext.BLEND), c.blendEquationSeparate(WebGLRenderingContext.FUNC_ADD, WebGLRenderingContext.FUNC_ADD), 
        c.blendFuncSeparate(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA, WebGLRenderingContext.ONE, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA)), b.lf = d
      }
      if(d === "CustomBlending") {
        var d = a.fe.blendEquation, e = a.fe.kf, a = a.fe.jf;
        if(d !== b.blendEquation) {
          c.blendEquation(this.Ef(d)), b.blendEquation = d
        }
        if(e !== b.kf || a !== b.jf) {
          c.blendFunc(this.Ef(e), this.Ef(a)), b.kf = e, b.jf = a
        }
      }else {
        b.blendEquation = r, b.kf = r, b.jf = r
      }
    };
    p.prototype.pm = function(a) {
      var b = this.xa.wl, c = this.k, d = a.Sf.enabled, e = a.Sf.Cf, a = a.Sf.eg;
      if(b.enabled !== d) {
        d ? c.enable(WebGLRenderingContext.POLYGON_OFFSET_FILL) : c.disable(WebGLRenderingContext.POLYGON_OFFSET_FILL), b.enabled = d
      }
      if(d && (b.Cf !== e || b.eg !== a)) {
        c.polygonOffset(e, a), b.Cf = e, b.eg = a
      }
    };
    p.prototype.we = function(a, b) {
      if(!this.xa.jd[b].Ee || this.xa.jd[b].buffer !== a) {
        this.k.bindBuffer(this.Ff(b), a), this.xa.jd[b] = {buffer:a, Ee:!0}
      }
    };
    p.prototype.$j = function(a, b, c, d, e, f) {
      this.k.vertexAttribPointer(a, b, this.Eh(c), d, 0, e);
      f.eh.indexOf(a) === -1 && (this.k.enableVertexAttribArray(a), f.eh.push(a))
    };
    p.prototype.Eh = function(a) {
      switch(a) {
        case "Float":
        ;
        case "HalfFloat":
        ;
        case "Double":
          return WebGLRenderingContext.FLOAT;
        case "Byte":
          return WebGLRenderingContext.BYTE;
        case "UnsignedByte":
          return WebGLRenderingContext.UNSIGNED_BYTE;
        case "Short":
          return WebGLRenderingContext.SHORT;
        case "UnsignedShort":
          return WebGLRenderingContext.UNSIGNED_SHORT;
        case "Int":
          return WebGLRenderingContext.INT;
        case "UnsignedInt":
          return WebGLRenderingContext.UNSIGNED_INT
      }
    };
    p.prototype.Ef = function(a) {
      switch(a) {
        case "AddEquation":
          return WebGLRenderingContext.FUNC_ADD;
        case "SubtractEquation":
          return WebGLRenderingContext.FUNC_SUBTRACT;
        case "ReverseSubtractEquation":
          return WebGLRenderingContext.FUNC_REVERSE_SUBTRACT;
        case "ZeroFactor":
          return WebGLRenderingContext.ZERO;
        case "OneFactor":
          return WebGLRenderingContext.ONE;
        case "SrcColorFactor":
          return WebGLRenderingContext.SRC_COLOR;
        case "OneMinusSrcColorFactor":
          return WebGLRenderingContext.ONE_MINUS_SRC_COLOR;
        case "SrcAlphaFactor":
          return WebGLRenderingContext.SRC_ALPHA;
        case "OneMinusSrcAlphaFactor":
          return WebGLRenderingContext.ONE_MINUS_SRC_ALPHA;
        case "DstAlphaFactor":
          return WebGLRenderingContext.DST_ALPHA;
        case "OneMinusDstAlphaFactor":
          return WebGLRenderingContext.ONE_MINUS_DST_ALPHA;
        case "DstColorFactor":
          return WebGLRenderingContext.DST_COLOR;
        case "OneMinusDstColorFactor":
          return WebGLRenderingContext.ONE_MINUS_DST_COLOR;
        case "SrcAlphaSaturateFactor":
          return WebGLRenderingContext.SRC_ALPHA_SATURATE;
        default:
          n("Unknown blend param: " + a)
      }
    };
    p.prototype.clear = function(a, b, c) {
      var d = 0;
      if(a === q || a) {
        d |= WebGLRenderingContext.COLOR_BUFFER_BIT
      }
      if(b === q || b) {
        d |= WebGLRenderingContext.DEPTH_BUFFER_BIT
      }
      if(c === q || c) {
        d |= WebGLRenderingContext.STENCIL_BUFFER_BIT
      }
      this.k.clear(d)
    };
    p.prototype.Xl = function(a, b) {
      var c = WebGLRenderingContext.TEXTURE_2D;
      this.k.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, a);
      this.k.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0, c, b.Va, 0)
    };
    p.prototype.Yl = function(a, b) {
      this.k.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, a);
      b.Fb && !b.Pb ? (this.k.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.DEPTH_COMPONENT16, b.width, b.height), this.k.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_ATTACHMENT, WebGLRenderingContext.RENDERBUFFER, a)) : b.Fb && b.Pb ? (this.k.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.DEPTH_STENCIL, b.width, b.height), this.k.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT, 
      WebGLRenderingContext.RENDERBUFFER, a)) : this.k.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.RGBA4, b.width, b.height)
    };
    p.prototype.Sl = function(a) {
      if(a && !a.Rd) {
        if(a.Fb === q) {
          a.Fb = !0
        }
        if(a.Pb === q) {
          a.Pb = !0
        }
        a.Va = this.k.createTexture();
        var c = b.qe(a.width) && b.qe(a.height), d = this.ua(a.u), e = this.Eh(a.type);
        a.Rd = this.k.createFramebuffer();
        a.Qg = this.k.createRenderbuffer();
        this.k.bindTexture(WebGLRenderingContext.TEXTURE_2D, a.Va);
        this.vi(a, c);
        this.k.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, d, a.width, a.height, 0, d, e, r);
        this.Xl(a.Rd, a);
        this.Yl(a.Qg, a);
        c && this.k.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
        this.k.bindTexture(WebGLRenderingContext.TEXTURE_2D, r);
        this.k.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, r);
        this.k.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, r)
      }
      var f;
      a ? (c = a.Rd, d = a.width, a = a.height, f = e = 0) : (c = r, d = this.lg, a = this.kg, e = this.mg, f = this.ng);
      if(c !== this.xa.lh) {
        this.k.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, c), this.k.viewport(e, f, d, a), this.xa.lh = c
      }
      this.wk = d;
      this.vk = a
    };
    return p
  });
  l("goo/entities/systems/BoundingUpdateSystem", ["goo/entities/systems/System"], function(e) {
    function c() {
      e.call(this, "BoundingUpdateSystem", ["TransformComponent", "MeshRendererComponent", "MeshDataComponent"])
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Pa = function(b) {
      for(var a in b) {
        var c = b[a], e = c.Vh, g = c.H, c = c.X;
        e.gf && e.nk();
        g.fd && c.im(e.Of, g.Oc)
      }
    };
    return c
  });
  l("goo/entities/systems/ScriptSystem", ["goo/entities/systems/System"], function(e) {
    function c() {
      e.call(this, "ScriptSystem", ["ScriptComponent"])
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Pa = function(b) {
      for(var a in b) {
        b[a].Tp.ob(b[a])
      }
    };
    return c
  });
  l("goo/entities/systems/LightingSystem", ["goo/entities/systems/System"], function(e) {
    function c() {
      e.call(this, "LightingSystem", ["LightComponent"])
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Pa = function(b) {
      for(var a in b) {
        var c = b[a], e = c.H, c = c.op;
        e.fd && c.Lf.t.copy(e.transform.t)
      }
    };
    return c
  });
  l("goo/renderer/SimplePartitioner", ["goo/renderer/Camera"], function(e) {
    function c() {
    }
    c.prototype.rc = H();
    c.prototype.Gc = H();
    c.prototype.Pa = function(b, a, c) {
      for(var f in a) {
        var g = a[f];
        if(!g.bq) {
          b.contains(g.X.sb) !== e.Id ? (c.push(g), g.Kf = !0) : g.Kf = !1
        }
      }
    };
    return c
  });
  l("goo/entities/managers/LightManager", ["goo/entities/EventHandler"], function(e) {
    function c() {
      this.type = "LightManager";
      this.Ma = []
    }
    c.prototype.bh = function(b, a) {
      a.type === "LightComponent" && this.Ma.indexOf(a.Lf) === -1 && (this.Ma.push(a.Lf), e.tf("setLights", this.Ma))
    };
    c.prototype.di = function(b, a) {
      if(a.type === "LightComponent") {
        var c = this.Ma.indexOf(a.Lf);
        c !== -1 && (this.Ma.splice(c, 1), e.tf("setLights", this.Ma))
      }
    };
    return c
  });
  l("goo/entities/systems/CameraSystem", ["goo/entities/systems/System", "goo/entities/EventHandler", "goo/renderer/Renderer"], function(e, c, b) {
    function a() {
      e.call(this, "CameraSystem", ["TransformComponent", "CameraComponent"]);
      this.rl = r
    }
    a.prototype = Object.create(e.prototype);
    a.prototype.vh = function() {
      var a = r, e;
      for(e in this.zb) {
        var g = this.zb[e].fk;
        if(!a || g.mp) {
          a = g.B
        }
      }
      c.tf("setCurrentCamera", a);
      b.rl = a
    };
    a.prototype.Jf = function() {
      this.vh()
    };
    a.prototype.nd = function() {
      this.vh()
    };
    a.prototype.Pa = function(a) {
      for(var b in a) {
        var c = a[b], e = c.H, c = c.fk;
        e.fd && c.jm(e.Oc)
      }
    };
    return a
  });
  l("goo/entities/components/CameraComponent", ["goo/entities/components/Component", "goo/math/Vector3"], function(e) {
    function c(b) {
      this.type = "CameraComponent";
      this.B = b
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.jm = function(b) {
      this.B.O.set(-1, 0, 0);
      b.M.ff(this.B.O);
      this.B.P.set(0, 1, 0);
      b.M.ff(this.B.P);
      this.B.w.set(0, 0, -1);
      b.M.ff(this.B.w);
      b.M.bl(this.B.t);
      this.B.update()
    };
    return c
  });
  l("goo/util/Stats", [], function() {
    return function() {
      function e(a) {
        j = a;
        switch(j) {
          case 0:
            s.style.display = "block";
            w.style.display = "none";
            break;
          case 1:
            s.style.display = "none", w.style.display = "block"
        }
      }
      var c = Date.now(), b = c, a = c, d = 0, f = Infinity, g = 0, i = 0, h = Infinity, k = 0, m = 0, j = 0, l = document.createElement("div");
      l.id = "stats";
      l.addEventListener("mousedown", function(a) {
        a.preventDefault();
        e(++j % 2)
      }, !1);
      l.style.cssText = "width:80px;opacity:0.9;cursor:pointer;z-index:1000";
      var s = document.createElement("div");
      s.id = "fps";
      s.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#002";
      l.appendChild(s);
      var p = document.createElement("div");
      p.id = "fpsText";
      p.style.cssText = "color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:13px";
      p.innerHTML = "FPS";
      s.appendChild(p);
      var o = document.createElement("div");
      o.id = "fpsGraph";
      o.style.cssText = "position:relative;width:74px;height:30px;background-color:#0ff";
      for(s.appendChild(o);o.children.length < 74;) {
        var u = document.createElement("span");
        u.style.cssText = "width:1px;height:30px;float:left;background-color:#113";
        o.appendChild(u)
      }
      var w = document.createElement("div");
      w.id = "ms";
      w.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";
      l.appendChild(w);
      var A = document.createElement("div");
      A.id = "msText";
      A.style.cssText = "color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:13px";
      A.innerHTML = "MS";
      w.appendChild(A);
      var v = document.createElement("div");
      v.id = "msGraph";
      v.style.cssText = "position:relative;width:74px;height:30px;background-color:#0f0";
      for(w.appendChild(v);v.children.length < 74;) {
        u = document.createElement("span"), u.style.cssText = "width:1px;height:30px;float:left;background-color:#131", v.appendChild(u)
      }
      u = document.createElement("div");
      u.id = "info";
      u.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#200";
      l.appendChild(u);
      var z = document.createElement("div");
      z.id = "infoText";
      z.style.cssText = "color:#f66;font-family:Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:13px";
      z.innerHTML = "INFO";
      u.appendChild(z);
      this.L = l;
      this.Wp = e;
      this.Ho = function() {
        c = Date.now()
      };
      this.end = function(e) {
        var x = Date.now();
        if(x > a + 100) {
          d = x - c;
          f = Math.min(f, d);
          g = Math.max(g, d);
          A.textContent = d + " MS (" + f + "-" + g + ")";
          var D = Math.min(30, 30 - d / 200 * 30);
          v.appendChild(v.firstChild).style.height = D + "px";
          a = x
        }
        m++;
        if(x > b + 1E3) {
          i = Math.round(m * 1E3 / (x - b)), h = Math.min(h, i), k = Math.max(k, i), p.textContent = i + " FPS (" + h + "-" + k + ")", D = Math.min(30, 30 - i / (Math.min(500, k) + 10) * 30), o.appendChild(o.firstChild).style.height = D + "px", b = x, m = 0
        }
        if(e) {
          z.innerHTML = "Calls: " + e.ge + "<br>Vertices: " + e.Fe + "<br>Indices: " + e.oe
        }
        return x
      };
      this.update = function(a) {
        c = this.end(a)
      }
    }
  });
  l("goo/entities/GooRunner", "goo/entities/World,goo/entities/systems/TransformSystem,goo/entities/systems/RenderSystem,goo/entities/systems/PartitioningSystem,goo/renderer/Renderer,goo/entities/systems/BoundingUpdateSystem,goo/entities/systems/ScriptSystem,goo/entities/systems/LightingSystem,goo/renderer/SimplePartitioner,goo/entities/managers/LightManager,goo/entities/systems/CameraSystem,goo/renderer/Camera,goo/entities/components/CameraComponent,goo/util/Stats".split(","), function(e, c, b, 
  a, d, f, g, i, h, k, m, j, l, s) {
    function p() {
      for(var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0;c < b.length && !window.xd;++c) {
        window.xd = window[b[c] + "RequestAnimationFrame"], window.hh = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"]
      }
      if(window.xd === q) {
        window.xd = function(b) {
          var c = Date.now(), d = Math.max(0, 16 - (c - a)), e = window.setTimeout(function() {
            b(c + d)
          }, d);
          a = c + d;
          return e
        }
      }
      if(window.hh === q) {
        window.hh = function(a) {
          clearTimeout(a)
        }
      }
    }
    return function(j) {
      function l(a) {
        try {
          v.C.Mc = (a - z) / 1E3;
          v.C.ya += v.C.Mc;
          e.ya = v.C.ya;
          z = a;
          if(v.C.Mc < 0) {
            v.C.ya = 0, v.C.Mc = 0, e.ya = 0
          }else {
            v.C.Pa();
            v.wd.info.reset();
            A.Vf(v.wd);
            for(var b in v.mf) {
              v.mf[b](v.C.Mc)
            }
            v.Kc && v.Kc.update(v.wd.info)
          }
          window.xd(l)
        }catch(c) {
          c instanceof Error ? console.error(c.stack) : console.error(c)
        }
      }
      j = j || {};
      this.C = new e;
      this.wd = new d(j);
      this.C.Xf(new k);
      this.C.ec(new g);
      this.C.ec(new c);
      this.C.ec(new m);
      this.C.ec(new f);
      this.C.ec(new i);
      var y = new a;
      y.dc = new h;
      this.C.ec(y);
      var A = new b(y.vd);
      this.C.ec(A);
      p();
      window.xd(l);
      if(j.$l) {
        this.Kc = new s, this.Kc.L.style.position = "absolute", this.Kc.L.style.left = "10px", this.Kc.L.style.top = "10px", document.body.appendChild(this.Kc.L)
      }
      this.mf = [];
      var v = this, z = Date.now()
    }
  });
  l("goo/animation/blendtree/ClipSource", ["goo/math/MathUtils"], function(e) {
    function c(b, a) {
      this.Ab = b;
      a.le(b)
    }
    c.prototype.setTime = function(b, a) {
      var c = a.le(this.Ab);
      if(c.We) {
        var f = c.Lj * (b - c.uo), g = this.Ab.Td;
        if(g <= 0) {
          return!1
        }
        c.Ze === -1 || c.Ze > 1 && g * c.Ze >= Math.abs(f) ? f < 0 ? f = g + f % g : f %= g : f < 0 && (f = g + f);
        if(f > g || f < 0) {
          f = e.jk(f, g), c.ep(), c.We = !1
        }
        this.Ab.update(f, c)
      }
      return c.We
    };
    c.prototype.Y = function(b, a) {
      b.Rp(this.Ab, a)
    };
    return c
  });
  l("goo/animation/state/AbstractFiniteState", [], function() {
    function e() {
      this.Sd = 0;
      this.ad = r
    }
    e.prototype.Y = function(c, b) {
      this.Sd = isNaN(b) ? c.me() : b
    };
    return e
  });
  l("goo/animation/state/SteadyState", ["goo/animation/state/AbstractFiniteState"], function(e) {
    function c(b) {
      e.call(this);
      this.Ta = b;
      this.Eb = {};
      this.Zd = this.Ye = r
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Zb = function(b, a) {
      var c = this.Eb[b];
      return c ? c.Zb(this, a) : r
    };
    c.prototype.update = function(b, a) {
      if(!this.Zd.setTime(b, a.Sa)) {
        var c = this.ad;
        if(this.Ye !== r) {
          var e = this.Ye.Zb(this, a);
          e && (e.Y(a.Xk()), e.update(b, a));
          this !== e && c.replaceState(this, e)
        }
      }
    };
    c.prototype.Y = function(b, a) {
      e.prototype.Y.call(this, b, a);
      this.Zd.Y(b, this.Sd)
    };
    return c
  });
  l("goo/animation/layer/AnimationLayer", ["goo/animation/state/SteadyState"], function(e) {
    function c(b) {
      this.Ta = b;
      this.dd = {};
      this.Aj = this.Sa = this.Yc = r;
      this.Eb = {}
    }
    c.Bm = "-BASE_LAYER-";
    c.prototype.Zb = function(b) {
      var a = this.Yc;
      if(a instanceof e) {
        var c = a.Zb(b, this);
        c || ((b = this.Eb[b]) || (b = this.Eb["*"]), b && (c = b.Zb(a, this)));
        if(c && c !== a) {
          return this.xe(c, !1), !0
        }
      }else {
        if(!a && ((b = this.Eb[b]) || (b = this.Eb["*"]), b)) {
          return this.xe(b.Zb(a, this), !0), !0
        }
      }
      return!1
    };
    c.prototype.xe = function(b, a) {
      if(this.Yc = b) {
        b.ad = this, a && b.Y(this.Sa)
      }
    };
    c.prototype.replaceState = function(b, a) {
      this.Yc === b && this.xe(a, !1)
    };
    return c
  });
  l("goo/animation/state/AbstractTransitionState", ["goo/animation/state/AbstractFiniteState"], function(e) {
    function c(b) {
      e.call(this);
      this.$d = b;
      this.nc = this.cd = -1
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Zb = function(b, a) {
      return!a.Yc ? r : this.ll(a.Sa.me() - a.Yc.Sd) ? this.Ac(b, a) : r
    };
    c.prototype.ll = function(b) {
      return this.cd <= 0 ? this.nc <= 0 ? !0 : b <= this.nc : this.nc <= 0 ? b >= this.cd : this.cd <= this.nc ? this.cd <= b && b <= this.nc : b >= this.cd || b <= this.nc
    };
    c.prototype.Ac = function() {
      return r
    };
    return c
  });
  l("goo/util/Enum", [], function() {
    function e(a, b) {
      Object.getOwnPropertyNames(b).forEach(function(c) {
        Object.defineProperty(a, c, Object.getOwnPropertyDescriptor(b, c))
      })
    }
    function c(a, b) {
      this.name = a;
      b && e(this, b);
      Object.freeze(this)
    }
    function b(a) {
      arguments.length === 1 && a !== r && typeof a === "object" ? Object.keys(a).forEach(function(b) {
        this[b] = new c(b, a[b])
      }, this) : Array.prototype.forEach.call(arguments, function(a) {
        this[a] = new c(a)
      }, this);
      Object.freeze(this)
    }
    c.prototype = Object.create(r);
    c.prototype.toString = function() {
      return"|" + this.name + "|"
    };
    Object.freeze(c.prototype);
    b.prototype.contains = function(a) {
      return!a instanceof c ? !1 : this[a.name] === a
    };
    return b
  });
  l("goo/animation/state/StateBlendType", ["goo/util/Enum"], function(e) {
    return new e("Linear", "SCurve3", "SCurve5")
  });
  l("goo/math/Quaternion", ["goo/math/Vector", "goo/math/Matrix3x3"], function(e) {
    function c() {
      e.call(this, 4);
      this.set(arguments.length !== 0 ? arguments : [0, 0, 0, 1])
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.fc([["x"], ["y"], ["z"], ["w"]]);
    c.ic = new c(0, 0, 0, 1);
    c.Dd = 1.0E-8;
    c.add = function(b, a, d) {
      d || (d = new c);
      d.data[0] = b.data[0] + a.data[0];
      d.data[1] = b.data[1] + a.data[1];
      d.data[2] = b.data[2] + a.data[2];
      d.data[3] = b.data[3] + a.data[3];
      return d
    };
    c.sub = function(b, a, d) {
      d || (d = new c);
      d.data[0] = b.data[0] - a.data[0];
      d.data[1] = b.data[1] - a.data[1];
      d.data[2] = b.data[2] - a.data[2];
      d.data[3] = b.data[3] - a.data[3];
      return d
    };
    c.D = function(b, a, d) {
      d || (d = new c);
      d.data[0] = b.data[0] * a.data[0];
      d.data[1] = b.data[1] * a.data[1];
      d.data[2] = b.data[2] * a.data[2];
      d.data[3] = b.data[3] * a.data[3];
      return d
    };
    c.G = function(b, a, d) {
      d || (d = new c);
      var e = !0;
      d.data[0] = (e &= a.data[0] < 0 || a.data[0] > 0) ? b.data[0] / a.data[0] : 0;
      d.data[1] = (e &= a.data[1] < 0 || a.data[1] > 0) ? b.data[1] / a.data[1] : 0;
      d.data[2] = (e &= a.data[2] < 0 || a.data[2] > 0) ? b.data[2] / a.data[2] : 0;
      d.data[3] = (e &= a.data[3] < 0 || a.data[3] > 0) ? b.data[3] / a.data[3] : 0;
      e === !1 && console.warn("[Quaternion.div] Attempted to divide by zero!");
      return d
    };
    c.fi = function(b, a, d) {
      d || (d = new c);
      d.data[0] = b.data[0] + a;
      d.data[1] = b.data[1] + a;
      d.data[2] = b.data[2] + a;
      d.data[3] = b.data[3] + a;
      return d
    };
    c.ii = function(b, a, d) {
      d || (d = new c);
      d.data[0] = b.data[0] - a;
      d.data[1] = b.data[1] - a;
      d.data[2] = b.data[2] - a;
      d.data[3] = b.data[3] - a;
      return d
    };
    c.hi = function(b, a, d) {
      d || (d = new c);
      d.data[0] = b.data[0] * a;
      d.data[1] = b.data[1] * a;
      d.data[2] = b.data[2] * a;
      d.data[3] = b.data[3] * a;
      return d
    };
    c.gi = function(b, a, d) {
      d || (d = new c);
      var e = !0, a = (e &= a < 0 || a > 0) ? 1 / a : 0;
      d.data[0] = b.data[0] * a;
      d.data[1] = b.data[1] * a;
      d.data[2] = b.data[2] * a;
      d.data[3] = b.data[3] * a;
      e === !1 && console.warn("[Quaternion.scalarDiv] Attempted to divide by zero!");
      return d
    };
    c.ze = function(b, a, c, e) {
      if(c === 0) {
        return e.set(b)
      }else {
        if(c === 1) {
          return e.set(a)
        }
      }
      if(b.ta(a)) {
        return copy(b)
      }
      var g = b.J(a);
      e.copy(a);
      g < 0 && (e.vl(), g = -g);
      var a = 1 - c, i = c;
      1 - g > 0.1 && (g = Math.acos(g), i = 1 / Math.sin(g), a = Math.sin((1 - c) * g) * i, i *= Math.sin(c * g));
      e.set(a * b.x + i * e.x, a * b.y + i * e.y, a * b.j + i * e.j, a * b.qa + i * e.qa);
      return e
    };
    c.prototype.vl = function() {
      this.x *= -1;
      this.y *= -1;
      this.j *= -1;
      this.qa *= -1
    };
    c.prototype.add = function(b) {
      return c.add(this, b, this)
    };
    c.prototype.sub = function(b) {
      return c.sub(this, b, this)
    };
    c.prototype.D = function(b) {
      return c.D(this, b, this)
    };
    c.prototype.G = function(b) {
      return c.G(this, b, this)
    };
    c.prototype.fi = function(b) {
      return c.fi(this, b, this)
    };
    c.prototype.ii = function(b) {
      return c.ii(this, b, this)
    };
    c.prototype.hi = function(b) {
      return c.hi(this, b, this)
    };
    c.prototype.gi = function(b) {
      return c.gi(this, b, this)
    };
    c.prototype.ze = function(b, a) {
      var d = (new c).copy(b);
      c.ze(this, b, a, d);
      this.copy(d);
      return this
    };
    c.prototype.normalize = function() {
      var b = 1 / this.pl();
      return this.set(this.x * b, this.y * b, this.j * b, this.qa * b)
    };
    c.prototype.pl = function() {
      var b = this.ql();
      return b === 1 ? 1 : Math.sqrt(b)
    };
    c.prototype.ql = function() {
      return this.x * this.x + this.y * this.y + this.j * this.j + this.qa * this.qa
    };
    c.prototype.ta = function(b) {
      return this === b ? !0 : !(b instanceof c) ? !1 : Math.abs(this.x - b.x) < c.Dd && Math.abs(this.y - b.y) < c.Dd && Math.abs(this.j - b.j) < c.Dd && Math.abs(this.qa - b.qa) < c.Dd
    };
    return c
  });
  l("goo/animation/clip/TransformData", ["goo/math/Quaternion", "goo/math/Vector3"], function(e, c) {
    function b(a) {
      this.cb = (new e).copy(a ? a.cb : e.ic);
      this.eb = (new c).copy(a ? a.eb : c.ONE);
      this.fb = (new c).copy(a ? a.fb : c.ZERO)
    }
    b.prototype.set = function(a) {
      this.cb.copy(a.cb);
      this.eb.copy(a.eb);
      this.fb.copy(a.fb)
    };
    b.prototype.hf = function(a, c, f) {
      var f = f ? f : new b, g = 0, i = 0, h = 0, k = 0, m = 0, j = 0, l, s;
      s = 1 - c;
      l = this.fb;
      k += l.x * s;
      m += l.y * s;
      j += l.j * s;
      l = this.eb;
      g += l.x * s;
      i += l.y * s;
      h += l.j * s;
      s = c;
      l = a.fb;
      k += l.x * s;
      m += l.y * s;
      j += l.j * s;
      l = a.eb;
      g += l.x * s;
      i += l.y * s;
      h += l.j * s;
      f.eb.set(g, i, h);
      f.fb.set(k, m, j);
      e.ze(this.cb, a.cb, s, f.cb);
      return f
    };
    return b
  });
  l("goo/animation/blendtree/AbstractTwoPartSource", [], function() {
    return function(e, c, b) {
      this.Wd = e ? e : r;
      this.Xd = c ? c : r;
      this.Wc = b ? b : r
    }
  });
  l("goo/animation/blendtree/BinaryLERPSource", ["goo/math/MathUtils", "goo/animation/clip/TransformData", "goo/animation/blendtree/AbstractTwoPartSource"], function(e, c, b) {
    function a(a, c, e) {
      b.call(this, a, c, e)
    }
    a.prototype = Object.create(b.prototype);
    a.prototype.setTime = function(a, b) {
      var c = !1;
      this.Wd && (c = c || this.Wd.setTime(a, b));
      this.Xd && (c = c || this.Xd.setTime(a, b));
      return c
    };
    a.prototype.Y = function(a, b) {
      this.Wd && this.Wd.Y(a, b);
      this.Xd && this.Xd.Y(a, b)
    };
    a.Ro = function(b, e, g, i) {
      if(e) {
        if(!b) {
          return e
        }
      }else {
        return b
      }
      var i = i ? i : {}, h;
      for(h in b) {
        var k = b[h], m = e[h];
        isNaN(k) ? i[h] = k instanceof c ? m ? k.hf(m, g, i[h]) : k : k : a.ak(i, h, g, k, m)
      }
      for(h in e) {
        i[h] || (i[h] = entryBData[h])
      }
      return i
    };
    a.ak = function(a, b, c, i, h) {
      a[b] = isNaN(h) ? i : e.Dc(c, i[0], h[0])
    };
    return a
  });
  l("goo/animation/state/AbstractTwoStateLerpTransition", ["goo/animation/state/AbstractTransitionState", "goo/animation/state/StateBlendType", "goo/animation/blendtree/BinaryLERPSource"], function(e, c) {
    function b(a, b, c) {
      e.call(this, a);
      this.Og = b;
      this.vo = c;
      this.pc = this.Vd = 0;
      this.Yd = this.V = this.Db = r
    }
    b.prototype = Object.create(e.prototype);
    b.prototype.Yf = function(a) {
      a === this && n(Error("Can not set state A to self."));
      this.Db = a;
      if(this.Db !== r) {
        this.Db.ad = this
      }
      if(this.Yd) {
        this.Yd = {}
      }
    };
    b.prototype.Zf = function(a) {
      a === this && n(Error("Can not set state B to self."));
      this.V = a;
      if(this.V !== r) {
        this.V.ad = this
      }
      if(this.Yd) {
        this.Yd = {}
      }
    };
    b.prototype.update = function(a) {
      a -= this.pc;
      if(a > this.Og) {
        this.ad.replaceState(this, this.V)
      }else {
        switch(a /= this.Og, this.lo) {
          case c.un:
            this.Vd = MathUtils.Nl(a);
            break;
          case c.vn:
            this.Vd = MathUtils.Ol(a);
            break;
          case c.Ag:
            this.Vd = a;
            break;
          default:
            this.Vd = a
        }
      }
    };
    b.prototype.replaceState = function(a, b) {
      if(b != r) {
        if(this.Db == a) {
          this.Db = b
        }else {
          if(this.V == a) {
            this.V = b
          }
        }
      }
    };
    return b
  });
  l("goo/animation/state/FadeTransitionState", ["goo/animation/state/AbstractTwoStateLerpTransition"], function(e) {
    function c(b, a, c) {
      e.call(this, b, a, c)
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.update = function(b, a) {
      e.prototype.update.call(this, b, a);
      this.Db != r && this.Db.update(b, a);
      this.V != r && this.V.update(b, a)
    };
    c.prototype.Ac = function(b, a) {
      this.pc = a.Sa.me();
      this.Yf(b);
      this.Zf(a.dd[this.$d]);
      if(!this.V) {
        return r
      }
      this.V.Y(a.Sa, this.pc);
      return this
    };
    return c
  });
  l("goo/animation/state/FrozenTransitionState", ["goo/animation/state/AbstractTwoStateLerpTransition"], function(e) {
    function c(b, a, c) {
      e.call(this, b, a, c)
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.update = function(b, a) {
      e.prototype.update.call(this, b, a);
      this.V != r && this.V.update(b, a)
    };
    c.prototype.Ac = function(b, a) {
      this.pc = a.Sa.me();
      this.Yf(b);
      this.Zf(a.dd[this.$d]);
      if(!this.V) {
        return r
      }
      this.V.Y(a.Sa, this.pc);
      return this
    };
    return c
  });
  l("goo/animation/state/IgnoreTransitionState", ["goo/animation/state/AbstractTransitionState"], function(e) {
    function c() {
      e.call(this, r)
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.update = H();
    c.prototype.Ac = function(b) {
      return b
    };
    return c
  });
  l("goo/animation/state/ImmediateTransitionState", ["goo/animation/state/AbstractTransitionState"], function(e) {
    function c(b) {
      e.call(this, b)
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Ac = function(b, a) {
      var c = a.dd[this.$d];
      if(!c) {
        return r
      }
      c.Y(a.Sa);
      return c
    };
    c.prototype.update = H();
    return c
  });
  l("goo/animation/state/SyncFadeTransitionState", ["goo/animation/state/FadeTransitionState"], function(e) {
    function c(b, a, c) {
      e.call(this, b, a, c)
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Ac = function(b, a) {
      this.pc = a.Sa.me();
      this.Yf(b);
      this.Zf(a.dd[this.$d]);
      if(!this.V) {
        return r
      }
      this.V.Y(a.Sa, this.Db.Sd);
      return this
    };
    return c
  });
  l("goo/animation/clip/AbstractAnimationChannel", [], function() {
    function e(c, b) {
      this.wj = c;
      this.Ea = b instanceof Array && b.length ? b.slice(0) : []
    }
    e.prototype.Yk = function() {
      return this.Ea.length ? this.Ea[this.Ea.length - 1] : 0
    };
    e.prototype.rm = function(c, b) {
      if(this.Ea.length) {
        var a = this.Ea.length - 1;
        if(c < 0 || this.Ea.length === 1) {
          this.Ic(0, 0, b)
        }else {
          if(c >= this.Ea[a]) {
            this.Ic(a, 0, b)
          }else {
            for(var d = a = 0;d < this.Ea.length - 1;d++) {
              this.Ea[d] < c && (a = d)
            }
            this.Ic(a, (c - this.Ea[a]) / (this.Ea[a + 1] - this.Ea[a]), b)
          }
        }
      }
    };
    return e
  });
  l("goo/animation/clip/TransformChannel", ["goo/animation/clip/AbstractAnimationChannel", "goo/animation/clip/TransformData", "goo/math/Quaternion", "goo/math/Vector3"], function(e, c, b, a) {
    function d(a, b, c, d, k) {
      e.call(this, a, b);
      (c.length / 4 !== b.length || d.length / 3 !== b.length || k.length / 3 !== b.length) && n(Error("All provided arrays must be the same length (accounting for type)! Channel: " + a));
      this.R = c.slice(0);
      this.sa = d.slice(0);
      this.ra = k.slice(0)
    }
    d.prototype = Object.create(e.prototype);
    d.prototype.Ic = function(c, d, e) {
      var h = c * 4, k = c * 3, m = (c + 1) * 4, c = (c + 1) * 3;
      d === 0 ? (e.cb.set([this.R[h + 0], this.R[h + 1], this.R[h + 2], this.R[h + 3]]), e.fb.set([this.sa[k + 0], this.sa[k + 1], this.sa[k + 2]]), e.eb.set([this.ra[k + 0], this.ra[k + 1], this.ra[k + 2]])) : d === 1 ? (e.cb.set([this.R[m + 0], this.R[m + 1], this.R[m + 2], this.R[m + 3]]), e.fb.set([this.sa[c + 0], this.sa[c + 1], this.sa[c + 2]]), e.eb.set([this.ra[c + 0], this.ra[c + 1], this.ra[c + 2]])) : (h = e.cb.set([this.R[h + 0], this.R[h + 1], this.R[h + 2], this.R[h + 3]]), m = (new b).set([this.R[m + 
      0], this.R[m + 1], this.R[m + 2], this.R[m + 3]]), h.ta(m) || h.ze(m, d), m = e.fb.set([this.sa[k + 0], this.sa[k + 1], this.sa[k + 2]]), h = (new a).set([this.sa[c + 0], this.sa[c + 1], this.sa[c + 2]]), m.ta(h) || m.Dc(h, d), e = e.eb.set([this.ra[k + 0], this.ra[k + 1], this.ra[k + 2]]), k = (new a).set([this.ra[c + 0], this.ra[c + 1], this.ra[c + 2]]), e.ta(k) || e.Dc(k, d))
    };
    d.prototype.al = function(a, b) {
      var d = b ? b : new c;
      d.Xp(this.R[a]);
      d.Tl(this.ra[a]);
      d.Vl(this.sa[a]);
      return d
    };
    return d
  });
  l("goo/animation/clip/JointData", ["goo/animation/clip/TransformData"], function(e) {
    function c(b) {
      e.call(this, b);
      this.ja = b ? b.ja : 0
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.set = function(b) {
      e.prototype.set.call(this, b);
      this.ja = source.ja
    };
    c.prototype.hf = function(b, a, d) {
      if(d) {
        if(d instanceof c) {
          d.ja = this.ja
        }
      }else {
        d = new c, d.ja = this.ja
      }
      return e.prototype.hf.call(this, b, a, d)
    };
    return c
  });
  l("goo/animation/clip/JointChannel", ["goo/animation/clip/TransformChannel", "goo/animation/clip/JointData"], function(e, c) {
    function b(a, c, f, g, i, h) {
      e.call(this, b.wb + c, f, g, i, h);
      this.po = a;
      this.ja = c
    }
    b.prototype = Object.create(e.prototype);
    b.wb = "_jnt";
    b.prototype.Ic = function(a, b, c) {
      e.prototype.Ic.call(this, a, b, c);
      c.ja = this.ja
    };
    b.prototype.Lh = function(a) {
      a = a ? a : new c;
      e.prototype.al.call(this, 0, a);
      a.ja = this.ja;
      return a
    };
    return b
  });
  l("goo/animation/blendtree/ExclusiveClipSource", ["goo/animation/clip/JointChannel", "goo/animation/blendtree/ClipSource"], function(e, c) {
    function b(a, b) {
      c.call(this, a, b);
      this.Pd = {}
    }
    b.prototype = Object.create(c.prototype);
    b.prototype.Pj = function() {
      if(arguments.length === 1 && typeof arguments[0] === "object") {
        for(var a = 0;a < arguments[0].length;a++) {
          this.Pd[arguments[0][a]] = !0
        }
      }else {
        for(a = 0;a < arguments.length;a++) {
          this.Pd[arguments[a]] = !0
        }
      }
    };
    b.prototype.Qj = function() {
      if(arguments.length === 1 && typeof arguments[0] === "object") {
        for(var a = 0;a < arguments[0].length;a++) {
          var b = e.wb + arguments[0][a];
          this.Pd[b] = !0
        }
      }else {
        for(a = 0;a < arguments.length;a++) {
          b = e.wb + arguments[a], this.Pd[b] = !0
        }
      }
    };
    return b
  });
  l("goo/animation/blendtree/FrozenClipSource", [], function() {
    function e(c, b) {
      this.Wg = c;
      this.Kj = b
    }
    e.prototype.Y = function(c) {
      this.Wg.Y(c, 0)
    };
    e.prototype.setTime = function(c, b) {
      this.Wg.setTime(this.Kj, b);
      return!0
    };
    return e
  });
  l("goo/animation/blendtree/InclusiveClipSource", ["goo/animation/clip/JointChannel", "goo/animation/blendtree/ClipSource"], function(e, c) {
    function b(a, b) {
      c.call(this, a, b);
      this.Qd = {}
    }
    b.prototype = Object.create(c.prototype);
    b.prototype.Rj = function() {
      if(arguments.length === 1 && typeof arguments[0] === "object") {
        for(var a = 0;a < arguments[0].length;a++) {
          this.Qd[arguments[0][a]] = !0
        }
      }else {
        for(a = 0;a < arguments.length;a++) {
          this.Qd[arguments[a]] = !0
        }
      }
    };
    b.prototype.ah = function() {
      if(arguments.length === 1 && typeof arguments[0] === "object") {
        for(var a = 0;a < arguments[0].length;a++) {
          var b = e.wb + arguments[0][a];
          this.Qd[b] = !0
        }
      }else {
        for(a = 0;a < arguments.length;a++) {
          b = e.wb + arguments[a], this.Qd[b] = !0
        }
      }
    };
    return b
  });
  l("goo/animation/blendtree/ManagedTransformSource", ["goo/animation/clip/JointChannel", "goo/animation/clip/JointData", "goo/math/Vector3", "goo/math/Quaternion"], function(e, c) {
    function b(a) {
      this.Xg = a ? a : r;
      this.Xe = {}
    }
    b.prototype.Y = H();
    b.prototype.setTime = function() {
      return!0
    };
    b.prototype.ki = function(a, b) {
      var f = e.wb + a;
      this.Xe[f] ? this.Xe[f].set(b) : this.Xe[f] = new c(b)
    };
    b.prototype.jl = function(a, b, f) {
      for(var g = 0, i = f.length;g < i;g++) {
        var h = a.Cb.Kk(f[g]), k = new c;
        k.ja = h;
        this.ki(h, b.uh(e.wb + h).Lh(k))
      }
    };
    b.prototype.il = function(a, b) {
      for(var f = 0, g = b.length;f < g;f++) {
        var i = b[f], h = new c;
        h.ja = i;
        this.ki(i, a.uh(e.wb + i).Lh(h))
      }
    };
    return b
  });
  l("goo/animation/layer/LayerLERPBlender", ["goo/animation/blendtree/BinaryLERPSource"], function() {
    return function() {
      this.ro = this.qo = this.Wc = r
    }
  });
  l("goo/loaders/JsonUtils", "goo/renderer/Util,goo/renderer/MeshData,goo/renderer/BufferUtils,goo/math/Transform,goo/math/Matrix3x3,goo/math/Vector3,goo/animation/blendtree/ClipSource,goo/animation/layer/AnimationLayer,goo/animation/state/SteadyState,goo/animation/state/FadeTransitionState,goo/animation/state/FrozenTransitionState,goo/animation/state/IgnoreTransitionState,goo/animation/state/ImmediateTransitionState,goo/animation/state/SyncFadeTransitionState,goo/animation/state/StateBlendType,goo/animation/blendtree/BinaryLERPSource,goo/animation/blendtree/ExclusiveClipSource,goo/animation/blendtree/FrozenClipSource,goo/animation/blendtree/InclusiveClipSource,goo/animation/blendtree/ManagedTransformSource,goo/animation/layer/LayerLERPBlender".split(","), 
  function(e, c, b, a, d, f, g, i, h, k, m, j, l, s, p, o, u, w, A, v, z) {
    function t() {
    }
    t.yc = function(a, b, c, d, e) {
      var b = b.K(c), c = d.length, f = a.length / d.length, g, i, h, k, j;
      for(j = 0;j < c;j++) {
        for(k = g = 0;k < f;k++) {
          i = a.charCodeAt(k + j * f), h = k * c + j, g += t.fg(i), b[h] = (g + e[j]) * d[j]
        }
      }
    };
    t.xc = function(a, b, c) {
      b = b.K(c);
      for(c = 0;c < a.length;c++) {
        b[c] = a[c]
      }
    };
    t.Ih = function(a, c) {
      var d = b.pf(a.length, c);
      d.set(a);
      return d
    };
    t.Jh = function(a, c) {
      for(var d = 0, e = b.pf(a.length, c), f = 0;f < a.length;++f) {
        d += t.fg(a.charCodeAt(f)), e[f] = d
      }
      return e
    };
    t.fg = function(a) {
      a >= 57344 && (a -= 2048);
      a -= 35;
      return a >> 1 ^ -(a & 1)
    };
    t.$h = function(b) {
      var c = new a;
      c.t = t.ai(b.On);
      c.scale = t.ai(b.wn);
      c.rotation = t.zl(b.sn);
      return c
    };
    t.zl = function(a) {
      var b = new d;
      b.g = a[0];
      b.i = a[1];
      b.h = a[2];
      b.f = a[3];
      b.d = a[4];
      b.e = a[5];
      b.b = a[6];
      b.c = a[7];
      b.a = a[8];
      return b
    };
    t.ai = function(a) {
      return new f(a[0], a[1], a[2])
    };
    t.Bp = function(a, b, c, d, e) {
      var e = e.ln, f;
      for(f in e) {
        var g;
        "DEFAULT" === f ? g = a.hp() : (g = new i(f), a.Co(g));
        var h = e[f];
        t.yl(a, g, h);
        if(h.mj) {
          for(var k = h.mj, j = 0, m = k.length;j < m;j++) {
            t.Dl(k[j], c, d, a, g)
          }
        }
        if(h.Se) {
          var h = h.Se, v;
          for(v in h) {
            g.Eb[v] = t.Uf(h[v])
          }
        }
      }
      b !== r && b.mb(d)
    };
    t.Dl = function(a, b, c, d, e) {
      var f = new h(a.$a ? a.$a : "unknown");
      if(a.Gd) {
        var i = a.Gd, b = b[i.$a], k = new g(b, d);
        f.Zd = k;
        c.ae[k.Ab.Ta] = k;
        t.ue(b, i, d)
      }else {
        if(a.qj) {
          f.Zd = t.te(a.qj, b, c, d)
        }
      }
      if(a.Ui) {
        f.Ye = t.Uf(a.Ui)
      }
      if(a.Se) {
        var c = a.Se, j;
        for(j in c) {
          f.Eb[j] = t.Uf(c[j])
        }
      }
      a.Ym && e.xe(f, !0);
      e.dd[f.Ta] = f
    };
    t.Uf = function(a) {
      var b = a[2];
      if("fade" === b) {
        b = new k(a[3], a[4], p[a[5]])
      }else {
        if("syncfade" === b) {
          b = new s(a[3], a[4], p[a[5]])
        }else {
          if("frozen" === b) {
            b = new m(a[3], a[4], p[a[5]])
          }else {
            if("immediate" === b) {
              b = new l(a[3])
            }else {
              if("ignore" === b) {
                b = new j
              }else {
                return r
              }
            }
          }
        }
      }
      isNaN(a[0]) || b.Yp(a[0]);
      isNaN(a[1]) || b.Up(a[1]);
      return b
    };
    t.te = function(a, b, c, d) {
      if(a.Gd) {
        var a = a.Gd, b = b[a.$a], e = new g(b, d);
        c.ae[e.Ab.Ta] = e;
        t.ue(b, a, d);
        return e
      }else {
        if(a.Yi) {
          a = a.Yi;
          b = b[a.$a];
          e = new A(b, d);
          c.ae[e.Ab.Ta] = e;
          t.ue(b, a, d);
          a.Ie && e.Rj(a.Ie);
          if(a.Le) {
            var d = d.kp(0).jp(), b = a.Le, f;
            for(f in b) {
              e.ah(d.Kk(f))
            }
          }
          a.xb && e.ah(a.xb);
          return e
        }else {
          if(a.Vi) {
            return a = a.Vi, b = b[a.$a], e = new u(b, d), c.ae[e.Ab.Ta] = e, t.ue(b, a, d), a.Ie && e.Pj(a.Ie), a.xb && e.Qj(a.xb), e
          }else {
            if(a.bj) {
              a = a.bj;
              e = t.te(a.Hm, b, c, d);
              f = t.te(a.Im, b, c, d);
              e = new o(e, f);
              if(a.Ge) {
                e.Wc = a.Ge, d.Nj[e.Wc] = isNaN(a.He) ? 0 : a.He
              }
              return e
            }else {
              if(a.cj) {
                a = a.cj;
                e = new v;
                if(a.$i) {
                  a = a.$i, e.Xg = a.Gd, b = b[e.Xg], a.Le && e.jl(d.io[0], b, a.Le), a.aj && e.il(b, a.aj)
                }
                return e
              }else {
                if(a.Xi) {
                  return a = a.Xi, d = t.te(a.Gm, b, c, d), new w(d, isNaN(a.pj) ? 0 : a.pj)
                }
              }
            }
          }
        }
      }
      console.warn("no known source type found.");
      return r
    };
    t.ue = function(a, b, c) {
      if(b.Ig !== q) {
        c.le(a).Lj = isNaN(b.Ig) ? 1 : b.Ig
      }
      if(b.Bg !== q) {
        c.le(a).Ze = isNaN(b.Bg) ? 1 : b.Bg
      }
      if(b.Ci !== q) {
        c.le(a).We = b.Ci === !0
      }
    };
    t.yl = function(a, b, c) {
      if(c.Di) {
        var d = r;
        if("lerp" === c.Di) {
          d = new z, b.Aj = d
        }
        if(d !== r && c.Ge) {
          d.Wc = c.Ge, a.Nj[d.Wc] = isNaN(c.He) ? 0 : c.He
        }
      }
    };
    t.Cp = function(a, b) {
      var c = a.Mn;
      if(c) {
        if(b) {
          var d = a.Ln;
          return t.td(c, [d[1]], [d[0]])
        }else {
          return c
        }
      }
      return r
    };
    t.Dp = function(a, b) {
      var c = a.dn;
      if(c) {
        if(b) {
          var d = a.cn;
          return t.td(c, [d[1]], [d[0]])
        }else {
          return c
        }
      }
      return r
    };
    t.Ep = function(a, b, c) {
      return(a = a.tn) ? c ? (b = 1 - (b + 1 >> 1), c = 1 / -b, t.td(a, [c, c, c, c], [b, b, b, b])) : t.Al(a) : r
    };
    t.Gp = function(a, b, c) {
      var d = a.Yn;
      if(d) {
        d === q && console.log("asdf");
        for(var a = d[0], c = d[1], d = d[2], e = [], f = 0;f < b;f++) {
          e[f * 3 + 0] = a, e[f * 3 + 1] = c, e[f * 3 + 2] = d
        }
        return e
      }
      return(b = a.Qn) ? c ? (a = a.Pn, c = a[3], t.td(b, [c, c, c], [a[0], a[1], a[2]])) : t.bi(b) : r
    };
    t.Fp = function(a, b, c) {
      var d = a.Xn;
      if(d) {
        for(var a = d, c = a[0], d = a[1], a = a[2], e = [], f = 0;f < b;f++) {
          e[f * 3 + 0] = c, e[f * 3 + 1] = d, e[f * 3 + 2] = a
        }
        return e
      }
      return(b = a.yn) ? c ? (a = a.xn, c = a[0], d = a[1], e = a[2], a = a[3], t.td(b, [a, a, a], [c, d, e])) : t.bi(b) : r
    };
    t.Al = function(a) {
      if(!a) {
        return r
      }
      for(var b = [], c = new Quaternion, d = 0, e = a.length;d < e;d++) {
        var f = a[d];
        if(f) {
          if("*" === f) {
            b[d * 4 + 0] = c.x, b[d * 4 + 1] = c.y, b[d * 4 + 2] = c.j, b[d * 4 + 3] = c.qa
          }
        }else {
          if(f && f.length === 4) {
            c.set(f[0], f[1], f[2], f[3]), b[d * 4 + 0] = c.x, b[d * 4 + 1] = c.y, b[d * 4 + 2] = c.j, b[d * 4 + 3] = c.qa
          }
        }
      }
      return b
    };
    t.bi = function(a) {
      if(!a) {
        return r
      }
      for(var b = [], c = new f, d = 0, e = a.length;d < e;d++) {
        var g = a[d];
        if(g) {
          if("*" === g) {
            b[d * 3 + 0] = c.x, b[d * 3 + 1] = c.y, b[d * 3 + 2] = c.j
          }
        }else {
          if((g = g.isArray()) && g.length === 3) {
            c.set(g[0], g[1], g[2]), b[d * 3 + 0] = c.x, b[d * 3 + 1] = c.y, b[d * 3 + 2] = c.j
          }
        }
      }
      return b
    };
    t.td = function(a, b, c) {
      var d = [], e = b.length, f = a.length / b.length, g, i, h, k, j;
      for(j = 0;j < e;j++) {
        for(k = g = 0;k < f;k++) {
          i = a.charCodeAt(k + j * f), h = k * e + j, g += t.fg(i), d[h] = (g + c[j]) * b[j]
        }
      }
      return d
    };
    return t
  });
  l("goo/animation/Joint", ["goo/math/Transform"], function(e) {
    function c(b) {
      this.Ta = b;
      this.bf = this.yj = 0;
      this.$c = new e
    }
    c.Dg = -32768;
    return c
  });
  l("goo/animation/Skeleton", [], function() {
    return function(e, c) {
      this.Ta = e;
      this.Vb = c
    }
  });
  l("goo/animation/SkeletonPose", ["goo/math/Transform", "goo/animation/Joint", "goo/math/Matrix4x4"], function(e, c, b) {
    function a(a) {
      this.Cb = a;
      this.bb = [];
      this.Zc = [];
      this.$e = [];
      this.Vg = [];
      for(var a = this.Cb.Vb.length, c = 0;c < a;c++) {
        this.bb[c] = new e
      }
      for(c = 0;c < a;c++) {
        this.Zc[c] = new e
      }
      for(c = 0;c < a;c++) {
        this.$e[c] = new b
      }
      this.li()
    }
    a.prototype.li = function() {
      for(var a = new e, b = 0;b < this.bb.length;b++) {
        this.bb[b].copy(this.Cb.Vb[b].$c);
        this.bb[b].ma(this.bb[b]);
        var g = this.Cb.Vb[b].bf;
        g !== c.Dg && (a.multiply(this.Cb.Vb[g].$c, this.bb[b]), this.bb[b].copy(a))
      }
      this.um()
    };
    a.prototype.um = function() {
      for(var a = this.Cb.Vb.length, e = 0;e < a;e++) {
        var g = e, i = this.Cb.Vb[g].bf;
        i !== c.Dg ? this.Zc[g].multiply(this.Zc[i], this.bb[g]) : this.Zc[g].copy(this.bb[g]);
        b.ka(this.Zc[g].M, this.Cb.Vb[g].$c.M, this.$e[g]);
        this.$e[g].Ia()
      }
      this.Lk()
    };
    a.prototype.Lk = function() {
      for(var a = this.Vg.length;--a >= 0;) {
        this.Vg[a].Lp(this)
      }
    };
    return a
  });
  l("goo/animation/clip/AnimationClip", [], function() {
    function e(c, b) {
      this.Ta = c;
      this.Tb = b || [];
      this.Td = 0;
      this.nm()
    }
    e.prototype.update = function(c, b) {
      for(var a = 0, d = this.Tb.length;a < d;++a) {
        var e = this.Tb[a], g = b.gp(e);
        e.rm(c, g)
      }
    };
    e.prototype.uh = function(c) {
      for(var b = 0, a = this.Tb.length;b < a;++b) {
        var d = this.Tb[b];
        if(c === d.wj) {
          return d
        }
      }
      return r
    };
    e.prototype.nm = function() {
      this.Td = 0;
      for(var c, b = 0;b < this.Tb.length;b++) {
        if(c = this.Tb[b].Yk(), c > this.Td) {
          this.Td = c
        }
      }
    };
    e.prototype.toString = function() {
      return this.Ta + this.Tb.length
    };
    return e
  });
  l("goo/animation/clip/TriggerData", [], function() {
    return function() {
      this.oo = [];
      this.no = -1;
      this.jo = !1
    }
  });
  l("goo/animation/clip/InterpolatedFloatChannel", ["goo/animation/clip/AbstractAnimationChannel", "goo/animation/clip/TriggerData", "goo/math/MathUtils"], function(e, c, b) {
    function a(a, b, c) {
      e.call(this, a, b);
      this.$g = c ? c.slice(0) : r
    }
    a.prototype = Object.create(e.prototype);
    a.prototype.Ic = function(a, c) {
      store[0] = b.Dc(c, this.$g[a], this.$g[a + 1])
    };
    return a
  });
  l("goo/animation/state/loader/OutputStore", [], function() {
    return function() {
      this.ko = [];
      this.ae = {}
    }
  });
  l("goo/util/URLTools", [], function() {
    function e() {
    }
    e.getDirectory = function(c) {
      var b = /.*\//.exec(c);
      return!b ? c + "/" : b[0]
    };
    return e
  });
  l("goo/loaders/JSONImporter", "goo/entities/components/TransformComponent,goo/renderer/MeshData,goo/loaders/JsonUtils,goo/entities/components/MeshDataComponent,goo/entities/components/MeshRendererComponent,goo/renderer/Material,goo/renderer/TextureCreator,goo/renderer/Shader,goo/animation/Joint,goo/animation/Skeleton,goo/animation/SkeletonPose,goo/animation/clip/AnimationClip,goo/animation/clip/JointChannel,goo/animation/clip/TransformChannel,goo/animation/clip/InterpolatedFloatChannel,goo/animation/state/loader/OutputStore,goo/util/URLTools,goo/util/SimpleResourceUtil".split(","), 
  function(e, c, b, a, d, f, g, i, h, k, m, j, l, s, p, o, u) {
    function w(a) {
      this.C = a;
      this.W = {};
      this.mi = {};
      this.ci = {};
      this.ni = {Gb:0, Oa:1, Uj:2, yp:3, oi:3};
      this.Nf = [];
      this.dh = ""
    }
    function A() {
      this.se = "not set";
      this.cm = this.profile = r;
      this.dm = {};
      this.Qb = {};
      this.ri = {};
      this.pi = {};
      this.vm = !1;
      this.T = {};
      this.So = []
    }
    w.prototype.load = function(a, b, c, d) {
      var e = new XMLHttpRequest;
      b == r && (b = u.getDirectory(a));
      e.open("GET", a, !0);
      var f = this;
      e.onreadystatechange = function() {
        if(e.readyState === 4) {
          if(e.status >= 200 && e.status <= 299) {
            var a = f.parse(e.responseText, b, d);
            c.mb(a)
          }else {
            c.Nb(e.statusText)
          }
        }
      };
      e.send()
    };
    w.prototype.parse = function(a, b, c) {
      this.dh = b || "";
      this.Nf = [];
      this.$f = c;
      a = JSON.parse(a);
      if(this.qb = a.co || !1) {
        this.mk = a.Lm || 16383, this.lk = a.Jm || 255, this.kh = a.Km || 1023
      }
      this.Cj(a.nn);
      a.lj && this.Cl(a.lj);
      a.kj && this.Bl(a.kj);
      this.Ug(a.zn);
      delete this.$f;
      return this.Nf
    };
    w.prototype.Ug = function(e) {
      var f = e.Rn, g = e.$a === r ? "null" : e.$a, i = this.C.ie();
      i.name = g;
      this.Nf.push(i);
      if(f === "Node") {
        if(e.rg) {
          for(var h in e.rg) {
            f = this.Ug(e.rg[h]), f !== r && i.H.Zj(f.H)
          }
        }
      }else {
        if(f === "Mesh") {
          h = this.Tg(e.ej, 0, f);
          if(h === r) {
            return r
          }
          h.type = c.Cg;
          i.Z(new a(h));
          f = new d;
          i.Z(f);
          this.Sg(e, i)
        }else {
          if(f === "SkinnedMesh") {
            h = this.Tg(e.ej, 4, f);
            if(h === r) {
              return r
            }
            h.type = c.jj;
            i.Z(new a(h));
            f = new d;
            i.Z(f);
            this.Sg(e, i);
            if(e.gj) {
              h.Zo = this.ci[e.gj]
            }
          }else {
            return
          }
        }
      }
      e = b.$h(e.Nn);
      i.H.transform = e;
      return i
    };
    w.prototype.Cl = function(a) {
      for(var c = 0, d = a.length;c < d;c++) {
        for(var e = a[c], f = e.Ll, g = e.$a, e = e.xb, i = [], j = 0, m = e.length;j < m;j++) {
          var l = e[j], o = new h(l.$a);
          o.yj = Math.round(l.fn);
          o.bf = Math.round(l.qn);
          o.$c.copy(b.$h(l.hn));
          o.$c.update();
          i[j] = o
        }
        g = new k(g, i);
        this.mi[f] = g
      }
    };
    w.prototype.Bl = function(a) {
      for(var b = 0, c = a.length;b < c;b++) {
        var d = a[b], e = d.Ll, d = new m(this.mi[d.Cn]);
        d.li();
        this.ci[e] = d
      }
    };
    w.prototype.Tg = function(a, d, e) {
      var f = a.fo;
      if(f === 0) {
        return r
      }
      var g = a.Ke ? a.Ke[0] : 0, i = {};
      if(a.Te) {
        i.F = c.createAttribute(3, "Float")
      }
      if(a.Me) {
        i.Q = c.createAttribute(3, "Float")
      }
      if(a.Qe) {
        i.Vc = c.createAttribute(4, "Float")
      }
      if(a.Je) {
        i.Sb = c.createAttribute(4, "Float")
      }
      if(d > 0 && a.Ve) {
        i.Ue = c.createAttribute(4, "Float")
      }
      if(d > 0 && a.xb) {
        i.yg = c.createAttribute(4, "Short")
      }
      if(a.Re) {
        for(var h in a.Re) {
          i["TEXCOORD" + h] = c.createAttribute(2, "Float")
        }
      }
      d = new c(i, f, g);
      if(a.Te) {
        this.qb ? (h = a.ho, b.yc(a.Te, d, c.F, [a.Kg, a.Kg, a.Kg], [h.tq, h.uq, h.vq])) : b.xc(a.Te, d, c.F)
      }
      a.Ve && (this.qb ? (g = 1 / this.mk, b.yc(a.Ve, d, c.Ue, [g], [0])) : b.xc(a.Ve, d, c.Ue));
      a.Me && (this.qb ? (h = 1 - (this.kh + 1 >> 1), g = 1 / -h, b.yc(a.Me, d, c.Q, [g, g, g], [h, h, h])) : b.xc(a.Me, d, c.Q));
      a.Qe && (this.qb ? (h = 1 - (this.kh + 1 >> 1), g = 1 / -h, b.yc(a.Qe, d, c.Vc, [g, g, g, g], [h, h, h, h])) : b.xc(a.Qe, d, c.Vc));
      a.Je && (this.qb ? (h = 0, g = 255 / (this.lk + 1), b.yc(a.Je, d, c.Sb, [g, g, g, g], [h, h, h, h])) : b.xc(a.Je, d, c.Sb));
      if(a.Re) {
        if(g = a.Re, this.qb) {
          for(h = 0;h < g.length;h++) {
            i = g[h], b.yc(i.Vn, d, "TEXCOORD" + h, i.Un, i.Tn)
          }
        }else {
          for(h = 0;h < g.length;h++) {
            b.xc(g[h], d, "TEXCOORD" + h)
          }
        }
      }
      if(a.xb) {
        if(g = d.K(c.yg), i = this.qb ? b.Jh(a.xb, 32767) : b.Ih(a.xb, 32767), e === "SkinnedMesh") {
          var e = [], j = 0;
          h = 0;
          for(var k = i.length;h < k;h++) {
            var m = i[h];
            e[m] === q && (e[m] = j++);
            g.set([e[m]], h)
          }
          h = [];
          for(m = 0;m < e.length;m++) {
            j = e[m], j !== q && (h[j] = m)
          }
          d.Ap = h
        }else {
          h = 0;
          for(k = i.Lo();h < k;h++) {
            g.Np(h, i.get(h))
          }
        }
      }
      a.wg && (this.qb ? d.va().set(b.Jh(a.wg, f)) : d.va().set(b.Ih(a.wg, f)));
      if(a.Zi) {
        if(f = a.Zi, f.length === 1) {
          d.cc[0] = f[0]
        }else {
          e = [];
          for(h = 0;h < f.length;h++) {
            e[h] = f[h]
          }
          d.cc = e
        }
      }
      if(a.Ke) {
        a = a.Ke;
        f = [];
        for(h = 0;h < a.length;h++) {
          f[h] = a[h]
        }
        d.qd = f
      }
      return d
    };
    w.prototype.Cj = function(a) {
      if(a) {
        for(var b = 0, c = a.length;b < c;b++) {
          var d = a[b];
          if(d !== r) {
            var e = new A;
            e.se = d.mn;
            e.profile = d.rn;
            e.cm = d.In;
            e.vm = d.eo;
            e.T = this.Dj(d);
            if(d.oj) {
              for(var d = d.oj, f = 0, g = d.length;f < g;f++) {
                var h = d[f], i = h.Dn, j = h.Jn || r, k = h.Kn || r, m = h.on || r, l = "Trilinear";
                if(m !== r) {
                  try {
                    l = "minificationFilterStr"
                  }catch(o) {
                    console.warn("Bad texture minification filter: " + m)
                  }
                }
                h = h.Wi !== q ? h.Wi : !0;
                e.dm[i] = j;
                e.Qb[i] = k;
                e.ri[i] = l;
                e.pi[i] = h
              }
            }
            this.W[e.se] = e
          }
        }
      }
    };
    w.prototype.Sg = function(a, b) {
      if(a.dj) {
        var c = this.W[a.dj];
        if(c !== q) {
          var d = b.X, e = b.Vh.Mb.ib, h = new f(c.se);
          if(this.$f) {
            e = this.$f(e, c)
          }else {
            var j;
            e.Q && e.Vc && e.I && e.Gg && e.Hg && c.Qb.Gb && c.Qb.Oa && c.Qb.Uj ? (e = f.Jc.fm, j = "texturedNormalAOLit") : e.Q && e.I && c.Qb.Gb ? (e = f.Jc.si, j = "texturedLit") : e.I && c.Qb.Gb ? (e = f.Jc.em, j = "textured") : (e = f.Jc.am, j = "simple");
            e = new i(c.se + "_Shader_" + j, e)
          }
          h.ea = e;
          d.W[0] = h;
          h.T = c.T;
          for(var k in this.ni) {
            c.Qb[k] !== q && (d = c.Qb[k], e = c.ri[k], j = c.pi[k], d = this.vp !== q ? (new g).rq(e).sq(j).qq(_useCache).qp(nameResolver.Sp(d)) : (new g).Mf(this.dh + d), h.Lc[this.ni[k]] = d)
          }
        }
      }
    };
    w.prototype.Dj = function(a) {
      var b = {};
      b.Tj = this.Ud(a.zm);
      b.Gb = this.Ud(a.Zm);
      b.Ik = this.Ud(a.an);
      b.oi = this.Ud(a.En);
      b.Zl = a.An;
      return b
    };
    w.prototype.Ud = function(a) {
      return(a = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})*$/i.exec(a)) ? {nb:parseInt(a[1], 16) / 255, lb:parseInt(a[2], 16) / 255, jb:parseInt(a[3], 16) / 255, hb:a[4] !== q ? parseInt(a[4], 16) / 255 : 1} : r
    };
    return w
  });
  l("goo/entities/components/ScriptComponent", ["goo/entities/components/Component"], function(e) {
    function c(b) {
      this.type = "ScriptComponent";
      this.Wf = b
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.ob = function(b) {
      this.Wf && this.Wf.ob && this.Wf.ob(b)
    };
    return c
  });
  l("goo/util/DebugUI", [], function() {
    return function(e) {
      var c = this;
      e.mf.push(function() {
        var b = e.C.ac.Df(), a;
        for(a in b) {
          e.C.ih(b[a])
        }
      });
      jQuery(function(b) {
        function a() {
          this.type = "UIManager"
        }
        var d = b("<div/>", {id:"debug", click:function() {
          b(this).toggle()
        }});
        d.Yo({position:"absolute", "z-index":"2", padding:"5px", "background-color":"gray", left:"10px", top:"10px", border:"1px solid black"});
        d.be(document.body);
        var f = b("<ul>").be(d);
        c.root = d;
        a.prototype = {rc:function() {
          this.gg(e.C.ac.Gf())
        }, Gc:function() {
          this.gg(e.C.ac.Gf())
        }, nf:function() {
          this.gg(e.C.ac.Gf())
        }, gg:function(a) {
          f.empty();
          for(var c in a) {
            var d = a[c];
            b("<li>").be(f).append(d.toString()).append(" - " + (d.X !== q ? d.X.sb : "none") + ", " + d.Kf).append(" - " + (d.H !== q ? d.H.transform : ""));
            d.H && this.wi(d.H.children, 1, f)
          }
        }, wi:function(a, c, d) {
          if(!(a.length <= 0)) {
            var d = b("<ul>").be(d), e;
            for(e in a) {
              var f = a[e], j = f.wc.X, l = j !== q ? j.sb : "none", j = j !== q ? j.W[0] : q, j = j !== q ? j.ea : "nope";
              b("<li>").be(d).append(f.wc.toString()).append(" - " + l + ", " + f.wc.Kf).append(" - " + j).append(" - " + f.transform);
              this.wi(f.children, c + 1, d)
            }
          }
        }};
        e.C.Xf(new a)
      })
    }
  });
  l("goo/shapes/Box", ["goo/renderer/MeshData"], function(e) {
    function c(b, a, c, f, g) {
      this.og = b !== q ? b * 0.5 : 0.5;
      this.pg = a !== q ? a * 0.5 : 0.5;
      this.xm = c !== q ? c * 0.5 : 0.5;
      this.ag = f || 1;
      this.bg = g || 1;
      b = e.ld([e.F, e.Q, e.I]);
      e.call(this, b, 24, 36);
      this.Ob()
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Ob = function() {
      var b = this.og, a = this.pg, c = this.xm, f = this.ag, g = this.bg, i = [-b, -a, -c, b, -a, -c, b, a, -c, -b, a, -c, b, -a, c, -b, -a, c, b, a, c, -b, a, c], h = [];
      (function(a) {
        for(var b = 0;b < a.length;b++) {
          var c = a[b] * 3;
          h.push(i[c]);
          h.push(i[c + 1]);
          h.push(i[c + 2])
        }
      })([0, 1, 2, 3, 1, 4, 6, 2, 4, 5, 7, 6, 5, 0, 3, 7, 2, 6, 7, 3, 0, 5, 4, 1]);
      this.K(e.F).set(h);
      var k = [0, 0, -1, 1, 0, 0, 0, 0, 1, -1, 0, 0, 0, 1, 0, 0, -1, 0], m = [];
      (function() {
        for(var a = 0;a < k.length / 3;a++) {
          for(var b = 0;b < 4;b++) {
            var c = a * 3;
            m.push(k[c]);
            m.push(k[c + 1]);
            m.push(k[c + 2])
          }
        }
      })();
      this.K(e.Q).set(m);
      b = [];
      for(a = 0;a < 6;a++) {
        b.push(f), b.push(0), b.push(0), b.push(0), b.push(0), b.push(g), b.push(f), b.push(g)
      }
      this.K(e.I).set(b);
      this.va().set([2, 1, 0, 3, 2, 0, 6, 5, 4, 7, 6, 4, 10, 9, 8, 11, 10, 8, 14, 13, 12, 15, 14, 12, 18, 17, 16, 19, 18, 16, 22, 21, 20, 23, 22, 20]);
      return this
    };
    return c
  });
  l("goo/shapes/Quad", ["goo/renderer/MeshData"], function(e) {
    function c(b, a, c, f) {
      this.og = b !== q ? b * 0.5 : 0.5;
      this.pg = a !== q ? a * 0.5 : 0.5;
      this.ag = c || 1;
      this.bg = f || 1;
      b = e.ld([e.F, e.Q, e.I]);
      e.call(this, b, 4, 6);
      this.Ob()
    }
    c.prototype = Object.create(e.prototype);
    c.prototype.Ob = function() {
      var b = this.og, a = this.pg, c = this.ag, f = this.bg;
      this.K(e.F).set([-b, -a, 0, -b, a, 0, b, a, 0, b, -a, 0]);
      this.K(e.Q).set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
      this.K(e.I).set([0, 0, 0, f, c, f, c, 0]);
      this.va().set([0, 3, 1, 1, 3, 2]);
      return this
    };
    return c
  });
  l("goo/shapes/Sphere", ["goo/renderer/MeshData", "goo/util/Enum", "goo/math/Vector3", "goo/math/MathUtils"], function(e, c, b, a) {
    function d(a, b, c, f) {
      this.Pc = a !== q ? a : 8;
      this.Ga = b !== q ? b : 8;
      this.Ha = c !== q ? c : 0.5;
      this.Rb = f !== q ? f : d.ab.Jd;
      this.rb = !1;
      a = e.ld([e.F, e.Q, e.I]);
      e.call(this, a, (this.Pc - 2) * (this.Ga + 1) + 2, 6 * (this.Pc - 2) * this.Ga);
      this.Ob()
    }
    function f(a, b, c) {
      a[c * 3 + 0] = a[b * 3 + 0];
      a[c * 3 + 1] = a[b * 3 + 1];
      a[c * 3 + 2] = a[b * 3 + 2]
    }
    d.prototype = Object.create(e.prototype);
    d.prototype.Ob = function() {
      for(var c = this.K(e.F), i = this.K(e.Q), h = this.K(e.I), k = this.va(), m = 1 / this.Ga, j = 2 / (this.Pc - 1), l = [], s = [], p = 0;p < this.Ga;p++) {
        var o = a.Pe * m * p;
        s[p] = Math.cos(o);
        l[p] = Math.sin(o)
      }
      l[this.Ga] = l[0];
      s[this.Ga] = s[0];
      for(var o = 0, u = new b, w = new b, A = new b, v = 1;v < this.Pc - 1;v++) {
        var z = a.Sc * (-1 + j * v), t = Math.sin(z), p = this.Ha * t, x = w.set(0, 0, 0);
        x.j += p;
        for(var D = Math.sqrt(Math.abs(this.Ha * this.Ha - p * p)), B, C = o, p = 0;p < this.Ga;p++) {
          var F = p * m;
          B = A.set(s[p], l[p], 0);
          b.D(B, D, u);
          c[o * 3 + 0] = x.x + u.x;
          c[o * 3 + 1] = x.y + u.y;
          c[o * 3 + 2] = x.j + u.j;
          B = u.set(c[o * 3 + 0], c[o * 3 + 1], c[o * 3 + 2]);
          B.normalize();
          this.rb ? (i[o * 3 + 0] = -B.x, i[o * 3 + 1] = -B.y, i[o * 3 + 2] = -B.j) : (i[o * 3 + 0] = B.x, i[o * 3 + 1] = B.y, i[o * 3 + 2] = B.j);
          this.Rb === d.ab.Ag ? (h[o * 2 + 0] = F, h[o * 2 + 1] = 0.5 * (t + 1)) : this.Rb === d.ab.hj ? (h[o * 2 + 0] = F, h[o * 2 + 1] = a.Sc + Math.asin(t) / Math.PI) : this.Rb === d.ab.Jd && (F = (a.Sc - Math.abs(z)) / Math.PI, B = F * l[p] + 0.5, h[o * 2 + 0] = F * s[p] + 0.5, h[o * 2 + 1] = B);
          o++
        }
        f(c, C, o);
        f(i, C, o);
        this.Rb === d.ab.Ag ? (h[o * 2 + 0] = 1, h[o * 2 + 1] = 0.5 * (t + 1)) : this.Rb === d.ab.hj ? (h[o * 2 + 0] = 1, h[o * 2 + 1] = a.en * (a.Sc + Math.asin(t))) : this.Rb === d.ab.Jd && (F = (a.Sc - Math.abs(z)) / Math.PI, h[o * 2 + 0] = F + 0.5, h[o * 2 + 1] = 0.5);
        o++
      }
      c[o * 3 + 0] = 0;
      c[o * 3 + 1] = 0;
      c[o * 3 + 2] = -this.Ha;
      this.rb ? (i[o * 3 + 0] = 0, i[o * 3 + 1] = 0, i[o * 3 + 2] = 1) : (i[o * 3 + 0] = 0, i[o * 3 + 1] = 0, i[o * 3 + 2] = -1);
      this.Rb === d.ab.Jd ? (h[o * 2 + 0] = 0.5, h[o * 2 + 1] = 0.5) : (h[o * 2 + 0] = 0.5, h[o * 2 + 1] = 0);
      o++;
      c[o * 3 + 0] = 0;
      c[o * 3 + 1] = 0;
      c[o * 3 + 2] = this.Ha;
      this.rb ? (i[o * 3 + 0] = 0, i[o * 3 + 1] = 0, i[o * 3 + 2] = -1) : (i[o * 3 + 0] = 0, i[o * 3 + 1] = 0, i[o * 3 + 2] = 1);
      this.Rb === d.ab.Jd ? (h[o * 2 + 0] = 0.5, h[o * 2 + 1] = 0.5) : (h[o * 2 + 0] = 0.5, h[o * 2 + 1] = 1);
      for(i = v = c = 0;v < this.Pc - 3;v++) {
        h = i;
        m = h + 1;
        i += this.Ga + 1;
        j = i;
        l = j + 1;
        for(o = 0;o < this.Ga;o++) {
          this.rb ? (k[c++] = h++, k[c++] = j, k[c++] = m, k[c++] = m++, k[c++] = j++, k[c++] = l++) : (k[c++] = h++, k[c++] = m, k[c++] = j, k[c++] = m++, k[c++] = l++, k[c++] = j++)
        }
      }
      for(o = 0;o < this.Ga;o++) {
        this.rb ? (k[c++] = o, k[c++] = o + 1, k[c++] = this.za - 2) : (k[c++] = o, k[c++] = this.za - 2, k[c++] = o + 1)
      }
      v = (this.Pc - 3) * (this.Ga + 1);
      for(o = 0;o < this.Ga;o++) {
        this.rb ? (k[c++] = o + v, k[c++] = this.za - 1, k[c++] = o + 1 + v) : (k[c++] = o + v, k[c++] = o + 1 + v, k[c++] = this.za - 1)
      }
      return this
    };
    d.ab = new c("Linear", "Projected", "Polar");
    return d
  });
  l("goo/shapes/Torus", ["goo/renderer/MeshData", "goo/math/Vector3", "goo/math/MathUtils"], function(e, c, b) {
    function a(a, b, c, d) {
      this.Xc = a !== q ? a : 8;
      this.Wb = b !== q ? b : 8;
      this.Mj = c !== q ? c : 2;
      this.vj = d !== q ? d : 1;
      this.rb = !1;
      a = e.ld([e.F, e.Q, e.I]);
      e.call(this, a, (this.Xc + 1) * (this.Wb + 1), 6 * this.Xc * this.Wb);
      this.Ob()
    }
    function d(a, b, c) {
      a[c * 3 + 0] = a[b * 3 + 0];
      a[c * 3 + 1] = a[b * 3 + 1];
      a[c * 3 + 2] = a[b * 3 + 2]
    }
    a.prototype = Object.create(e.prototype);
    a.prototype.Ob = function() {
      for(var a = this.K(e.F), g = this.K(e.Q), i = this.K(e.I), h = this.va(), k = 1 / this.Xc, m = 1 / this.Wb, j = 0, l = new c, s = new c, p = new c, o = 0;o < this.Xc;o++) {
        var u = o * k, w = b.Pe * u;
        l.set(Math.cos(w), Math.sin(w), 0);
        c.D(l, this.vj, s);
        for(var w = j, A = 0;A < this.Wb;A++) {
          var v = A * m, z = b.Pe * v, t = Math.cos(z), z = Math.sin(z);
          p.copy(l).D(t);
          p.j += z;
          p.normalize();
          this.rb ? (g[j * 3 + 0] = -p.x, g[j * 3 + 1] = -p.y, g[j * 3 + 2] = -p.j) : (g[j * 3 + 0] = p.x, g[j * 3 + 1] = p.y, g[j * 3 + 2] = p.j);
          p.D(this.Mj).add(s);
          a[j * 3 + 0] = p.x;
          a[j * 3 + 1] = p.y;
          a[j * 3 + 2] = p.j;
          i[j * 2 + 0] = v;
          i[j * 2 + 1] = u;
          j++
        }
        d(a, w, j);
        d(g, w, j);
        i[j * 2 + 0] = 1;
        i[j * 2 + 1] = u;
        j++
      }
      for(o = 0;o <= this.Wb;o++, j++) {
        d(a, o, j), d(g, o, j), k = i, m = o, l = j, k[l * 2 + 0] = k[m * 2 + 0], k[l * 2 + 1] = k[m * 2 + 1], i[j * 2 + 1] = 1
      }
      for(o = g = a = 0;o < this.Xc;o++) {
        i = g;
        k = i + 1;
        g += this.Wb + 1;
        m = g;
        l = m + 1;
        for(j = 0;j < this.Wb;j++) {
          this.rb ? (h[a++] = i++, h[a++] = k, h[a++] = m, h[a++] = k++, h[a++] = l++, h[a++] = m++) : (h[a++] = i++, h[a++] = m, h[a++] = k, h[a++] = k++, h[a++] = m++, h[a++] = l++)
        }
      }
      return this
    };
    return a
  });
  l("goo/entities/EntityUtils", ["goo/entities/components/TransformComponent", "goo/entities/components/MeshDataComponent", "goo/entities/components/MeshRendererComponent"], function(e, c, b) {
    function a() {
    }
    a.tk = function(a, e) {
      var g = a.ie(), i = new c(e);
      g.Z(i);
      i = new b;
      g.Z(i);
      return g
    };
    return a
  });
  l("goo/shapes/ShapeCreator", "goo/renderer/MeshData,goo/shapes/Box,goo/shapes/Quad,goo/shapes/Sphere,goo/shapes/Torus,goo/entities/EntityUtils".split(","), function(e, c, b, a, d) {
    function f() {
    }
    f.Vo = function(a, c, d, e) {
      return new b(a, c, d, e)
    };
    f.rk = function() {
      return new c(250, 5, 250, q, q)
    };
    f.Wo = function(b, c, d, e) {
      return new a(b, c, d, e)
    };
    f.Xo = function(a, b, c, e) {
      return new d(a, b, c, e)
    };
    return f
  });
  G.he({Go:"./", Kp:{lp:"../src/goo"}});
  G("goo/entities/World,goo/entities/Entity,goo/entities/systems/System,goo/entities/systems/TransformSystem,goo/entities/systems/RenderSystem,goo/entities/components/TransformComponent,goo/entities/components/MeshDataComponent,goo/entities/components/MeshRendererComponent,goo/entities/systems/PartitioningSystem,goo/renderer/MeshData,goo/renderer/Renderer,goo/renderer/Material,goo/renderer/Shader,goo/entities/GooRunner,goo/renderer/TextureCreator,goo/renderer/Loader,goo/loaders/JSONImporter,goo/entities/components/ScriptComponent,goo/util/DebugUI,goo/shapes/ShapeCreator,goo/entities/EntityUtils,goo/renderer/Texture,goo/renderer/Camera,goo/entities/components/CameraComponent,goo/math/Vector3".split(","), 
  function(e, c, b, a, d, f, g, i, h, k, m, j, l, s, p, o, u, w, A, v, z, t, x, D, B) {
    function C(a) {
      a = new u(a.C);
      a.load(E + "/girl.model", E + "/", {mb:function(a) {
        for(var b in a) {
          a[b].qc()
        }
        a[0].H.transform.scale.set(0.15, 0.15, 0.15);
        a[0].Z(new w({ob:function(a) {
          var b = a.gb.ya, a = a.H;
          a.transform.t.x = Math.sin(b) * 30;
          a.transform.t.j = Math.cos(b) * 30;
          a.transform.rotation.y = Math.sin(b * 1.5) * 3;
          a.yd()
        }}))
      }, Nb:function(a) {
        console.error(a)
      }});
      a.load(E + "/head.model", E + "/", {mb:function(a) {
        for(var b in a) {
          a[b].qc()
        }
        a[0].H.transform.scale.set(50, 50, 50);
        a[0].Z(new w({ob:function(a) {
          var b = a.gb.ya, a = a.H;
          a.transform.t.x = Math.sin(b + 3) * 30;
          a.transform.t.j = Math.cos(b + 3) * 30;
          a.transform.rotation.x = Math.sin(b) * 2;
          a.transform.rotation.y = Math.sin(b * 1.5) * 3;
          a.yd()
        }}))
      }, Nb:function(a) {
        console.error(a)
      }});
      a.load(E + "/shoes/shoes_compressed.json", E + "/shoes/textures/", {mb:function(a) {
        var b, c;
        for(c in a) {
          var d = a[c];
          if(d.name === "polySurfaceShape10[lambert2SG]") {
            b = d;
            break
          }
        }
        if(b) {
          c = {ob:function(a) {
            var b = a.gb.ya;
            a.X.W[0].T.Gb.nb = Math.sin(b * 3) * 0.5 + 0.5;
            a.X.W[0].T.Gb.lb = Math.sin(b * 2) * 0.5 + 0.5;
            a.X.W[0].T.Gb.jb = Math.sin(b * 4) * 0.5 + 0.5
          }};
          b.Z(new w(c));
          for(var e in a) {
            a[e].qc()
          }
          a[0].H.transform.t.y = -5;
          c = {ob:function(a) {
            var b = a.H;
            b.transform.rotation.y = a.gb.ya * 0.5;
            b.yd()
          }};
          a[0].Z(new w(c))
        }else {
          console.error("Could not find entity: polySurfaceShape10[lambert2SG]")
        }
      }, Nb:function(a) {
        console.error(a)
      }})
    }
    function F(a) {
      var a = a.C, b = k.ld([k.F, k.Sb, k.I]);
      b.Fn = {count:1, type:"Byte"};
      b = new k(b, 4, 6);
      b.K(k.F).set([-5, -5, 0, -5, 5, 0, 5, 5, 0, 5, -5, 0]);
      b.K(k.Sb).set([1, 0.5, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 0.5, 1, 1, 1, 1, 1, 1]);
      b.K(k.I).set([0, 0, 0, 1, 1, 1, 1, 0]);
      b.K("Stuff").set([0, 1, 2, 3]);
      b.va().set([0, 1, 3, 1, 2, 3]);
      a = a.ie();
      b = new g(b);
      a.Z(b);
      var b = new i, c = new j("QuadMaterial");
      c.ea = new l("QuadShader", {$:I("vshader"), S:I("fshader"), attributes:{Qa:k.F, lq:k.Sb, Nc:k.I, fp:"Stuff"}, z:{Aa:l.ba, wa:l.aa, Ba:l.ca, tc:l.TEXTURE0}});
      c.je.enabled = !1;
      var d = (new p).Mf(E + "/pitcher.jpg");
      c.Lc.push(d);
      b.W.push(c);
      a.Z(b);
      a.Z(new w({ob:function(a) {
        var b = a.gb.ya, a = a.H;
        a.transform.t.x = Math.sin(b + 4) * 30;
        a.transform.t.j = Math.cos(b + 4) * 30;
        a.transform.rotation.x = Math.sin(b) * 3;
        a.yd()
      }}));
      return a
    }
    function G(a) {
      var b = v.rk(), a = z.tk(a.C, b);
      a.H.transform.t.y = -15;
      a.name = "Box";
      b = new j("TestMaterial");
      b.ea = j.createShader(j.Jc.si, "BoxShader");
      var c = (new p).Mf(E + "/pitcher.jpg");
      b.Lc.push(c);
      a.X.W.push(b);
      return a
    }
    function I(a) {
      var b = document.getElementById(a);
      if(!b) {
        return r
      }
      a = "";
      for(b = b.firstChild;b;) {
        b.nodeType === 3 && (a += b.textContent), b = b.nextSibling
      }
      return a
    }
    var E = "../resources";
    (function() {
      var a = new s({$l:!0});
      a.wd.L.id = "goo";
      document.body.appendChild(a.wd.L);
      C(a);
      F(a).qc();
      G(a).qc();
      var b = new x(45, 1, 1, 1E3), a = a.C.ie("CameraEntity");
      a.Z(new D(b));
      a.qc();
      b = {ym:new B, ob:function(a) {
        var b = a.gb.ya, a = a.H;
        a.transform.t.x = Math.sin(b * 1) * 30 + 50;
        a.transform.t.y = 20;
        a.transform.t.j = Math.sin(b * 1) * 30 + 50;
        a.transform.re(this.ym, B.Md);
        a.yd()
      }};
      a.Z(new w(b))
    })()
  });
  l("start", H());
  G(["start"])
})();

