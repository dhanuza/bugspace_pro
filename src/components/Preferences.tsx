import { useState } from "react";
import Toggle from "./Toggle";

export default function Preferences() {
  const [landingPage, setLandingPage] = useState("Profile");
  const [notification, setNotification] = useState("Email");
  const [theme, setTheme] = useState("Light");

  return (
    <div className="bg-white rounded-3xl shadow-sm border p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Preferences</h2>

      <div className="space-y-6">
        {/* DROPDOWNS */}
        <div>
          <label className="block text-gray-500">Default Landing Page</label>
          <select
            value={landingPage}
            onChange={(e) => setLandingPage(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="Profile">Profile</option>
            <option value="Reports">Reports</option>
            <option value="Programs">Programs</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-500">Notification Type</label>
          <select
            value={notification}
            onChange={(e) => setNotification(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="Email">Email</option>
            <option value="InApp">In‑App</option>
            <option value="Both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-500">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="Light">Light</option>
            <option value="Dark">Dark</option>
          </select>
        </div>

        {/* TOGGLES */}
        <div className="mt-6 space-y-4">
          <Toggle
            label="Enable Dark Mode"
            defaultOn={false}
            onChange={(val) => console.log("Dark Mode:", val)}
          />
          <Toggle
            label="Email Notifications"
            defaultOn={true}
            onChange={(val) => console.log("Email Notifications:", val)}
          />
          <Toggle
            label="In-App Alerts"
            defaultOn={true}
            onChange={(val) => console.log("In-App Alerts:", val)}
          />

          {/* NEW: Internal Note Toggle */}
          <Toggle
            label="Internal Note"
            defaultOn={false}
            onChange={(val) =>
              console.log(
                "Internal Note:",
                val
                  ? "ON (hidden from researcher)"
                  : "OFF (visible to researcher)"
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
