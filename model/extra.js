
let QRCode = require('qrcode');



module.exports =  getQrCode = async (code) =>{
    return new Promise((resolve , reject) => QRCode.toDataURL(code, function (err, url) {
        if(err) reject(new Error(err));
        resolve(url)
    })
)}    
