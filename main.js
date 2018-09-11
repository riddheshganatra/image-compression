const {app, BrowserWindow, ipcMain } = require('electron')
let win;
let images = [];
const fs = require('fs');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGiflossy = require('imagemin-giflossy');

function createWindow(){
    console.log("window create start")
    win = new BrowserWindow({
        width: 600,
        height: 600,
        backgroundColor: '#ffffff',
        icon: `file://${__dirname}/dist/assets/logo.png`
    })

    win.loadURL(`file://${__dirname}/dist/index.html`)

    win.on('closed', function(){
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function (){
    if(process.platform !== 'darwin'){
        app.quit()
    }
})

app.on('activate', function () {
    if(win === null){
        createWindow()
    }
})

ipcMain.on('find-images-to-compress', async function (event,path) {
    images = [];
    let filestructureTemp = traverseFileSystem(path, path.split('/').pop());
    // console.log(filestructureTemp)
    findImages(filestructureTemp)
    // console.log(filestructureTemp)
    // images = images.filter(i => i.path.indexOf('.gif') === -1)
    for(let j=0;j<images.length; j++){
        try{
            
            // await tinify.fromFile(images[j]).toFile(images[j]);
            // console.log(images[j].path);
            const outPath = images[j].path.substr(0, images[j].path.lastIndexOf("/"));
            if(images[j].path.indexOf('.gif') === -1){
                await imagemin([images[j].path],outPath , {
                    plugins: [
                        imageminMozjpeg(),
                        imageminPngquant({quality: '65-80'})
                    ]
                });
            }else{
                await imagemin([images[j].path], outPath, {use: [imageminGiflossy({lossy: 80})]})
            }
            

            images[j].newSize = fs.statSync(images[j].path).size / 1000000.0;

        }catch(e){
            
            console.log(j +" url error"+ images[j].path);
        }
        
        // console.log(j +" url "+ images[j]);
        
    }
    // console.log(images);
    event.returnValue = images;
});

function traverseFileSystem(currentPath, dirName) {
    
    var files = fs.readdirSync(currentPath);
    let obj = { name: dirName, type: 'folder', path: currentPath, childrens: [] }
    for (var i in files) {
        var currentFile = currentPath + '/' + files[i];
        var stats = fs.statSync(currentFile);
        if (stats.isFile()) {
            obj.childrens.push({ type: 'file', name: files[i], fullpath: currentFile })
        }
        else if (stats.isDirectory()) {
            obj.childrens.push({ type: 'folder', path: currentFile, name: files[i], childrens: traverseFileSystem(currentFile, files[i]).childrens });
        }
    }
    return obj
};

function findImages(currentNode) {
    var i,
        currentChild,
        result;

    if (currentNode.name.toLowerCase().indexOf('.png') > -1 || currentNode.name.toLowerCase().indexOf('.jpg') > -1 || currentNode.name.toLowerCase().indexOf('.gif') > -1) {
        images.push({path:currentNode.fullpath, size:fs.statSync(currentNode.fullpath).size / 1000000.0})
        // return currentNode;
    } else if (currentNode.childrens) {

        // Use a for loop instead of forEach to avoid nested functions
        // Otherwise "return" will not work properly
        for (i = 0; i < currentNode.childrens.length; i += 1) {
            currentChild = currentNode.childrens[i];

            // Search in the current child
            result = findImages(currentChild);

            // Return the result if the node has been found
            
        }

        // The node has not been found and we have no more options
        
    } 
}