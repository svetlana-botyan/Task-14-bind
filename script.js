let data = [];
let isEdit = false;
let currentEditedToDo = {};
const formElement = document.querySelector("#form");
const listParentElement = document.querySelector("#listParent");
const selectPriorityElement = formElement.querySelector("#priority");
//const buttonNewListElement = formElement.querySelector('#addCategory')

const listElements = {
  commonGroup: document.querySelector("#commonGroup"),
  workGroup: document.querySelector("#workGroup"),
  personalGroup: document.querySelector("#personalGroup"),
  educationGroup: document.querySelector("#educationGroup"),
};

function handleSubmit(event) {
  event.preventDefault();

  const toDo = {
    id: new Date().getTime(),
    isChecked: false,
    index: selectPriorityElement.options.selectedIndex,
  };

  const fromData = new FormData(formElement);
  for (let [name, value] of fromData.entries()) {
    toDo[name] = value;
  }

  data.push(toDo);
  formElement.reset();

  render();
}

function handleChange(event) {
  const { target } = event;
  const { id, checked, type } = target;
  //console.log(target )

  if (type !== "checkbox") return;

  data.forEach((item) => {
    if (item.id == id) {
      item.isChecked = checked;
      //console.log(item)
    }
  });

  render();
}

// сохрание перед перезагрузкой
function handleBeforeUnload() {
  const json = JSON.stringify(data);
  //console.log(json)
  localStorage.setItem("information", json);
}

// забираем данные из localStorage
function handleDOMReady() {
  const informationFromStorage = localStorage.getItem("information");

  if (informationFromStorage) {
    data = JSON.parse(informationFromStorage);

    render();
  }
}

//удаление задачи
function handleClickButtonRemove(event) {
  const { role, id } = event.target.dataset;

  if (role == "remove") {
    data = data.filter((item) => {
      if (item.id == id) {
        return false;
      } else {
        return true;
      }
    });

    render();
  }
}

// отмена редактирования
function handleClickButtonCancilEdit(event) {
  const { role } = event.target.dataset;
  // console.log(role)

  if (role == "cancel") {
    render();
    isEdit = false;
  }
}

// редактирование

function handleClickButtonEdit(event) {
  const { target } = event;
  const { role, id } = target.dataset;

  if (role == "edit") {
    // запрет на одновременное редактирование
    if (isEdit == true) {
      return;
    }

    data.forEach((item) => {
      if (item.id == id) {
        const { parentElement } = target;
        currentEditedToDo = item; //значения исходные задачи
        console.log(item);
        const blockEditElement = blockEditTemplate(item); // item объект каждой toDo

        parentElement.outerHTML = blockEditElement;
        isEdit = true;
      }
    });
  }
}

function handleFormEditSubmit(event) {
  event.preventDefault();

  const { target } = event;
  console.log(target);
  const { role, id } = target.dataset;

  if (role == "editForm") {
    const textContent = target.querySelector('[name="textContent"]').value;
    const group = target.querySelector('[name="group"]').value;
    const selectPriorityElement = target.querySelector(
      '[name="priorityContent"]'
    );

    console.log(selectPriorityElement);
    const index = selectPriorityElement.options.selectedIndex;

    console.log(index);
    currentEditedToDo.textContent = textContent;
    currentEditedToDo.group = group;
    currentEditedToDo.index = index;

    console.log(currentEditedToDo);

    render();
    isEdit = false;
  }
}

//добавление нового списка
// function handleClickButtonNewList(event) {
//   event.preventDefault()
//   let nameNewList = prompt(' Введите название нового списка')
// }

function createToDoTemplate({ id, textContent, isChecked, index }) {
  const checkedAttr = isChecked ? "checked" : ""; // если уже чекнули то он останется
  const icon =
    index == 1
      ? `<svg class="pe-none hourglassSplit" width="16" height="16"> <use style="color:red" href="#hourglassSplit" /></svg>`
      : `<svg class="pe-none hourglass" width="16" height="16"> <use style="color:green" href="#hourglass" /></svg>`;

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
      </div>`;

  return template;
}

function blockEditTemplate({ textContent }) {
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
`;

  return templateEdit;
}

function render() {
  clearLists();
  data.forEach((toDo) => {
    const { group } = toDo;
    const listElement = listElements[group];

    const result = createToDoTemplate(toDo);
    listElement.innerHTML += result;
  });
}

// ф-ция очищает в свойстве group innerHTML у всех div-ов объектa listElements
function clearLists() {
  for (let group in listElements) {
    listElements[group].innerHTML = "";
  }
  // console.log(listElements)
}

formElement.addEventListener("submit", handleSubmit);
//buttonNewListElement.addEventListener('click', handleClickButtonNewList)

listParentElement.addEventListener("change", handleChange);
listParentElement.addEventListener("click", handleClickButtonRemove);
listParentElement.addEventListener("click", handleClickButtonEdit);
listParentElement.addEventListener("click", handleClickButtonCancilEdit);
listParentElement.addEventListener("submit", handleFormEditSubmit);

window.addEventListener("beforeunload", handleBeforeUnload); // сохранение перед перезагр.
window.addEventListener("DOMContentLoaded", handleDOMReady); // восстановл. после перезагр.

// console.log(formData)
