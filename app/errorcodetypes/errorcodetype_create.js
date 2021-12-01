const electron = require( 'electron' );
const remote   = require( '@electron/remote' );
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

  var errortype_failures = [];
  for ( let [key, value] of Object.entries(errortype)) {
    if ( !value && value !== parseInt( 0 ) ) {
      errortype_failures.push( key );
    }
  }

  if ( errortype_failures.length !== 0 ) {
    for ( let entry of errortype_failures ) {
      errortype_failures[ errortype_failures.indexOf( entry ) ] = '• ' + entry.capitalizeEveryWord()
    }

    remote.dialog.showMessageBoxSync({
      title: 'Error',
      message: 'Wrong data submitted!',
      type: 'error',
      detail: 'Following Fields don\'t have acceptable values:\n' + errortype_failures.join( ',\n' )
    });
    return;
  }

  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'errorcodetypes.json' ), function( err, data ) {
    let errortypes = JSON.parse( data );

    if ( searchInJsonForIndex( errortypes.errorcodetypes, 'number', parseInt( number ) ) !== false ) {
      remote.dialog.showMessageBoxSync({
        title: 'Error',
        message: 'Duplicated entry attribute!',
        type: 'error',
        detail: 'Choose another Number.'
      });
      return;
    }

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
