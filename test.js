
var QRCode = require('qrcode');

QRCode.toDataURL('IAPL1', function (err, url) {
    console.log(url)
  })