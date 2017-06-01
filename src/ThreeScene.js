import React, { Component } from 'react';
import * as THREE from 'three';
import CupModel from './CupModel.json';
import CupWater from './CupWater.json';
import Wheel from './Wheel.json';

function createTextureCube() {
  const r = "textures/cube/Bridge2/";
  const urls = [
    r + "posx.jpg", r + "negx.jpg",
    r + "posy.jpg", r + "negy.jpg",
    r + "posz.jpg", r + "negz.jpg"
  ];
  const textureCube = new THREE.CubeTextureLoader().load(urls);
  textureCube.format = THREE.RGBFormat;
  textureCube.mapping = THREE.CubeReflectionMapping;
  return textureCube;
}

const textureCube = createTextureCube();

const translucentCupMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  depthTest: false,
  morphTargets: true,
  opacity: 0.1,
  vertexColors: THREE.FaceColors,
  transparent: true
});

const opaqueCupMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.01,
  metalness: 0.2,
  emissive: 0x101010,
  envMap: textureCube
});

const waterMaterial = new THREE.MeshLambertMaterial({envMap: textureCube, color: 0xa0a0ff });

const wheelRimMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.01,
  metalness: 0.2,
  emissive: 0x101010,
  envMap: textureCube
});

const { geometry: cupGeometry } = THREE.JSONLoader.prototype.parse(CupModel);
cupGeometry.computeVertexNormals();
cupGeometry.computeMorphNormals();

const { geometry: waterGeometry } = THREE.JSONLoader.prototype.parse(CupWater);
waterGeometry.computeVertexNormals();
waterGeometry.computeMorphNormals();

const { geometry: wheelRimGeometry } = THREE.JSONLoader.prototype.parse(Wheel);
wheelRimGeometry.computeVertexNormals();
wheelRimGeometry.computeMorphNormals();

function newCup(size, translucent) {
  let material = null;
  if (translucent) {
    material = translucentCupMaterial;
  } else {
    material = opaqueCupMaterial;
  }
  const mesh = new THREE.Mesh(cupGeometry, material);
  mesh.scale.x = size;
  mesh.scale.y = size;
  mesh.scale.z = size;
  return {mesh, geometry: cupGeometry};
}

function newWater(size) {
  const material = waterMaterial;
  const mesh = new THREE.Mesh(waterGeometry, material);
  mesh.position.y = 4;
  mesh.scale.x = size;
  mesh.scale.y = size * Math.random();
  mesh.scale.z = size;
  return {mesh, geometry: waterGeometry};
}

function newWheelOutline(scale) {
  const material = wheelRimMaterial;
  const mesh = new THREE.Mesh( wheelRimGeometry, material );
  mesh.scale.x = scale;
  mesh.scale.y = scale;
  mesh.scale.z = scale;
  return {mesh, geometry: wheelRimGeometry};
}

function newCups(numberOfCups, cupSize, radius) {
  const cups = new THREE.Group();
  const total = numberOfCups;
  const offset = 0;
  const waters = [];
  for (let i = 0; i < total; i++) {
    const cupAndWater = new THREE.Group();
    const x = (radius + offset) * Math.sin(i / total * Math.PI * 2);
    const z = (radius + offset) * Math.cos(i / total * Math.PI * 2);
    cupAndWater.position.set(x, 10, z);
    const {mesh: cupMesh, geometry: cupGeometry} = newCup(cupSize, true);
    cupAndWater.add(cupMesh);
    const {mesh: waterMesh, geometry: waterGeometry} = newWater(cupSize);
    waters.push(waterMesh);
    cupAndWater.add(waterMesh);
    cupAndWater.scale.y = 3;
    cups.add(cupAndWater);
  }
  const {mesh: wheelMesh, geometry: wheelGeometry}  = newWheelOutline(radius);
  cups.add(wheelMesh);
  return { cups, waters};
}
function radiusFromNumberOfCups(numberOfCups, radius) {
  const x1 = radius * Math.sin(0 / numberOfCups * Math.PI * 2);
  const y1 = radius * Math.cos(0 / numberOfCups * Math.PI * 2);
  const x2 = radius * Math.sin(1 / numberOfCups * Math.PI * 2);
  const y2 = radius * Math.cos(1 / numberOfCups * Math.PI * 2);
  return Math.sqrt( (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) ) / 2;
}

function wheelBase(radius, height) {
  const geometry = new THREE.CylinderGeometry( radius, radius, height, 32 );
  const material = wheelRimMaterial;
  const cylinder = new THREE.Mesh( geometry, material );
  cylinder.position.y = - height / 2;
  return cylinder;
}

function buildScene(wheelRadius, numberOfCups) {
  const scene = new THREE.Scene();
  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(-10000, 100, 20000);
  scene.add(light);
  const hemispherLight = new THREE.HemisphereLight(0x090909, 0xa0a0a0);
  scene.add(hemispherLight);
  const {waters, waterWheel, cups} = setupWaterWheel(wheelRadius, numberOfCups);
  scene.add(waterWheel);
  scene.add(wheelBase(15, 240));
  return {scene, waters, waterWheel, cups};
}

function setupCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
  camera.rotation.x = -0.2;
  camera.position.x = -0.7;
  camera.position.y = 300;
  camera.position.z = 1000;
  return camera;
}

function setupWaterWheel(wheelRadius, numberOfCups) {
  const { cups, waters } = newCups(numberOfCups, radiusFromNumberOfCups(numberOfCups, wheelRadius), wheelRadius);
  const waterWheel = new THREE.Group();
  waterWheel.add(cups);
  waterWheel.rotation.z = Math.PI / 32;
  return {waterWheel, waters, cups};
}

class ThreeScene extends Component {
  componentDidMount() {
    const { width, height, wheelRadius, numberOfCups } = this.props;
    this._camera = setupCamera(width, height);
    const { water, scene, cups } = buildScene(wheelRadius, numberOfCups);
    this._scene = scene;
    this._water = water;
    this._cups = cups;
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setPixelRatio(window.devicePixelRatio || 1);
    this._renderer.setClearColor(0xffffff, 1);
    this._container.appendChild(this._renderer.domElement);
    this._render();
  }
  componentWillUpdate(nextProps, nextState) {
    if (
      nextProps.wheelRadius !== this.props.wheelRadius ||
      nextProps.numberOfCups !== this.props.numberOfCups
    ) {
      const { water, scene, cups } = buildScene(nextProps.wheelRadius, nextProps.numberOfCups);
      this._scene = scene;
      this._water = water;
      this._cups = cups;
    }
  }
  componentDidUpdate() {
    this._render();
  }
  _render() {
    const { width, height, wheelRotation } = this.props;
    this._camera.fov = 75;
    this._camera.aspect = width / height;
    this._camera.near = 1;
    this._camera.far = 10000;
    this._cups.rotation.y = wheelRotation;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize( width, height );
    this._renderer.render( this._scene, this._camera );
  }
  render() {
    const { width, height } = this.props;
    return (
      <div ref={container => this._container = container} width={width} height={height} />
    );
  }
}

export default ThreeScene;
