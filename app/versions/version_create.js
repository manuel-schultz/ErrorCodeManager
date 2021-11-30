const electron = require( 'electron' );
const remote   = require( 'electron' ).remote;
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

  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'apiversions.json' ), function( err, data ) {
    let versions = JSON.parse( data );
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
