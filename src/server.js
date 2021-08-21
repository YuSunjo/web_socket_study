import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");
app.use('/public', express.static(__dirname + '/public'));

app.get("/*", (req, res) => res.redirect("/"));
console.log('hello');

app.get('/', (req, res) => res.render("home"));
const handleListen = () => console.log(`listening on 300port`);
app.listen(3000);