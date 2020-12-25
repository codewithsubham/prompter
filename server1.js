const express = require("express");
const db = require("./model/db");
const schedule = require('node-schedule');

const getQrCode = require("./model/extra");
const session = require("express-session")({
    name:'sid',
    secret: 'secret@123',
    resave: false,
    saveUninitialized: false,
    cookie: {
         secure: false ,
         maxAge:1000 * 60 * 60 * 4
    },
});




const app = express();
const fs = require('fs');
const socket = require('socket.io');

const path =  require('path');
var crypto = require('crypto');
const e = require("express");

let ActiveClass = [];
let PrompterManager = {};

let port = process.env.PORT || 8080;
app.set("view engine" , 'ejs');
app.set('views', path.join(__dirname, '/'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


let Mysql = new db();

app.use(session);

app.use(express.static(__dirname + "/css/"));
app.use(express.static(__dirname + "/img/"));
app.use(express.static(__dirname + "/js/"))



let server = app.listen(port ,"0.0.0.0" ,() => console.log(`server started at ${port}`));

const adminsocket = socket(server);


adminsocket.use(sharedsession(session)); 
// redirect functions


let  scheduler = schedule.scheduleJob('0 0 0 * * *', function(){

    for(x in PrompterManager){
        delete PrompterManager[x];
    }

    ActiveClass.length = 0;
})


const redirectLogin = (req , res , next) => {
    if(!req.session.userName){
        res.redirect('/login');
    }else{
        next();
    }
}



const redirectMain = (req , res,  next) => {
    
    if(req.session.userName){
        res.redirect("/");
    }else{
        next();
    }
}

const redirectClass = (req , res , next) => {

    if(req.session.classCode){
        res.redirect("/classname")
    }else{
        next();
    }


}


adminsocket.on('connection' , (socket) => {
        let name = socket.handshake.query.classCode;
        
        if(socket.handshake.query.isUsernameAvailable){
            adminsocket.emit(name , {isConnected:true});
            if(ActiveClass.indexOf(name) == -1){
                ActiveClass.push(name);
            }
        }


        socket.on(name , (data) => {
            adminsocket.sockets.emit(name , data);
        });
      

        socket.on('disconnect', function () {
            if(socket.handshake.query.isUsernameAvailable){
                adminsocket.emit(name , {isConnected:false});
                if(ActiveClass.indexOf(name) != -1){
                    ActiveClass.pop(name);
                }
            }
        });

         
});



app.post("/queryrecever" ,  (req , res) => {
    let data = JSON.parse(req.body.maped_class_data);
    //req.session.activatedclass = data.qrcodeValue;
    //req.session.activatedclassUser = data.username;

    
    adminsocket.sockets.emit(data.qrcodeValue , {"isConnected":true , "className":data.qr_code});

    res.render(path.join(__dirname , '/view/receiver'), {classCode:data.qrcodeValue , isClassRoom:data.username});
    
})


app.post("/activatePrompterQr" , (req , res) => {

    let data = JSON.parse(req.body.data);

    if(PrompterManager.hasOwnProperty(data.qrcodeValue)){
        if(data.username == PrompterManager[data.qrcodeValue].username){
           if(ActiveClass.indexOf(data.qrcodeValue) != -1){
                res.status(401).send("you are using it already please close propter first");
                return;
           }else{

                adminsocket.sockets.emit(data.qrcodePageId , data);
                res.status(401).send("re opened");
                return;
           }       
        }else{
            res.status(401).send("already in use by" +  PrompterManager[data.qrcodeValue].username);
            return;
        }
    }

    
    PrompterManager[data.qrcodeValue] = data;

    adminsocket.sockets.emit(data.qrcodePageId , data);
    res.status(200).send(data)
})


app.post("/deleteManagedClass" , (req , res) => {   
    let data = JSON.parse(req.body.data);
    delete PrompterManager[data.qrcodeValue];    

    res.status(200).send(`${data.qrcodeValue}  deleted`);


})

app.post('/loginfromapp'  ,  async (req,res) => {

   
    let  {username , password} = JSON.parse(req.body.data);

        let isUserAvailable = await Mysql.getUserdetails({username:username});

        if(isUserAvailable.length > 0){ 

            if(isUserAvailable[0].usertype == 'manager'){
                    password = crypto.createHash("sha1").update(password).digest("hex")

                    let isAuthenticated  =   isUserAvailable[0].username === username && isUserAvailable[0].password.toLowerCase() === password


                    if(isAuthenticated){

                          res.status(200).send({name:isUserAvailable[0].Name , userName:isUserAvailable[0].username});

                    }else{

                         res.status(401).send("incorrect password");
                         return;
                    }
            }else{
                res.status(401).send("you are not authorized");
                return;
            }

            

        }else{
            
            res.status(401).send("incorrect username");
            return;
           }
       
    
   
})

app.get('/retriveAllManagedClasses', (req , res) => {

    let ActivateClasses = [];

    for(let x in PrompterManager){
        ActivateClasses.push(PrompterManager[x])
    }
    
    res.status(200).send(ActivateClasses);
     
})





/// above route are for app
app.get("/queryreceiver/:class" , (req , res) =>  {

    res.render(path.join(__dirname , '/view/receiver') , {classCode:req.params.class , isClassRoom:""});
   // res.send(req.params.class);
})    

app.get("/view" , async (req , res) =>{

    let classRoomlist = await Mysql.getClassRooms();
    // adding qrcode to classRoomlist 



    
    for(classDetails of classRoomlist){
        classDetails['qr_code'] = await getQrCode(`${classDetails['maped_name']}|${req.sessionID}`);
    }
    
    

    req.sessionStore.all(async (err , sessions ) => {

        for(let x in sessions){
            
            for(let y of classRoomlist){
                if(y['maped_name'] === sessions[x].classCode){
                    y['username'] = `${y['username']}  <p>${sessions[x].userName}</p>`; 
                 
                    y['status'] = "LIVE";
                }
                //    if(x['maped_name'] === ses);
            }
        }



        res.render(path.join(__dirname , '/view/viewerdash'), {data:classRoomlist , pageId:req.sessionID})
  
     });
     

})

app.get('/classname' ,/*redirectLogin, */ (req , res) => {

    let classStatus;
    if(ActiveClass.indexOf(req.session.classCode)  > -1){
         classStatus = "Live";   
    }else{
        classStatus = "Offline";
    }    
    res.render(path.join(__dirname , '/view/sender')  , { data:req.session.classCode , username:req.session.name , classStatus})
})

app.post('/classname'  ,  (req , res) => {
    if(req.body.class){
        req.session.classCode = req.body.class;
        res.redirect("/classname");
    }else{
        res.redirect("/");
    }
    
   
})




app.get('/login' ,redirectMain ,  (req , res) => {

    res.render(path.join(__dirname , '/login') , {error:""}) ;

});

app.post("/login"  , async  (req , res)=>{

    let  {username , password} = req.body;

    if(username && password){
        
        let isUserAvailable = await Mysql.getUserdetails({username:username});

        if(isUserAvailable.length > 0){ 

            password = crypto.createHash("sha1").update(password).digest("hex")

            let isAuthenticated  =   isUserAvailable[0].username === username && isUserAvailable[0].password.toLowerCase() === password
            

            if(isAuthenticated){
                req.session.userName = isUserAvailable[0].username;
                req.session.name = isUserAvailable[0].Name;
            }else{
                res.render(path.join(__dirname , '/login') , {error:"incorrect password"});
                return;
            }

        }else{
            res.render(path.join(__dirname , '/login') , {error:"incorrect username"});
            return;
           }
       
    }else{
        res.render(path.join(__dirname , '/login') , {error:"please provide both username and password"});
        return;
        
    }
   res.redirect("/");

})

app.post("/logout" , redirectLogin , (req , res)=>{

    req.session.destroy(err => {
        if(err){
            return res.redirect('/');
        }
    });
    res.clearCookie("sid");
    res.redirect("/");

})

app.get("/" , redirectLogin , redirectClass, async (req, res) => {
   
    let classRoomlist = await Mysql.getClassRooms();
    classRoomlist = JSON.parse(JSON.stringify(classRoomlist));

    req.sessionStore.all((err , sessions ) => {
        for(let x in sessions){
            for(let y of classRoomlist){

                if(y['maped_name'] === sessions[x].classCode){
                    y['username'] = `${y['username']}  <p>${sessions[x].userName}</p>`; 
                 
                    y['status'] = "LIVE";
                }
                //    if(x['maped_name'] === ses);
            }
        }

        res.render(path.join(__dirname , '/view/classes'), {data:classRoomlist} )
  
     });
     

  
    
  //  console.log(JSON.parse(JSON.stringify(classRoomlist[0])));
    
    
})





app.get('*', function(req, res){
    res.status(404).send('what???');
  });




