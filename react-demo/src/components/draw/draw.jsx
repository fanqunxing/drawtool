import React from 'react';
import './draw.css';
import Node from '../Node/Node';
import ReactDOM from 'react-dom';

export default class Draw extends React.Component {

  constructor() {
    super();
    this.drawtool = null;
  }

  save = () => {
    var lineArr = this.drawtool.getAllLines();
    var nodeArr = this.drawtool.getAllNodes();
    var nodeInfoArr = this.drawtool.getAllNodesInfo();
    console.log(lineArr);
    console.log(nodeArr);
    console.log(nodeInfoArr);
  }

  addNode = () => {
    var option = {
      pos: {x:20,y:20},
      template: <Node />,
      render: (node, template) => ReactDOM.render(template, node),
      anchors: [[0, 20],[40, 20],[20, 0],[20, 40]]
    };
    this.drawtool.addNode(option);
  }

  componentDidMount() {
    var canvas = document.getElementById('canvas');
    this.drawtool = new window.Drawtool(canvas);
  };

  render() {
    return (
      <div>
        画布
        <div onClick={this.save}>保持</div>
        <div onClick={this.addNode}>添加</div>
        <div id="canvas" className="canvas"></div>
      </div>
    )
  }
};