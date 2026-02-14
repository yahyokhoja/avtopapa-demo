import React from 'react';
import { CONTACT_INFO, WORKING_HOURS, SOCIAL_LINKS } from '../config/constants';
import './ContactCard.css';

interface ContactCardProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon, title, children }) => {
  return (
    <div className="contact-card">
      <div className="contact-card-icon">{icon}</div>
      <h3>{title}</h3>
      <div className="contact-card-content">{children}</div>
    </div>
  );
};

export default ContactCard;
