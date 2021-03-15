var express = require('express');
const SerialPort = require('serialport');
var router = express.Router();

router.post('/send', function(req, res, next) {
  console.info({
    baudRate: req.body['baud_rate'],
    parity: req.body['parity'],
    dataBits: req.body['data_bits'],
    stopBits: req.body['stop_bits'],
    rtscts: req.body['flow_control'] == "rts/cts",
    xany: req.body['flow_control'] == 'xon/off',
    xon: req.body['flow_control'] == 'xon/off',
    xoff:  req.body['flow_control'] == 'xon/off'
  })  

  const serial = new SerialPort('/dev/ttyUSB0', {
    baudRate: req.body['baud_rate'],
    parity: req.body['parity'],
    dataBits: req.body['data_bits'],
    stopBits: req.body['stop_bits'],
    rtscts: req.body['flow_control'] == "rts/cts",
    xany: req.body['flow_control'] == 'xon/off',
    xon: req.body['flow_control'] == 'xon/off',
    xoff:  req.body['flow_control'] == 'xon/off'
  }, (e)=> {
    if(e) {
      console.error(e)
      res.json({status: 'Error al conectar', message: e})
    }
  })
  serial.on('open', ()=> {
    serial.write(req.body['file'], (err)=> {
      if(err) {
        console.error(e)
        res.json({status: 'Error al enviar', message: e })
      } else {
        res.json({ status: "OK", message: "Archivo enviado correctamente" })
      }
      serial.close()
    })
  })
});

module.exports = router;
