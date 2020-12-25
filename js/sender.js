
const socket = io.connect(window.location.host , { query: `classCode=${classCode}`} , function(e){
    console.log('error')
});




const message = document.querySelector('#message');
const send = document.querySelector('#send');
const chatContianer = document.querySelector('.chat_conatiner');
const clear = document.querySelector('#clear');
const chathistory = document.querySelector('.sendtimeandquestion');
const cleartime = document.querySelector('.clearTime');
const clearAll = document.querySelector('.clear_all');
const deleteChat = document.querySelector(".delete");
const object = {};
               
let checkedInputIds = new Date().getTime();

socket.on(`${classCode}-closed`, function (err) {
    console.log(err);
});

let params = new URLSearchParams(location.search);
let timer; // holder of setinterval function;

let onScreenTimerValue = 200000000;

let uniqueId = () => {

    let uniqueIdString = "";
    let UniqueIdInlocalStorage = window.localStorage.getItem("uniqueId");
    
    if(UniqueIdInlocalStorage != undefined && UniqueIdInlocalStorage != null && UniqueIdInlocalStorage != ""){
     
        return  UniqueIdInlocalStorage;
    
    }

    let numberOfLoops =  Math.floor(Math.random()*10)+5;

    

    while(numberOfLoops >= 0){
        uniqueIdString = uniqueIdString + `${String.fromCharCode(Math.floor(Math.random()*(91 -65)) + 65)}`;
        --numberOfLoops;
    }

       // this line code generate number between 65 and 90 

    window.localStorage.setItem("uniqueId" , uniqueIdString);

    return uniqueIdString;
} 

let userIdentifier = uniqueId();


const globaldata = {

        'Textbox':'',
        'Senttext':''
        

}


const chatUpdateDetails = (domClassname , mapedname) => {

    // select the dom 
    domClassname = document.querySelector('.classname-text').innerHTML = domClassname;
    mappedName = document.querySelector('.mapedname').innerHTML = mapedname;




}
const clearTime = () => {

    if(globaldata.Textbox != '' ){
        const today = new Date();
        const time = `${today.getHours()}:${today.getMinutes()}` ;
       // document.querySelector('.clearedtime').innerHTML = time;
         globaldata.Textbox = '';
        }
     clearInterval(timer);
            

}

const ioSocket = () => {

        send.addEventListener('click' , () => {
            
            sendChat();
        });

        document.addEventListener('keypress', (e) => {
            if(e.keyCode == '13'){
                sendChat();
            
            }
        });

        clear.addEventListener('click' , () => {
            socket.emit(classCode, {

                message:'' ,
                type:'clear',
                id:userIdentifier,
                username:username,
            
                });
                message.value = "";
              
                return;
        })

        deleteChat.addEventListener('click' , () => {
            const messageIds = [...document.querySelectorAll('input:checked')].map(e => e.value);
            if(messageIds.length > 0){
                socket.emit(classCode, {
                    message:"",
                    type:"delete",
                    id:userIdentifier,
                    messageIds:messageIds,
                });
            }
        })

        clearAll.addEventListener('click' , (e) => {

            socket.emit(classCode, {

                message:'' ,
                type:'clear-all',
                id:userIdentifier,
                username:username
            });
                message.value = "";
               
        })

        const sendChat = () => {
            if(message.value != ''){
                   globaldata.Textbox = message.value.trim(); 
                    socket.emit(classCode, {
                    
                        message:message.value ,
                        test:'chat',
                        id:userIdentifier,
                        username:username,
                        messageId:`${userIdentifier}${checkedInputIds}`

              
                
                    });
             
                globaldata.Senttext = message.value.trim();

            }
        }   

    

        socket.on(classCode, (data) => {

            if(data.hasOwnProperty('isConnected')){
                document.querySelector('.classStatuslive').innerHTML = data.isConnected ? "Live" : "Offline";
                return;
            }
            
            // this function update query deleted status;
            clearType(data);

            let newdiv;

            if(data.message != ''){

                if(data.hasOwnProperty('self')){
                    if(data.self){
                        document.querySelector('.classStatuslive').innerHTML = "Live";
                        checkAcknowlegment(data);
                    }
                    return
                }

                chatContianer.innerHTML = `<span class='question'>ON SREEN </span>: <span class="question-data">${data.message}</span>`;
                    
                
                if(data.id == userIdentifier){
                    
                    newdiv = localUserQuery(userIdentifier , checkedInputIds, data);
                }else{
                    newdiv = remoteUserQuery(data);
                }

                
                chathistory.insertAdjacentHTML('afterbegin' , newdiv);  
                
                 
              

                
                checkedInputIds++;

            }

            if(document.querySelector('input[type="checkbox"]')){
                document.querySelector('input[type="checkbox"]').addEventListener('change' , (e) => {
                    if(object.hasOwnProperty(e.target.id) && !e.target.checked){
                        delete object[e.target.id];
                        return;   
                    }
                    object[e.target.id] = e.target.checked;
                 })
            }
            
        
        });

        
        


}



ioSocket();