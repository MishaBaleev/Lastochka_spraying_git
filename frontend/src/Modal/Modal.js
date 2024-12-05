import React from 'react';
import "./Modal.css"
import CancelIcon from "./cancel.png"
import { connect } from 'react-redux';

class Modal extends React.Component  {
  constructor(props){
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this);
  }
  render(){
    return (
      <section className={"modal__window"}>
        
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal)

