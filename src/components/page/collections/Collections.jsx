import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { toast } from 'react-toastify';
import { FaCartPlus } from "react-icons/fa";
import { useCart } from '../../../context/CartContext';

import collImg4 from '../../../assets/sticker1.png';
import collImg5 from '../../../assets/sticker2.png';
import collImg6 from '../../../assets/sticker3.png';
import collImg7 from '../../../assets/sticker4.png';
import collImg8 from '../../../assets/sticker5.png';

import Animation from "../../animation/Animation";

import { IoResize } from "react-icons/io5";
import 'swiper/css';
import 'swiper/css/navigation';

import './collections.scss';

const products = [
  { id: 1, name: "Wild Adventure Edition", price: 90, img: collImg4 },
  { id: 2, name: "Masonic Conspiracy Edition", price: 90, img: collImg8 },
  { id: 3, name: "Retrowave Edition", price: 90, img: collImg5 },
  { id: 4, name: "Lost Space Edition", price: 90, img: collImg7 },
  { id: 5, name: "Old Summer Edition", price: 90, img: collImg6 },
];

const Collections = () => {
  const nextRef = useRef(null);
  const prevRef = useRef(null);
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
      const existing = JSON.parse(localStorage.getItem("cart"))?.find(
    (p) => p.id === product.id
  );

  if (existing) {
    toast.info("This item is already in your cart 🛒");
    return;
  }
    addToCart(product);
    toast.success(`${product.name} added to cart 🛒`);
  };

  return (
    <div className="collections section" id='shop'>
      <div className="section__title collections__title">
        <Animation fadeOnly duration={0.8} delay={0.2}>
          <span>A Shop Of Things</span>
        </Animation>
        <Animation direction="up" duration={0.8} delay={0.2}>
          <h1>Stunning collection of branded things</h1>
        </Animation>
        <Animation direction="up" duration={0.8} delay={0.3}>
          <p>Order and enjoy! Part of the funds from orders will go to the development of the project</p>
        </Animation>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        loop
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="swiper mySwiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="swiper-slide">
            <h2>"{product.name}"</h2>
            <h4>Branded Sticker by our Design</h4>
            <div className="d-flex gap-2 align-items-center">
                <IoResize />
                <p className='m-0'> 34 x 34 / 64 x 64 mm</p>
            </div>
            <p>Price: <span style={{color: "#598392"}}>90₴</span></p>
            <div className="slide-img">
              <img src={product.img} alt={product.name} />
              <button
                className="buy-btn"
                onClick={() => handleAddToCart(product)}
              >
                <FaCartPlus /> Buy
              </button>
            </div>
          </SwiperSlide>
        ))}

        <div className="swiper-button-next" ref={nextRef}>
          <i className="ri-arrow-right-line" id="swiperbtn"></i>
        </div>
        <div className="swiper-button-prev prev__btn" ref={prevRef}>
          <i className="ri-arrow-left-line" id="swiperbtn"></i>
        </div>
      </Swiper>
    </div>
  );
};

export default Collections;