import React, { Component } from 'react';
import TitleDesc from './TitleDesc';
import GettingStarted from './GettingStarted';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="app">
        <TitleDesc />
        <GettingStarted />
      </div>
    );
  }
}
