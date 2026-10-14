import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import withAuth from '../utils/withAuth';
import "../App.css";

import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';


function History() {

    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([]);

    const navigate = useNavigate();


    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const history = await getHistoryOfUser();

                setMeetings(history);

            } catch (error) {

                console.log(error);

            }

        };

        fetchHistory();

    }, []);


    const formatDate = (dateString) => {

        const date = new Date(dateString);

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;

    };


    const formatTime = (dateString) => {

        const date = new Date(dateString);

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

    };


    const handleJoinAgain = (meetingCode) => {
        navigate(`/${meetingCode}`);
    };


    return (

        <div className="historyPage">


            {/* Navbar */}

            <div className="historyNavbar">

                <div
                    className="historyBrand"
                    onClick={() => navigate("/home")}
                >

                    <img
                        src="/logo.png"
                        alt="Connect logo"
                    />

                    <h2>
                        Connect Video Caller
                    </h2>

                </div>


                <div className="historyNavRight">

                    <div
                        className="historyHomeButton"
                        onClick={() => navigate("/home")}
                    >

                        <HomeRoundedIcon />

                        <span>
                            Home
                        </span>

                    </div>


                    <button
                        className="historyLogoutButton"
                        onClick={() => {

                            localStorage.removeItem("token");

                            navigate("/");

                        }}
                    >

                        Logout

                    </button>

                </div>

            </div>



            {/* Main History Area */}

            <div
                className="historyMain"
                style={{
                    backgroundImage:
                        "url('/historyPage/history_background.png')"
                }}
            >

                <div className="historyContent">


                    {/* Heading */}

                    <div className="historyHeading">

                        <div className="historyTitleIcon">

                            <HistoryRoundedIcon />

                        </div>


                        <div>

                            <h1>
                                Meeting <span>History</span>
                            </h1>

                            <p>
                                View your previous meetings and quickly
                                reconnect whenever you need.
                            </p>

                        </div>

                    </div>



                    {/* Meeting Count */}

                    <div className="historySummary">

                        <VideocamRoundedIcon />

                        <span>
                            {meetings.length}
                            {meetings.length === 1
                                ? " Meeting"
                                : " Meetings"}
                        </span>

                    </div>



                    {/* History Cards */}

                    {meetings.length > 0 ? (

                        <div className="historyCards">

                            {meetings.map((meeting, index) => (

                                <div
                                    className="meetingHistoryCard"
                                    key={index}
                                >

                                    <div className="historyCardTop">

                                        <div className="historyVideoIcon">

                                            <VideocamRoundedIcon />

                                        </div>


                                        <div className="historyCode">

                                            <span>
                                                Meeting Code
                                            </span>

                                            <h3>
                                                {meeting.meetingCode}
                                            </h3>

                                        </div>

                                    </div>



                                    <div className="historyCardDetails">


                                        <div className="historyDetail">

                                            <CalendarMonthRoundedIcon />

                                            <div>

                                                <span>
                                                    Date
                                                </span>

                                                <p>
                                                    {formatDate(meeting.date)}
                                                </p>

                                            </div>

                                        </div>



                                        <div className="historyDetail">

                                            <AccessTimeRoundedIcon />

                                            <div>

                                                <span>
                                                    Time
                                                </span>

                                                <p>
                                                    {formatTime(meeting.date)}
                                                </p>

                                            </div>

                                        </div>


                                    </div>



                                    <button
                                        className="joinAgainButton"
                                        onClick={() =>
                                            handleJoinAgain(
                                                meeting.meetingCode
                                            )
                                        }
                                    >

                                        Join Again

                                        <ArrowForwardRoundedIcon />

                                    </button>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <div className="emptyHistory">

                            <div className="emptyHistoryIcon">

                                <HistoryRoundedIcon />

                            </div>

                            <h2>
                                No meetings yet
                            </h2>

                            <p>
                                Your joined meetings will appear here.
                            </p>

                            <button
                                onClick={() => navigate("/home")}
                            >

                                Go to Home

                                <ArrowForwardRoundedIcon />

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


export default withAuth(History);