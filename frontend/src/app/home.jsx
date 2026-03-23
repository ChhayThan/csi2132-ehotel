import {useState} from 'react';
import heroBg from '../assets/hero_bg.jpg'

function Home() {

  return (
    <div className="home">
      <div 
        className="relative w-full h-[50vh] flex items-center rounded-b-lg" 
        style ={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 70%'
        }}
      >

      </div>
      <p>dsafsdifjsfds</p>
      <p>dsafsdifjsfds</p>
      <p>dsafsdifjsfds</p>
      <p>dsafsdifjsfds</p>
      <p className="h-120">dsafsdifjsfds</p>
      <p>dsafsdifjsfds</p>
      <p>dsafsdifjsfds</p>
      <p>dsafsdifjsfds</p>
      <p>dsafsdifjsfds</p>
    </div>

  );
}

export default Home;