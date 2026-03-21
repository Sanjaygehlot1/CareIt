import { Outlet } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import FeedbackButton from './components/common/FeedbackButton';
import Footer from './components/common/Footer';

function App() {

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Outlet />
      <Footer />
      <FeedbackButton />
      <BottomNavBar />
    </main>
  );
}

export default App;