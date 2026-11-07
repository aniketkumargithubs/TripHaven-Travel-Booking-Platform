require("dotenv").config();
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require("connect-mongo").default;
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const bookingRouter=require("./routes/bookings.js");
const paymentsRouter=require("./routes/payments.js");
const userRouter=require("./routes/user.js");
const providerRouter=require("./routes/provider.js");

const port = process.env.PORT || 8080;

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// const Mongo_Url="mongodb://127.0.0.1:27017/TripHaven";
const dbURL=process.env.ATLASDB_URL;
main().then(()=>{
    console.log("MongoDB connected successfully");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbURL);
}

const store=MongoStore.create({
    mongoUrl:dbURL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600
});

store.on("error",(err)=>{
    console.log("Error in mongo session store",err);
});
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
};





app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/bookings",bookingRouter);
app.use("/payments", paymentsRouter);
app.use("/provider", providerRouter);
app.use("/",userRouter);





//ExpressError
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));

});
//Error Handler
app.use((err, req, res, next) => {
    let {statusCode=500,message="Something went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
});

//Listen
app.listen(port,()=>{
    console.log(`Sever is listening on port: ${port}`);
})
