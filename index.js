class Course {
    constructor(prefix, num, className, hrs, color, prereq, coreq){
        this.prefix = prefix;
        this.num = num;
        this.className = className
        this.hrs = hrs;
        this.prereq = prereq;
        this.coreq = coreq;
        this.color = color;
        this.semester = -1
    }

    isValid() {
        this.semester = locateClass(this.prefix + " " + this.num);

        if (this.semester == 0){
            return true;
        }
        if (this.semester == -1){
            return false;
        }

        for (let req = 0; req < this.prereq.length; req++){
            let prereqLocation = locateClass(this.prereq[req]);
            if (prereqLocation == -1){
                return false;
            }
            else if (prereqLocation >= this.semester){
                return false
            }
        }

        for (let req = 0; req < this.coreq.length; req++){
            let coreqLocation = locateClass(this.coreq[req]);
            if (coreqLocation == -1){
                return false;
            }
            else if (coreqLocation > this.semester){
                return false
            }
        }

        return true;
    }
}

let a = new Course("MATH", "301", "Differential Equations", 3, "yellow", ["MATH 200"], [])
let b = new Course("MATH", "200", "Calculus II", 3, "yellow", [], [])
let c = new Course("MATH", "307", "Multivariate Calculus", 3, "yellow", ["MATH 200"], ["MATH 301"])

let courseData = [
    [], //External Credit
    [], //Semester 1
    [b], //Semester 2
    [], //Semester 3
    [], //Semester 4
    [], //Semester 5
    [], //Semester 6
    [], //Semester 7
    []  //Semester 8
];

let draggables = document.querySelectorAll(".class-box");
let draggedClass;
let semesterDivs = [
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
})

let deleteAllDialogue = document.getElementById("delete-all-dialogue");
let deleteAllConfirm = document.getElementById("delete-all-confirm");
let deleteAllCancel = document.getElementById("delete-all-cancel");
let deleteAllButton = document.getElementById("delete-all-button");

deleteAllButton.addEventListener("click", e => {
    deleteAllDialogue.showModal();
});
deleteAllConfirm.addEventListener("click", e => {
    deleteAllDialogue.close();
    courseData = courseData = [
        [], //External Credit
        [], //Semester 1
        [], //Semester 2
        [], //Semester 3
        [], //Semester 4
        [], //Semester 5
        [], //Semester 6
        [], //Semester 7
        []  //Semester 8
    ];
    buildSchedule();
});
deleteAllCancel.addEventListener("click", e => {
    deleteAllDialogue.close();
});

buildSchedule();

document.getElementById("file-input").addEventListener("change", function (e) {
    let file = document.getElementById("file-input").value;
    let fileIndicator = document.getElementById("degreeworks-filename");
    
    filename = file.toString().split("\\")[2];

    fileIndicator.textContent = filename;
});

function sendFileData() {
    let fileIndicator = document.getElementById("degreeworks-filename");
    fileIndicator.textContent = "No File Uploaded";
}

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
    }
}

function buildSchedule() {
    for (let sem = 1; sem < courseData.length; sem++){
        semesterDivs[sem-1].innerHTML = "";
        let semesterHours = 0;

        for (let cl = 0; cl < courseData[sem].length; cl++){
            let classBoxHtml = '<div class="class-box" draggable="true" style="background-color: [COLOR]; border: [BORDER]; z-index: [INDEX]"><input type="image" src="Icons/x-icon.png" class="class-box-delete"></input><b class="class-box-text">[PREFIX] [NUM]</b><p class="class-box-text">[CLASSNAME]</p><p class="class-box-text">[HOURS] hrs.</p></div>'
            let standardBorder = "0.15vw solid black";
            let errorBorder = "0.15vw solid red";
            let activeClass = courseData[sem][cl];

            classBoxHtml = classBoxHtml.replace("[PREFIX]", activeClass.prefix);
            classBoxHtml = classBoxHtml.replace("[NUM]", activeClass.num);
            classBoxHtml = classBoxHtml.replace("[CLASSNAME]", activeClass.className);
            classBoxHtml = classBoxHtml.replace("[HOURS]", activeClass.hrs);
            semesterHours += activeClass.hrs;
            classBoxHtml = classBoxHtml.replace("[INDEX]", (cl + 100).toString());
            
            if (activeClass.isValid()) {
                classBoxHtml = classBoxHtml.replace("[BORDER]", standardBorder);
                classBoxHtml = classBoxHtml.replace("[COLOR]", activeClass.color);
            }
            else {
                classBoxHtml = classBoxHtml.replace("[BORDER]", errorBorder);
                classBoxHtml = classBoxHtml.replace("[COLOR]", "#ff6666");
            }

            semesterDivs[sem-1].innerHTML += classBoxHtml;
        }

        semesterDivs[sem-1].innerHTML += '<p class="semester-hours">' + semesterHours.toString() + ' hrs.</p>'
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
            deleteButton.style.visibility = "visible";
        });
        draggable.addEventListener("mouseout", function (e) {
            let deleteButton = draggable.querySelector(".class-box-delete");
            deleteButton.style.visibility = "hidden";
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
}

document.getElementById("new-class-cancel").addEventListener("click", e => {
    document.getElementById("add-new-class-dialogue").close()
});

document.getElementById("new-class-add").addEventListener("click", e => {
    let in_prefix = document.getElementById("new-class-prefix").value;
    let in_num = document.getElementById("new-class-num").value;
    let in_hours = document.getElementById("new-class-hours").value;
    let in_name = document.getElementById("new-class-name").value;
    let in_prerequisites = document.getElementById("new-class-prerequisites").value;
    let in_corequisites = document.getElementById("new-class-corequisites").value;
    let in_category = document.getElementById("new-class-category").value;

    let prereqArray = in_prerequisites.split(",");
    let coreqArray = in_corequisites.split(",");

    if (prereqArray[0] == ""){
        prereqArray = []
    }
    if (coreqArray[0] == ""){
        coreqArray = []
    }

    let addedCourse = new Course(in_prefix, in_num, in_name, parseInt(in_hours), classColors[parseInt(in_category)], prereqArray, coreqArray);
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
    let in_prerequisites = document.getElementById("new-class-prerequisites");
    let in_corequisites = document.getElementById("new-class-corequisites");
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