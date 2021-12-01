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
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Export Data',
          click() {
            exportAllData( win );
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

app.on("ready", newApp);
