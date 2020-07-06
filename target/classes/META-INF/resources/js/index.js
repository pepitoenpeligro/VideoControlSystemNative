'use strict';

let localVideoStream    = null;
let videoCallButton     = null;
let endCallButton       = null;
let localVideo          = null;
let remoteVideo         = null;
let peerConn            = null;
let loginBtn            = null;
let sendBtn             = null;
let mesArea             = null;

let peerConnCfg = {
    'iceServers': [
        { 'urls': 'stun:stun.services.mozilla.com' },
        { 'urls': 'stun:stun.l.google.com:19302' }
    ]
};

window.addEventListener("load", pageReady);

let mainSocket = new WebSocket('wss://' + location.host +'/mainsocket');
let chatSocket = null;
let audio = new Audio('../sounds/callin.mp3');
let newmessageAudio = new Audio('../sounds/newmessage.mp3');


mainSocket.onopen=function(){
    console.log("[socket](onopen) OK");
}

mainSocket.onmessage = function(evt) {
    console.log("[socket](onmessage)");
    let signal = JSON.parse(evt.data);
    if (!peerConn) answerCall();

    console.log(signal);
    if (signal.sdp) {
        console.log("Received SDP from remote peer.");
        peerConn.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {

        }).catch(() => {console.error("[setRemoteDescription] error")});
    } else if (signal.candidate) {
        console.log("Received ICECandidate from remote peer.");
        peerConn.addIceCandidate(new RTCIceCandidate(signal.candidate))
            .catch(() => {console.error("[addIceCandidate] error")});
    } else if (signal.closeConnection) {
        console.log("Received 'close call' signal from remote peer.");
        endCall();
    }
}


function pageReady(){
    if(navigator.mediaDevices){
        console.log("NavigatorReady!");
        loginBtn = document.getElementById('loginbtn');
        loginBtn.addEventListener('click', () => {
            let username = document.getElementById('username').value;
            chatSocket = new WebSocket('wss://' + location.host + '/chat/' + username);

            chatSocket.onmessage = function(received){
                mesArea.value = mesArea.value + received.data + "\n";
                newmessageAudio.play();
            }

            chatSocket.onopen = function() {
                console.info("[chatSocket] open OK")
                loginBtn.disabled = true;
                sendBtn.disabled = false;
            }


            });
        sendBtn = document.getElementById('sendbtn');

        sendBtn.addEventListener('click', () => {

            let messageToSend = document.getElementById('msgtosend').value;
            chatSocket.send(messageToSend);
        });
        mesArea = document.getElementById('chat');
        videoCallButton = document.getElementById("videoCallButton");
        endCallButton = document.getElementById("endCallButton");
        localVideo = document.getElementById('localVideo');
        remoteVideo = document.getElementById('remoteVideo');
        videoCallButton.removeAttribute("disabled");
        videoCallButton.addEventListener("click", initiateCall);
        endCallButton.addEventListener("click", function() {
            let toSend = {
                type: 'close',
                data: {}
            };
            mainSocket.send(JSON.stringify(toSend));
            endCall();
            localVideo.srcObject.getTracks().forEach((track => track.stop()));
            remoteVideo.srcObject.getTracks().forEach((track => track.stop()));
        });

    }else{
        console.log("Navigator not Ready!");
    }
}

function prepareCall(){
    console.info("[prepareCall]");
    peerConn = new RTCPeerConnection(peerConnCfg);
    peerConn.onicecandidate = onIceCandidateHandler;
    peerConn.onaddstream = onAddStreamHandler;
}

function initiateCall() {
    console.info("[initiateCall]");
    if(!mainSocket){
        mainSocket = new WebSocket('wss://'+location.host+'/mainsocket');
    }
    audio.play().catch(() => console.error('error in playing audio'));
    prepareCall();
    // get the local stream, show it in the local video element and send it
    navigator.mediaDevices.getUserMedia({ "audio": true, "video": true }).then( (stream) => {

        localVideoStream = stream;
        localVideo.srcObject = localVideoStream;
        stream.getTracks().forEach(track => peerConn.addTrack(track, stream));
        createAndSendOffer();
    });
}

function answerCall() {
    console.info("[answerCall]");
    prepareCall();
    // get the local stream, show it in the local video element and send it
    navigator.mediaDevices.getUserMedia({ "audio": true, "video": true }).then((stream) => {

        localVideoStream = stream;
        localVideo.srcObject = localVideoStream;
        stream.getTracks().forEach(track => peerConn.addTrack(track, stream));
        createAndSendAnswer();
    });
}

function createAndSendOffer() {

    console.info("[createAndSendOffer]");
    peerConn.createOffer().then((offer) => {
        let off = new RTCSessionDescription(offer);
        peerConn.setLocalDescription(new RTCSessionDescription(off)).then(() =>{
            let toSend = {
                    type:'sdp',
                    data:{ "sdp": off }
            };
            mainSocket.send(JSON.stringify(toSend));
        }).catch(() => console.error("[setLocalDescription] createAndSendOffer> error"));
    });
}



function createAndSendAnswer() {
    console.info("[createAndSendAnswer]");
    peerConn.createAnswer().then((answer) => {
        let ans = new RTCSessionDescription(answer);

        peerConn.setLocalDescription(ans).then(() => {
            let toSend = {
                type: 'sdp',
                data: {"sdp": ans}
            };
            mainSocket.send(JSON.stringify(toSend));
        });
        audio.pause();
    });

}

function endCall() {
    console.info("[endCall]");
    peerConn.close();
    peerConn = null;
    videoCallButton.removeAttribute("disabled");
    endCallButton.setAttribute("disabled", true);

    localVideoStream.getTracks().forEach(function(track) {
        track.stop();
    });
    localVideo.src = "";
    remoteVideo.src = "";
    mainSocket = null;
}


function onIceCandidateHandler(evt) {
    if (!evt || !evt.candidate) return;

    let toSend = {
        type:'candidate',
        data: { "candidate": evt.candidate }
    }
    console.log("onIceCandidateHandler")
    mainSocket.send(JSON.stringify(toSend));
}

function onAddStreamHandler(evt) {
    audio.pause();
    console.log("onAddStreamHandler");
    videoCallButton.setAttribute("disabled", true);
    endCallButton.removeAttribute("disabled");
    // set remote video stream as source for remote video HTML5 element
    console.log("Adding remote stream to html5 component")
    remoteVideo.srcObject = evt.stream;
}