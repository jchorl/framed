import React, { Component } from 'react';
import './Example.css';

export default class Example extends Component {
  constructor(props) {
    super(props);
    this.state = { link: "http://localhost:3000/api/photo/4e6edb" };
  }

  componentDidMount() {
    let link = this.state.link;
    setTimeout(function(){document.getElementById('framed').src=link+'?'+new Date().getTime()},30000,30000);
  }

  render() {
    return (
      <div className="example">
        <h2>Example</h2>
        { this.props.loaded
            ? <img id="framed" alt="random" src={ this.state.link }/>
            : null }
      </div>
    );
  }
}

