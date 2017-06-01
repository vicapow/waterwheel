import React, { Component } from 'react';
import './App.css';
import ThreeScene from './ThreeScene.js';

class App extends Component {
  constructor(props) {
    super(props);
    this._animate = this._animate.bind(this);
    this._onChangeNumberOfCups = this._onChangeNumberOfCups.bind(this);
    this._onChangeWheelRadius = this._onChangeWheelRadius.bind(this);
    this._onChangeWheelRotation = this._onChangeWheelRotation.bind(this);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      numberOfCups: 100,
      wheelRadius: 500,
      wheelRotation: 0
    };
    window.addEventListener('resize', () => {
      this.setState({ width: window.innerWidth, height: window.innerHeight });
    })
  }
  componentDidMount() {
    this._animate();
  }
  _animate() {
    this.setState({timestamp: Date.now()});
    window.requestAnimationFrame(this._animate);
  }
  _onChangeNumberOfCups(event) {
    this.setState({numberOfCups: Number(event.target.value)});
  }
  _onChangeWheelRadius(event) {
    this.setState({wheelRadius: Number(event.target.value)});
  }
  _onChangeWheelRotation(event) {
    this.setState({wheelRotation: Number(event.target.value)});
  }
  render() {
    const { width, height } = this.state;
    return (
      <div className="App">
        <ThreeScene
          width={width}
          height={height}
          timestamp={this.state.timestamp}
          numberOfCups={this.state.numberOfCups}
          wheelRadius={this.state.wheelRadius}
          wheelRotation={this.state.wheelRotation / 180 * Math.PI}
        />
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10
        }}>
          <input type="range" min="2" max="500" onChange={this._onChangeNumberOfCups}/>
          <input type="range" min="50" max="1000" onChange={this._onChangeWheelRadius} />
          <input type="range" min="0" max="360" onChange={this._onChangeWheelRotation} />
        </div>
      </div>
    );
  }
}

export default App;
