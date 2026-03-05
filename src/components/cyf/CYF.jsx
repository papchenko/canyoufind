import Nav from "../nav/Nav";
import Footer from "../footer/Footer";
import Modes from "../page/modes/Modes";
import WeeklyBonus from "../page/weeklybonus/WeeklyBonus";
import GravityAnomalies from "../page/gravityanomalies/GravityAnomalies";
import MultiplayerMode from "../page/multiplayer-mode/MultiplayerMode";

const CYF = ({ onToggleNotifications }) => {
  return (
    <>
      <Nav onToggleNotifications={onToggleNotifications} />
      <div className="wrapper">
        <Modes />
      </div>
      <div className="wrapper">
        <WeeklyBonus />
        <GravityAnomalies />
      </div>
      <div className="wrapper">
        <MultiplayerMode />
      </div>
      <Footer />
    </>
  );
};

export default CYF;