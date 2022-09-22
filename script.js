"use strict";
window.addEventListener("load", start);

//empty array to store our student data from fetch
let allStudents = [];

//cleaned version student array that I end up displaying
let allCleanStudents = [];
//array for filtered students
let filteredStudents = [];
//other variables stored in an object
let settings = {
  filterBy: "All",
  sortBy: "all",
  sortDir: "",
};

const houseFilter = document.getElementById("filter-type");
const sortItems = document.querySelectorAll("[data-action=sort]");

//down here is the object prototype that I create the student obj. from
const Student = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  image: "",
  house: "",
};

function start() {
  console.log("here we go, cleaning up!");
  //eventListeners for filter & sort
  houseFilter.addEventListener("change", checkFilter);
  sortItems.forEach((sortItem) => {
    sortItem.addEventListener("click", checkSort);
  });
  fetchJSON();
}
//fetching the json-data
async function fetchJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((response) => response.json())
    .then((jsonData) => {
      //with the arrow function we say that when the data is loaded, go to prepareObjects
      prepareObjects(jsonData);
      /*   console.log(jsonData); */
    });
}

function prepareObjects(jsonData) {
  /* console.log(allCleanStudents); */
  allStudents = jsonData.map(prepareObject); //with map() we take each elm. from jsonData, and add the results to allStudents array, in the same order
  //call cleaned data to then call forEach
  cleanStudentData(allStudents); //the array we're cleaning
  displayList(allCleanStudents); //the array we push the clean data into and end up displaying
}

function prepareObject(jsonObj) {
  const student = Object.create(Student);

  student.fullname = jsonObj.fullname;
  student.house = jsonObj.house;

  return student;
}
//checking which option is chosen, and setting that value
function checkFilter(event) {
  const filter = houseFilter[houseFilter.selectedIndex].value;
  console.log("filter: ", filter);
  setFilter(filter);
}
//storing the chosen filter in the filterBy
function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}
//filter by house cases
function filterStudents(filteredStudents) {
  switch (settings.filterBy) {
    case "All":
      filteredStudents = allCleanStudents.filter(isAll);
      break;
    case "Gryffindor":
    case "Ravenclaw":
    case "Hufflepuff":
    case "Slytherin":
      filteredStudents = allCleanStudents.filter(function (student) {
        return checkHouse(student, settings.filterBy);
      });
      break;
  }
  return filteredStudents;
}

function checkHouse(student, house) {
  if (student.house === house) {
    return true;
  } else {
    return false;
  }
}

function isAll(student) {
  return true;
}
function checkSort(event) {
  console.log("going to check sort!");
  const sortBy = event.target.dataset.sort;
  let sortDir = event.target.dataset.sortDirection;

  //toggle so u can sort ascending & descending
  if (settings.sortDir === "asc") {
    sortDir = "desc";
  } else {
    sortDir = "asc";
  }
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortStudents(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortBySort);

  function sortBySort(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

function buildList() {
  filteredStudents = filterStudents(allCleanStudents);
  filteredStudents = sortStudents(filteredStudents);
  displayList(filteredStudents);
}
/* STORING THE CLEAN DATA & PUSHING TO GLOBAL STUDENT ARRAY */
function cleanStudentData(students) {
  console.log(students);

  students.forEach((student) => {
    const cleanStudentObject = getCleanData(student);
    allCleanStudents.push(cleanStudentObject);
  });
  console.table(allCleanStudents);
}
//storing the clean data in variables
function getCleanData(student) {
  const nameObj = splitFullName(student.fullname); //nameobj is where we want to store our splitted names
  const cleanHouse = cleanTheData(student.house);
  const studentImg = `${nameObj.lastName.toLowerCase()}_${nameObj.firstName
    .charAt(0)
    .toLowerCase()}.png`;

  //return - storing the data in the properties we want to display
  return {
    firstName: nameObj.firstName,
    lastName: nameObj.lastName,
    middleName: nameObj.middleName,
    nickName: nameObj.nickName,
    house: cleanHouse,
    studentImg: studentImg,
  };
}

//splitting the names into first, last, middle, etc.
function splitFullName(fullname) {
  //storing all the names in a obj. and putting default values to those without middle/nicknames
  const nameObj = {
    nickName: "🚫",
    middleName: "🚫",
  };
  //storing the json fullname, in a names const, and then trim for spaces, and split w. space
  const names = fullname.trim().split(" ");

  names.forEach((name, index) => {
    if (index === 0) {
      nameObj.firstName = cleanTheData(name);
    }
    if (index !== 0 && index !== names.length - 1) {
      if (name[0] == '"' && name[name.length - 1] == '"') {
        nameObj.nickName = cleanTheData(name);
      } else {
        nameObj.middleName = cleanTheData(name);
      }
    }

    if (index === names.length - 1) {
      nameObj.lastName = cleanTheData(name);
    }
  });
  return nameObj;
}
//cleaning, removing spaces, "", solving "-", etc.
function cleanTheData(data) {
  let replaceSymbols = data.replaceAll('"', "");
  const cleanHyphen = replaceSymbols.indexOf("-");

  if (cleanHyphen > -1) {
    //split into two names
    const namesWithHyphen = replaceSymbols.split("-");

    //combine names + add uppercase to the first letter in the hyphen name
    replaceSymbols = `${namesWithHyphen[0]}-${namesWithHyphen[1]
      .charAt(0)
      .toUpperCase()}${namesWithHyphen[1].slice(1)}`;
    return replaceSymbols;
  }
  replaceSymbols = replaceSymbols.trim();
  return `${replaceSymbols.charAt(0).toUpperCase()}${replaceSymbols
    .slice(1)
    .toLowerCase()}`;
}
//"helper function", cleaning container + calling displayStudent
function displayList(students) {
  //make sure the list is cleared
  document.querySelector("#list tbody").innerHTML = "";

  //build a new list w. the clean data
  students.forEach(displayStudent);
}
//displaying the students
function displayStudent(student) {
  //create clone
  const clone = document
    .querySelector("template#student")
    .content.cloneNode(true);

  //set clone data
  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=middleName]").textContent =
    student.middleName;
  clone.querySelector("[data-field=nickName]").textContent = student.nickName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  //make the student clickable and send to popup-details
  clone
    .querySelector("[data-field=firstName]")
    .addEventListener("click", function () {
      studentDetails(student);
    });
  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
//student pop-up
function studentDetails(specificStudent) {
  //remove the hide class
  document.getElementById("student-details").classList.remove("hide");

  //student image
  document.querySelector(
    ".student-pic"
  ).src = `images/${specificStudent.studentImg}`;
}
