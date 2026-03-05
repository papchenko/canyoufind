import { RiSendPlaneLine } from 'react-icons/ri';
import { useState } from 'react';
import emailjs from '@emailjs/browser';

import './final-form.scss'

const FinalForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: 'I completed the entire game 🎉 I want to get a reward! My secret final code is CYF'
  });

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value })
  }
  const sendEmail = (e) => {
    e.preventDefault();

    if(!formData.name || !formData.email || !formData.message) {
      setMessageColor('color-red');
      setFeedbackMessage('Write all the input fields.');
      setTimeout(() => setFeedbackMessage(''), 3000);
      return;
    }

    emailjs
    .send('service_hllb7p1', 'template_gdn6fcv', formData, 'v13Oo-YtABqCO9JLF').then(
      () => {
        setMessageColor('color-first');
        setFeedbackMessage('Message sent ✔');

        setTimeout(() => setFeedbackMessage(''), 5000);

        setFormData({name: '', email: '', message: '' })
      },
      (error) => {
        alert('OOPs! SOMETHING WENT WRONG...', error);
      },
    );
  }

  return (
     <section className="final-container container py-5 text-center text-white w-50 explore-section">
      <h2 className="mb-4 fs-1" style={{color: "#fd5200"}}>Congratulations! You have completed all the quests!</h2>
      <p>Leave your details so we can greet you personally 👇</p>
          <form action="" className="final-form" onSubmit={sendEmail}>
          <div className="final-form-group">
            <div className="final-form-div">
              <label htmlFor="" className="final-form-label">Your Full Name <b>*</b></label>
              <input type="text" name='name' onChange={handleChange} value={formData.name} className="final-form-input" />
            </div>
            <div className="final-form-div">
              <label htmlFor="" className="final-form-label">Your Email Address <b>*</b></label>
              <input type="email" name='email' onChange={handleChange} value={formData.email} className="final-form-input" />
            </div>
          </div>
          <div className="final-form-div">
              <label htmlFor="" className="final-form-label">Your Message <b>*</b></label>
              <textarea name="message" onChange={handleChange} value={formData.message} className='final-form-input final-form-area'></textarea>
            </div>
            <div className="final-button">
              <button className="btn btn-send-mail">Send
                <span className="button-icon"> <RiSendPlaneLine /></span>
              </button>
            </div>
            {feedbackMessage && (
              <p className={`final-message ${messageColor}`}>
                {feedbackMessage}
              </p>
            )}
        </form>
        <div className="final-subscribe">
          <p className='fs-2 pt-3' style={{color: "#fd5200"}}>Wait for the new seasons!</p>
          <p className='fs-6'>Follow us on social media! We will definitely inform you about new seasons!</p>
          {/* <button className="btn">Follow</button>  */}
        </div>
    </section>
  );
};

export default FinalForm;