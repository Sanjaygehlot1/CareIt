import { Outlet } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';


function App() {

  return (
      <main>
        <Header/>
        <Outlet/>
        <BottomNavBar/>
      </main>
  );
}

export default App;