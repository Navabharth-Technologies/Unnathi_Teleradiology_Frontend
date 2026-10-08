export const canAccessCompany = (user, siteId) => {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  return user.siteId === siteId;
};

export const canAccessHospital = (user, hospital) => {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "SITE_ADMIN" && user.siteId === hospital.parentSiteId)
    return true;
  return user.hospitalId === hospital.id;
};

export const getAccessibleHospitals = (user, allHospitals) => {
  if (!user) return [];
  if (user.role === "SUPER_ADMIN") return allHospitals;
  if (user.role === "SITE_ADMIN") {
    return allHospitals.filter((h) => h.parentSiteId === user.siteId);
  }
  return allHospitals.filter((h) => h.id === user.hospitalId);
};
