"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  LuBotMessageSquare,
  LuCalendarFold,
  LuChartColumn,
  LuDollarSign,
  LuFileKey2,
  LuGitCompareArrows,
  LuInfo,
  LuList,
  LuMousePointerClick,
  LuPalette,
  LuPencil,
  LuPlus,
  LuSettings2,
  LuVideotape,
  LuX,
  LuTrash,
  LuLoader,
} from "react-icons/lu";
import User from "@/components/user/User";
import { UserType } from "@/utils/types2";
import CreateUser from "@/components/user/CreateUser";
import DeleteUser from "@/components/user/DeleteUser";
import AddLicense from "../license/AddLicense";
import EditLicense from "../license/EditLicense";
import { userApi, companyApi, licenseApi, handleApiError } from "@/utils/api";
import { useAuth } from "@/utils/auth-context";

const addons = [
  {
    id: 1,
    name: "Logo og Tema",
    description: "Egen farge og logo i appen",
    icon: LuPalette,
    available: false,
    included: false,
  },
  {
    id: 2,
    name: "Egendefinert domene",
    description: "Mer profesjonell visning av link for kunder",
    icon: LuMousePointerClick,
    available: true,
    included: false,
  },
  {
    id: 3,
    name: "Opptak av samtaler",
    description: "Ta opp samtaler (med samtykke) for opplæring og mer",
    icon: LuVideotape,
    available: false,
    included: false,
  },
  {
    id: 4,
    name: "Statistikk",
    description: "Statistikk over samtaler og anmeldelser",
    icon: LuChartColumn,
    available: true,
    included: true,
  },
  {
    id: 5,
    name: "Logg",
    description: "Historikk over samtaler, hvem, når og hvor lenge",
    icon: LuList,
    available: true,
    included: true,
  },
  {
    id: 6,
    name: "kundeinitiert kontaktkalender",
    description: "Kunden kan sette opp videosamtale-tidspunkt selv",
    icon: LuCalendarFold,
    available: false,
    included: false,
  },
  {
    id: 7,
    name: "Melding etter anrop",
    description: "Automatisk utsendelse av melding etter samtalen",
    icon: LuBotMessageSquare,
    available: true,
    included: true,
  },
  {
    id: 8,
    name: "integrasjon mot eget system (custom)",
    description: "Tilpasset pris per integrasjon basert på arbeid",
    icon: LuGitCompareArrows,
    available: true,
    included: false,
  },
];

export default function Settings() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [settingspage, setSettingspage] = useState(1);
  
  // Debug: Log current user to see if company data is available
  console.log('Settings component - currentUser:', currentUser);
  console.log('Settings component - authLoading:', authLoading);
  console.log('Settings component - currentUser.company:', currentUser?.company);
  // Static but will be dynamic of course
  const activatedAddons = [2, 4, 5];
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [deleteUserModal, setDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [addLicenseModal, setAddLicenseModal] = useState(false);
  const [editLicenseModal, setEditLicenseModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<any | null>(null);
  const [deleteLicenseModal, setDeleteLicenseModal] = useState(false);
  
  // Company users state
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Company data state
  const [companyData, setCompanyData] = useState<any>(null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  
  // License data state
  const [licenseData, setLicenseData] = useState<any[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [savingLicense, setSavingLicense] = useState(false);

  const [companyForm, setCompanyForm] = useState<any>(null);
  const [companyDirty, setCompanyDirty] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);

  const [userForm, setUserForm] = useState<any>(null);
  const [userDirty, setUserDirty] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    console.log('fetchCompanyData called, currentUser:', currentUser);
    setLoadingCompany(true);
    
    const companyId = currentUser?.company?.id || (currentUser?.company as any)?._id;
    if (!companyId) {
      console.log('No company ID found for company data fetch');
      console.log('Using currentUser company data as fallback:', currentUser?.company);
      setCompanyData(currentUser?.company || null);
      setLoadingCompany(false);
      return;
    }
    
    try {
      // Get current user's company from the companies API by ID
      console.log('Fetching company data for company ID:', companyId);
      const response = await companyApi.getCompany(companyId);
      console.log('Fetched company response:', response);
      
      if (response && !response.error) {
        setCompanyData(response);
      } else {
        // Fallback to using company data from currentUser
        console.log('Company API returned error or no data, using currentUser company data:', currentUser?.company);
        setCompanyData(currentUser?.company || null);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      // Fallback to using company data from currentUser
      console.log('API error, using currentUser company data as fallback:', currentUser?.company);
      setCompanyData(currentUser?.company || null);
    } finally {
      setLoadingCompany(false);
    }
  }, [currentUser?.company?.id, (currentUser?.company as any)?._id]);

  // Fetch company users
  const fetchCompanyUsers = useCallback(async () => {
    console.log('fetchCompanyUsers called, currentUser:', currentUser);
    setLoadingUsers(true);
    
    // Get company ID from current user
    const companyId = currentUser?.company?.id || (currentUser?.company as any)?._id;
    
    if (!companyId) {
      console.log('No company ID found for current user:', currentUser);
      console.log('Company object:', currentUser?.company);
      console.log('Cannot fetch users without company context');
      setCompanyUsers([]);
      setLoadingUsers(false);
      return;
    }
    
    console.log('Fetching users for company:', companyId);
    
    try {
      const response = await userApi.getUsers({
        company: companyId,
        isActive: true
      });
      
      console.log('Fetched users response:', response);
      
      // Filter users to only include those with a company AND exclude admin/super_admin roles
      const filteredUsers = (response.data || []).filter((user: any) => {
        const hasCompany = user.company && (user.company.id === companyId || user.company._id === companyId || user.company === companyId);
        const isNotAdmin = user.role !== 'admin' && user.role !== 'super_admin';
        
        console.log(`User ${user.email}: hasCompany=${hasCompany}, isNotAdmin=${isNotAdmin}, userCompany=`, user.company);
        
        return hasCompany && isNotAdmin;
      });
      
      console.log('Filtered users (company members only, excluding admins):', filteredUsers);
      setCompanyUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching company users:', error);
      setCompanyUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser?.company?.id, (currentUser?.company as any)?._id]);

  // Fetch licenses
  const fetchLicenses = useCallback(async () => {
    console.log('fetchLicenses called, currentUser:', currentUser);
    setLoadingLicenses(true);
    
    const companyId = currentUser?.company?.id || (currentUser?.company as any)?._id;
    if (!companyId) {
      console.log('No company ID found for licenses fetch');
      console.log('Company object:', currentUser?.company);
      setLoadingLicenses(false);
      return;
    }
    
    try {
      console.log('Fetching licenses for company:', companyId);
      const response = await licenseApi.getLicenses({
        company: companyId
      });
      console.log('Fetched licenses response:', response);
      setLicenseData(response.data || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      setLicenseData([]);
    } finally {
      setLoadingLicenses(false);
    }
  }, [currentUser?.company?.id, (currentUser?.company as any)?._id]);

  // Load data when component mounts and when switching tabs or user changes
  useEffect(() => {
    console.log('Data fetch useEffect triggered - authLoading:', authLoading, 'currentUser:', !!currentUser, 'settingspage:', settingspage);
    
    // Don't run if still loading auth or no user
    if (authLoading || !currentUser) {
      console.log('Skipping data fetch - still loading or no user');
      return;
    }

    console.log('Loading data for settings page:', settingspage);
    
    switch (settingspage) {
      case 1: // General tab
        console.log('Loading General tab data');
        fetchCompanyData();
        break;
      case 2: // Users tab
        console.log('Loading Users tab data');
        fetchCompanyUsers();
        break;
      case 3: // Extra features tab
        console.log('Loading Extra features tab data');
        // No specific API call needed for addons
        break;
      case 4: // Licenses and payment tab
        console.log('Loading Licenses tab data');
        fetchLicenses();
        fetchCompanyUsers(); // Also load users for license assignment
        break;
      default:
        break;
    }
  }, [settingspage, authLoading, fetchCompanyData, fetchCompanyUsers, fetchLicenses]);

  // Initialize form data when companyData or currentUser changes
  useEffect(() => {
    if (companyData) {
      setCompanyForm({
        name: companyData.name || '',
        customDomain: companyData.customDomain || '',
        orgNumber: companyData.orgNumber || '',
        industry: companyData.industry || '',
      });
      setCompanyDirty(false);
    }
  }, [companyData]);

  useEffect(() => {
    if (currentUser) {
      setUserForm({
        name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        language: (currentUser as any).language || 'NO',
      });
      setUserDirty(false);
    }
  }, [currentUser]);

  const handleCompanyInputChange = (field: string, value: string) => {
    setCompanyForm((prev: any) => ({ ...prev, [field]: value }));
    setCompanyDirty(true);
  };

  const handleUserInputChange = (field: string, value: string) => {
    setUserForm((prev: any) => ({ ...prev, [field]: value }));
    setUserDirty(true);
  };

  const handleSaveCompany = async () => {
    if (!companyDirty || !companyForm) return;
    const companyId = currentUser?.company?.id || (currentUser?.company as any)?._id;
    if (!companyId) return;
    setSavingCompany(true);
    try {
      const response = await companyApi.updateCompany(companyId, companyForm);
      console.log('Company updated:', response);
      await fetchCompanyData();
      setCompanyDirty(false);
    } catch (error) {
      console.error('Error updating company:', error);
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSaveUser = async () => {
    if (!userDirty || !userForm) return;
    if (!currentUser) return;
    setSavingUser(true);
    try {
      // Split name into first and last
      const [firstName, ...rest] = userForm.name.split(' ');
      const lastName = rest.join(' ');
      const updatePayload = {
        firstName,
        lastName,
        phone: userForm.phone,
        email: userForm.email,
        language: userForm.language,
      };
      const response = await userApi.updateUser((currentUser as any).id || (currentUser as any)._id, updatePayload);
      console.log('User updated:', response);
      setUserDirty(false);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSavingUser(false);
    }
  };

  const handleCreateUserModal = () => {
    setCreateUserModal(true);
  };

  const handleCreateUserSuccess = () => {
    // Refresh users list when a new user is created
    fetchCompanyUsers();
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setDeleteUserModal(true);
  };

  const handleDeleteUserSuccess = () => {
    // Refresh users list when a user is deleted
    fetchCompanyUsers();
    setDeleteUserModal(false);
    setUserToDelete(null);
  };

    const handleAddLicenseModal = () => {
    setAddLicenseModal(true);
  };

  const handleEditLicenseModal = (license?: any) => {
    setSelectedLicense(license || null);
    setEditLicenseModal(true);
  };

  const handleDeleteLicenseModal = (license: any) => {
    setSelectedLicense(license);
    setDeleteLicenseModal(true);
  };

  const handleCreateLicense = async (licenseData: any) => {
    setSavingLicense(true);
    try {
      // Don't pass companyId - it will be extracted from the auth token
      const response = await licenseApi.createLicense(licenseData);
      
      if (response && !response.error) {
        await fetchLicenses(); // Refresh the list
        setAddLicenseModal(false);
        console.log('License created successfully');
      } else {
        console.error('Failed to create license:', response.error);
      }
    } catch (error) {
      console.error('Error creating license:', error);
    } finally {
      setSavingLicense(false);
    }
  };

  const handleUpdateLicense = async (licenseId: string, licenseData: any) => {
    setSavingLicense(true);
    try {
      const response = await licenseApi.updateLicense(licenseId, licenseData);
      
      if (response && !response.error) {
        await fetchLicenses(); // Refresh the list
        setEditLicenseModal(false);
        setSelectedLicense(null);
        console.log('License updated successfully');
      } else {
        console.error('Failed to update license:', response.error);
      }
    } catch (error) {
      console.error('Error updating license:', error);
    } finally {
      setSavingLicense(false);
    }
  };

  const handleDeleteLicense = async (licenseId: string) => {
    setSavingLicense(true);
    try {
      const response = await licenseApi.deleteLicense(licenseId);
      
      if (response && !response.error) {
        await fetchLicenses(); // Refresh the list
        setDeleteLicenseModal(false);
        setSelectedLicense(null);
        console.log('License deleted successfully');
      } else {
        console.error('Failed to delete license:', response.error);
      }
    } catch (error) {
      console.error('Error deleting license:', error);
    } finally {
      setSavingLicense(false);
    }
  };

  const handleAssignLicense = async (licenseId: string, userId: string) => {
    setSavingLicense(true);
    try {
      const response = await licenseApi.assignLicense(licenseId, userId);
      
      if (response && !response.error) {
        await fetchLicenses(); // Refresh the list
        console.log('License assigned successfully');
      } else {
        console.error('Failed to assign license:', response.error);
      }
    } catch (error) {
      console.error('Error assigning license:', error);
    } finally {
      setSavingLicense(false);
    }
  };

  const handleUnassignLicense = async (licenseId: string) => {
    setSavingLicense(true);
    try {
      const response = await licenseApi.unassignLicense(licenseId);
      
      if (response && !response.error) {
        await fetchLicenses(); // Refresh the list
        console.log('License unassigned successfully');
      } else {
        console.error('Failed to unassign license:', response.error);
      }
    } catch (error) {
      console.error('Error unassigning license:', error);
    } finally {
      setSavingLicense(false);
    }
  };

  const handleSaveAll = async () => {
    if (companyDirty) {
      await handleSaveCompany();
    }
    if (userDirty) {
      await handleSaveUser();
    }
  };

  return (
    <div className="w-full">
      <section className="py-4 overflow-hidden">
        <div className="containerr px-4 mx-auto">
          <div className="bg-bg border shadow-none shadow-black/25 rounded-xl">
            <div className="w-auto flex flex-row flex-wrap items-center justify-start">
              <div
                onClick={() => {
                  console.log('General tab clicked');
                  setSettingspage(1);
                }}
                className={`px-8 py-3.5 cursor-pointer rounded-xl ${
                  settingspage === 1 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-bold uppercase whitespace-nowrap">
                  Generelt
                </p>
              </div>
              <div
                onClick={() => {
                  console.log('Users tab clicked');
                  setSettingspage(2);
                }}
                className={`px-8 py-3.5 cursor-pointer rounded-xl ${
                  settingspage === 2 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-semibold uppercase whitespace-nowrap">
                  Brukere
                </p>
              </div>
              <div
                onClick={() => {
                  console.log('Extra features tab clicked');
                  setSettingspage(3);
                }}
                className={`px-8 py-3.5 cursor-pointer rounded-xl ${
                  settingspage === 3 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-semibold uppercase whitespace-nowrap">
                  Ekstrafunksjoner
                </p>
              </div>
              <div
                onClick={() => {
                  console.log('Licenses tab clicked');
                  setSettingspage(4);
                }}
                className={`px-8 py-3.5 cursor-pointer rounded-xl ${
                  settingspage === 4 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-semibold uppercase whitespace-nowrap">
                  Lisens og Betaling
                </p>
              </div>
              <div
                //onClick={() => setSettingspage(1)}
                className={`px-8 py-3.5 cursor-not-allowed rounded-xl ${
                  settingspage === 5 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-semibold uppercase opacity-50 whitespace-nowrap">
                  Rapport
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*=========================================================================*/}
      {settingspage === 1 && (
        <div className="w-full flex flex-col pb-10">
          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">
              Firma {loadingCompany && <span className="text-sm text-gray-500">(Laster...)</span>}
            </h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Firma Logo
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="flex flex-wrap sm:max-w-md ml-auto">
                      <div className="w-full sm:flex-1 mb-2.5 sm:mb-0">
                        <input
                          className="py-2.5 px-3.5 text-sm w-full hover:bg-gray-50 outline-none placeholder-neutral-400 border border-neutral-200 sm:border-r-0 rounded-lg sm:rounded-tr-none sm:rounded-br-none focus-within:border-neutral-600"
                          id="inputsInput9-1"
                          type="text"
                          placeholder="Klikk for å velge en fil for opplastning"
                        />
                      </div>
                      <div className="w-full sm:w-auto">
                        <a
                          className="inline-flex items-center justify-center px-3.5 py-2.5 text-sm w-full h-full text-neutral-50 font-medium bg-primary hover:bg-secondary rounded-lg transition duration-300 sm:rounded-tl-none sm:rounded-bl-none"
                          href="#"
                        >
                          Last opp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Firmanavn
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto">
                      <input
                        className="py-2.5 px-3.5 text-sm w-full hover:bg-gray-50 outline-none placeholder-neutral-400 border border-neutral-200 rounded-lg focus-within:border-neutral-600"
                        id="inputsInput13-1"
                        type="text"
                        value={companyForm?.name || ''}
                        placeholder="Firmavn AS"
                        onChange={(e) => handleCompanyInputChange('name', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Firmanavn
                    </h3>
                    <p className="text-sm text-neutral-500">
                      For visning i domenet
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto overflow-hidden border border-neutral-200 rounded-lg focus-within:border-neutral-600">
                      <div className="flex flex-wrap sm:flex-nowrap sm:divide-x divide-neutral-200">
                        <div className="w-full sm:w-auto">
                          <div className="py-2 px-3.5 bg-light">
                            <span className="text-sm font-medium">
                              henvid.com/
                            </span>
                          </div>
                        </div>
                        <div className="w-full sm:flex-1">
                          <input
                            className="py-3 px-3.5 text-sm w-full h-full outline-none hover:bg-gray-50 placeholder-neutral-400"
                            id="inputsInput1-1"
                            type="text"
                            value={companyForm?.customDomain || ''}
                            placeholder="firmanavn"
                            onChange={(e) => handleCompanyInputChange('customDomain', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* ONLY SHOW BELOW IF ACTIVATED EXTRA FUNCTION FOR IT */}
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 pb-8 bg-white border rounded-xl">
                <div className="flex flex-nowrap justify-between -m-1.5">
                  <div className="w-full sm:w-1/2 p-1.5">
                    <h3 className="font-heading text-sm font-semibold">
                      Egendefinert domenenavn
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-1.5">
                    <div className="flex sm:max-w-md ml-auto items-center overflow-hidden hover:bg-gray-50 border border-neutral-200 rounded-lg focus-within:border-neutral-600">
                      <span className="pl-3.5 text-sm text-neutral-400 select-none">
                        https://
                      </span>
                      <input
                        className="py-2.5 pr-3.5 text-sm w-auto bg-transparent outline-none placeholder-neutral-400"
                        id="inputsInput18-1"
                        type="text"
                        value={companyForm?.customDomain || ''}
                        placeholder="firmanavn"
                        onChange={(e) => handleCompanyInputChange('customDomain', e.target.value)}
                      />
                      <span className="pl-3.5 text-sm text-neutral-400 select-none">
                        .henvid.com/
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* */}
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                    Organisasjonsnummer
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto">
                      <input
                        className="py-2.5 px-3.5 text-sm w-full hover:bg-gray-50 outline-none placeholder-neutral-400 border border-neutral-200 rounded-lg focus-within:border-neutral-600"
                        id="inputsInput13-1"
                        type="text"
                        value={companyForm?.orgNumber || ''}
                        maxLength={9}
                        placeholder="999888777"
                        onChange={(e) => handleCompanyInputChange('orgNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Land / Språk
                    </h3>
                    <p className="text-sm text-neutral-400"></p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      <select
                        className="appearance-none py-2 pl-3.5 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect4-1"
                      >
                        <option value="NO">Norge / Norsk</option>
                        <option value="SE">Sverige / Svenska</option>
                        <option value="DK">Danmark / Dansk</option>
                        <option value="FI">Finland / Soumi</option>
                        <option value="EN">England / English</option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Bransje
                    </h3>
                    <p className="text-sm text-neutral-400">
                      For tilpasning av plattformen
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      {/*
                  <svg
                    className="absolute top-1/2 left-3.5 transform -translate-y-1/2"
                    width={16}
                    height={22}
                    viewBox="0 0 16 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33398 17H2.58398C2.58398 17.4142 2.91977 17.75 3.33398 17.75V17ZM12.6673 17V17.75C13.0815 17.75 13.4173 17.4142 13.4173 17H12.6673ZM9.91732 7.66667C9.91732 8.72521 9.0592 9.58333 8.00065 9.58333V11.0833C9.88762 11.0833 11.4173 9.55364 11.4173 7.66667H9.91732ZM8.00065 9.58333C6.94211 9.58333 6.08398 8.72521 6.08398 7.66667H4.58398C4.58398 9.55364 6.11368 11.0833 8.00065 11.0833V9.58333ZM6.08398 7.66667C6.08398 6.60812 6.94211 5.75 8.00065 5.75V4.25C6.11368 4.25 4.58398 5.77969 4.58398 7.66667H6.08398ZM8.00065 5.75C9.0592 5.75 9.91732 6.60812 9.91732 7.66667H11.4173C11.4173 5.77969 9.88762 4.25 8.00065 4.25V5.75ZM4.08398 17C4.08398 14.8369 5.83754 13.0833 8.00065 13.0833V11.5833C5.00911 11.5833 2.58398 14.0085 2.58398 17H4.08398ZM8.00065 13.0833C10.1638 13.0833 11.9173 14.8369 11.9173 17H13.4173C13.4173 14.0085 10.9922 11.5833 8.00065 11.5833V13.0833ZM3.33398 17.75H12.6673V16.25H3.33398V17.75Z"
                      fill="#B8C1CC"
                    />
                  </svg>
                  
*/}
                      {/*Husk pl-10 ved ikon */}
                      <select
                        className="appearance-none py-2 pll-10 pl-3.5 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect6-1"
                        value={companyForm?.industry || 'none'}
                        onChange={(e) => handleCompanyInputChange('industry', e.target.value)}
                      >
                        <option value="none">Velg bransje</option>
                        <option value="telecom">Telecom</option>
                        <option value="it">IT</option>
                        <option value="finance">Finans</option>
                        <option value="retail">Handel</option>
                        <option value="healthcare">Helse</option>
                        <option value="education">Utdanning</option>
                        <option value="annet">Annet</option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">Bruker</h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">Navn</h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="flex items-center justify-end ml-auto sm:max-w-md overflow-hidden hover:bg-gray-50 border border-neutral-200 rounded-lg focus-within:border-neutral-600">
                      <div className="pl-3.5">
                        <svg
                          width={16}
                          height={22}
                          viewBox="0 0 16 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.33398 17H2.58398C2.58398 17.4142 2.91977 17.75 3.33398 17.75V17ZM12.6673 17V17.75C13.0815 17.75 13.4173 17.4142 13.4173 17H12.6673ZM9.91732 7.66667C9.91732 8.72521 9.0592 9.58333 8.00065 9.58333V11.0833C9.88762 11.0833 11.4173 9.55364 11.4173 7.66667H9.91732ZM8.00065 9.58333C6.94211 9.58333 6.08398 8.72521 6.08398 7.66667H4.58398C4.58398 9.55364 6.11368 11.0833 8.00065 11.0833V9.58333ZM6.08398 7.66667C6.08398 6.60812 6.94211 5.75 8.00065 5.75V4.25C6.11368 4.25 4.58398 5.77969 4.58398 7.66667H6.08398ZM8.00065 5.75C9.0592 5.75 9.91732 6.60812 9.91732 7.66667H11.4173C11.4173 5.77969 9.88762 4.25 8.00065 4.25V5.75ZM4.08398 17C4.08398 14.8369 5.83754 13.0833 8.00065 13.0833V11.5833C5.00911 11.5833 2.58398 14.0085 2.58398 17H4.08398ZM8.00065 13.0833C10.1638 13.0833 11.9173 14.8369 11.9173 17H13.4173C13.4173 14.0085 10.9922 11.5833 8.00065 11.5833V13.0833ZM3.33398 17.75H12.6673V16.25H3.33398V17.75Z"
                            fill="#B8C1CC"
                          />
                        </svg>
                      </div>
                      <input
                        className="py-2.5 pl-2 pr-3.5 text-sm w-full bg-transparent outline-none placeholder-neutral-400"
                        id="inputsInput7-1"
                        type="text"
                        value={userForm?.name || ''}
                        placeholder="Skriv inn fornavn og etternavn"
                        onChange={(e) => handleUserInputChange('name', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Telefonnummer
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto overflow-hidden border border-neutral-200 rounded-lg focus-within:border-neutral-600">
                      <div className="flex flex-wrap sm:flex-nowrap sm:divide-x divide-neutral-200">
                        <div className="w-full sm:w-auto">
                          <div className="relative h-full">
                            <select className="appearance-none py-2 pl-3.5 pr-10 text-sm text-neutral-500 font-medium w-full h-full bg-light outline-none cursor-pointer">
                              <option value="NO">NO (+47)</option>
                              <option value="DK">DK (+45)</option>
                              <option value="SE">SE (+46)</option>
                              <option value="FI">FI (+358)</option>
                              <option value="EN">EN (+44)</option>
                            </select>
                            <svg
                              className="absolute top-1/2 right-4 transform -translate-y-1/2"
                              width={16}
                              height={22}
                              viewBox="0 0 16 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12.6673 9L8.00065 13.6667L3.33398 9"
                                stroke="#495460"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="w-full sm:flex-1">
                          <input
                            className="py-3 px-3.5 text-sm w-full h-full hover:bg-gray-50 outline-none placeholder-neutral-400"
                            id="inputsInput14-1"
                            type="text"
                            value={userForm?.phone || ''}
                            placeholder="99778899"
                            onChange={(e) => handleUserInputChange('phone', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Epostadresse
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto">
                      <input
                        //error: border-red-500
                        className="mb-2.5 py-2.5 px-3.5 text-sm w-full hover:bg-gray-50 outline-none placeholder-neutral-400 border rounded-lg"
                        id="inputsInput8-1"
                        type="text"
                        value={userForm?.email || ''}
                        placeholder="ola.nordmann@mail.com"
                        onChange={(e) => handleUserInputChange('email', e.target.value)}
                      />
                      {/*
                   
                ERROR
                  <p className="text-sm text-red-500">
                    Wrong email format. Enter correct email address
                  </p>
                     */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Språk (for din bruker)
                    </h3>
                    <p className="text-sm text-neutral-400"></p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      <select
                        className="appearance-none py-2 pl-3.5 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect4-1"
                        value={userForm?.language || 'NO'}
                        onChange={(e) => handleUserInputChange('language', e.target.value)}
                      >
                        <option value="NO">Norsk</option>
                        <option value="SE">Svenska</option>
                        <option value="DK">Dansk</option>
                        <option value="FI">Soumi</option>
                        <option value="EN">English</option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
            </div>
          </section>

          {/* Correctly placed Save Button at the bottom */}
          <div className="container px-4 mx-auto pt-4 pb-6 flex justify-end">
            <button
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition duration-300 ${(companyDirty || userDirty) ? 'bg-primary hover:bg-secondary' : 'bg-gray-400 cursor-not-allowed'}`}
              onClick={handleSaveAll}
              disabled={!(companyDirty || userDirty) || savingCompany || savingUser}
            >
              {(savingCompany || savingUser) ? 'Lagrer…' : 'Lagre'}
            </button>
          </div>

        </div> // This is the closing div for the settingspage === 1 block
      )}
      {/*=========================================================================*/}
      {settingspage === 2 && (
        <div className="w-full flex flex-col pb-10">
          <div className="container px-4 mx-auto pt-4">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-2xl font-semibold pb-2">
                Brukere ({companyUsers.length})
              </h2>
              <p></p>
              <div className="w-auto px-4">
                <div
                  className="cursor-pointer inline-flex flex-wrap items-center px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-lg transition duration-300"
                  onClick={handleCreateUserModal}
                >
                  Legg til
                </div>
              </div>
            </div>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="pt-5 px-5 pb-6 bg-white border rounded-xl">
                <div className="mb-7">
                  <h3 className="mb-0 text-lg font-semibold">
                    Legg til, administrer og fjern brukere
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Du har brukt {companyUsers.length}/{companyUsers.length + 1} tilgjengelige lisenser.{" "}
                    <span
                      onClick={() => setSettingspage(4)}
                      className="underline text-primary cursor-pointer"
                    >
                      Se oversikt
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap -m-3">
                  {loadingUsers ? (
                    <div className="w-full p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <LuLoader className="animate-spin" size={20} />
                        <p className="text-sm text-neutral-500">Loading users...</p>
                      </div>
                    </div>
                  ) : companyUsers.length === 0 ? (
                    <div className="w-full p-3 text-center">
                      <p className="text-sm text-neutral-500">No users found. Create your first user!</p>
                    </div>
                  ) : (
                    companyUsers.map((user: any, index: number) => (
                      <div key={user.id || index} className="w-full p-3">
                        <div className="flex flex-wrap items-center justify-between -m-2">
                          <div className="w-auto p-2">
                            <div className="flex flex-wrap items-center -m-1.5">
                              <div className="w-auto p-1.5">
                                <img 
                                  className="h-12 w-12 rounded-full object-cover" 
                                  src={user.image || '/assets/elements/avatar.png'} 
                                  alt={`${user.firstName || user.name} ${user.lastName || user.lastname}`}
                                />
                              </div>
                              <div className="w-auto p-1.5">
                                <h3 className="font-heading mb-1 font-semibold">
                                  {user.firstName || user.name} {user.lastName || user.lastname}
                                </h3>
                                <p className="text-xs text-neutral-500">
                                  {user.email}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  {user.role || 'user'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="w-auto p-2">
                            <div className="flex gap-2">
                              <div
                                onClick={() => setSelectedUser(user)}
                                className="cursor-pointer inline-flex flex-wrap items-center px-2.5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-lg transition duration-300"
                                title="Settings"
                              >
                                <LuSettings2 />
                              </div>
                              <div
                                onClick={() => handleDeleteUser(user)}
                                className="cursor-pointer inline-flex flex-wrap items-center px-2.5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition duration-300"
                                title="Delete User"
                              >
                                <LuTrash />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {selectedUser && (
                  <User
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUserUpdated={fetchCompanyUsers}
                  />
                )}
                {createUserModal && (
                  <CreateUser 
                    onClose={() => setCreateUserModal(false)} 
                    onSuccess={handleCreateUserSuccess}
                  />
                )}
                {deleteUserModal && userToDelete && (
                  <DeleteUser 
                    user={userToDelete}
                    onClose={() => setDeleteUserModal(false)}
                    onSuccess={handleDeleteUserSuccess}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      )}
      {/*=========================================================================*/}
      {settingspage === 3 && (
        <div className="w-full flex flex-col pb-10">
          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">
              Aktiverte Ekstrafunksjoner
            </h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap -m-2">
                  {addons
                    .filter((addon) => activatedAddons.includes(addon.id))
                    .map((addon, index) => (
                      <div key={index} className="w-full sm:w-1/2 md:w-1/3 p-2">
                        <div
                          className={`p-4 h-full bg-white border hover:border-neutral-200 rounded-lg ${
                            addon.available ? "cursor-pointer" : "opacity-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between -m-2">
                            <div className="w-auto p-2">
                              <div className="flex flex-wrap items-center -m-1.5">
                                <div className="w-auto p-1.5 bg-bg rounded-lg text-primary shadow-sm shadow-black/25">
                                  <addon.icon size={30} />
                                </div>
                                <div className="flex-1 p-1.5">
                                  <h3 className="font-heading mb-0.5 font-semibold">
                                    {addon.name}
                                  </h3>
                                  <p className="text-xs text-neutral-500">
                                    {addon.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                              <div className="w-auto p-0">
                                <a
                                  className="inline-flex flex-wrap items-center justify-center px-1.5 py-1.5 w-full font-medium text-sm text-center text-black hover:text-black/75 rounded-lg"
                                  href="#"
                                >
                                  <LuInfo />
                                </a>
                              </div>
                              {addon.available && (
                                <div className="w-auto p-0">
                                  <a
                                    className="inline-flex flex-wrap items-center justify-center px-1.5 py-1.5 w-full font-medium text-sm text-center text-neutral-50 hover:text-neutral-100 bg-neutral-600 hover:bg-opacity-95 rounded-lg focus:ring-4 focus:ring-neutral-400"
                                    href="#"
                                  >
                                    <LuX size={16} />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>

          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">
              Flere Ekstrafunksjoner
            </h2>
            <hr />
          </div>

          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap -m-2">
                  {addons
                    .filter((addon) => !activatedAddons.includes(addon.id))
                    .map((addon, index) => (
                      <div key={index} className="w-full sm:w-1/2 md:w-1/3 p-2">
                        <div
                          className={`p-4 h-full bg-white border hover:border-neutral-200 rounded-lg ${
                            addon.available ? "cursor-pointer" : "opacity-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between -m-2">
                            <div className="w-auto p-2">
                              <div className="flex flex-wrap items-center -m-1.5">
                                <div className="w-auto p-1.5 bg-bg rounded-lg text-primary shadow-sm shadow-black/25">
                                  <addon.icon size={30} />
                                </div>
                                <div className="flex-1 p-1.5">
                                  <h3 className="font-heading mb-0.5 font-semibold">
                                    {addon.name}
                                  </h3>
                                  <p className="text-xs text-neutral-500">
                                    {addon.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                              <div className="w-auto p-0">
                                <a
                                  className="inline-flex flex-wrap items-center justify-center px-1.5 py-1.5 w-full font-medium text-sm text-center text-black hover:text-black/75 rounded-lg"
                                  href="#"
                                >
                                  <LuInfo />
                                </a>
                              </div>
                              {addon.available ? (
                                <div className="w-auto p-0">
                                  <a
                                    className="inline-flex flex-wrap items-center justify-center px-1.5 py-1.5 w-full font-medium text-sm text-center text-neutral-50 hover:text-neutral-100 bg-neutral-600 hover:bg-opacity-95 rounded-lg focus:ring-4 focus:ring-neutral-400"
                                    href="#"
                                  >
                                    <LuPlus size={16} />
                                  </a>
                                </div>
                              ) : (
                                <p className="text-xs">Kommer snart</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {/*=========================================================================*/}
      {settingspage === 4 && (
        <div className="w-full flex flex-col pb-10">
          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">
              Betalingsinformasjon
            </h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Betalingsmetode
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Vi tilbyr kun faktura per nå
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      <select
                        className="appearance-none py-2 pl-3.5 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect4-1"
                      >
                        <option value="invoice">Faktura</option>
                        <option value="card" disabled>
                          Kort
                        </option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Betalingsfrekvens
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="flex flex-wrap items-center justify-end -m-1.5">
                      <div className="w-auto p-1.5">
                        <a className="text-sm" href="#">
                          Månedlig
                        </a>
                      </div>
                      <div className="w-auto p-1.5">
                        <a
                          className="flex items-center justify-start p-0.5 w-9 h-5 bg-neutral-200 rounded-full"
                          href="#"
                        >
                          <span className="relative inline-block w-4 h-4 bg-white rounded-full" />
                        </a>
                      </div>
                      <div className="w-auto p-1.5">
                        <a className="text-sm" href="#">
                          Årlig <span className="hidden">(10% rabatt)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Valuta
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Vi tilbyr kun faktura i Norske Kroner per nå
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      <LuDollarSign className="text-[#B8C1CC] absolute top-1/2 left-3.5 transform -translate-y-1/2" />
                      <select
                        className="appearance-none py-2 pl-10 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect6-1"
                      >
                        <option value="nok">NOK</option>
                        <option value="usd" disabled>
                          USD
                        </option>
                        <option value="dkk" disabled>
                          DKK
                        </option>
                        <option value="sek" disabled>
                          SEK
                        </option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <div className="container px-4 mx-auto pt-4">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-2xl font-semibold pb-2">Lisenser</h2>
              <p></p>
              <div className="w-auto px-4">
                <div
                  className="inline-flex cursor-pointer flex-wrap items-center px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-lg transition duration-300"
                  onClick={handleAddLicenseModal}
                >
                  Legg til
                </div>
              </div>
              {addLicenseModal && (
                <AddLicense 
                  onClose={() => setAddLicenseModal(false)}
                  onSave={handleCreateLicense}
                  saving={savingLicense}
                />
              )}
            </div>
            <hr />
          </div>

          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              {loadingLicenses ? (
                <div className="text-center py-8">
                  <p className="text-neutral-500">Laster lisenser...</p>
                </div>
              ) : licenseData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-500">Ingen lisenser funnet. Klikk "Legg til" for å opprette din første lisens.</p>
                </div>
              ) : (
                licenseData.map((license) => (
                  <div
                    key={license.id || license._id}
                    className="bg-neutral-50 border border-neutral-100 rounded-xl mb-4"
                  >
                    <div className="px-5 py-1">
                      <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-max">
                          <tbody>
                            <tr>
                              <td className="py-3 pr-4">
                                <div className="flex flex-wrap items-center -m-2.5">
                                  <div className="w-auto p-2.5">
                                    <LuFileKey2 />
                                  </div>
                                  <div className="w-auto p-2.5">
                                    <span className="block mb-1 text-sm font-semibold">
                                      {license.type === 'standard' ? 'Standard Lisens' : 
                                       license.type === 'premium' ? 'Premium Lisens' : 
                                       license.type === 'enterprise' ? 'Enterprise Lisens' : 
                                       license.type || 'Lisens'}
                                    </span>
                                    {license.user ? (
                                      <span className="block text-xs text-neutral-500">
                                        Tildelt: {license.user.firstName} {license.user.lastName}
                                      </span>
                                    ) : (
                                      <span className="block text-xs text-green-600">
                                        Ledig
                                      </span>
                                    )}
                                    <span className="block text-xs text-neutral-400">
                                      Status: {license.status === 'active' ? 'Aktiv' : 
                                               license.status === 'inactive' ? 'Inaktiv' : 
                                               license.status === 'expired' ? 'Utløpt' : 
                                               license.status}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 pl-4">
                                <div className="flex items-center justify-end space-x-2">
                                  <div
                                    onClick={() => handleEditLicenseModal(license)}
                                    className="w-auto p-2"
                                  >
                                    <div className="cursor-pointer inline-flex flex-wrap items-center px-2.5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-lg transition duration-300">
                                      <LuPencil />
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {editLicenseModal && (
              <EditLicense 
                license={selectedLicense}
                users={companyUsers}
                onClose={() => {
                  setEditLicenseModal(false);
                  setSelectedLicense(null);
                }}
                onSave={handleUpdateLicense}
                onDelete={handleDeleteLicense}
                onAssign={handleAssignLicense}
                onUnassign={handleUnassignLicense}
                saving={savingLicense}
              />
            )}
          </section>

          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">Kostnad</h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="px-6 pt-5 pb-7 bg-white overflow-hidden border rounded-xl">
                <h3 className="text-lg font-semibold">Abonnementsoversikt</h3>
                <p className="mb-6 text-neutral-500">
                  Oversikt over ditt abonnement
                </p>
                <ul className="mb-7">
                  <li className="flex flex-wrap items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center mr-4">
                      <div className="mr-2 w-3.5 h-3.5 rounded-full bg-primary" />
                      <span className="font-medium">Lisenser ({licenseData.length})</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <p>
                        <span className="text-xs text-gray-500">{licenseData.length}x</span> 990,-
                      </p>
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx={10} cy={10} r={10} fill="red" />
                        <path
                          d="M5.91602 10.5833L8.24935 12.9166L14.0827 7.08325"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </li>
                  <li className="flex flex-wrap items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center mr-4">
                      <div className="mr-2 w-3.5 h-3.5 rounded-full bg-secondary" />
                      <span className="font-medium">Administrator lisens</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <p>0,-</p>
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx={10} cy={10} r={10} fill="red" />
                        <path
                          d="M5.91602 10.5833L8.24935 12.9166L14.0827 7.08325"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </li>
                  <li className="flex flex-wrap items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center mr-4">
                      <div className="mr-2 w-3.5 h-3.5 rounded-full bg-red-200" />
                      <span className="font-medium">
                        Ekstrafunksjon: Egendefinert domene
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <p>49,-</p>
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx={10} cy={10} r={10} fill="red" />
                        <path
                          d="M5.91602 10.5833L8.24935 12.9166L14.0827 7.08325"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </li>
                  <li className="flex flex-wrap items-center justify-between">
                    <div className="flex flex-wrap items-center mr-4">
                      <div className="mr-2 w-3.5 h-3.5 rounded-full bg-red-200" />
                      <span className="font-medium">
                        Ekstrafunksjon: Melding etter anrop
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <p>199,-</p>
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx={10} cy={10} r={10} fill="red" />
                        <path
                          d="M5.91602 10.5833L8.24935 12.9166L14.0827 7.08325"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <div className="container px-4 mx-auto pt-4 pb-6 flex justify-end">
            <button
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition duration-300 bg-gray-400 cursor-not-allowed`}
              disabled={true}
            >
              Lagre
            </button>
          </div>
        </div>
      )}
      {/*=========================================================================*/}
      {settingspage === 5 && (
        <>
          <p>rapport - eksport etc</p>
        </>
      )}
    </div>
  );
}
