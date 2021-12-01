const electron = require( 'electron' );
const remote   = require( 'electron' ).remote;
const {app}    = require( 'electron' );
const url      = require( 'url' );
const fs       = require( 'fs' );
const path     = require( 'path' );

$( document ).ready( function() {
  let datapath = dataPath();
});

function save_errorcode_type() {
  let number       = $( 'input#errorcodetype-number' ).val();
  let description  = $( 'input#errorcodetype-description' ).val();
  let prefix       = $( 'input#errorcodetype-prefix' ).val();
  let numberlength = $( 'input#errorcodetype-length' ).val();

  errortype = {
    "number": parseInt( number ),
    "description": description.toString(),
    "prefix": parseInt( prefix ),
    "length": parseInt( numberlength ),
  }

  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'errorcodetypes.json' ), function( err, data ) {
    let errortypes = JSON.parse( data );
    errortypes.errorcodetypes.push( errortype );

    fs.writeFile( path.join( datapath, 'errorcodetypes.json' ), JSON.stringify( errortypes, null, '\t' ), function( err, data ) {
      if ( err ) {
        return console.error( err );
      }
      clear_all();
    });
  });
}

function clear_all() {
  $( 'input#errorcodetype-number'      ).val( '' );
  $( 'input#errorcodetype-description' ).val( '' );
  $( 'input#errorcodetype-prefix'      ).val( '' );
  $( 'input#errorcodetype-length'      ).val( '' );
  $( 'button.error-type-button'        ).removeClass( 'active' );
}