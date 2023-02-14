let APP_ID = '9696c2d812b04da687c223b78c470f25';

let token = null;
let uid = String(Math.floor(Math.random() * 10000))

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers:[
        {
            urls:['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}

let init = async () => {
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid, token})

    //http://127.0.0.1:5500/index.html
    channel = client.createChannel('main')
    await channel.join()

    channel.on('MemberJoined', handleUserJoined)

    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    document.getElementById('user-1').srcObject = localStream

    createOffer()
}

let handleUserJoined = async (MemberId) => {
    console.log('A new user joined the channel:', MemberId)
}

let createOffer = async () => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack()
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            console.log('New ICE candidate:', event.candidate)
        }
    }

    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
}

init()