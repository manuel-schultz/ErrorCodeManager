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
    choose_version_default( datapath );
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

function choose_version_default( datapath ) {
  let userPreferences = JSON.parse( fs.readFileSync( path.join( datapath, 'userpreferences.json' ), { encoding:'utf8' } ) ).preferences;
  if ( typeof userPreferences.usingVersion !== 'undefined' ) {
    $( '#introduced-in-version' ).val( userPreferences.usingVersion );
  }
}

function updateUserPreferencesUsingVersion( selectTag ) {
  let datapath = dataPath();
  let userPreferences = JSON.parse( fs.readFileSync( path.join( datapath, 'userpreferences.json' ), { encoding:'utf8' } ) )
  userPreferences.preferences.usingVersion = $( selectTag ).val();
  console.log( userPreferences );
  fs.writeFileSync( path.join( datapath, 'userpreferences.json' ), JSON.stringify( userPreferences, null, '\t' ), function( err, data ) { } );
}

function choose_error_type( btn ) {
  btn = $( btn );
  let error_prefix = btn.data( 'prefix' );
  $( 'input#error-code-prefix' ).val( error_prefix );
  $( 'button.error-type-button' ).removeClass( 'active' );
  btn.addClass( 'active' );

  let error_code = get_next_errorcode( error_prefix, btn.data( 'errorlength' ) );
  $( 'input#error-code' ).focus();
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

  var error_failures = [];
  for ( let [key, value] of Object.entries(error)) {
    if ( !value && value !== parseInt( 0 ) ) {
      if ( key === 'implemented' ) {
        error_failures.push( 'version' );
        continue;
      }
      error_failures.push( key );
    }
  }

  for ( let entry of ['prefix', 'suffix', 'error_code_str' ] ) {
    if ( error_failures.indexOf( entry ) > -1 ) {
      error_failures[ error_failures.indexOf( entry ) ] = 'error_code';
    }
  }

  if ( error_failures.length !== 0 ) {
    error_failures = error_failures.unique();
    for ( let entry of error_failures ) {
      error_failures[ error_failures.indexOf( entry ) ] = '• ' + entry.replace( '_', ' ' ).capitalizeEveryWord()
    }

    remote.dialog.showMessageBoxSync({
      title: 'Error',
      message: 'Wrong data submitted!',
      type: 'error',
      detail: 'Following Fields don\'t have acceptable values:\n' + error_failures.join( ',\n' )
    });
    return;
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

      remote.dialog.showMessageBox({
        title: 'Success',
        message: 'Data saved successfully!',
        type: 'info'
      });
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

function leadingZeros( input ) {
  if ( !isNaN( input.value ) ) {
    let requestedlength  = $( 'button.btn-default.error-type-button.active' ).data( 'errorlength' );
    let inputvalue       = input.value.toString();
    let inputvaluestring = '0'.repeat( requestedlength - inputvalue.length ) + inputvalue;

    input.value = inputvaluestring;
  }
}
