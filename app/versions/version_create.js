const electron = require( 'electron' );
const remote   = require( '@electron/remote' );
const {app}    = require( 'electron' );
const url      = require( 'url' );
const fs       = require( 'fs' );
const path     = require( 'path' );

$( document ).ready( function() {
  let datapath = dataPath();
});

function save_version() {
  let version_number  = $( 'input#versionnumber' ).val();
  let version_release = $( 'input#versionrelease' ).val();

  version = {
    "version": version_number,
    "release": version_release
  }

  var version_failures = [];
  for ( let [key, value] of Object.entries(version)) {
    if ( !value ) {
      version_failures.push( key );
    }
  }

  if ( version_failures.length !== 0 ) {
    for ( let entry of version_failures ) {
      version_failures[ version_failures.indexOf( entry ) ] = '• ' + entry.capitalizeEveryWord()
    }

    remote.dialog.showMessageBoxSync({
      title: 'Error',
      message: 'Wrong data submitted!',
      type: 'error',
      detail: 'Following Fields don\'t have acceptable values:\n' + version_failures.join( ',\n' )
    });
    return;
  }

  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'apiversions.json' ), function( err, data ) {
    let versions = JSON.parse( data );

    if ( searchInJsonForIndex( versions.versions, 'version', version_number.toString() ) !== false ) {
      remote.dialog.showMessageBoxSync({
        title: 'Error',
        message: 'Duplicated entry attribute!',
        type: 'error',
        detail: 'Choose another version number.'
      });
      return;
    }

    versions.versions.push( version );

    fs.writeFile( path.join( datapath, 'apiversions.json' ), JSON.stringify( versions, null, '\t' ), function( err, data ) {
      if ( err ) {
        return console.error( err );
      }
      clear_all();
    });
  });
}

function clear_all() {
  $( 'input#versionnumber'      ).val( '' );
  $( 'input#versionrelease'     ).val( '' );
  $( 'button.error-type-button' ).removeClass( 'active' );
}
