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
}

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

function once (fn) {
	var called = false;
  	return function () {
    	if (!called) {
      		called = true;
      		fn.apply(this, arguments);
    	}
  	}
}


function aop (option) {
	option = mixin(option, {
		before: defaultfn,
		fun: defaultfn,
		after:defaultfn
	});
	return function () {
		option.before.apply(option.before, arguments);
		option.fun.apply(option.func, arguments);
		option.after.apply(option.after, arguments);
	};
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

function showElem (elem) {
	if (isDOMElement(elem)) {
		if (!hasClass(elem, Cls.showCss)) {
			addClass(elem, Cls.showCss);
		};
		if (hasClass(elem, Cls.hideCss)) {
			removeClass(elem, Cls.hideCss);
		}
	} else {
		toArray(elem).forEach(function (e) {
			showElem(e);
		});
	}
	return elem;
};

function hideElem (elem) {
	if (isDOMElement(elem)) {
		if (!hasClass(elem, Cls.hideCss)) {
			addClass(elem, Cls.hideCss);
		};
		if (hasClass(elem, Cls.showCss)) {
			removeClass(elem, Cls.showCss);
		}
	} else {
		toArray(elem).forEach(function (e) {
			hideElem(e);
		});
	}
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

function appendAnchors (node) {
	if (isArray(node.anchors)) {
		node.anchors.forEach(function (anchors, index) {
			var anchorNode = document.createElement('span');
			addClass(anchorNode, [Cls.anchorCss, Cls.anchorJs]);
			anchorNode.anchorid = index;
			anchorNode.pos = [anchors[0], anchors[1]];
			anchorNode.setAttribute('anchorNode-id', index);
			node.appendChild(anchorNode);

			anchorNode.style.left = anchors[0] - getElemWidth(anchorNode) / 2 + 'px';
			anchorNode.style.top = anchors[1] - getElemHeight(anchorNode) / 2 + 'px';
		});
	};
	return node;
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
	// return div;
};

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
		}
	}
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
}


lineproto.deleteById = function (lineid) {
	for (var i = 0; i < this.length; i++) {
		if (this[i].lineid == lineid) {
			Array.prototype.splice.call( this, i, 1 );
			break;
		};
	};
};

lineproto.deleteByNodeId = function (nodeid) {
	var lineStack = new LineStack();
	for (var i = 0; i < this.length; i++) {
		if( this[i].startNodeid == nodeid
			|| this[i].endNodeid == nodeid) {
			lineStack.push(this[i]);
			Array.prototype.splice.call(this, i, 1);
			i--;
		}
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
	}
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
	this.type = type || 'bezier';
	// 0 init 1 start 2 end
	this.status = 0;
	this.style = style || 'none';
};

Line.prototype.setType = function (type) {
	// broken bezier straight
	this.type = type;
	return this;
};

Line.prototype.setStyle = function (style) {
	this.style = style;
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
}

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
}

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
	var _setting = mixin(setting, {
		lineColor: '#26b7d0',
		lineHoverColor: '#aaa',
		arrowColor: '#444',
		lineStyle: 'arrow', // arrow, line
		type: ''
	});
	var _avCvs = addCanvas(_wrap);
	var _avCtx = _avCvs.getContext('2d');
	var _bgCvs = addCanvas(_wrap);
	var _bgCtx = _bgCvs.getContext('2d');
	var _nodeStack = new NodeStack();
	var _lineStack = new LineStack();
	var _avLine = new Line();
	var _avLineStack = new LineStack();
	var _avNode = null;
	var _wrapLineW = 10;
	var _focusLine = null;
	var _listenMap = {
		clickLine: defaultfn,
		deleteLineBefore: defaultfn,
		deleteLineAfter: defaultfn,
		linkLineStart: defaultfn,
		linkLineBefore: defaultfn,
		linkLineAfter: defaultfn
	};
	var _menu = appendLineMenu(_wrap);

	addClass(_wrap, Cls.rootCss);
	addClass(_bgCvs, [Cls.cvs, Cls.bgCvs]);
	addClass(_avCvs, [Cls.cvs, Cls.avCvs]);

	var aopAnchorClick = aop({
		before: function () {
			if (_avLine.status === 0)
				Event.on( _wrap, "mousemove", moveLinkLine);
		},
		fun: anchorClick,
		after: function () {
			if (_avLine.status === 0) 
				Event.off( _wrap, "mousemove", moveLinkLine);
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
			Event.off( _wrap, 'mousemove', nodeMousemove);
		}
	});

	Event.delegate(_wrap, Cls.inNdJs, 'mousedown', aopNodeMousedown);

	Event.delegate(_wrap, Cls.inNdJs, 'mouseup', aopMouseup);

	Event.delegate(_wrap, Cls.anchorJs, 'click', aopAnchorClick);

	Event.delegate(_wrap, Cls.menuDeleteJs, "click", menuDeleteClick);

	Event.on(_wrap, 'click', lineClick);

	Event.on(_wrap, "mousemove", wrapMousemove);


	function menuDeleteClick () {
		_lineStack.deleteById(_focusLine.lineid);
		reDrawBgCtx();
		// reDrawAvCtx();
	}


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
		if (isNotEmptyList(_lineStack)) {
			_avLineStack = _lineStack.deleteByNodeId(_avNode.nodeid);
			reDrawBgCtx();
			reDrawAvCtx();
			console.log('提取');
		}
	};

	/**
	 * 拖动活跃节点的时候
	 * 1. 移动节点的位置
	 * 2. 渲染活跃层数据
	 */
	function nodeMousemove (e) {
		if (_avNode) {
		    _avNode.style.cursor = "move";
			_avNode.style.left = e.clientX - _avNode.relX + 'px';
			_avNode.style.top  = e.clientY - _avNode.relY + 'px';
			reDrawAvCtx();
		}
	};

	/**
	 * 鼠标弹起的时候
	 * 活跃层连线全部投放到固定层中去
	 */
	function mouseup () {
		_avNode = null;
		if (isNotEmptyList(_avLineStack)) {
			_lineStack.addAll(_avLineStack);
			_avLineStack.clear();
			reDrawBgCtx();
			reDrawAvCtx();
			console.log('投放');
		}
	}

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
		var focusLine = getFocusLine(e);
		if (isDef(focusLine)) {
			console.log('点击线条');
			_focusLine = focusLine;
			var pos = getTargetPos(_wrap,  e);
			yellMenu(focusLine, pos);
		} else {
			_focusLine = null;
			hideElem(_menu);
		}
	};

	/**
	 * 召唤操作菜单
	 */
	function yellMenu (line, pos) {
		var menuBtn = _menu.getElementsByClassName(Cls.menuBtnJs);
		showElem(menuBtn);
		switch (line.type) {
			case 'bezier':
				// var menuDelete = _menu.getElementsByClassName(Cls.menuDeleteCss);
				// hideElem(menuDelete);
				break;
			case 'straight':
				var menuEdit = _menu.getElementsByClassName(Cls.menuEditCss);
				hideElem(menuEdit);
		}
		showElem(_menu);
		_menu.style.left = pos.x + "px";
		_menu.style.top = pos.y + "px";
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
	 * 画包裹层线条
	 */
	function drawWrapLine (line) {
		var sPos = getAnchorPos(line.startElem);
		var ePos = getAnchorPos(line.endElem);
		_avCtx.save();
		_avCtx.beginPath();
		_avCtx.lineCap = 'round';
		_avCtx.lineWidth = _wrapLineW;
	    _avCtx.strokeStyle = _setting.lineHoverColor;
		_avCtx.moveTo(sPos.x, sPos.y);
		_avCtx.lineTo(ePos.x, ePos.y);
		_avCtx.stroke();
		_avCtx.restore();
		return line;
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


	/*
		判断点是否在线内
		p2-------------p3
		|				|
		p1-------------p4
	*/
	function isPointInPath (line, pos) {
		var sPos = getAnchorPos(line.startElem);
		var ePos = getAnchorPos(line.endElem);
		var d = _wrapLineW / 2;
		var red = 10; // 线的缩进距离
		// 线的倾斜角度
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
		// _avCtx.stroke();
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
	};

	function pushDrawBgCtx (line) {
		linkLine (_bgCtx, line);
	};

	function linkAllBgLink () {
		_lineStack.forEach(function (line) {
			linkLine (_bgCtx, line);
		});
	};

	function linkAllAvLink () {
		_avLineStack.forEach(function (line) {
			linkLine (_avCtx, line);
		});
	};

	function linkLineProcess (e) {
		// console.log('linkLineProcess');
		var sPos = getAnchorPos(_avLine.startElem);
		var ePos = getTargetPos(_bgCvs, e);
		lineTo(_avCtx, _avLine, sPos, ePos);
	};

	function linkLine (ctx, line) {
		// 解析线
		var sPos = getAnchorPos(line.startElem);
		var ePos = getAnchorPos(line.endElem);
		lineTo(ctx, line, sPos, ePos);
	};

	function lineTo (ctx, line, sPos, ePos) {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(sPos.x, sPos.y);
		ctx.lineTo(ePos.x, ePos.y);
		if (ctx !== _avCtx) {
			ctx.strokeStyle = _setting.lineColor;
		}
		ctx.stroke();
		(line.style == 'arrow') && (styleArrow(ctx, sPos, ePos));
		ctx.restore();
	};

	function styleArrow (ctx, sPos, ePos) {
		ctx.translate(ePos.x, ePos.y);
		ctx.rotate(Math.atan2(ePos.y - sPos.y, ePos.x - sPos.x));
		ctx.lineTo(-10,3);
		ctx.lineTo(-10,-3);
		ctx.lineTo(0,0);
		ctx.fillStyle = _setting.arrowColor;
		ctx.fill();
	}

	function getAnchorPos (elem) {
		var pos = {};
		if (isDOMElement(elem)) {
			pos.y = elem.parentNode.offsetTop + elem.offsetTop + getElemHeight(elem) / 2;
			pos.x = elem.parentNode.offsetLeft + elem.offsetLeft + getElemWidth(elem) / 2;
		};
		return pos;
	};



	this.addNode = function (conf) {
		var node = document.createElement( "div" );
		addClass(node, [Cls.ndCss, Cls.ndJs]);
		node.style.left = conf.pos.x + "px";
		node.style.top = conf.pos.y + "px";
		node.innerHTML = conf.html;
		node.htmlStr = conf.html;
		node.nodeid = conf.nodeid || null;
		node.anchors = conf.anchors;

		var innerNode = node.children[0];
		addClass(innerNode, Cls.inNdJs);

		_wrap.appendChild(node);
		_nodeStack.push(node);
		appendAnchors(node);
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

};



return DrawTool;

});