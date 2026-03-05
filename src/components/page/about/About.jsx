import rulesImg from '../../../assets/rules.png'

import Animation from "../../animation/Animation"

import './about.scss';

const About = () => {

  return (
    <div className="about section pt-4 d-flex gap-6" id="rules">  
        <div className="section__pages">
            <div className="rules-img d-none d-lg-block">
                <img src={rulesImg} alt="Image" id="animatopDowns" className='warning-img' />
            </div>
        </div>
        <div className="about__title section__title">
            <Animation fadeOnly duration={0.8} delay={0.2}>
            <span>Rules</span>
            </Animation>
            <Animation direction="up" duration={0.8} delay={0.2}>
            <h1>Respect and opportunities for others</h1>
            </Animation>
            <div className="rules__text-wrapper">
            <Animation direction="up" duration={0.8} delay={0.5}>
            <p>Don't reveal your secret places to your friends. This will not make you look amazing at all.</p>
            </Animation>
            <Animation direction="up" duration={0.8} delay={0.7}>
            <p>Don't submit the form by completing quests from different accounts!</p>
            </Animation>
            <Animation direction="up" duration={0.8} delay={0.9}>
            <p style={{color: "#598392"}}>Thank you for being able to find common ground!</p>
            </Animation>
            </div>
        </div>
    </div>
 );
};

export default About;