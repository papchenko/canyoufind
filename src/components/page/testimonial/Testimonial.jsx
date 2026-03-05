import { useRef} from 'react'
/*    Swiper    */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import testimonialImg from '../../../assets/author.svg'

import Animation from "../../animation/Animation";

import './testimonial.scss';

const Testimonial = () => {

  return (
   <>
        <div className="testimonial section">
            <div className="section__title">
                <Animation fadeOnly duration={0.8} delay={0.2}>
                <span>Our Team</span>
                </Animation>
                <Animation direction="up" duration={0.8} delay={0.2}>
                <h1>Those who work on the project</h1>
                </Animation>
            </div>
            <Swiper
            pagination={true} modules={[Pagination]}
            spaceBetween={20}
            // loop={true}
            className="testimonial-col swiper-team"
            >
                <SwiperSlide className='team-slides'>
                <h3>Looking at the positive user reviews. The product really turned out to be a success!</h3>
                <div className="user">
                    <div className="info-teams">
                        <h4>Mykola Papchenko</h4>
                        <span>Developer</span>
                    </div>
                    <div className="user-img">
                        <img src={testimonialImg} alt="" />
                    </div>
                </div>
                </SwiperSlide>
            </Swiper>
           </div>
   </>
 );
};

export default Testimonial;