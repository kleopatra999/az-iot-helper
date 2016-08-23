'use-strict';

var fs = require('fs');
var ssh2 = require('ssh2');

module.exports = function (config, sourceFileList, targetFileList, callback) {
  var conn = new ssh2();
  conn.on(
    'connect',
     function () {
        console.log( "- connected" );
      }
  );

  conn.on(
    'ready',
    function () {
      console.log( "- ready" );

      console.log( "-- transfer sample code to device" );
      conn.sftp(
        function (err, sftp) {
          if ( err ) {
            console.log( "--- SFTP error: %s", err );
            process.exit( 2 );
          }

          console.log( "--- SFTP started" );

          for(var i = 0; i < sourceFileList.length; i++)
          {
            // TODO:
            // If the target file list contain folder that doesn't exist in device, the upload will fail.
            // Will create the folder if it doesn't exist.
            
            // upload file
            var readStream = fs.createReadStream( sourceFileList[i] );
            var writeStream = sftp.createWriteStream( targetFileList[i] );

            // what to do when transfer finishes
            writeStream.on(
              'close',
              function () {
                console.log( "--- file transfered" );
                sftp.end();

                callback(function(){conn.end();});
              }
            );

            // initiate transfer of file
            readStream.pipe( writeStream );
          }
        }
      );
    }
  );

  conn.on(
    'error',
    function (err) {
      console.log( "- connection error: %s", err );
      process.exit( 1 );
    }
  );

  conn.on(
    'end',
    function () {
      console.log( "- end" );
      process.exit( 0 );
    }
  );

  conn.connect({
    "host": config.device_ip_address,
    "port": 22,
    "username": config.device_user_name,
    "password": config.device_password
  });
}