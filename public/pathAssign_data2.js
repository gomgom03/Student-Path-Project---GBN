
let optionsAll = {
    mdd: [1.25, 1.5, 1.75, 2],
    id: [9, 12, 15, 18, 21],
}

let trialNum = 0;
let mddCur = 0;
let idCur = 0;
let numIterTrials = 3;
let intervalObj;
let first = true;
let startAllowed = false;
let startAllowedDelay = false;

let startElem = document.getElementById("start");
startElem.addEventListener("click", () => {
    startElem.style.visibility = "hidden";
    intervalObj = setInterval(() => {
        if (!startAllowed && (first || (asyncCounter.max === asyncCounter.count && !startAllowedDelay))) {
            first = false;
            startAllowed = true;
            startAllowedDelay = true;
            setTimeout(() => { startAllowedDelay = false; }, 10000)
        }
        if (startAllowed) {
            startAllowed = false;
            setTimeout(() => {
                test();
            }, 5000);


        }
        checkEverything();
    }, 1000)
})

const asyncShowDiv = document.getElementById("asyncShow");

function checkEverything() {
    asyncShowDiv.textContent = "Student Paths Calculated: " + asyncCounter.count + " / " + asyncCounter.max;

}

function test() {
    if (trialNum === numIterTrials) {
        clearInterval(intervalObj);
        return;
    }


    param.maxDistDiff = optionsAll.mdd[mddCur];
    param.initialDepth = optionsAll.id[idCur];
    all_spf();
    idCur++;
    idCur === optionsAll.id.length ? (mddCur++, idCur = 0) : null;
    mddCur === optionsAll.mdd.length ? (trialNum++, mddCur = 0) : null;
}



// CREATE STUDENTS
// let temp= Object.keys(mapProps.rooms); let tstr = "";for(let i = 0;i<100;i++){tstr+=`${i}\t`;for(let j = 0; j<8; j++){tstr+= temp[Math.floor(Math.random()*temp.length)] + "\t"}tstr+="\n"}