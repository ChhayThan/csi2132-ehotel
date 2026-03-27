import { Link } from 'react-router-dom';
import interiorBg from '../assets/interior_bg.png';
import LoginCard from '../components/login_card';
import Logo from '../assets/logo_white.svg';

function UserLoginPage() {

  return (
    <div className="flex h-screen">
        <Link to="/" className="absolute top-6 left-6 z-100">
            <img src={Logo} alt="eHotel logo" className="h-6 w-auto cursor-pointer" />
        </Link>
        <div 
            className= "relative w-screen h-full flex justify-center items-center md:w-2/3 md:justify-end" 
            style = {{
                backgroundImage: `url(${interiorBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="h-fit md:translate-x-1/2">
                <LoginCard user_type="User" />
            </div>
        </div>
    </div>
  );
}

export default UserLoginPage;
