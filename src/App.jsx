import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import AppRoutes from "./routers/AppRoutes";
import { fetchCurrentUser } from "./stores/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
