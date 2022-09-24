"use strict";
window.addEventListener("load", start);

//empty array to store our student data from fetch
let allStudents = [];

//cleaned version student array that I end up displaying
let allCleanStudents = [];
//array for filtered students
let filteredStudents = [];
//filter + sort properties stored in an object
let settings = {
  filterBy: "All",
  sortBy: "all",
  sortDir: "",
  searchQuery: "",
};
//variables for filter & sort
const houseFilter = document.getElementById("filter-type");
const sortItems = document.querySelectorAll("[data-action=sort]");
const searchInput = document.getElementById("search-field");

//down here is the object prototype that I create the student obj. from
const Student = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  image: "",
  house: "",
  prefect: "",
};

function start() {
  console.log("here we go, cleaning up!");
  //eventListeners for sort, filter (searchfilter also)
  houseFilter.addEventListener("change", checkFilter);
  searchInput.addEventListener("keyup", checkSearchInput);
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
  student.gender = jsonObj.gender;

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
    case "Expelled":
      filteredStudents = allCleanStudents.filter(isExpelled);
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
  if (student.expelled) {
    return false;
  }
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
function checkSearchInput() {
  settings.searchQuery = searchInput.value;
  buildList();
}

function studentSearchFilter(students) {
  return students.filter(function (student) {
    return (
      student.firstName
        .toLowerCase()
        .includes(settings.searchQuery.toLowerCase()) ||
      student.lastName
        .toLowerCase()
        .includes(settings.searchQuery.toLowerCase())
    );
  });
}

function buildList() {
  filteredStudents = filterStudents(allCleanStudents);
  filteredStudents = sortStudents(filteredStudents);
  filteredStudents = studentSearchFilter(filteredStudents);
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
    expelled: false,
    prefect: false,
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
  //expell student toggle
  if (student.expelled == true) {
    clone.querySelector("[data-field=expelled]").textContent = "✔️";
  } else {
    clone.querySelector("[data-field=expelled]").textContent = "Expell";
  }
  //adding click event to expelled field
  clone
    .querySelector("[data-field=expelled]")
    .addEventListener("click", function () {
      expellStudent(student);
    });
  //prefect display
  clone.querySelector("[data-field=prefect]").dataset.prefect = student.prefect;
  clone
    .querySelector("[data-field=prefect]")
    .addEventListener("click", function () {
      clickPrefect(student);
    });
  //changing content in prefect field
  if (student.prefect == true) {
    clone.querySelector("[data-field=prefect]").textContent = "🥇";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "Prefect";
  }
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
//expelling
function expellStudent(student) {
  if (student.expelled === true) {
    return;
  } else {
    tryToExpell(student);
    buildList();
  }
}
function isExpelled(student) {
  if (student.expelled === true) {
    return true;
  } else {
    return false;
  }
}
function tryToExpell(selectedStudent) {
  document.querySelector("#expell-dialog").classList.remove("hide");
  /* document.querySelector("#expell-dialog").classList.add("hide"); */

  document
    .querySelector("#expellstudent")
    .addEventListener("click", clickExpellStudent);
  document
    .querySelector("#expell-dialog .closebutton")
    .addEventListener("click", closeExpell);

  function clickExpellStudent() {
    selectedStudent.expelled = true;
    const attendingStudents = allCleanStudents.filter(
      (student) => student.expelled === false
    );
    closeExpell();
    displayList(attendingStudents);
  }
  function closeExpell() {
    document.querySelector("#expell-dialog .generic").classList.add("hide");
    document.querySelector("#expell-dialog .closebutton").classList.add("hide");
  }
}
//prefects
function clickPrefect(student) {
  if (student.prefect === true) {
    student.prefect = false;
  } else {
    tryToMakePrefect(student);
  }
  buildList();
}
function tryToMakePrefect(selectedStudent) {
  const prefects = allCleanStudents.filter((student) => student.prefect);
  const other = prefects.filter(
    (student) => student.house === selectedStudent.house
  );
  const totalPrefects = other.length;
  console.log(`there is ${totalPrefects} prefects`);
  //the 'rules' - if there is another of the same "type"
  if (totalPrefects >= 2) {
    console.log("there can only be one gender from each house!");
    removeAorB(other[0], other[1]);
  } else {
    makePrefect(selectedStudent);
  }

  /*  function removeOther(otherPrefect) {
    //dialog box - prefects
    document.querySelector("#remove-other").classList.remove("hide");
    document.querySelector(
      "#remove-other .remove"
    ).innerHTML = `remove ${otherPrefect.firstName}`;
    document
      .querySelector("#remove-other .closebutton")
      .addEventListener("click", closePrefectDialog);
    document
      .querySelector("#remove-other .remove")
      .addEventListener("click", clickRemoveOther); */

  //if not removing other
  /*    function closePrefectDialog() {
      document.querySelector("#remove-other").classList.add("hide");
      document
        .querySelector("#remove-other .remove")
        .addEventListener("click", closePrefectDialog);
    }
    //if user wants to remove the other prefect
    function clickRemoveOther() {
      removePrefect(otherPrefect);
      makePrefect(selectedStudent);
      buildList();
      closePrefectDialog();
    }
  } */
  function removePrefect(prefectStudent) {
    prefectStudent.prefect = false;
  }
  function removeAorB(prefectA, prefectB) {
    //ignore, or remove A or B
    document.querySelector("#remove-aorb").classList.remove("hide");
    document
      .querySelector("#remove-aorb .closebutton")
      .addEventListener("click", closeABDialog);

    document
      .querySelector("#remove-aorb #removea")
      .addEventListener("click", clickRemoveA);
    document
      .querySelector("#remove-aorb #removeb")
      .addEventListener("click", clickRemoveB);

    //show names on buttons
    document.querySelector("#removea [data-field=prefectA]").textContent =
      prefectA.firstName;
    document.querySelector("#removeb [data-field=prefectB]").textContent =
      prefectB.firstName;

    //if user ignore, do nothing
    function closeABDialog() {
      document.querySelector("#remove-aorb").classList.add("hide");
      document
        .querySelector("#remove-aorb .closebutton")
        .removeEventListener("click", closeABDialog);
      document
        .querySelector("#remove-aorb #removea")
        .removeEventListener("click", clickRemoveA);
      document
        .querySelector("#remove-aorb #removeb")
        .removeEventListener("click", clickRemoveB);
    }

    function clickRemoveA() {
      //if removeA then
      removePrefect(prefectA);
      makePrefect(selectedStudent);
      buildList();
      closeABDialog();
    }

    function clickRemoveB() {
      removePrefect(prefectB);
      makePrefect(selectedStudent);
      buildList();
      closeABDialog();
    }
  }
  function makePrefect(student) {
    console.log("Adding new student as prefect");
    student.prefect = true;
  }
}
