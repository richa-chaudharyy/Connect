import './App.css';
import LandingPage from './pages/landing';
import AuthenticationPage from './pages/authentication';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/videoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';

function App() {
  return (
    <>
      <Router>
        <AuthProvider> 
          <Routes>

            <Route path='/' element={<LandingPage/>}/>
            <Route path='/auth' element={<AuthenticationPage/>}/>
            <Route path='/home' element={<HomeComponent/>} />
            <Route path='/history' element={<History/>} />
            <Route path='/:url' element={<VideoMeetComponent />}/>

          </Routes>
        </AuthProvider> 
      </Router>
    </>
  );
}

export default App;
