"use strict";
window.addEventListener("DOMContentLoaded", start);

//empty array to store the student data from fetch
let allStudents = [];
let families = {};

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
//variable for hackedStatus
let isHacked = false;
//the object prototype that I create the student obj. from
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

  //click-event on current list info
  document
    .querySelector("#number-info")
    .addEventListener("click", currentListDialog);
  //click-event on hackTheSystem button
  document
    .getElementById("hack-button")
    .addEventListener("click", hackTheSystem);
  fetchJSON();
}
/* GETTING THE JSON DATA */
//fetching studentData and familyData
async function fetchJSON() {
  const allStudents = await fetch(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );
  const studentJSONdata = await allStudents.json();

  const familiesDataResponse = await fetch(
    "https://petlatkea.dk/2021/hogwarts/families.json"
  );
  const familiesJSONdata = await familiesDataResponse.json();

  families = familiesJSONdata;

  prepareObjects(studentJSONdata);
}
/* PREPAREOBJECTS */
function prepareObjects(jsonData) {
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
/* FILTERING */
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
//filter by house cases + expelled
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
//check house, when filtered by
function checkHouse(student, house) {
  if (student.house === house) {
    return true;
  } else {
    return false;
  }
}
//showing all students, except expelled (when filtering by all)
function isAll(student) {
  if (student.expelled) {
    return false;
  }
  return true;
}
/* SORTING */
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
/* SEARCHING */
function checkSearchInput() {
  //takes the input value and send to buildlist w. that info
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
/* STUDENT POP-UP */
function studentDetails(specificStudent) {
  //remove the hide class
  document.getElementById("student-details").classList.remove("hide");
  //set properties to display
  //fullname
  document.querySelector(
    "#fullname"
  ).innerHTML = `${specificStudent.firstName} ${specificStudent.lastName} `;
  //nickname
  document.querySelector("#nickname").innerHTML = `${specificStudent.nickName}`;
  //prefect status personalized
  if (specificStudent.prefect === true) {
    document.querySelector(
      "#prefect"
    ).innerHTML = `${specificStudent.firstName} is prefect!`;
  } else {
    document.querySelector(
      "#prefect"
    ).innerHTML = `${specificStudent.firstName} is not a prefect`;
  }
  //expelled status personalized
  if (specificStudent.expelled === true) {
    document.querySelector(
      "#expelled"
    ).innerHTML = `${specificStudent.firstName} is expelled`;
  } else {
    document.querySelector(
      "#expelled"
    ).innerHTML = `${specificStudent.firstName} is attendnig`;
  }
  //bloodstatus
  document.querySelector(
    "#bloodstatus"
  ).innerHTML = `${specificStudent.bloodStatus}`;
  //squadmember - change content so it dosen't says 'add' in the popUp
  if (specificStudent.squadMember === "Yes????") {
    document.querySelector("#squadmember").innerHTML = `Yes????`;
  } else {
    document.querySelector("#squadmember").innerHTML = `No`;
  }
  //student image
  document.querySelector(
    ".student-pic"
  ).src = `images/${specificStudent.studentImg}`;
  //student crest
  document.querySelector(".crest").src = `crest/${specificStudent.house}.jpg`;
  //student house theme (background-color and shadow-box)
  if (specificStudent.house === "Slytherin") {
    document.querySelector(".housestyling").style.backgroundColor =
      "rgb(14,55,17)";
    document.querySelector(".crest").style.boxShadow =
      "10px 20px 30px 30px green";
  } else if (specificStudent.house === "Gryffindor") {
    document.querySelector(".housestyling").style.backgroundColor =
      "rgb(126,25,25)";
    document.querySelector(".crest").style.boxShadow =
      "10px 20px 30px 30px yellow";
  } else if (specificStudent.house === "Ravenclaw") {
    document.querySelector(".housestyling").style.backgroundColor =
      "rgb(43,105,163)";
    document.querySelector(".crest").style.boxShadow =
      "10px 20px 30px 30px blue";
  } else if (specificStudent.house === "Hufflepuff") {
    document.querySelector(".housestyling").style.backgroundColor =
      "rgb(159,157,19)";
    document.querySelector(".crest").style.boxShadow =
      "10px 20px 30px 30px grey";
  }

  document
    .querySelector("#student-details .closebutton")
    .addEventListener("click", closeStudentDetails);

  function closeStudentDetails() {
    document.querySelector("#student-details").classList.add("hide");
    document
      .querySelector("#student-details .closebutton")
      .removeEventListener("click", closeStudentDetails);
  }
}
//building the list w. right sorting, filtering, search
function buildList() {
  filteredStudents = filterStudents(allCleanStudents);
  filteredStudents = sortStudents(filteredStudents);
  filteredStudents = studentSearchFilter(filteredStudents);
  displayList(filteredStudents);
}
/* CLEANING DATA */
//storing the clean data & pushing to global student array
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
  const bloodStatus = getBloodStatus(nameObj.lastName);
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
    bloodStatus: bloodStatus,
    squadMember: "Add",
    gender: student.gender,
  };
}
//splitting the names into first, last, middle, etc.
function splitFullName(fullname) {
  //storing all the names in a obj. and putting default values to those without middle/nicknames
  const nameObj = {
    nickName: "????",
    middleName: "????",
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
/* DISPLAY STUDENT DATA */
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
  clone.querySelector("[data-field=bloodStatus]").textContent =
    student.bloodStatus;
  clone.querySelector("[data-field=squadMember]").textContent =
    student.squadMember;
  //expell student toggle
  if (student.expelled == true) {
    clone.querySelector("[data-field=expelled]").textContent = "Expelled???";
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
    clone.querySelector("[data-field=prefect]").textContent = "Is prefect????";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "Make prefect";
  }

  //squad clickable and sending to addToSquad function
  clone
    .querySelector("[data-field=squadMember]")
    .addEventListener("click", function () {
      addToSquad(student);
    });
  //make the student clickable and send to popup-details
  clone
    .querySelector("[data-field=firstName]")
    .addEventListener("click", function () {
      studentDetails(student);
    });
  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
/* EXPELLING */
function expellStudent(student) {
  if (student.expelled === true) {
    return;
  } else {
    tryToExpell(student);
    buildList();
  }
}
//check and set expelled status
function isExpelled(student) {
  if (student.expelled === true) {
    return true;
  } else {
    return false;
  }
}
//check if the expell is "ok" to execute (can't expell the hacker-student)
function tryToExpell(selectedStudent) {
  document.querySelector("#expell-dialog").classList.remove("hide");
  /* document.querySelector("#expell-dialog").classList.add("hide"); */
  if (selectedStudent.nickName === "Halfbloodprincess") {
    document.querySelector("#expell-dialog .generic").classList.add("hide");
    document
      .querySelector("#expell-dialog .halfbloodprincess")
      .classList.remove("hide");
    document.querySelector("#expell-dialog").classList.add("ifHackedExpell");
  } else {
    document.querySelector("#expell-dialog .generic").classList.remove("hide");
    document
      .querySelector("#expell-dialog .halfbloodprincess")
      .classList.add("hide");
  }

  document
    .querySelector("#expellstudent")
    .addEventListener("click", clickExpellStudent);
  document
    .querySelector("#expell-dialog .closebutton")
    .addEventListener("click", closeExpell);

  //show names on buttons
  document.querySelector(
    "#expellstudent"
  ).textContent = `Expell ${selectedStudent.firstName}`;

  function clickExpellStudent() {
    selectedStudent.expelled = true;
    const attendingStudents = allCleanStudents.filter(
      (student) => student.expelled === false
    );
    closeExpell();
    displayList(attendingStudents);
  }
  function closeExpell() {
    document.querySelector("#expell-dialog").classList.add("hide");
    document
      .querySelector("#expell-dialog .closebutton")
      .removeEventListener("click", closeExpell);
  }
}
/* PREFECT */
function clickPrefect(student) {
  if (student.expelled === false) {
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakePrefect(student);
    }
  } else {
    alert(
      "You can't turn a expelled student into a prefect, even tho it is a school of magic????"
    );
  }
  buildList();
}
//checking if the prefect rules is followed
function tryToMakePrefect(selectedStudent) {
  const prefects = allCleanStudents.filter((student) => student.prefect);
  const other = prefects.filter(
    (student) => student.house === selectedStudent.house
  );
  const totalPrefects = other.length;
  console.log(`there is ${totalPrefects} prefects`);
  //the 'rules' - if there is another of the same "type"
  if (totalPrefects >= 2) {
    console.log("there can only be two students from each house!");
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
    //if remove B then
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
/* BLOODSTATUS */
//gettin' bloodStatus
function getBloodStatus(lastName) {
  const hyphenIndex = lastName.indexOf("-");
  if (hyphenIndex > -1) {
    //split names
    const hyphenName = lastName.split("-");
    const isPureBlooded = hyphenName.some(function (name) {
      return families.pure.includes(name);
    });

    const isHalfBlooded = hyphenName.some(function (name) {
      return families.half.includes(name);
    });

    if (isPureBlooded && isHalfBlooded) {
      return "Half";
    }

    if (isPureBlooded) {
      return "Pure";
    }

    if (isHalfBlooded) {
      return "Half";
    }
    return "Muggle";
  }

  if (families.half.includes(lastName)) {
    return "Half";
  }

  if (families.pure.includes(lastName)) {
    return "Pure";
  }
  return "Muggle";
}
/* SQUADMEMBER */
//add as squadMember
function addToSquad(student) {
  if (student.house === "Slytherin" || student.bloodStatus === "Pure") {
    if (student.squadMember === "Yes????") {
      student.squadMember = "add";
    } else {
      student.squadMember = "Yes????";
    }
    buildList();
  } else {
    document.getElementById("squad-dialog").classList.remove("hide");
    document
      .querySelector("#squad-dialog .closebutton")
      .addEventListener("click", closeSquadDialog);
  }
  //adding to squad only works for limited time, then hacking is taking over
  if (isHacked) {
    setTimeout(function () {
      student.squadMember = "Add";

      alert("I've gained control over the squadmembers, so sorry!????");

      buildList();
    }, 5000);
  } else {
    return;
  }

  function closeSquadDialog() {
    document.getElementById("squad-dialog").classList.add("hide");
    document
      .querySelector("#squad-dialog .closebutton")
      .removeEventListener("click", closeSquadDialog);
  }
}
/* LIST-DETAILS */
//(total count of students, house, expelled)
function currentListDialog() {
  /* console.log("arrived to function:)"); */
  document.getElementById("number-dialog").classList.remove("hide");
  document
    .querySelector("#number-dialog .closebutton")
    .addEventListener("click", closeListDialog);
  //set current properties
  //total student count
  let totalStudentCount = allCleanStudents.length;
  document.getElementById(
    "total-number"
  ).innerHTML = `Total student count: ${totalStudentCount}`;
  //expelled students
  let expelledStudents = allCleanStudents.filter((student) => student.expelled);
  document.getElementById(
    "expelled-number"
  ).innerHTML = `Expelled students count: ${expelledStudents.length}`;
  //HOUSE current data
  //Slytherin
  let slytherinStudents = allCleanStudents.filter(
    (student) => student.house === "Slytherin"
  );
  document.getElementById(
    "slytherin-number"
  ).innerHTML = `Slytherin students: ${slytherinStudents.length}`;
  //Gryffindor
  let gryffindorStudents = allCleanStudents.filter(
    (student) => student.house === "Gryffindor"
  );
  document.getElementById(
    "gryffindor-number"
  ).innerHTML = `Gryffindor students: ${gryffindorStudents.length}`;
  //Hufflepuff
  let hufflepuffStudents = allCleanStudents.filter(
    (student) => student.house === "Hufflepuff"
  );
  document.getElementById(
    "hufflepuff-number"
  ).innerHTML = `Hufflepuff students: ${hufflepuffStudents.length}`;
  //Ravenclaw
  let ravenclawStudents = allCleanStudents.filter(
    (student) => student.house === "Ravenclaw"
  );
  document.getElementById(
    "ravenclaw-number"
  ).innerHTML = `Ravenclaw students: ${ravenclawStudents.length}`;
  //close list dialog
  function closeListDialog() {
    document.getElementById("number-dialog").classList.add("hide");
    document
      .querySelector("#number-dialog .closebutton")
      .removeEventListener("click", closeListDialog);
  }
}
/* HACKING */
//making myself a student + send to randomBloodstatus to screw up bloodstatus
function hackTheSystem() {
  /* console.log("You're hacking the system.....!"); */
  //hacking status is as set (false) so if tht's the case, just return
  if (isHacked) {
    return;
  } else {
    isHacked = true;
    console.log(
      "* HACKED * Hacking is an action of the dark forces!! Harry and friends will find you!"
    );
    //hacking animation
    if (isHacked === true) {
      document.querySelector("body").classList.add("ifHacked");
    }
    //my info, pushing it to the array of students
    const halfBloodPrincess = {
      firstName: "Anna",
      lastName: "Lester",
      middleName: "Maria",
      nickName: "Halfbloodprincess",
      house: "Hufflepuff",
      studentImg: "no photo",
      gender: "Girl",
      expelled: false,
      prefect: false,
      bloodStatus: "Half",
      squadMember: "Leads squad",
    };
    allCleanStudents.push(halfBloodPrincess);
    randomBloodstatus();
    buildList();
  }
}
//make the bloodstatus random, no longer trustworthy
function randomBloodstatus() {
  if (isHacked) {
    allCleanStudents = allCleanStudents.map(function (student) {
      const bloodType = ["Pure", "Half", "Muggle"];
      student.bloodStatus = bloodType[Math.floor(Math.random() * 3)];
      return student;
    });
  }
}
