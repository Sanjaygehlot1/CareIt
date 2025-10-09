import githubLogo from '../assets/github.svg';
import googleLogo from '../assets/google.svg';
import { BACKEND_BASE_URL } from '../utils/secrets'
import { Link } from 'react-router-dom';

function SignIn() {


  return (
    <div className="relative w-screen h-screen bg-gradient-radial from-orange-100 to-orange-50 flex items-center justify-center overflow-hidden animate-pulse-bg">
      
      <div className="relative z-10 bg-white shadow-2xl rounded-2xl p-12 w-full max-w-sm flex flex-col items-center text-center backdrop-blur-sm">
        <h1 className="text-4xl font-extrabold text-orange-700 mb-6 drop-shadow-sm">Welcome Back 👋</h1>
        <p className="text-gray-600 mb-8">Login with your preferred account</p>

        <Link
         to={'http://localhost:3000/auth/google'}
          className="btn-fill-hover w-full mb-4 flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-800 transition transform hover:text-white"
        >
          <img src={googleLogo} alt="Google" className="w-5 h-5" />
          Continue with Google
        </Link>

        <Link
         to={`${BACKEND_BASE_URL}/auth/github`}
          className="btn-fill-hover w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-800 transition transform hover:text-white"
        >
          <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
          Continue with GitHub
        </Link>

        <p className="mt-6 text-sm text-orange-400">
          By logging in you agree to our Terms & Conditions
        </p>
      </div>
    </div>
  );
}

export default SignIn;