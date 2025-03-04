import { useAuth } from "../hooks/useAuth";
import { Menu } from "@headlessui/react";
import {
  CalendarIcon,
  PrinterIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import WeekSelector from "./WeekSelector";

const Header = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Simple Schedule
            </h1>
          </div>

          {/* Week Selector */}
          <WeekSelector />

          {/* User Menu and Print */}
          <div className="flex items-center space-x-4">
            <PrinterIcon
              className="h-6 w-6 text-gray-600 cursor-pointer hover:text-primary-600"
              onClick={() => window.print()}
            />

            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                  <img
                    src={user?.picture}
                    alt={user?.name}
                    className="h-8 w-8 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/32";
                    }}
                  />
                  <span>{user?.name}</span>
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => logout()}
                        className={`${
                          active ? "bg-gray-100" : ""
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            ) : (
              <button
                onClick={() => login()}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
              >
                <UserCircleIcon className="h-8 w-8" />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
