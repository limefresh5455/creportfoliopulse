import React, { createContext, useContext, useState } from "react";

const EmailDraftingContext = createContext();

export const useEmailDrafting = () => useContext(EmailDraftingContext);

export const EmailDraftingProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openEmailDraftingModal = () => setIsModalOpen(true);
  const closeEmailDraftingModal = () => setIsModalOpen(false);

  return (
    <EmailDraftingContext.Provider
      value={{ isModalOpen, openEmailDraftingModal, closeEmailDraftingModal }}
    >
      {children}
    </EmailDraftingContext.Provider>
  );
};
