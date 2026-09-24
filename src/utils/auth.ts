import type { User, Hospital } from '../types';

export const canAccessCompany = (user: User | null, siteId: string): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return user.siteId === siteId;
};



export const canAccessHospital = (user: User | null, hospital: Hospital): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'SITE_ADMIN' && user.siteId === hospital.parentSiteId) return true;
  return user.hospitalId === hospital.id;
};

export const getAccessibleHospitals = (user: User | null, allHospitals: Hospital[]): Hospital[] => {
  if (!user) return [];
  if (user.role === 'SUPER_ADMIN') return allHospitals;
  if (user.role === 'SITE_ADMIN') {
    return allHospitals.filter(h => h.parentSiteId === user.siteId);
  }
  return allHospitals.filter(h => h.id === user.hospitalId);
};
