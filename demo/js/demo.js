var canvas = document.getElementById('canvas');
var setting = {
	lineColor: '#26b7d0',
	lineHoverColor: '#aaa',
	arrowColor: '#444',
	lineStyle: 'arrow', // none
	type: 'broken',
	auto: false
}

var drawtool = new Drawtool(canvas, setting);

function addNode(x, y) {
	var type = $("#type").val();
	var text = $('#text').val();
	var option = {
		pos:{x:x,y:y},
		template:"<div class='node js-node'>\
					<div class='in " + type + "'>" + text + "</div>\
					<button class=\"option\">删除</button>\
			  	</div>",
			  // <div class='in " + type + "'>"+ text +"</div>\
		// html: "<div class='node js-node'>"+ String.fromCharCode(index) +"</div>",
		anchors:[[0, 20],[40, 20],[20, 0],[20, 40]]
	};
	var node = drawtool.addNode(option);
	console.log(node.nodeid);
};

var scaleNum = 1;
function scale() {
	scaleNum -= 0.1;
	drawtool.scale(scaleNum);
};

drawtool.listen({
	clickLine: function(line) {
		console.log(line);
	},
	deleteLineBefore: function(line) {
		console.log(line)
		return true;
	},
	deleteLineAfter: function(line) {
		console.log(line);
	},
	linkLineBefore: function(line) {
		return true;
	},
	linkLineAfter: function(line) {
		console.log(line);
	}
});

// 动态设置线的样式
// broken bezier straight
drawtool.listen('linkLineStart', function(line) {
	var arrow = $("#arrow").val();
	var lineType = $("#lineType").val();
	var auto = $("#auto").val();
	line.setStyle(arrow);
	line.setType(lineType);
	line.setAuto(Number(auto));
});


function save() {
	var lineArr = drawtool.getAllLines();
	var nodeArr = drawtool.getAllNodes();
	var nodeInfoArr = drawtool.getAllNodesInfo();
	console.log(lineArr);
	console.log(nodeArr);
	console.log(nodeInfoArr);
	localStorage.setItem('lineArr', JSON.stringify(lineArr));
	localStorage.setItem('nodeArr', JSON.stringify(nodeInfoArr));
};

init();
function init() {
	var lineArr = JSON.parse(localStorage.getItem('lineArr')) || [];
	var nodeArr = JSON.parse(localStorage.getItem('nodeArr')) || [];
	drawtool.init(nodeArr, lineArr);
};



function clearMap() {
	drawtool.clear();
};

function getImage() {
	drawtool.getImage(function(res) {
    console.log(res);
    var src = res.dataURL;
    var img = new Image();
    img.src = src;
    img.onload = function() {
      var body = document.getElementById('body');
      body.appendChild(img)
    }
    
	}, true);
};

$("#canvas").delegate('.js-node', 'mousemove', function(e) {
	clearTimeout(this.timer);
});

$("#canvas").delegate('.js-node', 'contextmenu ', function(e) {
	clearTimeout(this.timer);
	$(this).find('.option').show();
});

$("#canvas").delegate('.js-node', 'mouseleave', function() {
	var self = this;
	this.timer = setTimeout(function(){
		$(self).find('.option').hide();
	}, 500);
});

$("#canvas").delegate('.option', 'click', function() {
	console.log('option');
	var nodeid = $(this).closest('.js-node').get(0).nodeid;
	drawtool.deleteNodeById(nodeid);
});




