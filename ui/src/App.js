import React, { Component } from 'react';
import TitleDesc from './TitleDesc';
import GettingStarted from './GettingStarted';
import Example from './Example';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {loaded: false};
  }

  setLoaded = () => {
    this.setState({loaded: true});
  }

  render() {
    return (
      <div className="app">
        <TitleDesc />
        <GettingStarted setLoaded={this.setLoaded} />
        <Example loaded={this.state.loaded} />
      </div>
    );
  }
}
