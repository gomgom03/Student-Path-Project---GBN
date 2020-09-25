
let gbnData = {};
let studentPaths = {};
let mapProps = { paths: {}, points: {}, rooms: {}, students: {} };
let param = {
    maxDistDiff: 1.2,
    initialDepth: 12,
    traceRemainTime: 60,
    avgPace: 3.1,
    minimizeIteration: 10,
    period: 1
}
let timer;

function setup() {
    (() => {
        rtf("pathsD", "/gbn_data/paths.txt", gbnData);
        rtf("pointsD", "/gbn_data/points.txt", gbnData);
        rtf("structD", "/gbn_data/structure.txt", gbnData);
        rtf("studentsD", "/gbn_data/students1.txt", gbnData);
    })();

    function createMap() {
        if (Object.keys(gbnData).length !== 4) {
            return;
        } else {
            clearInterval(tInterv);
        }
        let { pathsD, pointsD, structD, studentsD } = gbnData;
        if (structD.length !== pointsD.length) { throw "Invalid Data Input" };
        //Construct Map
        let { paths, points, rooms, students } = mapProps;

        for (let i = 0; i < pointsD.length; i++) {
            //Create Points and Connect Rooms to the Points
            let tmpPtsDRow = pointsD[i];
            points[i] = { type: "point", id: i };
            for (let j = 1; j < tmpPtsDRow.length; j++) {
                rooms[tmpPtsDRow[j]] = { type: "room", roomLink: points[i], id: tmpPtsDRow[j] };
            }

            //Link Paths and Points
            let tmpStructDRow = structD[i];
            points[i]["links"] = []
            for (let j = 1; j < tmpStructDRow.length; j++) {
                paths[tmpStructDRow[j]] ? null : paths[tmpStructDRow[j]] = { type: "path", links: [], id: tmpStructDRow[j] };
                paths[tmpStructDRow[j]]["links"].push(points[i]);
                points[i]["links"].push(paths[tmpStructDRow[j]])
            }
        }

        for (let i = 0; i < pathsD.length; i++) {
            //Connect Rooms to the Paths
            let tmpPathsDRow = pathsD[i];
            paths[tmpPathsDRow[0]]["distance"] = parseFloat(tmpPathsDRow[1]);
            paths[tmpPathsDRow[0]]["walkTime"] = parseFloat(tmpPathsDRow[1]) / param.avgPace;
            for (let j = 2; j < tmpPathsDRow.length; j++) {
                rooms[tmpPathsDRow[j]] = { type: "room", roomLink: paths[tmpPathsDRow[0]], id: tmpPathsDRow[j] };
            }

        }

        for (let i = 0; i < studentsD.length; i++) {
            let tmpStuDRow = studentsD[i];
            students[tmpStuDRow[0]] = { type: "student", periodRooms: [...tmpStuDRow].splice(1), id: tmpStuDRow[0] }
        }
    }
    let tInterv = setInterval(createMap, 10);
}

setup();

function rtf(name, path, obj) {
    let rf = new XMLHttpRequest();
    rf.open("GET", path, true);
    rf.onreadystatechange = function () {
        if (rf.readyState === 4) {
            obj[name] = rf.responseText.split("\n").map(a => a.split("\t").filter(b => b !== "" && b !== "\x0d").map(c => c.split("\x0d").filter(d => d !== "").join("")));
        }
    }
    rf.send();
}

function pointPathSearch(student, prm, period) {
    let { id, s, e, t, findMin, maxDepth, minVal, shiftPath, trialNum, fullPathSearch } = prm;
    let { paths, points, rooms, students } = mapProps;
    let { maxDistDiff } = param;
    let targetType = t.type;


    let allPaths = [];

    let curPoints = [s];
    let curPath = [];
    let curLen = 0;
    shiftPath != null ? curLen = shiftPath.distance : null;
    let minLen = minVal;
    let maxLen = minVal ? minVal * maxDistDiff : null;
    //console.log(maxLen)

    let pathOption = [];
    let depth = 0;
    let count = 0;

    async function searchPaths() {
        count++;
        //right next to each other and sing at a path
        let tempPoint = curPoints[depth];
        let tempPath;
        while (true) {
            pathOption.length !== depth + 1 ? pathOption[depth] = 0 : pathOption[depth]++;
            tempPath = tempPoint.links[pathOption[depth]];
            if (maxDepth != null && depth === maxDepth) { tempPath = null; break };
            if (!tempPath) { break; }
            if (maxLen != null && maxLen < curLen + tempPath.distance) { continue };
            if (!(shiftPath != null && tempPath.id === shiftPath.id) && curPath.find(x => tempPath.id === x.id) == null) { break; };
        }

        let continueSearch = false;
        if (tempPath == null) {
            if (depth !== 0) {
                depth--;
                let poppedPath = curPath.pop();
                pathOption.pop();
                curPoints.pop();
                curLen -= poppedPath.distance;
                continueSearch = true;

            }
        } else {

            //resolve issue of finding path

            depth++;
            curPath.push(tempPath);
            curLen += tempPath.distance;
            tempPath.links[0].id === tempPoint.id ? curPoints.push(tempPath.links[1]) : curPoints.push(tempPath.links[0]);
            continueSearch = true;
            if (targetType === "point") {
                curPoints[curPoints.length - 1].id === t.id ? (allPaths.push({ path: [...curPath], distance: curLen, points: [...curPoints] }), minLen == null || curLen < minLen ? (minLen = curLen, maxLen = curLen * maxDistDiff) : null) : null;
            } else {
                curPath[curPath.length - 1].id === t.id ? (allPaths.push({ path: [...curPath], distance: curLen, points: [...curPoints] }), minLen == null || curLen < minLen ? (minLen = curLen, maxLen = curLen * maxDistDiff) : null) : null;
            }
        }
        return continueSearch;

    }

    async function queueSP() {
        searchPaths().then(queue => {
            if (queue) {
                setTimeout(() => { queueSP() }, 0.1)
            } else {
                resolveFind();
            }
        })


    }

    queueSP();

    function resolveFind() {
        if (findMin) {
            minLen != null ? typeof studentPaths[id] === "number" ? minLen < studentPaths[id] ? studentPaths[id] = minLen : null : studentPaths[id] = minLen : null;
            trialNum === 0 ? pointPathSearch(student, {
                id: id,
                s: shiftPath.links[1],
                e: e,
                t: t,
                findMin: true,
                maxDepth: maxDepth,
                shiftPath: shiftPath,
                trialNum: 1,
                fullPathSearch: fullPathSearch
            }, period) : fullPathSearch ? studentPathFind(student, false, period) : (asyncCounter.add());
        } else {
            if (shiftPath != null) {
                allPaths.map(x => [shiftPath].concat(x));
            }
            typeof studentPaths[id] === "object" ? studentPaths[id].paths = studentPaths[id].paths.concat(allPaths) : studentPaths[id] = { paths: allPaths, minLen: minLen, id: id, sType: shiftPath == null ? "point" : "path" };
            trialNum === 0 ? pointPathSearch(student, {
                id: id,
                s: shiftPath.links[1],
                e: e,
                t: t,
                findMin: false,
                shiftPath: shiftPath,
                trialNum: 1,
                minVal: minLen
            }, period) : (asyncCounter.add());
        }
    }

}

function studentPathFind(stu, limitDepth, period) {
    let { paths, points, rooms, students } = mapProps;
    let { maxDistDiff, initialDepth } = param;
    let start = rooms[stu.periodRooms[period - 1]].roomLink;
    let end = stu.periodRooms[period];
    let target = rooms[end].roomLink;
    if (start.id === target.id) {
        start.type === "path" ? studentPaths[stu.id] = { paths: [{ distance: start.distance, path: [start], points: [] }], minLen: start.distance, id: stu.id, sType: "path" } : studentPaths[stu.id] = { paths: [{ distance: 0, path: [], points: [start] }], minLen: 0, id: stu.id, sType: "point" };
        asyncCounter.add();
    } else {
        if (start.type === "point") {
            limitDepth ? pointPathSearch(stu, {
                id: stu.id,
                s: start,
                e: end,
                t: target,
                findMin: true,
                maxDepth: initialDepth,
                fullPathSearch: true
            }, period) : pointPathSearch(stu, {
                id: stu.id,
                s: start,
                e: end,
                t: target,
                findMin: false,
                fullPathSearch: true,
                minVal: typeof studentPaths[stu.id] === "number" ? studentPaths[stu.id] : null
            }, period)
        } else {
            limitDepth ? pointPathSearch(stu, {
                id: stu.id,
                s: start.links[0],
                e: end,
                t: target,
                findMin: true,
                maxDepth: initialDepth,
                shiftPath: start,
                trialNum: 0,
                fullPathSearch: true
            }, period) : pointPathSearch(stu, {
                id: stu.id,
                s: start.links[0],
                e: end,
                t: target,
                findMin: false,
                shiftPath: start,
                trialNum: 0,
                fullPathSearch: true,
                minVal: typeof studentPaths[stu.id] === "number" ? studentPaths[stu.id] : null
            }, period)
        }
    }
}

let asyncCounter = {
    count: 0,
    max: null,
    cb: null,
    add: function () {
        this.count++;
        this.max === this.count ? this.cb() : null;
    },
    reset: function () {
        this.count = 0;
        this.cb = null;
        this.max = null;
    },
}

function all_spf(period = param.period) {
    asyncCounter.reset();
    timer = Date.now();
    asyncCounter.cb = () => { console.log(`${param.initialDepth}    ${param.maxDistDiff}   finished in ${Date.now() - timer}ms`); all_minContact(); };
    if (period < 0 || period > 8) { console.log("invalid period"); return };
    studentPaths = {};
    let tNum = 0;
    for (let key in mapProps.students) {
        studentPathFind(mapProps.students[key], true, period);
        tNum++;
    }
    asyncCounter.max = tNum;
}

let studentPathChoice = {};

function all_minContact() {
    let { maxDistDiff, minimizeIteration } = param;
    for (let key in studentPaths) {
        let tSP = studentPaths[key];
        tSP.paths = tSP.paths.filter(x => x.distance <= tSP.minLen * maxDistDiff);
    }
    if (minimizeIteration < 1) { console.log("invalid number of iterations"); return }
    let pathQueueOrder = [];
    let tempPathObj = {};
    let tempPointObj = {};
    let { traceRemainTime } = param;
    for (let key in studentPaths) {
        studentPaths[key].paths.sort((a, b) => (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0))
        pathQueueOrder.push(studentPaths[key]);
    }
    pathQueueOrder.sort((a, b) => (a.minLen > b.minLen) ? 1 : ((b.minLen > a.minLen) ? -1 : 0));
    for (let key in mapProps.paths) {
        tempPathObj[key] = { traces: [] }
    }
    // tempPathObj.clear = function () { for (let key in tempPathObj) { key !== "clear" ? tempPathObj[key] = { traces: [] } : null; } }
    for (let key in mapProps.points) {
        tempPointObj[key] = { traces: [] }
    }
    // tempPointObj.clear = function () { for (let key in tempPointObj) { key !== "clear" ? tempPointObj[key] = { traces: [] } : null } }

    let curStu = 0;
    let tIter = 0;

    async function assignPath(stu, reassign = false) {
        let minContacted, minIndex, minContactList;
        if (reassign) {
            minContacted = studentPathChoice[stu.id].mCont;
            minIndex = studentPathChoice[stu.id].mInd;
            minContactList = studentPathChoice[stu.id].mContLi;
            let tArr = studentPaths[stu.id].paths[minIndex]
            for (let i = 0; i < tArr.path.length; i++) {
                tempPathObj[tArr.path[i].id].traces = tempPathObj[tArr.path[i].id].traces.filter(x => x.id !== stu.id)
            }

            for (let i = 0; i < tArr.points.length; i++) {
                tempPointObj[tArr.points[i].id].traces = tempPointObj[tArr.points[i].id].traces.filter(x => x.id !== stu.id)
            }
            for (let i = 0; i < minContactList.length; i++) {
                let tArr = studentPathChoice[minContactList[i]].mContLi.filter(x => x !== stu.id);
                studentPathChoice[minContactList[i]].mContLi = tArr;
                studentPathChoice[minContactList[i]].mCont = tArr.length;
            }
        }

        for (let i = 0; i < stu.paths.length; i++) {
            let pointIndex = 0;
            stu.sType === "path" ? pointIndex-- : null;
            let curTime = 0;
            let stuContacted = 0;
            let tPathArr = stu.paths[i];
            let tContactList = [];
            for (let j = 0; j < tPathArr.path.length; j++) {
                let tPathSeg = tPathArr.path[j];
                let tPoint = tPathArr.points[pointIndex];
                tempPathObj[tPathSeg.id].traces.forEach((x) => {
                    ((x.start <= curTime && x.end >= curTime) || (x.start <= curTime + tPathSeg.walkTime && x.end >= curTime + tPathSeg.walkTime)) && !tContactList.includes(x.id) ? (stuContacted++, tContactList.push(x.id)) : null;
                });
                tPoint != null ? tempPointObj[tPoint.id].traces.forEach((x) => {
                    x.start <= curTime && x.end >= curTime && !tContactList.includes(x.id) ? (stuContacted++, tContactList.push(x.id)) : null;
                }) : null;
                pointIndex++;
                curTime += tPathSeg.walkTime;
            }
            minContacted == null || minContacted > stuContacted ? (minIndex = i, minContacted = stuContacted, minContactList = tContactList) : null;
        }
        studentPathChoice[stu.id] = { mInd: minIndex, mCont: minContacted, mContLi: minContactList }
        let pInd = 0;
        let ct = 0;
        stu.sType === "path" ? pInd-- : null;
        let finStuPath = stu.paths[minIndex];
        for (let i = 0; i < finStuPath.path.length; i++) {
            let tPathSeg = finStuPath.path[i];
            let tPoint = finStuPath.points[pInd];
            tempPathObj[tPathSeg.id].traces.push({ id: stu.id, start: ct, end: ct + tPathSeg.walkTime + traceRemainTime })
            tPoint != null ? tempPointObj[tPoint.id].traces.push({ id: stu.id, start: ct, end: ct + traceRemainTime }) : null;
            pInd++;
            ct += tPathSeg.walkTime;
        }
        let tempTot = 0;
        for (let key in studentPathChoice) {
            tempTot += studentPathChoice[key].mCont / 2;
        }
        //console.log(tempTot, tIter);
        return;
    }

    async function assignIteration(reassign = false) {
        if (reassign) {
            assignPath(pathQueueOrder[curStu], true).then(() => {
                curStu++;
                curStu < pathQueueOrder.length ? assignIteration(true) : resolveAssignIteration();
            })
        } else {
            assignPath(pathQueueOrder[curStu]).then(() => {
                curStu++;
                curStu < pathQueueOrder.length ? assignIteration() : resolveAssignIteration();
            })
        }

    }

    assignIteration();

    function resolveAssignIteration() {


        tIter++;
        for (let key in studentPathChoice) {
            studentPathChoice[key].mContLi.forEach(x => {
                studentPathChoice[x].mContLi.includes(key) ? null : (studentPathChoice[x].mContLi.push(key), studentPathChoice[x].mCont++);
            })
        }
        let tempTot = 0;
        for (let key in studentPathChoice) {
            tempTot += studentPathChoice[key].mCont / 2;
        }
        console.log(`Trial iteration ${tIter} for job param [${param.initialDepth}, ${param.maxDistDiff}] , ${tempTot}`);
        typeof updateStats !== "undefined" ? updateStats(tempTot) : null;
        tIter !== minimizeIteration ? (curStu = 0, assignIteration(true)) : null
    }
}



function findMaxDepth(storeMin = false) {
    let tMaxDepth = 0;
    let tPaths = Object.keys(mapProps.paths);
    let tStudents = [];
    for (let i = 0; i < tPaths.length - 1; i++) {
        for (let j = i + 1; j < tPaths.length; j++) {
            tStudents.push({ id: `${i}-${j}`, periodRooms: [tPaths[i], tPaths[j]], type: "student" });
            studentPaths[`${i}-${j}`] = null;
        }
    }
    asyncCounter.reset();
    timer = Date.now();
    asyncCounter.cb = () => { console.log(`findMaxDepth finished in ${Date.now() - time}ms`); checkAndQueue(); };
    asyncCounter.max = tStudents.length;
    function checkAndQueue() {
        asyncCounter.count = 0;
        let queueAgain = false;
        tMaxDepth++;
        if (tMaxDepth === 1) {
            queueAgain = true;
        } else {
            for (let key in studentPaths) {
                if (studentPaths[key] == null) { queueAgain = true; console.log(tPaths[key.split("-")[0]], tPaths[key.split("-")[1]], key); break }
            }
        }
        if (queueAgain) {
            putData(`Max Depth ${tMaxDepth} unsuccessful`);
            tStudents.forEach(x => {
                if (studentPaths[x.id] == null) {
                    let { paths } = mapProps;
                    let start = paths[x.periodRooms[0]];
                    let end = 0;
                    let target = paths[x.periodRooms[1]];
                    pointPathSearch(x, {
                        id: x.id,
                        s: start.links[0],
                        e: end,
                        t: target,
                        findMin: true,
                        maxDepth: tMaxDepth,
                        shiftPath: start,
                        trialNum: 0,
                        fullPathSearch: false
                    }, 0)
                } else {
                    asyncCounter.add();
                }


            });

        } else {
            putData(`Max Depth ${tMaxDepth} SUCCESS`)
            storeMin ? param.initialDepth = tMaxDepth : null;
            studentPaths = {}
        }
    }
    checkAndQueue();
}

// TEMPORARY CODE