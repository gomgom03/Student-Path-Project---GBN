
let gbnData = {};
let mapProps = { paths: {}, points: {}, rooms: {}, students: {} };
let param = {
    maxDistDiff: 1.5
}

function setup() {
    //fetch data
    (() => {
        rtf("pathsD", "/gbn_data/paths.txt", gbnData);
        rtf("pointsD", "/gbn_data/points.txt", gbnData);
        rtf("structD", "/gbn_data/structure.txt", gbnData);
        rtf("studentsD", "/gbn_data/students.txt", gbnData);
    })();

    function createMap() {
        if (Object.keys(gbnData).length !== 4) {
            requestAnimationFrame(createMap);
            return;
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
            for (let j = 2; j < tmpPathsDRow.length; j++) {
                rooms[tmpPathsDRow[j]] = { type: "room", roomLink: paths[tmpPathsDRow[0]], id: tmpPathsDRow[j] };
            }

        }

        for (let i = 0; i < studentsD.length; i++) {
            let tmpStuDRow = studentsD[i];
            students[tmpStuDRow[0]] = { type: "student", curRoom: tmpStuDRow[1], destRooms: [...tmpStuDRow].splice(2), id: tmpStuDRow[0] }
        }
    }
    requestAnimationFrame(createMap);
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

function findPaths(stu) {
    let { paths, points, rooms, students } = mapProps;
    let start = rooms[stu.curRoom].roomLink;
    let end = stu.destRooms.shift();
    let target = rooms[end].roomLink;
    let targetType = target.type;
    stu.curRoom = end;

    let allPaths = [];

    //modify later for starting in the middle of a hallway
    let curPoints = [start]
    let curPath = [];
    let pathOption = [];
    let depth = 0;
    let count = 0;
    async function searchPaths() {
        let tempOutput = curPath.map(x => x.id);
        count++;
        count % 100 === 0 ? console.log(allPaths, count) : null;
        //console.log(pathOption);
        //console.log(allPaths, tempOutput, curPath, pathOption, depth);
        let tempPoint = curPoints[depth];
        let tempPath;
        while (true) {
            //console.log("a", tempPath, curPath, pathOption)
            pathOption.length !== depth + 1 ? pathOption[depth] = 0 : pathOption[depth]++;
            tempPath = tempPoint.links[pathOption[depth]];
            //console.log(tempPath, tempPath == null)
            if (!tempPath) { break }
            if (curPath.find(x => tempPath.id === x.id) == null) { break };
        }

        let continueSearch = false;
        if (tempPath == null) {
            if (depth !== 0) {
                depth--;
                curPath.pop();
                pathOption.pop();
                curPoints.pop();
                continueSearch = true;

            }
        } else {
            depth++;
            curPath.push(tempPath);
            tempPath.links[0].id === tempPoint.id ? curPoints.push(tempPath.links[1]) : curPoints.push(tempPath.links[0]);
            continueSearch = true;
            if (targetType === "point") {
                //console.log(curPoints[curPoints.length - 1], target.id);
                curPoints[curPoints.length - 1].id === target.id ? allPaths.push([...curPath]) : null;
            } else {
                curPath[curPath.length - 1].id === target.id ? allPaths.push([...curPath]) : null;
            }
        }

        return continueSearch;


        /*
        let tPoint = curPoints[curPoints.length - 1];
        if (tPoint.type === "point") {
            let tPath = tPoint.links[pathOption[depth] + 1]
            if (tPath) {
                pathOption[depth]++;
                if (curPath.filter(x => tPath.id === x.id).length !== 0) {
                    let tPath2 = temp.links[pathOption[depth] + 1];
                    if (tPath2) {
                        pathOption[depth]++;
                    } else {
                        depth--;
                        pathOption.pop();
                        curPath.splice(curPath.length - 2)
                    }
                }
            }
        }
        */
    }

    async function queueSP() {
        searchPaths().then(queue => {
            if (queue) {
                setTimeout(() => { queueSP() }, 0.1)
            } else {
                return allPaths;
            }
        })
    }

    queueSP();


}

