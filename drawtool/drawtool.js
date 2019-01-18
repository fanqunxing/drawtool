(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  typeof define === 'function' && define.cmd ? define(factory) :
  (global.Drawtool = factory());
})(this, function () { 'use strict';

var version = '1.3.1';
var op = Object.prototype;
var ap = Array.prototype;
var ostring = op.toString;
var hasOwn = op.hasOwnProperty;

function sin(n) {
  return Math.sin(n);
};

function cos(n) {
  return Math.cos(n);
};

function atan(n) {
  return Math.atan(n);
};

function sqrt(n) {
  return Math.sqrt(n);
};

function pow(n, m) {
  return Math.pow(n, m);
};

function isNative(ctor) {
  return typeof ctor === 'function' 
  && /native code/.test(ctor.toString());
}

function isDef(v) {
  return v !== undefined && v !== null;
};

function isTrue(v) {
  return v === true;
};

function isFalse(v) {
  return v === false;
};

function isFunction(it) {
  return ostring.call(it) === '[object Function]';
};

function isArray(it) {
  return ostring.call(it) === '[object Array]';
};

function slice(it) {
  return ap.slice.call(it);
};

function noop() {

};

function toNumber(val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n;
};

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
};

function isNotEmptyList(it) {
  return it && it.length > 0;
};

function hasProp(obj, prop) {
  return hasOwn.call(obj, prop);
};

function eachProp(obj, func) {
  var prop;
  for (prop in obj) {
    if (hasProp(obj, prop)) {
      if (func(obj[prop], prop)) {
        break;
      }
    }
  }
};

function mixin(target, source, force) {
  if (source) {
    eachProp(source, function (val, prop) {
      if (isTrue(force) || !hasProp(target, prop)) {
        target[prop] = val;
      };
    });
  };
  return target;
};

/**
 * 对函数进行aop封装
 */
function aop(option) {
  option = mixin(option, {
    before: noop,
    fun: noop,
    after: noop
  });
  return function () {
    option.before.apply(option.func, arguments);
    option.fun.apply(option.func, arguments);
    option.after.apply(option.func, arguments);
  };
};

/**
 * 简单Promise
 */
var _Promise;
if(typeof Promise !== 'undefined' && isNative(Promise)) {
  _Promise = Promise;
} else {
  _Promise = function(fn) {
    this.status = 'pending';
    var _success = noop;
    var _error = noop;
    var _value = null;
    var _self = this;
    function resolve(value) {
      _self.status = 'fulfilled';
      _value = value;
      setTimeout(function() {
        _success(value);
      }, 0);
    };
    function reject(value) {
      _self.status = 'rejected';
      _value = value;
      setTimeout(function() {
        _error(value);
      }, 0);
    };
    this.then = function (success) {
      if (_self.status == 'pending') {
        _success = success;
      } else {
        success(_value);
      };
      return _self;
    };
    this.catch = function (error) {
      if (_self.status == 'pending') {
        _error = error;
      } else {
        error(_value);
      };
      return _self;
    }; 
    fn(resolve, reject);
  }
}


/**
 * 将字符串切割成简单map，以此判断是否存在
 * @param {*} str 字符串，逗号切割
 * @param {*} expectsLowerCase 是否转换为小写
 */
function makeMap(str, expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ?
    function (val) {
      val = val || '';
      return map[val.toLowerCase()];
    } :
    function (val) {
      return map[val];
    }
};

/**
 * 等分两个点
 * @param {*} sPos 起始点 
 * @param {*} ePos 结束点
 * @param {*} num 等分数
 */
function divide(sPos, ePos, num) {
  var divideMap = {};
  var diffx = (ePos.x - sPos.x) / num;
  var diffy = (ePos.y - sPos.y) / num;
  for (var i = 0; i <= num; i++) {
    var x = sPos.x + i * diffx;
    var y = sPos.y + i * diffy;
    divideMap['d' + i] = {
      x: x,
      y: y
    };
  };
  return function (val) {
    return divideMap[val]
  };
};

/**
 * 将数组坐标转换为对象坐标
 * @param {*} list 数组坐标[x, y]
 */
function toPos(list) {
  var pos = {};
  if (isArray(list)) {
    pos = {
      x: list[0],
      y: list[1]
    };
  };
  return pos;
};

/**
 * 将对象坐标转换为数组坐标
 * @param {*} pos {x: x, y: y}
 */
function parsePos(pos) {
  var list = [];
  if (isObject(pos)) {
    list[0] = pos.x;
    list[1] = pos.y;
  }
  return list;
};

function error(msg) {
  throw new Error('drawtool.js error: ' + msg);
};

function warn(msg) {
  console.error('drawtool.js warn: ' + msg);
};

function isDOMElement(obj) {
  return !!(obj && obj.nodeType);
};

function getElemWidth(elem) {
  return elem.offsetWidth;
};

function getElemHeight(elem) {
  return elem.offsetHeight;
};

function hasClass(elem, cls) {
  var space = ' ';
  return (space + elem.className + space).indexOf(space + cls + space) > -1;
};

/**
 * 为元素添加class
 */
function addClass(elem, cls) {
  if (isArray(cls)) {
    cls.forEach(function (c) {
      addClass(elem, c);
    });
  } else {
    if (!elem.className) {
      elem.className = cls;
    } else {
      elem.className = elem.className + ' ' + cls;
    };
  };
  return elem;
};

/**
 * 为元素移除class
 */
function removeClass(elem, cls) {
  if (hasClass(elem, cls)) {
    var s = ' ';
    var newCls = s + elem.className.replace(/[\t\r\n]/g, '') + s;
    while (newCls.indexOf(s + cls + s) >= 0) {
      newCls = newCls.replace(s + cls + s, s);
    };
    elem.className = newCls.replace(/^\s+|\s+$/g, '');
  };
  return elem;
};

/**
 * 向上查找dom
 * @param {*} pElem 终止节点 
 * @param {*} elem 起始节点
 * @param {*} cls className
 */
function closest(pElem, elem, cls) {
  if (pElem == elem) {
    return null;
  };
  if (hasClass(elem, cls)) {
    return elem;
  } else {
    return closest(pElem, elem.parentNode, cls);
  };
};

/**
 * 显示dom
 * @param {*} shallow 是否为visibility隐藏
 */
function showElem(elem, shallow) {
  if (isDOMElement(elem)) {
    if (isTrue(shallow)) {
      !hasClass(elem, Cls.showVisCss) && addClass(elem, Cls.showVisCss);
      hasClass(elem, Cls.hideVisCss) && removeClass(elem, Cls.hideVisCss);
    } else {
      !hasClass(elem, Cls.showCss) && addClass(elem, Cls.showCss);
      hasClass(elem, Cls.hideCss) && removeClass(elem, Cls.hideCss);
    };
  } else {
    slice(elem).forEach(function (e) {
      showElem(e, shallow);
    });
  }
  return elem;
};

/**
 * 隐藏dom
 * @param {*} shallow 是否为visibility隐藏
 */
function hideElem(elem, shallow) {
  if (isDOMElement(elem)) {
    if (isTrue(shallow)) {
      !hasClass(elem, Cls.hideVisCss) && addClass(elem, Cls.hideVisCss);
      hasClass(elem, Cls.showVisCss) && removeClass(elem, Cls.showVisCss);
    } else {
      !hasClass(elem, Cls.hideCss) && addClass(elem, Cls.hideCss);
      hasClass(elem, Cls.showCss) && removeClass(elem, Cls.showCss);
    }
  } else {
    slice(elem).forEach(function (e) {
      hideElem(e, shallow);
    });
  };
  return elem;
};

/**
 * 发送http get请求
 * @param {*} url 请求地址
 * @param {*} succfn 成功回调
 * @param {*} errorfn 失败回调
 */
function httpGet(url, succfn, errorfn) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      succfn(xhr.responseText);
    } else if (xhr.readyState == 4) {
      errorfn(xhr.responseText);
    }
  };
  xhr.send();
};


function httpGetPromise(url) {
  return new _Promise(function (resolve, reject) {
    httpGet(url, resolve, reject);
  });
}

/**
 * 获取外联css，返回style标签数组
 */
function getLinkStyle() {
  return new _Promise(function (resolve, reject) {
    var links = document.getElementsByTagName('link');
    var linkArr = slice(links);
    var styles = [];
    while (linkArr.length) {
      var link = linkArr.pop();
      // 此处闭包解决无块级作用域问题
      (function (len) {
        httpGetPromise(link.href)
        .then(function (data) {
          var style = document.createElement('style');
          style.innerHTML = data;
          styles.push(style);
          !len && resolve(styles);
        })
        .catch(function (data) {
          warn('get style fail , please check =>' + link.href);
          !len && resolve(styles);
        });
      })(linkArr.length);
    }
  });
};

/**
 * 事件对象
 * on 事件绑定
 * delegate 事件委托
 * off 事件注销
 */
var Event = new Object();
Event.on = function (elem, type, fn) {
  if (elem.addEventListener) {
    Event.on = function (elem, type, fn) {
      elem.addEventListener(type, fn, false);
    };
  } else {
    Event.on = function (elem, type, fn) {
      elem.attachEvent('on' + type, fn);
    };
  };
  Event.on(elem, type, fn);
};

Event.delegate = function (pElem, className, type, fn) {
  Event.on(pElem, type, function (e) {
    var e = window.event || e;
    var target = e.target || e.srcElement;
    var pTarget = closest(pElem, target, className);
    if (pTarget) {
      fn.call(pTarget, e);
    };
  }, false);
};

Event.off = function (elem, type, fn) {
  if (elem.removeEventListener) {
    Event.off = function (elem, type, fn) {
      elem.removeEventListener(type, fn, false);
    };
  } else {
    Event.off = function (elem, type, fn) {
      elem.detachEvent('on' + type, fn);
    };
  };
  Event.off(elem, type, fn);
};

/**
 * class常量
 */
var Cls = {
  showCss: 'drawtool-show',
  hideCss: 'drawtool-hide',
  showVisCss: 'drawtool-visibility-show',
  hideVisCss: 'drawtool-visibility-hide',
  rootCss: 'drawtool-content-root',
  ndCss: 'drawtool-node',
  ndJs: 'js-drawtool-node',
  inNdJs: 'js-drawtool-inner-node',
  anchorCss: 'drawtool-anchor',
  anchorJs: 'js-drawtool-anchor',
  menuCss: 'drawtool-operate',
  menuBtnCss: 'drawtool-operate-btn',
  menuBtnJs: 'js-drawtool-operate-btn',
  menuDeleteCss: 'drawtool-operate-delete',
  menuDeleteJs: 'js-drawtool-operate-delete',
  menuEditJs: 'js-drawtool-operate-edit',
  menuEditCss: 'drawtool-operate-edit',
  controller: 'drawtool-controller',
  ctrlli: 'drawtool-controller-li',
  ctrlJs: 'js-drawtool-controller-li',
  cvs: 'drawtool-canvas',
  bgCvs: 'drawtool-background-canvas',
  avCvs: 'drawtool-active-canvas'
};

/**
 * 合并外联和内部css返回一个字符串
 * @param {*} styles 外联css数组
 */
function mergeStyle(styles) {
  var styleStr = '';
  var headStyles = document.getElementsByTagName('style');
  styles = styles.concat(slice(headStyles));
  styles.forEach(function (style) {
    if (isDOMElement(style)) {
      styleStr += style.outerHTML.replace(/#/g, '%23').replace(/\n/g, '%0A');
    }
  });
  return styleStr;
};

/**
 * 创建一个svg，返回一个svg字符串
 * @param {*} elem 源html节点
 * @param {*} style css字符串
 * @param {*} targetSize 尺寸 {width, height}
 */
function createSvg(elem, style, targetSize) {
  var cloneDom = elem.cloneNode(true)
  cloneDom.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  cloneDom.classList.remove('outline');
  var svgStr =
    'data:image/svg+xml;charset=utf-8,\
	  <svg xmlns="http://www.w3.org/2000/svg" width="' +
		targetSize.width + '" height="' + targetSize.height + '">\
		<foreignObject x="0" y="0" width="100%" height="100%">' +
		new XMLSerializer().serializeToString(cloneDom).replace(/#/g, '%23').replace(/\n/g, '%0A') +
		style +
		'</foreignObject>\
	  </svg>';
  return svgStr;
};

/**
 * 在dom里面生成一个大小匹配的canvas
 * @param {*} elem dom元素
 */
function addCanvas(elem) {
  var canvas = document.createElement('canvas');
  canvas.width = getElemWidth(elem);
  canvas.height = getElemHeight(elem);
  elem.appendChild(canvas);
  return canvas;
};

/**
 * 清除canvas
 * @param {*} ctx context
 * @param {*} canvas canvas
 */
function clearCanvas(ctx, canvas) {
  ctx.clearRect(0, 0, getElemWidth(canvas), getElemHeight(canvas));
};

/**
 * 通过事件获取鼠标坐标位置
 * @param {*} evt 事件
 */
function getMousePos(evt) {
  var e = window.event || evt;
  var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
  var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
  var x = e.pageX || e.clientX + scrollX;
  var y = e.pageY || e.clientY + scrollY;
  return {
    x: x,
    y: y
  };
};

/**
 * 根据事件，获取鼠标相对目标的坐标
 * @param {*} target 目标元素
 * @param {*} e 事件
 */
function getTargetPos(target, e) {
  var mousePos = getMousePos(e);
  var targetPos = target.getBoundingClientRect();
  var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
  var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
  var x = targetPos.left + scrollX;
  var y = targetPos.top + scrollY;
  return {
    x: (mousePos.x - x),
    y: (mousePos.y - y)
  }
};

/**
 * 加密class 防止js的class被操作
 * @param {*} cls className 
 */
function encryptCls(cls) {
  eachProp(cls, function (val, prop) {
    if (prop.indexOf('Js') > -1) {
      cls[prop] += '-' + Math.floor(Math.random() * new Date().getTime());
    }
  });
};

/**
 * 添加连线点，返回连线点数字
 * @param {*} node 要添加的节点
 */
function appendAnchors(node) {
  var anchorsNode = [];
  if (isArray(node.anchors)) {
    node.anchors.forEach(function (anchors, index) {
      var anchorNode = document.createElement('span');
      addClass(anchorNode, [Cls.anchorCss, Cls.anchorJs]);
      anchorNode.anchorid = index;
      anchorNode.pos = [anchors[0], anchors[1]];
      anchorNode.setAttribute('anchorNode-id', index);
      node.appendChild(anchorNode);
      anchorsNode.push(anchorNode);

      anchorNode.style.left = anchors[0] - getElemWidth(anchorNode) / 2 + 'px';
      anchorNode.style.top = anchors[1] - getElemHeight(anchorNode) / 2 + 'px';
    });
  };
  return anchorsNode;
};

/**
 * 添加连线菜单
 * @param {*} elem 
 */
function appendLineMenu(elem) {
  var div = document.createElement('div');
  div.className = Cls.menuCss;
  div.innerHTML =
	'<span class="' + Cls.menuBtnCss + ' ' + Cls.menuDeleteCss + ' ' + Cls.menuBtnJs + '">\
	  <i class="' + Cls.menuDeleteJs + '"></i>\
	</span>\
	<span class="' + Cls.menuBtnCss + ' ' + Cls.menuEditCss + ' ' + Cls.menuBtnJs + '">\
	  <i class="' + Cls.menuEditJs + '"></i>\
	</span>';
  elem.appendChild(div);
  return hideElem(div);
};

/**
 * 添加连线控制点， 返回获取控制点的map闭包
 * @param {*} elem 
 */
function appendCtrls(elem) {
  var ul = document.createElement('ul');
  ul.className = Cls.controller;
  var li1 = document.createElement('li');
  li1.className = Cls.ctrlli + ' ' + Cls.ctrlJs;
  li1.ctrlFlag = 1;
  var li2 = document.createElement('li');
  li2.className = Cls.ctrlli + ' ' + Cls.ctrlJs;
  li2.ctrlFlag = 2;
  ul.appendChild(li1);
  ul.appendChild(li2);
  elem.appendChild(ul);
  hideElem(ul);
  var map = {
    ctrl1: li1,
    ctrl2: li2,
    ctrl: ul
  };
  return function (val) {
    return map[val];
  };
};

/**
 * 通过连线点anchorid获取连线点
 * @param {*} anchorsLists 连线点数字
 * @param {*} anchorid 连线anchorid
 */
function getAnchorById(anchorsLists, anchorid) {
  var anchor = null;
  slice(anchorsLists).forEach(function (oAnchor) {
    if (hasClass(oAnchor, Cls.anchorJs)) {
      if (oAnchor.anchorid == anchorid) {
        anchor = oAnchor;
        return false;
      };
    };
  });
  return anchor;
};


/**
 * 节点栈
 */
function NodeStack() {
  this.length = 0;
};

NodeStack.prototype = {
  constructor: NodeStack,
  pop: ap.pop,
  forEach: ap.forEach,
  peek: function () {
    return this.length > 0 ?
      this[this.length - 1] :
      undefined;
  },
  push: function (node) {
    var maxId = 0;
    this.forEach(function (oNode) {
      if (oNode.nodeid > maxId) {
        maxId = oNode.nodeid;
      };
    });
    node.nodeid = node.nodeid || (Number(maxId) + 1);
    ap.push.call(this, node);
    return node;
  },
  getNodeById: function (nodeid) {
    var node = null;
    for (var i = 0; i < this.length; i++) {
      var oNode = this[i];
      if (oNode.nodeid == nodeid) {
        node = oNode;
        break;
      };
    };
    return node;
  },
  deleteById: function (nodeid) {
    var node = null;
    for (var i = 0; i < this.length; i++) {
      var oNode = this[i];
      if (oNode.nodeid == nodeid) {
        oNode.remove();
        ap.splice.call(this, i, 1);
        break;
      }
    }
    return node;
  },
  clear: function () {
    for (var i = 0; i < this.length; i++) {
      this[i].remove();
    }
    this.length = 0;
  },
  toArray: function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
      arr.push(this[i]);
    }
    return arr;
  },
  fiterData: function () {
    var data = [];
    for (var i = 0; i < this.length; i++) {
      var node = this[i];
      var left = toNumber(node.style.left);
      var top = toNumber(node.style.top);
      var oNode = {
        template: node.template,
        nodeid: node.nodeid,
        pos: {
          x: left,
          y: top
        },
        anchors: node.anchors
      };
      data.push(oNode);
    };
    return data;
  }
};


/**
 * 线栈
 */
function LineStack() {
  this.length = 0;
};

LineStack.prototype = {
  constructor: LineStack,
  pop: ap.pop,
  forEach: ap.forEach,
  peek: function () {
    return this.length > 0 ?
      this[this.length - 1] :
      undefined;
  },
  push: function (line) {
    var maxId = 0;
    for (var i = 0; i < this.length; i++) {
      if (this[i].lineid > maxId) {
        maxId = this[i].lineid;
      };
    };
    line.lineid = line.lineid || (maxId + 1);
    ap.push.call(this, line);
    return line;
  },
  addAll: function (lineStack) {
    var self = this;
    lineStack.forEach(function (line) {
      self.push(line);
    });
    return self;
  },
  deleteById: function (lineid) {
    var lineStack = new LineStack();
    for (var i = 0; i < this.length; i++) {
      if (this[i].lineid == lineid) {
        lineStack.push(this[i]);
        ap.splice.call(this, i, 1);
        break;
      };
    };
    return lineStack;
  },
  deleteByNodeId: function (nodeid) {
    var lineStack = new LineStack();
    for (var i = 0; i < this.length; i++) {
      if (this[i].startNodeid == nodeid ||
        this[i].endNodeid == nodeid) {
        lineStack.push(this[i]);
        ap.splice.call(this, i, 1);
        i--;
      };
    };
    return lineStack;
  },
  getLineById: function (lineid) {
    var line = null;
    for (var i = 0; i < this.length; i++) {
      var oLine = this[i];
      if (oLine.lineid == lineid) {
        line = oLine;
        break;
      };
    };
    return line;
  },
  toArray: function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
      arr.push(this[i]);
    };
    return arr;
  },
  fiterData: function () {
    var data = [];
    for (var i = 0; i < this.length; i++) {
      var line = this[i];
      var oLine = {
        lineid: line.lineid,
        startNodeid: line.startNodeid,
        startAnchorid: line.startAnchorid,
        endNodeid: line.endNodeid,
        endAnchorid: line.endAnchorid,
        ctrl1: line.ctrl1,
        ctrl2: line.ctrl2,
        lineType: line.lineType,
        lineStyle: line.lineStyle,
        auto: line.auto
      }
      data.push(oLine);
    };
    return data;
  },
  clear: function () {
    while (this.length) {
      this.pop();
    };
  }
};


/*
  * 线
  */
var isLineType = makeMap('broken,bezier,straight', true);
var isLineStyle = makeMap('arrow,none', true);

function Line() {
  this.lineid = null;
  this.startNodeid = null;
  this.startAnchorid = null;
  this.startElem = null;
  this.endNodeid = null;
  this.endAnchorid = null;
  this.endElem = null;
  this.ctrl1 = [];
  this.ctrl2 = [];
  this.lineType = null;
  // 0 init 1 start 2 end
  this.status = 0;
  this.lineStyle = null;
  // 是否自动判断
  this.auto = null;
};

Line.prototype = {
  constructor: Line,
  setType: function (lineType) {
    if (isLineType(lineType)) {
      this.lineType = lineType;
    };
    return this;
  },
  setStyle: function (lineStyle) {
    if (isLineStyle(lineStyle)) {
      this.lineStyle = lineStyle;
    };
    return this;
  },
  setAuto: function (isAuto) {
    this.auto = !!isAuto;
    return this;
  },
  setStart: function (anchor) {
    this.startNodeid = anchor.parentNode.nodeid;
    this.startAnchorid = anchor.anchorid;
    this.startElem = anchor;
    this.status = 1;
    return this;
  },
  setEnd: function (anchor) {
    this.endNodeid = anchor.parentNode.nodeid;
    this.endAnchorid = anchor.anchorid;
    this.endElem = anchor;
    this.status = 2;
    return this;
  }
};


/**
 * Drawtool class
 */
function Drawtool(wrap, setting) {
  if (!isDOMElement(wrap)) {
    error(wrap + ' is not dom');
    return;
  };
  encryptCls(Cls);

  // 是否禁用
  var _isDisabled = false;

  // 包裹层dom
  var _wrap = wrap;

  // 活跃层canvas
  var _avCvs = addCanvas(_wrap);

  // 活跃层context
  var _avCtx = _avCvs.getContext('2d');

  // 背景层canvas
  var _bgCvs = addCanvas(_wrap);

  // 背景层context
  var _bgCtx = _bgCvs.getContext('2d');

  // 节点栈
  var _nodeStack = new NodeStack();

  // 连线栈
  var _lineStack = new LineStack();

  // 正在连线
  var _avLine = new Line();

  // 活跃连线栈
  var _avLineStack = new LineStack();

  // 活跃节点
  var _avNode = null;

  // 包裹层线宽
  var _wrapLineW = 5;

  // 选中连线
  var _focusLine = null;

  // 菜单栏
  var _menu = appendLineMenu(_wrap);

  // 控制点
  var _ctrlMap = appendCtrls(_wrap);

  // 活跃控制点
  var _avCtrl = null;

  // 活跃层和背景层切换的锁
  var _synchronized = false;

  var _scale = 1;

  // 全局属性设置
  !isObject(setting) && (setting = {});
  var _setting = mixin(setting, {
    lineColor: '#26b7d0',
    lineHoverColor: 'rgba(200, 200, 200, 0.4)',
    lineActiveColor: '#2177C7',
    arrowColor: '#444',
    lineStyle: 'arrow',
    lineType: 'bezier',
    auto: true
  });

  // 事件切面
  var _listenMap = {
    clickLine: noop,
    deleteLineBefore: function () { return true; },
    deleteLineAfter: noop,
    linkLineStart: noop,
    linkLineBefore: function () { return true; },
    linkLineAfter: noop
  };

  // 添加基础样式
  addClass(_wrap, Cls.rootCss);
  addClass(_bgCvs, [Cls.cvs, Cls.bgCvs]);
  addClass(_avCvs, [Cls.cvs, Cls.avCvs]);


  var aopAnchorClick = aop({
    before: function () {
      if (_avLine.status === 0)
        Event.on(_wrap, 'mousemove', moveLinkLine);
    },
    fun: function (e) {
      if (isFalse(_isDisabled)) {
        anchorClick(e);
      }
    },
    after: function () {
      if (_avLine.status === 0)
        Event.off(_wrap, 'mousemove', moveLinkLine);
    }
  });

  var aopNodeMousedown = aop({
    fun: function (e) {
      if (isFalse(_isDisabled)) {
        nodeMousedown(e);
      }
    },
    after: function () {
      Event.on(_wrap, 'mousemove', nodeMousemove);
    }
  });

  var aopMouseup = aop({
    fun: function (e) {
      if (isFalse(_isDisabled)) {
        mouseup(e);
      }
    },
    after: function () {
      Event.off(_wrap, 'mousemove', nodeMousemove);
    }
  });

  var aopCtrlMouseup = aop({
    fun: function (e) {
      if (isFalse(_isDisabled)) {
        ctrlMouseup(e);
      }
    },
    after: function () {
      Event.off(_wrap, 'mousemove', ctrlMousemove);
    }
  });

  var aopCtrlMousedown = aop({
    fun: function (e) {
      if (isFalse(_isDisabled)) {
        ctrlMousedown(e);
      }
    },
    after: function () {
      Event.on(_wrap, 'mousemove', ctrlMousemove);
    }
  });

  var aopLineClick = aop({
    fun: function (e) {
      if (isFalse(_isDisabled)) {
        lineClick(e);
      }
    }
  });

  var aopWrapMousemove = aop({
    fun: function (e) {
      if (isFalse(_isDisabled)) {
        wrapMousemove(e);
      }
    }
  });

  var aopNodeMouseover = aop({
    fun: function (e) {
      if (isFalse(_isDisabled)) {
        nodeMouseover(e);
      }
    }
  });

  var aopNodeMouseout = aop({
    fun: function (e) {
      if (isFalse(_isDisabled)) {
        nodeMouseout(e);
      }
    }
  });

  /**
   * 鼠标移动到节点上显示连线点
   */
  function nodeMouseover(e) {
    var node = closest(_wrap, e.target, Cls.ndJs);
    clearTimeout(node.hideTimer);
    var anchorsNode = node.getElementsByClassName(Cls.anchorJs);
    showElem(anchorsNode, true);
  };

  /**
   * 鼠标移动到连线点显示连线点
   */
  function anchorsNodeMouseover(e) {
    var node = closest(_wrap, e.target, Cls.ndJs);
    clearTimeout(node.hideTimer);
  };

  /**
   * 鼠标移出连线点延时隐藏连线点
   */
  function anchorsMouseout(e) {
    var node = closest(_wrap, e.target, Cls.ndJs);
    var anchorsNode = node.getElementsByClassName(Cls.anchorJs);
    node.hideTimer = setTimeout(function () {
      hideElem(anchorsNode, true);
    }, 300);
  };

  /**
   * 鼠标移出节点延时隐藏连线点
   */
  function nodeMouseout(e) {
    var node = closest(_wrap, e.target, Cls.ndJs);
    var anchorsNode = node.getElementsByClassName(Cls.anchorJs);
    node.hideTimer = setTimeout(function () {
      hideElem(anchorsNode, true);
    }, 300);
  };

  /**
   * 禁止右击事件，右击取消连线
   */
  function contextmenu(evt) {
    var e = window.event || evt;
    _avLine = new Line();
    releaseFocusL();
    reDrawAvCtx();
    e.preventDefault();
  };

  /**
   * 禁止图片的默认移动事件
   */
  function dragstart(evt) {
    var e = window.event || evt;
    e.preventDefault();
  };

  /**
   * 鼠标按下控制点，将线条从线栈提取到活跃线栈
   */
  function ctrlMousedown(e) {
    _avCtrl = e.target;
    _avCtrl.relX = e.clientX - _avCtrl.offsetLeft;
    _avCtrl.relY = e.clientY - _avCtrl.offsetTop;
    if (isNotEmptyList(_lineStack) &&
      isFalse(_synchronized) &&
      isDef(_focusLine)) {
      _avLineStack = _lineStack.deleteById(_focusLine.lineid);
      reDrawBgCtx();
      reDrawAvCtx();
      _synchronized = true;
      // console.log('提取');
    };
  };

  /**
   * 控制点弹起，将活跃线栈放回线栈
   */
  function ctrlMouseup() {
    if (isTrue(_synchronized)) {
      _lineStack.addAll(_avLineStack);
      _avLineStack.clear();
      reDrawBgCtx();
      reDrawAvCtx();
      _synchronized = false;
      // console.log('投放');
    };
  };

  /**
   * 移动控制焦点
   */
  function ctrlMousemove(e) {
    if (isDOMElement(_avCtrl)) {
      var x = e.clientX - _avCtrl.relX;
      var y = e.clientY - _avCtrl.relY;
      _avCtrl.style.left = x + 'px';
      _avCtrl.style.top = y + 'px';
      var cx = x + _avCtrl.offsetWidth / 2;
      var cy = y + _avCtrl.offsetHeight / 2;
      _focusLine['ctrl' + _avCtrl.ctrlFlag] = [cx, cy];
      reDrawAvCtx();
    };
  };

  /**
   * 点击删除菜单
   */
  function menuDeleteClick() {
    var isValid = _listenMap.deleteLineBefore.call(this, _focusLine);
    if (isFalse(isValid)) {
      return;
    };
    _lineStack.deleteById(_focusLine.lineid);
    _listenMap.deleteLineAfter.call(this, _focusLine);
    releaseFocusL();
    hideElem(_menu);
    reDrawBgCtx();
    reDrawAvCtx();
  };

  /**
   * 点击编辑菜单
   */
  function menuEditClick(e) {
    showElem(_ctrlMap('ctrl'));
    hideElem(_menu);
    var ctrl1 = _ctrlMap('ctrl1');
    var ctrl2 = _ctrlMap('ctrl2');
    var sPos = getAnchorPos(_focusLine.startElem);
    var ePos = getAnchorPos(_focusLine.endElem);
    var posMap = divide(sPos, ePos, 3);
    var chalfW = ctrl1.offsetWidth / 2;
    var chalfH = ctrl1.offsetHeight / 2;
    if (isNotEmptyList(_focusLine.ctrl1)) {
      ctrl1.style.left = _focusLine.ctrl1[0] - chalfW + 'px';
      ctrl1.style.top = _focusLine.ctrl1[1] - chalfH + 'px';
    } else {
      ctrl1.style.left = posMap('d1').x - chalfW + 'px';
      ctrl1.style.top = posMap('d1').y - chalfH + 'px';
      _focusLine.ctrl1 = parsePos(posMap('d1'));
    };
    if (isNotEmptyList(_focusLine.ctrl2)) {
      ctrl2.style.left = _focusLine.ctrl2[0] - chalfW + 'px';
      ctrl2.style.top = _focusLine.ctrl2[1] - chalfH + 'px';
    } else {
      ctrl2.style.left = posMap('d2').x - chalfW + 'px';
      ctrl2.style.top = posMap('d2').y - chalfH + 'px';
      _focusLine.ctrl2 = parsePos(posMap('d2'));
    };
  };


  /**
   * 激活活跃节点
   * 1. 记录活跃节点的信息
   * 2. 将相关线条从线栈提取到活跃层线栈中
   * 3. 此时同时刷新背景层和活跃层
   */
  function nodeMousedown(e) {
    releaseFocusL();
    hideElem(_menu);
    var e = e || window.event;
    var target = e.target || e.srcElement;
    _avNode = closest(_wrap, target, Cls.ndJs);
    _avNode.relX = e.clientX - _avNode.offsetLeft;
    _avNode.relY = e.clientY - _avNode.offsetTop;

    if (isNotEmptyList(_lineStack) && isFalse(_synchronized)) {
      _avLineStack = _lineStack.deleteByNodeId(_avNode.nodeid);
      reDrawBgCtx();
      reDrawAvCtx();
      _synchronized = true;
      // console.log('提取');
    };
  };

  /**
   * 拖动活跃节点的时候
   * 1. 移动节点的位置
   * 2. 渲染活跃层数据
   */
  function nodeMousemove(e) {
    if (isDOMElement(_avNode)) {
      _avNode.style.cursor = 'move';
      _avNode.style.left = e.clientX - _avNode.relX + 'px';
      _avNode.style.top = e.clientY - _avNode.relY + 'px';
      reDrawAvCtx();
    };
  };

  /**
   * 鼠标弹起的时候
   * 活跃层连线全部投放到固定层中去
   */
  function mouseup() {
    _avNode = null;
    if (isTrue(_synchronized)) {
      _lineStack.addAll(_avLineStack);
      _avLineStack.clear();
      reDrawBgCtx();
      reDrawAvCtx();
      _synchronized = false;
      // console.log('投放');
    };
  };

  /**
   * 开始连线时，触发一次固定层刷新
   * 连线完成，向固定层投放新产生的线条
   */
  function anchorClick(e) {
    var anchor = e.target;
    if (_avLine.status === 0) {
      _listenMap.linkLineStart.call(this, _avLine);
      _avLine.setStart(anchor);
      reDrawBgCtx();
    } else if (_avLine.status === 1) {

      var isValid = _listenMap.linkLineBefore.call(this, _avLine);
      if (isFalse(isValid)) {
        return;
      };

      _avLine.setEnd(anchor);
      _lineStack.push(_avLine);
      pushDrawBgCtx(_avLine);

      _listenMap.linkLineAfter.call(this, _avLine);

      _avLine = new Line();
      clearCanvas(_avCtx, _avCvs);
    };
  };

  /**
   * 当处于连线状态，触发活跃层刷新即可
   */
  function moveLinkLine(e) {
    reDrawAvCtx(e);
  };

  /**
   * 点击线条
   */
  function lineClick(e) {
    //只有点击源是背景canvas才能触发
    if (_bgCvs != e.target) {
      return;
    };
    var focusLine = getFocusLine(e);
    if (isDef(focusLine)) {
      // console.log('点击线条');
      _focusLine = focusLine;
      var pos = getScaleTargerPos(_wrap, e);
      yellMenu(focusLine, pos);
      _listenMap.clickLine.call(this, _focusLine);
    } else {
      releaseFocusL();
      hideElem(_menu);
    };
    reDrawAvCtx();
  };

  /**
   * hover 画布
   * 显示对应激活的线条
   */
  function wrapMousemove(e) {
    var focusLine = getFocusLine(e);
    if (isDef(focusLine)) {
      clearCanvas(_avCtx, _avCvs);
      changeCursor('pointer');
      drawWrapLine(focusLine);
    } else {
      changeCursor('default');
      clearCanvas(_avCtx, _avCvs);
      drawFocusLine();
    };
  };

  Event.delegate(_wrap, Cls.inNdJs, 'mousedown', aopNodeMousedown);

  Event.delegate(_wrap, Cls.inNdJs, 'mouseup', aopMouseup);

  Event.delegate(_wrap, Cls.inNdJs, 'mouseover', aopNodeMouseover);

  Event.delegate(_wrap, Cls.anchorJs, 'mouseover', anchorsNodeMouseover);

  Event.delegate(_wrap, Cls.anchorJs, 'mouseout', anchorsMouseout);

  Event.delegate(_wrap, Cls.inNdJs, 'mouseout', aopNodeMouseout);

  Event.delegate(_wrap, Cls.anchorJs, 'click', aopAnchorClick);

  Event.delegate(_wrap, Cls.menuDeleteJs, 'click', menuDeleteClick);

  Event.delegate(_wrap, Cls.menuEditJs, 'click', menuEditClick);

  Event.delegate(_wrap, Cls.ctrlJs, 'mousedown', aopCtrlMousedown);

  Event.delegate(_wrap, Cls.ctrlJs, 'mouseup', aopCtrlMouseup);

  Event.on(_wrap, 'click', aopLineClick);

  Event.on(_wrap, 'mousemove', aopWrapMousemove);

  Event.on(_wrap, 'contextmenu', contextmenu);

  Event.on(_wrap, 'dragstart', dragstart);

  /**
   * 释放选中的线条
   */
  function releaseFocusL() {
    _focusLine = null;
    hideElem(_ctrlMap('ctrl'));
  };

  /**
   * 召唤操作菜单
   */
  function yellMenu(line, pos) {
    var menuBtn = _menu.getElementsByClassName(Cls.menuBtnJs);
    showElem(menuBtn);
    var lineType = reSetConf(line, 'lineType');
    switch (lineType) {
      case 'bezier':
        break;
      case 'straight':
        var menuEdit = _menu.getElementsByClassName(Cls.menuEditCss);
        hideElem(menuEdit);
        break;
      case 'broken':
        var isAuto = reSetConf(line, 'auto');
        if (isTrue(isAuto)) {
          var menuEdit = _menu.getElementsByClassName(Cls.menuEditCss);
          hideElem(menuEdit);
        };
        break;
    };
    showElem(_menu);
    _menu.style.left = pos.x + 'px';
    _menu.style.top = pos.y + 'px';
  };

  /**
   * 矫正配置，line上优先，再取全局设置到线上
   */
  function reSetConf(line, prop) {
    if (!isDef(line[prop])) {
      line[prop] = _setting[prop];
    }
    return line[prop];
  };

  /**
   * 根据事件获取canvas坐标
   */
  function getCavsPosByEvt(e) {
    var x = e.pageX - _bgCvs.getBoundingClientRect().left;
    var y = e.pageY - _bgCvs.getBoundingClientRect().top;
    return {
      x: x / _scale,
      y: y / _scale
    };
  };

  

  function getScaleTargerPos(target, e) {
    var pos = getTargetPos(target, e);
    return {
      x: pos.x / _scale,
      y: pos.y / _scale
    }
  };

  /**
   * 获取焦点线条
   */
  function getFocusLine(e) {
    var resultLine = null;
    if (isExistLine()) {
      var pos = getCavsPosByEvt(e);
      resultLine = getLineByPos(pos.x, pos.y);
    };
    return resultLine;
  };

  /**
   * 获取锚点位置
   */
  function getAnchorPos(elem) {
    var pos = {};
    if (isDOMElement(elem)) {
      pos.y = elem.parentNode.offsetTop + elem.offsetTop + getElemHeight(elem) / 2;
      pos.x = elem.parentNode.offsetLeft + elem.offsetLeft + getElemWidth(elem) / 2;
    };
    return pos;
  };

  /**
   * 根据坐标获取线
   */
  function getLineByPos(x, y) {
    var resultLine = null;
    _lineStack.forEach(function (line) {
      var isInPath = isPointInPath(line, {
        x: x,
        y: y
      });
      if (isInPath) {
        resultLine = line;
        return false;
      }
    });
    return resultLine;
  };

  /**
   * 获取控制角点坐标
   */
  function getCtrlPos(line, sPos, ePos) {
    var lineType = reSetConf(line, 'lineType');
    var auto = reSetConf(line, 'auto');
    if (lineType === 'broken' && isTrue(auto)) {
      return getAutoCtrlPos(sPos, ePos);
    };

    var ctrlMap = {};
    var posMap = divide(sPos, ePos, 3);
    ctrlMap['d1Pos'] = toPos(line.ctrl1);
    ctrlMap['d2Pos'] = toPos(line.ctrl2);
    if (!isNotEmptyList(line.ctrl1)) {
      ctrlMap['d1Pos'] = posMap('d1');
    };
    if (!isNotEmptyList(line.ctrl2)) {
      ctrlMap['d2Pos'] = posMap('d2');
    };
    return function (val) {
      return ctrlMap[val];
    };
  };

  /**
   * 获取控制角点自动化坐标坐标
   * 目前只针对折线
   */
  function getAutoCtrlPos(sPos, ePos) {
    var ctrlMap = {};
    var midY = (toNumber(sPos.y) + toNumber(ePos.y)) / 2;
    ctrlMap['d1Pos'] = toPos([sPos.x, midY])
    ctrlMap['d2Pos'] = toPos([ePos.x, midY])
    return function (val) {
      return ctrlMap[val];
    };
  }

  /**
   * 通过线条获取锚点元素
   */
  function getAnchorElemByLine(oLine) {
    var topoNodeStart = _nodeStack.getNodeById(oLine.startNodeid);
    var topoNodeEnd = _nodeStack.getNodeById(oLine.endNodeid);
    var startAnchorsLists = topoNodeStart.childNodes;
    var endAnchorsLists = topoNodeEnd.childNodes;
    var start = getAnchorById(startAnchorsLists, oLine.startAnchorid);
    var end = getAnchorById(endAnchorsLists, oLine.endAnchorid);
    return {
      startElem: start,
      endElem: end
    };
  };

  /**
   * 绘制焦点线条
   */
  function drawFocusLine() {
    if (isDef(_focusLine)) {
      drawWrapLine(_focusLine);
    };
  };


  /**
   * 改变鼠标样式
   */
  function changeCursor(style) {
    _wrap.style.cursor = style;
  };

  /**
   * 是否存在线条
   */
  function isExistLine() {
    return isNotEmptyList(_lineStack) || isNotEmptyList(_avLineStack);
  };

  /**
   * 绘制包裹层线条
   */
  function drawWrapLine(line) {
    var sPos = getAnchorPos(line.startElem);
    var ePos = getAnchorPos(line.endElem);
    var lineType = reSetConf(line, 'lineType');
    switch (lineType) {
      case 'bezier':
        var bezierMap = getCtrlPos(line, sPos, ePos);
        bezierWrap(
          _avCtx,
          line,
          sPos,
          bezierMap('d1Pos'),
          bezierMap('d2Pos'),
          ePos
        );
        break;
      case 'straight':
        straightWrap(_avCtx, line, sPos, ePos);
        break;
      case 'broken':
        var brokenMap = getCtrlPos(line, sPos, ePos);
        brokenWrap(
          _avCtx,
          line,
          sPos,
          brokenMap('d1Pos'),
          brokenMap('d2Pos'),
          ePos
        );
        break;
    };
  };

  /**
   * 绘制折线的包裹层
   */
  function brokenWrap(ctx, line, sPos, d1Pos, d2Pos, ePos) {
    ctx.save();
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineWidth = _wrapLineW;
    ctx.strokeStyle = _setting.lineHoverColor;
    ctx.moveTo(sPos.x, sPos.y);
    ctx.lineTo(d1Pos.x, d1Pos.y);
    ctx.lineTo(d2Pos.x, d2Pos.y);
    ctx.lineTo(ePos.x, ePos.y);
    ctx.stroke();
    ctx.restore();
  };

  /**
   * 贝塞尔包裹层
   */
  function bezierWrap(ctx, line, sPos, d1Pos, d2Pos, ePos) {
    var nodeRad = 0;
    var lineStyle = reSetConf(line, 'lineStyle');
    var isArrow = (lineStyle === 'arrow');
    var l = sqrt(pow((d2Pos.x - ePos.x), 2) + pow((d2Pos.y - ePos.y), 2));
    var k = (nodeRad + 10) / l;
    var innerK = nodeRad / l;
    var arrowEnd = {};
    arrowEnd.x = ePos.x + innerK * (d2Pos.x - ePos.x);
    arrowEnd.y = ePos.y + innerK * (d2Pos.y - ePos.y);
    var bezierEnd = {};
    bezierEnd.x = isArrow ? ePos.x + k * (d2Pos.x - ePos.x) : ePos.x;
    bezierEnd.y = isArrow ? ePos.y + k * (d2Pos.y - ePos.y) : ePos.y;
    ctx.save();
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineWidth = _wrapLineW;
    ctx.strokeStyle = _setting.lineHoverColor;
    ctx.moveTo(sPos.x, sPos.y);
    ctx.bezierCurveTo(d1Pos.x, d1Pos.y, d2Pos.x, d2Pos.y, bezierEnd.x, bezierEnd.y);
    ctx.stroke();
    ctx.restore();
  };

  /**
   * 直线包裹层
   */
  function straightWrap(ctx, line, sPos, ePos) {
    ctx.save();
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineWidth = _wrapLineW;
    ctx.strokeStyle = _setting.lineHoverColor;
    ctx.moveTo(sPos.x, sPos.y);
    ctx.lineTo(ePos.x, ePos.y);
    ctx.stroke();
    ctx.restore();
  };



  /*
    判断点是否在线内
    p2-------------p3
    |               |
    p1-------------p4
  */
  function isPointInPath(line, pos) {
    var isPoint = false;
    var sPos = getAnchorPos(line.startElem);
    var ePos = getAnchorPos(line.endElem);
    var lineType = reSetConf(line, 'lineType');
    switch (lineType) {
      case 'bezier':
        var bezierMap = getCtrlPos(line, sPos, ePos);
        isPoint = isPointInPathBezier(
          sPos,
          bezierMap('d1Pos'),
          bezierMap('d2Pos'),
          ePos,
          pos
        );
        break;
      case 'straight':
        isPoint = isPointInPathStraight(sPos, ePos, pos)
        break;
      case 'broken':
        var brokenMap = getCtrlPos(line, sPos, ePos);
        isPoint = isPointInPathBroken(
          sPos,
          brokenMap('d1Pos'),
          brokenMap('d2Pos'),
          ePos,
          pos
        );
        break;
    };
    return isPoint;
  };

  /**
   * 判断是否在折线中
   * @param {*} pos 要判断点的坐标
   */
  function isPointInPathBroken(sPos, d1Pos, d2Pos, ePos, pos) {
    return isPointInPathStraight(sPos, d1Pos, pos) ||
      isPointInPathStraight(d1Pos, d2Pos, pos) ||
      isPointInPathStraight(d2Pos, ePos, pos);
  };


  /**
   * 判断点是否在贝塞尔线中
   * @param {*} pos 要判断的点位置
   */
  function isPointInPathBezier(sPos, d1Pos, d2Pos, ePos, pos) {
    var diff = 10; //偏移距离
    var d = _wrapLineW / 2;
    var nodeRad = 0;
    var deg1 = atan((d1Pos.y - sPos.y) / (d1Pos.x - sPos.x));
    var deg2 = atan((ePos.y - d2Pos.y) / (ePos.x - d2Pos.x));
    var p1Xd = sPos.x - d * sin(deg1) + diff * cos(deg1);
    var p1Yd = sPos.y + d * cos(deg1) + diff * sin(deg1);
    var p2Xd = d1Pos.x - d * sin(deg1);
    var p2Yd = d1Pos.y + d * cos(deg1);
    var p3Xd = d2Pos.x - d * sin(deg2);
    var p3Yd = d2Pos.y + d * cos(deg2);
    var p4Xd = ePos.x - d * sin(deg2) - diff * cos(deg2);
    var p4Yd = ePos.y + d * cos(deg2) - diff * sin(deg2);
    var ld = sqrt(pow((p3Xd - p4Xd), 2) + pow((p3Yd - p4Yd), 2));
    var kd = (nodeRad + 10) / ld;
    var innerK = nodeRad / ld;
    var arrowEndX = p4Xd + innerK * (p3Xd - p4Xd);
    var arrowEndY = p4Yd + innerK * (p3Yd - p4Yd);
    var bezierEndXd = p4Xd + kd * (p3Xd - p4Xd);
    var bezierEndYd = p4Yd + kd * (p3Yd - p4Yd);
    _avCtx.save();
    _avCtx.beginPath();
    _avCtx.moveTo(p1Xd, p1Yd);
    _avCtx.bezierCurveTo(p2Xd, p2Yd, p3Xd, p3Yd, bezierEndXd, bezierEndYd);
    var p1Xu = sPos.x + d * sin(deg1) + diff * cos(deg1);
    var p1Yu = sPos.y - d * cos(deg1) + diff * sin(deg1);
    var p2Xu = d1Pos.x + d * sin(deg1);
    var p2Yu = d1Pos.y - d * cos(deg1);
    var p3Xu = d2Pos.x + d * sin(deg2);
    var p3Yu = d2Pos.y - d * cos(deg2);
    var p4Xu = ePos.x + d * sin(deg2) - diff * cos(deg2);
    var p4Yu = ePos.y - d * cos(deg2) - diff * sin(deg2);
    var lu = sqrt(pow((p3Xu - p4Xu), 2) + pow((p3Yu - p4Yu), 2));
    var ku = (nodeRad + 10) / lu;
    var innerK = nodeRad / lu;
    var arrowEndX = p4Xu + innerK * (p3Xu - p4Xu);
    var arrowEndY = p4Yu + innerK * (p3Yu - p4Yu);
    var bezierEndXu = p4Xu + ku * (p3Xu - p4Xu);
    var bezierEndYu = p4Yu + ku * (p3Yu - p4Yu);
    _avCtx.lineTo(bezierEndXd, bezierEndYd);
    _avCtx.lineTo(bezierEndXu, bezierEndYu);
    _avCtx.lineTo(bezierEndXu, bezierEndYu);
    _avCtx.bezierCurveTo(p3Xu, p3Yu, p2Xu, p2Yu, p1Xu, p1Yu);
    _avCtx.moveTo(p1Xu, p1Yu);
    _avCtx.lineTo(p1Xd, p1Yd);
    _avCtx.restore();
    return _avCtx.isPointInPath(pos.x, pos.y);
  };

  /**
   * 判断点是否在直线中
   * @param {*} pos 要判断的点
   */
  function isPointInPathStraight(sPos, ePos, pos) {
    var d = _wrapLineW / 2;
    var red = 10;
    var deg = atan((ePos.y - sPos.y) / (ePos.x - sPos.x));
    var p1x = sPos.x + d * sin(deg) + red * cos(deg);
    var p1y = sPos.y - d * cos(deg) + red * sin(deg);
    var p2x = sPos.x - d * sin(deg) + red * cos(deg);
    var p2y = sPos.y + d * cos(deg) + red * sin(deg);
    var p3x = ePos.x - d * sin(deg) - red * cos(deg);
    var p3y = ePos.y + d * cos(deg) - red * sin(deg);
    var p4x = ePos.x + d * sin(deg) - red * cos(deg);
    var p4y = ePos.y - d * cos(deg) - red * sin(deg);
    _avCtx.save();
    _avCtx.beginPath();
    _avCtx.moveTo(p1x, p1y);
    _avCtx.lineTo(p2x, p2y);
    _avCtx.lineTo(p3x, p3y);
    _avCtx.lineTo(p4x, p4y);
    _avCtx.closePath();
    _avCtx.restore();
    return _avCtx.isPointInPath(pos.x, pos.y);
  };

  /**
   * 重绘背景层
   */
  function reDrawBgCtx() {
    clearCanvas(_bgCtx, _bgCvs);
    _lineStack.forEach(function (line) {
      linkLine(_bgCtx, line);
    });
  };

  /**
   * 重绘活跃层
   */
  function reDrawAvCtx(e) {
    clearCanvas(_avCtx, _avCvs);
    if (_avLine.status !== 0) {
      linkLineProcess(e);
    };
    _avLineStack.forEach(function (line) {
      linkLine(_avCtx, line);
    });
    drawFocusLine();
  };

  /**
   * 背景层加画一条线
   */
  function pushDrawBgCtx(line) {
    linkLine(_bgCtx, line);
  };


  /**
   * 绘制正在生成的线条
   */
  function linkLineProcess(e) {
    var sPos = getAnchorPos(_avLine.startElem);
    var ePos = getScaleTargerPos(_bgCvs, e);
    switchLineTo(_avCtx, _avLine, sPos, ePos);
  };


  /**
   * 画线总函数
   */
  function linkLine(ctx, line) {
    if (!isDOMElement(line.startElem) || !isDOMElement(line.endElem)) {
      var anchorMap = getAnchorElemByLine(line);
      line.startElem = anchorMap['startElem'];
      line.endElem = anchorMap['endElem'];
    }
    // 解析线
    var sPos = getAnchorPos(line.startElem);
    var ePos = getAnchorPos(line.endElem);
    switchLineTo(ctx, line, sPos, ePos);
  };

  /**
   * 画线分函数
   * @param {*} ctx context
   * @param {*} line 线
   * @param {*} sPos 起点
   * @param {*} ePos 终点
   */
  function switchLineTo(ctx, line, sPos, ePos) {
    var lineType = reSetConf(line, 'lineType');
    switch (lineType) {
      case 'bezier':
        var bezierMap = getCtrlPos(line, sPos, ePos);
        bezierLineTo(
          ctx,
          line,
          sPos,
          bezierMap('d1Pos'),
          bezierMap('d2Pos'),
          ePos,
          0
        );
        break;
      case 'straight':
        straightLineTo(ctx, line, sPos, ePos);
        break;
      case 'broken':
        var brokenMap = getCtrlPos(line, sPos, ePos);
        brokenLineTo(ctx, line,
          sPos,
          brokenMap('d1Pos'),
          brokenMap('d2Pos'),
          ePos
        );
    };
  }

  /**
   * 画贝塞尔曲线
   * @param {*} nodeRad 箭头围绕半径
   */
  function bezierLineTo(ctx, line, sPos, d1Pos, d2Pos, ePos, nodeRad) {
    var lineStyle = reSetConf(line, 'lineStyle');
    var isArrow = (lineStyle === 'arrow');
    var l = sqrt(pow((d2Pos.x - ePos.x), 2) + pow((d2Pos.y - ePos.y), 2));
    var k = (nodeRad + 10) / l;
    var innerK = nodeRad / l;
    var arrowEnd = {};
    arrowEnd.x = ePos.x + innerK * (d2Pos.x - ePos.x);
    arrowEnd.y = ePos.y + innerK * (d2Pos.y - ePos.y);
    var bezierEnd = {};
    bezierEnd.x = isArrow ? ePos.x + k * (d2Pos.x - ePos.x) : ePos.x;
    bezierEnd.y = isArrow ? ePos.y + k * (d2Pos.y - ePos.y) : ePos.y;
    ctx.save();
    ctx.beginPath();
    if (ctx !== _avCtx) {
      ctx.strokeStyle = _setting.lineColor;
    } else {
      ctx.strokeStyle = _setting.lineActiveColor;
    }
    ctx.moveTo(sPos.x, sPos.y);
    ctx.bezierCurveTo(d1Pos.x, d1Pos.y, d2Pos.x, d2Pos.y, bezierEnd.x, bezierEnd.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ePos.x, ePos.y, nodeRad, 0, 2 * Math.PI);
    ctx.stroke();
    isArrow && (styleArrow(ctx, d2Pos, arrowEnd, bezierEnd));
    ctx.restore();
  };


  /**
   * 画贝塞尔箭头
   */
  function bezierStyleArrow(ctx, d2Pos, arrowEndPos, bezierEPos) {
    ctx.beginPath();
    ctx.translate(arrowEndPos.x, arrowEndPos, y);
    ctx.rotate(Math.atan2(bezierEPos.y - d2Pos.y, bezierEPos.x - d2Pos.x));
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, 3);
    ctx.lineTo(-10, -3);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.fill();
  };

  /**
   * 画直线
   */
  function straightLineTo(ctx, line, sPos, ePos) {
    if (ctx !== _avCtx) {
      ctx.strokeStyle = _setting.lineColor;
    } else {
      ctx.strokeStyle = _setting.lineActiveColor;
    };
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sPos.x, sPos.y);
    ctx.lineTo(ePos.x, ePos.y);
    ctx.stroke();
    var lineStyle = reSetConf(line, 'lineStyle');
    if (lineStyle == 'arrow') {
      styleArrow(ctx, sPos, ePos);
    };
    ctx.restore();
  };

  /**
   * 绘制折线
   */
  function brokenLineTo(ctx, line, sPos, d1Pos, d2Pos, ePos) {
    ctx.save();
    ctx.beginPath();
    if (ctx !== _avCtx) {
      ctx.strokeStyle = _setting.lineColor;
    } else {
      ctx.strokeStyle = _setting.lineActiveColor;
    };
    ctx.moveTo(sPos.x, sPos.y);
    ctx.lineTo(d1Pos.x, d1Pos.y);
    ctx.lineTo(d2Pos.x, d2Pos.y);
    ctx.lineTo(ePos.x, ePos.y);
    ctx.stroke();
    var lineStyle = reSetConf(line, 'lineStyle');
    if (lineStyle == 'arrow') {
      styleArrow(ctx, d2Pos, ePos);
    };
    ctx.restore();
  };

  /**
   * 画直线箭头
   */
  function styleArrow(ctx, sPos, ePos) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(ePos.x, ePos.y);
    ctx.rotate(Math.atan2(ePos.y - sPos.y, ePos.x - sPos.x));
    ctx.lineTo(-10, 3);
    ctx.lineTo(-10, -3);
    ctx.lineTo(0, 0);
    ctx.fillStyle = _setting.arrowColor;
    ctx.fill();
  };

  /**
   * 将图片绘制到背景层上
   * @param {*} collection 节点数组
   */
  function drawImg2bgCtx(collection) {
    slice(collection).forEach(function (node) {
      var imgs = node.getElementsByTagName('img');
      slice(imgs).forEach(function (img) {
        if (isDOMElement(img)) {
          var imgRect = img.getBoundingClientRect();
          var wpRect = _wrap.getBoundingClientRect()
          _bgCtx.drawImage(img, imgRect.x - wpRect.x, imgRect.y - wpRect.y, imgRect.width, imgRect.height);
        }
      });
    });
  };

  this.addNode = function (conf) {
    var node = document.createElement('div');
    addClass(node, [Cls.ndCss, Cls.ndJs]);
    node.style.left = conf.pos.x + 'px';
    node.style.top = conf.pos.y + 'px';
    if (isDOMElement(conf.template)) {
      node.appendChild(conf.template);
      node.template = conf.template.outerHTML;
    } else {
      node.innerHTML = conf.template;
      node.template = conf.template;
    }

    node.nodeid = isNaN(conf.nodeid) ? null : conf.nodeid;
    node.anchors = conf.anchors;
    var innerNode = node.children[0];
    addClass(innerNode, Cls.inNdJs);
    _wrap.appendChild(node);
    var reNode = _nodeStack.push(node);
    reNode.setAttribute('node-id', reNode.nodeid);
    innerNode.nodeid = node.nodeid;
    var anchorsNode = appendAnchors(node);
    hideElem(anchorsNode, true);
    return node;
  };

  var isListenType = makeMap('deleteLineBefore,deleteLineAfter,linkLineStart,linkLineBefore,linkLineAfter,clickLine', false);
  this.listen = function () {
    if (arguments.length === 1 && isObject(arguments[0])) {
      _listenMap = mixin(arguments[0], _listenMap);
    } else if (arguments.length >= 2 && isFunction(arguments[1])) {
      var type = arguments[0],
        fn = arguments[1];
      if (isListenType(type)) {
        _listenMap[type] = fn;
      }
    };
  };

  this.getAllNodes = function () {
    return _nodeStack.toArray();
  };

  this.getAllLines = function () {
    return _lineStack.fiterData();
  };

  this.getAllNodesInfo = function () {
    return _nodeStack.fiterData();
  };

  this.deleteNodeById = function () {
    var nodeList = [];
    slice(arguments).forEach(function (args) {
      var nodeid = toNumber(args);
      _lineStack.deleteByNodeId(nodeid);
      var node = _nodeStack.deleteById(nodeid);
      nodeList.push(node);
      reDrawBgCtx();
      reDrawAvCtx();
    });
    return nodeList;
  };

  this.clear = function () {
    while (_nodeStack.length) {
      var node = _nodeStack.peek();
      _lineStack.deleteByNodeId(node.nodeid);
      _nodeStack.deleteById(node.nodeid);
    };
    reDrawBgCtx();
    reDrawAvCtx();
  };

  this.init = function (nodeStack, lineStack) {
    if (!isDef(nodeStack)) {
      nodeStack = [];
    }
    if (!isDef(lineStack)) {
      lineStack = [];
    }
    if (!isArray(nodeStack) || !isArray(lineStack)) {
      error('unknown arguments in init(nodeStack,lineStack)');
    };
    _nodeStack.clear();
    for (var i = 0; i < nodeStack.length; i++) {
      var node = nodeStack[i];
      this.addNode(node);
    };
    _lineStack.clear();
    _lineStack.addAll(lineStack);
    reDrawBgCtx();
  };

  this.setDisabled = function (disabled) {
    if (isDef(disabled)) {
      _isDisabled = Boolean(disabled);
    }
  };

  // this.scale = function (num) {
  //   _scale = num;
  //   _wrap.style.transform = 'scale(' + num + ')';
  // };

  this.getImage = function (fn, deep) {
    var cW = getElemWidth(_wrap),
      cH = getElemHeight(_wrap),
      image = new Image(),
      tempCvs = document.createElement('canvas'),
      tempCtx = tempCvs.getContext('2d'),
      nodeArr = _wrap.getElementsByClassName(Cls.ndJs),
      image1 = new Image();
    tempCvs.width = cW;
    tempCvs.height = cH;
    drawImg2bgCtx(nodeArr);
    getLinkStyle().then(function (styles) {
      var styleStr = mergeStyle(styles);
      var svgSrc = createSvg(_wrap, styleStr, tempCvs);
      image1.onload = function () {
        tempCtx.drawImage(image1, 0, 0, cW, cH);
        image.onload = function () {
          tempCtx.drawImage(image, 0, 0, cW, cH);
          var dataURL = tempCvs.toDataURL('image/png');
          if (isTrue(deep)) {
            var eleLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            eleLink.href = dataURL;
            eleLink.download = 'drawtool-' + version + '-' + new Date().getTime() + '.png';
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            eleLink.dispatchEvent(event);
          }
          isFunction(fn) && fn({code: 'success', dataURL: dataURL});
        };
        image.src = _bgCvs.toDataURL('image/png');
      };
      image1.onerror = function(e) {
        isFunction(fn) && fn({code: 'error', error: 'svg is not supported'});
      }
      image1.src = svgSrc;
    });
  }
};


Drawtool.prototype.version = version;

return Drawtool;

});