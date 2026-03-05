import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { auth, db } from '../../../../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import useCoinUnlock from "../hooks/useCoinUnlock";

import Maps from '../../../data/Maps.json';
import { useSeason } from "../../../../context/SeasonContext";

import { MapContainer, TileLayer, Marker, Circle, useMap, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { HiPlusSm, HiMinusSm } from "react-icons/hi";
import useProximityToast from "../hooks/useProximityToast";
import Webcam from "react-webcam";

import useUserAvatar from "../../../../avatar/useUserAvatar";
import { createUserIcon } from "../../../../avatar/userIcon";

import useUserData from "../../hooks/useUserData";

import '../quests.scss';

const AutoResizeMap = ({ mapRef, userPosition }) => {
  const map = useMap();
  useEffect(() => {
    if(mapRef.current){
      setTimeout(()=>map.invalidateSize(),250);
      if(userPosition && !mapRef.current._centeredOnce){
        mapRef.current.setView([userPosition.lat, userPosition.lng], 16);
        mapRef.current._centeredOnce = true;
      }
    }
  }, [map, mapRef, userPosition]);
  return null;
};

const QuestThree = ({ onSuccess }) => {
  const [activeIndex,setActiveIndex]=useState(0);
  const [codeInput,setCodeInput]=useState('');
  const [userPosition,setUserPosition]=useState(null);
  const [secretVisible,setSecretVisible]=useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);

  const correctCode='CYF3ZXCVB0';
  const { coins, unlockWithCoins }=useCoinUnlock();
  const mapRef=useRef(null);

  const secretPlace={lat:50.914999,lng:34.804279};
  const secretRadius= 3;
  const proximityRadius= 300;

  const tabs=[
    {title:'Live Camera & Mystical Map',mapUrl:Maps[2].map1},
    {title:'Secret location description, clues, etc.',text:{one:'Friendship Square. A secret place is located in this park.',two:'Fountain of Friendship. This fountain serves as a landmark.'}}
  ];

  useProximityToast({...secretPlace,radius:proximityRadius},"You’ve entered the secret zone. Secret Place 3 is nearby!");

  const getDistance=(lat1,lon1,lat2,lon2)=>{
    const R=6371000,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180,a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2,c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); return R*c;
  };

  useEffect(()=>{
    if(!navigator.geolocation){ toast.error('Geolocation not supported'); return; }
    const watchId=navigator.geolocation.watchPosition(
      pos=>{
        const posObj={lat:pos.coords.latitude,lng:pos.coords.longitude};
        setUserPosition(posObj);
        setSecretVisible(getDistance(posObj.lat,posObj.lng,secretPlace.lat,secretPlace.lng)<=secretRadius);
      },
      err=>{ toast.error("Error getting location"); },
      {enableHighAccuracy:true,maximumAge:5000,timeout:10000}
    );
    return ()=>navigator.geolocation.clearWatch(watchId);
  },[]);

  const handleSubmit=async e=>{
    e.preventDefault();
    const user=auth.currentUser;
    if(!user) return toast.error('You must be logged in!');
    if(codeInput.trim().toUpperCase()!==correctCode) return toast.error('Wrong code!');
    try{
      const userRef=doc(db,'users',user.uid);
      const snap=await getDoc(userRef);
      if(!snap.exists()) return toast.error('User data not found.');
      if(snap.data().questThreeCompleted) return toast.info('Quest already completed.');
      await updateDoc(userRef,{cyfCoins:increment(1),questThreeCompleted:true});
      toast.success('Secret Place 3 unlocked! +1 CYF Coin');
      onSuccess();
    }catch(err){ toast.error('Error updating quest'); }
  };

  function ZoomControls(){ 
    const map=useMap(); 
    return (
      <div style={{position:"absolute",top:10,left:10,zIndex:1000}}>
        <button className='zoom-nav' onClick={()=>map.setZoom(map.getZoom()+1)}><HiPlusSm className='zoom-nav-icon'/></button>
        <button className='zoom-nav' onClick={()=>map.setZoom(map.getZoom()-1)}><HiMinusSm className='zoom-nav-icon'/></button>
      </div>
    ); 
  }

  const { spam, r } = useSeason();
  const userData = useUserData();

  const handleQuestionClick = () => {
    setCodeInput(correctCode);
    setCodeRevealed(true);
    setSecretVisible(false);
  };

  const avatarUrl = useUserAvatar();

  return (
    <section className="explore-section section">
      <div className="quests__container container">
        <div className="section__title features__title">
           <div>
            <span className="season-subtitle text-white fw-light" >{spam}</span>{" "}<span className="text-dark season-title">{r}</span>
           </div>
          <h1>Final Quest</h1>
        </div>
        <div className="row">
          <div className="col-lg-6 d-grid align-content-center">
            <div className="explore-tabs-wrap p-4 pb-2 rounded-3">
              {tabs.map((tab,idx)=>
                <div key={idx} className={`explore-tabs mb-4 ${activeIndex===idx?'active':''}`} onClick={()=>setActiveIndex(idx)} style={{cursor:'pointer'}}>
                  <h3>{tab.title}</h3>
                </div>
              )}
            </div>
            <div className="quests-warning">Keep your phone screen on to get visual and sound effects.</div>
          </div>

          <div className="col-lg-6 explore-content text-white">
            <h2 className="pb-2 text-center">{tabs[activeIndex].title}</h2>

            {activeIndex===0 && (
              <div style={{position:'relative',width:'100%',height:'300px',marginBottom:'20px'}}>
                <Webcam audio={false} screenshotFormat="image/jpeg" videoConstraints={{facingMode:"environment"}} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'12px'}}/>

                {secretVisible && !codeRevealed && (
                  <div
                    style={{
                      position:'absolute',
                      top:'50%',
                      left:'50%',
                      transform:'translate(-50%, -50%)',
                      fontSize:'160px',
                      fontWeight:'bold',
                      color:'#fd5200',
                      textShadow:'0 0 10px white',
                      animation:'pulse 1s infinite',
                      cursor:'pointer'
                    }}
                    onClick={handleQuestionClick}
                  >
                  !
                  </div>
                )}

                {codeRevealed && (
                  <div
                    style={{
                      position:'absolute',
                      top:'50%',
                      left:'50%',
                      transform:'translate(-50%, -50%) scale(0)',
                      fontSize:'36px',
                      fontWeight:'bold',
                      color:'white',
                      backgroundColor:'rgba(0,0,0,0.5)',
                      padding:'10px 20px',
                      borderRadius:'10px',
                      animation:'scaleIn 0.5s forwards'
                    }}
                  >
                    {correctCode}
                  </div>
                )}
              </div>
            )}

            {activeIndex===0 && (
              <MapContainer center={[secretPlace.lat,secretPlace.lng]} zoom={15} style={{height:'300px',width:'100%',borderRadius:'12px',marginBottom:'20px'}} whenCreated={map=>{mapRef.current=map}} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors"/>
                <Pane name="circlePane" style={{ zIndex: 650 }} />
                <Circle center={[secretPlace.lat, secretPlace.lng]} radius={proximityRadius} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.99 }} pane="circlePane"/>
                {userPosition && (userData || auth.currentUser) && (
                  <Marker
                    position={[userPosition.lat, userPosition.lng]}
                    icon={createUserIcon(
                      userData?.username || auth.currentUser.displayName || "Player",
                      avatarUrl || auth.currentUser.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    )}
                  />
                )}
                <AutoResizeMap mapRef={mapRef} userPosition={userPosition}/>
                <ZoomControls/>
              </MapContainer>
            )}
            {tabs[activeIndex].text && (
              <div className="tab-text p-3 bg-light text-dark rounded-3">
                <p>{tabs[activeIndex].text.one}</p>
                <p>{tabs[activeIndex].text.two}</p>
              </div>
            )}

        <div className="form-question">
          <form onSubmit={handleSubmit} className="form form-quest position-relative">
            <input type="text" value={codeInput} onChange={e=>setCodeInput(e.target.value)} placeholder="Write secret code for Secret Place 3" className="form__input input__field-two"/>
            <div className='coins-item-unlock'>
              <button type="submit" className="form__button button enter-btn">Enter Code</button>
              <button className="button form__button unlock-btn" onClick={e=>{e.preventDefault(); unlockWithCoins(3, async ()=>{ try{ const user=auth.currentUser;if(!user) return; const ref=doc(db,'users',user.uid); await updateDoc(ref,{questThreeCompleted:true}); onSuccess(); toast.success('Secret Place 3 unlocked via coins!'); }catch(err){console.error(err);toast.error('Error unlocking quest via coins'); } }); }}>
                <p className='coins-counter'>Your coins: <span>{coins}</span></p>
                Unlock Quest</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

      <style>{`
        @keyframes pulse {0%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.1)}100%{transform:translate(-50%,-50%) scale(1)}}
        @keyframes scaleIn {0%{transform:translate(-50%,-50%) scale(0)}100%{transform:translate(-50%,-50%) scale(1)}}
      `}</style>
    </section>
  );
};

export default QuestThree;