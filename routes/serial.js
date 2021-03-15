var express = require('express');
const SerialPort = require('serialport');
const ReadLine = SerialPort.parsers.Readline
var router = express.Router();

router.post('/send', function(req, res, next) {
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

router.get('/receive', function(req, res, next) {
  const serial = new SerialPort('/dev/ttyUSB0', {
    baudRate: req.query['baud_rate'],
    parity: req.query['parity'],
    dataBits: req.query['data_bits'],
    stopBits: req.query['stop_bits'],
    rtscts: req.query['flow_control'] == "rts/cts",
    xany: req.query['flow_control'] == 'xon/off',
    xon: req.query['flow_control'] == 'xon/off',
    xoff:  req.query['flow_control'] == 'xon/off'
  }, (e)=> {
    if(e) {
      console.error(e)
      res.json({status: 'Error al conectar', message: e})
    }
  })
  serial.on('open', ()=> {
    var file_start_flag = false;
    var parser = new ReadLine();
    var buffer = [];
    serial.pipe(parser);
    parser.on('data', (data) => {
      buffer.push(data);
      if (data == '%') {
        if(file_start_flag) {
          serial.close();
          res.send(buffer.join('\n'));
        } else {
          file_start_flag = true;
        }
      }
    });
  })
});

module.exports = router;
