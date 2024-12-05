import React from 'react';
import './MonitoringInfoPanel.css';
import routeIcon from './imgs/route.png';
import timeIcon from './imgs/time.png';


class MonitoringInfoPanel extends React.Component {
  constructor(props){
    super(props);
    this.timeFormat = this.timeFormat.bind(this);
    this.distanceFormat = this.distanceFormat.bind(this);
  }
  render() {
    return (
      <div className="container--weather d-flex">
        <div className="container--inner--weather">
  
          <div className="d-flex column--weather">
            <p className="text--weather"></p>
            <p className="text--weather">Текущий азимут 0 °</p>
          </div>
        </div>
      </div>
    );
  }
}

export default MonitoringInfoPanel
