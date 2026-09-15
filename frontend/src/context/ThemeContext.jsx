import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

function getInitialTheme() {
  const savedTheme =
    localStorage.getItem("hms-theme");

  if (
    savedTheme === "dark" ||
    savedTheme === "light"
  ) {
    return savedTheme;
  }

  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] =
    useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "hms-theme",
      theme
    );
  }, [theme]);

  function setAppTheme(newTheme) {
    if (
      newTheme !== "light" &&
      newTheme !== "dark"
    ) {
      return;
    }

    setTheme(newTheme);
  }

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setAppTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}