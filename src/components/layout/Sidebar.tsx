import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tractor, Sprout, Settings, Microscope, ChevronDown, Users } from 'lucide-react';

const Sidebar = () => {
  const [isCompostingOpen, setIsCompostingOpen] = React.useState(false);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <img 
          src="/CompostIT logo.png" 
          alt="CompostIT" 
          className="h-12 w-auto"
        />
      </div>

      <nav className="px-4 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-green-50 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/clients"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-green-50 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Clients</span>
        </NavLink>

        <NavLink
          to="/farms"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-green-50 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <Tractor className="w-5 h-5" />
          <span>Farms</span>
        </NavLink>

        <div className="relative">
          <button 
            className={`w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${isCompostingOpen ? 'bg-gray-100' : ''}`}
            onClick={() => setIsCompostingOpen(!isCompostingOpen)}
          >
            <div className="flex items-center gap-3">
              <Sprout className="w-5 h-5" />
              <span>Composting</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isCompostingOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-200 ${isCompostingOpen ? 'max-h-24' : 'max-h-0'}`}>
            <div className="pl-8 py-1 space-y-1">
              <NavLink
                to="/composting/residues"
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm rounded-lg ${
                    isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Residues
              </NavLink>
              <NavLink
                to="/composting/piles"
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm rounded-lg ${
                    isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Piles
              </NavLink>
            </div>
          </div>
        </div>

        <NavLink
          to="/configuration"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-green-50 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>Configuration</span>
        </NavLink>

        <NavLink
          to="/microbiology"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-green-50 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <Microscope className="w-5 h-5" />
          <span>Microbiology</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;