import AppRoutes from "./routers/AppRoutes";
import {
  ThemeProvider,
} from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;