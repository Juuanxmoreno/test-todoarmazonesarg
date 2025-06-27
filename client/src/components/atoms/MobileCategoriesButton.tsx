"use client";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { eventEmitter } from "@/utils/eventEmitter";

const MobileCategoriesButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev);
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    eventEmitter.on('toggle-mobile-sidebar', handleToggle);
    eventEmitter.on('close-mobile-sidebar', handleClose);

    return () => {
      eventEmitter.off('toggle-mobile-sidebar', handleToggle);
      eventEmitter.off('close-mobile-sidebar', handleClose);
    };
  }, []);

  const handleToggle = () => {
    eventEmitter.emit('toggle-mobile-sidebar');
  };

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center gap-2 p-3 bg-white sm:hidden mb-4"
    >
      {isOpen ? (
        <X size={20} className="text-[#111111]" />
      ) : (
        <Menu size={20} className="text-[#111111]" />
      )}
      <span className="font-semibold text-[#111111]">CATEGORÍAS</span>
    </button>
  );
};

export default MobileCategoriesButton;
