import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { routes, RouteConfig } from './routes';
import PageTransition from './components/PageTransition';
import { AuthProvider, useAuth } from './context/AuthContext';
import { navigateWithTransition } from './components/PageTransition';

const AppRouter: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { user, loading, isAdmin, isStoreManager } = useAuth();

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('navigationComplete', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigationComplete', handleLocationChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-charcoal animate-pulse">
            <span className="material-symbols-outlined text-2xl font-black">bolt</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Loading...</h1>
        </div>
      </div>
    );
  }

  const renderRoute = (): React.ReactNode => {
    const matchedRoute = routes.find((route: RouteConfig) => {
      if (route.exact) return route.path === currentPath;
      if (route.paramMatch) return currentPath.startsWith(route.path) && currentPath.length > route.path.length;
      return currentPath.startsWith(route.path);
    });

    if (matchedRoute) {
      // Auth guard
      if (matchedRoute.requireAuth && !user) {
        setTimeout(() => navigateWithTransition('/login'), 0);
        return null;
      }

      // Role guard
      if (matchedRoute.roles && matchedRoute.roles.length > 0 && user) {
        if (!matchedRoute.roles.includes(user.role)) {
          // Redirect to appropriate home
          const redirectPath = isAdmin ? '/admin' : isStoreManager ? '/store-manager' : '/';
          setTimeout(() => navigateWithTransition(redirectPath), 0);
          return null;
        }
      }

      const Component = matchedRoute.element;
      return <Component key={currentPath} />;
    }

    // Default fallback
    const defaultRoute = routes.find((r: RouteConfig) => r.path === '/');
    if (defaultRoute) {
      const DefaultComponent = defaultRoute.element;
      return <DefaultComponent key="home" />;
    }

    return <div className="min-h-screen flex items-center justify-center text-2xl font-black">Page not found</div>;
  };

  return (
    <PageTransition>
      <AnimatePresence mode="wait">
        {renderRoute()}
      </AnimatePresence>
    </PageTransition>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
