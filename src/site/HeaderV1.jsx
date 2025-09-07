import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Login from '../pages/login';

/* 
import { LogoWhite } from '../assets'; // SVG Logo
import { LogoDark } from '../assets'; // SVG Logo
 */

const HeaderV1 = () => {

  const resetRoomFilterData = () => {

  }

  const [header, setHeader] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', () =>
      window.scrollY > 50
        ? setHeader(true)
        : setHeader(false)
    );
  });

  const navLinks = [
    { name: 'Home', path: "/" },
    { name: 'Rooms', path: "/rooms" },
    { name: 'Restaurant', path: "/restaurant" },
    { name: 'Spa', path: "/spa" },
    { name: 'Contact', path: "/contact" },
    { name: 'Login', path: "/login" }
  ];

  return (
    <header
      className={`fixed z-50 w-full transition-all duration-300 
      ${header ? 'bg-white py-6 shadow-lg' : 'bg-transparent py-8'}`}
    >

      <div className='container mx-auto flex flex-col lg:flex-row items-center lg:justify-between gap-y-6 lg:gap-y-0'>

        {/* Logo */}
        <Link to="/" onClick={resetRoomFilterData}>
          {
            header
              ? <img className='w-[160px]' src='./assets/img/logo-dark.svg' />
              : <img className='w-[160px]' src='./assets/img/logo-white.svg' />
          }
        </Link>

        {/* Nav */}
        <nav className={`${header ? 'text-primary' : 'text-white'}
        flex gap-x-4 lg:gap-x-8 font-tertiary tracking-[3px] text-[15px] items-center uppercase`}>
          {
            navLinks.map(link =>
              <Link to= {link['path']} className='transition hover:text-accent' key={link['path']}>
                {link['name']}
              </Link>
            )            
          }
        </nav>

      </div>

    </header>
  );
};

export default HeaderV1;
