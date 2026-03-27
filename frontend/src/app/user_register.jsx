import interiorBg from '../assets/interior_bg.png';
import RegisterCard from '../components/register_card';

function UserRegisterPage() {

  return (
    <div className="flex h-screen">
        <div 
            className= "relative w-screen h-full flex justify-center items-center md:w-2/3 md:justify-end" 
            style = {{
                backgroundImage: `url(${interiorBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="h-fit md:translate-x-1/2">
                <RegisterCard />
            </div>
        </div>
    </div>
  );
}

export default UserRegisterPage;
