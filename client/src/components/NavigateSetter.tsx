import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setNavigate } from '../lib/navigateService';

const NavigateSetter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return null; // No necesita renderizar nada
};

export default NavigateSetter;
