'use strict';

var fs = require('fs');
var ssh2 = require('ssh2');

var uploadFiles = function (config, sourceFileList, targetFileList, callback) {
  var finishedFileNumber = 0;
  var totalFileNumber = sourceFileList.length;

  var conn = new ssh2();
  conn.on(
    'connect',
     function(){}
  );

  conn.on(
    'ready',
    function () {
      conn.sftp(
        function (err, sftp) {
          if ( err ) {
            console.log( "--- SFTP error: %s", err );
            
            callback(err);
            return;
          }

          for(let i = 0; i < sourceFileList.length; i++)
          {
            // TODO:
            // If the target file list contain folder that doesn't exist in device, the upload will fail.
            // Will create the folder if it doesn't exist.
            
            // upload file
            var readStream = fs.createReadStream( sourceFileList[i] );
            var writeStream = sftp.createWriteStream( targetFileList[i] );

            var onClose = function(){
              console.log( "- file '" +  sourceFileList[i] + "' transferred" );
              if(++finishedFileNumber == totalFileNumber)
              {
                sftp.end();
                conn.end();
                
                if (callback){
                  callback();
                }
              }
            };
            
            // what to do when transfer finishes
            writeStream.on(
              'close',
              onClose
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
    }
  );

  conn.on(
    'end',
    function(){}
  );

  conn.connect({
    "host": config.device_ip_address,
    "port": 22,
    "username": config.device_user_name,
    "password": config.device_password
  });
}

module.exports.uploadFiles = uploadFiles;