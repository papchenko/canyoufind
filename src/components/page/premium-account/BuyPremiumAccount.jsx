// import { useState } from "react";
// import { MdOutlineCreditCard } from "react-icons/md";

// import "./banner.scss";

// const Banner = () => {
//   const [copied, setCopied] = useState(false);

//   const copyCard = () => {
//     navigator.clipboard.writeText("4790 7299 2893 6954");
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="banner section">
//       <div className="banner__main">
//         <div className="banner__text">
//           <h1 className="fs-1" style={{ color: "#fff" }}>Thanks and Donation</h1>
//           <div className="section__title w-100">
//             <p className="m-0 fs-5">This project is completely free. We are glad you are using it!</p>
//             <p className="m-0 fs-5">If you wish to support development, you can donate any amount.</p>
//           </div>
//         </div>
//         <button className="banner__btn d-flex align-items-center justify-content-center gap-2" onClick={copyCard}>
//           {copied ? "Copied!" : <><MdOutlineCreditCard />4790 7299 2893 6954 </>}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Banner;

import { useNavigate } from "react-router-dom";

import "./buy-premium-account.scss";

const BuyPremiumAccount = () => {

  const navigate = useNavigate();

  return (
    <div className="banner section">
      <div className="banner__main">
        <div className="banner__text">
          <h1 className="fs-1 fw-bold" style={{ color: "#fff" }}>Unlock Premium</h1>
          <div className="section__title w-100">
            <p className="m-0 fs-5">Purchase a premium account for 30 days and get full access to all game modes.</p>
            <p className="m-0 fs-5">After purchasing Premium, it will be activated in your account.</p>
          </div>
        </div>
        <button
          className="banner__btn d-flex align-items-center justify-content-center gap-2"
          onClick={() => navigate("/premium-payment")}
        >
          Buy Premium
        </button>
      </div>
    </div>
  );
};

export default BuyPremiumAccount;