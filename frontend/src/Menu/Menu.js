import React from 'react';
import './Menu.css';
import MenuButton from './MenuButton/MenuButton';

class Menu extends React.Component  {
  constructor(props){
    super(props);
    this.handlerButtonClick = this.handlerButtonClick.bind(this);
    this.hints = [
      "Тут можно построить маршрут БПЛА путем постановки различного рода точек полетных элементов",
      "Тут можно отслеживать выполнения полетного задания и отправлять команды на БПЛА",
      "Тут можно управлять файлами-записями полетных заданий",
      "Тут можно просмотреть записи свершившихся полетов БПЛА",
      "Тут можно разметить датасеты",
      "Тут можно настроить приложение",
      "Тут можно получить информацию о последнем обновлении, видеоинструкции к приложению",
      "Тут можно создать маршрут распыления"
    ]
    this.is_menu_opened = false
    this.page_names = [
      {id:0,name:"Создание полетных заданий"},
      {id:1,name:"Мониторинг"},
      {id:2,name:"Управление полетными заданиями"},
      {id:3,name:"Просмотр логов"},
      {id:4,name:"Разметка изображений"},
      {id:5,name:"Настройки"},
      {id:6,name:"О программе"},
      {id:7,name:"Распыление"}
    ]
  }
  handlerButtonClick(e){
    e.preventDefault()
    if(this.props.app.is_menu_opened){
      //this.props.toggle_menu(false)
    }
    else{
      //this.props.toggle_menu(true)
    }
  }
  render(){
    return (
      <div className="menu--main__container">
        <div className="">
          <a onClick={this.handlerButtonClick} className={this.is_menu_opened === true ? "menu__button active" : "menu__button"} href="">
              <span className="line line--first"></span>
              <span className="line line--second"></span>
              <span className="line line--third"></span>
          </a>
        </div>
        <div className={this.is_menu_opened === true ? "menu active" : "menu"}>
          <nav className="nav--main">
              <ul className="nav--main__list">
                {
                  this.page_names.map((item)=>{
                  return <li className="nav--main__item" key={item.id}>
                    <MenuButton
                      id={item.id}
                      name={item.name}
                      hint={this.hints[item.id]}
                    />
                  </li>
                  })
                }
              </ul>
          </nav>
        </div>
      </div>
    );
  }
}

export default Menu

