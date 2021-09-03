const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(devices);
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio: true,
        video: {facingMode: "user"}
    };
    const cameraConstrains = {
        audio: true,
        video: {
            deviceId: {
                exact: deviceId
            }
        }
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstrains : initialConstrains
        );
        console.log(myStream);
        myFace.srcObject = myStream;
        if(!deviceId) {
            await getCameras();
        }
        await getCameras();
    } catch (e) {
        console.log(e);
    }
}

function handleMuteClick() {
    console.log(myStream.getAudioTracks());
    myStream
        .getAudioTracks()
        .forEach((track) => track.enabled = !track.enabled);
    if (!muted) {
        muteBtn.innerText = "Unmute"
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick() {
    console.log(myStream.getVideoTracks());
    myStream
        .getVideoTracks()
        .forEach((track) => track.enabled = !track.enabled);
    if (cameraOff) {
        cameraBtn.innerText = "Turn camera off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "turn camera on";
        cameraOff = true
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value)
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


// welcome form (

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");


async function startMedia() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcome.querySelector("input");
    console.log(input.value);
    socket.emit("join_room", input.value, startMedia);
    roomName = input.value;
    input.value = "";

}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


socket.on("welcome", async () => {
    console.log("someone joined");
    const offer = await myPeerConnection.createOffer();
    await myPeerConnection.setLocalDescription(offer);
    console.log(offer);
    console.log("send offer")
    socket.emit("offer", offer, roomName);
})

// 비동기여서 myPeerConnection이 없음
socket.on("offer", offer => {
    console.log(offer);
    myPeerConnection.setRemoteDescription(offer);
})

// RTC Code
function makeConnection() {
    myPeerConnection = new RTCPeerConnection();
    console.log(myStream.getTracks())  // 오디오, 비디오 트랙이있음
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));

}