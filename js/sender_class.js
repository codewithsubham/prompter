let updateQueriesHistory = (data) => {

    // to update selected queries
    for (const iterator of data.messageIds) {
            document.querySelector(`input[type="checkbox"][id="${iterator}"]`).checked = false;
            document.querySelector(`label[id="${iterator}"]`).parentElement.classList.add("delete");
    }
}

let updateQueriesHistoryAll = () => {

    // to update all user sended query

    let data = [...document.querySelectorAll(`input[type="checkbox"]`)]
  
    for (const iterator of data) {
        iterator.checked = false;  
        document.querySelector(`label[id="${iterator.id}"]`).parentElement.classList.add("delete"); 
    }

}

let updateQueriesHistoryClearAll = () => {

    // to update all own and others queries
   
    let data = [...document.querySelectorAll('.inputGroup')];
  
    for (const iterator of data) {
       iterator.checked = false;
       iterator.style.background = "var(--deleted)";
       iterator.style.color = "white"
       iterator.style.textDecoration = "line-through"
    }

    updateQueriesHistoryAll();

}


let clearType = (data) => {
    
    if(data.self){
        if(data.type == "clear-all"){
       
            document.querySelector('.clear-notification').innerHTML = `Last screen was cleared by <span class="username">${data.username}</span>`
            updateQueriesHistoryClearAll();
            return;
        }
        if(data.id == userIdentifier){
            if(data.type == "delete"){
    
                updateQueriesHistory(data);
                return;
            }else if(data.type == "clear"){
                updateQueriesHistoryAll();
                return;
            }
        }
    
    }
   
}

let localUserQuery = (userIdentifier , checkedInputIds , data) => {
   let markup = `<div class="inputGroup hist_cont" style="float:right" >
                    <input id="${userIdentifier}${checkedInputIds}"   type="checkbox" value="${userIdentifier}${checkedInputIds}"/>
                        <label id="${userIdentifier}${checkedInputIds}"   for="${userIdentifier}${checkedInputIds}">
                            <span class="questions">${data.message}</span>
                            <div class='message_extra_details'>    
                                <span class="time">${new Date().toLocaleTimeString('en-IN')}</span>
                                <span class="${userIdentifier}${checkedInputIds}" style='font-size:1rem;'>&#10007;</span>
                            </div>
                        </label>
                          
                    </div>`;

    return markup;
}

let remoteUserQuery = (data) => {
    let markup = `<div class="inputGroup" style="float:left">
                      <div  class="hist_cont received-query" >
                        <div>
                            <span class="sender">${data.username}</span>
                        </div>
                        <span class="questions" >${data.message}</span>
                        <span class="time time-recevied">${new Date().toLocaleTimeString('en-IN')}</span>
                     </div>
                  </div>
   `;

   return markup;
}


let checkAcknowlegment = (data) => {


    if(userIdentifier == data.id){
     
        if(data.messageId){
            document.querySelector(`.${data.messageId}`).innerHTML = "&#10003;&#10003;"
        }
       
    }


}