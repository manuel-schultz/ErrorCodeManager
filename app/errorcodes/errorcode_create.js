const electron          = require( 'electron' );
const remote            = require( '@electron/remote' );
const url               = require( 'url' );
const fs                = require( 'fs' );
const path              = require( 'path' );
const { BrowserWindow } = require( '@electron/remote' );

$( document ).ready( function() {
  let datapath = dataPath();

  create_version_select_options( datapath );
  create_error_type_buttons( datapath );
});

function create_version_select_options( datapath ) {
  fs.readFile( path.join( datapath, 'apiversions.json' ), function( err, data ) {
    if ( err ) {
      return console.error( err );
    }

    let apiversionjson = JSON.parse( data );
    // apiversionjson = sortApiversionjson( apiversionjson );
    $.each( apiversionjson.versions, function( index, version ) {
      $( '#introduced-in-version' ).append( new Option( version.version, version.version ) );
    });
  });
}

function create_error_type_buttons( datapath ) {
  fs.readFile( path.join( datapath, 'errorcodetypes.json' ), function( err, data ) {
    if ( err ) {
      return console.error( err );
    }

    let errorcodetypes = JSON.parse( data );
    $.each( errorcodetypes.errorcodetypes, function( index, errortype ) {
      $( 'div.type-button-space' ).append(
        "<button class='btn-default error-type-button' data-prefix='" + errortype.prefix + "' data-errorlength='" + errortype.length + "' onclick='choose_error_type( this )'><span>" + errortype.number + "</span><span class='smaller-text'>" + errortype.description + "</span></button>"
      );
    });
  });
}

function choose_error_type( btn ) {
  btn = $( btn );
  let error_prefix = btn.data( 'prefix' );
  $( 'input#error-code-prefix' ).val( error_prefix );
  $( 'button.error-type-button' ).removeClass( 'active' );
  btn.addClass( 'active' );

  let error_code = get_next_errorcode( error_prefix, btn.data( 'errorlength' ) );
}

function get_next_errorcode( error_prefix, error_length ) {
  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'errors.json' ), function( err, data ) {
    if ( err ) {
      console.error( err );
      $( 'input#error-code' ).val( '000000000000'.substr( error_length * -1 ) );
      return 000;
    }
    let errors = JSON.parse( data );
    errors = $(errors.errors).filter( function ( index, error ) {
      return error.prefix === error_prefix;
    });
    errors = sortJson( errors, 'suffix', false )

    error = errors[0]
    if ( typeof error === 'undefined' ) {
      $( 'input#error-code' ).val( '000000000000'.substr( error_length * -1 ) );
      return;
    }
    error = error.suffix + 1;
    error = ('000000000000' + error).substr( error_length * -1 )
    $( 'input#error-code' ).val( error )
  });
}

function sortJson( json, property, asc ) {
  json.sort( function( a, b ) {
      if ( asc ) {
          return ( a[property] > b[property] ) ? 1 : ( ( a[property] < b[property] ) ? -1 : 0 );
      } else {
          return ( b[property] > a[property] ) ? 1 : ( ( b[property] < a[property] ) ? -1 : 0 );
      }
  });
  return json;
}

function save_error_code() {
  let error_prefix  = $( 'input#error-code-prefix' ).val();
  let error_suffix  = $( 'input#error-code' ).val();
  let error_code    = error_prefix + $( 'input#error-code' ).val();
  let intro_version = $( 'select#introduced-in-version' ).val();
  let title         = $( 'input#errorcode-title' ).val();
  let description   = $( 'input#errorcode-description' ).val();

  error = {
    "prefix": parseInt( error_prefix ),
    "suffix": parseInt( error_suffix ),
    "error_code": parseInt( error_code ),
    "error_code_str": error_code.toString(),
    "title": title,
    "description": description,
    "implemented": intro_version
  }

  let datapath = dataPath();
  fs.readFile( path.join( datapath, 'errors.json' ), function( err, data ) {
    let errors = JSON.parse( data );

    if ( searchInJsonForIndex( errors.errors, 'error_code', parseInt( error_code ) ) ) {
      remote.dialog.showMessageBoxSync({
        title: 'Error',
        message: 'Duplicated entry attribute!',
        type: 'error',
        detail: 'Choose another Error Code'
      });
      return;
    }

    errors.errors.push(error);


    fs.writeFile( path.join( datapath, 'errors.json' ), JSON.stringify( errors, null, '\t' ), function( err, data ) {
      if ( err ) {
        return console.error( err );
      }
      clear_all();
    });
  });
}

function clear_all() {
  $( 'input#error-code-prefix'     ).val( '' );
  $( 'input#error-code'            ).val( '' );
  $( 'input#errorcode-title'       ).val( '' );
  $( 'input#errorcode-description' ).val( '' );
  $( 'button.error-type-button'    ).removeClass( 'active' );
}
