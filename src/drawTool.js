(function( global, factory ){
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
  	typeof define === 'function' && define.cmd ? define(factory) :
	( global.DrawTool = factory() );
})( this, function(){

var op = Object.prototype;
var ostring = op.toString;
var hasOwn = op.hasOwnProperty;

function isFunction( it )
{
	return ostring.call( it ) === '[object Function]';
};

function isArray( it ) 
{
	return ostring.call( it ) === '[object Array]';
};

function isObject( obj ) 
{
	return obj !== null && typeof obj === 'object';
};

function toNumber( val )
{
	var n = parseFloat(val);
	return isNaN(n) ? val : n;
};

function hasProp( obj, prop ) 
{
	return hasOwn.call(obj, prop);
};

function extend( to, from ) 
{
	for (var key in from) 
	{
		if (hasProp( from, key ) && from[key]) 
		{
			to[key] = from[key];
		};
	};
	return to;
};

function error( msg )
{
	throw new Error( "drawTool.js error: " + msg );
};

function getWidth( dom )
{
	return dom.offsetWidth;
};

function getHeight( dom )
{
	return dom.offsetHeight;
};

function hasClass( dom, className ) 
{
    return (' ' + dom.className + ' ').indexOf(' ' + className + ' ') > -1;
};

function addClass( dom, className )
{
	if( dom.className === undefined )
	{
		dom.className = className;
	}
	else
	{
		dom.className = dom.className + ' ' + className;
	}
};

function removeClass( dom, className ) 
{
	if( hasClass( dom, className ) ) 
	{
		var newClass = ' ' + dom.className.replace(/[\t\r\n]/g, '') + ' ';
		while ( newClass.indexOf(' ' + className + ' ') >= 0 ) 
		{
			newClass = newClass.replace(' ' + className + ' ', ' ');
		}
		dom.className = newClass.replace(/^\s+|\s+$/g, '');
	}
};

function addCanvas( dom )
{
	var canvas = document.createElement( "canvas" );
	canvas.width = getWidth( dom );
	canvas.height = getHeight( dom );
	dom.appendChild( canvas );
	return canvas;
};

var Event = new Object();
Event.on = function( elem, type, fn )
{
	if(elem.addEventListener)
	{
		Event.on = function( elem, type, fn )
		{
			elem.addEventListener( type, fn, false );
		}
	}
	else
	{
		Event.on = function( elem, type, fn )
		{
			elem.attachEvent( 'on'+ type, fn );
		}
	}
	Event.on( elem, type, fn );
};

function findParent(pom, dom, className) 
{
	if (pom == dom) 
	{
		return null;
	}
	if (hasClass(dom, className)) 
	{
		return dom;
	} 
	else 
	{
		return findParent(pom, dom.parentNode, className)
	}
};

Event.delegate = function( pdom, className, type, fn )
{
	Event.on( pdom, type, function( e ) {
		var e = e || window.event;
		var target = e.target || e.srcElement;
		var pTarget = findParent(pdom, target, className );
		if( pTarget )
		{
			fn.call( pTarget, e );
		}
	}, false);
};

Event.off = function( elem, type, fn )
{
	if(elem.removeEventListener)
	{
		Event.off = function( elem, type, fn )
		{
			elem.removeEventListener( type, fn, false );
		}
	}
	else
	{
		Event.off = function( elem, type, fn )
		{
			elem.detachEvent( 'on'+ type, fn );
		}
	}
	Event.off( elem, type, fn );
};



function clearCanvas( ctx , canvas )
{
	ctx.clearRect( 0, 0, getWidth( canvas ), getHeight( canvas ) );
};

var Classes = {
	showCss:"drawTool-show",
	hideCss:"drawTool-hide",
	rootCss: "drawTool-content-root",
	nodeCss: "drawTool-node",
	nodeJs: "js-drawTool-node",
	innerNodeJs: "js-drawTool-inner-node",
	anchorCss: "drawTool-anchor",
	anchorJs: "js-drawTool-anchor",
	operateCss: "drawTool-operate",
	operateBtnCss: "drawTool-operate-btn",
	operateDeleteCss: "drawTool-operate-delete",
	operateDeleteJs: "js-drawTool-operate-delete",
	operateEditJs: "js-drawTool-operate-edit",
	operateEditCss: "drawTool-operate-edit",
	controller: "drawTool-controller",
	ctrlli: "drawTool-controller-li",
	ctrlJs: "js-drawTool-controller-li"
};

encryptClasses(Classes);

function encryptClasses()
{
	for (var key in Classes) 
	{
		if (key.indexOf('Js') > -1) {
			Classes[key] += '-' + Math.floor(Math.random() * new Date().getTime()); 
		}
	}
};

function showDom( dom )
{
	addClass( dom, Classes.showCss );
	removeClass( dom, Classes.hideCss );
};

function hideDom( dom )
{
	addClass( dom, Classes.hideCss );
	removeClass( dom, Classes.showCss )
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

lineproto.peek = function()
{
	return this.length > 0
			? this[this.length -1]
			: undefined;
};

lineproto.push = function( line ){
	var maxId = 0;
	for(var i = 0; i < this.length; i++)
	{
		if( this[i].lineid > maxId )
		{
			maxId = this[i].lineid;
		}
	}
	line.lineid = line.lineid || (maxId + 1);
	Array.prototype.push.call( this, line );
	return line;
};

lineproto.deleteById = function( lineid ){
	for(var i = 0; i < this.length; i++)
	{
		if( this[i].lineid == lineid )
		{
			Array.prototype.splice.call( this, i, 1 );
			break;
		}
	}
};

lineproto.deleteByNodeId = function( nodeid ) {
	for(var i = 0; i < this.length; i++)
	{
		if( this[i].startNodeid == nodeid 
			|| this[i].endNodeid == nodeid)
		{
			Array.prototype.splice.call( this, i, 1 );
			i--;
		}
	}
};

lineproto.getLineById = function( lineid )
{
	var line = null;
	for (var i = 0; i < this.length; i++)
	{
		var oLine= this[i];
		if( oLine.lineid == lineid )
		{
			line = oLine;
			break;
		}
	}
	return line;
};

lineproto.toArray = function() {
	var arr = []; 
	for (var i = 0; i < this.length; i++) 
	{
		arr.push(this[i]);
	}
	return arr;
};

lineproto.clear = function()
{
	while (this.length) {
		this.pop();
	};
};

/**
 * 节点栈
 */
function NodeStack()
{
	this.length = 0;
};

var nodeproto = NodeStack.prototype;

nodeproto.pop = Array.prototype.pop;

nodeproto.peek = function()
{
	return this.length > 0
			? this[this.length -1]
			: undefined;
};

nodeproto.push = function( node ){
	var maxId = 0;
	for(var i = 0; i < this.length; i++)
	{
		if( this[i].nodeid > maxId )
		{
			maxId = this[i].nodeid;
		}
	}
	node.nodeid = node.nodeid || (maxId+1);
	Array.prototype.push.call( this, node );
	return node;
};

nodeproto.getNodeById = function( nodeid )
{
	var node = null;
	for(var i = 0; i < this.length; i++)
	{
		var oNode = this[i];
		if( oNode.nodeid == nodeid )
		{
			node = oNode;
			break;
		}
	}
	return node;
};

nodeproto.deleteById = function( nodeid ) {
	var node = null;
	for(var i = 0; i < this.length; i++)
	{
		var oNode = this[i];
		if( oNode.nodeid == nodeid )
		{
			oNode.remove();
			Array.prototype.splice.call( this, i, 1 );
			break;
		}
	}
	return node;
};

nodeproto.clear = function()
{
	for(var i = 0; i < this.length; i++)
	{
		this[i].remove();
	}
	this.length = 0;
};

nodeproto.toArray = function() {
	var arr = []; 
	for (var i = 0; i < this.length; i++) 
	{
		arr.push(this[i]);
	}
	return arr;
};


function divide( start, end , num )
{
	var divideMap = {};
	var δx = ( end[0] - start[0] ) / num;
	var δy = ( end[1] - start[1] ) / num;
	for( var i = 1; i < num; i++ )
	{
		var x = start[0] + i * δx;
		var y = start[1] + i * δy;
		divideMap[i] = [x, y];
	}
	return divideMap;
}




function DrawTool( dom , setting)
{
	

	this.addNode = function ( nodeCfg )
	{
	};

	this.deleteNodeById = function ( )
	{
	};

	this.clear = function() 
	{
	};

	this.getAllNodesInfo = function ()
	{
	};

	this.getAllNodes = function ()
	{
	};

	this.getAllLines = function ()
	{
	};

	this.listen = function ()
	{
	};

	this.init = function( nodeStack, lineStack )
	{
	};
};

DrawTool.version = '1.1.1';

return DrawTool;

});