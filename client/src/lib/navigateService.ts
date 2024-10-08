let navigateFuncion: () => void;

export const setNavigate = (navigate) => {
  navigateFuncion = navigate;
};

export const getNavigate = () => navigateFuncion;
