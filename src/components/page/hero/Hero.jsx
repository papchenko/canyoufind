import heroImageFull from "../../../assets/logo.png";
import { useSeason } from "../../../context/SeasonContext";
import Animation from "../../animation/Animation";

import "./hero.scss";

const Hero = () => {
  const { spam, r } = useSeason();

  return (
    <div className="hero__section section">
      <div className="section__title">
        <Animation fadeOnly duration={0.8} delay={0.2}>
           <span className="season-subtitle text-white fw-light" >{spam}</span>{" "}
           <span className="text-dark season-title">{r}</span>
        </Animation>
        <div>
          <Animation direction="up" duration={0.8} delay={0.2}>
            <h1 className="hero-title">
              Discover the World of Hidden Adventures
            </h1>
          </Animation>
        </div>
        <div>
          <Animation direction="up" duration={0.8} delay={0.3}>
            <p>
              Step into a world of mystery and challenges. Test your intuition, race against time, and uncover secret locations hidden for true explorers.
            </p>
          </Animation>

          <Animation direction="up" duration={0.8} delay={0.5}>
            <p style={{color: "#fd5200"}}>The adventure begins now — are you ready?</p>
          </Animation>
        </div>
      </div>

      <div className="section__page d-none d-lg-flex">
        <div className="hero__image">
          <img src={heroImageFull} alt="Image" className="hero-img" />
        </div>
      </div>
    </div>
  );
};

export default Hero;