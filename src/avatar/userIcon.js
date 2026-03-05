import L from "leaflet";

export const createUserIcon = (username, avatarUrl) =>
  new L.DivIcon({
    html: `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <img src="${avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}" 
             style="width:32px; height:32px; border-radius:50%; object-fit:cover;"/>
        <span style="
          font-size:12px; 
          color:white; 
          background: #fd5200; 
          padding:2px 4px; 
          border-radius:4px;
          margin-top:2px;
          white-space: nowrap;
        ">${username}</span>
      </div>
    `,
    className: "",
    iconSize: [40, 50],
    iconAnchor: [20, 50],
  });
