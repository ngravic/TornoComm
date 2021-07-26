var express = require('express');
const SerialPort = require('serialport');
const ReadLine = SerialPort.parsers.Readline
var router = express.Router();

router.post('/send', function(req, res, next) {
  const serial = new SerialPort('/dev/ttyUSB0', {
    baudRate: parseInt(req.body['baud_rate']),
    parity: req.body['parity'],
    dataBits: parseInt(req.body['data_bits']),
    stopBits: parseInt(req.body['stop_bits']),
    rtscts: req.body['flow_control'] == "rts/cts",
    xany: req.body['flow_control'] == 'xon/off',
    xon: req.body['flow_control'] == 'xon/off',
    xoff:  req.body['flow_control'] == 'xon/off'
  }, (e)=> {
    if(e) {
      console.error(e)
      res.json({status: 'Error al conectar. Espere 10 segundos y vuelva a intentar', message: e})
    }
  })
  serial.on('open', ()=> {
    var timeout = setTimeout(() => {
      serial.drain(() => serial.close());
      res.json('Error al enviar datos. Timeout');
    }, req.body['file'].length / req.body['baud_rate'] * 1000)
    serial.write(req.body['file'], (err)=> {
      if(err) {
        console.error(e)
        res.json({status: 'Error al enviar', message: e })
      } else {
        res.json({ status: "OK", message: "Archivo enviado correctamente" })
      }
      clearTimeout(timeout);
      serial.close()
    })
  })
});

router.get('/receive', function(req, res, next) {
  const serial = new SerialPort('/dev/ttyUSB0', {
    baudRate: parseInt(req.query['baud_rate']),
    parity: req.query['parity'],
    dataBits: parseInt(req.query['data_bits']),
    stopBits: parseInt(req.query['stop_bits']),
    rtscts: req.query['flow_control'] == "rts/cts",
    xany: req.query['flow_control'] == 'xon/off',
    xon: req.query['flow_control'] == 'xon/off',
    xoff:  req.query['flow_control'] == 'xon/off'
  }, (e)=> {
    if(e) {
      console.error(e)
      res.json({status: 'Error al conectar. Espere 10 segundos y vuelva a intentar', message: e})
    }
  })
  serial.on('open', ()=> {
    var timeout = 0;
    const set_timeout = () => { timeout = setTimeout(() => {
      serial.flush(() => serial.close());
      res.json({status: 'Error al recibir datos. Timeout'});
    }, 10000) };
    set_timeout();
    var file_start_flag = false;
    var parser = new ReadLine();
    var buffer = [];
    serial.pipe(parser);
    parser.on('data', (data) => {
      clearTimeout(timeout);
      buffer.push(data);
      if (data == '%') {
        if(file_start_flag) {
          serial.flush();
          serial.close();
          res.send(buffer.join('\n'));
        } else {
          file_start_flag = true;
        }
      }
      set_timeout();
    });
  })
});

module.exports = router;
