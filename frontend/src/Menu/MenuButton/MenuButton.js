import React from 'react';
import './MenuButton.css';
import Modal from '../../Modal/Modal';

class MenuButton extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
      clicked:false
    }
  }
  
  render(){
    return (
      <div className='menu--button' data-hint={this.props.hint}>
        
      </div>
    );
  }
}

export default MenuButton

