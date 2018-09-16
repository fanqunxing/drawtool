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

function isArray(it) {
    return ostring.call(it) === '[object Array]';
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

function aop (setting) {
	var func = new Function ();
	setting = mixin(setting, {
		before: func,
		fun: func,
		after:func
	});
	return function () {
		setting.before.apply(setting.before, arguments);
		setting.fun.apply(setting.func, arguments);
		setting.after.apply(setting.after, arguments);
	};
};

// dom func
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
    return { x : x, y : y }
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
	operateCss: 'drawTool-operate',
	operateBtnCss: 'drawTool-operate-btn',
	operateDeleteCss: 'drawTool-operate-delete',
	operateDeleteJs: 'js-drawTool-operate-delete',
	operateEditJs: 'js-drawTool-operate-edit',
	operateEditCss: 'drawTool-operate-edit',
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
function Line (type) {
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
};

Line.prototype.setStart = function (anchor) {
	this.startNodeid = anchor.parentNode.nodeid;
	this.startAnchorid = anchor.anchorid;
	this.startElem = anchor;
	this.status = 1;
};

Line.prototype.setEnd = function (anchor) {
	this.endNodeid = anchor.parentNode.nodeid;
	this.endAnchorid = anchor.anchorid;
	this.endElem = anchor;
	this.status = 2;
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
		lineStyle: 'arrow'// arrow, line
	});
	var _bgCvs = addCanvas(_wrap);
	var _bgCtx = _bgCvs.getContext('2d');
	var _avCvs = addCanvas(_wrap);
	var _avCtx = _avCvs.getContext('2d');
	var _nodeStack = new NodeStack();
	var _lineStack = new LineStack();
	var _avLine = new Line();
	var _avLineStack = new LineStack();
	var _avNode = null;

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
			if (_avLine.status === 0) {
				Event.off( _wrap, "mousemove", moveLinkLine);
			}
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
		if (_avLineStack.length === 0) {
			_avLineStack = _lineStack.deleteByNodeId(_avNode.nodeid);
			console.log('提取');
			reDrawBgCtx();
			reDrawAvCtx();
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
		if (_avLineStack.length > 0) {
			_lineStack.addAll(_avLineStack);
			_avLineStack.clear();
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
		var sElem = _avLine.startElem; 
		var startPos = getAnchorPos(sElem);
		var endPos = getTargetPos(_bgCvs, e);
		// 画线
		_avCtx.save();
		_avCtx.beginPath();
		_avCtx.moveTo(startPos.x, startPos.y);
		_avCtx.lineTo(endPos.x, endPos.y);
		// _avCtx.strokeStyle = _setting.lineColor;
		_avCtx.stroke();
	};

	function linkLine (ctx, line) {
		// 解析线
		var sElem = line.startElem;
		var eElem = line.endElem;

		var startPos = getAnchorPos(sElem);
		var endPos = getAnchorPos(eElem);

		// 画线
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(startPos.x, startPos.y);
		ctx.lineTo(endPos.x, endPos.y);
		if (ctx == _bgCtx) {
			ctx.strokeStyle = _setting.lineColor;
		}
		ctx.stroke();
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

};



return DrawTool;

});