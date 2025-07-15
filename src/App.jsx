import logo from './logo.svg';
import './App.css';
import { AppProvider } from "./context/AppContext";
import VideoPlayer from './pages/VideoPlayer/VideoPlayer';
import Chats from './pages/Chats/Chats';

const App = () => {
  return (
    <AppProvider>
      <div className="App">
        {/* <VideoPlayer /> */}
        <Chats />
      </div>
    </AppProvider>
  );
}

export default App;
