const { app, BrowserWindow, Menu } = require( 'electron' );
const remote                       = require( 'electron' ).remote;
const url                          = require( 'url' );
const fs                           = require( 'fs' );
const path                         = require( 'path' );
const remoteMain                   = require( '@electron/remote/main' );

remoteMain.initialize();

function newApp() {
  // set DataPath
  var datapath = path.join( app.getPath( 'userData' ), 'data' );
  fs.writeFile( path.join( path.resolve( __dirname, 'config' ), 'datapath.txt' ), datapath, function( err, data ) { } );
  // fs.writeFile( path.join( path.resolve( __dirname, 'config' ), 'apidokupath.txt' ), "https://kassa.at/offizielle-api/", function( err, data ) { } );

  if ( !fs.existsSync( path.join( app.getPath( 'userData' ), 'data' ) ) ) {
    fs.mkdirSync( datapath );
  }

  // create non-existing data-files
  if ( !fs.existsSync( path.join( datapath, 'apiversions.json' ) ) ) {
    let json = { "versions": [] }
    fs.writeFile( path.join( datapath, 'apiversions.json' ), JSON.stringify( json, null, '\t' ), function( err, data ) { } );
  }

  if ( !fs.existsSync( path.join( datapath, 'errorcodetypes.json' ) ) ) {
    let json = { "errorcodetypes": [] };
    fs.writeFile( path.join( datapath, 'errorcodetypes.json' ), JSON.stringify( json, null, '\t' ), function( err, data ) { } );
  }

  if ( !fs.existsSync( path.join( datapath, 'errors.json' ) ) ) {
    let json = { "errors": [] };
    fs.writeFile( path.join( datapath, 'errors.json' ), JSON.stringify( json, null, '\t' ), function( err, data ) { } );
  }

  const win = new BrowserWindow({
    width: 560,
    height: 940,
    icon: 'img/icon.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
    // frame: false //Remove frame to hide default menu
  });

  remoteMain.enable( win.webContents );

  win.loadURL(
    url.format({
      pathname: 'app/errorcodes/errorcode_create.html',
      slashes: true
    })
  );

  // Create the Menu
  createMenu( win );
}

function createMenu( win ) {
  let apiDokuPath = fs.readFileSync( path.join( path.resolve( __dirname, 'config' ), 'apidokupath.txt' ), { encoding:'utf8' } );
  var template = [
    {
      label: 'ErrorCodeManager',
      submenu: [
        {
          label: 'About ' + app.getName(),
          click() {
            openCustomAboutPanel( win );
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data',
          click() {
            exportAllData( win );
          }
        },
        {
          label: 'Import Data',
          click() {
            importAllData( win );
          }
        },
        {
          label: 'Clear Data',
          click() {
            clearData( win );
          }
        },
        { type: 'separator' },
        {
          label: 'Open API Doku',
          click() {
            require( 'electron' ).shell.openExternal( apiDokuPath );
          }
        },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Error Codes',
      submenu: [
        {
          label: 'Create',
          click() {
            changePage( win, 'app/errorcodes/errorcode_create.html' );
          }
        },
        {
          label: 'Show',
          click() {
            changePage( win, 'app/errorcodes/errorcode_index.html' );
          }
        }
      ]
    },
    {
      label: 'Error Code Types',
      submenu: [
        {
          label: 'Create',
          click() {
            changePage( win, 'app/errorcodetypes/errorcodetype_create.html' );
          }
        },
        {
          label: 'Show',
          click() {
            changePage( win, 'app/errorcodetypes/errorcodetype_index.html' );
          }
        }
      ]
    },
    {
      label: 'Versions',
      submenu: [
        {
          label: 'Create',
          click() {
            changePage( win, 'app/versions/version_create.html' );
          }
        },
        {
          label: 'Show',
          click() {
            changePage( win, 'app/versions/version_index.html' );
          }
        }
      ]
    }
  ]

  var menu = Menu.buildFromTemplate( template );
  Menu.setApplicationMenu( menu );
}

function changePage( win, filename ) {
  win.loadURL(
    url.format({
      pathname: filename,
      slashes: true
    })
  );
}

function exportAllData( window ) {
  let fileName = 'ErrorCodeManager-export-data--' + new Date().toISOString().replace('T', '--').replaceAll( ':', '-' ).split('.')[0] + '.json';
  let pathToSave = require( 'electron' ).dialog.showSaveDialogSync(
    window,
    {
      defaultPath: path.join( app.getPath( 'downloads' ), fileName ),
      filters: [
        { name: 'JSON-File', extensions: [ 'json' ] }
      ]
    }
  );

  if ( !pathToSave ) {
    return;
  }

  var files = [ 'apiversions', 'errorcodetypes', 'errors' ]
  let filejson = {};

  for ( let fileName of files ) {
    let fileContent = fs.readFileSync( path.join( path.join( app.getPath( 'userData' ), 'data' ), fileName + '.json' ), { encoding:'utf8' } );
    filejson[fileName] = JSON.parse( fileContent );
  }

  try {
    let exportFile = fs.writeFileSync( pathToSave, JSON.stringify( filejson, null, '\t' ), function( err, data ) { } );
  } catch {
    return;
  }

  let result = require( 'electron' ).dialog.showMessageBoxSync(
    window,
    {
      title: 'Success',
      type: 'info',
      message: 'Data was successfully exported!',
      buttons: [ 'Ok', 'Open Export' ],
      cancelId: -1
    }
  );

  if ( result === 1 ) {
    // { 'ESC': -1, 'X-Button': -1, 'OK': 0, 'Open Export': 1 }
    require( 'electron' ).shell.openExternal( path.dirname( pathToSave ) );
  }
}

function importAllData( window ) {
  var datapath = path.join( app.getPath( 'userData' ), 'data' );
  let mode = require( 'electron' ).dialog.showMessageBoxSync(
    window,
    {
      title: 'Warning',
      type: 'warning',
      message: 'Do you want to override your Data?',
      buttons: [ 'Cancel', 'Yes, override Data!', 'No, combine Data!' ],
      cancelId: -1
    }
  );

  if ( mode < 1 ) {
    // { 'ESC': -1, 'X-Button': -1, 'Cancel': 0, 'Yes, override Data!': 1, 'No, combine Data': 2 }
    return;
  }

  let fileToImport = require( 'electron' ).dialog.showOpenDialogSync(
    window,
    {
      defaultPath: app.getPath( 'downloads' ),
      filters: [
        { name: 'JSON-File', extensions: [ 'json' ] }
      ]
    }
  );

  if ( !fileToImport ) {
    return;
  }


  let fileContent = fs.readFileSync( fileToImport[0], { encoding:'utf8' } );
  fileContent = JSON.parse( fileContent );

  if ( mode === 1 ) {
    Object.keys( fileContent ).forEach( function( key ) {
      let json = fileContent[ key ];
      fs.writeFile( path.join( datapath, key + '.json' ), JSON.stringify( json, null, '\t' ), function( err, data ) { } );
    });
  } else if (mode === 2) {
    let filejsonnames       = { 'apiversions': 'versions', 'errorcodetypes': 'errorcodetypes', 'errors': 'errors' };
    let comparisonattribute = { 'apiversions': 'version', 'errorcodetypes': 'number', 'errors': 'error_code' };
    Object.keys( fileContent ).forEach( function( key ) {
      let json = fileContent[ key ];
      let current_filedata = JSON.parse( fs.readFileSync( path.join( datapath, key + '.json' ), 'utf8' ) );
      for ( let element of fileContent[ key ][ filejsonnames[ key ] ] ) {
        if ( searchInJsonForIndex( current_filedata[ filejsonnames[ key ] ], comparisonattribute[ key ], element[ comparisonattribute[ key ] ] ) === false ) {
          current_filedata[ filejsonnames[ key ] ].push( element )
        }
      }

      fs.writeFile( path.join( datapath, key + '.json' ), JSON.stringify( json, null, '\t' ), function( err, data ) { } );
    });
  }

  require( 'electron' ).dialog.showMessageBoxSync(
    window,
    {
      title: 'Success',
      type: 'info',
      message: 'Data was successfully imported!',
      buttons: [ 'Ok' ]
    }
  );
}

function clearData( window ) {
  let result = require( 'electron' ).dialog.showMessageBoxSync(
    window,
    {
      title: 'Warning',
      type: 'warning',
      message: 'Do you realy want to delete your Data?',
      buttons: [ 'Cancel', 'No!', 'Yes!' ],
      cancelId: -1,
      noLink: true
    }
  );

  if ( result === 2 ) {
    var datapath = path.join( app.getPath( 'userData' ), 'data' );
    fs.writeFile( path.join( datapath, 'apiversions.json' ), JSON.stringify( { "versions": [] }, null, '\t' ), function( err, data ) { } );
    fs.writeFile( path.join( datapath, 'errorcodetypes.json' ), JSON.stringify( { "errorcodetypes": [] }, null, '\t' ), function( err, data ) { } );
    fs.writeFile( path.join( datapath, 'errors.json' ), JSON.stringify( { "errors": [] }, null, '\t' ), function( err, data ) { } );
  } else {
    return;
  }

  require( 'electron' ).dialog.showMessageBoxSync(
    window,
    {
      title: 'Success',
      type: 'info',
      message: 'Data was successfully deleted!',
      buttons: [ 'Ok' ]
    }
  );
}

function openCustomAboutPanel( parent ) {
  var win = new BrowserWindow({
    width: 530,
    height: 770,
    resizable: false,
    title: 'About ' + app.getName(),
    icon: 'img/icon.png',
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    parent: parent,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  remoteMain.enable( win.webContents );
  win.loadFile( 'app/about/aboutwindow.html' );
}

// Thats not buenno to just copy paste the function from app.js!
// TODO: Find a way to call app.js' function instead!
function searchInJsonForIndex( json, property, value ) {
  for ( let i = 0; i <= json.length; i++ ) {
    if ( json.length === i ) {
      // if not existent in the json, return false
      return false;
    }
    if ( json[i][property] === value ) {
      return i;
    }
  }
}

app.on("ready", newApp);
