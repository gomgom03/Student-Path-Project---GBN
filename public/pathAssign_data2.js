
let optionsAll = {
    mdd: [1.25, 1.5, 100],
    id: [9, 12, 15, 100],
}

let trialNum = 0;
let mddCur = 0;
let idCur = 0;
let intervalObj;
let started = false;

let startElem = document.getElementById("start");
startElem.addEventListener("click", () => {
    startElem.style.visibility = "hidden";
    intervalObj = setInterval(() => {
        if (!started || asyncCounter.max === asyncCounter.count) {
            started = true;
            test();

        }
    }, 1000)
})

function test() {
    if (trialNum === 5) {
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