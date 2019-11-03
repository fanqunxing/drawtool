import React from 'react';

export default class Node extends React.Component {

  click = () => {
    alert(1);
  }

  render() {
    return (
      <div onClick={this.click} className='node js-node'>test</div>
    )
  }
}