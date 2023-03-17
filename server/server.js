// server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
const pty = require("node-pty");
const os = require("os");
// 不限制跨域
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
});

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

function nodeEnvBind() {
    //绑定当前系统 node 环境
    const term = pty.spawn(shell, ["--login"], {
        name: "xterm-color",
        cols: 800,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env,
    });
    return term;
}



// socket.io
var io = require('socket.io')(server, {
    path: '/socket.io',

});

// 防抖
function debounce(fn, delay) {
    let timer = null;
    return function () {
        let context = this;
        let args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    }
}

io.sockets.on('connection', function (socket) {

    const term = nodeEnvBind();
    socket.on('message', (data) => {
        term.write(data);
    });

    term.onData((data) => {
        console.log(data, 'socket🐱')
        socket.emit('message', data);
    });
});

// 4000端口
server.listen(4000, () => {
    console.log('server is running at 4000');
});