import * as React from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import '../App.css';


export default function AuthenticationPage() {

    const location = useLocation();
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [formState, setFormState] = React.useState(location.state?.formState ?? 0);

    const [open, setOpen] = React.useState(false)

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const switchForm = () => {
        setUsername("");
        setPassword("");
        setName("");
        setError("");

        setFormState(formState === 0 ? 1 : 0);
    };

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                let result = await handleLogin(username, password)
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setMessage(result);
                setOpen(true);
                setError("");
                await handleLogin(username, password);
                }
        } catch (err) {
            console.log(err);
            let message = err.response?.data?.message || "Unable to connect to server";
            setError(message);
        }
    }

    return (
        <div className="authenticationPage" style={{ backgroundImage: "url('/authenticationPage/auth_background.png')" }}>
            <div className="authBrandLinkDiv">
                <Link to="/" className="authBrandLink">
                    <img src="/logo.png" alt="Connect Video Caller logo" />
                    <h2>Connect Video Caller</h2>
                </Link>
            </div>

            <div className={`authenticationCard ${formState === 1 ? 'registerCard' : ''}`}>
                <div className="authSwitch">
                    <span>
                        {formState === 0 ? "Don't have an account?" : "Already have an account?"}
                    </span>
                    <button
                        type="button"
                        onClick={switchForm}
                    >
                        {formState === 0 ? "Register" : "Login"}
                    </button>
                </div>

                <div className="authFormContent">
                    <div className="authLockIcon">
                        <LockOutlinedIcon />
                    </div>

                    <h1>{formState === 0 ? "Login" : "Register"}</h1>
                    <p className="authSubtitle">
                        {formState === 0
                            ? "Welcome back! Please login to continue."
                            : "Create your account to get started."}
                    </p>

                    <div className="authFields">
                        {formState === 1 && (
                            <div className="authInput">
                                <BadgeOutlinedIcon />
                                <input
                                    required
                                    id="name"
                                    name="connectFullName"
                                    value={name}
                                    placeholder="Full Name"
                                    autoComplete="off"
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="authInput">
                            <PersonOutlineIcon />
                            <input
                                required
                                id="username"
                                name="connectUsername"
                                value={username}
                                placeholder="Username"
                                autoFocus={formState === 0}
                                autoComplete="off"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="authInput">
                            <LockOutlinedIcon />
                            <input
                                required
                                name="connectPassword"
                                value={password}
                                type="password"
                                placeholder="Password"
                                autoComplete="new-password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                            />
                        </div>
                    </div>

                    {error && <p className="authError">{error}</p>}

                    <button
                        type="button"
                        className="authSubmitButton"
                        onClick={handleAuth}
                    >
                        {formState === 0 ? <LoginRoundedIcon /> : <PersonAddAlt1RoundedIcon />}
                        <span>{formState === 0 ? "LOGIN" : "REGISTER"}</span>
                    </button>

                    {formState === 0 && (
                        <div className="authCardExtraText">
                            <p>Better conversations start with a simple connection.</p>
                            <span>
                                Connect &nbsp;•&nbsp; Collaborate &nbsp;•&nbsp; Create Together
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
            />
        </div>
    );
}