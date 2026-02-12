import React from "react";
import { useLocation } from "react-router-dom";
import { ChatWindow } from "../../../Component/ChatWindow";

export const UserChat = () => {

  const location = useLocation();

  const {
    type,
    Building_id,
  } = location.state || {};

  const building_id = Building_id;

  if (type === "LOI") {
    return (
        <ChatWindow
          category={type}
          heading="💬 Letter Of Intent"
          building_id={building_id}
        />
    );
  }

   if (type === "Lease") {
    return (
        <ChatWindow
          category={type}
          heading="💬 Lease Agreement"
          building_id={building_id}
        
        />
    );
  }
};