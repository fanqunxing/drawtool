(function( global, factory ){
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
  	typeof define === 'function' && define.cmd ? define(factory) :
	( global.DrawTool = factory() );
})( this, function(){ 'use strict';

var version = '1.2.0';
var op = Object.prototype;
var ap = Array.prototype;
var ostring = op.toString;
var hasOwn = op.hasOwnProperty;
var defaultfn = new Function();

function sin (n) {
	return Math.sin(n);
};

function cos (n) {
	return Math.cos(n);
};

function tan (n) {
	return Math.tant(n);
};

function atan (n) {
	return Math.atan(n);
}

function sqrt (n) {
	return Math.sqrt(n);
};

function pow (n, m) {
	return Math.pow(n, m);
};

function isUndef (v) {
  return v === undefined || v === null;
};

function isDef (v) {
  return v !== undefined && v !== null;
};

function isTrue (v) {
  return v === true;
};

function isFalse (v) {
  return v === false;
};

function isFunction (it) {
	return ostring.call(it) === '[object Function]';
};

function isArray (it) {
    return ostring.call(it) === '[object Array]';
};

function toArray (it) {
	return Array.prototype.slice.call(it);
};

function isObject (obj) {
	return obj !== null && typeof obj === 'object';
};

function isNotEmptyList (it) {
	return it && it.length > 0;
};

function hasProp (obj, prop) {
	return hasOwn.call(obj, prop);
};

function eachProp (obj, func) {
	var prop;
    for (prop in obj) {
        if (hasProp(obj, prop)) {
            if (func(obj[prop], prop)) {
                break;
            }
        }
    }
};

function mixin (target, source, force) {
	if (source) {
		eachProp(source, function(val, prop) {
			if (isTrue(force) || !hasProp(target, prop)) {
				target[prop] = val;
			};
		});
	};
	return target;
};

function aop (option) {
	option = mixin(option, {
		before: defaultfn,
		fun: defaultfn,
		after:defaultfn
	});
	return function () {
		option.before.apply(option.func, arguments);
		option.fun.apply(option.func, arguments);
		option.after.apply(option.func, arguments);
	};
};

function makeMap (str, expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) {
    	val = val || '';
    	return map[val.toLowerCase()]; 
    }
    : function (val) { 
    	return map[val]; 
    }
};

function divide (sPos, ePos , num) {
	var divideMap = {};
	var δx = (ePos.x - sPos.x) / num;
	var δy = (ePos.y - sPos.y) / num;
	for (var i = 0; i <= num; i++) {
		var x = sPos.x + i * δx;
		var y = sPos.y + i * δy;
		divideMap['d' + i] = {x: x, y: y};
	};
	return function (val) {return divideMap[val]};
};

function toPos (list) {
	var pos = {};
	if (isArray(list)) {
		pos = {x: list[0], y: list[1]};
	};
	return pos;
};

function parsePos (pos) {
	var list = [];
	if (isObject(pos)) {
		list[0] = pos.x;
		list[1] = pos.y;
	}
	return list;
};

function error (msg) {
	throw new Error('drawTool.js error: ' + msg);
};

function isDOMElement (obj) {
	return !!(obj && obj.nodeType);
};

function getElemWidth (elem) {
	return elem.offsetWidth;
};

function getElemHeight (elem) {
	return elem.offsetHeight;
};

function hasClass(elem, cls) {
	var space = ' ';
    return (space + elem.className + space).indexOf(space + cls + space) > -1;
};

function addClass (elem, cls) {
	if (isArray(cls)) {
		cls.forEach(function(c) {
			addClass(elem, c);
		});
	} else {
		if(!elem.className) {
			elem.className = cls;
		} else {
			elem.className = elem.className + ' ' + cls;
		};
	};
	return elem;
};

function removeClass (elem, cls) {
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

function showElem (elem, shallow) {
	if (isDOMElement(elem)) {
		if (isTrue(shallow)) {
			!hasClass(elem, Cls.showVisCss) && addClass(elem, Cls.showVisCss);
			hasClass(elem, Cls.hideVisCss) && removeClass(elem, Cls.hideVisCss);
		} else {
			!hasClass(elem, Cls.showCss) && addClass(elem, Cls.showCss);
			hasClass(elem, Cls.hideCss) && removeClass(elem, Cls.hideCss);
		};
	} else {
		toArray(elem).forEach(function (e) {
			showElem(e, shallow);
		});
	}
	return elem;
};

function hideElem (elem, shallow) {
	if (isDOMElement(elem)) {
		if (isTrue(shallow)) {
			!hasClass(elem, Cls.hideVisCss) && addClass(elem, Cls.hideVisCss);
			hasClass(elem, Cls.showVisCss) && removeClass(elem, Cls.showVisCss);
		} else {
			!hasClass(elem, Cls.hideCss) && addClass(elem, Cls.hideCss);
			hasClass(elem, Cls.showCss) && removeClass(elem, Cls.showCss);
		}
	} else {
		toArray(elem).forEach(function (e) {
			hideElem(e, shallow);
		});
	};
	return elem;
};

function addCanvas (elem) {
	var canvas = document.createElement('canvas');
	canvas.width = getElemWidth(elem);
	canvas.height = getElemHeight(elem);
	elem.appendChild(canvas);
	return canvas;
};

function clearCanvas (ctx , canvas) {
	ctx.clearRect(0, 0, getElemWidth(canvas), getElemHeight(canvas));
};

var Event = new Object();
Event.on = function (elem, type, fn) {
	if (elem.addEventListener) {
		Event.on = function (elem, type, fn) {
			elem.addEventListener(type, fn, false);
		};
	} else {
		Event.on = function (elem, type, fn) {
			elem.attachEvent('on'+ type, fn);
		};
	};
	Event.on(elem, type, fn);
};

function findParent (pElem, elem, cls) {
	if (pElem == elem) {
		return null;
	};
	if (hasClass(elem, cls)) {
		return elem;
	} else {
		return findParent(pElem, elem.parentNode, cls);
	};
};

Event.delegate = function (pElem, className, type, fn ) {
	Event.on(pElem, type, function (e) {
		var e = e || window.event;
		var target = e.target || e.srcElement;
		var pTarget = findParent(pElem, target, className);
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
			elem.detachEvent('on'+ type, fn);
		};
	};
	Event.off(elem, type, fn);
};

function getMousePos (evt) {
	var e = window.event || evt;
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    var x = e.pageX || e.clientX + scrollX;
    var y = e.pageY || e.clientY + scrollY;
    return { x : x, y : y };
};

function getTargetPos (target, e) {
	var mousePos = getMousePos(e);
	var targetPos = target.getBoundingClientRect();
	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
	var x = targetPos.left + scrollX ;
	var y = targetPos.top + scrollY;
	return { x: ( mousePos.x - x ), y : ( mousePos.y -y )}
};

var Cls = {
	showCss: 'drawTool-show',
	hideCss: 'drawTool-hide',
	showVisCss: 'drawTool-visibility-show',
	hideVisCss: 'drawTool-visibility-hide',
	rootCss: 'drawTool-content-root',
	ndCss: 'drawTool-node',
	ndJs: 'js-drawTool-node',
	inNdJs: 'js-drawTool-inner-node',
	anchorCss: 'drawTool-anchor',
	anchorJs: 'js-drawTool-anchor',
	menuCss: 'drawTool-operate',
	menuBtnCss: 'drawTool-operate-btn',
	menuBtnJs: 'js-drawTool-operate-btn',
	menuDeleteCss: 'drawTool-operate-delete',
	menuDeleteJs: 'js-drawTool-operate-delete',
	menuEditJs: 'js-drawTool-operate-edit',
	menuEditCss: 'drawTool-operate-edit',
	controller: 'drawTool-controller',
	ctrlli: 'drawTool-controller-li',
	ctrlJs: 'js-drawTool-controller-li',
	cvs: 'drawTool-canvas',
	bgCvs: 'drawTool-background-canvas',
	avCvs: 'drawTool-active-canvas'
};

encryptCls(Cls);

function encryptCls(cls) {
	eachProp(cls, function (val, prop) {
		if (prop.indexOf('Js') > -1) {
			cls[prop] += '-' + Math.floor(Math.random() * new Date().getTime()); 
		}
	});
};

function appendAnchors (node) {
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

function appendLineMenu (elem) {
	var div = document.createElement('div');
	div.className = Cls.menuCss;
	div.innerHTML = '\
		<span class="' + Cls.menuBtnCss + ' ' + Cls.menuDeleteCss + ' ' + Cls.menuBtnJs + '">\
			<i class="' + Cls.menuDeleteJs + '"></i>\
		</span>\
		<span class="' + Cls.menuBtnCss + ' ' + Cls.menuEditCss + ' ' +  Cls.menuBtnJs + '">\
			<i class="' + Cls.menuEditJs + '"></i>\
		</span>';
	elem.appendChild(div);
	return hideElem(div);
};

function appendBezierCtrls (elem) {
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
	var map = { ctrl1: li1, ctrl2: li2, ctrl: ul };
	return function (val) { return map[val]; };
}

/**
 * 节点栈
 */
function NodeStack () {
	this.length = 0;
};

var nodeproto = NodeStack.prototype;

nodeproto.pop = Array.prototype.pop;

nodeproto.forEach = Array.prototype.forEach;

nodeproto.peek = function()
{
	return this.length > 0
			? this[this.length -1]
			: undefined;
};

nodeproto.push = function (node) {
	var maxId = 0;
	this.forEach(function (oNode) {
		if (oNode.nodeid > maxId) {
			maxId = oNode.nodeid;
		};
	});
	node.nodeid = node.nodeid || (Number(maxId) + 1);
	Array.prototype.push.call(this, node);
	return node;
};

nodeproto.getNodeById = function (nodeid) {
	var node = null;
	for (var i = 0; i < this.length; i++) {
		var oNode = this[i];
		if (oNode.nodeid == nodeid) {
			node = oNode;
			break;
		};
	};
	return node;
};

nodeproto.deleteById = function( nodeid ) {
	var node = null;
	for(var i = 0; i < this.length; i++) {
		var oNode = this[i];
		if( oNode.nodeid == nodeid ) {
			oNode.remove();
			Array.prototype.splice.call(this, i, 1);
			break;
		}
	}
	return node;
};

nodeproto.clear = function() {
	for (var i = 0; i < this.length; i++) {
		this[i].remove();
	}
	this.length = 0;
};

nodeproto.toArray = function() {
	var arr = []; 
	for (var i = 0; i < this.length; i++) {
		arr.push(this[i]);
	}
	return arr;
};

/**
 * 线栈
 */
function LineStack()
{
	this.length = 0;
};

var lineproto = LineStack.prototype;

lineproto.pop = Array.prototype.pop;

lineproto.forEach = Array.prototype.forEach;

lineproto.peek = function () {
	return this.length > 0
			? this[this.length -1]
			: undefined;
};

lineproto.push = function (line) {
	var maxId = 0;
	for (var i = 0; i < this.length; i++) {
		if (this[i].lineid > maxId) {
			maxId = this[i].lineid;
		};
	};
	line.lineid = line.lineid || (maxId + 1);
	Array.prototype.push.call(this, line);
	return line;
};

lineproto.addAll = function (lineStack) {
	var self = this;
	lineStack.forEach(function(line) {
		self.push(line);
	});
	return self;
};

lineproto.deleteById = function (lineid) {
	var lineStack = new LineStack();
	for (var i = 0; i < this.length; i++) {
		if (this[i].lineid == lineid) {
			lineStack.push(this[i]);
			Array.prototype.splice.call( this, i, 1 );
			break;
		};
	};
	return lineStack;
};

lineproto.deleteByNodeId = function (nodeid) {
	var lineStack = new LineStack();
	for (var i = 0; i < this.length; i++) {
		if( this[i].startNodeid == nodeid
			|| this[i].endNodeid == nodeid) {
			lineStack.push(this[i]);
			Array.prototype.splice.call(this, i, 1);
			i--;
		};
	};
	return lineStack;
};

lineproto.getLineById = function (lineid) {
	var line = null;
	for (var i = 0; i < this.length; i++) {
		var oLine = this[i];
		if (oLine.lineid == lineid) {
			line = oLine;
			break;
		};
	};
	return line;
};

lineproto.toArray = function () {
	var arr = []; 
	for (var i = 0; i < this.length; i++) {
		arr.push(this[i]);
	};
	return arr;
};

lineproto.clear = function () {
	while (this.length) {
		this.pop();
	};
};

/*
 * 线
 */
var isLineType = makeMap('broken,bezier,straight', true);
var isLineStyle = makeMap('arrow,none', true);
function Line (type, style) {
	this.lineid = null;
	this.startNodeid = null;
	this.startAnchorid = null;
	this.startElem = null;
	this.endNodeid = null;
	this.endAnchorid = null;
	this.endElem = null;
	this.ctrl1 = [];
	this.ctrl2 = [];
	this.type = isLineType(type) || 'bezier';
	// 0 init 1 start 2 end
	this.status = 0;
	this.style = isLineStyle(style) || 'none';
};

Line.prototype.setType = function (type) {
	if (isLineType(type)) {
		this.type = type;
	};
	return this;
};

Line.prototype.setStyle = function (style) {
	if (isLineStyle(style)) {
		this.style = style;
	};
	return this;
};

Line.prototype.setStart = function (anchor) {
	this.startNodeid = anchor.parentNode.nodeid;
	this.startAnchorid = anchor.anchorid;
	this.startElem = anchor;
	this.status = 1;
	return this;
};

Line.prototype.setEnd = function (anchor) {
	this.endNodeid = anchor.parentNode.nodeid;
	this.endAnchorid = anchor.anchorid;
	this.endElem = anchor;
	this.status = 2;
	return this;
};

Line.prototype.reSet = function () {
	this.startNodeid = null;
	this.startAnchorid = null;
	this.startElem = null;
	this.endNodeid = null;
	this.endAnchorid = null;
	this.endElem = null;
	this.ctrl1 = [];
	this.ctrl2 = [];
	this.status = 0;
	return this;
};

/**
 * DrawTool class
 */
function DrawTool (wrap, setting) 
{
	if (!isDOMElement(wrap)) {
		error(wrap + ' is not dom');
		return;
	};
	
	var _wrap = wrap;
	var _avCvs = addCanvas(_wrap);
	var _avCtx = _avCvs.getContext('2d');
	var _bgCvs = addCanvas(_wrap);
	var _bgCtx = _bgCvs.getContext('2d');
	var _nodeStack = new NodeStack();
	var _lineStack = new LineStack();
	var _avLine = new Line();
	var _avLineStack = new LineStack();
	var _avNode = null;
	var _wrapLineW = 5;
	var _focusLine = null;
	var _menu = appendLineMenu(_wrap);
	var _ctrlMap = appendBezierCtrls(_wrap);
	var _avCtrl = null;
	var _synchronized = false;
	
	var _setting = mixin(setting, {
		lineColor: '#26b7d0',
		lineHoverColor: 'rgba(200, 200, 200, 0.4)',
		arrowColor: '#444',
		lineStyle: 'arrow', // arrow, line
		type: ''
	});
	var _listenMap = {
		clickLine: defaultfn,
		deleteLineBefore: defaultfn,
		deleteLineAfter: defaultfn,
		linkLineStart: defaultfn,
		linkLineBefore: defaultfn,
		linkLineAfter: defaultfn
	};

	addClass(_wrap, Cls.rootCss);
	addClass(_bgCvs, [Cls.cvs, Cls.bgCvs]);
	addClass(_avCvs, [Cls.cvs, Cls.avCvs]);

	var aopAnchorClick = aop({
		before: function () {
			if (_avLine.status === 0)
				Event.on( _wrap, 'mousemove', moveLinkLine);
		},
		fun: anchorClick,
		after: function () {
			if (_avLine.status === 0) 
				Event.off( _wrap, 'mousemove', moveLinkLine);
		}
	});

	var aopNodeMousedown = aop({
		fun: nodeMousedown,
		after: function () {
			Event.on(_wrap, 'mousemove', nodeMousemove);
		}
	});

	var aopMouseup = aop({
		fun: mouseup,
		after: function () {
			Event.off(_wrap, 'mousemove', nodeMousemove);
		}
	});

	var aopCtrlMouseup = aop({
		fun: ctrlMouseup,
		after: function () {
			Event.off(_wrap, 'mousemove', ctrlMousemove);
		}
	});

	var aopCtrlMousedown = aop({
		fun: ctrlMousedown,
		after: function () {
			Event.on(_wrap, 'mousemove', ctrlMousemove);
		}
	});

	Event.delegate(_wrap, Cls.inNdJs, 'mousedown', aopNodeMousedown);

	Event.delegate(_wrap, Cls.inNdJs, 'mouseup', aopMouseup);
	
	Event.delegate(_wrap, Cls.inNdJs, 'mouseover', nodeMouseover);
	
	Event.delegate(_wrap, Cls.inNdJs, 'mouseout', nodeMouseout);
	
	Event.delegate(_wrap, Cls.anchorJs, 'click', aopAnchorClick);

	Event.delegate(_wrap, Cls.menuDeleteJs, 'click', menuDeleteClick);

	Event.delegate(_wrap, Cls.menuEditJs, 'click', menuEditClick);

	Event.delegate(_wrap, Cls.ctrlJs, 'mousedown', aopCtrlMousedown);

	Event.delegate(_wrap, Cls.ctrlJs, 'mouseup', aopCtrlMouseup);

	Event.on(_wrap, 'click', lineClick);

	Event.on(_wrap, 'mousemove', wrapMousemove);
	
	Event.on(_wrap, 'contextmenu', contextmenu);
	
	function nodeMouseover (e) {
		var node = findParent(_wrap, e.target, Cls.ndJs);
		clearTimeout(node.hideTimer);
		var anchorsNode = node.getElementsByClassName(Cls.anchorJs);
		showElem(anchorsNode, true);
	};
	
	function nodeMouseout (e) {
		var node = findParent(_wrap, e.target, Cls.ndJs);
		var anchorsNode = node.getElementsByClassName(Cls.anchorJs);
		node.hideTimer = setTimeout(function() {
			hideElem(anchorsNode, true);
		}, 300);
	};
	
	function contextmenu (e) {
		_avLine = new Line();
		releaseFocusL();
		reDrawAvCtx();
		e.preventDefault();
	};

	function ctrlMousedown (e) {
		_avCtrl = e.target;
		_avCtrl.relX = e.clientX - _avCtrl.offsetLeft;
		_avCtrl.relY = e.clientY - _avCtrl.offsetTop;
		if (isNotEmptyList(_lineStack)
			&& isFalse(_synchronized)
			&& isDef(_focusLine)) {
			_avLineStack = _lineStack.deleteById(_focusLine.lineid);
			reDrawBgCtx();
			reDrawAvCtx();
			_synchronized = true;
			console.log('提取');
		};
	};

	/**
	 * 控制点弹起
	 */
	function ctrlMouseup () {
		if (isTrue(_synchronized)) {
			_lineStack.addAll(_avLineStack);
			_avLineStack.clear();
			reDrawBgCtx();
			reDrawAvCtx();
			_synchronized = false;
			console.log('投放');
		};
	};

	function ctrlMousemove (e) {
		if (isDOMElement(_avCtrl)) {
			var x = e.clientX - _avCtrl.relX;
			var y = e.clientY - _avCtrl.relY;
			_avCtrl.style.left = x  + 'px';
			_avCtrl.style.top  = y  + 'px';
			var cx = x + _avCtrl.offsetWidth / 2;
			var cy = y + _avCtrl.offsetHeight / 2;
		    _focusLine['ctrl'+_avCtrl.ctrlFlag] = [cx, cy];
		    reDrawAvCtx();
		};
	};

	function menuDeleteClick () {
		_lineStack.deleteById(_focusLine.lineid);
		releaseFocusL();
		hideElem(_menu);
		reDrawBgCtx();
		reDrawAvCtx();
	};

	function menuEditClick (e) {
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
			ctrl1.style.left = _focusLine.ctrl1[0] - chalfW  + 'px';
			ctrl1.style.top = _focusLine.ctrl1[1] - chalfH  + 'px';
		} else {
			ctrl1.style.left = posMap('d1').x - chalfW + 'px';
			ctrl1.style.top = posMap('d1').y - chalfH + 'px';
			_focusLine.ctrl1 = parsePos(posMap('d1'));
		};
		if (isNotEmptyList(_focusLine.ctrl2)) {
			ctrl2.style.left = _focusLine.ctrl2[0] - chalfW  + 'px';
			ctrl2.style.top = _focusLine.ctrl2[1] - chalfH  + 'px';
		} else {
			ctrl2.style.left = posMap('d2').x - chalfW + 'px';
			ctrl2.style.top = posMap('d2').y - chalfH + 'px';
			_focusLine.ctrl2 = parsePos(posMap('d2'));
		};
	};


	/**
	 * 激活活跃节点
	 * 1. 记录活跃节点的信息
	 * 2. 将相关线条从固定层线栈提取到活跃层线栈中
	 * 3. 此时同时刷新固定层和活跃层
	 */
	function nodeMousedown (e) {
		var e = e || window.event;
		var target = e.target || e.srcElement;
		_avNode = findParent(_wrap, target, Cls.ndJs);
		_avNode.relX = e.clientX - _avNode.offsetLeft;
		_avNode.relY = e.clientY - _avNode.offsetTop;
		
		if (isNotEmptyList(_lineStack) && isFalse(_synchronized)) {
			_avLineStack = _lineStack.deleteByNodeId(_avNode.nodeid);
			reDrawBgCtx();
			reDrawAvCtx();
			_synchronized = true;
			console.log('提取');
		};
	};

	/**
	 * 拖动活跃节点的时候
	 * 1. 移动节点的位置
	 * 2. 渲染活跃层数据
	 */
	function nodeMousemove (e) {
		if (isDOMElement(_avNode)) {
		    _avNode.style.cursor = 'move';
			_avNode.style.left = e.clientX - _avNode.relX + 'px';
			_avNode.style.top  = e.clientY - _avNode.relY + 'px';
			reDrawAvCtx();
		};
	};

	/**
	 * 鼠标弹起的时候
	 * 活跃层连线全部投放到固定层中去
	 */
	function mouseup () {
		_avNode = null;
		if (isTrue(_synchronized)) {
			_lineStack.addAll(_avLineStack);
			_avLineStack.clear();
			reDrawBgCtx();
			reDrawAvCtx();
			_synchronized = false;
			console.log('投放');
		};
	};

	/**
	 * 开始连线时，触发一次固定层刷新
	 * 连线完成，向固定层投放新产生的线条
	 */
	function anchorClick (e) {
		var anchor = e.target;
		if (_avLine.status === 0) {
			_listenMap.linkLineStart.call(this, _avLine);
			_avLine.setStart(anchor);
			reDrawBgCtx();
		} else if (_avLine.status === 1) {
			_avLine.setEnd(anchor);
			_lineStack.push(_avLine);
			pushDrawBgCtx(_avLine);
			_avLine = new Line();
			clearCanvas(_avCtx, _avCvs);
		};
	};
	
	// 释放选中的线条
	function releaseFocusL () {
		_focusLine = null;
		hideElem(_ctrlMap('ctrl'));
	};

	/**
	 * 当处于连线状态，触发活跃层刷新即可
	 */
	function moveLinkLine () {
		reDrawAvCtx();
	};

	/**
	 * 点击线条
	 */
	function lineClick (e) {
		//只有点击源是背景canvas才能触发
		if (_bgCvs != e.target) {
			return;
		};
		var focusLine = getFocusLine(e);
		if (isDef(focusLine)) {
			console.log('点击线条');
			_focusLine = focusLine;
			var pos = getTargetPos(_wrap,  e);
			yellMenu(focusLine, pos);
		} else {
			console.log('点击非线条');
			releaseFocusL();
			hideElem(_menu);
		};
		reDrawAvCtx();
	};

	/**
	 * 召唤操作菜单
	 */
	function yellMenu (line, pos) {
		var menuBtn = _menu.getElementsByClassName(Cls.menuBtnJs);
		showElem(menuBtn);
		switch (line.type) {
			case 'bezier':
				break;
			case 'straight':
				var menuEdit = _menu.getElementsByClassName(Cls.menuEditCss);
				hideElem(menuEdit);
				break;
		};
		showElem(_menu);
		_menu.style.left = pos.x + 'px';
		_menu.style.top = pos.y + 'px';
	};

	/**
	 * 获取焦点线条
	 */
	function getFocusLine (e) {
		var resultLine = null;
		if (isExistLine()) {
			var pos = getCavsPosByEvt(e);
			resultLine = getLineByPos(pos.x, pos.y);
		};
		return resultLine;
	};
	
	
	function drawFocusLine () {
		if (isDef(_focusLine)) {
			drawWrapLine(_focusLine);
		};
	};

	/**
	 * hover 画布
	 * 显示对应激活的线条
	 */
	function wrapMousemove (e) {
		var focusLine = getFocusLine(e);
		if (isDef(focusLine)) {
			clearCanvas(_avCtx, _avCvs);
			changeCursor('pointer');
			drawWrapLine(focusLine);
		} else {
			changeCursor('default');
			clearCanvas(_avCtx, _avCvs);
			drawFocusLine(); // 选中的线条
		};
	};

	/**
	 * 改变鼠标样式
	 */
	function changeCursor (style) {
		_wrap.style.cursor = style;
	};

	/**
	 * 是否存在线条
	 */
	function isExistLine () {
		return isNotEmptyList(_lineStack) || isNotEmptyList(_avLineStack);
	};

	/**
	 * 绘制包裹层线条
	 */
	function drawWrapLine (line) {
		var sPos = getAnchorPos(line.startElem);
		var ePos = getAnchorPos(line.endElem);
		switch (line.type) {
			case 'bezier':
				var bezierMap = getBezierPos(line, sPos, ePos);
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
		};
	};
	
	function bezierWrap (ctx, line, sPos, d1Pos, d2Pos, ePos) {
		var nodeRad = 0;
		var isArrow = (_setting.lineStyle === 'arrow');
		var l = sqrt(pow((d2Pos.x - ePos.x), 2) + pow((d2Pos.y - ePos.y), 2));
		var k = (nodeRad + 10) / l;
		var innerK = nodeRad / l;
		var arrowEnd = {};
		arrowEnd.x = ePos.x + innerK * (d2Pos.x - ePos.x);
	    arrowEnd.y = ePos.y + innerK * (d2Pos.y - ePos.y);

	    var bezierEnd = {};
	    bezierEnd.x = isArrow? ePos.x + k * (d2Pos.x - ePos.x) : ePos.x;
	    bezierEnd.y = isArrow? ePos.y + k * (d2Pos.y - ePos.y) : ePos.y;

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
	function straightWrap (ctx, line, sPos, ePos) {
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

	//根据事件获取canvas坐标
	function getCavsPosByEvt (e) {
		var x = e.pageX - _bgCvs.getBoundingClientRect().left;
        var y = e.pageY - _bgCvs.getBoundingClientRect().top;
        return { x: x, y: y };
	};


	// 根据坐标获取线
	function getLineByPos (x, y) {
		var resultLine = null;
		_lineStack.forEach(function(line) {
			var isInPath = isPointInPath(line, {x: x, y: y});
			if (isInPath) {
				resultLine = line;
				return false;
			}
		});
		return resultLine;
	};
	
	function getBezierPos (line, sPos, ePos) {
		var bezierMap = {}; 
		var posMap = divide(sPos, ePos, 3);
		bezierMap['d1Pos'] = toPos(line.ctrl1);
		bezierMap['d2Pos'] = toPos(line.ctrl2);
		if (!isNotEmptyList(line.ctrl1)) {
			bezierMap['d1Pos'] = posMap('d1');
		};
		if (!isNotEmptyList(line.ctrl2)) {
			bezierMap['d2Pos'] = posMap('d2');
		};
		return function (val) {
			return bezierMap[val];
		};
	};


	/*
		判断点是否在线内
		p2-------------p3
		|				|
		p1-------------p4
	*/
	function isPointInPath (line, pos) {
		var isPoint = false;
		var sPos = getAnchorPos(line.startElem);
		var ePos = getAnchorPos(line.endElem);
		switch (line.type) {
			case 'bezier':
				var bezierMap = getBezierPos(line, sPos, ePos);
				isPoint = isPointInPathBezier(
					sPos, 
					bezierMap('d1Pos'), 
					bezierMap('d2Pos'), 
					ePos, 
					pos
				);
				break;
			case 'straight':
				isPoint = isPointInPathStraight (sPos, ePos, pos)
				break;
		};
		return isPoint;
	};
	
	function isPointInPathBezier (sPos, d1Pos, d2Pos, ePos, pos) {
		var dδ = 10;//偏移距离
	    var d = _wrapLineW / 2;
		var nodeRad = 0;
	    var θ1 = atan(( d1Pos.y - sPos.y ) / ( d1Pos.x - sPos.x));
	    var θ2 = atan(( ePos.y - d2Pos.y ) / ( ePos.x - d2Pos.x));

	    var p1Xd = sPos.x - d * sin(θ1) + dδ * cos(θ1);
	    var p1Yd = sPos.y + d * cos(θ1) + dδ * sin(θ1);
	    var p2Xd = d1Pos.x - d * sin(θ1);
	    var p2Yd = d1Pos.y + d * cos(θ1);
	    var p3Xd = d2Pos.x - d * sin(θ2);
	    var p3Yd = d2Pos.y + d * cos(θ2);
	    var p4Xd = ePos.x - d * sin(θ2) - dδ * cos(θ2);
	    var p4Yd = ePos.y + d * cos(θ2) - dδ * sin(θ2);
		
		var ld = sqrt(pow((p3Xd - p4Xd), 2) + pow((p3Yd - p4Yd), 2));
	    var kd = (nodeRad+10) / ld;
	    var innerK = nodeRad / ld;
		
	    var arrowEndX = p4Xd + innerK * (p3Xd - p4Xd);
	    var arrowEndY = p4Yd + innerK * (p3Yd - p4Yd);
	    var bezierEndXd = p4Xd + kd * (p3Xd - p4Xd);
	    var bezierEndYd = p4Yd + kd * (p3Yd - p4Yd);
		
	    _avCtx.save();
	    _avCtx.beginPath();
	    _avCtx.moveTo(p1Xd, p1Yd);
	    _avCtx.bezierCurveTo(p2Xd, p2Yd, p3Xd, p3Yd, bezierEndXd, bezierEndYd);

	    var p1Xu = sPos.x + d * sin(θ1) + dδ * cos(θ1);
	    var p1Yu = sPos.y - d * cos(θ1) + dδ * sin(θ1);
	    var p2Xu = d1Pos.x + d * sin(θ1);
	    var p2Yu = d1Pos.y - d * cos(θ1);
	    var p3Xu = d2Pos.x + d * sin(θ2);
	    var p3Yu = d2Pos.y - d * cos(θ2);
	    var p4Xu = ePos.x + d * sin(θ2) - dδ * cos(θ2);
	    var p4Yu = ePos.y - d * cos(θ2) - dδ * sin(θ2);
		
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
	
	function isPointInPathStraight (sPos, ePos, pos) {
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

	function reDrawBgCtx () {
		clearCanvas(_bgCtx, _bgCvs);
		linkAllBgLink();
	};

	function reDrawAvCtx () {
		clearCanvas(_avCtx, _avCvs);
		if (_avLine.status !== 0) {
			linkLineProcess();
		}
		linkAllAvLink();
		drawFocusLine();
	};

	function pushDrawBgCtx (line) {
		linkLine(_bgCtx, line);
	};

	function linkAllBgLink () {
		_lineStack.forEach(function (line) {
			linkLine(_bgCtx, line);
		});
	};

	function linkAllAvLink () {
		_avLineStack.forEach(function (line) {
			linkLine(_avCtx, line);
		});
	};

	function linkLineProcess (e) {
		// console.log('linkLineProcess');
		var sPos = getAnchorPos(_avLine.startElem);
		var ePos = getTargetPos(_bgCvs, e);
		straightLineTo(_avCtx, _avLine, sPos, ePos);
	};

	function linkLine (ctx, line) {
		// 解析线
		var sPos = getAnchorPos(line.startElem);
		var ePos = getAnchorPos(line.endElem);
		switch (line.type) {
			case 'bezier':
				var bezierMap = getBezierPos(line, sPos, ePos);
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
		};
	};

	function bezierLineTo (ctx, line, sPos, d1Pos, d2Pos, ePos, nodeRad) {
		var isArrow = (line.style === 'arrow');
		var l = sqrt(pow((d2Pos.x - ePos.x), 2) + pow((d2Pos.y - ePos.y), 2));
		var k = (nodeRad + 10) / l;
		var innerK = nodeRad / l;
		var arrowEnd = {};
		arrowEnd.x = ePos.x + innerK * (d2Pos.x - ePos.x);
	    arrowEnd.y = ePos.y + innerK * (d2Pos.y - ePos.y);

	    var bezierEnd = {};
	    bezierEnd.x = isArrow? ePos.x + k * (d2Pos.x - ePos.x) : ePos.x;
	    bezierEnd.y = isArrow? ePos.y + k * (d2Pos.y - ePos.y) : ePos.y;

	    ctx.save();
	    ctx.beginPath();
	    if (ctx !== _avCtx) {
			ctx.strokeStyle = _setting.lineColor;
		};
	    ctx.moveTo(sPos.x, sPos.y);
	    ctx.bezierCurveTo(d1Pos.x, d1Pos.y, d2Pos.x, d2Pos.y, bezierEnd.x, bezierEnd.y);
	    ctx.stroke();

	    ctx.beginPath();
	    ctx.arc(ePos.x, ePos.y, nodeRad, 0, 2 * Math.PI);
	    ctx.stroke();

	    isArrow && (styleArrow(ctx, d2Pos, arrowEnd, bezierEnd));
	    ctx.restore();
	};


	function bezierStyleArrow (ctx, d2Pos, arrowEnd, bezierEnd) {
		ctx.beginPath(); 
	    ctx.translate(arrowEnd.x, arrowEnd,y);
	    ctx.rotate(Math.atan2(bezierEnd.y - d2Pos.y, bezierEnd.x - d2Pos.x));
	    ctx.moveTo(0, 0);
	    ctx.lineTo(-10, 3);
	    ctx.lineTo(-10, -3);
	    ctx.lineTo(0, 0);
	    ctx.stroke();
	    ctx.fill();
	};

	function straightLineTo (ctx, line, sPos, ePos) {
		if (ctx !== _avCtx) {
			ctx.strokeStyle = _setting.lineColor;
		};
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(sPos.x, sPos.y);
		ctx.lineTo(ePos.x, ePos.y);
		ctx.stroke();
		(line.style == 'arrow') && (styleArrow(ctx, sPos, ePos));
		ctx.restore();
	};

	function styleArrow (ctx, sPos, ePos) {
		ctx.translate(ePos.x, ePos.y);
		ctx.rotate(Math.atan2(ePos.y - sPos.y, ePos.x - sPos.x));
		ctx.lineTo(-10, 3);
		ctx.lineTo(-10, -3);
		ctx.lineTo(0, 0);
		ctx.fillStyle = _setting.arrowColor;
		ctx.fill();
	};

	function getAnchorPos (elem) {
		var pos = {};
		if (isDOMElement(elem)) {
			pos.y = elem.parentNode.offsetTop + elem.offsetTop + getElemHeight(elem) / 2;
			pos.x = elem.parentNode.offsetLeft + elem.offsetLeft + getElemWidth(elem) / 2;
		};
		return pos;
	};

	this.addNode = function (conf) {
		var node = document.createElement('div');
		addClass(node, [Cls.ndCss, Cls.ndJs]);
		node.style.left = conf.pos.x + 'px';
		node.style.top = conf.pos.y + 'px';
		node.innerHTML = conf.html;
		node.htmlStr = conf.html;
		node.nodeid = conf.nodeid || null;
		node.anchors = conf.anchors;

		var innerNode = node.children[0];
		addClass(innerNode, Cls.inNdJs);
		
		_wrap.appendChild(node);
		var reNode = _nodeStack.push(node);
		reNode.setAttribute('node-id', reNode.nodeid);
		
		var anchorsNode = appendAnchors(node);
		hideElem(anchorsNode, true);
		return node;
	};

	this.listen = function () {
		if (arguments.length === 1 && isObject(arguments[0])) {
			_listenMap = mixin(arguments[0], _listenMap);
		} else if (arguments.length >= 2 && isFunction(arguments[1])) {
			var type = arguments[0],
				fn = arguments[1];
			_listenMap[type] = fn;
		};
	};
	
	this.getAllNodes = function () {
		return _nodeStack.toArray();
	};

	this.getAllLines = function () {
		return _lineStack.toArray();
	};
};

return DrawTool;

});