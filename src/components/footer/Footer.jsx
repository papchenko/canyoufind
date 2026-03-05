import { useEffect, useState } from 'react';
import { RiLinkedinLine, RiYoutubeLine } from 'react-icons/ri';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import './footer.scss';

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer className="footer">
      <div className="fcol">
        <h3><a href="/" className='text-white' style={{textDecoration: 'none'}}>Canyoufind ©</a></h3>
        <p className='fs-5'>This product is registered. Any use is for entertainment purposes only. All rights reserved.</p>
      </div>

      <div className="fcol">
        <h3>Contact Us</h3>
        <ul className='p-0'>
          <li><a className='fs-5' href="">canyoufind@gmail.com</a></li>
          <div className="social-items">
            <li className='social-item'><a href='#' className="social-link"><RiLinkedinLine /></a></li>
            <li className='social-item'><a href='#' className="social-link"><RiYoutubeLine /></a></li>
          </div>
        </ul>
      </div>
        <div className="fcol">
          <h3>Legacy</h3>
          <ul className="list-unstyle">
            <li><a href="/terms" className="footer-link fs-5">Terms Of Use</a></li> 
          <li><a href="/privacy" className="footer-link fs-5">Privacy & Coockie</a></li>
          </ul>
        </div>
      <div className="fcol fcol-button">
        {isLoggedIn ? (
          <>
            <h3>Enjoy!</h3>
          </>
        ) : (
          <>
            <h3>Sign in to get all functions of our resource</h3>
            <button
              className="btn"
              data-bs-toggle="modal"
              data-bs-target="#loginModal"
            >
              Sign In
            </button>
          </>
        )}
      </div>

    </footer>
  );
};

export default Footer;