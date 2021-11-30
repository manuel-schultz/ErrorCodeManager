const { app, BrowserWindow, Menu } = require( 'electron' );
const remote                       = require( 'electron' ).remote;
const url                          = require( 'url' );
const fs                           = require( 'fs' );
const path                         = require( 'path' );

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

app.on("ready", newApp);
