let express=require("express");
let User=require("../models/User");
let passport=require("passport")
let router=express.Router();

function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next()
    }else{
        req.flash("info","You must be logged in to see the page.");
        res.redirect("/login")
    }
}
router.use(function (req,res,next) {
   res.locals.currentUser=req.user;
   res.locals.errors=req.flash("error");
   res.locals.infos=req.flash("info");
   next();
});
router.get("/edit",ensureAuthenticated,function (req,res) {
    res.render("edit")
});
router.post("/edit",ensureAuthenticated,function (req,res,next) {
   req.user.displayName=req.body.displayName;
   req.user.bio=req.body.bio;
   req.user.save(function (err) {
       if(err){
           next(err);
           return;
       }
       req.flash("info","Profile updated!");
       res.redirect("/edit");
   })
});
router.get("/users/:username",function (req,res,next) {
    User.findOne({username:req.params.username},function (err,user) {
        if(err){return next(err);}
        if(!user){
            return next(404)
        }
        res.render("prof",{user:user})
    })
});
router.get("/logout",function (req,res) {
   req.logout();
   res.redirect("/")
});
router.get("/login",function (req,res) {
    res.render("login")

});
router.post("/login",passport.authenticate("login",{
     successRedirect:"/",
    failureRedirect:"/login",
    failureFlash:true
}))
router.get("/signup",function (req,res) {
    res.render("signup")
});
router.post("/signup",function (req,res,next) {
    let username=req.body.username;
    let password=req.body.password;

    User.findOne({username:username},function (err,user) {
        if(err){
            return next(err);
        }
        if(user){
            req.flash("error","User already exists");
            return res.redirect("/signup")
        }
        let newUser=new User({
            password,
            username,
        });
        newUser.save(next);
    });
},passport.authenticate("login",{
    successRedirect:"/",
    failureRedirect:"/signup",
    failureFlash:true,
}));
router.get("/",function (req,res,next) {
    User.find()
        .exec(function (err,users) {
        if(err){
            return next(err)
        }
        res.render("index",{users:users})
    })
});
router.use(function (req,res) {
    res.redirect("/")
});
module.exports=router;