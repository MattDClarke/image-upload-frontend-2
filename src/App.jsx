import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ImgUploader from './components/ImgUploader';

function App() {
  return (
    <div className="App">
      <ImgUploader />
      <ToastContainer />
    </div>
  );
}
export default App;