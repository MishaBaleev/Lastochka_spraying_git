import React from 'react';
import './Header.css';
import mainLogo from "./imgs/logo.png"
import Menu from '../../Menu/Menu';
import RouteInfoPanel from './RouteInfoPanel/RouteInfoPanel';
import WeatherInfoPanel from './WeatherInfoPanel/WeatherInfoPanel';
import MonitoringInfoPanel from './MonitoringInfoPanel/MonitoringInfoPanel';
import GoToPosition from './GoToPosition/GoToPosition';

let components = {
  0:{
    'component':WeatherInfoPanel,
    parameters:{
      temperature:-10,
      weather:0,
      wind_speed:10,
      wind_direction:0
    }
  },
  1:{
    'component':RouteInfoPanel,
    parameters:{
      time:1000,
      distance:1000,
    }
  },
  2:{
    'component':MonitoringInfoPanel,
    parameters:{
      time:1000,
      distance:1000,
    }
  },
  3:{
    'component': GoToPosition,
    parameters:{
      map: null
    }
  }
}
class Header extends React.Component {
  constructor(props){
    super(props);
    this.componentsWithMap = [
      0, 1, 3
    ]
    this.header_content = {
      0:[0,1,3],
      1:[0,2,3],
      2:[0],
      3:[3,],
      4:[],
      5:[],
      6:[],
      7:[]
    }
  }
  render() {
    if(components[3].parameters.map == null) components[3].parameters.map = this.props.map
    return (
      <div className="header col-md-12">
          <div className="header__panel d-flex">
              <Menu/>
              <img className="mainLogo" src={mainLogo} alt="#"/>
              <section className='header__container--custom'>
                <ul className='header__list--custom'>
                  {this.header_content[7].map(index=>{
                    let Cmp = components[index].component;
                    return <li key={index} className='header__item--custom'>
                              <Cmp params={components[index].parameters}/>
                           </li>
                  })}
                </ul>
              </section>
              <button className="header--quitButton" onClick={() => {}}>
                <div className="header--quitButton--line first"></div>
                <div className="header--quitButton--line second"></div>
              </button>
          </div>
      </div>
    );
  }
}

export default Header
