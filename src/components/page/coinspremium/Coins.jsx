import cyfCoins from '../../../assets/cyf-coin.png'

import Animation from "../../animation/Animation";

import './coins-premium.scss';

const About = () => {    

  return (
    <div className="coins section pt-5" id="coinspremium">  
        <div className="about__title section__title pt-2">
            <Animation fadeOnly duration={0.8} delay={0.2}>
            <span>Coins</span>
            </Animation>
            <Animation direction="up" duration={0.8} delay={0.2}>
            <h1>Our CYF Coins for which everything is possible!</h1>
            </Animation>
            <div className="rules__text-wrapper">
            <Animation direction="up" duration={0.8} delay={0.3}>    
            <p>You can get our coin by opening secret locations or going through other modes. You can also buy it in the Premium section. Each secret location gives 1 coin, read other modes in their description. With our coins you can open secret locations, as well as buy our branded goods.</p>
            </Animation>
            <div className="coins-values  d-none d-lg-block">
                <h4>The value of our coins</h4>
                <p><span>3 Coins</span> - Open Secret location.</p>
                <p><span>5 Coins</span> - 10% discount on our products</p>
                <p><span>10 Coins</span> - 20% discount on our products</p>
                <p><span>15 Coins</span> - 30% discount on our products</p>
            </div>
            </div>
        </div>
        <div className="section__pages">
            <div>
                <img src={cyfCoins} className='coin-img' alt="Image"/>
            </div>
        </div>
            <div className="coins-values  d-block d-lg-none">
                <h4>The value of our coins</h4>
                <p><span>3 Coins</span> - Open Secret location in season modes</p>
                <p><span>10 Coins</span> - 10% discount on our products</p>
                <p><span>15 Coins</span> - 20% discount on our products</p>
                <p><span>25 Coins</span> - 30% discount on our products</p>
            </div>
    </div>
 );
};

export default About;