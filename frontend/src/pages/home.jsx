import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";

import RestoreIcon from '@mui/icons-material/Restore';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import HighQualityOutlinedIcon from '@mui/icons-material/HighQualityOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

import { AuthContext } from '../contexts/AuthContext';


function HomeComponent() {

    const navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");


    const handleJoinVideoCall = () => {

        if (!meetingCode.trim()) {
            return;
        }

        navigate(`/${meetingCode}`);
    };


    return (

        <div className="homePage">

            {/* Navbar */}

            <div className="homeNavbar">

                <div
                    className="homeBrand"
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


                <div className="homeNavRight">

                    <div
                        className="historyButton"
                        onClick={() => navigate("/history")}
                    >

                        <RestoreIcon />

                        <span>
                            History
                        </span>

                    </div>


                    <button
                        className="logoutButton"
                        onClick={() => {

                            localStorage.removeItem("token");

                            navigate("/");

                        }}
                    >

                        Logout

                    </button>

                </div>

            </div>



            {/* Hero Section */}

            <div
                className="homeHero"
                style={{
                    backgroundImage:
                        "url('/homePage/home_background.png')"
                }}
            >

                <div className="homeHeroLeft">


                    {/* Small top badge */}

                    <div className="homeBadge">

                        <VideocamRoundedIcon />

                        <span>
                            Connect
                            &nbsp; • &nbsp;
                            Collaborate
                            &nbsp; • &nbsp;
                            Communicate
                        </span>

                    </div>



                    {/* Heading */}

                    <h1>

                        Join a

                        <span>
                            {" "}Meeting
                        </span>

                    </h1>


                    <p className="homeDescription">

                        Enter the meeting code shared by your host
                        and join the conversation instantly.

                    </p>



                    {/* Meeting input */}

                    <div className="meetingJoinBox">

                        <div className="meetingInput">

                            <LinkRoundedIcon />

                            <input
                                type="text"
                                placeholder="Enter Meeting Code"
                                value={meetingCode}
                                onChange={(e) =>
                                    setMeetingCode(e.target.value)
                                }
                                onKeyDown={(e) => {

                                    if (e.key === "Enter") {
                                        handleJoinVideoCall();
                                    }

                                }}
                            />

                        </div>


                        <button
                            className="joinMeetingButton"
                            onClick={handleJoinVideoCall}
                        >

                            JOIN

                            <ArrowForwardRoundedIcon />

                        </button>

                    </div>



                    {/* Small bottom features */}

                    <div className="homeFeatures">


                        <div className="homeFeature">

                            <span className="featureIcon">

                                <ShieldOutlinedIcon />

                            </span>

                            <p>
                                Secure
                            </p>

                        </div>



                        <div className="homeFeature">

                            <span className="featureIcon">

                                <HighQualityOutlinedIcon />

                            </span>

                            <p>
                                HD Quality
                            </p>

                        </div>



                        <div className="homeFeature">

                            <span className="featureIcon">

                                <GroupsOutlinedIcon />

                            </span>

                            <p>
                                Easy to Use
                            </p>

                        </div>


                    </div>

                </div>

            </div>

        </div>

    );

}


export default withAuth(HomeComponent);