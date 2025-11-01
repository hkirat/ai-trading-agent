import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Home } from "./components/Hero";
import Performance from "./pages/Performance";
import Container from "./components/Container";
import { ThemeProvider } from "./components/theme-provider";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-white dark:bg-black">
          <Container>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/performance" element={<Performance />} />
            </Routes>
          <Footer />
          </Container>
          
        </div>
      </ThemeProvider>
    </BrowserRouter>
  )
}
