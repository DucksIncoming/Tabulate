class Course {
    constructor(prefix, num, className, hrs, color, prereq, coreq, category){
        this.prefix = prefix;
        this.num = num;
        this.className = className
        this.hrs = hrs;
        this.prereq = prereq;
        this.coreq = coreq;
        this.color = color;
        this.semester = -1;
        this.category = category;
    }

    updateCourseInfo(prefix, num, className, hrs, color, prereq, coreq, category) {
        this.prefix = prefix;
        this.num = num;
        this.className = className
        this.hrs = hrs;
        this.prereq = prereq;
        this.coreq = coreq;
        this.color = color;
        this.semester = -1;
        this.category = category;
    }
}

function isValid(course) {
    course.semester = locateClass(course.prefix + " " + course.num);

    if (course.semester == 0){
        return true;
    }
    if (course.semester == -1){
        return false;
    }

    for (let req = 0; req < course.prereq.length; req++){
        let prereqLocation = locateClass(course.prereq[req]);
        if (prereqLocation == -1){
            return false;
        }
        else if (prereqLocation >= course.semester){
            return false
        }
    }

    for (let req = 0; req < course.coreq.length; req++){
        let coreqLocation = locateClass(course.coreq[req]);
        if (coreqLocation == -1){
            return false;
        }
        else if (coreqLocation > course.semester){
            return false
        }
    }

    return true;
}

var saveData = JSON.parse(localStorage.saveData || null) || {};

let courseData = retrieveSavedData();

/*
let a = new Course("MATH", "301", "Differential Equations", 3, "yellow", ["MATH 200"], [])
let b = new Course("MATH", "200", "Calculus II", 3, "yellow", [], [])
let c = new Course("MATH", "307", "Multivariate Calculus", 3, "yellow", ["MATH 200"], ["MATH 301"])

let courseData = [
    [], //External Credit
    [a,b,c,a,b,c,a,b,c,a,b,c], //Semester 1
    [], //Semester 2
    [], //Semester 3
    [], //Semester 4
    [], //Semester 5
    [], //Semester 6
    [], //Semester 7
    []  //Semester 8
];
*/

let draggables = document.querySelectorAll(".class-box");
let draggedClass;
let semesterDivs = [    
                        document.getElementById("external-credit-container"),
                        document.getElementById("freshman-fall"),
                        document.getElementById("freshman-spring"),
                        document.getElementById("sophomore-fall"),
                        document.getElementById("sophomore-spring"),
                        document.getElementById("junior-fall"),
                        document.getElementById("junior-spring"),
                        document.getElementById("senior-fall"),
                        document.getElementById("senior-spring")
                    ];
let targetSemester = null;
semesterDivs.forEach(container => {
    container.addEventListener("dragover", e => {
        e.preventDefault();
        let draggable = document.querySelector(".dragging");
        container.appendChild(draggable);
        
        targetSemester = nameToSemester(container.id);
    });
});
let externalCreditContainer = document.getElementById("external-credit-container");

externalCreditContainer.addEventListener("dragover", e =>{
    e.preventDefault();
    let draggable = document.querySelector(".dragging");
    externalCreditContainer.appendChild(draggable);
    
    targetSemester = 0;
});

let deleteAllDialogue = document.getElementById("delete-all-dialogue");
let deleteAllConfirm = document.getElementById("delete-all-confirm");
let deleteAllCancel = document.getElementById("delete-all-cancel");
let deleteAllButton = document.getElementById("delete-all-button");

deleteAllButton.addEventListener("click", e => {
    deleteAllDialogue.showModal();
});
deleteAllConfirm.addEventListener("click", e => {
    deleteAllDialogue.close();
    courseData = [[],[],[],[],[],[],[],[],[]];
    buildSchedule();
});
deleteAllCancel.addEventListener("click", e => {
    deleteAllDialogue.close();
});

buildSchedule();

function locateClass(className){
    let prefix = className.split(" ")[0]
    let num = className.split(" ")[1]

    for (let semester = 0; semester < courseData.length; semester++){
        for (let classIndex = 0; classIndex < courseData[semester].length; classIndex++){
            let activeObject = courseData[semester][classIndex];

            if (activeObject.prefix == prefix && activeObject.num == num){
                return semester;
            }
        }
    }

    return -1;
}

function nameToSemester(name){
    switch(name){
        case "freshman-fall":
            return 1;
        case "freshman-spring":
            return 2;
        case "sophomore-fall":
            return 3;
        case "sophomore-spring":
            return 4;
        case "junior-fall":
            return 5;
        case "junior-spring":
            return 6;
        case "senior-fall":
            return 7;
        case "senior-spring":
            return 8;
        default:
            return 0;
    }
}

document.getElementById("edit-class-confirm").addEventListener("click", editCourse);

function editCourse() {
    let in_prefix = document.getElementById("edit-class-prefix").value;
    let in_num = document.getElementById("edit-class-num").value;
    let in_hours = document.getElementById("edit-class-hours").value;
    let in_name = document.getElementById("edit-class-name").value;
    let in_prerequisites = document.getElementById("edit-class-prerequisites").value;
    let in_corequisites = document.getElementById("edit-class-corequisites").value;
    let in_category = document.getElementById("edit-class-category").value;

    let prereqArray = in_prerequisites.split(",");
    let coreqArray = in_corequisites.split(",");

    if (prereqArray[0] == ""){
        prereqArray = []
    }
    if (coreqArray[0] == ""){
        coreqArray = []
    }

    editingCourse.updateCourseInfo(in_prefix, in_num, in_name, parseInt(in_hours), classColors[parseInt(in_category)], prereqArray, coreqArray, in_category);
    courseData[editSemester][editIndex] = editingCourse;

    buildSchedule();
    document.getElementById("edit-existing-class-dialogue").close()
}

var editingCourse;
var editIndex;
var editSemester;

function buildSchedule() {
    for (let sem = 0; sem < courseData.length; sem++){
        semesterDivs[sem].innerHTML = "";
        let semesterHours = 0;

        for (let cl = 0; cl < courseData[sem].length; cl++){
            let classBoxHtml = '<div class="class-box" draggable="true" style="background-color: [COLOR]; border: [BORDER]; z-index: [INDEX]"><input type="image" src="Icons/x-icon.png" class="class-box-delete" title="Delete This Course"></input><input type="image" src="Icons/edit-icon.png" title="Edit This Course" class="class-box-edit"></input><b class="class-box-text">[PREFIX] [NUM]</b><p class="class-box-text">[CLASSNAME]</p><p class="class-box-text">[HOURS] hrs.</p></div>'
            let standardBorder = "0.15vw solid black";
            let errorBorder = "0.15vw solid red";
            let activeClass = courseData[sem][cl];

            classBoxHtml = classBoxHtml.replace("[PREFIX]", activeClass.prefix);
            classBoxHtml = classBoxHtml.replace("[NUM]", activeClass.num);
            classBoxHtml = classBoxHtml.replace("[CLASSNAME]", activeClass.className);
            classBoxHtml = classBoxHtml.replace("[HOURS]", activeClass.hrs);
            semesterHours += activeClass.hrs;
            classBoxHtml = classBoxHtml.replace("[INDEX]", (cl + 100).toString());

            if (isValid(activeClass)) {
                classBoxHtml = classBoxHtml.replace("[BORDER]", standardBorder);
                classBoxHtml = classBoxHtml.replace("[COLOR]", activeClass.color);
            }
            else {
                classBoxHtml = classBoxHtml.replace("[BORDER]", errorBorder);
                classBoxHtml = classBoxHtml.replace("[COLOR]", "#ff6666");
            }

            semesterDivs[sem].innerHTML += classBoxHtml;
        }

        if (sem != 0){
            semesterDivs[sem].innerHTML += '<p class="semester-hours">' + semesterHours.toString() + ' hrs.</p>'
        } 
        else {
            semesterDivs[sem].innerHTML += '<p class="external-credit-title">External Credit (AP, Dual Enrollment, etc.)</p>'
        }
    }

    draggables = document.querySelectorAll(".class-box");

    let dragSemester;
    let dragIndex;
    draggables.forEach(draggable => {
        draggable.addEventListener("dragstart", function(e) {
            draggable.classList.add("dragging");
            dragSemester = nameToSemester(draggable.parentElement.id);
            dragIndex = draggable.style.zIndex - 100;
            draggedClass = courseData[dragSemester][dragIndex];
        });

        draggable.addEventListener("dragend", function(e) {
            draggable.classList.remove("dragging");
            console.log(draggedClass)
            courseData[targetSemester].push(draggedClass);
            console.log(draggedClass)
            courseData[dragSemester].splice(dragIndex, 1);

            draggedClass = null;
            console.log(courseData);
            buildSchedule();
        });

        draggable.addEventListener("mouseover", function (e) {
            let deleteButton = draggable.querySelector(".class-box-delete");
            let editButton = draggable.querySelector(".class-box-edit");
            deleteButton.style.visibility = "visible";
            editButton.style.visibility = "visible";
        });
        draggable.addEventListener("mouseout", function (e) {
            let deleteButton = draggable.querySelector(".class-box-delete");
            let editButton = draggable.querySelector(".class-box-edit");
            deleteButton.style.visibility = "hidden";
            editButton.style.visibility = "hidden";
        });
    });
    document.querySelectorAll(".class-box-delete").forEach(deleteB => {
        deleteB.addEventListener("click", e => {
            if (confirm("Delete this course?")){
                let pendingKillCourse = deleteB.parentElement;
                let deleteIndex = (pendingKillCourse.style.zIndex - 100);
                let deletionSemester = nameToSemester(pendingKillCourse.parentElement.id);
                courseData[deletionSemester].splice(deleteIndex, 1);

                buildSchedule();
            }
        });
    });
    document.querySelectorAll(".class-box-edit").forEach(editB => {
        editB.addEventListener("click", e => {
            editIndex = (editB.parentElement.style.zIndex - 100);
            editSemester = nameToSemester(editB.parentElement.parentElement.id);
            editingCourse = courseData[editSemester][editIndex];

            let prereqText = "";
            editingCourse.prereq.forEach(req => {
                prereqText += req + ",";
            });
            prereqText = prereqText.slice(0, -1);
            let coreqText = "";
            editingCourse.coreq.forEach(req => {
                coreqText += req + ",";
            });
            coreqText = coreqText.slice(0, -1);
            
            document.getElementById("edit-existing-class-dialogue").showModal();
            document.getElementById("edit-class-prefix").value = editingCourse.prefix;
            document.getElementById("edit-class-num").value = editingCourse.num;
            document.getElementById("edit-class-hours").value = editingCourse.hrs;
            document.getElementById("edit-class-name").value = editingCourse.className;
            document.getElementById("edit-class-prerequisites").value = prereqText;
            document.getElementById("edit-class-corequisites").value = coreqText;
            document.getElementById("edit-class-corequisites").value = coreqText;
            document.getElementById("edit-class-category").selectedIndex = editingCourse.category;
        });
    });
}

function retrieveSavedData() {
    return saveData.courseData || [[],[],[],[],[],[],[],[],[]];
}

const delay = ms => new Promise(res => setTimeout(res, ms));

document.getElementById("new-class-cancel").addEventListener("click", e => {
    document.getElementById("add-new-class-dialogue").close()
});
document.getElementById("edit-class-cancel").addEventListener("click", e => {
    document.getElementById("edit-existing-class-dialogue").close()
});

document.getElementById("save-data-button").addEventListener("click", e => {
    animateCheckmark();

    saveData.courseData = courseData;
    saveData.time = new Date().getTime();
    localStorage.saveData = JSON.stringify(saveData);
});

async function animateCheckmark() {
    let saveConfirmation = document.getElementById("save-confirmation-image");
    saveConfirmation.classList.add("checkanim");
    await delay(1000)
    saveConfirmation.classList.remove("checkanim");
}

document.getElementById("new-class-add").addEventListener("click", e => {
    let in_prefix = document.getElementById("new-class-prefix").value;
    let in_num = document.getElementById("new-class-num").value;
    let in_hours = document.getElementById("new-class-hours").value;
    let in_name = document.getElementById("new-class-name").value;
    let in_prerequisites = document.getElementById("new-class-prerequisites").value;
    let in_corequisites = document.getElementById("new-class-corequisites").value;
    let in_category = document.getElementById("new-class-category").value;

    in_prerequisites = in_prerequisites.replaceAll(", ", ",");
    in_corequisites = in_corequisites.replaceAll(", ", ",");

    let prereqArray = in_prerequisites.split(",");
    let coreqArray = in_corequisites.split(",");

    if (prereqArray[0] == ""){
        prereqArray = []
    }
    if (coreqArray[0] == ""){
        coreqArray = []
    }

    let addedCourse = new Course(in_prefix, in_num, in_name, parseInt(in_hours), classColors[parseInt(in_category)], prereqArray, coreqArray, in_category);
    courseData[1].push(addedCourse)
    buildSchedule();

    document.getElementById("new-class-prefix").value = "";
    document.getElementById("new-class-num").value = "";
    document.getElementById("new-class-hours").value = "";
    document.getElementById("new-class-name").value = "";
    document.getElementById("new-class-prerequisites").value = "";
    document.getElementById("new-class-corequisites").value = "";
});

document.getElementById("add-new-button").addEventListener("click", e => {
    document.getElementById("add-new-class-dialogue").showModal();

    document.getElementById("new-class-prefix").value = "";
    document.getElementById("new-class-num").value = "";
    document.getElementById("new-class-hours").value = "";
    document.getElementById("new-class-name").value = "";
    document.getElementById("new-class-prerequisites").value = "";
    document.getElementById("new-class-corequisites").value = "";

    let previewHtml = '<div class="new-class-preview" id="new-class-preview" style="background-color: yellow;"><input type="image" src="Icons/x-icon.png" class="class-box-delete"></input><b class="class-box-text" id="class-preview-prefix-num"></b><p class="class-box-text" id="class-preview-classname"></p><p class="class-box-text" id="class-preview-hours">hrs.</p></div>'
    document.getElementById("new-class-preview").remove();

    var newClassPreview = document.createElement("div");
    document.getElementById("add-new-class-dialogue").appendChild(newClassPreview);
    newClassPreview.outerHTML = previewHtml;
});

let classColors = ["#FFFF00", "#6C29FF", "#5FAEFF", "#FFC080", "#00AC4B", "#EF6DE3", "#00F9FF", "yellowgreen", "white"];

function updateClassPreview(){
    let in_prefix = document.getElementById("new-class-prefix");
    let in_num = document.getElementById("new-class-num");
    let in_hours = document.getElementById("new-class-hours");
    let in_name = document.getElementById("new-class-name");
    let in_category = document.getElementById("new-class-category");

    document.getElementById("new-class-preview").remove();
    let previewHtml = '<div class="new-class-preview" id="new-class-preview" style="background-color: [COLOR];"><input type="image" src="Icons/x-icon.png" class="class-box-delete"></input><b class="class-box-text" id="class-preview-prefix-num">[PREFIX] [NUM]</b><p class="class-box-text" id="class-preview-classname">[CLASSNAME]</p><p class="class-box-text" id="class-preview-hours">[HOURS] hrs.</p></div>'
    previewHtml = previewHtml.replace("[PREFIX]", in_prefix.value.toUpperCase());
    previewHtml = previewHtml.replace("[NUM]", in_num.value);
    previewHtml = previewHtml.replace("[CLASSNAME]", in_name.value);
    previewHtml = previewHtml.replace("[HOURS]", in_hours.value);
    previewHtml = previewHtml.replace("[COLOR]", classColors[parseInt(in_category.value)])

    var newClassPreview = document.createElement("div");
    document.getElementById("add-new-class-dialogue").appendChild(newClassPreview);
    newClassPreview.outerHTML = previewHtml;
}