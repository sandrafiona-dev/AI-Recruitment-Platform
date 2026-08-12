import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ResumeParserPage from "./pages/ResumeParserPage";
import MatchingPage from "./pages/MatchingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/parse" element={<ResumeParserPage />} />
      <Route path="/match" element={<MatchingPage />} />
    </Routes>
  );
}

export default App;
