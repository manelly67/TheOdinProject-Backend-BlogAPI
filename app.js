const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const routes = require("./routes");

const app = express();
// Enable All CORS Requests
app.use(cors({origin:"http://localhost:5173",allowedHeaders:['Content-Type', 'Authorization','Connection'],credentials:true}));

app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60, // Equals 1 hour - 60min/1hrs - 60seg/1min - 1000ms/1seg
    },
    secret: "some secret",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

// se debe inicializar cada sesion
app.use(passport.initialize());
app.use(passport.session());

//si no se utiliza esta middleware el post object resulta undefined
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//you will have access to the currentUser variable in all of your views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", routes.homepage);
app.use("/sign_up", routes.sign_up);
app.use("/login", routes.login);
app.use("/logout", routes.logout);

app.use("/posts", routes.post);
app.use("/comments", routes.comment);

app.use((req, res) => {
  res.status(404).json({
    message: "Oops, Page Not Found :) ",
    title: "Error Page",
  });
});

app.listen(port, host, () => {
  console.log(`Server is running on ${host}:${port}`);
});
