/**
 * Created by ruiaohu on 27/05/2017.
 */
var socket = io();
serverCallBack();

function serverCallBack(){
    socket.on('updateClient', function (info) {
        updateGraphics(info);
    });

    socket.on('carNumber', function (info) {
        console.log(info.numCars);
    });
};