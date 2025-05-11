import { Outlet } from 'react-router-dom';
import { Header } from './Header/Header';
import Footer from './Footer/Footer';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const {usuario} = useAuth();

  return (
  <>
    {usuario && <Header/>}
    <Outlet />
    <Footer />
  </>
)};

export default Layout;
