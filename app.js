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
