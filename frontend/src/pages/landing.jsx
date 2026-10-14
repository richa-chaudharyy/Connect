import React from 'react'
import '../App.css';
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {

    const router = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = React.useState(
        !!localStorage.getItem("token")
    );

    return (
        <div className='landingPageContainer'>
            <div className='landingPagenavbar'>
                <div className='navheader'>
                    <img src='/logo.png' alt='logo' className='navlogo'/>
                    <h2>Connect Video Caller</h2>
                </div>

                <div className='navlist'>
                    {!isLoggedIn ? (
                        <>
                            <p onClick={() => {const meetingCode = window.prompt("Enter Meeting Code");
                                if (meetingCode?.trim()) {
                                    router(`/${meetingCode.trim()}`);
                                }
                            }}>Join as Guest</p>
                            <p onClick={() => {router("/auth", {state: { formState: 1 }})}}>Register</p>

                            <div onClick={() => {router("/auth", {state: { formState: 0 }})}} role='button' className='login_btn'>
                                <p className='login_p'>Login</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <p onClick={() => router("/home")}>Home</p>
                            <p onClick={() => router("/history")}>History</p>
                            <p onClick={() => { localStorage.removeItem("token"); setIsLoggedIn(false); router("/"); }}>Logout</p>
                        </>
                    )}
                </div>
            </div>

            <div className='landingPageherosection'>
                <div className='heroleft'>
                    <span className='herobadge'>
                        Connect &nbsp; • &nbsp; Collaborate &nbsp; • &nbsp; Create Together
                    </span>

                    <h1>
                        High Quality <span>Video Calls</span> for Every Conversation
                    </h1>

                    <p className='herotext'>
                        Stay connected with friends, family and teams through smooth, reliable video calls that make every conversation simple, effortless and more meaningful wherever you are.
                    </p>

                    <div role='button' className='start' onClick={() => {router("/home", {state: { formState: 0 }})}}>
                        <p className='link'>Get Started</p>
                    </div>
                    
                    <div className='heroinfodiv'>
                        <span className='heroinfo'>
                            <img src='/landingPage/hero_badge_1.png' alt='download_logo'/>
                            <div>
                                <h6>No Dowloads</h6>
                                <p>Join directly from browser</p>
                            </div>
                        </span>

                        <span className='heroinfo'>
                            <img src='/landingPage/hero_badge_2.png' alt='secure_logo'/>
                            <div>
                                <h6>Secure Calls</h6>
                                <p>Your calls stay private</p>
                            </div>
                        </span>
                    </div>
                </div>
            </div>

            <div className='landingPagemiddlesection'>
                <div className='hero_middle_box'>
                    <div class='middle_box'>
                        <div>
                            <div className='green_badge'>
                                <img src='/landingPage/middle_badge_1.png' alt='logo'/>
                            </div>
                        </div>
                        
                        <div className='middle_badge_info'>
                            <h6>Bring People Together</h6>
                            <p>Seamless and secure video calls for friends, families and teams.</p>
                        </div>
                    </div>

                    <div class='middle_box'>
                        <div>
                            <div className='purple_badge'>
                                <img src='/landingPage/middle_badge_2.png' alt='logo'/>
                            </div>
                        </div>
                        
                        <div className='middle_badge_info'>
                            <h6>Fast & Reliable</h6>
                            <p>Connect instantly with high quality audio and video.</p>
                        </div>
                    </div>

                    <div class='middle_box'>
                        <div>
                            <div className='pink_badge'>
                                <img src='/landingPage/middle_badge_3.png' alt='logo'/>
                            </div>
                        </div>
                        
                        <div className='middle_badge_info'>
                            <h6>Your Privacy Matters</h6>
                            <p>Your conversations are safe, private and in your control.</p>
                        </div>
                    </div>
                </div>

                <div className='line_div'>
                    <span className='line'></span>
                    <p>Better Conversations. A Brighter You.</p>
                    <span className='line'></span>
                </div>
            </div>
        </div>
    )
}