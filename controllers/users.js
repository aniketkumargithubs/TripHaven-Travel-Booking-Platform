const User=require("../models/user.js");

module.exports.renderSignUp=(req,res)=>{
    res.render("users/signup.ejs");
}
module.exports.signUp=async(req,res,next)=>{
    let {username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to Wanderlust!");
        res.redirect("/listings");
    });

};

module.exports.renderLogIn=(req,res)=>{
    res.render("users/login.ejs")
};

module.exports.logIn=async(req,res)=>{
    req.flash("success","Welcome to Wanderlust you are successfully logged in!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logOut=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","You are succesfully logged out");
        res.redirect("/listings");
    })
};