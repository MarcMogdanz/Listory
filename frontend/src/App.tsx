import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthApiTokens } from "./components/AuthApiTokens";
import { Footer } from "./components/Footer";
import { LoginFailure } from "./components/LoginFailure";
import { LoginLoading } from "./components/LoginLoading";
import { LoginSuccess } from "./components/LoginSuccess";
import { NavBar } from "./components/NavBar";
import { RecentListens } from "./components/RecentListens";
import { ReportListens } from "./components/ReportListens";
import { ReportTopAlbums } from "./components/ReportTopAlbums";
import { ReportTopArtists } from "./components/ReportTopArtists";
import { ReportTopGenres } from "./components/ReportTopGenres";
import { ReportTopTracks } from "./components/ReportTopTracks";
import { useAuth } from "./hooks/use-auth";

export function App() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoginLoading />;
  }

  return (
    <div className="flex flex-col min-h-screen justify-between dark:bg-gray-900">
      <header>
        <NavBar />
      </header>
      <main className="mb-auto" /* mb-auto is for sticky footer */>
        <Routes>
          <Route path="/" />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/login/failure" element={<LoginFailure />} />
          <Route path="/listens" element={<RecentListens />} />
          <Route path="/reports/listens" element={<ReportListens />} />
          <Route path="/reports/top-artists" element={<ReportTopArtists />} />
          <Route path="/reports/top-albums" element={<ReportTopAlbums />} />
          <Route path="/reports/top-tracks" element={<ReportTopTracks />} />
          <Route path="/reports/top-genres" element={<ReportTopGenres />} />
          <Route path="/auth/api-tokens" element={<AuthApiTokens />} />
        </Routes>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
