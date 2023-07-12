document.getElementById("file-input").addEventListener("change", function (e) {
    let file = document.getElementById("file-input").value;
    let fileIndicator = document.getElementById("degreeworks-filename");
    
    filename = file.toString().split("\\")[2];
    console.log(filename);

    fileIndicator.textContent = filename;
});

function sendFileData() {
    let fileIndicator = document.getElementById("degreeworks-filename");
    fileIndicator.textContent = "No File Uploaded";
}