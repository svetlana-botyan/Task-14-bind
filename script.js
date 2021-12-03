let data = []
const formElement = document.querySelector('#form')
const listParentElement = document.querySelector('#listParent')
const selectPriorityElement = formElement.querySelector('#priority')
const buttonNewListElement = formElement.querySelector('#addCategory')

const listElements = {
  commonGroup: document.querySelector('#commonGroup'),
  workGroup: document.querySelector('#workGroup'),
  personalGroup: document.querySelector('#personalGroup'),
  educationGroup: document.querySelector('#educationGroup'),
}

class ToDoFormCreate {
  constructor(formElement) {
    this.formElement = formElement
    this.#init()
  }

  #init() {
    this.handleSubmit = this.#handleSubmit.bind(this)

    this.formElement.addEventListener('submit', this.handleSubmit)
  }

  #handleSubmit(event) {
    event.preventDefault()

    const toDo = {
      id: new Date().getTime(),
      isChecked: false,
      index: selectPriorityElement.options.selectedIndex,
    }

    const fromData = new FormData(this.formElement)
    for (let [name, value] of fromData.entries()) {
      toDo[name] = value
    }

    data.push(toDo)
    formElement.reset()

    const eventRenderNeed = new Event('render:need')
    window.dispatchEvent(eventRenderNeed)
  }
}

//---------------------------------------------------------

class TodoLists {
  constructor(listParentElement) {
    this.listParentElement = listParentElement
    this.#init()
  }

  #init() {
    this.handleChange = this.#handleChange.bind(this)
    this.handleEventNeed = this.#handleEventNeed.bind(this)
    this.handleBeforeUnload = this.#handleBeforeUnload.bind(this)
    this.handleDOMReady = this.#handleDOMReady.bind(this)

    this.listParentElement.addEventListener('change', this.handleChange)
    window.addEventListener('render:need', this.handleEventNeed)
    window.addEventListener('beforeunload', this.handleBeforeUnload)
    window.addEventListener('DOMContentLoaded', this.handleDOMReady)
  }

  #handleChange(event) {
    const { target } = event
    const { id, checked, type } = target

    if (type !== 'checkbox') return

    data.forEach((item) => {
      if (item.id == id) {
        item.isChecked = checked
      }
    })

    this.render()
  }

  #handleEventNeed() {
    this.render()
  }

  createToDoTemplate({ id, textContent, isChecked, index }) {
    const checkedAttr = isChecked ? 'checked' : '' // если уже чекнули то он останется
    const icon =
      index == 1
        ? `<svg class="pe-none hourglassSplit" width="16" height="16"> <use style="color:red" href="#hourglassSplit" /></svg>`
        : `<svg class="pe-none hourglass" width="16" height="16"> <use style="color:green" href="#hourglass" /></svg>`

    const template = `
        <div class="new-task col-12 align-items-start d-flex ${checkedAttr} " >    
          <div class="form-check" >
            <input class="form-check-input" ${checkedAttr} type="checkbox" value="" id="${id}">
            ${icon}
            <label class="form-check-label " for="${id}">
            ${textContent}
            </label>
          </div> 
          <button class="btn btn-outline-success" data-role="edit" data-id="${id}" ><svg class="pe-none " width="16" height="16">
          <use href="#pencil" /></svg></button>
  
          <button  class="btn  btn-outline-danger" data-role="remove" data-id="${id}" ><svg class="pe-none " width="16" height="16">
          <use href="#trash" /></svg></button>
        </div>`

    return template
  }

  render() {
    this.clearLists()

    data.forEach((toDo) => {
      const { group } = toDo
      const listElement = listElements[group]

      const result = this.createToDoTemplate(toDo)
      listElement.innerHTML += result
    })
  }

  // ф-ция очищает в свойстве group innerHTML у всех div-ов объектa listElements
  clearLists() {
    for (let group in listElements) {
      listElements[group].innerHTML = ''
    }
  }

  // сохрание перед перезагрузкой
  #handleBeforeUnload() {
    const json = JSON.stringify(data)
    //console.log(json)
    localStorage.setItem('information', json)
  }

  // забираем данные из localStorage
  #handleDOMReady() {
    const informationFromStorage = localStorage.getItem('information')

    if (informationFromStorage) {
      data = JSON.parse(informationFromStorage)

      this.render()
    }
  }
}

// --------------------------------------------------------------

class EditTodoElement {
  isEdit = false
  currentEditedToDo = {}
  eventRenderNeed = new Event('render:need')

  constructor(listParentElement) {
    this.listParentElement = listParentElement
    this.#init()
  }

  #init() {
    this.handleClickButtonRemove = this.#handleClickButtonRemove.bind(this)
    this.handleClickButtonEdit = this.#handleClickButtonEdit.bind(this)
    this.handleClickButtonCancilEdit =
      this.#handleClickButtonCancilEdit.bind(this)
    this.handleFormEditSubmit = this.#handleFormEditSubmit.bind(this)

    this.listParentElement.addEventListener(
      'click',
      this.handleClickButtonRemove
    )
    this.listParentElement.addEventListener('click', this.handleClickButtonEdit)
    this.listParentElement.addEventListener(
      'click',
      this.handleClickButtonCancilEdit
    )
    this.listParentElement.addEventListener('submit', this.handleFormEditSubmit)
  }

  //удаление задачи
  #handleClickButtonRemove(event) {
    const { role, id } = event.target.dataset

    if (role == 'remove') {
      data = data.filter((item) => {
        if (item.id == id) {
          return false
        } else {
          return true
        }
      })

      window.dispatchEvent(this.eventRenderNeed)
    }
  }

  #handleClickButtonEdit(event) {
    const { target } = event
    const { role, id } = target.dataset

    if (role == 'edit') {
      // запрет на одновременное редактирование
      if (this.isEdit == true) {
        return
      }

      data.forEach((item) => {
        if (item.id == id) {
          const { parentElement } = target
          this.currentEditedToDo = item //значения исходные задачи
          console.log(item)
          const blockEditElement = this.blockEditTemplate(item) // item объект каждой toDo

          parentElement.outerHTML = blockEditElement
          this.isEdit = true
        }
      })
    }
  }

  blockEditTemplate({ textContent }) {
    const templateEdit = ` 
      <form data-role="editForm" id="formEdit" class="d-flex col-12">
    <input  value="${textContent}" name="textContent" class="form-control   " placeholder="Отредакрируйте задачу" type="text" required>
       <select name="priorityContent" class="form-select">
        <option disabled selected value="">Приоретет</option>
        <option value="urgent">срочно</option>
        <option value="non-urgent">несрочно</option>
      </select>
      <select   name="group" class=" form-select select-content" >
        <option disabled selected value="">Изменить список</option>
        <option value="commonGroup">Общее</option>
        <option value="workGroup">Работа</option>
        <option value="personalGroup">Личное</option>
        <option value="educationGroup">Обучение</option>
      </select>
      <button data-role="cancel" class="btn btn-outline-success" type="button"><svg class="pe-none" width="20" height="20">
          <use href="#Xcircle" />
        </svg></button>
      <button class="btn  btn-outline-primary" type="submit"><svg class="pe-none " width="20" height="20">
          <use href="#check" />
        </svg></button>
  </form>
  `

    return templateEdit
  }

  #handleClickButtonCancilEdit(event) {
    const { role } = event.target.dataset
    // console.log(role)

    if (role == 'cancel') {
      window.dispatchEvent(this.eventRenderNeed)
      this.isEdit = false
    }
  }

  #handleFormEditSubmit(event) {
    event.preventDefault()

    const { target } = event
    console.log(target)
    const { role, id } = target.dataset

    if (role == 'editForm') {
      const textContent = target.querySelector('[name="textContent"]').value
      const group = target.querySelector('[name="group"]').value
      const selectPriorityElement = target.querySelector(
        '[name="priorityContent"]'
      )

      //console.log(selectPriorityElement)
      const index = selectPriorityElement.options.selectedIndex

      this.currentEditedToDo.textContent = textContent
      this.currentEditedToDo.group = group
      this.currentEditedToDo.index = index

      window.dispatchEvent(this.eventRenderNeed)
      this.isEdit = false
    }
  }
}

class AddNewGroup {
  listlistsGroup = document.querySelector('#listsGroup')

  constructor(buttonNewListElement) {
    this.buttonNewListElement = buttonNewListElement
    this.handleClickButtonNewList = this.#handleClickButtonNewList.bind(this)
    this.buttonNewListElement.addEventListener(
      'click',
      this.handleClickButtonNewList
    )
  }

  #handleClickButtonNewList() {
    const newNameList = prompt('введите новую категорию')

    this.renderForm()
  }

  renderForm(){

    
  }

  templateForm(){
    return `
    <option value="educationGroup">${this.newNameList}</option>`
  }

}

new ToDoFormCreate(formElement)
new TodoLists(listParentElement)
new EditTodoElement(listParentElement)
new AddNewGroup(buttonNewListElement)
