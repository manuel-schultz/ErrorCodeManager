const electron = require( 'electron' );
const remote   = require( '@electron/remote' );
const {app}    = require( 'electron' );
const url      = require( 'url' );
const fs       = require( 'fs' );
const path     = require( 'path' );

$( document ).ready( function() {
  let datapath = dataPath();

  // Decide if Semantic
  let semantic = JSON.parse( fs.readFileSync( path.join( datapath, 'settings.json' ), { encoding:'utf8' } ) ).settings.semantic
  if ( semantic ) {
    $( '#versionnumber-wrap' ).css( 'display', 'none' );
  } else {
    $( '#versionnumber-wrap-semantic' ).css( 'display', 'none' );
  }
});

function save_version() {
  let datapath        = dataPath();
  let version_release = $( 'input#versionrelease' ).val();

  if ( JSON.parse( fs.readFileSync( path.join( datapath, 'settings.json' ), { encoding:'utf8' } ) ).settings.semantic ) {
    var version_number = $( 'input#versionnumber_semantic1' ).val() + '.' + $( 'input#versionnumber_semantic2' ).val() + '.' + $( 'input#versionnumber_semantic3' ).val();
    var semantic = [ $( 'input#versionnumber_semantic1' ).val(), $( 'input#versionnumber_semantic2' ).val(), $( 'input#versionnumber_semantic3' ).val() ];
  } else {
    var version_number  = $( 'input#versionnumber' ).val();
    var semantic = null;
  }

  version = {
    "version": version_number,
    "semantic": semantic,
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

      remote.dialog.showMessageBox({
        title: 'Success',
        message: 'Data saved successfully!',
        type: 'info'
      });
    });
  });
}

function clear_all() {
  $( 'input#versionnumber'           ).val( '' );
  $( 'input#versionrelease'          ).val( '' );
  $( 'input#versionnumber_semantic1' ).val( '' );
  $( 'input#versionnumber_semantic2' ).val( '' );
  $( 'input#versionnumber_semantic3' ).val( '' );
  $( 'button.error-type-button'      ).removeClass( 'active' );
}

function semanticversion_next(e, input) {
  if ( e.key === '.' && e.code === 'Period' ) {
    e.preventDefault();
    $( '#versionnumber_semantic' + ( $( input ).data( 'semanticnumber' ) + 1 ) ).focus();
  }
}
