import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useMockDb } from './store/useMockDb';

function App() {
  useEffect(() => {
    useMockDb.getState().fetchData();
  }, []);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
