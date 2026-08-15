import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ResumeParserPage from "./pages/ResumeParserPage";
import MatchingPage from "./pages/MatchingPage";
import RankingPage from "./pages/RankingPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/parse" element={<ResumeParserPage />} />
      <Route path="/match" element={<MatchingPage />} />
      <Route path="/rank" element={<RankingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
