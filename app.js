const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');


let server = app.listen(port, () => {
    console.log(`Listening to ${port}`);
})

app.get('/', (req, res) => {
    res.render('home.ejs')
});

app.get('/pathfind', (req, res) => {
    res.render("pathfind.ejs")
})

app.get('/testerhome', (req, res) => {
    res.render('tester-home.ejs')
});

app.get("/testerhome2", (req, res) => {
    res.render('tester-home2.ejs')
})

app.get('/studata', (req, res) => {
    res.render('stuData.ejs')
})

app.get('/gbnmap', (req, res) => {
    res.render('gbnMap.ejs')
})

// app.get('/findmaxdepth', (req, res) => {
//     res.render('findMaxDepth.ejs')
// })

// app.get('/test', (req, res) => {
//     res.render('tester.ejs');
// })

