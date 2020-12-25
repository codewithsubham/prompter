var socket = io.connect(window.location.host , { query: {classCode , isUsernameAvailable}});





let showError = () => {
    let errorMarkup =`<div class="error" style="
background: #af1212;
color: white;
font-size: 1rem;
font-family: sans-serif;
text-align: center;
padding: .4rem 0;
text-transform:uppercase;
position:fixed;
width:100%;
left:0;
z-index:999;
">Internet down , unable to show new query</div>`;


if(!document.querySelector('.error')){
    document.querySelector('body').insertAdjacentHTML('afterbegin' , errorMarkup);
}

}

window.addEventListener("offline" , () => {
    
   showError();
})

window.addEventListener("online" , () => {
    
    document.querySelector('.error').remove();
})


setInterval(async () => {
    try{
        const response = await fetch("http://live.visionias.in:8080", {
            method: 'GET' // *GET, POST, PUT, DELETE, etc.
            });
        if(document.querySelector('.error')){

         document.querySelector('.error').remove();
        }
    }catch (error){
        console.log("asdasd");
       showError();
       
    }
} , 20000)




let colors = ['#F5A741' , '#2D6B60' , '#2084F6'];
let colorCounter = 0;


socket.on(classCode , (data) => {


  
    
    if(data.hasOwnProperty('self') || data.hasOwnProperty('isConnected')){
        return;
    }

    let datas = JSON.parse(JSON.stringify(data));
    
   

    ++colorCounter;

    if(colorCounter > 2){
        colorCounter = 0;
    }


    if(data.type == "delete"){

        for (const iterator of data.messageIds) {
            
             
            if(document.querySelector(`.${iterator}`)){
               document.querySelector(`.${iterator}`).remove();
            }
            
            
          }
          aknowledge(classCode , datas)    
          datas =  null;
        
        return;
    }



    if(data.type == "clear"){
        for(let i = document.querySelectorAll(`#${data.id}`).length-1 ; i >=0 ;i--){
            document.querySelector(`#${data.id}`).remove();
        };
        aknowledge(classCode , datas)    
        datas =  null;
      
        return;
    }

    if(data.type == "clear-all"){
        document.querySelector('body').innerHTML = "";
        aknowledge(classCode , datas)    
        datas =  null;
        return;
    }

    document.querySelector('body').insertAdjacentHTML("beforeend" , `<span class='query ${data.messageId}' id='${data.id}'  style='color:${colors[colorCounter]}'><div class="seperator" "></div> <div class="string" ><div class='username' style='background-color:${colors[colorCounter]}'>${data.username}</div>${data.message} </div> <br></span>`) ; //document.querySelector('body').innerHTML  + "<br>" +  data.message;

    // making a deep copy
    
    aknowledge(classCode , datas)    
    
    datas =  null;
})


function aknowledge(classCode , datas){
   
    delete datas.message;
    datas['self'] = isUsernameAvailable ? true : false;
    
    socket.emit(classCode, datas);

}