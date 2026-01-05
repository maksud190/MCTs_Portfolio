import { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../api/api';
import { toast } from 'sonner';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (token && user && user.role === 'admin') {
        setAdminUser(user);
      } else {
        setAdminUser(null);
      }
    } catch (err) {
      console.error('Admin auth check error:', err);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email, password) => {
    try {
      const res = await API.post('/users/login', { email, password });

      if (res.data.user.role !== 'admin') {
        throw new Error('Access denied. Admin only.');
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setAdminUser(res.data.user);
      
      toast.success('Admin login successful!');
      return true;
    } catch (err) {
      console.error('Admin login error:', err);
      toast.error(err.response?.data?.message || err.message || 'Login failed');
      return false;
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAdminUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AdminContext.Provider value={{ 
      adminUser, 
      loading,
      loginAdmin, 
      logoutAdmin,
      isAdmin: !!adminUser 
    }}>
      {children}
    </AdminContext.Provider>
  );
};