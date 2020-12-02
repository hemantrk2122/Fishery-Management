const express = require("express");
const mongoose = require("mongoose");
const mongoURI = require("./config/keys");
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const methodOverride = require("method-override");
const multer = require("multer");
const app = express();
const exphbs = require("express-handlebars");
const path = require("path");
const cookieParser = require("cookie-parser");
require("./models");
const flash = require("connect-flash");
const users = require("./routes/users");
const items = require("./routes/items");
const index = require("./routes/index");
const boats = require("./routes/boats");
const reports = require("./routes/reports");

const {
  truncate,
  formatDate,
  select,
  stripTags,
  ifCon,
  editIcon
} = require("./helpers/hbs");
require("./config/passport")(passport);

// To promisify mongoose
// To use the .then().catch() structure while coding
mongoose.Promise = global.Promise;

// Connect to the database
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true
  })
  .then(() => {
    console.log("Connected to Database..");
  })
  .catch(err => console.log(err));

app.engine(
  "handlebars",
  exphbs({
    helpers: {
      truncate: truncate,
      formatDate: formatDate,
      select: select,
      stripTags: stripTags,
      ifCon: ifCon,
      editIcon: editIcon
    },
    defaultLayout: "main"
  })
);

// Code for image upload function which is used later in multer
// Function used to store file in images folder with the name as currentDate-originalName
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

// Code to check if uploaded file is an image or not
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.set("view engine", "handlebars");

// Code to handle cookies
app.use(cookieParser());

// Code to handle sessions
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// Code which allows to parse the request body
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// Code for image upload
app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single('image'));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

app.use(methodOverride("_method")); // Code to allow using methods like DELETE, PUT, etc.
app.use(express.static(path.join(__dirname, "public"))); // Serve public folder statically
app.use("/images", express.static(path.join(__dirname, "images"))); // Serve images folder statically

// All the routes
app.use("/users", users);
app.use("/items", items);
app.use("/boats", boats);
app.use("/reports", reports);
app.use("/", index);

// Port on which server runs
const port = process.env.PORT || 5000;

// Code to run the server
app.listen(port, () => {
  console.log(`Server running on port ${port}..`);
});