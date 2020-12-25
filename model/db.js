let mysql = require('mysql');
const { promiseImpl } = require('ejs');

 class db{
    
    constructor(){
        this.conn = mysql.createConnection({
            host:"localhost",
            user:"root",
            password:"",
            database:"login_system"
        })    

        this.conn.connect((err) => {
            if(err) throw err;
        })
    }

    async deleteReceiveQuery(name , data){

        return new Promise((resolve , reject) => {

            this.conn.query(`DELETE FROM queryarchieve WHERE name='${name}' AND messageId='${data.messageId}'` , (err , result) => {
                if(err) reject(err);
                resolve(result);
            });

        })
    };

    async retriveQuery(name){
        return new Promise((resolve , reject) => {

            this.conn.query(`SELECT * FROM queryarchieve WHERE name='${name}'` , (err , result) => {

                if(err) reject(err);

                resolve(result);

            })

        })

    }  ;  
   
    async storeQuery(name , data){

        //queryarchieve
    
        if(data.hasOwnProperty('self')) return;
        

        return new Promise ((resolve , reject) => this.conn.query(`INSERT INTO queryarchieve (name, message, id, username, messageid)
        VALUES ('${name}', '${data.message.trim()}', '${data.id}', '${data.username}', '${data.messageId}')` , (err , result) =>{

            if(err) reject(new Error(err));
            resolve(result);

        })
        )

    }

   async getUserdetails(loginformdata){


        return new Promise ((resolve , reject) => this.conn.query(`SELECT * FROM system_users WHERE username = '${loginformdata.username}'` , (err , result) =>{

            if(err) reject(new Error(err));
            resolve(result);

              })
        )}
    
    async getClassRooms(){
        return new Promise((resolve , reject) => this.conn.query(`SELECT * FROM classes_status` ,  (err, result) => {
            if(err) reject(new Error(err));
            
            resolve(result);
        })

        )}         

}

module.exports = db;