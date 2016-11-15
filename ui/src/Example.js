import React, { Component } from 'react';
import './Example.css';

export default class Example extends Component {
  constructor(props) {
    super(props);
    this.state = { link: "https://framed.joshchorlton.com/api/photo/ab6ccf" };
  }

  componentDidMount() {
    let link = this.state.link;
    setInterval(function(){
      document.getElementById('framed').src = link + '?' + new Date().getTime()
    }, 15000);
  }

  render() {
    return (
      <div className={`section example`}>
        <h2>Example</h2>
        { this.props.loaded
            ? <img id="framed" alt="random" src={ this.state.link }/>
            : null }
      </div>
    );
  }
}

