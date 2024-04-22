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
  let datapath = dataPath();
  let version  = extract_form_data();

  if (!validate_version_object(version)) {
    return;
  }

  fs.readFile( path.join( datapath, 'apiversions.json' ), function( err, data ) {
    let versions = JSON.parse( data );

    if ( searchInJsonForIndex( versions.versions, 'version', version.version.toString() ) !== false ) {
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

function extract_form_data() {
  let version_release       = $('input#versionrelease').val();
  let version_number_object = extract_form_version_number();

  version = {
    "version": version_number_object['string'],
    "semantic": version_number_object['array'],
    "release": version_release,
    "documentation_url": $('input#version_documentation_url').val()
  };

  return version;
}

function validate_version_object(version) {
  var version_failures = [];
  if (version['version'] === '0.0.0') {
    version_failures.push('Version number');
  }

  if (version_failures.length !== 0) {
    for (let entry of version_failures) {
      version_failures[version_failures.indexOf(entry)] = '• ' + entry.capitalizeEveryWord();
    }

    remote.dialog.showMessageBoxSync({
      title: 'Error',
      message: 'Wrong data submitted!',
      type: 'error',
      detail: 'Following Fields don\'t have acceptable values:\n' + version_failures.join(',\n')
    });
    return false;
  } else {
    return true;
  }
}

function extract_form_version_number() {
  let datapath = dataPath();
  let semantic_array;
  let semantic_string;
  if (JSON.parse(fs.readFileSync(path.join(datapath, 'settings.json'), { encoding: 'utf8' })).settings.semantic) {
    semantic_array = (
      ($('input#versionnumber_semantic1').val() || '0') + '.' +
      ($('input#versionnumber_semantic2').val() || '0') + '.' +
      ($('input#versionnumber_semantic3').val() || '0')
    ).split('.');

    semantic_string = semantic_array.map(value => {
      return (value === undefined || value === null || value === '') ? 0 : value;
    }).join('.');
  } else {
    semantic_array = $('input#versionnumber').val().split('.');
    if (semantic_array == '') {
      semantic_array = [];
    }
    while (semantic_array.length < 3) {
      semantic_array.push('0');
    }
    semantic_string = semantic_array.join('.');
  }

  return {
    array: semantic_array,
    string: semantic_string
  }
}

function clear_all() {
  $( 'input#versionnumber'           ).val( '' );
  $( 'input#versionrelease'          ).val( '' );
  $( 'input#versionnumber_semantic1' ).val( '' );
  $( 'input#versionnumber_semantic2' ).val( '' );
  $( 'input#versionnumber_semantic3' ).val( '' );
  $( 'input#version_documentation_url' ).val( '' );
  $( 'button.error-type-button'      ).removeClass( 'active' );
}

function semanticversion_next(e, input) {
  if ( e.key === '.' && e.code === 'Period' ) {
    e.preventDefault();
    $( '#versionnumber_semantic' + ( $( input ).data( 'semanticnumber' ) + 1 ) ).focus();
  }
}
