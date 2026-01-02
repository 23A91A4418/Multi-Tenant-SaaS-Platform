import Navbar from './Navbar';

const Layout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return null;

  return (
    <>
      <Navbar user={user} />
      <main style={{ padding: '24px' }}>{children}</main>
    </>
  );
};

export default Layout;
