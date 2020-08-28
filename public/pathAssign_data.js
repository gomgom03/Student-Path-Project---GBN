
let tDocInterv;
let startable = true;
let curTrial = 1;
const asyncShowDiv = document.getElementById("asyncShow")
const statsDiv = document.getElementById("stats");
let tempStatsClone;

document.getElementById("start").addEventListener("click", () => {

    if (!startable) { return }
    startable = false;
    statsDiv.innerHTML = "";
    curTrial = 1;
    let paramSetArr = Object.keys(param);
    for (let i = 0; i < paramSetArr.length; i++) {
        let temp = document.getElementById(paramSetArr[i]).value;
        temp !== "" ? param[paramSetArr[i]] = temp * 100 / 100 : null
    }
    all_spf(param.period);
    tDocInterv = setInterval(checkEverything, 100);
})


function checkEverything() {
    asyncShowDiv.textContent = "Student Paths Calculated: " + asyncCounter.count + " / " + asyncCounter.max;


    if (asyncCounter.count === asyncCounter.max) { clearInterval(tDocInterv); startable = true };
}

function updateStats(numContacted) {

    let tempContDiv = document.createElement("div");
    let trialElem = document.createElement("h2");
    trialElem.textContent = `Trial #${curTrial}:`
    let ncElem = document.createElement("h3");
    ncElem.textContent = "Number of Student-to-student contact: " + numContacted
    let stuPathElem = document.createElement("ul");
    for (let key in studentPathChoice) {
        let tempLi = document.createElement("li");
        tempLi.style.marginBottom = "20px"
        tempLi.innerHTML = `<strong><u>Student ${key} Path </u>(From ${mapProps.students[key].periodRooms[param.period - 1]} to ${mapProps.students[key].periodRooms[param.period]}):</strong> ${studentPaths[key].paths[studentPathChoice[key].mInd].path.map(x => x.id)} <br><strong>Contacted students with these ids: </strong>${studentPathChoice[key].mContLi}`;
        stuPathElem.appendChild(tempLi);
    }
    tempContDiv.appendChild(trialElem);
    tempContDiv.appendChild(ncElem);
    tempContDiv.appendChild(stuPathElem);
    statsDiv.appendChild(tempContDiv)
    curTrial++;
    tempStatsClone = statsDiv.cloneNode(true);
}

//FIND MAX DEPTH;

document.getElementById("findMaxDepth").addEventListener("click", () => {
    if (!startable) { return }
    startable = false;
    statsDiv.innerHTML = "";
    findMaxDepth();
})

function putData(data) {
    let tempDiv = document.createElement("div");
    tempDiv.textContent = data;
    statsDiv.appendChild(tempDiv);
    data.indexOf("SUCCESS") !== -1 ? startable = true : null;
}

// CREATE STUDENTS
// let tstr = "";for(let i = 20;i<50;i++){tstr+=`${i}\t`;for(let j = 0; j<8; j++){tstr+= temp[Math.floor(Math.random()*temp.length)] + "\t"}tstr+="\n"}