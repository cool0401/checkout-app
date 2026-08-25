import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadFees } from './features/config/configSlice';
import ProductPage from './pages/ProductPage/ProductPage';
import ResultPage from './pages/ResultPage/ResultPage';

export default function App() {
  const dispatch = useAppDispatch();
  const hasResult = useAppSelector((state) => Boolean(state.checkout.result));

  useEffect(() => {
    dispatch(loadFees());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/result" element={hasResult ? <ResultPage /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
