import { useState } from "react";
import { IoIosArrowUp } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";

import Animation from "../../animation/Animation";

import './features.scss';

const featuresData = [
  {
    title: "Hurry up and find it!",
    text: "Choose single or team mode, read the rules and press Start, after which you will have a certain amount of time to find the secret place."
  },
  {
    title: "Embark on a wonderful adventure!",
    text: "After you start this quest, you will have secret location #1, use the map, photo, and description with hints."
  },
  {
    title: "The secret code is in your hands!",
    text: "When you find a secret location, click on it and it will automatically fill in the input field, press Enter, and the next secret location will open."
  }
];

const Features = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="features section" id="howitwork">
      <div className="features__main">
        <div className="features__title section__title">
          <Animation fadeOnly duration={0.8} delay={0.2}>
          <span>About</span>
          </Animation>
          <Animation direction="up" duration={0.8} delay={0.2}>
          <h1>How It Works</h1>
          </Animation>
          <div>
          <Animation direction="up" duration={0.8} delay={0.3}>
          <p>This is a quest to find secret places, you will have a certain time to find a secret place, if you do not have time, the site resource will be unavailable for a certain time.</p>
          </Animation>
          <Animation direction="up" duration={0.8} delay={0.5}>
          <p>Use the hints, they will help you find a secret place. Be careful!</p>
          </Animation>
          <Animation direction="up" duration={0.8} delay={0.5}>
          <p style={{color: "#598392"}}>After finding the mystical sign, click on it to get the secret code.</p>
          </Animation>
          </div>
        </div>

        <div className="features__accordion">
          {featuresData.map((item, index) => (
            <div
              key={index}
              className={`features__item ${openIndex === index ? "open" : ""}`}
            >
              <div className="features__header" onClick={() => toggleAccordion(index)}>
                <h2>{item.title}</h2>
             {openIndex === index ? <IoIosArrowUp className="arrow-about" /> : <IoIosArrowDown className="arrow-about" />}
              </div>
              <div className="features__content">
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;