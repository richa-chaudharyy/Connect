import React, { useContext, useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';


const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("token");

    const { addToUserHistory } = useContext(AuthContext);

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    let [previewVideoOn, setPreviewVideoOn] = useState(true);

    let [previewAudioOn, setPreviewAudioOn] = useState(true);

    const showModalRef = useRef(false);

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    useEffect(() => {
        showModalRef.current = showModal;

        if (showModal) {
            setNewMessages(0);
        }
    }, [showModal]);

    useEffect(() => {
        console.log("HELLO")
        getPermissions();
    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {

        let hasVideo = false;
        let hasAudio = false;

        // Check camera separately
        try {
            const videoStream =
                await navigator.mediaDevices.getUserMedia({ video: true });

            hasVideo = true;
            setVideoAvailable(true);

            // Stop temporary permission-check stream
            videoStream.getTracks().forEach(track => track.stop());

            console.log("Video permission granted");

        } catch (error) {

            hasVideo = false;
            setVideoAvailable(false);

            console.log("Video permission denied", error);
        }


        // Check microphone separately
        try {
            const audioStream =
                await navigator.mediaDevices.getUserMedia({ audio: true });

            hasAudio = true;
            setAudioAvailable(true);

            // Stop temporary permission-check stream
            audioStream.getTracks().forEach(track => track.stop());

            console.log("Audio permission granted");

        } catch (error) {

            hasAudio = false;
            setAudioAvailable(false);

            console.log("Audio permission denied", error);
        }


        // Check screen sharing support
        if (navigator.mediaDevices.getDisplayMedia) {
            setScreenAvailable(true);
        } else {
            setScreenAvailable(false);
        }


        // Start actual camera/microphone stream
        if (hasVideo || hasAudio) {
            try {

                const userMediaStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: hasVideo,
                        audio: hasAudio
                    });

                window.localStream = userMediaStream;

                if (localVideoref.current) {
                    localVideoref.current.srcObject = userMediaStream;
                }

            } catch (error) {
                console.log("Could not start media:", error);
            }
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio])

    let getMedia = () => {
        setVideo(previewVideoOn && videoAvailable);
        setAudio(previewAudioOn && audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url)

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            const meetingCode = window.location.pathname.substring(1);
            socketRef.current.emit('join-call', meetingCode);
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }

    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/home"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {

        setMessages((prevMessages) => [
            ...prevMessages,
            {
                sender: sender,
                data: data
            }
        ]);

        if (
            socketIdSender !== socketIdRef.current &&
            !showModalRef.current
        ) {

            setNewMessages(
                (prevNewMessages) => prevNewMessages + 1
            );

        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    let connect = async () => {
        if (!username.trim()) {
            return;
        }

        setAskForUsername(false);

        if (localStorage.getItem("token")) {

            try {

                const meetingCode =
                    window.location.pathname.substring(1);

                await addToUserHistory(meetingCode);

            } catch (error) {

                console.log(error);

            }

        }

        getMedia();
    }


    const togglePreviewVideo = () => {

        const stream = localVideoref.current?.srcObject;

        if (stream) {

            const videoTrack = stream.getVideoTracks()[0];

            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setPreviewVideoOn(videoTrack.enabled);
            }

        }
    };


    const togglePreviewAudio = () => {

        const stream = localVideoref.current?.srcObject;

        if (stream) {

            const audioTrack = stream.getAudioTracks()[0];

            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setPreviewAudioOn(audioTrack.enabled);
            }

        }
    };

    const currentMeetingCode = window.location.pathname.substring(1);


    return (

        <div>

            {askForUsername === true ? (

                <div className={styles.lobbyPage}>


                    {/* Navbar */}

                    <nav className={styles.lobbyNavbar}>

                        <div
                            className={styles.lobbyBrand}
                            onClick={() => navigate("/")}
                        >

                            <img
                                src="/logo.png"
                                alt="Connect logo"
                            />

                            <h2>
                                Connect Video Caller
                            </h2>

                        </div>


                        <div className={styles.lobbyNavLinks}>

                            {isLoggedIn ? (

                                <>
                                    <div
                                        className={styles.lobbyNavItem}
                                        onClick={() => navigate("/home")}
                                    >
                                        <HomeRoundedIcon />

                                        <span>
                                            Home
                                        </span>
                                    </div>


                                    <div
                                        className={styles.lobbyNavItem}
                                        onClick={() => navigate("/history")}
                                    >
                                        <HistoryRoundedIcon />

                                        <span>
                                            History
                                        </span>
                                    </div>


                                    <button
                                        className={styles.lobbyLogout}
                                        onClick={() => {

                                            localStorage.removeItem("token");

                                            navigate("/");

                                        }}
                                    >
                                        Logout
                                    </button>
                                </>

                            ) : (

                                <>
                                    <button
                                        className={styles.lobbySimpleButton}
                                        onClick={() =>
                                            navigate("/auth", {
                                                state: {
                                                    formState: 0
                                                }
                                            })
                                        }
                                    >
                                        Login
                                    </button>


                                    <button
                                        className={styles.lobbyRegisterButton}
                                        onClick={() =>
                                            navigate("/auth", {
                                                state: {
                                                    formState: 1
                                                }
                                            })
                                        }
                                    >
                                        Register
                                    </button>
                                </>

                            )}

                        </div>

                    </nav>


                    {/* Main Lobby */}

                    <main className={styles.lobbyMain}>


                        {/* =========================
                            LEFT - CAMERA PREVIEW
                        ========================== */}

                        <section className={styles.previewCard}>


                            <div className={styles.previewHeading}>

                                <div className={styles.previewHeadingIcon}>
                                    <VideocamIcon />
                                </div>


                                <div>
                                    <h2>
                                        Camera Preview
                                    </h2>

                                    <p>
                                        Check your audio and video before joining
                                    </p>
                                </div>

                            </div>



                            <div className={styles.previewVideoBox}>

                                <video
                                    ref={localVideoref}
                                    autoPlay
                                    muted
                                />


                                <div className={styles.previewControls}>


                                    {/* Microphone */}

                                    <button
                                        type="button"
                                        onClick={togglePreviewAudio}
                                    >

                                        <span
                                            className={
                                                styles.previewControlIcon
                                            }
                                        >

                                            {previewAudioOn
                                                ? <MicIcon />
                                                : <MicOffIcon />
                                            }

                                        </span>


                                        <p>

                                            {previewAudioOn
                                                ? "Mute"
                                                : "Unmute"
                                            }

                                        </p>

                                    </button>



                                    {/* Camera */}

                                    <button
                                        type="button"
                                        onClick={togglePreviewVideo}
                                    >

                                        <span
                                            className={
                                                styles.previewControlIcon
                                            }
                                        >

                                            {previewVideoOn
                                                ? <VideocamIcon />
                                                : <VideocamOffIcon />
                                            }

                                        </span>


                                        <p>

                                            {previewVideoOn
                                                ? "Stop Video"
                                                : "Start Video"
                                            }

                                        </p>

                                    </button>


                                </div>

                            </div>



                            {/* Device Status */}

                            <div className={styles.deviceStatus}>

                                <span></span>

                                <p>

                                    {videoAvailable && audioAvailable
                                        ? "Camera and microphone are working properly"
                                        : "Please check your camera and microphone permissions"
                                    }

                                </p>

                            </div>

                        </section>



                        {/* =========================
                            RIGHT SIDE
                        ========================== */}

                        <section className={styles.lobbyRight}>


                            {/* Username + Connect */}

                            <div className={styles.lobbyFormArea}>


                                <div className={styles.lobbyTitle}>

                                    <h1>
                                        Enter into <span>Lobby</span>
                                    </h1>

                                    <p>
                                        Enter a username to join the meeting
                                    </p>

                                </div>



                                <div className={styles.usernameArea}>

                                    <label>

                                        <PersonOutlineRoundedIcon />

                                        Username

                                    </label>


                                    <input
                                        type="text"
                                        value={username}
                                        placeholder="Enter your username"
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        onKeyDown={(e) => {

                                            if (e.key === "Enter") {
                                                connect();
                                            }

                                        }}
                                    />

                                </div>



                                <button
                                    className={
                                        styles.connectLobbyButton
                                    }
                                    onClick={connect}
                                >

                                    <VideocamIcon />

                                    CONNECT

                                    <ArrowForwardRoundedIcon />

                                </button>

                            </div>



                            {/* =========================
                                QUICK TIPS
                            ========================== */}

                            <div className={styles.quickTips}>


                                <div className={styles.quickTipsTitle}>

                                    <LightbulbOutlinedIcon />

                                    <h3>
                                        Quick Tips
                                    </h3>

                                </div>



                                <div className={styles.tipCards}>


                                    {/* Tip 1 */}

                                    <div className={styles.tipCard}>

                                        <span className={styles.tipIcon}>
                                            <WbSunnyOutlinedIcon />
                                        </span>

                                        <p>
                                            Use good
                                            <br />
                                            lighting
                                        </p>

                                    </div>



                                    {/* Tip 2 */}

                                    <div className={styles.tipCard}>

                                        <span className={styles.tipIcon}>
                                            <MicIcon />
                                        </span>

                                        <p>
                                            Check your
                                            <br />
                                            audio
                                        </p>

                                    </div>



                                    {/* Tip 3 */}

                                    <div className={styles.tipCard}>

                                        <span className={styles.tipIcon}>
                                            <WifiRoundedIcon />
                                        </span>

                                        <p>
                                            Use a stable
                                            <br />
                                            internet connection
                                        </p>

                                    </div>



                                    {/* Tip 4 */}

                                    <div className={styles.tipCard}>

                                        <span className={styles.tipIcon}>
                                            <GroupsOutlinedIcon />
                                        </span>

                                        <p>
                                            Enter a unique
                                            <br />
                                            username
                                        </p>

                                    </div>


                                </div>

                            </div>

                        </section>

                    </main>

                </div>

            ) : (

                /* =========================
                   ACTUAL VIDEO MEETING
                   Your existing logic/UI
                ========================== */

                <div className={styles.meetingRoomPage}>


                    {/* =========================
                        TOP BAR
                    ========================== */}

                    <header className={styles.meetingTopbar}>

                        <div className={styles.meetingBrand}>

                            <img
                                src="/logo.png"
                                alt="Connect logo"
                            />

                            <h2>
                                Connect Video Caller
                            </h2>

                        </div>


                        <div className={styles.meetingTopInfo}>

                            <div className={styles.meetingCodePill}>

                                <VideocamIcon />

                                <span>
                                    {currentMeetingCode}
                                </span>

                            </div>


                            <div className={styles.participantPill}>

                                <GroupsOutlinedIcon />

                                <span>
                                    {videos.length + 1}
                                </span>

                            </div>

                        </div>

                    </header>



                    {/* =========================
                        MAIN MEETING AREA
                    ========================== */}

                    <div className={styles.meetingBody}>


                        {/* =========================
                            VIDEO AREA
                        ========================== */}

                        <section className={styles.videoStage}>


                            {/* Small live indicator */}

                            <div className={styles.liveMeetingBadge}>

                                <span></span>

                                Live Meeting

                            </div>



                            {/* No other user yet */}

                            {videos.length === 0 && (

                                <div className={styles.waitingMessage}>

                                    <GroupsOutlinedIcon />

                                    <h2>
                                        You're in the meeting
                                    </h2>

                                    <p>
                                        Waiting for others to join...
                                    </p>

                                </div>

                            )}



                            {/* Other Participants */}

                            <div className={styles.remoteVideoGrid}>

                                {videos.map((video, index) => (

                                    <div
                                        className={styles.remoteVideoCard}
                                        key={video.socketId}
                                    >

                                        <video
                                            className={styles.remoteVideo}
                                            data-socket={video.socketId}
                                            ref={(ref) => {

                                                if (ref && video.stream) {

                                                    ref.srcObject =
                                                        video.stream;

                                                }

                                            }}
                                            autoPlay
                                        >
                                        </video>


                                        <div className={styles.videoNameTag}>

                                            Participant {index + 1}

                                        </div>

                                    </div>

                                ))}

                            </div>



                            {/* Your own video */}

                            <div
                                className={
                                    videos.length === 0
                                        ? styles.localVideoSolo
                                        : styles.localVideoCard
                                }
                            >

                                <video
                                    ref={localVideoref}
                                    autoPlay
                                    muted
                                >
                                </video>


                                <div className={styles.localVideoLabel}>
                                    You
                                </div>

                            </div>



                            {/* =========================
                                BOTTOM CONTROLS
                            ========================== */}

                            <div className={styles.meetingBottomControls}>


                                {/* Microphone */}

                                <button
                                    className={styles.controlButton}
                                    onClick={handleAudio}
                                    type="button"
                                >

                                    <span>

                                        {audio === true
                                            ? <MicIcon />
                                            : <MicOffIcon />
                                        }

                                    </span>


                                    <p>

                                        {audio === true
                                            ? "Mute"
                                            : "Unmute"
                                        }

                                    </p>

                                </button>



                                {/* Video */}

                                <button
                                    className={styles.controlButton}
                                    onClick={handleVideo}
                                    type="button"
                                >

                                    <span>

                                        {video === true
                                            ? <VideocamIcon />
                                            : <VideocamOffIcon />
                                        }

                                    </span>


                                    <p>

                                        {video === true
                                            ? "Stop Video"
                                            : "Start Video"
                                        }

                                    </p>

                                </button>



                                {/* Screen Share */}

                                {screenAvailable === true && (

                                    <button
                                        className={styles.controlButton}
                                        onClick={handleScreen}
                                        type="button"
                                    >

                                        <span>

                                            {screen === true
                                                ? <StopScreenShareIcon />
                                                : <ScreenShareIcon />
                                            }

                                        </span>


                                        <p>

                                            {screen === true
                                                ? "Stop Share"
                                                : "Share"
                                            }

                                        </p>

                                    </button>

                                )}



                                {/* Chat */}

                                <Badge
                                    badgeContent={newMessages}
                                    max={99}
                                    color="primary"
                                >

                                    <button
                                        className={styles.controlButton}
                                        onClick={() => {
                                            if(showModal) {
                                                closeChat();
                                            } else {
                                                openChat();
                                            }
                                        }}
                                        type="button"
                                    >

                                        <span>
                                            <ChatIcon />
                                        </span>

                                        <p>
                                            Chat
                                        </p>

                                    </button>

                                </Badge>



                                {/* End Call */}

                                <button
                                    className={styles.endCallButton}
                                    onClick={handleEndCall}
                                    type="button"
                                >

                                    <span>
                                        <CallEndIcon />
                                    </span>

                                    <p>
                                        Leave
                                    </p>

                                </button>

                            </div>

                        </section>



                        {/* =========================
                            CHAT PANEL
                        ========================== */}

                        {showModal && (

                            <aside className={styles.meetingChatPanel}>


                                <div className={styles.chatHeader}>

                                    <div>

                                        <h2>
                                            Meeting Chat
                                        </h2>

                                        <p>
                                            Messages are visible to everyone
                                        </p>

                                    </div>


                                    <button
                                        className={styles.closeChatButton}
                                        onClick={closeChat}
                                        type="button"
                                    >

                                        ×

                                    </button>

                                </div>



                                {/* Messages */}

                                <div className={styles.chatMessages}>

                                    {messages.length !== 0 ? (

                                        messages.map(
                                            (item, index) => (

                                                <div
                                                    className={
                                                        styles.chatMessage
                                                    }
                                                    key={index}
                                                >

                                                    <div
                                                        className={
                                                            styles.chatAvatar
                                                        }
                                                    >

                                                        {item.sender
                                                            ?.charAt(0)
                                                            .toUpperCase()
                                                        }

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.chatMessageContent
                                                        }
                                                    >

                                                        <p
                                                            className={
                                                                styles.chatSender
                                                            }
                                                        >

                                                            {item.sender}

                                                        </p>


                                                        <p
                                                            className={
                                                                styles.chatText
                                                            }
                                                        >

                                                            {item.data}

                                                        </p>

                                                    </div>

                                                </div>

                                            )
                                        )

                                    ) : (

                                        <div className={styles.emptyChat}>

                                            <ChatIcon />

                                            <h3>
                                                No messages yet
                                            </h3>

                                            <p>
                                                Start the conversation.
                                            </p>

                                        </div>

                                    )}

                                </div>



                                {/* Chat Input */}

                                <div className={styles.chatInputArea}>

                                    <input
                                        type="text"
                                        value={message}
                                        placeholder="Type a message..."
                                        onChange={(e) =>
                                            setMessage(e.target.value)
                                        }
                                        onKeyDown={(e) => {

                                            if (
                                                e.key === "Enter" &&
                                                message.trim()
                                            ) {
                                                sendMessage();
                                            }

                                        }}
                                    />


                                    <button
                                        onClick={sendMessage}
                                        type="button"
                                    >

                                        Send

                                    </button>

                                </div>

                            </aside>

                        )}

                    </div>

                </div>

            )}

        </div>

    );
}